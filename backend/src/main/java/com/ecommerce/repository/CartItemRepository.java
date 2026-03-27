package com.ecommerce.repository;

import com.ecommerce.model.CartItem;
import com.ecommerce.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, UUID> {
    List<CartItem> findByUser(User user);
    List<CartItem> findByUserId(UUID userId);
    Optional<CartItem> findByUserIdAndProductId(UUID userId, UUID productId);
    void deleteByUserId(UUID userId);
    void deleteByUserIdAndProductId(UUID userId, UUID productId);
}
