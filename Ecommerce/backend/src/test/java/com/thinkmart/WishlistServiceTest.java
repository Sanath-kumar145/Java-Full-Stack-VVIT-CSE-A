package com.thinkmart;

import com.thinkmart.dto.WishlistSummaryDTO;
import com.thinkmart.entity.Category;
import com.thinkmart.entity.Product;
import com.thinkmart.entity.User;
import com.thinkmart.entity.WishlistItem;
import com.thinkmart.exception.BadRequestException;
import com.thinkmart.exception.ResourceNotFoundException;
import com.thinkmart.repository.ProductRepository;
import com.thinkmart.repository.UserRepository;
import com.thinkmart.repository.WishlistItemRepository;
import com.thinkmart.service.WishlistService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

public class WishlistServiceTest {

    @Mock
    private WishlistItemRepository wishlistRepository;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private WishlistService wishlistService;

    private User testUser;
    private Product testProduct;
    private Category testCategory;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);

        testUser = new User("priya@thinkmart.in", "hashedpwd", "Priya Patel", "9876543211", "ROLE_CUSTOMER");
        testUser.setId(20L);

        testCategory = new Category(2L, "Laptops", "laptops", "laptop", "Laptop category", 2);

        testProduct = new Product(
                "prod-laptop-01",
                "ThinkBook 16 Pro",
                "ThinkBrand",
                testCategory,
                new BigDecimal("85000.00"),
                new BigDecimal("95000.00"),
                new BigDecimal("4.9"),
                85,
                "https://images.unsplash.com/laptop.jpg",
                "High performance laptop",
                "11% OFF",
                true,
                5
        );
    }

    @Test
    @DisplayName("Empty wishlist returns 0 items")
    void emptyWishlistReturnsEmptySummary() {
        when(userRepository.findByEmailIgnoreCase("priya@thinkmart.in")).thenReturn(Optional.of(testUser));
        when(wishlistRepository.findByUserIdOrderByCreatedAtDesc(20L)).thenReturn(List.of());

        WishlistSummaryDTO summary = wishlistService.getWishlist("priya@thinkmart.in");

        assertNotNull(summary);
        assertEquals(0, summary.getTotalItems());
        assertTrue(summary.getItems().isEmpty());
    }

    @Test
    @DisplayName("Add to wishlist: adds product when not already present")
    void addProductToWishlist() {
        when(userRepository.findByEmailIgnoreCase("priya@thinkmart.in")).thenReturn(Optional.of(testUser));
        when(productRepository.findById("prod-laptop-01")).thenReturn(Optional.of(testProduct));
        when(wishlistRepository.existsByUserIdAndProductId(20L, "prod-laptop-01")).thenReturn(false);

        WishlistItem item = new WishlistItem(testUser, testProduct);
        item.setId(50L);
        when(wishlistRepository.save(any(WishlistItem.class))).thenReturn(item);
        when(wishlistRepository.findByUserIdOrderByCreatedAtDesc(20L)).thenReturn(List.of(item));

        WishlistSummaryDTO summary = wishlistService.addToWishlist("priya@thinkmart.in", "prod-laptop-01");

        verify(wishlistRepository, times(1)).save(any(WishlistItem.class));
        assertEquals(1, summary.getTotalItems());
        assertEquals("prod-laptop-01", summary.getItems().get(0).getProductId());
    }

    @Test
    @DisplayName("Add to wishlist: duplicate entry is prevented and does not re-insert")
    void duplicateWishlistEntryPrevented() {
        when(userRepository.findByEmailIgnoreCase("priya@thinkmart.in")).thenReturn(Optional.of(testUser));
        when(productRepository.findById("prod-laptop-01")).thenReturn(Optional.of(testProduct));
        when(wishlistRepository.existsByUserIdAndProductId(20L, "prod-laptop-01")).thenReturn(true);

        WishlistItem existing = new WishlistItem(testUser, testProduct);
        existing.setId(50L);
        when(wishlistRepository.findByUserIdOrderByCreatedAtDesc(20L)).thenReturn(List.of(existing));

        WishlistSummaryDTO summary = wishlistService.addToWishlist("priya@thinkmart.in", "prod-laptop-01");

        // Verify save was NEVER called because item already exists
        verify(wishlistRepository, never()).save(any());
        assertEquals(1, summary.getTotalItems());
    }

    @Test
    @DisplayName("Add to wishlist: nonexistent product throws ResourceNotFoundException")
    void addNonexistentProductThrowsException() {
        when(userRepository.findByEmailIgnoreCase("priya@thinkmart.in")).thenReturn(Optional.of(testUser));
        when(productRepository.findById("unknown-id")).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () ->
                wishlistService.addToWishlist("priya@thinkmart.in", "unknown-id")
        );
    }

    @Test
    @DisplayName("Add to wishlist: null or blank product id throws BadRequestException")
    void addBlankProductIdThrowsException() {
        assertThrows(BadRequestException.class, () ->
                wishlistService.addToWishlist("priya@thinkmart.in", "   ")
        );
    }

    @Test
    @DisplayName("Remove from wishlist: deletes item by user and product id")
    void removeFromWishlistCallsRepository() {
        when(userRepository.findByEmailIgnoreCase("priya@thinkmart.in")).thenReturn(Optional.of(testUser));

        wishlistService.removeFromWishlist("priya@thinkmart.in", "prod-laptop-01");

        verify(wishlistRepository, times(1)).deleteByUserIdAndProductId(20L, "prod-laptop-01");
    }

    @Test
    @DisplayName("isInWishlist: returns true if item exists, false otherwise")
    void isInWishlistChecksCorrectly() {
        when(userRepository.findByEmailIgnoreCase("priya@thinkmart.in")).thenReturn(Optional.of(testUser));
        when(wishlistRepository.existsByUserIdAndProductId(20L, "prod-laptop-01")).thenReturn(true);
        when(wishlistRepository.existsByUserIdAndProductId(20L, "prod-other-02")).thenReturn(false);

        assertTrue(wishlistService.isInWishlist("priya@thinkmart.in", "prod-laptop-01"));
        assertFalse(wishlistService.isInWishlist("priya@thinkmart.in", "prod-other-02"));
    }
}
