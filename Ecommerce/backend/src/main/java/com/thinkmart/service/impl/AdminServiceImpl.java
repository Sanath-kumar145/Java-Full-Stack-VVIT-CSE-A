package com.thinkmart.service.impl;

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
import com.thinkmart.service.AdminService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class AdminServiceImpl implements AdminService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    public AdminServiceImpl(OrderRepository orderRepository,
                            ProductRepository productRepository,
                            CategoryRepository categoryRepository) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public AdminDashboardStatsDTO getDashboardStats() {
        BigDecimal totalRevenue = orderRepository.sumTotalRevenue();
        if (totalRevenue == null) {
            totalRevenue = BigDecimal.ZERO;
        }

        long totalOrders = orderRepository.count();
        long totalProducts = productRepository.count();
        long lowStockCount = productRepository.countByStockQuantityLessThanEqual(10);
        long processingOrders = orderRepository.countByOrderStatus("PROCESSING");
        long shippedOrders = orderRepository.countByOrderStatus("SHIPPED");
        long deliveredOrders = orderRepository.countByOrderStatus("DELIVERED");
        long cancelledOrders = orderRepository.countByOrderStatus("CANCELLED");

        return new AdminDashboardStatsDTO(
                totalRevenue,
                totalOrders,
                totalProducts,
                lowStockCount,
                processingOrders,
                shippedOrders,
                deliveredOrders,
                cancelledOrders
        );
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductDetailDTO> getAllProducts() {
        return productRepository.findAllWithCategoryOrderByCreatedAtDesc().stream()
                .map(this::mapToDetailDTO)
                .collect(Collectors.toList());
    }

    @Override
    public ProductDetailDTO createProduct(AdminProductRequest request) {
        String productId = request.getId();
        if (productId == null || productId.trim().isEmpty()) {
            productId = generateSlug(request.getName());
        } else {
            productId = productId.trim().toLowerCase().replaceAll("[^a-z0-9-]", "-");
        }

        if (productRepository.existsById(productId)) {
            // Append random suffix to make it unique if slug exists
            productId = productId + "-" + UUID.randomUUID().toString().substring(0, 5);
        }

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + request.getCategoryId()));

        Product product = new Product();
        product.setId(productId);
        product.setName(request.getName().trim());
        product.setBrand(request.getBrand().trim());
        product.setCategory(category);
        product.setPrice(request.getPrice());
        product.setOriginalPrice(request.getOriginalPrice());
        product.setRating(request.getRating() != null ? request.getRating() : BigDecimal.valueOf(5.0));
        product.setReviewsCount(request.getReviewsCount() != null ? request.getReviewsCount() : 0);
        product.setImageUrl(request.getImageUrl().trim());
        product.setDescription(request.getDescription().trim());
        product.setDiscountTag(request.getDiscountTag() != null ? request.getDiscountTag().trim() : null);
        product.setFeatured(Boolean.TRUE.equals(request.getFeatured()));
        product.setStockQuantity(request.getStockQuantity() != null ? request.getStockQuantity() : 0);
        product.setCreatedAt(Instant.now());
        product.setUpdatedAt(Instant.now());

        Product saved = productRepository.save(product);
        return mapToDetailDTO(saved);
    }

    @Override
    public ProductDetailDTO updateProduct(String id, AdminProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + request.getCategoryId()));

        product.setName(request.getName().trim());
        product.setBrand(request.getBrand().trim());
        product.setCategory(category);
        product.setPrice(request.getPrice());
        product.setOriginalPrice(request.getOriginalPrice());
        if (request.getRating() != null) {
            product.setRating(request.getRating());
        }
        if (request.getReviewsCount() != null) {
            product.setReviewsCount(request.getReviewsCount());
        }
        product.setImageUrl(request.getImageUrl().trim());
        product.setDescription(request.getDescription().trim());
        product.setDiscountTag(request.getDiscountTag() != null ? request.getDiscountTag().trim() : null);
        product.setFeatured(Boolean.TRUE.equals(request.getFeatured()));
        product.setStockQuantity(request.getStockQuantity() != null ? request.getStockQuantity() : 0);
        product.setUpdatedAt(Instant.now());

        Product updated = productRepository.save(product);
        return mapToDetailDTO(updated);
    }

    @Override
    public void deleteProduct(String id) {
        if (!productRepository.existsById(id)) {
            throw new ResourceNotFoundException("Product not found with id: " + id);
        }
        productRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderResponseDTO> getAllOrders() {
        List<Order> orders = orderRepository.findAllWithItemsOrderByCreatedAtDesc();
        if (orders.isEmpty()) {
            return Collections.emptyList();
        }

        Set<String> productIds = orders.stream()
                .flatMap(o -> o.getItems().stream())
                .map(OrderItem::getProductId)
                .collect(Collectors.toSet());

        Map<String, Product> productMap = productRepository.findAllById(productIds).stream()
                .collect(Collectors.toMap(Product::getId, p -> p));

        return orders.stream()
                .map(order -> mapToOrderResponseDTO(order, productMap))
                .collect(Collectors.toList());
    }

    @Override
    public OrderResponseDTO updateOrderStatus(String orderIdentifier, UpdateOrderStatusRequest request) {
        Order order = findOrderByIdentifier(orderIdentifier);

        String newStatus = request.getStatus().trim().toUpperCase();
        if (!Set.of("PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED").contains(newStatus)) {
            throw new BadRequestException("Invalid status: " + newStatus + ". Allowed values: PROCESSING, SHIPPED, DELIVERED, CANCELLED.");
        }

        order.setOrderStatus(newStatus);
        if ("DELIVERED".equals(newStatus) && "PENDING_ON_DELIVERY".equals(order.getPaymentStatus())) {
            order.setPaymentStatus("PAID");
        }

        Order saved = orderRepository.save(order);

        Set<String> productIds = saved.getItems().stream()
                .map(OrderItem::getProductId)
                .collect(Collectors.toSet());

        Map<String, Product> productMap = productRepository.findAllById(productIds).stream()
                .collect(Collectors.toMap(Product::getId, p -> p));

        return mapToOrderResponseDTO(saved, productMap);
    }

    private Order findOrderByIdentifier(String identifier) {
        if (identifier == null || identifier.trim().isEmpty()) {
            throw new BadRequestException("Order identifier is required.");
        }

        String trimmed = identifier.trim();
        // Check if numeric ID
        try {
            Long numericId = Long.parseLong(trimmed);
            Optional<Order> byId = orderRepository.findById(numericId);
            if (byId.isPresent()) {
                return byId.get();
            }
        } catch (NumberFormatException ignored) {
            // Not a numeric ID, search by order number
        }

        return orderRepository.findByOrderNumberWithItems(trimmed)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with identifier: " + trimmed));
    }

    private String generateSlug(String name) {
        if (name == null) {
            return "product-" + UUID.randomUUID().toString().substring(0, 8);
        }
        String slug = name.toLowerCase()
                .replaceAll("[^a-z0-9\\s-]", "")
                .replaceAll("\\s+", "-")
                .replaceAll("-+", "-")
                .replaceAll("^-|-$", "");
        return slug.isEmpty() ? "product-" + UUID.randomUUID().toString().substring(0, 8) : slug;
    }

    private ProductDetailDTO mapToDetailDTO(Product product) {
        return new ProductDetailDTO(
                product.getId(),
                product.getName(),
                product.getBrand(),
                product.getCategory() != null ? product.getCategory().getId() : null,
                product.getCategory() != null ? product.getCategory().getName() : null,
                product.getCategory() != null ? product.getCategory().getSlug() : null,
                product.getPrice(),
                product.getOriginalPrice(),
                product.getRating(),
                product.getReviewsCount(),
                product.getImageUrl(),
                product.getDescription(),
                product.getDiscountTag(),
                product.getFeatured(),
                product.getStockQuantity(),
                product.getStockQuantity() > 0,
                product.getCreatedAt(),
                product.getUpdatedAt()
        );
    }

    private OrderResponseDTO mapToOrderResponseDTO(Order order, Map<String, Product> productMap) {
        List<OrderItemDTO> itemDTOs = order.getItems().stream()
                .map(item -> {
                    Product product = productMap.get(item.getProductId());
                    String imageUrl = product != null ? product.getImageUrl() : "default-product.webp";
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
                order.getItems().size(),
                itemDTOs
        );
    }
}

