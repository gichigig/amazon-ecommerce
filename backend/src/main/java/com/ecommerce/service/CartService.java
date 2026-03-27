package com.ecommerce.service;

import com.ecommerce.dto.CartItemDTO;
import com.ecommerce.dto.ProductDTO;
import com.ecommerce.model.CartItem;
import com.ecommerce.model.Product;
import com.ecommerce.model.User;
import com.ecommerce.repository.CartItemRepository;
import com.ecommerce.repository.ProductRepository;
import com.ecommerce.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CartService {
    
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    
    public List<CartItemDTO> getCartItems(UUID userId) {
        return cartItemRepository.findByUserId(userId)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
    
    @Transactional
    public CartItemDTO addToCart(UUID userId, UUID productId, Integer quantity) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        
        // Check if item already exists in cart
        CartItem cartItem = cartItemRepository.findByUserIdAndProductId(userId, productId)
                .orElse(null);
        
        if (cartItem != null) {
            // Update quantity
            cartItem.setQuantity(cartItem.getQuantity() + (quantity != null ? quantity : 1));
        } else {
            // Create new cart item
            cartItem = CartItem.builder()
                    .user(user)
                    .product(product)
                    .quantity(quantity != null ? quantity : 1)
                    .build();
        }
        
        cartItem = cartItemRepository.save(cartItem);
        return toDTO(cartItem);
    }
    
    @Transactional
    public CartItemDTO updateCartItemQuantity(UUID userId, UUID itemId, Integer quantity) {
        CartItem cartItem = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Cart item not found"));
        
        if (!cartItem.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }
        
        if (quantity <= 0) {
            cartItemRepository.delete(cartItem);
            return null;
        }
        
        cartItem.setQuantity(quantity);
        cartItem = cartItemRepository.save(cartItem);
        return toDTO(cartItem);
    }
    
    @Transactional
    public void removeFromCart(UUID userId, UUID itemId) {
        CartItem cartItem = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Cart item not found"));
        
        if (!cartItem.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }
        
        cartItemRepository.delete(cartItem);
    }
    
    @Transactional
    public void clearCart(UUID userId) {
        cartItemRepository.deleteByUserId(userId);
    }
    
    private CartItemDTO toDTO(CartItem cartItem) {
        Product product = cartItem.getProduct();
        ProductDTO productDTO = ProductDTO.builder()
                .id(product.getId())
                .name(product.getName())
                .description(product.getDescription())
                .price(product.getPrice())
                .stock(product.getStock())
                .imageUrl(product.getImageUrl())
                .active(product.getActive())
                .build();
        
        return CartItemDTO.builder()
                .id(cartItem.getId())
                .productId(product.getId())
                .quantity(cartItem.getQuantity())
                .product(productDTO)
                .build();
    }
}
