package com.ecommerce.service;

import com.ecommerce.dto.ProductQuestionDTO;
import com.ecommerce.model.Product;
import com.ecommerce.model.ProductQuestion;
import com.ecommerce.model.User;
import com.ecommerce.repository.ProductQuestionRepository;
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
public class ProductQuestionService {
    
    private final ProductQuestionRepository questionRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    
    public List<ProductQuestionDTO> getProductQuestions(UUID productId) {
        Product product = productRepository.findById(productId)
            .orElseThrow(() -> new RuntimeException("Product not found"));
        
        return questionRepository.findByProductOrderByCreatedAtDesc(product).stream()
            .map(this::toDTO)
            .collect(Collectors.toList());
    }
    
    public List<ProductQuestionDTO> getAnsweredQuestions(UUID productId) {
        Product product = productRepository.findById(productId)
            .orElseThrow(() -> new RuntimeException("Product not found"));
        
        return questionRepository.findByProductAndAnswerIsNotNullOrderByCreatedAtDesc(product).stream()
            .map(this::toDTO)
            .collect(Collectors.toList());
    }
    
    public List<ProductQuestionDTO> getUnansweredQuestionsForSeller(UUID sellerId) {
        User seller = userRepository.findById(sellerId)
            .orElseThrow(() -> new RuntimeException("Seller not found"));
        
        return questionRepository.findByProduct_SellerAndAnswerIsNullOrderByCreatedAtDesc(seller).stream()
            .map(this::toDTO)
            .collect(Collectors.toList());
    }
    
    @Transactional
    public ProductQuestionDTO askQuestion(UUID productId, UUID userId, String question) {
        Product product = productRepository.findById(productId)
            .orElseThrow(() -> new RuntimeException("Product not found"));
        
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        ProductQuestion questionEntity = ProductQuestion.builder()
            .product(product)
            .user(user)
            .question(question)
            .build();
        
        ProductQuestion saved = questionRepository.save(questionEntity);
        return toDTO(saved);
    }
    
    @Transactional
    public ProductQuestionDTO answerQuestion(UUID questionId, UUID answeredById, String answer) {
        ProductQuestion question = questionRepository.findById(questionId)
            .orElseThrow(() -> new RuntimeException("Question not found"));
        
        User answeredBy = userRepository.findById(answeredById)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Check if user is the seller of the product
        if (!question.getProduct().getSeller().getId().equals(answeredById)) {
            throw new RuntimeException("Only the seller can answer questions");
        }
        
        question.setAnswer(answer);
        question.setAnsweredBy(answeredBy);
        question.setAnsweredAt(LocalDateTime.now());
        
        ProductQuestion saved = questionRepository.save(question);
        return toDTO(saved);
    }
    
    @Transactional
    public void deleteQuestion(UUID questionId, UUID userId) {
        ProductQuestion question = questionRepository.findById(questionId)
            .orElseThrow(() -> new RuntimeException("Question not found"));
        
        // Only allow deletion by the user who asked or the seller
        if (!question.getUser().getId().equals(userId) && 
            !question.getProduct().getSeller().getId().equals(userId)) {
            throw new RuntimeException("Not authorized to delete this question");
        }
        
        questionRepository.delete(question);
    }
    
    private ProductQuestionDTO toDTO(ProductQuestion question) {
        return ProductQuestionDTO.builder()
            .id(question.getId())
            .productId(question.getProduct().getId())
            .productName(question.getProduct().getName())
            .userId(question.getUser().getId())
            .userName(question.getUser().getFullName() != null ? question.getUser().getFullName() : question.getUser().getEmail())
            .question(question.getQuestion())
            .answer(question.getAnswer())
            .answeredById(question.getAnsweredBy() != null ? question.getAnsweredBy().getId() : null)
            .answeredByName(question.getAnsweredBy() != null ? 
                (question.getAnsweredBy().getFullName() != null ? question.getAnsweredBy().getFullName() : question.getAnsweredBy().getEmail()) : null)
            .answeredAt(question.getAnsweredAt())
            .createdAt(question.getCreatedAt())
            .build();
    }
}
