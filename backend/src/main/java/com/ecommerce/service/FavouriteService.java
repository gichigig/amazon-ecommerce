package com.ecommerce.service;

import com.ecommerce.dto.FavouriteDTO;
import com.ecommerce.model.Favourite;
import com.ecommerce.model.Product;
import com.ecommerce.model.User;
import com.ecommerce.repository.FavouriteRepository;
import com.ecommerce.repository.ProductRepository;
import com.ecommerce.repository.UserRepository;
import com.ecommerce.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FavouriteService {
    
    private final FavouriteRepository favouriteRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    
    private User getCurrentUser() {
        UserPrincipal userPrincipal = (UserPrincipal) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();
        return userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
    
    public List<FavouriteDTO> getUserFavourites() {
        User user = getCurrentUser();
        List<Favourite> favourites = favouriteRepository.findByUserOrderByCreatedAtDesc(user);
        return favourites.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
    
    public List<UUID> getFavouriteProductIds() {
        User user = getCurrentUser();
        return favouriteRepository.findProductIdsByUser(user);
    }
    
    @Transactional
    public FavouriteDTO addToFavourites(UUID productId) {
        User user = getCurrentUser();
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        
        // Check if already in favourites
        if (favouriteRepository.existsByUserAndProduct(user, product)) {
            throw new RuntimeException("Product already in favourites");
        }
        
        Favourite favourite = Favourite.builder()
                .user(user)
                .product(product)
                .build();
        
        favourite = favouriteRepository.save(favourite);
        return toDTO(favourite);
    }
    
    @Transactional
    public void removeFromFavourites(UUID productId) {
        User user = getCurrentUser();
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        
        favouriteRepository.deleteByUserAndProduct(user, product);
    }
    
    public boolean isFavourite(UUID productId) {
        User user = getCurrentUser();
        Product product = productRepository.findById(productId).orElse(null);
        if (product == null) return false;
        return favouriteRepository.existsByUserAndProduct(user, product);
    }
    
    public long getFavouritesCount() {
        User user = getCurrentUser();
        return favouriteRepository.countByUser(user);
    }
    
    private FavouriteDTO toDTO(Favourite favourite) {
        Product product = favourite.getProduct();
        return FavouriteDTO.builder()
                .id(favourite.getId())
                .productId(product.getId())
                .productName(product.getName())
                .productDescription(product.getDescription())
                .productPrice(product.getPrice())
                .productImageUrl(product.getImageUrl())
                .productStock(product.getStock())
                .categoryId(product.getCategory() != null ? product.getCategory().getId() : null)
                .categoryName(product.getCategory() != null ? product.getCategory().getName() : null)
                .createdAt(favourite.getCreatedAt())
                .build();
    }
}
