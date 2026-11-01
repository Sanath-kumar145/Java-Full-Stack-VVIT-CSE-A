package com.thinkmart.dto;

import java.util.Collections;
import java.util.List;

public class WishlistSummaryDTO {

    private List<WishlistItemDTO> items;
    private int totalItems;

    public WishlistSummaryDTO() {
        this.items = Collections.emptyList();
        this.totalItems = 0;
    }

    public WishlistSummaryDTO(List<WishlistItemDTO> items, int totalItems) {
        this.items = items != null ? items : Collections.emptyList();
        this.totalItems = totalItems;
    }

    public List<WishlistItemDTO> getItems() {
        return items;
    }

    public void setItems(List<WishlistItemDTO> items) {
        this.items = items;
    }

    public int getTotalItems() {
        return totalItems;
    }

    public void setTotalItems(int totalItems) {
        this.totalItems = totalItems;
    }
}

