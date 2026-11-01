package com.thinkmart;

import com.thinkmart.dto.PagedResponse;
import com.thinkmart.dto.ProductDetailDTO;
import com.thinkmart.dto.ProductSummaryDTO;
import com.thinkmart.entity.Category;
import com.thinkmart.entity.Product;
import com.thinkmart.exception.BadRequestException;
import com.thinkmart.exception.ResourceNotFoundException;
import com.thinkmart.repository.ProductRepository;
import com.thinkmart.service.impl.ProductServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ProductServiceTest {

    @Mock
    private ProductRepository productRepository;

    private ProductServiceImpl productService;

    private Category testCategory;
    private Product testProduct;

    @BeforeEach
    void setUp() {
        productService = new ProductServiceImpl(productRepository);
        testCategory = new Category(1L, "Laptops", "laptops", "💻", "Laptops description", 1);
        testProduct = new Product(
                "tm-laptop-01",
                "ThinkBook Pro 15 Laptop",
                "ThinkMart",
                testCategory,
                BigDecimal.valueOf(64990.00),
                BigDecimal.valueOf(79990.00),
                BigDecimal.valueOf(4.8),
                142,
                "https://example.com/laptop.jpg",
                "Intel Core i7 12th Gen, 16GB RAM",
                "18% OFF",
                true,
                45
        );
    }

    @Test
    void testGetProducts_Success() {
        Page<Product> page = new PageImpl<>(List.of(testProduct));
        when(productRepository.findAll(any(Specification.class), any(Pageable.class))).thenReturn(page);

        PagedResponse<ProductSummaryDTO> result = productService.getProducts("laptops", "thinkbook", "price-asc", 0, 12);

        assertNotNull(result);
        assertEquals(1, result.getContent().size());
        assertEquals("tm-laptop-01", result.getContent().get(0).getId());
        assertEquals("ThinkBook Pro 15 Laptop", result.getContent().get(0).getName());
        assertEquals("Laptops", result.getContent().get(0).getCategoryName());
        assertTrue(result.getContent().get(0).getInStock());
    }

    @Test
    void testGetProductById_Success() {
        when(productRepository.findByIdWithCategory("tm-laptop-01")).thenReturn(Optional.of(testProduct));

        ProductDetailDTO result = productService.getProductById("tm-laptop-01");

        assertNotNull(result);
        assertEquals("tm-laptop-01", result.getId());
        assertEquals(45, result.getStockQuantity());
        assertEquals(BigDecimal.valueOf(64990.00), result.getPrice());
    }

    @Test
    void testGetProductById_NotFound() {
        when(productRepository.findByIdWithCategory("tm-unknown")).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> productService.getProductById("tm-unknown"));
    }

    @Test
    void testGetProducts_InvalidPage() {
        assertThrows(BadRequestException.class, () -> productService.getProducts(null, null, "default", -1, 10));
    }

    @Test
    void testGetProducts_InvalidPageSize() {
        assertThrows(BadRequestException.class, () -> productService.getProducts(null, null, "default", 0, 150));
    }

    @Test
    void testGetProducts_InvalidSort() {
        assertThrows(BadRequestException.class, () -> productService.getProducts(null, null, "invalid-sort", 0, 10));
    }

    @Test
    void testGetFeaturedProducts() {
        when(productRepository.findFeaturedProducts()).thenReturn(List.of(testProduct));

        List<ProductSummaryDTO> featured = productService.getFeaturedProducts();

        assertEquals(1, featured.size());
        assertTrue(featured.get(0).getFeatured());
    }
}

