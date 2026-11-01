package com.thinkmart.repository;

import com.thinkmart.entity.Product;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, String>, JpaSpecificationExecutor<Product> {

    @Query("SELECT p FROM Product p JOIN FETCH p.category WHERE p.id = :id")
    Optional<Product> findByIdWithCategory(@Param("id") String id);

    @Query("SELECT p FROM Product p JOIN FETCH p.category WHERE p.featured = true ORDER BY p.rating DESC, p.reviewsCount DESC")
    List<Product> findFeaturedProducts();

    /**
     * Acquires a pessimistic write lock (SELECT ... FOR UPDATE) on the product row.
     * Guarantees serialized access during checkout, eliminating race conditions.
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT p FROM Product p WHERE p.id = :id")
    Optional<Product> findByIdForUpdate(@Param("id") String id);

    /**
     * Atomic database conditional decrement.
     * Enforces non-negative inventory directly at database engine level.
     * Returns 1 if decremented successfully, 0 if insufficient stock.
     */
    @Modifying
    @Query("UPDATE Product p SET p.stockQuantity = p.stockQuantity - :quantity WHERE p.id = :id AND p.stockQuantity >= :quantity")
    int decrementStockIfAvailable(@Param("id") String id, @Param("quantity") int quantity);

    long countByStockQuantityLessThanEqual(int threshold);

    @Query("SELECT p FROM Product p JOIN FETCH p.category ORDER BY p.createdAt DESC")
    List<Product> findAllWithCategoryOrderByCreatedAtDesc();
}

