package com.thinkmart;

import com.thinkmart.controller.CategoryController;
import com.thinkmart.dto.CategoryDTO;
import com.thinkmart.service.CategoryService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class CategoryControllerTest {

    @Mock
    private CategoryService categoryService;

    private CategoryController categoryController;

    @BeforeEach
    void setUp() {
        categoryController = new CategoryController(categoryService);
    }

    @Test
    void testGetAllCategories() {
        CategoryDTO dto1 = new CategoryDTO(1L, "Laptops", "laptops", "💻", "Tech", 1);
        when(categoryService.getAllCategories()).thenReturn(List.of(dto1));

        ResponseEntity<List<CategoryDTO>> response = categoryController.getAllCategories();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(1, response.getBody().size());
        assertEquals("Laptops", response.getBody().get(0).getName());
    }

    @Test
    void testGetCategoryBySlug() {
        CategoryDTO dto = new CategoryDTO(1L, "Laptops", "laptops", "💻", "Tech", 1);
        when(categoryService.getCategoryBySlug("laptops")).thenReturn(dto);

        ResponseEntity<CategoryDTO> response = categoryController.getCategoryBySlug("laptops");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("laptops", response.getBody().getSlug());
    }
}

