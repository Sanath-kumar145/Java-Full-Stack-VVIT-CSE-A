package com.thinkmart.service;

import com.thinkmart.dto.AddToCartRequest;
import com.thinkmart.dto.CartItemDTO;
import com.thinkmart.dto.CartSummaryDTO;
import com.thinkmart.entity.CartItem;
import com.thinkmart.entity.Product;
import com.thinkmart.entity.User;
import com.thinkmart.exception.BadRequestException;
import com.thinkmart.exception.ResourceNotFoundException;
import com.thinkmart.exception.UnauthorizedException;
import com.thinkmart.repository.CartItemRepository;
import com.thinkmart.repository.ProductRepository;
import com.thinkmart.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class CartService {

    private static final BigDecimal TAX_RATE = new BigDecimal("0.05"); // 5% GST
    private static final BigDecimal FREE_SHIPPING_THRESHOLD = new BigDecimal("999.00");
    private static final BigDecimal STANDARD_SHIPPING_FEE = new BigDecimal("99.00");
    private static final int MAX_ITEM_QUANTITY = 99;

    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public CartService(CartItemRepository cartItemRepository,
                       ProductRepository productRepository,
                       UserRepository userRepository) {
        this.cartItemRepository = cartItemRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public CartSummaryDTO getCart(String userEmail) {
        User user = getUser(userEmail);
        List<CartItem> items = cartItemRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
        return buildCartSummary(items);
    }

    public CartSummaryDTO addToCart(String userEmail, AddToCartRequest request) {
        if (request == null || request.getProductId() == null || request.getProductId().isBlank()) {
            throw new BadRequestException("Product ID is required.");
        }
        int quantityToAdd = request.getQuantity() != null && request.getQuantity() > 0 ? request.getQuantity() : 1;

        User user = getUser(userEmail);
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product with id '" + request.getProductId() + "' not found"));

        if (product.getStockQuantity() <= 0) {
            throw new BadRequestException("Product '" + product.getName() + "' is out of stock.");
        }

        Optional<CartItem> existingItemOpt = cartItemRepository.findByUserIdAndProductId(user.getId(), product.getId());
        if (existingItemOpt.isPresent()) {
            CartItem existing = existingItemOpt.get();
            int newQuantity = existing.getQuantity() + quantityToAdd;
            if (newQuantity > product.getStockQuantity()) {
                throw new BadRequestException("Cannot add " + quantityToAdd + " more unit(s). Only "
                        + product.getStockQuantity() + " available in stock (" + existing.getQuantity() + " already in cart).");
            }
            if (newQuantity > MAX_ITEM_QUANTITY) {
                throw new BadRequestException("Maximum allowed quantity per item is " + MAX_ITEM_QUANTITY + ".");
            }
            existing.setQuantity(newQuantity);
            cartItemRepository.save(existing);
        } else {
            if (quantityToAdd > product.getStockQuantity()) {
                throw new BadRequestException("Requested quantity (" + quantityToAdd + ") exceeds available stock ("
                        + product.getStockQuantity() + ").");
            }
            if (quantityToAdd > MAX_ITEM_QUANTITY) {
                throw new BadRequestException("Maximum allowed quantity per item is " + MAX_ITEM_QUANTITY + ".");
            }
            CartItem newItem = new CartItem(user, product, quantityToAdd);
            cartItemRepository.save(newItem);
        }

        return getCart(userEmail);
    }

    public CartSummaryDTO updateCartItemQuantity(String userEmail, String productId, int quantity) {
        if (quantity < 1) {
            throw new BadRequestException("Quantity must be at least 1. Use remove to delete item from cart.");
        }
        if (quantity > MAX_ITEM_QUANTITY) {
            throw new BadRequestException("Maximum allowed quantity per item is " + MAX_ITEM_QUANTITY + ".");
        }

        User user = getUser(userEmail);
        CartItem item = cartItemRepository.findByUserIdAndProductId(user.getId(), productId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item with product id '" + productId + "' not found."));

        if (quantity > item.getProduct().getStockQuantity()) {
            throw new BadRequestException("Requested quantity (" + quantity + ") exceeds available stock ("
                    + item.getProduct().getStockQuantity() + ").");
        }

        item.setQuantity(quantity);
        cartItemRepository.save(item);
        return getCart(userEmail);
    }

    public CartSummaryDTO removeCartItem(String userEmail, String productId) {
        User user = getUser(userEmail);
        cartItemRepository.deleteByUserIdAndProductId(user.getId(), productId);
        return getCart(userEmail);
    }

    public void clearCart(String userEmail) {
        User user = getUser(userEmail);
        cartItemRepository.deleteByUserId(user.getId());
    }

    private User getUser(String userEmail) {
        if (userEmail == null || userEmail.isBlank()) {
            throw new UnauthorizedException("Authentication is required to access shopping cart.");
        }
        return userRepository.findByEmailIgnoreCase(userEmail.trim())
                .orElseThrow(() -> new UnauthorizedException("User not found: " + userEmail));
    }

    private CartSummaryDTO buildCartSummary(List<CartItem> items) {
        List<CartItemDTO> itemDTOs = items.stream().map(item -> {
            Product p = item.getProduct();
            BigDecimal unitPrice = p.getPrice().setScale(2, RoundingMode.HALF_UP);
            BigDecimal originalPrice = p.getOriginalPrice() != null ? p.getOriginalPrice().setScale(2, RoundingMode.HALF_UP) : unitPrice;
            BigDecimal itemTotal = unitPrice.multiply(BigDecimal.valueOf(item.getQuantity())).setScale(2, RoundingMode.HALF_UP);
            boolean inStock = p.getStockQuantity() != null && p.getStockQuantity() > 0;
            String categoryName = p.getCategory() != null ? p.getCategory().getName() : "";

            return new CartItemDTO(
                    item.getId(),
                    p.getId(),
                    p.getName(),
                    p.getImageUrl(),
                    categoryName,
                    unitPrice,
                    originalPrice,
                    item.getQuantity(),
                    itemTotal,
                    inStock,
                    p.getStockQuantity()
            );
        }).collect(Collectors.toList());

        BigDecimal subtotal = itemDTOs.stream()
                .map(CartItemDTO::getItemTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .setScale(2, RoundingMode.HALF_UP);

        int totalItems = itemDTOs.stream().mapToInt(CartItemDTO::getQuantity).sum();
        int itemCount = itemDTOs.size();

        if (itemCount == 0 || subtotal.compareTo(BigDecimal.ZERO) == 0) {
            return new CartSummaryDTO(
                    itemDTOs,
                    0,
                    0,
                    BigDecimal.ZERO.setScale(2),
                    BigDecimal.ZERO.setScale(2),
                    BigDecimal.ZERO.setScale(2),
                    BigDecimal.ZERO.setScale(2),
                    FREE_SHIPPING_THRESHOLD,
                    BigDecimal.ZERO.setScale(2),
                    false
            );
        }

        BigDecimal tax = subtotal.multiply(TAX_RATE).setScale(2, RoundingMode.HALF_UP);
        boolean eligibleForFreeShipping = subtotal.compareTo(FREE_SHIPPING_THRESHOLD) >= 0;
        BigDecimal shippingFee = eligibleForFreeShipping ? BigDecimal.ZERO.setScale(2) : STANDARD_SHIPPING_FEE;
        BigDecimal amountNeeded = eligibleForFreeShipping
                ? BigDecimal.ZERO.setScale(2)
                : FREE_SHIPPING_THRESHOLD.subtract(subtotal).setScale(2, RoundingMode.HALF_UP);
        BigDecimal grandTotal = subtotal.add(tax).add(shippingFee).setScale(2, RoundingMode.HALF_UP);

        return new CartSummaryDTO(
                itemDTOs,
                totalItems,
                itemCount,
                subtotal,
                tax,
                shippingFee,
                grandTotal,
                FREE_SHIPPING_THRESHOLD,
                amountNeeded,
                eligibleForFreeShipping
        );
    }
}
