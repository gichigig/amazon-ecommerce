package com.ecommerce.controller;

import com.ecommerce.dto.CartItemDTO;
import com.ecommerce.security.CurrentUser;
import com.ecommerce.security.UserPrincipal;
import com.ecommerce.service.CartService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {
    
    private final CartService cartService;
    
    @GetMapping
    public ResponseEntity<List<CartItemDTO>> getCartItems(@CurrentUser UserPrincipal user) {
        return ResponseEntity.ok(cartService.getCartItems(user.getId()));
    }
    
    @PostMapping
    public ResponseEntity<CartItemDTO> addToCart(
            @CurrentUser UserPrincipal user,
            @Valid @RequestBody CartItemDTO cartItemDTO) {
        return ResponseEntity.ok(
                cartService.addToCart(user.getId(), cartItemDTO.getProductId(), cartItemDTO.getQuantity())
        );
    }
    
    @PutMapping("/{itemId}")
    public ResponseEntity<CartItemDTO> updateCartItem(
            @CurrentUser UserPrincipal user,
            @PathVariable UUID itemId,
            @RequestBody CartItemDTO cartItemDTO) {
        CartItemDTO updated = cartService.updateCartItemQuantity(
                user.getId(), itemId, cartItemDTO.getQuantity()
        );
        if (updated == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(updated);
    }
    
    @DeleteMapping("/{itemId}")
    public ResponseEntity<Void> removeFromCart(
            @CurrentUser UserPrincipal user,
            @PathVariable UUID itemId) {
        cartService.removeFromCart(user.getId(), itemId);
        return ResponseEntity.noContent().build();
    }
    
    @DeleteMapping
    public ResponseEntity<Void> clearCart(@CurrentUser UserPrincipal user) {
        cartService.clearCart(user.getId());
        return ResponseEntity.noContent().build();
    }
}
