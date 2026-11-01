package com.thinkmart;

import com.thinkmart.dto.*;
import com.thinkmart.entity.Category;
import com.thinkmart.entity.Order;
import com.thinkmart.entity.OrderItem;
import com.thinkmart.entity.Product;
import com.thinkmart.exception.BadRequestException;
import com.thinkmart.exception.ResourceNotFoundException;
import com.thinkmart.repository.CategoryRepository;
import com.thinkmart.repository.OrderRepository;
import com.thinkmart.repository.ProductRepository;
import com.thinkmart.service.impl.AdminServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AdminServiceTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @InjectMocks
    private AdminServiceImpl adminService;

    private Category electronicsCategory;
    private Product testProduct;
    private Order testOrder;

    @BeforeEach
    void setUp() {
        electronicsCategory = new Category(1L, "Electronics", "electronics", "laptop", "Gadgets", 1);

        testProduct = new Product(
                "thinkpad-x1", "ThinkPad X1 Carbon", "Lenovo", electronicsCategory,
                new BigDecimal("124999.00"), new BigDecimal("139999.00"),
                BigDecimal.valueOf(4.8), 120, "laptop.webp", "Ultra-slim laptop",
                "11% OFF", true, 10
        );

        testOrder = new Order(
                "TM-20261101-ABCD12", null, "Rohit Sharma", "9876543210",
                "Bengaluru", new BigDecimal("124999.00"), new BigDecimal("6249.95"),
                BigDecimal.ZERO, new BigDecimal("131248.95"), "PROCESSING", "Simulated UPI", "PAID"
        );
        testOrder.setId(100L);
        OrderItem item = new OrderItem(testOrder, "thinkpad-x1", "ThinkPad X1", new BigDecimal("124999.00"), 1, new BigDecimal("124999.00"));
        testOrder.addItem(item);
    }

    @Test
    @DisplayName("getDashboardStats: Aggregates revenue, counts, and status breakdowns")
    void getDashboardStats_CalculatesMetricsCorrectly() {
        when(orderRepository.sumTotalRevenue()).thenReturn(new BigDecimal("500000.00"));
        when(orderRepository.count()).thenReturn(20L);
        when(productRepository.count()).thenReturn(12L);
        when(productRepository.countByStockQuantityLessThanEqual(10)).thenReturn(3L);
        when(orderRepository.countByOrderStatus("PROCESSING")).thenReturn(5L);
        when(orderRepository.countByOrderStatus("SHIPPED")).thenReturn(8L);
        when(orderRepository.countByOrderStatus("DELIVERED")).thenReturn(6L);
        when(orderRepository.countByOrderStatus("CANCELLED")).thenReturn(1L);

        AdminDashboardStatsDTO stats = adminService.getDashboardStats();

        assertNotNull(stats);
        assertEquals(new BigDecimal("500000.00"), stats.getTotalRevenue());
        assertEquals(20L, stats.getTotalOrders());
        assertEquals(12L, stats.getTotalProducts());
        assertEquals(3L, stats.getLowStockCount());
        assertEquals(5L, stats.getProcessingOrders());
        assertEquals(8L, stats.getShippedOrders());
        assertEquals(6L, stats.getDeliveredOrders());
        assertEquals(1L, stats.getCancelledOrders());
    }

    @Test
    @DisplayName("getAllProducts: Returns all products with category details")
    void getAllProducts_ReturnsMappedDTOs() {
        when(productRepository.findAllWithCategoryOrderByCreatedAtDesc()).thenReturn(List.of(testProduct));

        List<ProductDetailDTO> products = adminService.getAllProducts();

        assertNotNull(products);
        assertEquals(1, products.size());
        assertEquals("thinkpad-x1", products.get(0).getId());
        assertEquals("Electronics", products.get(0).getCategoryName());
    }

    @Test
    @DisplayName("createProduct: Successfully creates product with slug and valid category")
    void createProduct_Success() {
        AdminProductRequest request = new AdminProductRequest(
                null, "Galaxy Book Pro", "Samsung", 1L,
                new BigDecimal("99999.00"), new BigDecimal("115000.00"), BigDecimal.valueOf(4.7),
                15, "galaxy.webp", "Samsung laptop", "13% OFF", false, 8
        );

        when(categoryRepository.findById(1L)).thenReturn(Optional.of(electronicsCategory));
        when(productRepository.existsById(any())).thenReturn(false);
        when(productRepository.save(any(Product.class))).thenAnswer(inv -> inv.getArgument(0));

        ProductDetailDTO result = adminService.createProduct(request);

        assertNotNull(result);
        assertEquals("galaxy-book-pro", result.getId());
        assertEquals("Galaxy Book Pro", result.getName());
        assertEquals(8, result.getStockQuantity());
        verify(productRepository, times(1)).save(any(Product.class));
    }

    @Test
    @DisplayName("createProduct: Throws ResourceNotFoundException when category does not exist")
    void createProduct_Throws_WhenCategoryNotFound() {
        AdminProductRequest request = new AdminProductRequest(
                "p-1", "Product", "Brand", 999L,
                new BigDecimal("100"), new BigDecimal("150"), BigDecimal.valueOf(5),
                0, "img.webp", "Desc", null, false, 10
        );

        when(categoryRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> adminService.createProduct(request));
        verify(productRepository, never()).save(any());
    }

    @Test
    @DisplayName("updateProduct: Successfully updates product fields")
    void updateProduct_Success() {
        AdminProductRequest request = new AdminProductRequest(
                "thinkpad-x1", "ThinkPad X1 Gen 11", "Lenovo", 1L,
                new BigDecimal("129999.00"), new BigDecimal("145000.00"), BigDecimal.valueOf(4.9),
                130, "laptop-v2.webp", "Upgraded laptop", "10% OFF", true, 15
        );

        when(productRepository.findById("thinkpad-x1")).thenReturn(Optional.of(testProduct));
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(electronicsCategory));
        when(productRepository.save(any(Product.class))).thenAnswer(inv -> inv.getArgument(0));

        ProductDetailDTO updated = adminService.updateProduct("thinkpad-x1", request);

        assertNotNull(updated);
        assertEquals("ThinkPad X1 Gen 11", updated.getName());
        assertEquals(new BigDecimal("129999.00"), updated.getPrice());
        assertEquals(15, updated.getStockQuantity());
    }

    @Test
    @DisplayName("updateProduct: Throws ResourceNotFoundException when product does not exist")
    void updateProduct_Throws_WhenProductNotFound() {
        AdminProductRequest request = new AdminProductRequest();
        when(productRepository.findById("non-existent")).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () ->
                adminService.updateProduct("non-existent", request));
    }

    @Test
    @DisplayName("deleteProduct: Deletes product when it exists")
    void deleteProduct_Success() {
        when(productRepository.existsById("thinkpad-x1")).thenReturn(true);
        doNothing().when(productRepository).deleteById("thinkpad-x1");

        adminService.deleteProduct("thinkpad-x1");

        verify(productRepository, times(1)).deleteById("thinkpad-x1");
    }

    @Test
    @DisplayName("deleteProduct: Throws ResourceNotFoundException when product does not exist")
    void deleteProduct_Throws_WhenNotFound() {
        when(productRepository.existsById("unknown")).thenReturn(false);

        assertThrows(ResourceNotFoundException.class, () -> adminService.deleteProduct("unknown"));
        verify(productRepository, never()).deleteById(any());
    }

    @Test
    @DisplayName("getAllOrders: Returns all orders with line item details")
    void getAllOrders_ReturnsMappedDTOs() {
        when(orderRepository.findAllWithItemsOrderByCreatedAtDesc()).thenReturn(List.of(testOrder));
        when(productRepository.findAllById(any())).thenReturn(List.of(testProduct));

        List<OrderResponseDTO> orders = adminService.getAllOrders();

        assertNotNull(orders);
        assertEquals(1, orders.size());
        assertEquals("TM-20261101-ABCD12", orders.get(0).getOrderNumber());
        assertEquals(1, orders.get(0).getItems().size());
    }

    @Test
    @DisplayName("updateOrderStatus: Successfully updates order status and marks COD as PAID when delivered")
    void updateOrderStatus_Success() {
        testOrder.setPaymentStatus("PENDING_ON_DELIVERY");
        when(orderRepository.findById(100L)).thenReturn(Optional.of(testOrder));
        when(orderRepository.save(any(Order.class))).thenAnswer(inv -> inv.getArgument(0));
        when(productRepository.findAllById(any())).thenReturn(List.of(testProduct));

        UpdateOrderStatusRequest request = new UpdateOrderStatusRequest("DELIVERED");

        OrderResponseDTO result = adminService.updateOrderStatus("100", request);

        assertNotNull(result);
        assertEquals("DELIVERED", result.getOrderStatus());
        assertEquals("PAID", result.getPaymentStatus());
    }

    @Test
    @DisplayName("updateOrderStatus: Throws BadRequestException on invalid status string")
    void updateOrderStatus_Throws_OnInvalidStatus() {
        when(orderRepository.findById(100L)).thenReturn(Optional.of(testOrder));

        UpdateOrderStatusRequest request = new UpdateOrderStatusRequest("INVALID_STATUS");

        BadRequestException ex = assertThrows(BadRequestException.class, () ->
                adminService.updateOrderStatus("100", request));

        assertTrue(ex.getMessage().contains("Invalid status"));
    }
}

