package com.thinkmart.controller;

import com.thinkmart.dto.AddToWishlistRequest;
import com.thinkmart.dto.WishlistSummaryDTO;
import com.thinkmart.exception.UnauthorizedException;
import com.thinkmart.service.WishlistService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/wishlist")
public class WishlistController {

    private final WishlistService wishlistService;

    public WishlistController(WishlistService wishlistService) {
        this.wishlistService = wishlistService;
    }

    @GetMapping
    public ResponseEntity<WishlistSummaryDTO> getWishlist(Authentication authentication) {
        String email = getAuthenticatedEmail(authentication);
        return ResponseEntity.ok(wishlistService.getWishlist(email));
    }

    @PostMapping("/items")
    public ResponseEntity<WishlistSummaryDTO> addItem(@Valid @RequestBody AddToWishlistRequest request,
                                                      Authentication authentication) {
        String email = getAuthenticatedEmail(authentication);
        return ResponseEntity.ok(wishlistService.addToWishlist(email, request.getProductId()));
    }

    @DeleteMapping("/items/{productId}")
    public ResponseEntity<WishlistSummaryDTO> removeItem(@PathVariable String productId,
                                                         Authentication authentication) {
        String email = getAuthenticatedEmail(authentication);
        return ResponseEntity.ok(wishlistService.removeFromWishlist(email, productId));
    }

    @GetMapping("/check/{productId}")
    public ResponseEntity<Map<String, Boolean>> checkWishlist(@PathVariable String productId,
                                                              Authentication authentication) {
        String email = getAuthenticatedEmail(authentication);
        boolean inWishlist = wishlistService.isInWishlist(email, productId);
        return ResponseEntity.ok(Map.of("inWishlist", inWishlist));
    }

    private String getAuthenticatedEmail(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getName())) {
            throw new UnauthorizedException("Full authentication is required to access the wishlist.");
        }
        return authentication.getName();
    }
}

