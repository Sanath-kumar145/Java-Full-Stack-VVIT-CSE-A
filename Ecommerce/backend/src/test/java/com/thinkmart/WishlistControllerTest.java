package com.thinkmart;

import com.thinkmart.controller.WishlistController;
import com.thinkmart.dto.AddToWishlistRequest;
import com.thinkmart.dto.WishlistSummaryDTO;
import com.thinkmart.exception.UnauthorizedException;
import com.thinkmart.service.WishlistService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class WishlistControllerTest {

    @Mock
    private WishlistService wishlistService;

    @Mock
    private Authentication authentication;

    private WishlistController wishlistController;

    @BeforeEach
    void setUp() {
        wishlistController = new WishlistController(wishlistService);
    }

    @Test
    @DisplayName("GET /api/wishlist: returns wishlist for authenticated user")
    void getWishlistAuthenticated() {
        when(authentication.isAuthenticated()).thenReturn(true);
        when(authentication.getName()).thenReturn("priya@thinkmart.in");

        WishlistSummaryDTO summary = new WishlistSummaryDTO();
        when(wishlistService.getWishlist("priya@thinkmart.in")).thenReturn(summary);

        ResponseEntity<WishlistSummaryDTO> response = wishlistController.getWishlist(authentication);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
    }

    @Test
    @DisplayName("GET /api/wishlist: unauthenticated throws UnauthorizedException")
    void getWishlistUnauthenticated() {
        assertThrows(UnauthorizedException.class, () -> wishlistController.getWishlist(null));
    }

    @Test
    @DisplayName("POST /api/wishlist/items: adds item for authenticated user")
    void addItemAuthenticated() {
        when(authentication.isAuthenticated()).thenReturn(true);
        when(authentication.getName()).thenReturn("priya@thinkmart.in");

        AddToWishlistRequest req = new AddToWishlistRequest("prod-laptop-01");
        WishlistSummaryDTO summary = new WishlistSummaryDTO();
        when(wishlistService.addToWishlist("priya@thinkmart.in", "prod-laptop-01")).thenReturn(summary);

        ResponseEntity<WishlistSummaryDTO> response = wishlistController.addItem(req, authentication);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        verify(wishlistService, times(1)).addToWishlist("priya@thinkmart.in", "prod-laptop-01");
    }

    @Test
    @DisplayName("DELETE /api/wishlist/items/{productId}: removes item")
    void removeItemAuthenticated() {
        when(authentication.isAuthenticated()).thenReturn(true);
        when(authentication.getName()).thenReturn("priya@thinkmart.in");

        WishlistSummaryDTO summary = new WishlistSummaryDTO();
        when(wishlistService.removeFromWishlist("priya@thinkmart.in", "prod-laptop-01")).thenReturn(summary);

        ResponseEntity<WishlistSummaryDTO> response = wishlistController.removeItem("prod-laptop-01", authentication);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        verify(wishlistService, times(1)).removeFromWishlist("priya@thinkmart.in", "prod-laptop-01");
    }

    @Test
    @DisplayName("GET /api/wishlist/check/{productId}: checks item presence")
    void checkItemPresence() {
        when(authentication.isAuthenticated()).thenReturn(true);
        when(authentication.getName()).thenReturn("priya@thinkmart.in");

        when(wishlistService.isInWishlist("priya@thinkmart.in", "prod-laptop-01")).thenReturn(true);

        ResponseEntity<Map<String, Boolean>> response = wishlistController.checkWishlist("prod-laptop-01", authentication);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody().get("inWishlist"));
    }
}

