package com.ecommerce.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductQuestionDTO {
    private UUID id;
    private UUID productId;
    private String productName;
    private UUID userId;
    private String userName;
    private String question;
    private String answer;
    private UUID answeredById;
    private String answeredByName;
    private LocalDateTime answeredAt;
    private LocalDateTime createdAt;
}
