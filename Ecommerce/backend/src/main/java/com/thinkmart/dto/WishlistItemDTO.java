package com.thinkmart.dto;

import java.math.BigDecimal;
import java.time.Instant;

public class WishlistItemDTO {

    private Long id;
    private String productId;
    private String productName;
    private String productImage;
    private String categoryName;
    private BigDecimal price;
    private BigDecimal originalPrice;
    private BigDecimal rating;
    private Integer reviewsCount;
    private Integer stockQuantity;
    private boolean inStock;
    private String discountTag;
    private Instant addedAt;

    public WishlistItemDTO() {
    }

    public WishlistItemDTO(Long id, String productId, String productName, String productImage,
                           String categoryName, BigDecimal price, BigDecimal originalPrice,
                           BigDecimal rating, Integer reviewsCount, Integer stockQuantity,
                           boolean inStock, String discountTag, Instant addedAt) {
        this.id = id;
        this.productId = productId;
        this.productName = productName;
        this.productImage = productImage;
        this.categoryName = categoryName;
        this.price = price;
        this.originalPrice = originalPrice;
        this.rating = rating;
        this.reviewsCount = reviewsCount;
        this.stockQuantity = stockQuantity;
        this.inStock = inStock;
        this.discountTag = discountTag;
        this.addedAt = addedAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getProductId() {
        return productId;
    }

    public void setProductId(String productId) {
        this.productId = productId;
    }

    public String getProductName() {
        return productName;
    }

    public void setProductName(String productName) {
        this.productName = productName;
    }

    public String getProductImage() {
        return productImage;
    }

    public void setProductImage(String productImage) {
        this.productImage = productImage;
    }

    public String getCategoryName() {
        return categoryName;
    }

    public void setCategoryName(String categoryName) {
        this.categoryName = categoryName;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public BigDecimal getOriginalPrice() {
        return originalPrice;
    }

    public void setOriginalPrice(BigDecimal originalPrice) {
        this.originalPrice = originalPrice;
    }

    public BigDecimal getRating() {
        return rating;
    }

    public void setRating(BigDecimal rating) {
        this.rating = rating;
    }

    public Integer getReviewsCount() {
        return reviewsCount;
    }

    public void setReviewsCount(Integer reviewsCount) {
        this.reviewsCount = reviewsCount;
    }

    public Integer getStockQuantity() {
        return stockQuantity;
    }

    public void setStockQuantity(Integer stockQuantity) {
        this.stockQuantity = stockQuantity;
    }

    public boolean isInStock() {
        return inStock;
    }

    public void setInStock(boolean inStock) {
        this.inStock = inStock;
    }

    public String getDiscountTag() {
        return discountTag;
    }

    public void setDiscountTag(String discountTag) {
        this.discountTag = discountTag;
    }

    public Instant getAddedAt() {
        return addedAt;
    }

    public void setAddedAt(Instant addedAt) {
        this.addedAt = addedAt;
    }
}

