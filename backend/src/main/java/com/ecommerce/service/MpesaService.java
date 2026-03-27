package com.ecommerce.service;

import com.ecommerce.dto.MpesaPaymentRequest;
import com.ecommerce.dto.MpesaPaymentResponse;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class MpesaService {
    
    @Value("${mpesa.consumer-key}")
    private String consumerKey;
    
    @Value("${mpesa.consumer-secret}")
    private String consumerSecret;
    
    @Value("${mpesa.passkey}")
    private String passkey;
    
    @Value("${mpesa.shortcode}")
    private String shortcode;
    
    @Value("${mpesa.environment}")
    private String environment;
    
    @Value("${mpesa.callback-url}")
    private String callbackUrl;
    
    private final OrderService orderService;
    private final ObjectMapper objectMapper;

    public Map<String, Object> health(boolean checkToken) {
        Map<String, Object> result = new HashMap<>();

        boolean hasConsumerKey = isSet(consumerKey) && !isPlaceholder(consumerKey);
        boolean hasConsumerSecret = isSet(consumerSecret) && !isPlaceholder(consumerSecret);
        boolean hasPasskey = isSet(passkey) && !isPlaceholder(passkey);
        boolean hasShortcode = isSet(shortcode) && !isPlaceholder(shortcode);
        boolean hasCallbackUrl = isSet(callbackUrl) && callbackUrl.startsWith("https://");

        result.put("environment", environment);
        result.put("baseUrl", getBaseUrl());
        result.put("callbackUrl", callbackUrl);
        result.put("hasConsumerKey", hasConsumerKey);
        result.put("hasConsumerSecret", hasConsumerSecret);
        result.put("hasPasskey", hasPasskey);
        result.put("hasShortcode", hasShortcode);
        result.put("hasCallbackUrl", hasCallbackUrl);
        result.put("callbackLooksCorrect", callbackUrl != null && callbackUrl.contains("/api/mpesa/callback"));

        boolean configOk = hasConsumerKey && hasConsumerSecret && hasPasskey && hasShortcode && hasCallbackUrl;
        result.put("configOk", configOk);

        if (checkToken) {
            boolean canGetToken = false;
            if (configOk) {
                try {
                    canGetToken = getAccessToken() != null;
                } catch (Exception ignored) {
                    canGetToken = false;
                }
            }
            result.put("canGetAccessToken", canGetToken);
        }

        return result;
    }

    private boolean isSet(String value) {
        return value != null && !value.trim().isEmpty();
    }

    private boolean isPlaceholder(String value) {
        if (value == null) return true;
        String v = value.trim();
        return v.startsWith("YOUR_") || v.contains("change-this") || v.equalsIgnoreCase("placeholder");
    }
    
    private String getBaseUrl() {
        return "production".equals(environment) 
                ? "https://api.safaricom.co.ke"
                : "https://sandbox.safaricom.co.ke";
    }
    
    private WebClient getWebClient() {
        return WebClient.builder()
                .baseUrl(getBaseUrl())
                .build();
    }
    
    public MpesaPaymentResponse initiateSTKPush(MpesaPaymentRequest request) {
        try {
            // Step 1: Get OAuth token
            String accessToken = getAccessToken();
            if (accessToken == null) {
                return MpesaPaymentResponse.builder()
                        .success(false)
                        .error("Failed to get M-Pesa access token")
                        .build();
            }
            
            // Step 2: Generate timestamp
            String timestamp = LocalDateTime.now()
                    .format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
            
            // Step 3: Generate password
            String password = Base64.getEncoder().encodeToString(
                    (shortcode + passkey + timestamp).getBytes(StandardCharsets.UTF_8)
            );
            
            // Step 4: Prepare STK Push payload
            Map<String, Object> stkPushPayload = new HashMap<>();
            stkPushPayload.put("BusinessShortCode", shortcode);
            stkPushPayload.put("Password", password);
            stkPushPayload.put("Timestamp", timestamp);
            stkPushPayload.put("TransactionType", "CustomerPayBillOnline");
            stkPushPayload.put("Amount", request.getAmount().intValue());
            stkPushPayload.put("PartyA", request.getPhone());
            stkPushPayload.put("PartyB", shortcode);
            stkPushPayload.put("PhoneNumber", request.getPhone());
            stkPushPayload.put("CallBackURL", callbackUrl);
            stkPushPayload.put("AccountReference", 
                    request.getAccountReference() != null ? request.getAccountReference() : "E-Commerce Store");
            stkPushPayload.put("TransactionDesc", "Payment for order " + request.getOrderId());
            
            log.info("Initiating STK Push for order: {}", request.getOrderId());
            
            // Step 5: Send STK Push request
            String response = getWebClient()
                    .post()
                    .uri("/mpesa/stkpush/v1/processrequest")
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken)
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(stkPushPayload)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();
            
            JsonNode jsonResponse = objectMapper.readTree(response);
            
            String responseCode = jsonResponse.has("ResponseCode") 
                    ? jsonResponse.get("ResponseCode").asText() : null;
            
            if ("0".equals(responseCode)) {
                String checkoutRequestId = jsonResponse.get("CheckoutRequestID").asText();
                String merchantRequestId = jsonResponse.get("MerchantRequestID").asText();
                
                // Update order with checkout request ID
                orderService.updatePaymentInfo(request.getOrderId(), checkoutRequestId);
                
                log.info("STK Push successful. CheckoutRequestID: {}", checkoutRequestId);
                
                return MpesaPaymentResponse.builder()
                        .success(true)
                        .message("STK Push sent successfully")
                        .checkoutRequestId(checkoutRequestId)
                        .merchantRequestId(merchantRequestId)
                        .build();
            } else {
                String errorMessage = jsonResponse.has("errorMessage") 
                        ? jsonResponse.get("errorMessage").asText() 
                        : "Failed to initiate payment";
                
                log.error("STK Push failed: {}", errorMessage);
                
                return MpesaPaymentResponse.builder()
                        .success(false)
                        .error(errorMessage)
                        .build();
            }
            
        } catch (Exception e) {
            log.error("Error initiating STK Push: ", e);
            return MpesaPaymentResponse.builder()
                    .success(false)
                    .error("Error initiating payment: " + e.getMessage())
                    .build();
        }
    }
    
    public void handleCallback(Map<String, Object> callbackData) {
        try {
            log.info("Received M-Pesa callback: {}", objectMapper.writeValueAsString(callbackData));
            
            Map<String, Object> body = (Map<String, Object>) callbackData.get("Body");
            Map<String, Object> stkCallback = (Map<String, Object>) body.get("stkCallback");
            
            String checkoutRequestId = (String) stkCallback.get("CheckoutRequestID");
            Integer resultCode = (Integer) stkCallback.get("ResultCode");
            String resultDesc = (String) stkCallback.get("ResultDesc");
            
            if (resultCode == 0) {
                // Payment successful
                Map<String, Object> callbackMetadata = (Map<String, Object>) stkCallback.get("CallbackMetadata");
                java.util.List<Map<String, Object>> items = 
                        (java.util.List<Map<String, Object>>) callbackMetadata.get("Item");
                
                String receiptNumber = null;
                for (Map<String, Object> item : items) {
                    if ("MpesaReceiptNumber".equals(item.get("Name"))) {
                        receiptNumber = (String) item.get("Value");
                        break;
                    }
                }
                
                log.info("Payment successful. Receipt: {}", receiptNumber);
                orderService.confirmPayment(checkoutRequestId, receiptNumber);
                
            } else {
                // Payment failed
                log.error("Payment failed. ResultCode: {}, ResultDesc: {}", resultCode, resultDesc);
                orderService.failPayment(checkoutRequestId, resultDesc);
            }
            
        } catch (Exception e) {
            log.error("Error processing M-Pesa callback: ", e);
        }
    }
    
    private String getAccessToken() {
        try {
            String credentials = consumerKey + ":" + consumerSecret;
            String encodedCredentials = Base64.getEncoder()
                    .encodeToString(credentials.getBytes(StandardCharsets.UTF_8));
            
            String response = getWebClient()
                    .get()
                    .uri("/oauth/v1/generate?grant_type=client_credentials")
                    .header(HttpHeaders.AUTHORIZATION, "Basic " + encodedCredentials)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();
            
            JsonNode jsonResponse = objectMapper.readTree(response);
            return jsonResponse.get("access_token").asText();
            
        } catch (Exception e) {
            log.error("Error getting M-Pesa access token: ", e);
            return null;
        }
    }
}
