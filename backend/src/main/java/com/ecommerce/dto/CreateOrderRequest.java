package com.ecommerce.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateOrderRequest {
    
    @NotEmpty(message = "Cart items are required")
    private List<CartItemRequest> items;
    
    @NotNull(message = "Total amount is required")
    private BigDecimal totalAmount;
    
    private String shippingAddress;
    
    private String paymentMethod = "mpesa";
    
    private String mpesaPhone;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CartItemRequest {
        private UUID productId;
        private Integer quantity;
        private BigDecimal price;
    }
}
