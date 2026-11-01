package com.thinkmart.service;

import com.thinkmart.dto.PagedResponse;
import com.thinkmart.dto.ProductDetailDTO;
import com.thinkmart.dto.ProductSummaryDTO;

import java.util.List;

public interface ProductService {

    PagedResponse<ProductSummaryDTO> getProducts(String category, String search, String sortBy, int page, int size);

    List<ProductSummaryDTO> getFeaturedProducts();

    ProductDetailDTO getProductById(String id);
}

