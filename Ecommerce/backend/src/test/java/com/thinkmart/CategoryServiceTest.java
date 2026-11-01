package com.thinkmart;

import com.thinkmart.dto.CategoryDTO;
import com.thinkmart.entity.Category;
import com.thinkmart.exception.ResourceNotFoundException;
import com.thinkmart.repository.CategoryRepository;
import com.thinkmart.service.impl.CategoryServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class CategoryServiceTest {

    @Mock
    private CategoryRepository categoryRepository;

    private CategoryServiceImpl categoryService;

    @BeforeEach
    void setUp() {
        categoryService = new CategoryServiceImpl(categoryRepository);
    }

    @Test
    void testGetAllCategories() {
        Category cat1 = new Category(1L, "Laptops", "laptops", "💻", "High performance", 1);
        Category cat2 = new Category(2L, "Smartphones", "smartphones", "📱", "5G phones", 2);

        when(categoryRepository.findAllByOrderByDisplayOrderAsc()).thenReturn(List.of(cat1, cat2));

        List<CategoryDTO> result = categoryService.getAllCategories();

        assertEquals(2, result.size());
        assertEquals("Laptops", result.get(0).getName());
        assertEquals("smartphones", result.get(1).getSlug());
        verify(categoryRepository, times(1)).findAllByOrderByDisplayOrderAsc();
    }

    @Test
    void testGetCategoryBySlug_Success() {
        Category cat = new Category(1L, "Laptops", "laptops", "💻", "High performance", 1);
        when(categoryRepository.findBySlugIgnoreCase("laptops")).thenReturn(Optional.of(cat));

        CategoryDTO result = categoryService.getCategoryBySlug("laptops");

        assertNotNull(result);
        assertEquals("Laptops", result.getName());
        assertEquals("laptops", result.getSlug());
    }

    @Test
    void testGetCategoryBySlug_NotFound() {
        when(categoryRepository.findBySlugIgnoreCase("unknown")).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> categoryService.getCategoryBySlug("unknown"));
    }
}

