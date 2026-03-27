package com.ecommerce.service;

import com.ecommerce.dto.ProductRatingSummary;
import com.ecommerce.dto.RatingDTO;
import com.ecommerce.model.Product;
import com.ecommerce.model.Rating;
import com.ecommerce.model.User;
import com.ecommerce.repository.ProductRepository;
import com.ecommerce.repository.RatingRepository;
import com.ecommerce.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RatingService {
    
    private final RatingRepository ratingRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    
    public ProductRatingSummary getProductRatings(UUID productId) {
        Product product = productRepository.findById(productId)
            .orElseThrow(() -> new RuntimeException("Product not found"));
        
        List<Rating> ratings = ratingRepository.findByProductOrderByCreatedAtDesc(product);
        Double avgRating = ratingRepository.getAverageRatingByProduct(product);
        Long totalRatings = ratingRepository.getCountByProduct(product);
        
        List<RatingDTO> ratingDTOs = ratings.stream()
            .map(this::toDTO)
            .collect(Collectors.toList());
        
        return ProductRatingSummary.builder()
            .averageRating(avgRating != null ? avgRating : 0.0)
            .totalRatings(totalRatings != null ? totalRatings : 0L)
            .ratings(ratingDTOs)
            .build();
    }
    
    @Transactional
    public RatingDTO addOrUpdateRating(UUID productId, UUID userId, Integer rating, String review) {
        if (rating < 1 || rating > 5) {
            throw new RuntimeException("Rating must be between 1 and 5");
        }
        
        Product product = productRepository.findById(productId)
            .orElseThrow(() -> new RuntimeException("Product not found"));
        
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        Rating ratingEntity = ratingRepository.findByUserAndProduct(user, product)
            .orElse(Rating.builder()
                .user(user)
                .product(product)
                .build());
        
        ratingEntity.setRating(rating);
        ratingEntity.setReview(review);
        
        Rating saved = ratingRepository.save(ratingEntity);
        return toDTO(saved);
    }
    
    public RatingDTO getUserRating(UUID productId, UUID userId) {
        Product product = productRepository.findById(productId)
            .orElseThrow(() -> new RuntimeException("Product not found"));
        
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        return ratingRepository.findByUserAndProduct(user, product)
            .map(this::toDTO)
            .orElse(null);
    }
    
    @Transactional
    public void deleteRating(UUID productId, UUID userId) {
        Product product = productRepository.findById(productId)
            .orElseThrow(() -> new RuntimeException("Product not found"));
        
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        ratingRepository.findByUserAndProduct(user, product)
            .ifPresent(ratingRepository::delete);
    }
    
    private RatingDTO toDTO(Rating rating) {
        return RatingDTO.builder()
            .id(rating.getId())
            .productId(rating.getProduct().getId())
            .userId(rating.getUser().getId())
            .userName(rating.getUser().getFullName() != null ? rating.getUser().getFullName() : rating.getUser().getEmail())
            .rating(rating.getRating())
            .review(rating.getReview())
            .createdAt(rating.getCreatedAt())
            .build();
    }
}
