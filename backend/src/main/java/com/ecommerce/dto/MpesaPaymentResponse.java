package com.ecommerce.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MpesaPaymentResponse {
    private boolean success;
    private String message;
    private String checkoutRequestId;
    private String merchantRequestId;
    private String error;
}
