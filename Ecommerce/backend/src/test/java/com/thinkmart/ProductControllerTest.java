package com.thinkmart;

import com.thinkmart.controller.ProductController;
import com.thinkmart.dto.PagedResponse;
import com.thinkmart.dto.ProductDetailDTO;
import com.thinkmart.dto.ProductSummaryDTO;
import com.thinkmart.service.ProductService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ProductControllerTest {

    @Mock
    private ProductService productService;

    private ProductController productController;

    @BeforeEach
    void setUp() {
        productController = new ProductController(productService);
    }

    @Test
    void testGetProducts() {
        ProductSummaryDTO summary = new ProductSummaryDTO(
                "tm-laptop-01", "ThinkBook Pro 15", "ThinkMart", 1L, "Laptops", "laptops",
                BigDecimal.valueOf(64990), BigDecimal.valueOf(79990), BigDecimal.valueOf(4.8), 142,
                "https://example.com/laptop.jpg", "Description", "18% OFF", true, true
        );
        PagedResponse<ProductSummaryDTO> pagedResponse = new PagedResponse<>(
                List.of(summary), 0, 12, 1, 1, true
        );

        when(productService.getProducts("laptops", null, "price-asc", 0, 12)).thenReturn(pagedResponse);

        ResponseEntity<PagedResponse<ProductSummaryDTO>> response = productController.getProducts("laptops", null, "price-asc", 0, 12);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(1, response.getBody().getContent().size());
        assertEquals("tm-laptop-01", response.getBody().getContent().get(0).getId());
    }

    @Test
    void testGetFeaturedProducts() {
        ProductSummaryDTO summary = new ProductSummaryDTO(
                "tm-laptop-01", "ThinkBook Pro 15", "ThinkMart", 1L, "Laptops", "laptops",
                BigDecimal.valueOf(64990), BigDecimal.valueOf(79990), BigDecimal.valueOf(4.8), 142,
                "https://example.com/laptop.jpg", "Description", "18% OFF", true, true
        );

        when(productService.getFeaturedProducts()).thenReturn(List.of(summary));

        ResponseEntity<List<ProductSummaryDTO>> response = productController.getFeaturedProducts();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(1, response.getBody().size());
        assertTrue(response.getBody().get(0).getFeatured());
    }

    @Test
    void testGetProductById() {
        ProductDetailDTO detail = new ProductDetailDTO(
                "tm-laptop-01", "ThinkBook Pro 15", "ThinkMart", 1L, "Laptops", "laptops",
                BigDecimal.valueOf(64990), BigDecimal.valueOf(79990), BigDecimal.valueOf(4.8), 142,
                "https://example.com/laptop.jpg", "Description", "18% OFF", true, 45, true,
                Instant.now(), Instant.now()
        );

        when(productService.getProductById("tm-laptop-01")).thenReturn(detail);

        ResponseEntity<ProductDetailDTO> response = productController.getProductById("tm-laptop-01");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("tm-laptop-01", response.getBody().getId());
        assertEquals(45, response.getBody().getStockQuantity());
    }
}

