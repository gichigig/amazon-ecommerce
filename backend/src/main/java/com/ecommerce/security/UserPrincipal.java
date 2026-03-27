package com.ecommerce.security;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserPrincipal implements UserDetails {
    
    private UUID id;
    private String email;
    private String password;
    private String fullName;
    private boolean admin;
    private boolean seller;
    private boolean customerEnabled;
    private Collection<? extends GrantedAuthority> authorities;
    
    public static UserPrincipal create(com.ecommerce.model.User user) {
        java.util.ArrayList<GrantedAuthority> authorities = new java.util.ArrayList<>();
        if (user.isCustomerEnabled()) {
            authorities.add(new SimpleGrantedAuthority("ROLE_USER"));
        }
        if (user.isSeller()) {
            authorities.add(new SimpleGrantedAuthority("ROLE_SELLER"));
        }
        if (user.isAdmin()) {
            authorities.add(new SimpleGrantedAuthority("ROLE_ADMIN"));
        }
        
        return UserPrincipal.builder()
                .id(user.getId())
                .email(user.getEmail())
                .password(user.getPassword())
                .fullName(user.getFullName())
                .admin(user.isAdmin())
                .seller(user.isSeller())
                .customerEnabled(user.isCustomerEnabled())
                .authorities(authorities)
                .build();
    }
    
    @Override
    public String getUsername() {
        return email;
    }
    
    @Override
    public boolean isAccountNonExpired() {
        return true;
    }
    
    @Override
    public boolean isAccountNonLocked() {
        return true;
    }
    
    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }
    
    @Override
    public boolean isEnabled() {
        return true;
    }
}
