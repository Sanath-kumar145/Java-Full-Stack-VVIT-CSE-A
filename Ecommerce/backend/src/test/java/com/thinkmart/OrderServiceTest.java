package com.thinkmart;

import com.thinkmart.dto.CreateOrderRequest;
import com.thinkmart.dto.OrderResponseDTO;
import com.thinkmart.dto.OrderSummaryDTO;
import com.thinkmart.entity.*;
import com.thinkmart.exception.BadRequestException;
import com.thinkmart.exception.ResourceNotFoundException;
import com.thinkmart.repository.CartItemRepository;
import com.thinkmart.repository.OrderRepository;
import com.thinkmart.repository.ProductRepository;
import com.thinkmart.repository.UserRepository;
import com.thinkmart.service.OrderService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.access.AccessDeniedException;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

public class OrderServiceTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private CartItemRepository cartItemRepository;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private OrderService orderService;

    private User testUser;
    private Category testCategory;
    private Product laptop;
    private Product headphones;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);

        testUser = new User("customer@thinkmart.in", "hashed_pw", "Rohit Sharma", "9876543210", "ROLE_CUSTOMER");
        testUser.setId(100L);

        testCategory = new Category(1L, "Electronics", "electronics", "laptop", "Gadgets", 1);

        laptop = new Product("thinkpad-x1", "ThinkPad X1 Carbon", "Lenovo", testCategory,
                new BigDecimal("124999.00"), new BigDecimal("139999.00"),
                BigDecimal.valueOf(4.8), 120, "laptop.webp", "Ultra-slim laptop",
                "11% OFF", true, 10);

        headphones = new Product("sony-wh1000", "Sony WH-1000XM5", "Sony", testCategory,
                new BigDecimal("299.00"), new BigDecimal("399.00"),
                BigDecimal.valueOf(4.6), 85, "sony.webp", "Noise cancelling",
                "25% OFF", false, 15);

        // Default lenient mocks for product locking and atomic decrement
        lenient().when(productRepository.findByIdForUpdate("thinkpad-x1")).thenReturn(Optional.of(laptop));
        lenient().when(productRepository.findByIdForUpdate("sony-wh1000")).thenReturn(Optional.of(headphones));
        lenient().when(productRepository.decrementStockIfAvailable(eq("thinkpad-x1"), anyInt())).thenReturn(1);
        lenient().when(productRepository.decrementStockIfAvailable(eq("sony-wh1000"), anyInt())).thenReturn(1);
    }

    @Test
    @DisplayName("createOrder: Successfully places order with authoritative recalculation, free shipping, stock deduction, and cart cleanup")
    void createOrder_Success_CalculatesAuthoritativeTotals_ReducesStock_ClearsCart() {
        when(userRepository.findByEmailIgnoreCase("customer@thinkmart.in")).thenReturn(Optional.of(testUser));

        CartItem cartItem = new CartItem(testUser, laptop, 2);
        cartItem.setId(1L);
        when(cartItemRepository.findByUserIdOrderByCreatedAtDesc(100L)).thenReturn(List.of(cartItem));

        when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> {
            Order o = invocation.getArgument(0);
            o.setId(500L);
            return o;
        });

        CreateOrderRequest request = new CreateOrderRequest(
                "Rohit Sharma", "9876543210", "123 Brigade Road", "Apt 4B",
                "Bengaluru", "Karnataka", "560001", "India", "Simulated UPI", false
        );

        OrderResponseDTO response = orderService.createOrder("customer@thinkmart.in", request);

        assertNotNull(response);
        assertEquals(500L, response.getId());
        assertTrue(response.getOrderNumber().startsWith("TM-"));
        assertEquals("Rohit Sharma", response.getCustomerName());
        assertEquals("9876543210", response.getCustomerPhone());
        assertEquals("123 Brigade Road, Apt 4B, Bengaluru, Karnataka - 560001, India", response.getShippingAddress());

        // Subtotal: 124999 * 2 = 249998.00
        BigDecimal expectedSubtotal = new BigDecimal("249998.00");
        assertEquals(expectedSubtotal, response.getSubtotal());

        // Tax: 5% of 249998.00 = 12499.90
        BigDecimal expectedTax = new BigDecimal("12499.90");
        assertEquals(expectedTax, response.getTaxAmount());

        // Shipping: Free since 249998 >= 999.00
        assertEquals(new BigDecimal("0.00"), response.getShippingAmount());

        // Total: 249998.00 + 12499.90 + 0 = 262497.90
        assertEquals(new BigDecimal("262497.90"), response.getTotalAmount());
        assertEquals("PROCESSING", response.getOrderStatus());
        assertEquals("Simulated UPI", response.getPaymentMethod());
        assertEquals("PAID", response.getPaymentStatus());

        // Inventory verification: initial 10 - ordered 2 = 8
        assertEquals(8, laptop.getStockQuantity());
        verify(productRepository, times(1)).decrementStockIfAvailable("thinkpad-x1", 2);

        // Cart cleared
        verify(cartItemRepository, times(1)).deleteByUserId(100L);
    }

    @Test
    @DisplayName("createOrder: Correctly assesses ₹99 shipping fee when subtotal is below ₹999")
    void createOrder_Success_AppliesShippingFeeWhenBelowThreshold() {
        when(userRepository.findByEmailIgnoreCase("customer@thinkmart.in")).thenReturn(Optional.of(testUser));

        CartItem cartItem = new CartItem(testUser, headphones, 1);
        cartItem.setId(2L);
        when(cartItemRepository.findByUserIdOrderByCreatedAtDesc(100L)).thenReturn(List.of(cartItem));

        when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> {
            Order o = invocation.getArgument(0);
            o.setId(501L);
            return o;
        });

        CreateOrderRequest request = new CreateOrderRequest(
                "Rohit Sharma", "9876543210", "MG Road", null,
                "Bengaluru", "Karnataka", "560001", "India", "Simulated Card", false
        );

        OrderResponseDTO response = orderService.createOrder("customer@thinkmart.in", request);

        // Subtotal: 299.00 (< 999.00)
        assertEquals(new BigDecimal("299.00"), response.getSubtotal());
        // Tax: 5% of 299 = 14.95
        assertEquals(new BigDecimal("14.95"), response.getTaxAmount());
        // Shipping: 99.00
        assertEquals(new BigDecimal("99.00"), response.getShippingAmount());
        // Total: 299.00 + 14.95 + 99.00 = 412.95
        assertEquals(new BigDecimal("412.95"), response.getTotalAmount());
    }

    @Test
    @DisplayName("createOrder: Cash on Delivery sets payment status to PENDING_ON_DELIVERY")
    void createOrder_COD_SetsPendingOnDelivery() {
        when(userRepository.findByEmailIgnoreCase("customer@thinkmart.in")).thenReturn(Optional.of(testUser));

        CartItem cartItem = new CartItem(testUser, laptop, 1);
        when(cartItemRepository.findByUserIdOrderByCreatedAtDesc(100L)).thenReturn(List.of(cartItem));

        when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> invocation.getArgument(0));

        CreateOrderRequest request = new CreateOrderRequest(
                "Rohit Sharma", "9876543210", "MG Road", null,
                "Bengaluru", "Karnataka", "560001", "India", "Cash on Delivery (Simulated)", false
        );

        OrderResponseDTO response = orderService.createOrder("customer@thinkmart.in", request);

        assertEquals("Cash on Delivery (Simulated)", response.getPaymentMethod());
        assertEquals("PENDING_ON_DELIVERY", response.getPaymentStatus());
    }

    @Test
    @DisplayName("createOrder: Throws BadRequestException when shopping cart is empty")
    void createOrder_Fails_WhenCartIsEmpty() {
        when(userRepository.findByEmailIgnoreCase("customer@thinkmart.in")).thenReturn(Optional.of(testUser));
        when(cartItemRepository.findByUserIdOrderByCreatedAtDesc(100L)).thenReturn(Collections.emptyList());

        CreateOrderRequest request = new CreateOrderRequest(
                "Rohit Sharma", "9876543210", "123 Brigade Road", null,
                "Bengaluru", "Karnataka", "560001", "India", "Simulated UPI", false
        );

        BadRequestException ex = assertThrows(BadRequestException.class, () ->
                orderService.createOrder("customer@thinkmart.in", request));

        assertTrue(ex.getMessage().contains("cart is empty"));
        verify(orderRepository, never()).save(any());
        verify(cartItemRepository, never()).deleteByUserId(any());
    }

    @Test
    @DisplayName("createOrder: Throws BadRequestException when product stock is insufficient")
    void createOrder_Fails_WhenStockInsufficient() {
        when(userRepository.findByEmailIgnoreCase("customer@thinkmart.in")).thenReturn(Optional.of(testUser));

        laptop.setStockQuantity(1); // Only 1 in stock
        CartItem cartItem = new CartItem(testUser, laptop, 3); // Requested 3
        when(cartItemRepository.findByUserIdOrderByCreatedAtDesc(100L)).thenReturn(List.of(cartItem));

        CreateOrderRequest request = new CreateOrderRequest(
                "Rohit Sharma", "9876543210", "123 Brigade Road", null,
                "Bengaluru", "Karnataka", "560001", "India", "Simulated UPI", false
        );

        BadRequestException ex = assertThrows(BadRequestException.class, () ->
                orderService.createOrder("customer@thinkmart.in", request));

        assertTrue(ex.getMessage().contains("Insufficient stock"));
        assertEquals(1, laptop.getStockQuantity()); // Stock unchanged
        verify(orderRepository, never()).save(any());
        verify(cartItemRepository, never()).deleteByUserId(any());
    }

    @Test
    @DisplayName("createOrder: Simulated payment failure rolls back transaction, preserves cart and inventory")
    void createOrder_Fails_WhenPaymentSimulationDeclined() {
        when(userRepository.findByEmailIgnoreCase("customer@thinkmart.in")).thenReturn(Optional.of(testUser));

        CartItem cartItem = new CartItem(testUser, laptop, 1);
        when(cartItemRepository.findByUserIdOrderByCreatedAtDesc(100L)).thenReturn(List.of(cartItem));

        CreateOrderRequest request = new CreateOrderRequest(
                "Rohit Sharma", "9876543210", "123 Brigade Road", null,
                "Bengaluru", "Karnataka", "560001", "India", "Simulated UPI", true // simulate failure!
        );

        BadRequestException ex = assertThrows(BadRequestException.class, () ->
                orderService.createOrder("customer@thinkmart.in", request));

        assertTrue(ex.getMessage().contains("Simulated payment failed"));
        assertEquals(10, laptop.getStockQuantity()); // Stock preserved
        verify(productRepository, never()).decrementStockIfAvailable(any(), anyInt());
        verify(orderRepository, never()).save(any());
        verify(cartItemRepository, never()).deleteByUserId(any());
    }

    @Test
    @DisplayName("concurrency: Two competing purchases for limited stock: exactly one succeeds, stock never drops below zero")
    void createOrder_ConcurrentPurchases_CompetingForLimitedStock_OnlyOneSucceeds() throws Exception {
        User user1 = new User("user1@thinkmart.in", "pw", "User One", "1111111111", "ROLE_CUSTOMER");
        user1.setId(101L);
        User user2 = new User("user2@thinkmart.in", "pw", "User Two", "2222222222", "ROLE_CUSTOMER");
        user2.setId(102L);

        when(userRepository.findByEmailIgnoreCase("user1@thinkmart.in")).thenReturn(Optional.of(user1));
        when(userRepository.findByEmailIgnoreCase("user2@thinkmart.in")).thenReturn(Optional.of(user2));

        // Limited inventory: exactly 1 unit available
        laptop.setStockQuantity(1);

        CartItem itemUser1 = new CartItem(user1, laptop, 1);
        CartItem itemUser2 = new CartItem(user2, laptop, 1);

        when(cartItemRepository.findByUserIdOrderByCreatedAtDesc(101L)).thenReturn(List.of(itemUser1));
        when(cartItemRepository.findByUserIdOrderByCreatedAtDesc(102L)).thenReturn(List.of(itemUser2));

        // Atomic decrement mock: first thread succeeds (returns 1), second thread fails (returns 0)
        AtomicInteger remainingStock = new AtomicInteger(1);
        when(productRepository.decrementStockIfAvailable(eq("thinkpad-x1"), eq(1)))
                .thenAnswer(inv -> remainingStock.getAndUpdate(s -> Math.max(0, s - 1)) > 0 ? 1 : 0);

        when(orderRepository.save(any(Order.class))).thenAnswer(inv -> {
            Order o = inv.getArgument(0);
            o.setId(999L);
            return o;
        });

        ExecutorService executor = Executors.newFixedThreadPool(2);
        CountDownLatch startLatch = new CountDownLatch(1);
        CountDownLatch doneLatch = new CountDownLatch(2);

        AtomicInteger successCount = new AtomicInteger(0);
        AtomicInteger failureCount = new AtomicInteger(0);

        CreateOrderRequest request = new CreateOrderRequest(
                "Customer", "9876543210", "Street", null, "City", "State", "560001", "India", "Simulated UPI", false
        );

        executor.submit(() -> {
            try {
                startLatch.await();
                orderService.createOrder("user1@thinkmart.in", request);
                successCount.incrementAndGet();
            } catch (BadRequestException ex) {
                failureCount.incrementAndGet();
            } catch (Exception e) {
                // unexpected
            } finally {
                doneLatch.countDown();
            }
        });

        executor.submit(() -> {
            try {
                startLatch.await();
                orderService.createOrder("user2@thinkmart.in", request);
                successCount.incrementAndGet();
            } catch (BadRequestException ex) {
                failureCount.incrementAndGet();
            } catch (Exception e) {
                // unexpected
            } finally {
                doneLatch.countDown();
            }
        });

        // Trigger simultaneous checkout
        startLatch.countDown();
        assertTrue(doneLatch.await(5, TimeUnit.SECONDS));
        executor.shutdown();

        // Exactly one purchase must succeed and one must fail
        assertEquals(1, successCount.get(), "Exactly one purchase should succeed for stock = 1");
        assertEquals(1, failureCount.get(), "Second competing purchase should be rejected for insufficient stock");
        assertEquals(0, remainingStock.get(), "Final stock must be exactly 0, never negative");
        verify(orderRepository, times(1)).save(any(Order.class));
    }

    @Test
    @DisplayName("idempotency: Retrying a completed checkout with identical key returns existing order without duplicate creation")
    void createOrder_DurableIdempotency_RetryingSameRequestReturnsExistingOrderWithoutDuplicate() {
        when(userRepository.findByEmailIgnoreCase("customer@thinkmart.in")).thenReturn(Optional.of(testUser));

        Order existingOrder = new Order("TM-20261101-IDEM01", testUser, "Rohit Sharma", "9876543210",
                "123 Brigade Road, Bengaluru", new BigDecimal("124999.00"), new BigDecimal("6249.95"),
                BigDecimal.ZERO, new BigDecimal("131248.95"), "PROCESSING", "Simulated UPI", "PAID");
        existingOrder.setId(888L);
        existingOrder.setIdempotencyKey("tm-idem-key-999");

        OrderItem existingItem = new OrderItem(existingOrder, "thinkpad-x1", "ThinkPad X1 Carbon",
                new BigDecimal("124999.00"), 1, new BigDecimal("124999.00"));
        existingOrder.addItem(existingItem);

        when(orderRepository.findByIdempotencyKeyWithItems("tm-idem-key-999"))
                .thenReturn(Optional.of(existingOrder));
        when(productRepository.findAllById(any())).thenReturn(List.of(laptop));

        CreateOrderRequest retryRequest = new CreateOrderRequest(
                "Rohit Sharma", "9876543210", "123 Brigade Road", null,
                "Bengaluru", "Karnataka", "560001", "India", "Simulated UPI", false,
                "tm-idem-key-999"
        );

        OrderResponseDTO response = orderService.createOrder("customer@thinkmart.in", retryRequest);

        assertNotNull(response);
        assertEquals("TM-20261101-IDEM01", response.getOrderNumber());
        assertEquals(888L, response.getId());

        // Zero additional stock decerements and zero new orders saved
        verify(productRepository, never()).decrementStockIfAvailable(any(), anyInt());
        verify(orderRepository, never()).save(any());
        verify(cartItemRepository, never()).deleteByUserId(any());
    }

    @Test
    @DisplayName("getUserOrders: Returns past orders for authenticated user")
    void getUserOrders_Success() {
        when(userRepository.findByEmailIgnoreCase("customer@thinkmart.in")).thenReturn(Optional.of(testUser));

        Order order = new Order("TM-20261101-ABC123", testUser, "Rohit Sharma", "9876543210",
                "Bengaluru", new BigDecimal("124999.00"), new BigDecimal("6249.95"),
                BigDecimal.ZERO, new BigDecimal("131248.95"), "PROCESSING", "Simulated UPI", "PAID");
        order.setId(10L);

        OrderItem item = new OrderItem(order, "thinkpad-x1", "ThinkPad X1", new BigDecimal("124999.00"), 1, new BigDecimal("124999.00"));
        order.addItem(item);

        when(orderRepository.findByUserIdWithItemsOrderByCreatedAtDesc(100L)).thenReturn(List.of(order));
        when(productRepository.findAllById(any())).thenReturn(List.of(laptop));

        List<OrderSummaryDTO> orders = orderService.getUserOrders("customer@thinkmart.in");

        assertNotNull(orders);
        assertEquals(1, orders.size());
        assertEquals("TM-20261101-ABC123", orders.get(0).getOrderNumber());
        assertEquals(new BigDecimal("131248.95"), orders.get(0).getTotalAmount());
    }

    @Test
    @DisplayName("getOrderByNumber: Enforces customer ownership and throws AccessDeniedException when another customer attempts access")
    void getOrderByNumber_OwnershipCheck_ThrowsAccessDenied_WhenOtherCustomerAttemptsAccess() {
        when(userRepository.findByEmailIgnoreCase("customer@thinkmart.in")).thenReturn(Optional.of(testUser));

        User otherUser = new User("other@thinkmart.in", "pw", "Other User", "1111111111", "ROLE_CUSTOMER");
        otherUser.setId(999L);

        Order otherUserOrder = new Order("TM-20261101-OTHER1", otherUser, "Other User", "1111111111",
                "Mumbai", new BigDecimal("500.00"), new BigDecimal("25.00"),
                new BigDecimal("99.00"), new BigDecimal("624.00"), "PROCESSING", "Simulated UPI", "PAID");

        when(orderRepository.findByOrderNumberWithItems("TM-20261101-OTHER1")).thenReturn(Optional.of(otherUserOrder));

        AccessDeniedException ex = assertThrows(AccessDeniedException.class, () ->
                orderService.getOrderByNumber("customer@thinkmart.in", "TM-20261101-OTHER1"));

        assertTrue(ex.getMessage().contains("Access denied"));
    }

    @Test
    @DisplayName("getOrderByNumber: Administrator can view any customer order")
    void getOrderByNumber_AdminCanViewAnyOrder() {
        User adminUser = new User("admin@thinkmart.in", "pw", "Admin User", "9999999999", "ROLE_ADMIN");
        adminUser.setId(1L);
        when(userRepository.findByEmailIgnoreCase("admin@thinkmart.in")).thenReturn(Optional.of(adminUser));

        Order customerOrder = new Order("TM-20261101-XYZ999", testUser, "Rohit Sharma", "9876543210",
                "Bengaluru", new BigDecimal("500.00"), new BigDecimal("25.00"),
                new BigDecimal("99.00"), new BigDecimal("624.00"), "PROCESSING", "Simulated UPI", "PAID");

        when(orderRepository.findByOrderNumberWithItems("TM-20261101-XYZ999")).thenReturn(Optional.of(customerOrder));
        when(productRepository.findAllById(any())).thenReturn(Collections.emptyList());

        OrderResponseDTO response = orderService.getOrderByNumber("admin@thinkmart.in", "TM-20261101-XYZ999");

        assertNotNull(response);
        assertEquals("TM-20261101-XYZ999", response.getOrderNumber());
    }

    @Test
    @DisplayName("idempotency: Reusing key with mismatched customer name is rejected with BadRequestException")
    void createOrder_IdempotencyKeyReused_DifferentCustomerName_ThrowsBadRequestException() {
        when(userRepository.findByEmailIgnoreCase("customer@thinkmart.in")).thenReturn(Optional.of(testUser));

        Order existingOrder = new Order("TM-20261101-IDEM01", testUser, "Rohit Sharma", "9876543210",
                "123 Brigade Road, Bengaluru", new BigDecimal("124999.00"), new BigDecimal("6249.95"),
                BigDecimal.ZERO, new BigDecimal("131248.95"), "PROCESSING", "Simulated UPI", "PAID");
        existingOrder.setId(888L);
        existingOrder.setIdempotencyKey("tm-idem-key-diff-name");

        when(orderRepository.findByIdempotencyKeyWithItems("tm-idem-key-diff-name"))
                .thenReturn(Optional.of(existingOrder));

        CreateOrderRequest request = new CreateOrderRequest(
                "Virat Kohli", "9876543210", "123 Brigade Road", null,
                "Bengaluru", "Karnataka", "560001", "India", "Simulated UPI", false,
                "tm-idem-key-diff-name"
        );

        BadRequestException ex = assertThrows(BadRequestException.class, () ->
                orderService.createOrder("customer@thinkmart.in", request));

        assertTrue(ex.getMessage().contains("different customer name"));
    }

    @Test
    @DisplayName("idempotency: Reusing key with mismatched phone number is rejected with BadRequestException")
    void createOrder_IdempotencyKeyReused_DifferentPhone_ThrowsBadRequestException() {
        when(userRepository.findByEmailIgnoreCase("customer@thinkmart.in")).thenReturn(Optional.of(testUser));

        Order existingOrder = new Order("TM-20261101-IDEM01", testUser, "Rohit Sharma", "9876543210",
                "123 Brigade Road, Bengaluru", new BigDecimal("124999.00"), new BigDecimal("6249.95"),
                BigDecimal.ZERO, new BigDecimal("131248.95"), "PROCESSING", "Simulated UPI", "PAID");
        existingOrder.setId(888L);
        existingOrder.setIdempotencyKey("tm-idem-key-diff-phone");

        when(orderRepository.findByIdempotencyKeyWithItems("tm-idem-key-diff-phone"))
                .thenReturn(Optional.of(existingOrder));

        CreateOrderRequest request = new CreateOrderRequest(
                "Rohit Sharma", "9123456780", "123 Brigade Road", null,
                "Bengaluru", "Karnataka", "560001", "India", "Simulated UPI", false,
                "tm-idem-key-diff-phone"
        );

        BadRequestException ex = assertThrows(BadRequestException.class, () ->
                orderService.createOrder("customer@thinkmart.in", request));

        assertTrue(ex.getMessage().contains("different phone number"));
    }

    @Test
    @DisplayName("idempotency: Reusing key with mismatched address is rejected with BadRequestException")
    void createOrder_IdempotencyKeyReused_DifferentAddress_ThrowsBadRequestException() {
        when(userRepository.findByEmailIgnoreCase("customer@thinkmart.in")).thenReturn(Optional.of(testUser));

        Order existingOrder = new Order("TM-20261101-IDEM01", testUser, "Rohit Sharma", "9876543210",
                "123 Brigade Road, Bengaluru", new BigDecimal("124999.00"), new BigDecimal("6249.95"),
                BigDecimal.ZERO, new BigDecimal("131248.95"), "PROCESSING", "Simulated UPI", "PAID");
        existingOrder.setId(888L);
        existingOrder.setIdempotencyKey("tm-idem-key-diff-address");

        when(orderRepository.findByIdempotencyKeyWithItems("tm-idem-key-diff-address"))
                .thenReturn(Optional.of(existingOrder));

        CreateOrderRequest request = new CreateOrderRequest(
                "Rohit Sharma", "9876543210", "999 MG Road", null,
                "Bengaluru", "Karnataka", "560001", "India", "Simulated UPI", false,
                "tm-idem-key-diff-address"
        );

        BadRequestException ex = assertThrows(BadRequestException.class, () ->
                orderService.createOrder("customer@thinkmart.in", request));

        assertTrue(ex.getMessage().contains("different delivery address"));
    }

    @Test
    @DisplayName("idempotency: Idempotency key collision across different customer accounts is rejected with BadRequestException")
    void createOrder_IdempotencyKeyCollision_DifferentUser_ThrowsBadRequestException() {
        when(userRepository.findByEmailIgnoreCase("customer@thinkmart.in")).thenReturn(Optional.of(testUser));

        User otherUser = new User("other@thinkmart.in", "pw", "Other User", "9999999999", "ROLE_CUSTOMER");
        otherUser.setId(999L);

        Order otherOrder = new Order("TM-20261101-OTHER", otherUser, "Other User", "9999999999",
                "123 Brigade Road", new BigDecimal("100.00"), new BigDecimal("5.00"),
                BigDecimal.ZERO, new BigDecimal("105.00"), "PROCESSING", "Simulated UPI", "PAID");
        otherOrder.setId(777L);
        otherOrder.setIdempotencyKey("tm-shared-key");

        when(orderRepository.findByIdempotencyKeyWithItems("tm-shared-key"))
                .thenReturn(Optional.of(otherOrder));

        CreateOrderRequest request = new CreateOrderRequest(
                "Rohit Sharma", "9876543210", "123 Brigade Road", null,
                "Bengaluru", "Karnataka", "560001", "India", "Simulated UPI", false,
                "tm-shared-key"
        );

        BadRequestException ex = assertThrows(BadRequestException.class, () ->
                orderService.createOrder("customer@thinkmart.in", request));

        assertTrue(ex.getMessage().contains("collision with another customer account"));
    }

    @Test
    @DisplayName("idempotency: Concurrent collision triggering DataIntegrityViolationException recovers committed order cleanly")
    void createOrder_ConcurrentCollision_DataIntegrityViolation_RecoversCommittedOrder() {
        when(userRepository.findByEmailIgnoreCase("customer@thinkmart.in")).thenReturn(Optional.of(testUser));

        CartItem cartItem = new CartItem(testUser, laptop, 1);
        when(cartItemRepository.findByUserIdOrderByCreatedAtDesc(100L)).thenReturn(List.of(cartItem));

        Order winningOrder = new Order("TM-20261101-WIN01", testUser, "Rohit Sharma", "9876543210",
                "123 Brigade Road, Bengaluru", new BigDecimal("124999.00"), new BigDecimal("6249.95"),
                BigDecimal.ZERO, new BigDecimal("131248.95"), "PROCESSING", "Simulated UPI", "PAID");
        winningOrder.setId(888L);
        winningOrder.setIdempotencyKey("tm-race-key");
        OrderItem item = new OrderItem(winningOrder, "thinkpad-x1", "ThinkPad X1", new BigDecimal("124999.00"), 1, new BigDecimal("124999.00"));
        winningOrder.addItem(item);

        when(orderRepository.findByIdempotencyKeyWithItems("tm-race-key"))
                .thenReturn(Optional.empty())
                .thenReturn(Optional.of(winningOrder));

        when(orderRepository.save(any(Order.class))).thenThrow(new DataIntegrityViolationException("Duplicate entry 'tm-race-key' for key 'uk_orders_idempotency_key'"));
        when(productRepository.findAllById(any())).thenReturn(List.of(laptop));

        CreateOrderRequest request = new CreateOrderRequest(
                "Rohit Sharma", "9876543210", "123 Brigade Road", null,
                "Bengaluru", "Karnataka", "560001", "India", "Simulated UPI", false,
                "tm-race-key"
        );

        OrderResponseDTO response = orderService.createOrder("customer@thinkmart.in", request);

        assertNotNull(response);
        assertEquals("TM-20261101-WIN01", response.getOrderNumber());
        assertEquals(888L, response.getId());
    }
}
