package com.thinkmart.dto;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;

public class CartSummaryDTO {

    private List<CartItemDTO> items;
    private int totalItems;
    private int itemCount;
    private BigDecimal subtotal;
    private BigDecimal tax;
    private BigDecimal shippingFee;
    private BigDecimal grandTotal;
    private BigDecimal freeShippingThreshold;
    private BigDecimal amountNeededForFreeShipping;
    private boolean eligibleForFreeShipping;

    public CartSummaryDTO() {
        this.items = Collections.emptyList();
        this.totalItems = 0;
        this.itemCount = 0;
        this.subtotal = BigDecimal.ZERO.setScale(2);
        this.tax = BigDecimal.ZERO.setScale(2);
        this.shippingFee = BigDecimal.ZERO.setScale(2);
        this.grandTotal = BigDecimal.ZERO.setScale(2);
        this.freeShippingThreshold = new BigDecimal("999.00");
        this.amountNeededForFreeShipping = BigDecimal.ZERO.setScale(2);
        this.eligibleForFreeShipping = false;
    }

    public CartSummaryDTO(List<CartItemDTO> items, int totalItems, int itemCount,
                          BigDecimal subtotal, BigDecimal tax, BigDecimal shippingFee,
                          BigDecimal grandTotal, BigDecimal freeShippingThreshold,
                          BigDecimal amountNeededForFreeShipping, boolean eligibleForFreeShipping) {
        this.items = items != null ? items : Collections.emptyList();
        this.totalItems = totalItems;
        this.itemCount = itemCount;
        this.subtotal = subtotal;
        this.tax = tax;
        this.shippingFee = shippingFee;
        this.grandTotal = grandTotal;
        this.freeShippingThreshold = freeShippingThreshold;
        this.amountNeededForFreeShipping = amountNeededForFreeShipping;
        this.eligibleForFreeShipping = eligibleForFreeShipping;
    }

    public List<CartItemDTO> getItems() {
        return items;
    }

    public void setItems(List<CartItemDTO> items) {
        this.items = items;
    }

    public int getTotalItems() {
        return totalItems;
    }

    public void setTotalItems(int totalItems) {
        this.totalItems = totalItems;
    }

    public int getItemCount() {
        return itemCount;
    }

    public void setItemCount(int itemCount) {
        this.itemCount = itemCount;
    }

    public BigDecimal getSubtotal() {
        return subtotal;
    }

    public void setSubtotal(BigDecimal subtotal) {
        this.subtotal = subtotal;
    }

    public BigDecimal getTax() {
        return tax;
    }

    public void setTax(BigDecimal tax) {
        this.tax = tax;
    }

    public BigDecimal getShippingFee() {
        return shippingFee;
    }

    public void setShippingFee(BigDecimal shippingFee) {
        this.shippingFee = shippingFee;
    }

    public BigDecimal getGrandTotal() {
        return grandTotal;
    }

    public void setGrandTotal(BigDecimal grandTotal) {
        this.grandTotal = grandTotal;
    }

    public BigDecimal getFreeShippingThreshold() {
        return freeShippingThreshold;
    }

    public void setFreeShippingThreshold(BigDecimal freeShippingThreshold) {
        this.freeShippingThreshold = freeShippingThreshold;
    }

    public BigDecimal getAmountNeededForFreeShipping() {
        return amountNeededForFreeShipping;
    }

    public void setAmountNeededForFreeShipping(BigDecimal amountNeededForFreeShipping) {
        this.amountNeededForFreeShipping = amountNeededForFreeShipping;
    }

    public boolean isEligibleForFreeShipping() {
        return eligibleForFreeShipping;
    }

    public void setEligibleForFreeShipping(boolean eligibleForFreeShipping) {
        this.eligibleForFreeShipping = eligibleForFreeShipping;
    }
}

