package com.thinkmart.repository;

import com.thinkmart.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {

    List<Category> findAllByOrderByDisplayOrderAsc();

    Optional<Category> findBySlugIgnoreCase(String slug);

    Optional<Category> findByNameIgnoreCase(String name);
}

