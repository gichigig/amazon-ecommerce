package com.ecommerce.controller;

import com.ecommerce.dto.ProductDTO;
import com.ecommerce.model.Product;
import com.ecommerce.model.User;
import com.ecommerce.repository.OrderRepository;
import com.ecommerce.repository.ProductRepository;
import com.ecommerce.repository.UserRepository;
import com.ecommerce.security.CurrentUser;
import com.ecommerce.security.UserPrincipal;
import com.ecommerce.service.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/seller")
@RequiredArgsConstructor
@PreAuthorize("hasRole('SELLER')")
public class SellerController {
    
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;
    
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats(@CurrentUser UserPrincipal userPrincipal) {
        User seller = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        List<Product> products = productRepository.findBySeller(seller);
        
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalProducts", products.size());
        stats.put("totalOrders", 0); // Will be implemented when we track orders by seller
        stats.put("pendingOrders", 0);
        stats.put("totalRevenue", BigDecimal.ZERO);
        
        return ResponseEntity.ok(stats);
    }
    
    @GetMapping("/products")
    public ResponseEntity<List<ProductDTO>> getMyProducts(@CurrentUser UserPrincipal userPrincipal) {
        User seller = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        List<Product> products = productRepository.findBySeller(seller);
        
        List<ProductDTO> productDTOs = products.stream()
                .map(this::toProductDTO)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(productDTOs);
    }
    
    @PostMapping("/products")
    public ResponseEntity<ProductDTO> createProduct(
            @CurrentUser UserPrincipal userPrincipal,
            @RequestBody ProductDTO productDTO) {
        
        User seller = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Product product = Product.builder()
                .name(productDTO.getName())
                .description(productDTO.getDescription())
                .price(productDTO.getPrice())
                .stock(productDTO.getStock())
                .imageUrl(productDTO.getImageUrl())
            .department(productDTO.getDepartment())
                .active(true)
                .seller(seller)
                .build();
        
        product = productRepository.save(product);
        
        return ResponseEntity.ok(toProductDTO(product));
    }

    @PostMapping(value = "/products", consumes = "multipart/form-data")
    public ResponseEntity<ProductDTO> createProductMultipart(
            @CurrentUser UserPrincipal userPrincipal,
            @RequestParam("name") String name,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam("price") String price,
            @RequestParam("stock") String stock,
            @RequestParam(value = "department", required = false) String department,
            @RequestPart(value = "image", required = false) MultipartFile image) {

        User seller = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        BigDecimal priceValue;
        Integer stockValue;
        try {
            priceValue = new BigDecimal(price);
        } catch (Exception e) {
            throw new RuntimeException("Invalid price");
        }
        try {
            stockValue = Integer.parseInt(stock);
        } catch (Exception e) {
            throw new RuntimeException("Invalid stock");
        }

        String imageUrl = null;
        if (image != null && !image.isEmpty()) {
            String filename = fileStorageService.storeFile(image);
            imageUrl = fileStorageService.getFileUrl(filename);
        }

        Product product = Product.builder()
                .name(name)
                .description(description)
                .price(priceValue)
                .stock(stockValue)
                .department(department)
                .imageUrl(imageUrl)
                .active(true)
                .seller(seller)
                .build();

        product = productRepository.save(product);
        return ResponseEntity.ok(toProductDTO(product));
    }
    
    @PutMapping("/products/{id}")
    public ResponseEntity<ProductDTO> updateProduct(
            @CurrentUser UserPrincipal userPrincipal,
            @PathVariable UUID id,
            @RequestBody ProductDTO productDTO) {
        
        User seller = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        
        // Verify ownership
        if (product.getSeller() == null || !product.getSeller().getId().equals(seller.getId())) {
            throw new RuntimeException("You don't have permission to edit this product");
        }
        
        product.setName(productDTO.getName());
        product.setDescription(productDTO.getDescription());
        product.setPrice(productDTO.getPrice());
        product.setStock(productDTO.getStock());
        if (productDTO.getImageUrl() != null) {
            product.setImageUrl(productDTO.getImageUrl());
        }
        if (productDTO.getDepartment() != null) {
            product.setDepartment(productDTO.getDepartment());
        }
        
        product = productRepository.save(product);
        
        return ResponseEntity.ok(toProductDTO(product));
    }

    @PutMapping(value = "/products/{id}", consumes = "multipart/form-data")
    public ResponseEntity<ProductDTO> updateProductMultipart(
            @CurrentUser UserPrincipal userPrincipal,
            @PathVariable UUID id,
            @RequestParam("name") String name,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam("price") String price,
            @RequestParam("stock") String stock,
            @RequestParam(value = "department", required = false) String department,
            @RequestPart(value = "image", required = false) MultipartFile image) {

        User seller = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        if (product.getSeller() == null || !product.getSeller().getId().equals(seller.getId())) {
            throw new RuntimeException("You don't have permission to edit this product");
        }

        BigDecimal priceValue;
        Integer stockValue;
        try {
            priceValue = new BigDecimal(price);
        } catch (Exception e) {
            throw new RuntimeException("Invalid price");
        }
        try {
            stockValue = Integer.parseInt(stock);
        } catch (Exception e) {
            throw new RuntimeException("Invalid stock");
        }

        product.setName(name);
        product.setDescription(description);
        product.setPrice(priceValue);
        product.setStock(stockValue);
        product.setDepartment(department);

        if (image != null && !image.isEmpty()) {
            String filename = fileStorageService.storeFile(image);
            product.setImageUrl(fileStorageService.getFileUrl(filename));
        }

        product = productRepository.save(product);
        return ResponseEntity.ok(toProductDTO(product));
    }
    
    @DeleteMapping("/products/{id}")
    public ResponseEntity<Void> deleteProduct(
            @CurrentUser UserPrincipal userPrincipal,
            @PathVariable UUID id) {
        
        User seller = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        
        // Verify ownership
        if (product.getSeller() == null || !product.getSeller().getId().equals(seller.getId())) {
            throw new RuntimeException("You don't have permission to delete this product");
        }
        
        productRepository.delete(product);
        
        return ResponseEntity.noContent().build();
    }
    
    @GetMapping("/orders")
    public ResponseEntity<List<Map<String, Object>>> getMyOrders(@CurrentUser UserPrincipal userPrincipal) {
        // For now, return empty list - will implement order tracking by seller later
        return ResponseEntity.ok(List.of());
    }
    
    @PatchMapping("/orders/{id}/status")
    public ResponseEntity<Map<String, String>> updateOrderStatus(
            @PathVariable UUID id,
            @RequestBody Map<String, String> request) {
        // Will implement later
        return ResponseEntity.ok(Map.of("message", "Status updated"));
    }
    
    private ProductDTO toProductDTO(Product product) {
        return ProductDTO.builder()
                .id(product.getId())
                .name(product.getName())
                .description(product.getDescription())
                .price(product.getPrice())
                .stock(product.getStock())
                .imageUrl(product.getImageUrl())
                .active(product.getActive())
                .department(product.getDepartment())
                .sellerId(product.getSeller() != null ? product.getSeller().getId() : null)
                .sellerName(product.getSeller() != null ? product.getSeller().getFullName() : null)
                .createdAt(product.getCreatedAt())
                .build();
    }
}
