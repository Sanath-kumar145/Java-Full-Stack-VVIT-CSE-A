package com.thinkmart.service;

import com.thinkmart.dto.*;
import com.thinkmart.entity.CartItem;
import com.thinkmart.entity.Order;
import com.thinkmart.entity.OrderItem;
import com.thinkmart.entity.Product;
import com.thinkmart.entity.User;
import com.thinkmart.exception.BadRequestException;
import com.thinkmart.exception.ResourceNotFoundException;
import com.thinkmart.exception.UnauthorizedException;
import com.thinkmart.repository.CartItemRepository;
import com.thinkmart.repository.OrderRepository;
import com.thinkmart.repository.ProductRepository;
import com.thinkmart.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionTemplate;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.security.SecureRandom;
import java.time.Instant;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class OrderService {

    private static final BigDecimal TAX_RATE = new BigDecimal("0.05"); // 5% GST
    private static final BigDecimal FREE_SHIPPING_THRESHOLD = new BigDecimal("999.00");
    private static final BigDecimal STANDARD_SHIPPING_FEE = new BigDecimal("99.00");
    private static final String ALPHANUMERIC = "0123456789ABCDEFGHJKLMNPQRSTUVWXYZ";
    private static final SecureRandom RANDOM = new SecureRandom();
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyyMMdd").withZone(ZoneOffset.UTC);

    private final OrderRepository orderRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final TransactionTemplate transactionTemplate;

    // Per-user synchronization lock map to serialize duplicate clicks within a single JVM process
    private final ConcurrentHashMap<Long, Object> userLocks = new ConcurrentHashMap<>();

    @Autowired
    public OrderService(OrderRepository orderRepository,
                        CartItemRepository cartItemRepository,
                        ProductRepository productRepository,
                        UserRepository userRepository,
                        PlatformTransactionManager transactionManager) {
        this.orderRepository = orderRepository;
        this.cartItemRepository = cartItemRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
        this.transactionTemplate = transactionManager != null ? new TransactionTemplate(transactionManager) : null;
    }

    public OrderService(OrderRepository orderRepository,
                        CartItemRepository cartItemRepository,
                        ProductRepository productRepository,
                        UserRepository userRepository) {
        this(orderRepository, cartItemRepository, productRepository, userRepository, null);
    }

    /**
     * Creates an order from the user's active shopping cart with durable idempotency.
     * Transaction boundaries are isolated so that concurrent idempotency key collisions
     * do not mark the outer persistence context as rollback-only.
     */
    public OrderResponseDTO createOrder(String userEmail, CreateOrderRequest request) {
        User user = getUser(userEmail);
        Object lock = userLocks.computeIfAbsent(user.getId(), k -> new Object());

        synchronized (lock) {
            try {
                // 1. Durable database-backed idempotency check (pre-transaction check)
                if (request.getIdempotencyKey() != null && !request.getIdempotencyKey().isBlank()) {
                    String key = request.getIdempotencyKey().trim();
                    Optional<Order> existing = orderRepository.findByIdempotencyKeyWithItems(key);
                    if (existing.isPresent()) {
                        Order existingOrder = existing.get();
                        validateIdempotencyPayloadConsistency(existingOrder, request, user);
                        return mapExistingOrderResponse(existingOrder);
                    }
                }

                // 2. Execute order creation in an isolated transactional boundary
                if (transactionTemplate != null) {
                    try {
                        return transactionTemplate.execute(status -> doCreateOrder(user, request));
                    } catch (DataIntegrityViolationException ex) {
                        // The inner transaction rolled back due to concurrent idempotency collision.
                        // Now cleanly retrieve the committed order without UnexpectedRollbackException.
                        if (request.getIdempotencyKey() != null && !request.getIdempotencyKey().isBlank()) {
                            return orderRepository.findByIdempotencyKeyWithItems(request.getIdempotencyKey().trim())
                                    .map(this::mapExistingOrderResponse)
                                    .orElseThrow(() -> ex);
                        }
                        throw ex;
                    }
                } else {
                    try {
                        return doCreateOrder(user, request);
                    } catch (DataIntegrityViolationException ex) {
                        if (request.getIdempotencyKey() != null && !request.getIdempotencyKey().isBlank()) {
                            return orderRepository.findByIdempotencyKeyWithItems(request.getIdempotencyKey().trim())
                                    .map(this::mapExistingOrderResponse)
                                    .orElseThrow(() -> ex);
                        }
                        throw ex;
                    }
                }
            } finally {
                userLocks.remove(user.getId(), lock);
            }
        }
    }

    private OrderResponseDTO doCreateOrder(User user, CreateOrderRequest request) {
        // 1. Retrieve cart items
        List<CartItem> cartItems = cartItemRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
        if (cartItems.isEmpty()) {
            throw new BadRequestException("Your shopping cart is empty. Please add items before checking out.");
        }

        // 2. Simulated payment failure test hook
        if (Boolean.TRUE.equals(request.getSimulateFailure())) {
            throw new BadRequestException("Simulated payment failed. The test transaction was declined by the simulated gateway. No order was created and your cart was preserved.");
        }

        // 3. Sort cart items canonically by product ID to eliminate circular database deadlocks
        List<CartItem> sortedItems = new ArrayList<>(cartItems);
        sortedItems.sort(Comparator.comparing(item -> item.getProduct().getId()));

        // 4. Pre-validate stock with Pessimistic Write Lock (SELECT ... FOR UPDATE)
        Map<String, Product> productMap = new HashMap<>();
        for (CartItem item : sortedItems) {
            Product product = productRepository.findByIdForUpdate(item.getProduct().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + item.getProduct().getId()));

            if (product.getStockQuantity() < item.getQuantity()) {
                throw new BadRequestException("Insufficient stock for product '" + product.getName() +
                        "'. Requested: " + item.getQuantity() + ", Available: " + product.getStockQuantity());
            }
            productMap.put(product.getId(), product);
        }

        // 5. Server-authoritative price recalculation and atomic database stock reduction
        BigDecimal subtotal = BigDecimal.ZERO;
        List<OrderItem> orderItems = new ArrayList<>();

        for (CartItem item : sortedItems) {
            Product product = productMap.get(item.getProduct().getId());
            BigDecimal itemSubtotal = product.getPrice()
                    .multiply(BigDecimal.valueOf(item.getQuantity()))
                    .setScale(2, RoundingMode.HALF_UP);
            subtotal = subtotal.add(itemSubtotal);

            // Atomic conditional database decrement: UPDATE ... WHERE stock_quantity >= quantity
            int updatedRows = productRepository.decrementStockIfAvailable(product.getId(), item.getQuantity());
            if (updatedRows == 0) {
                throw new BadRequestException("Insufficient stock for product '" + product.getName() +
                        "'. Available stock was consumed by a concurrent checkout.");
            }

            // Keep entity in sync with database update
            product.setStockQuantity(product.getStockQuantity() - item.getQuantity());

            OrderItem orderItem = new OrderItem();
            orderItem.setProductId(product.getId());
            orderItem.setProductName(product.getName());
            orderItem.setUnitPrice(product.getPrice());
            orderItem.setQuantity(item.getQuantity());
            orderItem.setSubtotal(itemSubtotal);
            orderItems.add(orderItem);
        }

        // 6. Calculate GST (5%) and Shipping
        BigDecimal taxAmount = subtotal.multiply(TAX_RATE).setScale(2, RoundingMode.HALF_UP);
        boolean freeShipping = subtotal.compareTo(FREE_SHIPPING_THRESHOLD) >= 0;
        BigDecimal shippingAmount = freeShipping ? BigDecimal.ZERO.setScale(2) : STANDARD_SHIPPING_FEE;
        BigDecimal totalAmount = subtotal.add(taxAmount).add(shippingAmount).setScale(2, RoundingMode.HALF_UP);

        // 7. Format delivery address string
        String formattedAddress = formatShippingAddress(request);

        // 8. Determine payment method and status
        String paymentMethod = (request.getPaymentMethod() != null && !request.getPaymentMethod().isBlank())
                ? request.getPaymentMethod()
                : "Simulated UPI";
        String paymentStatus = isCod(paymentMethod) ? "PENDING_ON_DELIVERY" : "PAID";

        // 9. Generate unique order reference
        String orderNumber = generateUniqueOrderNumber();

        // 10. Create and persist Order
        Order order = new Order();
        order.setOrderNumber(orderNumber);
        order.setUser(user);
        order.setCustomerName(request.getCustomerName().trim());
        order.setCustomerPhone(request.getCustomerPhone().trim());
        order.setShippingAddress(formattedAddress);
        order.setSubtotal(subtotal);
        order.setTaxAmount(taxAmount);
        order.setShippingAmount(shippingAmount);
        order.setTotalAmount(totalAmount);
        order.setOrderStatus("PROCESSING");
        order.setPaymentMethod(paymentMethod);
        order.setPaymentStatus(paymentStatus);
        order.setCreatedAt(Instant.now());

        if (request.getIdempotencyKey() != null && !request.getIdempotencyKey().isBlank()) {
            order.setIdempotencyKey(request.getIdempotencyKey().trim());
        }

        for (OrderItem oi : orderItems) {
            order.addItem(oi);
        }

        Order savedOrder = orderRepository.save(order);

        // 11. Clear customer's shopping cart
        cartItemRepository.deleteByUserId(user.getId());

        return mapToOrderResponseDTO(savedOrder, productMap);
    }

    private void validateIdempotencyPayloadConsistency(Order existingOrder, CreateOrderRequest request, User user) {
        if (!existingOrder.getUser().getId().equals(user.getId())) {
            throw new BadRequestException("Idempotency key collision with another customer account.");
        }
        if (!existingOrder.getCustomerName().trim().equalsIgnoreCase(request.getCustomerName().trim())) {
            throw new BadRequestException("Idempotency key was previously submitted with a different customer name.");
        }
        String existingPhone = existingOrder.getCustomerPhone().replaceAll("[^0-9]", "");
        String requestPhone = request.getCustomerPhone().replaceAll("[^0-9]", "");
        if (!existingPhone.equals(requestPhone)) {
            throw new BadRequestException("Idempotency key was previously submitted with a different phone number.");
        }
        String existingAddressLower = existingOrder.getShippingAddress().toLowerCase();
        String requestAddressLine1Lower = request.getAddressLine1().trim().toLowerCase();
        if (!existingAddressLower.contains(requestAddressLine1Lower)) {
            throw new BadRequestException("Idempotency key was previously submitted with a different delivery address.");
        }
    }

    private OrderResponseDTO mapExistingOrderResponse(Order order) {
        Set<String> productIds = order.getItems().stream()
                .map(OrderItem::getProductId)
                .collect(Collectors.toSet());
        Map<String, Product> productMap = productRepository.findAllById(productIds).stream()
                .collect(Collectors.toMap(Product::getId, p -> p, (a, b) -> a));
        return mapToOrderResponseDTO(order, productMap);
    }

    /**
     * Retrieves all orders for the authenticated customer.
     */
    @Transactional(readOnly = true)
    public List<OrderSummaryDTO> getUserOrders(String userEmail) {
        User user = getUser(userEmail);
        List<Order> orders = orderRepository.findByUserIdWithItemsOrderByCreatedAtDesc(user.getId());

        if (orders.isEmpty()) {
            return Collections.emptyList();
        }

        // Collect all distinct product IDs for thumbnail lookup
        Set<String> productIds = orders.stream()
                .flatMap(o -> o.getItems().stream())
                .map(OrderItem::getProductId)
                .collect(Collectors.toSet());

        Map<String, String> imageMap = productRepository.findAllById(productIds).stream()
                .collect(Collectors.toMap(Product::getId, Product::getImageUrl, (a, b) -> a));

        return orders.stream()
                .map(order -> mapToOrderSummaryDTO(order, imageMap))
                .collect(Collectors.toList());
    }

    /**
     * Retrieves a single order by order reference with strict customer ownership check.
     */
    @Transactional(readOnly = true)
    public OrderResponseDTO getOrderByNumber(String userEmail, String orderNumber) {
        User user = getUser(userEmail);
        Order order = orderRepository.findByOrderNumberWithItems(orderNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with reference: " + orderNumber));

        boolean isOwner = order.getUser().getId().equals(user.getId());
        boolean isAdmin = "ROLE_ADMIN".equals(user.getRole());

        if (!isOwner && !isAdmin) {
            throw new AccessDeniedException("Access denied: You do not have permission to view order " + orderNumber);
        }

        Set<String> productIds = order.getItems().stream()
                .map(OrderItem::getProductId)
                .collect(Collectors.toSet());

        Map<String, Product> productMap = productRepository.findAllById(productIds).stream()
                .collect(Collectors.toMap(Product::getId, p -> p, (a, b) -> a));

        return mapToOrderResponseDTO(order, productMap);
    }

    private User getUser(String email) {
        return userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new UnauthorizedException("Authenticated user profile not found."));
    }

    private String generateUniqueOrderNumber() {
        String datePrefix = "TM-" + DATE_FORMATTER.format(Instant.now()) + "-";
        String orderNumber;
        int attempts = 0;
        do {
            StringBuilder sb = new StringBuilder(datePrefix);
            for (int i = 0; i < 6; i++) {
                sb.append(ALPHANUMERIC.charAt(RANDOM.nextInt(ALPHANUMERIC.length())));
            }
            orderNumber = sb.toString();
            attempts++;
            if (attempts > 100) {
                // Fallback to UUID if high contention
                orderNumber = datePrefix + UUID.randomUUID().toString().substring(0, 6).toUpperCase();
                break;
            }
        } while (orderRepository.existsByOrderNumber(orderNumber));
        return orderNumber;
    }

    private String formatShippingAddress(CreateOrderRequest request) {
        StringBuilder sb = new StringBuilder();
        sb.append(request.getAddressLine1().trim());
        if (request.getAddressLine2() != null && !request.getAddressLine2().trim().isEmpty()) {
            sb.append(", ").append(request.getAddressLine2().trim());
        }
        sb.append(", ").append(request.getCity().trim());
        sb.append(", ").append(request.getState().trim());
        sb.append(" - ").append(request.getPostalCode().trim());
        sb.append(", ").append(request.getCountry() != null && !request.getCountry().trim().isEmpty()
                ? request.getCountry().trim()
                : "India");
        return sb.toString();
    }

    private boolean isCod(String paymentMethod) {
        if (paymentMethod == null) return false;
        String lower = paymentMethod.toLowerCase();
        return lower.contains("cash on delivery") || lower.contains("cod");
    }

    private OrderResponseDTO mapToOrderResponseDTO(Order order, Map<String, Product> productMap) {
        List<OrderItemDTO> itemDTOs = order.getItems().stream()
                .map(item -> {
                    Product product = productMap.get(item.getProductId());
                    String imageUrl = product != null ? product.getImageUrl() : "assets/images/products/placeholder.webp";
                    return new OrderItemDTO(
                            item.getId(),
                            item.getProductId(),
                            item.getProductName(),
                            imageUrl,
                            item.getUnitPrice(),
                            item.getQuantity(),
                            item.getSubtotal()
                    );
                })
                .collect(Collectors.toList());

        int totalUnits = itemDTOs.stream().mapToInt(OrderItemDTO::getQuantity).sum();

        return new OrderResponseDTO(
                order.getId(),
                order.getOrderNumber(),
                order.getCustomerName(),
                order.getCustomerPhone(),
                order.getShippingAddress(),
                order.getSubtotal(),
                order.getTaxAmount(),
                order.getShippingAmount(),
                order.getTotalAmount(),
                order.getOrderStatus(),
                order.getPaymentMethod(),
                order.getPaymentStatus(),
                order.getCreatedAt(),
                totalUnits,
                itemDTOs
        );
    }

    private OrderSummaryDTO mapToOrderSummaryDTO(Order order, Map<String, String> imageMap) {
        List<OrderItemDTO> itemDTOs = order.getItems().stream()
                .map(item -> new OrderItemDTO(
                        item.getId(),
                        item.getProductId(),
                        item.getProductName(),
                        imageMap.getOrDefault(item.getProductId(), "assets/images/products/placeholder.webp"),
                        item.getUnitPrice(),
                        item.getQuantity(),
                        item.getSubtotal()
                ))
                .collect(Collectors.toList());

        int totalUnits = itemDTOs.stream().mapToInt(OrderItemDTO::getQuantity).sum();

        return new OrderSummaryDTO(
                order.getId(),
                order.getOrderNumber(),
                order.getTotalAmount(),
                order.getOrderStatus(),
                order.getPaymentMethod(),
                order.getPaymentStatus(),
                order.getCreatedAt(),
                totalUnits,
                itemDTOs.size(),
                itemDTOs
        );
    }
}
