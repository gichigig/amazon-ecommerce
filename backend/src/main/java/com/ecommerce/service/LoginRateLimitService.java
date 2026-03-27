package com.ecommerce.service;

import com.ecommerce.model.BlockedIP;
import com.ecommerce.model.LoginAttempt;
import com.ecommerce.repository.BlockedIPRepository;
import com.ecommerce.repository.LoginAttemptRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class LoginRateLimitService {
    
    private final LoginAttemptRepository loginAttemptRepository;
    private final BlockedIPRepository blockedIPRepository;
    
    // Rate limit configuration
    private static final int MAX_SUCCESSFUL_LOGINS_PER_HOUR = 5;
    private static final int MAX_FAILED_ATTEMPTS_BEFORE_BLOCK = 5;
    private static final int BLOCK_DURATION_HOURS = 24; // 1 day
    
    /**
     * Check if an IP address is allowed to attempt login
     * @return null if allowed, error message if blocked
     */
    public String checkLoginAllowed(String ipAddress) {
        // Check if IP is blocked
        if (blockedIPRepository.isIpBlocked(ipAddress, LocalDateTime.now())) {
            BlockedIP blocked = blockedIPRepository.findByIpAddress(ipAddress).orElse(null);
            if (blocked != null) {
                if (blocked.isPermanent()) {
                    return "Your IP address has been permanently blocked. Contact support.";
                }
                long hoursRemaining = java.time.Duration.between(LocalDateTime.now(), blocked.getBlockedUntil()).toHours();
                return String.format("Your IP address is blocked for %d more hours due to: %s", 
                        Math.max(1, hoursRemaining), blocked.getReason());
            }
            return "Your IP address is currently blocked.";
        }
        
        // Check rate limit for successful logins (5 per hour)
        LocalDateTime oneHourAgo = LocalDateTime.now().minusHours(1);
        long successfulLogins = loginAttemptRepository.countSuccessfulLoginsSince(ipAddress, oneHourAgo);
        
        if (successfulLogins >= MAX_SUCCESSFUL_LOGINS_PER_HOUR) {
            return "Too many login attempts. Please try again in an hour. Maximum 5 logins per hour.";
        }
        
        return null; // Allowed
    }
    
    /**
     * Record a login attempt
     */
    @Transactional
    public void recordLoginAttempt(String ipAddress, String email, boolean successful) {
        LoginAttempt attempt = LoginAttempt.builder()
                .ipAddress(ipAddress)
                .email(email)
                .successful(successful)
                .build();
        
        loginAttemptRepository.save(attempt);
        
        if (!successful) {
            checkAndBlockIfNeeded(ipAddress);
        }
        
        log.info("Login attempt recorded - IP: {}, Email: {}, Success: {}", ipAddress, email, successful);
    }
    
    /**
     * Check if IP should be blocked after failed attempt
     */
    @Transactional
    public void checkAndBlockIfNeeded(String ipAddress) {
        LocalDateTime oneDayAgo = LocalDateTime.now().minusHours(24);
        long failedAttempts = loginAttemptRepository.countFailedLoginsSince(ipAddress, oneDayAgo);
        
        if (failedAttempts >= MAX_FAILED_ATTEMPTS_BEFORE_BLOCK) {
            // Block IP for 24 hours
            blockIP(ipAddress, "Too many failed login attempts (" + failedAttempts + ")", BLOCK_DURATION_HOURS);
            log.warn("IP {} blocked due to {} failed login attempts", ipAddress, failedAttempts);
        }
    }
    
    /**
     * Block an IP address
     */
    @Transactional
    public void blockIP(String ipAddress, String reason, int durationHours) {
        // Remove existing block if any
        blockedIPRepository.deleteByIpAddress(ipAddress);
        
        BlockedIP blocked = BlockedIP.builder()
                .ipAddress(ipAddress)
                .reason(reason)
                .blockedUntil(LocalDateTime.now().plusHours(durationHours))
                .permanent(false)
                .build();
        
        blockedIPRepository.save(blocked);
    }
    
    /**
     * Permanently block an IP address
     */
    @Transactional
    public void permanentlyBlockIP(String ipAddress, String reason) {
        blockedIPRepository.deleteByIpAddress(ipAddress);
        
        BlockedIP blocked = BlockedIP.builder()
                .ipAddress(ipAddress)
                .reason(reason)
                .blockedUntil(LocalDateTime.now().plusYears(100))
                .permanent(true)
                .build();
        
        blockedIPRepository.save(blocked);
    }
    
    /**
     * Unblock an IP address
     */
    @Transactional
    public void unblockIP(String ipAddress) {
        blockedIPRepository.deleteByIpAddress(ipAddress);
        log.info("IP {} unblocked", ipAddress);
    }
    
    /**
     * Check if IP is blocked
     */
    public boolean isBlocked(String ipAddress) {
        return blockedIPRepository.isIpBlocked(ipAddress, LocalDateTime.now());
    }
    
    /**
     * Get remaining login attempts
     */
    public int getRemainingAttempts(String ipAddress) {
        LocalDateTime oneHourAgo = LocalDateTime.now().minusHours(1);
        long successful = loginAttemptRepository.countSuccessfulLoginsSince(ipAddress, oneHourAgo);
        return Math.max(0, MAX_SUCCESSFUL_LOGINS_PER_HOUR - (int) successful);
    }
    
    /**
     * Cleanup old login attempts (keep 7 days)
     */
    @Scheduled(cron = "0 0 3 * * *") // Run at 3 AM daily
    @Transactional
    public void cleanupOldAttempts() {
        LocalDateTime sevenDaysAgo = LocalDateTime.now().minusDays(7);
        loginAttemptRepository.deleteOldAttempts(sevenDaysAgo);
        blockedIPRepository.deleteExpiredBlocks(LocalDateTime.now());
        log.info("Cleaned up old login attempts and expired IP blocks");
    }
}
