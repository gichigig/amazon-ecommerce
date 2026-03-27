package com.ecommerce.controller;

import com.ecommerce.dto.ProductQuestionDTO;
import com.ecommerce.model.User;
import com.ecommerce.service.ProductQuestionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/questions")
@RequiredArgsConstructor
public class ProductQuestionController {
    
    private final ProductQuestionService questionService;
    
    @GetMapping("/product/{productId}")
    public ResponseEntity<List<ProductQuestionDTO>> getProductQuestions(@PathVariable UUID productId) {
        return ResponseEntity.ok(questionService.getProductQuestions(productId));
    }
    
    @GetMapping("/product/{productId}/answered")
    public ResponseEntity<List<ProductQuestionDTO>> getAnsweredQuestions(@PathVariable UUID productId) {
        return ResponseEntity.ok(questionService.getAnsweredQuestions(productId));
    }
    
    @GetMapping("/seller/unanswered")
    public ResponseEntity<List<ProductQuestionDTO>> getUnansweredQuestionsForSeller(
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(questionService.getUnansweredQuestionsForSeller(user.getId()));
    }
    
    @PostMapping("/product/{productId}")
    public ResponseEntity<ProductQuestionDTO> askQuestion(
            @PathVariable UUID productId,
            @AuthenticationPrincipal User user,
            @RequestBody Map<String, String> request) {
        String question = request.get("question");
        return ResponseEntity.ok(questionService.askQuestion(productId, user.getId(), question));
    }
    
    @PostMapping("/{questionId}/answer")
    public ResponseEntity<ProductQuestionDTO> answerQuestion(
            @PathVariable UUID questionId,
            @AuthenticationPrincipal User user,
            @RequestBody Map<String, String> request) {
        String answer = request.get("answer");
        return ResponseEntity.ok(questionService.answerQuestion(questionId, user.getId(), answer));
    }
    
    @DeleteMapping("/{questionId}")
    public ResponseEntity<Void> deleteQuestion(
            @PathVariable UUID questionId,
            @AuthenticationPrincipal User user) {
        questionService.deleteQuestion(questionId, user.getId());
        return ResponseEntity.noContent().build();
    }
}
