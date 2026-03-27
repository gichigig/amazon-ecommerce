package com.ecommerce.service;

import com.ecommerce.dto.CreateOrderRequest;
import com.ecommerce.dto.OrderDTO;
import com.ecommerce.model.*;
import com.ecommerce.repository.OrderRepository;
import com.ecommerce.repository.ProductRepository;
import com.ecommerce.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {
    
    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final CartService cartService;
    
    public List<OrderDTO> getUserOrders(UUID userId) {
        return orderRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
    
    public List<OrderDTO> getAllOrders() {
        return orderRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
    
    public OrderDTO getOrderById(UUID orderId) {
        Order order = orderRepository.findByIdWithItems(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        return toDTO(order);
    }
    
    @Transactional
    public OrderDTO createOrder(UUID userId, CreateOrderRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Order order = Order.builder()
                .user(user)
                .status(OrderStatus.PENDING_PAYMENT)
                .totalAmount(request.getTotalAmount())
                .shippingAddress(request.getShippingAddress())
                .paymentMethod(request.getPaymentMethod())
                .mpesaPhone(request.getMpesaPhone())
                .build();
        
        // Add order items
        for (CreateOrderRequest.CartItemRequest item : request.getItems()) {
            Product product = productRepository.findById(item.getProductId())
                    .orElseThrow(() -> new RuntimeException("Product not found: " + item.getProductId()));
            
            OrderItem orderItem = OrderItem.builder()
                    .product(product)
                    .quantity(item.getQuantity())
                    .price(item.getPrice())
                    .build();
            
            order.addOrderItem(orderItem);
        }
        
        order = orderRepository.save(order);
        return toDTO(order);
    }
    
    @Transactional
    public OrderDTO updateOrderStatus(UUID orderId, OrderStatus status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        
        order.setStatus(status);
        order = orderRepository.save(order);
        return toDTO(order);
    }
    
    @Transactional
    public OrderDTO updatePaymentInfo(UUID orderId, String checkoutRequestId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        
        order.setMpesaCheckoutRequestId(checkoutRequestId);
        order = orderRepository.save(order);
        return toDTO(order);
    }
    
    @Transactional
    public OrderDTO confirmPayment(String checkoutRequestId, String receiptNumber) {
        Order order = orderRepository.findByMpesaCheckoutRequestId(checkoutRequestId)
                .orElseThrow(() -> new RuntimeException("Order not found for checkout request"));
        
        order.setStatus(OrderStatus.PAID);
        order.setMpesaReceiptNumber(receiptNumber);
        order.setPaymentCompletedAt(LocalDateTime.now());
        
        // Deduct stock for each item in the order
        for (OrderItem item : order.getOrderItems()) {
            Product product = item.getProduct();
            int newStock = product.getStock() - item.getQuantity();
            product.setStock(Math.max(0, newStock)); // Ensure stock doesn't go negative
            productRepository.save(product);
        }
        
        // Clear user's cart after successful payment
        cartService.clearCart(order.getUser().getId());
        
        order = orderRepository.save(order);
        return toDTO(order);
    }
    
    @Transactional
    public OrderDTO failPayment(String checkoutRequestId, String errorMessage) {
        Order order = orderRepository.findByMpesaCheckoutRequestId(checkoutRequestId)
                .orElseThrow(() -> new RuntimeException("Order not found for checkout request"));
        
        order.setStatus(OrderStatus.CANCELLED);
        order.setPaymentError(errorMessage);
        
        order = orderRepository.save(order);
        return toDTO(order);
    }
    
    private OrderDTO toDTO(Order order) {
        List<OrderDTO.OrderItemDTO> items = order.getOrderItems().stream()
                .map(item -> OrderDTO.OrderItemDTO.builder()
                        .id(item.getId())
                        .productId(item.getProduct().getId())
                        .productName(item.getProduct().getName())
                        .price(item.getPrice())
                        .quantity(item.getQuantity())
                        .build())
                .collect(Collectors.toList());
        
        return OrderDTO.builder()
                .id(order.getId())
                .userId(order.getUser().getId())
                .userEmail(order.getUser().getEmail())
                .status(order.getStatus())
                .totalAmount(order.getTotalAmount())
                .shippingAddress(order.getShippingAddress())
                .paymentMethod(order.getPaymentMethod())
                .mpesaPhone(order.getMpesaPhone())
                .mpesaReceiptNumber(order.getMpesaReceiptNumber())
                .paymentCompletedAt(order.getPaymentCompletedAt())
                .orderItems(items)
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .build();
    }
}
