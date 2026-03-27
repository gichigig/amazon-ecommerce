package com.ecommerce.repository;

import com.ecommerce.model.Product;
import com.ecommerce.model.ProductQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ProductQuestionRepository extends JpaRepository<ProductQuestion, UUID> {
    
    List<ProductQuestion> findByProductOrderByCreatedAtDesc(Product product);
    
    List<ProductQuestion> findByProductAndAnswerIsNotNullOrderByCreatedAtDesc(Product product);
    
    List<ProductQuestion> findByProductAndAnswerIsNullOrderByCreatedAtDesc(Product product);
    
    // Find unanswered questions for a seller's products
    List<ProductQuestion> findByProduct_SellerAndAnswerIsNullOrderByCreatedAtDesc(com.ecommerce.model.User seller);
}
