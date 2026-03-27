package com.ecommerce.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "blocked_ips")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BlockedIP {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @Column(name = "ip_address", nullable = false, unique = true)
    private String ipAddress;
    
    @Column(nullable = false)
    private String reason;
    
    @CreationTimestamp
    @Column(name = "blocked_at", nullable = false)
    private LocalDateTime blockedAt;
    
    @Column(name = "blocked_until", nullable = false)
    private LocalDateTime blockedUntil;
    
    @Column(name = "is_permanent")
    private boolean permanent = false;
    
    public boolean isExpired() {
        return !permanent && LocalDateTime.now().isAfter(blockedUntil);
    }
}
