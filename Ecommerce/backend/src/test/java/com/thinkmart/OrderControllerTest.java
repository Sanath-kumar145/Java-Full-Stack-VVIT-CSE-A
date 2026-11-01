package com.thinkmart;

import com.thinkmart.controller.OrderController;
import com.thinkmart.dto.CreateOrderRequest;
import com.thinkmart.dto.OrderItemDTO;
import com.thinkmart.dto.OrderResponseDTO;
import com.thinkmart.dto.OrderSummaryDTO;
import com.thinkmart.exception.UnauthorizedException;
import com.thinkmart.service.OrderService;
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
import java.time.Instant;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class OrderControllerTest {

    @Mock
    private OrderService orderService;

    @Mock
    private Authentication authentication;

    private OrderController orderController;

    @BeforeEach
    void setUp() {
        orderController = new OrderController(orderService);
    }

    @Test
    @DisplayName("POST /api/orders: Returns 201 Created on valid order placement")
    void createOrder_Success_Returns201() {
        when(authentication.isAuthenticated()).thenReturn(true);
        when(authentication.getName()).thenReturn("customer@thinkmart.in");

        CreateOrderRequest request = new CreateOrderRequest(
                "Rohit Sharma", "9876543210", "123 Brigade Road", "Apt 4B",
                "Bengaluru", "Karnataka", "560001", "India", "Simulated UPI", false
        );

        OrderResponseDTO mockResponse = new OrderResponseDTO(
                1L, "TM-20261101-ABCD12", "Rohit Sharma", "9876543210",
                "123 Brigade Road, Bengaluru", new BigDecimal("124999.00"),
                new BigDecimal("6249.95"), BigDecimal.ZERO, new BigDecimal("131248.95"),
                "PROCESSING", "Simulated UPI", "PAID", Instant.now(), 1, Collections.emptyList()
        );

        when(orderService.createOrder("customer@thinkmart.in", request)).thenReturn(mockResponse);

        ResponseEntity<OrderResponseDTO> response = orderController.createOrder(request, authentication);

        assertNotNull(response);
        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("TM-20261101-ABCD12", response.getBody().getOrderNumber());
    }

    @Test
    @DisplayName("POST /api/orders: Throws UnauthorizedException when unauthenticated")
    void createOrder_Unauthenticated_ThrowsUnauthorized() {
        CreateOrderRequest request = new CreateOrderRequest();

        UnauthorizedException ex = assertThrows(UnauthorizedException.class, () ->
                orderController.createOrder(request, null));

        assertTrue(ex.getMessage().contains("Full authentication is required"));
    }

    @Test
    @DisplayName("GET /api/orders/my-orders: Returns 200 OK with order list")
    void getMyOrders_Success_Returns200() {
        when(authentication.isAuthenticated()).thenReturn(true);
        when(authentication.getName()).thenReturn("customer@thinkmart.in");

        OrderSummaryDTO summary = new OrderSummaryDTO(
                1L, "TM-20261101-ABCD12", new BigDecimal("131248.95"),
                "PROCESSING", "Simulated UPI", "PAID", Instant.now(), 1, 1, Collections.emptyList()
        );

        when(orderService.getUserOrders("customer@thinkmart.in")).thenReturn(List.of(summary));

        ResponseEntity<List<OrderSummaryDTO>> response = orderController.getMyOrders(authentication);

        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(1, response.getBody().size());
    }

    @Test
    @DisplayName("GET /api/orders/{orderNumber}: Returns 200 OK with order receipt")
    void getOrderByNumber_Success_Returns200() {
        when(authentication.isAuthenticated()).thenReturn(true);
        when(authentication.getName()).thenReturn("customer@thinkmart.in");

        OrderResponseDTO mockResponse = new OrderResponseDTO(
                1L, "TM-20261101-ABCD12", "Rohit Sharma", "9876543210",
                "123 Brigade Road, Bengaluru", new BigDecimal("124999.00"),
                new BigDecimal("6249.95"), BigDecimal.ZERO, new BigDecimal("131248.95"),
                "PROCESSING", "Simulated UPI", "PAID", Instant.now(), 1, Collections.emptyList()
        );

        when(orderService.getOrderByNumber("customer@thinkmart.in", "TM-20261101-ABCD12")).thenReturn(mockResponse);

        ResponseEntity<OrderResponseDTO> response = orderController.getOrderByNumber("TM-20261101-ABCD12", authentication);

        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("TM-20261101-ABCD12", response.getBody().getOrderNumber());
    }

    @Test
    @DisplayName("GET /api/orders/{orderNumber}: Propagates AccessDeniedException when access is forbidden")
    void getOrderByNumber_AccessDenied_PropagatesException() {
        when(authentication.isAuthenticated()).thenReturn(true);
        when(authentication.getName()).thenReturn("other@thinkmart.in");

        when(orderService.getOrderByNumber("other@thinkmart.in", "TM-20261101-RESTRICTED"))
                .thenThrow(new org.springframework.security.access.AccessDeniedException("Access denied: You do not have permission to view order TM-20261101-RESTRICTED"));

        assertThrows(org.springframework.security.access.AccessDeniedException.class, () ->
                orderController.getOrderByNumber("TM-20261101-RESTRICTED", authentication));
    }
}

