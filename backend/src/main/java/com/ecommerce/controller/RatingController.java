package com.ecommerce.controller;

import com.ecommerce.dto.ProductRatingSummary;
import com.ecommerce.dto.RatingDTO;
import com.ecommerce.model.User;
import com.ecommerce.service.RatingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/ratings")
@RequiredArgsConstructor
public class RatingController {
    
    private final RatingService ratingService;
    
    @GetMapping("/product/{productId}")
    public ResponseEntity<ProductRatingSummary> getProductRatings(@PathVariable UUID productId) {
        return ResponseEntity.ok(ratingService.getProductRatings(productId));
    }
    
    @GetMapping("/product/{productId}/my-rating")
    public ResponseEntity<RatingDTO> getMyRating(
            @PathVariable UUID productId,
            @AuthenticationPrincipal User user) {
        RatingDTO rating = ratingService.getUserRating(productId, user.getId());
        return ResponseEntity.ok(rating);
    }
    
    @PostMapping("/product/{productId}")
    public ResponseEntity<RatingDTO> addOrUpdateRating(
            @PathVariable UUID productId,
            @AuthenticationPrincipal User user,
            @RequestBody Map<String, Object> request) {
        Integer rating = (Integer) request.get("rating");
        String review = (String) request.get("review");
        
        RatingDTO result = ratingService.addOrUpdateRating(productId, user.getId(), rating, review);
        return ResponseEntity.ok(result);
    }
    
    @DeleteMapping("/product/{productId}")
    public ResponseEntity<Void> deleteRating(
            @PathVariable UUID productId,
            @AuthenticationPrincipal User user) {
        ratingService.deleteRating(productId, user.getId());
        return ResponseEntity.noContent().build();
    }
}
