package com.ecommerce.repository;

import com.ecommerce.model.BlockedIP;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface BlockedIPRepository extends JpaRepository<BlockedIP, UUID> {
    
    Optional<BlockedIP> findByIpAddress(String ipAddress);
    
    boolean existsByIpAddress(String ipAddress);
    
    // Check if IP is currently blocked
    @Query("SELECT CASE WHEN COUNT(b) > 0 THEN true ELSE false END FROM BlockedIP b " +
           "WHERE b.ipAddress = :ipAddress AND (b.permanent = true OR b.blockedUntil > :now)")
    boolean isIpBlocked(String ipAddress, LocalDateTime now);
    
    // Clean up expired blocks
    @Modifying
    @Query("DELETE FROM BlockedIP b WHERE b.permanent = false AND b.blockedUntil < :now")
    void deleteExpiredBlocks(LocalDateTime now);
    
    void deleteByIpAddress(String ipAddress);
}
