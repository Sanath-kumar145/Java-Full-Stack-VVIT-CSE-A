package com.thinkmart;

import com.thinkmart.controller.AdminController;
import com.thinkmart.dto.*;
import com.thinkmart.service.AdminService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AdminControllerTest {

    @Mock
    private AdminService adminService;

    private AdminController adminController;

    @BeforeEach
    void setUp() {
        adminController = new AdminController(adminService);
    }

    @Test
    @DisplayName("GET /api/admin/dashboard/stats: Returns dashboard metrics")
    void getDashboardStats_ReturnsOk() {
        AdminDashboardStatsDTO stats = new AdminDashboardStatsDTO(
                new BigDecimal("250000.00"), 15, 12, 2, 5, 4, 5, 1
        );
        when(adminService.getDashboardStats()).thenReturn(stats);

        ResponseEntity<AdminDashboardStatsDTO> response = adminController.getDashboardStats();

        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(new BigDecimal("250000.00"), response.getBody().getTotalRevenue());
        assertEquals(15, response.getBody().getTotalOrders());
        assertEquals(12, response.getBody().getTotalProducts());
    }

    @Test
    @DisplayName("GET /api/admin/products: Returns list of products")
    void getAllProducts_ReturnsOk() {
        ProductDetailDTO product = new ProductDetailDTO(
                "prod-1", "Laptop", "Brand", 1L, "Electronics", "electronics",
                new BigDecimal("50000"), new BigDecimal("60000"), BigDecimal.valueOf(4.5),
                10, "img.webp", "Desc", "10% OFF", true, 20, true, Instant.now(), Instant.now()
        );
        when(adminService.getAllProducts()).thenReturn(List.of(product));

        ResponseEntity<List<ProductDetailDTO>> response = adminController.getAllProducts();

        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(1, response.getBody().size());
        assertEquals("prod-1", response.getBody().get(0).getId());
    }

    @Test
    @DisplayName("POST /api/admin/products: Creates a new product and returns 201 Created")
    void createProduct_ReturnsCreated() {
        AdminProductRequest request = new AdminProductRequest(
                "new-phone", "Smartphone X", "Brand", 2L,
                new BigDecimal("20000"), new BigDecimal("25000"), BigDecimal.valueOf(5.0),
                0, "phone.webp", "New Phone", "20% OFF", false, 15
        );
        ProductDetailDTO created = new ProductDetailDTO(
                "new-phone", "Smartphone X", "Brand", 2L, "Smartphones", "smartphones",
                new BigDecimal("20000"), new BigDecimal("25000"), BigDecimal.valueOf(5.0),
                0, "phone.webp", "New Phone", "20% OFF", false, 15, true, Instant.now(), Instant.now()
        );
        when(adminService.createProduct(request)).thenReturn(created);

        ResponseEntity<ProductDetailDTO> response = adminController.createProduct(request);

        assertNotNull(response);
        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertEquals("new-phone", response.getBody().getId());
    }

    @Test
    @DisplayName("PUT /api/admin/products/{id}: Updates existing product")
    void updateProduct_ReturnsOk() {
        AdminProductRequest request = new AdminProductRequest(
                "prod-1", "Updated Laptop", "Brand", 1L,
                new BigDecimal("55000"), new BigDecimal("60000"), BigDecimal.valueOf(4.5),
                10, "img.webp", "Desc", null, false, 25
        );
        ProductDetailDTO updated = new ProductDetailDTO(
                "prod-1", "Updated Laptop", "Brand", 1L, "Electronics", "electronics",
                new BigDecimal("55000"), new BigDecimal("60000"), BigDecimal.valueOf(4.5),
                10, "img.webp", "Desc", null, false, 25, true, Instant.now(), Instant.now()
        );
        when(adminService.updateProduct("prod-1", request)).thenReturn(updated);

        ResponseEntity<ProductDetailDTO> response = adminController.updateProduct("prod-1", request);

        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Updated Laptop", response.getBody().getName());
        assertEquals(25, response.getBody().getStockQuantity());
    }

    @Test
    @DisplayName("DELETE /api/admin/products/{id}: Deletes product and returns 204 No Content")
    void deleteProduct_ReturnsNoContent() {
        doNothing().when(adminService).deleteProduct("prod-1");

        ResponseEntity<Void> response = adminController.deleteProduct("prod-1");

        assertNotNull(response);
        assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode());
        verify(adminService, times(1)).deleteProduct("prod-1");
    }

    @Test
    @DisplayName("GET /api/admin/orders: Returns all customer orders")
    void getAllOrders_ReturnsOk() {
        OrderResponseDTO order = new OrderResponseDTO(
                1L, "TM-20261101-ABCD", "Customer", "9876543210", "Address",
                new BigDecimal("1000.00"), new BigDecimal("50.00"), BigDecimal.ZERO,
                new BigDecimal("1050.00"), "PROCESSING", "Simulated UPI", "PAID",
                Instant.now(), 1, Collections.emptyList()
        );
        when(adminService.getAllOrders()).thenReturn(List.of(order));

        ResponseEntity<List<OrderResponseDTO>> response = adminController.getAllOrders();

        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(1, response.getBody().size());
        assertEquals("TM-20261101-ABCD", response.getBody().get(0).getOrderNumber());
    }

    @Test
    @DisplayName("PATCH /api/admin/orders/{id}/status: Updates order fulfillment status")
    void updateOrderStatus_ReturnsOk() {
        UpdateOrderStatusRequest request = new UpdateOrderStatusRequest("SHIPPED");
        OrderResponseDTO updated = new OrderResponseDTO(
                1L, "TM-20261101-ABCD", "Customer", "9876543210", "Address",
                new BigDecimal("1000.00"), new BigDecimal("50.00"), BigDecimal.ZERO,
                new BigDecimal("1050.00"), "SHIPPED", "Simulated UPI", "PAID",
                Instant.now(), 1, Collections.emptyList()
        );
        when(adminService.updateOrderStatus("TM-20261101-ABCD", request)).thenReturn(updated);

        ResponseEntity<OrderResponseDTO> response = adminController.updateOrderStatus("TM-20261101-ABCD", request);

        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("SHIPPED", response.getBody().getOrderStatus());
    }
}

