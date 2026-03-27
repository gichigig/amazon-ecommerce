package com.ecommerce.repository;

import com.ecommerce.model.EmailVerificationToken;
import com.ecommerce.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface EmailVerificationTokenRepository extends JpaRepository<EmailVerificationToken, UUID> {
    
    Optional<EmailVerificationToken> findByToken(String token);
    
    Optional<EmailVerificationToken> findByUserAndUsedFalse(User user);
    
    @Query("SELECT t FROM EmailVerificationToken t WHERE t.user = :user AND t.used = false AND t.expiresAt > :now")
    Optional<EmailVerificationToken> findValidTokenByUser(User user, LocalDateTime now);
    
    @Modifying
    @Query("DELETE FROM EmailVerificationToken t WHERE t.expiresAt < :now")
    void deleteExpiredTokens(LocalDateTime now);
    
    void deleteByUser(User user);
}
