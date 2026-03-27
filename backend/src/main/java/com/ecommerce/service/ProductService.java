package com.ecommerce.service;

import com.ecommerce.dto.ProductDTO;
import com.ecommerce.model.Category;
import com.ecommerce.model.Product;
import com.ecommerce.repository.CategoryRepository;
import com.ecommerce.repository.ProductRepository;
import com.ecommerce.repository.RatingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductService {
    
    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final RatingRepository ratingRepository;
    
    public List<ProductDTO> getAllActiveProducts() {
        return productRepository.findByActiveTrueOrderByCreatedAtDesc()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
    
    public Page<ProductDTO> getAllActiveProductsPaginated(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return productRepository.findByActiveTrue(pageable).map(this::toDTO);
    }
    
    public Page<ProductDTO> getProductsByCategoryPaginated(UUID categoryId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return productRepository.findByActiveTrueAndCategoryId(categoryId, pageable).map(this::toDTO);
    }
    
    public Page<ProductDTO> searchProductsByCategoryPaginated(UUID categoryId, String query, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return productRepository.searchProductsByCategoryPaginated(categoryId, query, pageable).map(this::toDTO);
    }
    
    public Page<ProductDTO> getProductsByDepartmentPaginated(String department, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return productRepository.findByActiveTrueAndDepartment(department, pageable).map(this::toDTO);
    }
    
    public Page<ProductDTO> searchProductsByDepartmentPaginated(String department, String query, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return productRepository.searchProductsByDepartmentPaginated(department, query, pageable).map(this::toDTO);
    }
    
    public List<ProductDTO> getProductsByDepartment(String department) {
        return productRepository.findByActiveTrueAndDepartment(department)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
    
    public List<ProductDTO> getAllProducts() {
        return productRepository.findAll()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
    
    public ProductDTO getProductById(UUID id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        return toDTO(product);
    }
    
    public List<ProductDTO> searchProducts(String query) {
        return productRepository.searchProducts(query)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
    
    public Page<ProductDTO> searchProductsPaginated(String query, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return productRepository.searchProductsPaginated(query, pageable).map(this::toDTO);
    }
    
    @Transactional
    public ProductDTO createProduct(ProductDTO productDTO) {
        Product product = Product.builder()
                .name(productDTO.getName())
                .description(productDTO.getDescription())
                .price(productDTO.getPrice())
                .stock(productDTO.getStock())
                .imageUrl(productDTO.getImageUrl())
                .department(productDTO.getDepartment())
                .active(productDTO.getActive() != null ? productDTO.getActive() : true)
                .build();
        
        // Set category if provided
        if (productDTO.getCategoryId() != null) {
            Category category = categoryRepository.findById(productDTO.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("Category not found"));
            product.setCategory(category);
        }
        
        product = productRepository.save(product);
        return toDTO(product);
    }
    
    @Transactional
    public ProductDTO updateProduct(UUID id, ProductDTO productDTO) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        
        product.setName(productDTO.getName());
        product.setDescription(productDTO.getDescription());
        product.setPrice(productDTO.getPrice());
        product.setStock(productDTO.getStock());
        if (productDTO.getImageUrl() != null) {
            product.setImageUrl(productDTO.getImageUrl());
        }
        product.setActive(productDTO.getActive() != null ? productDTO.getActive() : product.getActive());
        
        // Update department if provided
        if (productDTO.getDepartment() != null) {
            product.setDepartment(productDTO.getDepartment());
        }
        
        // Update category if provided
        if (productDTO.getCategoryId() != null) {
            Category category = categoryRepository.findById(productDTO.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("Category not found"));
            product.setCategory(category);
        }
        
        product = productRepository.save(product);
        return toDTO(product);
    }
    
    @Transactional
    public void deleteProduct(UUID id) {
        if (!productRepository.existsById(id)) {
            throw new RuntimeException("Product not found");
        }
        productRepository.deleteById(id);
    }
    
    private ProductDTO toDTO(Product product) {
        Double avgRating = ratingRepository.getAverageRatingByProductId(product.getId());
        Long totalRatings = ratingRepository.getCountByProductId(product.getId());
        
        return ProductDTO.builder()
                .id(product.getId())
                .name(product.getName())
                .description(product.getDescription())
                .price(product.getPrice())
                .stock(product.getStock())
                .imageUrl(product.getImageUrl())
                .active(product.getActive())
                .categoryId(product.getCategory() != null ? product.getCategory().getId() : null)
                .categoryName(product.getCategory() != null ? product.getCategory().getName() : null)
                .department(product.getDepartment())
                .sellerId(product.getSeller() != null ? product.getSeller().getId() : null)
                .sellerName(product.getSeller() != null ? product.getSeller().getFullName() : null)
                .averageRating(avgRating != null ? avgRating : 0.0)
                .totalRatings(totalRatings != null ? totalRatings : 0L)
                .createdAt(product.getCreatedAt())
                .updatedAt(product.getUpdatedAt())
                .build();
    }
}
