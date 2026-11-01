package com.thinkmart.service;

import com.thinkmart.dto.WishlistItemDTO;
import com.thinkmart.dto.WishlistSummaryDTO;
import com.thinkmart.entity.Product;
import com.thinkmart.entity.User;
import com.thinkmart.entity.WishlistItem;
import com.thinkmart.exception.BadRequestException;
import com.thinkmart.exception.ResourceNotFoundException;
import com.thinkmart.exception.UnauthorizedException;
import com.thinkmart.repository.ProductRepository;
import com.thinkmart.repository.UserRepository;
import com.thinkmart.repository.WishlistItemRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class WishlistService {

    private final WishlistItemRepository wishlistRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public WishlistService(WishlistItemRepository wishlistRepository,
                           ProductRepository productRepository,
                           UserRepository userRepository) {
        this.wishlistRepository = wishlistRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public WishlistSummaryDTO getWishlist(String userEmail) {
        User user = getUser(userEmail);
        List<WishlistItem> items = wishlistRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
        return buildWishlistSummary(items);
    }

    public WishlistSummaryDTO addToWishlist(String userEmail, String productId) {
        if (productId == null || productId.isBlank()) {
            throw new BadRequestException("Product ID is required.");
        }

        User user = getUser(userEmail);
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product with id '" + productId + "' not found"));

        if (!wishlistRepository.existsByUserIdAndProductId(user.getId(), product.getId())) {
            WishlistItem item = new WishlistItem(user, product);
            wishlistRepository.save(item);
        }

        return getWishlist(userEmail);
    }

    public WishlistSummaryDTO removeFromWishlist(String userEmail, String productId) {
        User user = getUser(userEmail);
        wishlistRepository.deleteByUserIdAndProductId(user.getId(), productId);
        return getWishlist(userEmail);
    }

    @Transactional(readOnly = true)
    public boolean isInWishlist(String userEmail, String productId) {
        if (userEmail == null || userEmail.isBlank() || productId == null || productId.isBlank()) {
            return false;
        }
        User user = userRepository.findByEmailIgnoreCase(userEmail.trim()).orElse(null);
        if (user == null) {
            return false;
        }
        return wishlistRepository.existsByUserIdAndProductId(user.getId(), productId);
    }

    private User getUser(String userEmail) {
        if (userEmail == null || userEmail.isBlank()) {
            throw new UnauthorizedException("Authentication is required to access wishlist.");
        }
        return userRepository.findByEmailIgnoreCase(userEmail.trim())
                .orElseThrow(() -> new UnauthorizedException("User not found: " + userEmail));
    }

    private WishlistSummaryDTO buildWishlistSummary(List<WishlistItem> items) {
        List<WishlistItemDTO> dtos = items.stream().map(item -> {
            Product p = item.getProduct();
            BigDecimal price = p.getPrice().setScale(2, RoundingMode.HALF_UP);
            BigDecimal originalPrice = p.getOriginalPrice() != null ? p.getOriginalPrice().setScale(2, RoundingMode.HALF_UP) : price;
            boolean inStock = p.getStockQuantity() != null && p.getStockQuantity() > 0;
            String categoryName = p.getCategory() != null ? p.getCategory().getName() : "";

            return new WishlistItemDTO(
                    item.getId(),
                    p.getId(),
                    p.getName(),
                    p.getImageUrl(),
                    categoryName,
                    price,
                    originalPrice,
                    p.getRating(),
                    p.getReviewsCount(),
                    p.getStockQuantity(),
                    inStock,
                    p.getDiscountTag(),
                    item.getCreatedAt()
            );
        }).collect(Collectors.toList());

        return new WishlistSummaryDTO(dtos, dtos.size());
    }
}
