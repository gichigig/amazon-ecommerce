package com.ecommerce.controller;

import com.ecommerce.dto.FavouriteDTO;
import com.ecommerce.service.FavouriteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/favourites")
@RequiredArgsConstructor
public class FavouriteController {
    
    private final FavouriteService favouriteService;
    
    @GetMapping
    public ResponseEntity<List<FavouriteDTO>> getFavourites() {
        return ResponseEntity.ok(favouriteService.getUserFavourites());
    }
    
    @GetMapping("/ids")
    public ResponseEntity<List<UUID>> getFavouriteProductIds() {
        return ResponseEntity.ok(favouriteService.getFavouriteProductIds());
    }
    
    @PostMapping
    public ResponseEntity<FavouriteDTO> addToFavourites(@RequestBody Map<String, String> request) {
        UUID productId = UUID.fromString(request.get("productId"));
        return ResponseEntity.ok(favouriteService.addToFavourites(productId));
    }
    
    @DeleteMapping("/{productId}")
    public ResponseEntity<Void> removeFromFavourites(@PathVariable UUID productId) {
        favouriteService.removeFromFavourites(productId);
        return ResponseEntity.noContent().build();
    }
    
    @GetMapping("/check/{productId}")
    public ResponseEntity<Map<String, Boolean>> checkFavourite(@PathVariable UUID productId) {
        boolean isFavourite = favouriteService.isFavourite(productId);
        return ResponseEntity.ok(Map.of("isFavourite", isFavourite));
    }
    
    @GetMapping("/count")
    public ResponseEntity<Map<String, Long>> getFavouritesCount() {
        long count = favouriteService.getFavouritesCount();
        return ResponseEntity.ok(Map.of("count", count));
    }
}
