package com.thinkmart;

import com.thinkmart.controller.CartController;
import com.thinkmart.dto.AddToCartRequest;
import com.thinkmart.dto.CartItemDTO;
import com.thinkmart.dto.CartSummaryDTO;
import com.thinkmart.dto.UpdateCartItemRequest;
import com.thinkmart.exception.UnauthorizedException;
import com.thinkmart.service.CartService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class CartControllerTest {

    @Mock
    private CartService cartService;

    @Mock
    private Authentication authentication;

    private CartController cartController;

    @BeforeEach
    void setUp() {
        cartController = new CartController(cartService);
    }

    @Test
    @DisplayName("GET /api/cart: returns cart for authenticated user")
    void getCartAuthenticated() {
        when(authentication.isAuthenticated()).thenReturn(true);
        when(authentication.getName()).thenReturn("rahul@thinkmart.in");

        CartItemDTO item = new CartItemDTO(
                1L, "prod-01", "ThinkPhone", "https://img.jpg", "Smartphones",
                new BigDecimal("50000.00"), new BigDecimal("55000.00"),
                1, new BigDecimal("50000.00"), true, 10
        );
        CartSummaryDTO summary = new CartSummaryDTO(
                List.of(item), 1, 1, new BigDecimal("50000.00"),
                new BigDecimal("2500.00"), new BigDecimal("0.00"),
                new BigDecimal("52500.00"), new BigDecimal("999.00"),
                new BigDecimal("0.00"), true
        );
        when(cartService.getCart("rahul@thinkmart.in")).thenReturn(summary);

        ResponseEntity<CartSummaryDTO> response = cartController.getCart(authentication);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(1, response.getBody().getItemCount());
        assertEquals(new BigDecimal("50000.00"), response.getBody().getSubtotal());
    }

    @Test
    @DisplayName("GET /api/cart: throws UnauthorizedException when unauthenticated")
    void getCartUnauthenticatedThrows() {
        assertThrows(UnauthorizedException.class, () -> cartController.getCart(null));

        when(authentication.isAuthenticated()).thenReturn(false);
        assertThrows(UnauthorizedException.class, () -> cartController.getCart(authentication));
    }

    @Test
    @DisplayName("POST /api/cart/items: adds item for authenticated user")
    void addItemAuthenticated() {
        when(authentication.isAuthenticated()).thenReturn(true);
        when(authentication.getName()).thenReturn("rahul@thinkmart.in");

        AddToCartRequest req = new AddToCartRequest("prod-01", 2);
        CartSummaryDTO summary = new CartSummaryDTO();
        when(cartService.addToCart("rahul@thinkmart.in", req)).thenReturn(summary);

        ResponseEntity<CartSummaryDTO> response = cartController.addItem(req, authentication);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        verify(cartService, times(1)).addToCart("rahul@thinkmart.in", req);
    }

    @Test
    @DisplayName("PUT /api/cart/items/{productId}: updates quantity")
    void updateQuantityAuthenticated() {
        when(authentication.isAuthenticated()).thenReturn(true);
        when(authentication.getName()).thenReturn("rahul@thinkmart.in");

        UpdateCartItemRequest req = new UpdateCartItemRequest(3);
        CartSummaryDTO summary = new CartSummaryDTO();
        when(cartService.updateCartItemQuantity("rahul@thinkmart.in", "prod-01", 3)).thenReturn(summary);

        ResponseEntity<CartSummaryDTO> response = cartController.updateItemQuantity("prod-01", req, authentication);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        verify(cartService, times(1)).updateCartItemQuantity("rahul@thinkmart.in", "prod-01", 3);
    }

    @Test
    @DisplayName("DELETE /api/cart/items/{productId}: removes item")
    void removeItemAuthenticated() {
        when(authentication.isAuthenticated()).thenReturn(true);
        when(authentication.getName()).thenReturn("rahul@thinkmart.in");

        CartSummaryDTO summary = new CartSummaryDTO();
        when(cartService.removeCartItem("rahul@thinkmart.in", "prod-01")).thenReturn(summary);

        ResponseEntity<CartSummaryDTO> response = cartController.removeItem("prod-01", authentication);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        verify(cartService, times(1)).removeCartItem("rahul@thinkmart.in", "prod-01");
    }

    @Test
    @DisplayName("DELETE /api/cart: empties cart and returns HTTP 204 No Content")
    void clearCartAuthenticated() {
        when(authentication.isAuthenticated()).thenReturn(true);
        when(authentication.getName()).thenReturn("rahul@thinkmart.in");

        ResponseEntity<Void> response = cartController.clearCart(authentication);

        assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode());
        verify(cartService, times(1)).clearCart("rahul@thinkmart.in");
    }
}

