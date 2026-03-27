package com.ecommerce.repository;

import com.ecommerce.model.LoginAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface LoginAttemptRepository extends JpaRepository<LoginAttempt, UUID> {
    
    // Count successful logins from IP in the last hour
    @Query("SELECT COUNT(la) FROM LoginAttempt la WHERE la.ipAddress = :ipAddress " +
           "AND la.successful = true AND la.attemptTime > :since")
    long countSuccessfulLoginsSince(String ipAddress, LocalDateTime since);
    
    // Count failed logins from IP in the last 24 hours
    @Query("SELECT COUNT(la) FROM LoginAttempt la WHERE la.ipAddress = :ipAddress " +
           "AND la.successful = false AND la.attemptTime > :since")
    long countFailedLoginsSince(String ipAddress, LocalDateTime since);
    
    // Get recent failed attempts for an IP
    List<LoginAttempt> findByIpAddressAndSuccessfulFalseAndAttemptTimeAfterOrderByAttemptTimeDesc(
            String ipAddress, LocalDateTime since);
    
    // Clean up old attempts
    @Modifying
    @Query("DELETE FROM LoginAttempt la WHERE la.attemptTime < :before")
    void deleteOldAttempts(LocalDateTime before);
}
