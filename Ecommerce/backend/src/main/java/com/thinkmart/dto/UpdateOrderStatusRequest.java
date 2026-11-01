package com.thinkmart.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public class UpdateOrderStatusRequest {

    @NotBlank(message = "Order status is required")
    @Pattern(regexp = "^(PROCESSING|SHIPPED|DELIVERED|CANCELLED)$", message = "Status must be PROCESSING, SHIPPED, DELIVERED, or CANCELLED")
    private String status;

    public UpdateOrderStatusRequest() {
    }

    public UpdateOrderStatusRequest(String status) {
        this.status = status;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}

