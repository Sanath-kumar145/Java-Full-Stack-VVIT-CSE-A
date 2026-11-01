package com.thinkmart.dto;

import java.math.BigDecimal;

public class ProductSummaryDTO {
    private String id;
    private String name;
    private String brand;
    private Long categoryId;
    private String categoryName;
    private String categorySlug;
    private BigDecimal price;
    private BigDecimal originalPrice;
    private BigDecimal rating;
    private Integer reviewsCount;
    private String imageUrl;
    private String description;
    private String discountTag;
    private Boolean featured;
    private Boolean inStock;

    public ProductSummaryDTO() {
    }

    public ProductSummaryDTO(String id, String name, String brand, Long categoryId,
                             String categoryName, String categorySlug, BigDecimal price,
                             BigDecimal originalPrice, BigDecimal rating, Integer reviewsCount,
                             String imageUrl, String description, String discountTag,
                             Boolean featured, Boolean inStock) {
        this.id = id;
        this.name = name;
        this.brand = brand;
        this.categoryId = categoryId;
        this.categoryName = categoryName;
        this.categorySlug = categorySlug;
        this.price = price;
        this.originalPrice = originalPrice;
        this.rating = rating;
        this.reviewsCount = reviewsCount;
        this.imageUrl = imageUrl;
        this.description = description;
        this.discountTag = discountTag;
        this.featured = featured;
        this.inStock = inStock;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getBrand() {
        return brand;
    }

    public void setBrand(String brand) {
        this.brand = brand;
    }

    public Long getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Long categoryId) {
        this.categoryId = categoryId;
    }

    public String getCategoryName() {
        return categoryName;
    }

    public void setCategoryName(String categoryName) {
        this.categoryName = categoryName;
    }

    public String getCategorySlug() {
        return categorySlug;
    }

    public void setCategorySlug(String categorySlug) {
        this.categorySlug = categorySlug;
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

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getDiscountTag() {
        return discountTag;
    }

    public void setDiscountTag(String discountTag) {
        this.discountTag = discountTag;
    }

    public Boolean getFeatured() {
        return featured;
    }

    public void setFeatured(Boolean featured) {
        this.featured = featured;
    }

    public Boolean getInStock() {
        return inStock;
    }

    public void setInStock(Boolean inStock) {
        this.inStock = inStock;
    }
}

