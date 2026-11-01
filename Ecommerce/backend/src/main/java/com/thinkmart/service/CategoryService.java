package com.thinkmart.service;

import com.thinkmart.dto.CategoryDTO;
import java.util.List;

public interface CategoryService {

    List<CategoryDTO> getAllCategories();

    CategoryDTO getCategoryBySlug(String slug);
}

