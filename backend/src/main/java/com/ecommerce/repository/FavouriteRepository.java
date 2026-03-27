package com.ecommerce.repository;

import com.ecommerce.model.Favourite;
import com.ecommerce.model.Product;
import com.ecommerce.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface FavouriteRepository extends JpaRepository<Favourite, UUID> {
    
    List<Favourite> findByUserOrderByCreatedAtDesc(User user);
    
    Optional<Favourite> findByUserAndProduct(User user, Product product);
    
    boolean existsByUserAndProduct(User user, Product product);
    
    void deleteByUserAndProduct(User user, Product product);
    
    @Query("SELECT f.product.id FROM Favourite f WHERE f.user = :user")
    List<UUID> findProductIdsByUser(User user);
    
    long countByUser(User user);
}
