package com.ecommerce.controller;

import com.ecommerce.dto.ProductDTO;
import com.ecommerce.service.FileStorageService;
import com.ecommerce.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {
    
    private final ProductService productService;
    private final FileStorageService fileStorageService;
    
    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size,
            @RequestParam(required = false) UUID categoryId,
            @RequestParam(required = false) String department,
            @RequestParam(required = false) Boolean activeOnly) {
        
        Page<ProductDTO> productPage;
        if (department != null && !department.isEmpty()) {
            productPage = productService.getProductsByDepartmentPaginated(department, page, size);
        } else if (categoryId != null) {
            productPage = productService.getProductsByCategoryPaginated(categoryId, page, size);
        } else {
            productPage = productService.getAllActiveProductsPaginated(page, size);
        }
        
        Map<String, Object> response = Map.of(
                "products", productPage.getContent(),
                "currentPage", productPage.getNumber(),
                "totalPages", productPage.getTotalPages(),
                "totalItems", productPage.getTotalElements(),
                "hasMore", productPage.hasNext()
        );
        
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/department/{department}")
    public ResponseEntity<List<ProductDTO>> getProductsByDepartment(@PathVariable String department) {
        return ResponseEntity.ok(productService.getProductsByDepartment(department));
    }
    
    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ProductDTO>> getAllProductsAdmin() {
        return ResponseEntity.ok(productService.getAllProducts());
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<ProductDTO> getProduct(@PathVariable UUID id) {
        return ResponseEntity.ok(productService.getProductById(id));
    }
    
    @GetMapping("/search")
    public ResponseEntity<Map<String, Object>> searchProducts(
            @RequestParam String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size,
            @RequestParam(required = false) UUID categoryId,
            @RequestParam(required = false) String department) {
        
        Page<ProductDTO> productPage;
        if (department != null && !department.isEmpty()) {
            productPage = productService.searchProductsByDepartmentPaginated(department, q, page, size);
        } else if (categoryId != null) {
            productPage = productService.searchProductsByCategoryPaginated(categoryId, q, page, size);
        } else {
            productPage = productService.searchProductsPaginated(q, page, size);
        }
        
        Map<String, Object> response = Map.of(
                "products", productPage.getContent(),
                "currentPage", productPage.getNumber(),
                "totalPages", productPage.getTotalPages(),
                "totalItems", productPage.getTotalElements(),
                "hasMore", productPage.hasNext()
        );
        
        return ResponseEntity.ok(response);
    }
    
    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('SELLER')")
    public ResponseEntity<ProductDTO> createProduct(@Valid @RequestBody ProductDTO productDTO) {
        return ResponseEntity.ok(productService.createProduct(productDTO));
    }
    
    @PostMapping("/with-image")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SELLER')")
    public ResponseEntity<ProductDTO> createProductWithImage(
            @RequestPart("product") @Valid ProductDTO productDTO,
            @RequestPart(value = "image", required = false) MultipartFile image) {
        
        if (image != null && !image.isEmpty()) {
            String filename = fileStorageService.storeFile(image);
            productDTO.setImageUrl(fileStorageService.getFileUrl(filename));
        }
        
        return ResponseEntity.ok(productService.createProduct(productDTO));
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SELLER')")
    public ResponseEntity<ProductDTO> updateProduct(
            @PathVariable UUID id,
            @Valid @RequestBody ProductDTO productDTO) {
        return ResponseEntity.ok(productService.updateProduct(id, productDTO));
    }
    
    @PutMapping("/{id}/with-image")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProductDTO> updateProductWithImage(
            @PathVariable UUID id,
            @RequestPart("product") @Valid ProductDTO productDTO,
            @RequestPart(value = "image", required = false) MultipartFile image) {
        
        if (image != null && !image.isEmpty()) {
            String filename = fileStorageService.storeFile(image);
            productDTO.setImageUrl(fileStorageService.getFileUrl(filename));
        }
        
        return ResponseEntity.ok(productService.updateProduct(id, productDTO));
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteProduct(@PathVariable UUID id) {
        productService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }
}
