package com.ecommerce.controller;

import com.ecommerce.dto.CreateOrderRequest;
import com.ecommerce.dto.OrderDTO;
import com.ecommerce.model.OrderStatus;
import com.ecommerce.security.CurrentUser;
import com.ecommerce.security.UserPrincipal;
import com.ecommerce.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {
    
    private final OrderService orderService;
    
    @GetMapping
    public ResponseEntity<List<OrderDTO>> getUserOrders(@CurrentUser UserPrincipal user) {
        return ResponseEntity.ok(orderService.getUserOrders(user.getId()));
    }
    
    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<OrderDTO>> getAllOrders() {
        return ResponseEntity.ok(orderService.getAllOrders());
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<OrderDTO> getOrder(
            @CurrentUser UserPrincipal user,
            @PathVariable UUID id) {
        OrderDTO order = orderService.getOrderById(id);
        // Check if user owns this order or is admin
        if (!order.getUserId().equals(user.getId()) && !user.isAdmin()) {
            return ResponseEntity.status(403).build();
        }
        return ResponseEntity.ok(order);
    }
    
    @PostMapping
    public ResponseEntity<OrderDTO> createOrder(
            @CurrentUser UserPrincipal user,
            @Valid @RequestBody CreateOrderRequest request) {
        return ResponseEntity.ok(orderService.createOrder(user.getId(), request));
    }
    
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<OrderDTO> updateOrderStatus(
            @PathVariable UUID id,
            @RequestBody Map<String, String> body) {
        OrderStatus status = OrderStatus.valueOf(body.get("status").toUpperCase());
        return ResponseEntity.ok(orderService.updateOrderStatus(id, status));
    }
    
    @GetMapping("/{id}/payment-status")
    public ResponseEntity<Map<String, Object>> getPaymentStatus(
            @CurrentUser UserPrincipal user,
            @PathVariable UUID id) {
        OrderDTO order = orderService.getOrderById(id);
        // Check if user owns this order or is admin
        if (!order.getUserId().equals(user.getId()) && !user.isAdmin()) {
            return ResponseEntity.status(403).build();
        }
        
        Map<String, Object> response = new java.util.HashMap<>();
        response.put("orderId", order.getId());
        response.put("status", order.getStatus().name());
        response.put("isPaid", order.getStatus() == OrderStatus.PAID);
        response.put("mpesaReceiptNumber", order.getMpesaReceiptNumber());
        
        return ResponseEntity.ok(response);
    }
}
