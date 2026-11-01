package com.thinkmart.controller;

import com.thinkmart.dto.AddToCartRequest;
import com.thinkmart.dto.CartSummaryDTO;
import com.thinkmart.dto.UpdateCartItemRequest;
import com.thinkmart.exception.UnauthorizedException;
import com.thinkmart.service.CartService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    @GetMapping
    public ResponseEntity<CartSummaryDTO> getCart(Authentication authentication) {
        String email = getAuthenticatedEmail(authentication);
        return ResponseEntity.ok(cartService.getCart(email));
    }

    @PostMapping("/items")
    public ResponseEntity<CartSummaryDTO> addItem(@Valid @RequestBody AddToCartRequest request,
                                                  Authentication authentication) {
        String email = getAuthenticatedEmail(authentication);
        return ResponseEntity.ok(cartService.addToCart(email, request));
    }

    @PutMapping("/items/{productId}")
    public ResponseEntity<CartSummaryDTO> updateItemQuantity(@PathVariable String productId,
                                                            @Valid @RequestBody UpdateCartItemRequest request,
                                                            Authentication authentication) {
        String email = getAuthenticatedEmail(authentication);
        return ResponseEntity.ok(cartService.updateCartItemQuantity(email, productId, request.getQuantity()));
    }

    @DeleteMapping("/items/{productId}")
    public ResponseEntity<CartSummaryDTO> removeItem(@PathVariable String productId,
                                                    Authentication authentication) {
        String email = getAuthenticatedEmail(authentication);
        return ResponseEntity.ok(cartService.removeCartItem(email, productId));
    }

    @DeleteMapping
    public ResponseEntity<Void> clearCart(Authentication authentication) {
        String email = getAuthenticatedEmail(authentication);
        cartService.clearCart(email);
        return ResponseEntity.noContent().build();
    }

    private String getAuthenticatedEmail(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getName())) {
            throw new UnauthorizedException("Full authentication is required to access the shopping cart.");
        }
        return authentication.getName();
    }
}

