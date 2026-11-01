package com.thinkmart;

import com.thinkmart.dto.AddToCartRequest;
import com.thinkmart.dto.CartSummaryDTO;
import com.thinkmart.entity.CartItem;
import com.thinkmart.entity.Category;
import com.thinkmart.entity.Product;
import com.thinkmart.entity.User;
import com.thinkmart.exception.BadRequestException;
import com.thinkmart.exception.ResourceNotFoundException;
import com.thinkmart.repository.CartItemRepository;
import com.thinkmart.repository.ProductRepository;
import com.thinkmart.repository.UserRepository;
import com.thinkmart.service.CartService;
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

public class CartServiceTest {

    @Mock
    private CartItemRepository cartItemRepository;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private CartService cartService;

    private User testUser;
    private Product testProduct;
    private Category testCategory;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);

        testUser = new User("rahul@thinkmart.in", "hashedpwd", "Rahul Sharma", "9876543210", "ROLE_CUSTOMER");
        testUser.setId(10L);

        testCategory = new Category(1L, "Smartphones", "smartphones", "phone", "Smartphone category", 1);

        testProduct = new Product(
                "prod-phone-01",
                "ThinkPhone 15 Pro",
                "ThinkBrand",
                testCategory,
                new BigDecimal("50000.00"),
                new BigDecimal("55000.00"),
                new BigDecimal("4.8"),
                120,
                "https://images.unsplash.com/photo-phone.jpg",
                "Flagship smartphone",
                "10% OFF",
                true,
                10
        );
    }

    @Test
    @DisplayName("Empty cart returns zero totals and zero shipping")
    void emptyCartCalculatesZeros() {
        when(userRepository.findByEmailIgnoreCase("rahul@thinkmart.in")).thenReturn(Optional.of(testUser));
        when(cartItemRepository.findByUserIdOrderByCreatedAtDesc(10L)).thenReturn(List.of());

        CartSummaryDTO cart = cartService.getCart("rahul@thinkmart.in");

        assertNotNull(cart);
        assertEquals(0, cart.getItemCount());
        assertEquals(0, cart.getTotalItems());
        assertEquals(new BigDecimal("0.00"), cart.getSubtotal());
        assertEquals(new BigDecimal("0.00"), cart.getTax());
        assertEquals(new BigDecimal("0.00"), cart.getShippingFee());
        assertEquals(new BigDecimal("0.00"), cart.getGrandTotal());
        assertFalse(cart.isEligibleForFreeShipping());
    }

    @Test
    @DisplayName("Subtotal < 999 charges 5% GST and Rs 99 shipping")
    void cartBelowFreeShippingThresholdChargesShipping() {
        Product cheapItem = new Product(
                "prod-cable-01",
                "Fast Charging Cable",
                "ThinkBrand",
                testCategory,
                new BigDecimal("500.00"),
                new BigDecimal("700.00"),
                new BigDecimal("4.5"),
                50,
                "https://images.unsplash.com/cable.jpg",
                "Type-C Cable",
                "28% OFF",
                false,
                20
        );

        CartItem item = new CartItem(testUser, cheapItem, 1);
        item.setId(1L);

        when(userRepository.findByEmailIgnoreCase("rahul@thinkmart.in")).thenReturn(Optional.of(testUser));
        when(cartItemRepository.findByUserIdOrderByCreatedAtDesc(10L)).thenReturn(List.of(item));

        CartSummaryDTO cart = cartService.getCart("rahul@thinkmart.in");

        assertEquals(1, cart.getItemCount());
        assertEquals(1, cart.getTotalItems());
        // Subtotal = 500.00
        assertEquals(new BigDecimal("500.00"), cart.getSubtotal());
        // Tax = 5% of 500.00 = 25.00
        assertEquals(new BigDecimal("25.00"), cart.getTax());
        // Shipping fee = 99.00
        assertEquals(new BigDecimal("99.00"), cart.getShippingFee());
        // Grand total = 500 + 25 + 99 = 624.00
        assertEquals(new BigDecimal("624.00"), cart.getGrandTotal());
        assertFalse(cart.isEligibleForFreeShipping());
        // Amount needed for free shipping = 999 - 500 = 499.00
        assertEquals(new BigDecimal("499.00"), cart.getAmountNeededForFreeShipping());
    }

    @Test
    @DisplayName("Subtotal >= 999 qualifies for free shipping with 5% GST")
    void cartAboveFreeShippingThresholdHasFreeShipping() {
        CartItem item = new CartItem(testUser, testProduct, 1);
        item.setId(1L);

        when(userRepository.findByEmailIgnoreCase("rahul@thinkmart.in")).thenReturn(Optional.of(testUser));
        when(cartItemRepository.findByUserIdOrderByCreatedAtDesc(10L)).thenReturn(List.of(item));

        CartSummaryDTO cart = cartService.getCart("rahul@thinkmart.in");

        // Subtotal = 50,000.00
        assertEquals(new BigDecimal("50000.00"), cart.getSubtotal());
        // Tax = 5% of 50000.00 = 2500.00
        assertEquals(new BigDecimal("2500.00"), cart.getTax());
        // Free shipping = 0.00
        assertEquals(new BigDecimal("0.00"), cart.getShippingFee());
        // Grand total = 50000 + 2500 + 0 = 52500.00
        assertEquals(new BigDecimal("52500.00"), cart.getGrandTotal());
        assertTrue(cart.isEligibleForFreeShipping());
        assertEquals(new BigDecimal("0.00"), cart.getAmountNeededForFreeShipping());
    }

    @Test
    @DisplayName("Add to cart: new product adds item successfully")
    void addNewProductToCart() {
        AddToCartRequest req = new AddToCartRequest("prod-phone-01", 2);

        when(userRepository.findByEmailIgnoreCase("rahul@thinkmart.in")).thenReturn(Optional.of(testUser));
        when(productRepository.findById("prod-phone-01")).thenReturn(Optional.of(testProduct));
        when(cartItemRepository.findByUserIdAndProductId(10L, "prod-phone-01")).thenReturn(Optional.empty());

        CartItem saved = new CartItem(testUser, testProduct, 2);
        saved.setId(101L);
        when(cartItemRepository.save(any(CartItem.class))).thenReturn(saved);
        when(cartItemRepository.findByUserIdOrderByCreatedAtDesc(10L)).thenReturn(List.of(saved));

        CartSummaryDTO result = cartService.addToCart("rahul@thinkmart.in", req);

        verify(cartItemRepository, times(1)).save(any(CartItem.class));
        assertEquals(2, result.getTotalItems());
        assertEquals(new BigDecimal("100000.00"), result.getSubtotal());
    }

    @Test
    @DisplayName("Add to cart: existing product increments quantity")
    void addExistingProductIncrementsQuantity() {
        AddToCartRequest req = new AddToCartRequest("prod-phone-01", 2);

        CartItem existing = new CartItem(testUser, testProduct, 3);
        existing.setId(101L);

        when(userRepository.findByEmailIgnoreCase("rahul@thinkmart.in")).thenReturn(Optional.of(testUser));
        when(productRepository.findById("prod-phone-01")).thenReturn(Optional.of(testProduct));
        when(cartItemRepository.findByUserIdAndProductId(10L, "prod-phone-01")).thenReturn(Optional.of(existing));

        cartService.addToCart("rahul@thinkmart.in", req);

        assertEquals(5, existing.getQuantity());
        verify(cartItemRepository, times(1)).save(existing);
    }

    @Test
    @DisplayName("Add to cart: rejects when requested quantity exceeds available stock")
    void addToCartRejectsExceedingStock() {
        AddToCartRequest req = new AddToCartRequest("prod-phone-01", 15); // stock is 10

        when(userRepository.findByEmailIgnoreCase("rahul@thinkmart.in")).thenReturn(Optional.of(testUser));
        when(productRepository.findById("prod-phone-01")).thenReturn(Optional.of(testProduct));
        when(cartItemRepository.findByUserIdAndProductId(10L, "prod-phone-01")).thenReturn(Optional.empty());

        assertThrows(BadRequestException.class, () -> cartService.addToCart("rahul@thinkmart.in", req));
        verify(cartItemRepository, never()).save(any());
    }

    @Test
    @DisplayName("Add to cart: rejects out of stock product")
    void addToCartRejectsOutOfStockProduct() {
        testProduct.setStockQuantity(0);
        AddToCartRequest req = new AddToCartRequest("prod-phone-01", 1);

        when(userRepository.findByEmailIgnoreCase("rahul@thinkmart.in")).thenReturn(Optional.of(testUser));
        when(productRepository.findById("prod-phone-01")).thenReturn(Optional.of(testProduct));

        assertThrows(BadRequestException.class, () -> cartService.addToCart("rahul@thinkmart.in", req));
    }

    @Test
    @DisplayName("Add to cart: rejects nonexistent product with ResourceNotFoundException")
    void addToCartRejectsNonexistentProduct() {
        AddToCartRequest req = new AddToCartRequest("nonexistent-id", 1);

        when(userRepository.findByEmailIgnoreCase("rahul@thinkmart.in")).thenReturn(Optional.of(testUser));
        when(productRepository.findById("nonexistent-id")).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> cartService.addToCart("rahul@thinkmart.in", req));
    }

    @Test
    @DisplayName("Update quantity: updates existing item when valid")
    void updateQuantitySuccessfully() {
        CartItem existing = new CartItem(testUser, testProduct, 1);
        existing.setId(101L);

        when(userRepository.findByEmailIgnoreCase("rahul@thinkmart.in")).thenReturn(Optional.of(testUser));
        when(cartItemRepository.findByUserIdAndProductId(10L, "prod-phone-01")).thenReturn(Optional.of(existing));

        cartService.updateCartItemQuantity("rahul@thinkmart.in", "prod-phone-01", 4);

        assertEquals(4, existing.getQuantity());
        verify(cartItemRepository, times(1)).save(existing);
    }

    @Test
    @DisplayName("Update quantity: rejects quantity < 1")
    void updateQuantityRejectsZeroOrNegative() {
        assertThrows(BadRequestException.class, () ->
                cartService.updateCartItemQuantity("rahul@thinkmart.in", "prod-phone-01", 0)
        );
    }

    @Test
    @DisplayName("Remove item: invokes repository deletion by user and product id")
    void removeItemInvokesDeletion() {
        when(userRepository.findByEmailIgnoreCase("rahul@thinkmart.in")).thenReturn(Optional.of(testUser));

        cartService.removeCartItem("rahul@thinkmart.in", "prod-phone-01");

        verify(cartItemRepository, times(1)).deleteByUserIdAndProductId(10L, "prod-phone-01");
    }

    @Test
    @DisplayName("Clear cart: invokes repository deleteByUserId")
    void clearCartInvokesDeletion() {
        when(userRepository.findByEmailIgnoreCase("rahul@thinkmart.in")).thenReturn(Optional.of(testUser));

        cartService.clearCart("rahul@thinkmart.in");

        verify(cartItemRepository, times(1)).deleteByUserId(10L);
    }
}
