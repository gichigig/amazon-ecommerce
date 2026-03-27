package com.ecommerce.controller;

import com.ecommerce.dto.AuthResponse;
import com.ecommerce.dto.RefreshTokenRequest;
import com.ecommerce.dto.SignInRequest;
import com.ecommerce.dto.SignUpRequest;
import com.ecommerce.security.CurrentUser;
import com.ecommerce.security.UserPrincipal;
import com.ecommerce.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    
    private final AuthService authService;
    
    @PostMapping("/signup")
    public ResponseEntity<?> signUp(
            @Valid @RequestBody SignUpRequest request,
            HttpServletRequest httpRequest) {
        
        try {
            AuthResponse response = authService.signUp(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            throw e;
        }
    }
    
    @PostMapping("/signin")
    public ResponseEntity<?> signIn(
            @Valid @RequestBody SignInRequest request,
            HttpServletRequest httpRequest) {
        
        try {
            AuthResponse response = authService.signIn(request);
            
            return ResponseEntity.ok(Map.of(
                    "accessToken", response.getAccessToken(),
                    "refreshToken", response.getRefreshToken(),
                    "tokenType", response.getTokenType(),
                    "expiresIn", response.getExpiresIn(),
                    "user", response.getUser()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of(
                            "error", e.getMessage()
                    ));
        }
    }
    
    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refreshToken(@Valid @RequestBody RefreshTokenRequest request) {
        return ResponseEntity.ok(authService.refreshAccessToken(request.getRefreshToken()));
    }
    
    @PostMapping("/signout")
    public ResponseEntity<Map<String, String>> signOut(@Valid @RequestBody RefreshTokenRequest request) {
        authService.signOut(request.getRefreshToken());
        return ResponseEntity.ok(Map.of("message", "Successfully signed out"));
    }
    
    @GetMapping("/me")
    public ResponseEntity<AuthResponse> getCurrentUser(@CurrentUser UserPrincipal user) {
        return ResponseEntity.ok(authService.getCurrentUser(user));
    }
    
    @PostMapping("/upgrade-to-seller")
    public ResponseEntity<?> upgradeToSeller(
            @CurrentUser UserPrincipal user,
            @RequestBody Map<String, String> request) {
        try {
            String storeName = request.get("storeName");
            AuthResponse response = authService.upgradeToSeller(user, storeName);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/enable-customer")
    public ResponseEntity<?> enableCustomer(@CurrentUser UserPrincipal user) {
        try {
            AuthResponse response = authService.enableCustomer(user);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }
    
    @GetMapping("/verify-email")
    public ResponseEntity<?> verifyEmail(@RequestParam String token) {
        try {
            Map<String, Object> result = authService.verifyEmail(token);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of(
                            "success", false,
                            "error", e.getMessage()
                    ));
        }
    }
    
    @PostMapping("/resend-verification")
    public ResponseEntity<?> resendVerificationEmail(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            if (email == null || email.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Email is required"));
            }
            Map<String, Object> result = authService.resendVerificationEmail(email.trim());
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of(
                            "success", false,
                            "error", e.getMessage()
                    ));
        }
    }
    
    /**
     * Get client IP address, handling proxies
     */
    private String getClientIP(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        
        String xRealIP = request.getHeader("X-Real-IP");
        if (xRealIP != null && !xRealIP.isEmpty()) {
            return xRealIP;
        }
        
        return request.getRemoteAddr();
    }
}
