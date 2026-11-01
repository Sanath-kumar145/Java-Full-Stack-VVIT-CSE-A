package com.thinkmart.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

public class OrderSummaryDTO {

    private Long id;
    private String orderNumber;
    private BigDecimal totalAmount;
    private String orderStatus;
    private String paymentMethod;
    private String paymentStatus;
    private Instant createdAt;
    private Integer totalItems;
    private Integer distinctItemCount;
    private List<OrderItemDTO> items = new ArrayList<>();

    public OrderSummaryDTO() {
    }

    public OrderSummaryDTO(Long id, String orderNumber, BigDecimal totalAmount, String orderStatus,
                           String paymentMethod, String paymentStatus, Instant createdAt,
                           Integer totalItems, Integer distinctItemCount, List<OrderItemDTO> items) {
        this.id = id;
        this.orderNumber = orderNumber;
        this.totalAmount = totalAmount;
        this.orderStatus = orderStatus;
        this.paymentMethod = paymentMethod;
        this.paymentStatus = paymentStatus;
        this.createdAt = createdAt;
        this.totalItems = totalItems;
        this.distinctItemCount = distinctItemCount;
        this.items = items != null ? items : new ArrayList<>();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getOrderNumber() {
        return orderNumber;
    }

    public void setOrderNumber(String orderNumber) {
        this.orderNumber = orderNumber;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }

    public String getOrderStatus() {
        return orderStatus;
    }

    public void setOrderStatus(String orderStatus) {
        this.orderStatus = orderStatus;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public String getPaymentStatus() {
        return paymentStatus;
    }

    public void setPaymentStatus(String paymentStatus) {
        this.paymentStatus = paymentStatus;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Integer getTotalItems() {
        return totalItems;
    }

    public void setTotalItems(Integer totalItems) {
        this.totalItems = totalItems;
    }

    public Integer getDistinctItemCount() {
        return distinctItemCount;
    }

    public void setDistinctItemCount(Integer distinctItemCount) {
        this.distinctItemCount = distinctItemCount;
    }

    public List<OrderItemDTO> getItems() {
        return items;
    }

    public void setItems(List<OrderItemDTO> items) {
        this.items = items;
    }
}

