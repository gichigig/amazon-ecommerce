package com.ecommerce.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CartItemDTO {
    private UUID id;
    
    @NotNull(message = "Product ID is required")
    private UUID productId;
    
    @Positive(message = "Quantity must be positive")
    private Integer quantity = 1;
    
    // Populated in response
    private ProductDTO product;
}
