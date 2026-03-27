package com.ecommerce.repository;

import com.ecommerce.model.Category;
import com.ecommerce.model.Product;
import com.ecommerce.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ProductRepository extends JpaRepository<Product, UUID> {
    List<Product> findByActiveTrue();
    List<Product> findByActiveTrueOrderByCreatedAtDesc();
    
    // Paginated queries
    Page<Product> findByActiveTrue(Pageable pageable);
    
    // Category filtering
    Page<Product> findByActiveTrueAndCategory(Category category, Pageable pageable);
    
    Page<Product> findByActiveTrueAndCategoryId(UUID categoryId, Pageable pageable);
    
    List<Product> findByActiveTrueAndCategory(Category category);
    
    @Query("SELECT p FROM Product p WHERE p.active = true AND " +
           "(LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(p.description) LIKE LOWER(CONCAT('%', :search, '%')))")
    List<Product> searchProducts(String search);
    
    @Query("SELECT p FROM Product p WHERE p.active = true AND " +
           "(LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(p.description) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Product> searchProductsPaginated(String search, Pageable pageable);
    
    @Query("SELECT p FROM Product p WHERE p.active = true AND p.category.id = :categoryId AND " +
           "(LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(p.description) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Product> searchProductsByCategoryPaginated(UUID categoryId, String search, Pageable pageable);
    
    List<Product> findByNameContainingIgnoreCaseAndActiveTrue(String name);
    
    List<Product> findBySeller(User seller);
    
    List<Product> findBySellerOrderByCreatedAtDesc(User seller);
    
    // Department filtering
    Page<Product> findByActiveTrueAndDepartment(String department, Pageable pageable);
    
    @Query("SELECT p FROM Product p WHERE p.active = true AND p.department = :department AND " +
           "(LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(p.description) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Product> searchProductsByDepartmentPaginated(String department, String search, Pageable pageable);
    
    List<Product> findByActiveTrueAndDepartment(String department);
}
