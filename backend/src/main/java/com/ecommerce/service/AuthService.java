package com.ecommerce.service;

import com.ecommerce.dto.AuthResponse;
import com.ecommerce.dto.SignInRequest;
import com.ecommerce.dto.SignUpRequest;
import com.ecommerce.model.EmailVerificationToken;
import com.ecommerce.model.RefreshToken;
import com.ecommerce.model.User;
import com.ecommerce.repository.UserRepository;
import com.ecommerce.security.JwtTokenProvider;
import com.ecommerce.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder; // BCrypt password encoder
    private final JwtTokenProvider tokenProvider;
    private final AuthenticationManager authenticationManager;
    private final RefreshTokenService refreshTokenService;
    private final EmailService emailService;
    
    @Transactional
    public AuthResponse signUp(SignUpRequest request) {
        // Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered");
        }
        
        boolean requiresVerification = emailService.isEmailVerificationEnabled();
        
        // Create new user with BCrypt hashed password
        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword())) // BCrypt hash
                .fullName(request.getFullName())
                .admin(false)
                .seller(request.isSeller())
            // Seller-only accounts must explicitly enable customer mode later.
            .customerEnabled(!request.isSeller())
                .storeName(request.getStoreName())
                .emailVerified(!requiresVerification) // Set to true if verification is disabled
                .build();
        
        user = userRepository.save(user);
        log.info("New user registered: {}", user.getEmail());
        
        // If email verification is required, send verification email and return special response
        if (requiresVerification) {
            EmailVerificationToken token = emailService.createVerificationToken(user);
            emailService.sendVerificationEmail(user, token.getToken());
            
            return AuthResponse.builder()
                    .requiresVerification(true)
                    .message("Please check your email to verify your account")
                    .user(AuthResponse.UserDTO.builder()
                            .id(user.getId())
                            .email(user.getEmail())
                            .fullName(user.getFullName())
                            .build())
                    .build();
        }
        
        // Create refresh token
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(user);
        
        // Generate access token
        UserPrincipal userPrincipal = UserPrincipal.create(user);
        String accessToken = tokenProvider.generateAccessToken(userPrincipal);
        
        return createAuthResponse(user, accessToken, refreshToken.getToken());
    }
    
    @Transactional
    public AuthResponse signIn(SignInRequest request) {
        // Authenticate user (BCrypt password verification happens here)
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );
        
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        
        // Get user from database
        User user = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Check if email is verified (if verification is enabled)
        if (emailService.isEmailVerificationEnabled() && !user.isEmailVerified()) {
            return AuthResponse.builder()
                    .requiresVerification(true)
                    .message("Please verify your email before signing in")
                    .user(AuthResponse.UserDTO.builder()
                            .id(user.getId())
                            .email(user.getEmail())
                            .fullName(user.getFullName())
                            .build())
                    .build();
        }
        
        // Update last sign in time
        user.setLastSignInAt(LocalDateTime.now());
        userRepository.save(user);
        
        log.info("User signed in: {}", user.getEmail());
        
        // Create refresh token
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(user);
        
        // Generate access token
        String accessToken = tokenProvider.generateAccessToken(userPrincipal);
        
        return createAuthResponse(user, accessToken, refreshToken.getToken());
    }
    
    @Transactional
    public Map<String, Object> verifyEmail(String token) {
        EmailVerificationToken verificationToken = emailService.findByToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid verification token"));
        
        if (verificationToken.isUsed()) {
            throw new RuntimeException("This verification link has already been used");
        }
        
        if (verificationToken.isExpired()) {
            throw new RuntimeException("This verification link has expired. Please request a new one.");
        }
        
        User user = verificationToken.getUser();
        user.setEmailVerified(true);
        userRepository.save(user);
        
        emailService.markTokenAsUsed(verificationToken);
        
        log.info("Email verified for user: {}", user.getEmail());
        
        return Map.of(
                "success", true,
                "message", "Email verified successfully. You can now sign in.",
                "email", user.getEmail()
        );
    }
    
    @Transactional
    public Map<String, Object> resendVerificationEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("No account found with this email"));
        
        if (user.isEmailVerified()) {
            throw new RuntimeException("This email is already verified");
        }
        
        // Check if there's a valid token already (rate limiting)
        if (emailService.findValidTokenByUser(user).isPresent()) {
            // Allow resend but log it
            log.info("Resending verification email to: {}", email);
        }
        
        EmailVerificationToken token = emailService.createVerificationToken(user);
        emailService.sendVerificationEmail(user, token.getToken());
        
        return Map.of(
                "success", true,
                "message", "Verification email sent. Please check your inbox."
        );
    }
    
    @Transactional
    public AuthResponse refreshAccessToken(String refreshTokenStr) {
        RefreshToken refreshToken = refreshTokenService.findByToken(refreshTokenStr)
                .orElseThrow(() -> new RuntimeException("Invalid refresh token"));
        
        // Verify the refresh token is valid
        refreshTokenService.verifyExpiration(refreshToken);
        
        User user = refreshToken.getUser();
        
        // Generate new access token
        UserPrincipal userPrincipal = UserPrincipal.create(user);
        String accessToken = tokenProvider.generateAccessToken(userPrincipal);
        
        log.info("Access token refreshed for user: {}", user.getEmail());
        
        return createAuthResponse(user, accessToken, refreshTokenStr);
    }
    
    @Transactional
    public void signOut(String refreshToken) {
        refreshTokenService.revokeToken(refreshToken);
        log.info("User signed out, refresh token revoked");
    }
    
    public AuthResponse getCurrentUser(UserPrincipal userPrincipal) {
        User user = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Rebuild principal from DB state so tokens/roles reflect latest user flags (e.g. seller upgrades).
        UserPrincipal refreshedPrincipal = UserPrincipal.create(user);
        String accessToken = tokenProvider.generateAccessToken(refreshedPrincipal);

        return createAuthResponse(user, accessToken, null);
    }
    
    private AuthResponse createAuthResponse(User user, String accessToken, String refreshToken) {
        List<String> roles = new java.util.ArrayList<>();
        if (user.isCustomerEnabled()) {
            roles.add("ROLE_USER");
        }
        if (user.isSeller()) {
            roles.add("ROLE_SELLER");
        }
        if (user.isAdmin()) {
            roles.add("ROLE_ADMIN");
        }
        
        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(tokenProvider.getAccessTokenExpiration() / 1000) // in seconds
                .requiresVerification(false)
                .user(AuthResponse.UserDTO.builder()
                        .id(user.getId())
                        .email(user.getEmail())
                        .fullName(user.getFullName())
                        .admin(user.isAdmin())
                        .seller(user.isSeller())
                        .customerEnabled(user.isCustomerEnabled())
                        .storeName(user.getStoreName())
                        .roles(roles)
                        .emailVerified(user.isEmailVerified())
                        .build())
                .build();
    }

    @Transactional
    public AuthResponse enableCustomer(UserPrincipal userPrincipal) {
        User user = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!user.isCustomerEnabled()) {
            user.setCustomerEnabled(true);
            user = userRepository.save(user);
            log.info("Customer mode enabled for user: {}", user.getEmail());
        }

        // Issue fresh tokens reflecting ROLE_USER.
        UserPrincipal refreshedPrincipal = UserPrincipal.create(user);
        String accessToken = tokenProvider.generateAccessToken(refreshedPrincipal);
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(user);

        return createAuthResponse(user, accessToken, refreshToken.getToken());
    }
    
    @Transactional
    public AuthResponse upgradeToSeller(UserPrincipal userPrincipal, String storeName) {
        User user = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (user.isSeller()) {
            throw new RuntimeException("User is already a seller");
        }
        
        if (storeName == null || storeName.trim().isEmpty()) {
            throw new RuntimeException("Store name is required");
        }
        
        user.setSeller(true);
        user.setStoreName(storeName.trim());
        user = userRepository.save(user);
        
        log.info("User upgraded to seller: {}", user.getEmail());
        
        // Generate new access token with seller role
        UserPrincipal newUserPrincipal = UserPrincipal.create(user);
        String accessToken = tokenProvider.generateAccessToken(newUserPrincipal);
        
        // Create new refresh token
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(user);
        
        return createAuthResponse(user, accessToken, refreshToken.getToken());
    }
}
