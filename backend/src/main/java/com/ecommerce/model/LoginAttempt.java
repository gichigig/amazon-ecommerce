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
@Table(name = "login_attempts")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginAttempt {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @Column(name = "ip_address", nullable = false)
    private String ipAddress;
    
    @Column(nullable = false)
    private String email;
    
    @Column(nullable = false)
    private boolean successful;
    
    @CreationTimestamp
    @Column(name = "attempt_time", nullable = false)
    private LocalDateTime attemptTime;
}
