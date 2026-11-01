package com.thinkmart.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class CreateOrderRequest {

    @NotBlank(message = "Customer name is required")
    @Size(max = 100, message = "Customer name must not exceed 100 characters")
    private String customerName;

    @NotBlank(message = "Customer phone number is required")
    @Pattern(regexp = "^[0-9+\\-\\s()]{10,20}$", message = "Please provide a valid contact phone number (10-20 digits)")
    private String customerPhone;

    @NotBlank(message = "Delivery address line 1 is required")
    @Size(max = 200, message = "Address line 1 must not exceed 200 characters")
    private String addressLine1;

    @Size(max = 200, message = "Address line 2 must not exceed 200 characters")
    private String addressLine2;

    @NotBlank(message = "City is required")
    @Size(max = 100, message = "City must not exceed 100 characters")
    private String city;

    @NotBlank(message = "State is required")
    @Size(max = 100, message = "State must not exceed 100 characters")
    private String state;

    @NotBlank(message = "Postal / PIN code is required")
    @Pattern(regexp = "^[0-9]{6}$", message = "PIN code must be a valid 6-digit Indian postal code")
    private String postalCode;

    @Size(max = 100, message = "Country must not exceed 100 characters")
    private String country = "India";

    private String paymentMethod = "Simulated UPI";

    private Boolean simulateFailure = false;

    @Size(max = 100, message = "Idempotency key must not exceed 100 characters")
    private String idempotencyKey;

    public CreateOrderRequest() {
    }

    public CreateOrderRequest(String customerName, String customerPhone, String addressLine1,
                              String addressLine2, String city, String state, String postalCode,
                              String country, String paymentMethod, Boolean simulateFailure) {
        this(customerName, customerPhone, addressLine1, addressLine2, city, state, postalCode, country, paymentMethod, simulateFailure, null);
    }

    public CreateOrderRequest(String customerName, String customerPhone, String addressLine1,
                              String addressLine2, String city, String state, String postalCode,
                              String country, String paymentMethod, Boolean simulateFailure,
                              String idempotencyKey) {
        this.customerName = customerName;
        this.customerPhone = customerPhone;
        this.addressLine1 = addressLine1;
        this.addressLine2 = addressLine2;
        this.city = city;
        this.state = state;
        this.postalCode = postalCode;
        this.country = country != null ? country : "India";
        this.paymentMethod = paymentMethod != null ? paymentMethod : "Simulated UPI";
        this.simulateFailure = simulateFailure != null ? simulateFailure : false;
        this.idempotencyKey = idempotencyKey;
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public String getCustomerPhone() {
        return customerPhone;
    }

    public void setCustomerPhone(String customerPhone) {
        this.customerPhone = customerPhone;
    }

    public String getAddressLine1() {
        return addressLine1;
    }

    public void setAddressLine1(String addressLine1) {
        this.addressLine1 = addressLine1;
    }

    public String getAddressLine2() {
        return addressLine2;
    }

    public void setAddressLine2(String addressLine2) {
        this.addressLine2 = addressLine2;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
    }

    public String getPostalCode() {
        return postalCode;
    }

    public void setPostalCode(String postalCode) {
        this.postalCode = postalCode;
    }

    public String getCountry() {
        return country;
    }

    public void setCountry(String country) {
        this.country = country;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public Boolean getSimulateFailure() {
        return simulateFailure;
    }

    public void setSimulateFailure(Boolean simulateFailure) {
        this.simulateFailure = simulateFailure;
    }

    public String getIdempotencyKey() {
        return idempotencyKey;
    }

    public void setIdempotencyKey(String idempotencyKey) {
        this.idempotencyKey = idempotencyKey;
    }
}

