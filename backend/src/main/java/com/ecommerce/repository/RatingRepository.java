package com.ecommerce.repository;

import com.ecommerce.model.Product;
import com.ecommerce.model.Rating;
import com.ecommerce.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RatingRepository extends JpaRepository<Rating, UUID> {
    
    List<Rating> findByProductOrderByCreatedAtDesc(Product product);
    
    Optional<Rating> findByUserAndProduct(User user, Product product);
    
    boolean existsByUserAndProduct(User user, Product product);
    
    @Query("SELECT AVG(r.rating) FROM Rating r WHERE r.product = :product")
    Double getAverageRatingByProduct(@Param("product") Product product);
    
    @Query("SELECT COUNT(r) FROM Rating r WHERE r.product = :product")
    Long getCountByProduct(@Param("product") Product product);
    
    @Query("SELECT AVG(r.rating) FROM Rating r WHERE r.product.id = :productId")
    Double getAverageRatingByProductId(@Param("productId") UUID productId);
    
    @Query("SELECT COUNT(r) FROM Rating r WHERE r.product.id = :productId")
    Long getCountByProductId(@Param("productId") UUID productId);
}
