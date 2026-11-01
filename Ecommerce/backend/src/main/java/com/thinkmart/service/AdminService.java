package com.thinkmart.service;

import com.thinkmart.dto.AdminDashboardStatsDTO;
import com.thinkmart.dto.AdminProductRequest;
import com.thinkmart.dto.OrderResponseDTO;
import com.thinkmart.dto.ProductDetailDTO;
import com.thinkmart.dto.UpdateOrderStatusRequest;

import java.util.List;

public interface AdminService {

    AdminDashboardStatsDTO getDashboardStats();

    List<ProductDetailDTO> getAllProducts();

    ProductDetailDTO createProduct(AdminProductRequest request);

    ProductDetailDTO updateProduct(String id, AdminProductRequest request);

    void deleteProduct(String id);

    List<OrderResponseDTO> getAllOrders();

    OrderResponseDTO updateOrderStatus(String orderIdentifier, UpdateOrderStatusRequest request);
}

