package com.ecommerce.controller;

import com.ecommerce.dto.MpesaPaymentRequest;
import com.ecommerce.dto.MpesaPaymentResponse;
import com.ecommerce.service.MpesaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/mpesa")
@RequiredArgsConstructor
@Slf4j
public class MpesaController {
    
    private final MpesaService mpesaService;

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health(
            @RequestParam(name = "checkToken", defaultValue = "false") boolean checkToken) {
        return ResponseEntity.ok(mpesaService.health(checkToken));
    }
    
    @PostMapping("/stk-push")
    public ResponseEntity<MpesaPaymentResponse> initiatePayment(
            @Valid @RequestBody MpesaPaymentRequest request) {
        log.info("Initiating STK Push for phone: {}", request.getPhone());
        MpesaPaymentResponse response = mpesaService.initiateSTKPush(request);
        
        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    @PostMapping("/callback")
    public ResponseEntity<Map<String, String>> handleCallback(@RequestBody Map<String, Object> callbackData) {
        log.info("Received M-Pesa callback");
        mpesaService.handleCallback(callbackData);
        return ResponseEntity.ok(Map.of("ResultCode", "0", "ResultDesc", "Success"));
    }
}
