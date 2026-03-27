package com.ecommerce.service;

import com.ecommerce.model.EmailVerificationToken;
import com.ecommerce.model.User;
import com.ecommerce.repository.EmailVerificationTokenRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {
    
    private final EmailVerificationTokenRepository tokenRepository;
    private final JavaMailSender mailSender;
    
    @Value("${app.frontend-url:http://localhost:5173}")
    private String frontendUrl;
    
    @Value("${spring.mail.username:noreply@bluvberry.com}")
    private String fromEmail;
    
    @Value("${app.email-verification.expiration-hours:24}")
    private int tokenExpirationHours;
    
    @Value("${app.email-verification.enabled:true}")
    private boolean emailVerificationEnabled;
    
    public boolean isEmailVerificationEnabled() {
        return emailVerificationEnabled;
    }
    
    @Transactional
    public EmailVerificationToken createVerificationToken(User user) {
        // Invalidate any existing tokens for this user
        tokenRepository.deleteByUser(user);
        
        String token = UUID.randomUUID().toString();
        
        EmailVerificationToken verificationToken = EmailVerificationToken.builder()
                .token(token)
                .user(user)
                .expiresAt(LocalDateTime.now().plusHours(tokenExpirationHours))
                .used(false)
                .build();
        
        return tokenRepository.save(verificationToken);
    }
    
    @Async
    public void sendVerificationEmail(User user, String token) {
        try {
            String verificationUrl = frontendUrl + "/login?verify=" + token;
            
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(user.getEmail());
            message.setSubject("Verify your Bluvberry account");
            message.setText(
                "Hello " + (user.getFullName() != null ? user.getFullName() : "there") + ",\n\n" +
                "Welcome to Bluvberry! Please verify your email address by clicking the link below:\n\n" +
                verificationUrl + "\n\n" +
                "This link will expire in " + tokenExpirationHours + " hours.\n\n" +
                "If you didn't create an account with Bluvberry, please ignore this email.\n\n" +
                "Best regards,\n" +
                "The Bluvberry Team"
            );
            
            mailSender.send(message);
            log.info("Verification email sent to: {}", user.getEmail());
        } catch (Exception e) {
            log.error("Failed to send verification email to {}: {}", user.getEmail(), e.getMessage());
            // Don't throw - we don't want to fail the signup if email fails
        }
    }
    
    @Transactional
    public Optional<EmailVerificationToken> findByToken(String token) {
        return tokenRepository.findByToken(token);
    }
    
    @Transactional
    public void markTokenAsUsed(EmailVerificationToken token) {
        token.setUsed(true);
        tokenRepository.save(token);
    }
    
    @Transactional
    public Optional<EmailVerificationToken> findValidTokenByUser(User user) {
        return tokenRepository.findValidTokenByUser(user, LocalDateTime.now());
    }
    
    @Transactional
    public void cleanupExpiredTokens() {
        tokenRepository.deleteExpiredTokens(LocalDateTime.now());
        log.info("Cleaned up expired verification tokens");
    }
}
