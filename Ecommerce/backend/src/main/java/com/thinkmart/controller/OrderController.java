package com.thinkmart.controller;

import com.thinkmart.dto.CreateOrderRequest;
import com.thinkmart.dto.OrderResponseDTO;
import com.thinkmart.dto.OrderSummaryDTO;
import com.thinkmart.exception.UnauthorizedException;
import com.thinkmart.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping
    public ResponseEntity<OrderResponseDTO> createOrder(@Valid @RequestBody CreateOrderRequest request,
                                                        Authentication authentication) {
        String email = getAuthenticatedEmail(authentication);
        OrderResponseDTO createdOrder = orderService.createOrder(email, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdOrder);
    }

    @GetMapping("/my-orders")
    public ResponseEntity<List<OrderSummaryDTO>> getMyOrders(Authentication authentication) {
        String email = getAuthenticatedEmail(authentication);
        return ResponseEntity.ok(orderService.getUserOrders(email));
    }

    @GetMapping("/{orderNumber}")
    public ResponseEntity<OrderResponseDTO> getOrderByNumber(@PathVariable String orderNumber,
                                                             Authentication authentication) {
        String email = getAuthenticatedEmail(authentication);
        return ResponseEntity.ok(orderService.getOrderByNumber(email, orderNumber));
    }

    private String getAuthenticatedEmail(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getName())) {
            throw new UnauthorizedException("Full authentication is required to access orders and checkout.");
        }
        return authentication.getName();
    }
}

