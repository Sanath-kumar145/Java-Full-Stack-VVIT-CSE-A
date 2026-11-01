package com.thinkmart.service.impl;

import com.thinkmart.dto.PagedResponse;
import com.thinkmart.dto.ProductDetailDTO;
import com.thinkmart.dto.ProductSummaryDTO;
import com.thinkmart.entity.Product;
import com.thinkmart.exception.BadRequestException;
import com.thinkmart.exception.ResourceNotFoundException;
import com.thinkmart.repository.ProductRepository;
import com.thinkmart.service.ProductService;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class ProductServiceImpl implements ProductService {

    private static final Set<String> ALLOWED_SORT_FIELDS = Set.of(
            "price-asc", "price-desc", "rating", "name", "newest", "default"
    );

    private final ProductRepository productRepository;

    public ProductServiceImpl(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @Override
    public PagedResponse<ProductSummaryDTO> getProducts(String category, String search, String sortBy, int page, int size) {
        // Validate pagination arguments
        if (page < 0) {
            throw new BadRequestException("Page index must not be less than zero.");
        }
        if (size < 1 || size > 100) {
            throw new BadRequestException("Page size must be between 1 and 100.");
        }

        // Validate and determine sort order
        Sort sort = resolveSort(sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);

        // Build dynamic JPA Specification
        Specification<Product> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (category != null && !category.trim().isEmpty()) {
                String catQuery = category.trim().toLowerCase();
                Predicate slugMatch = cb.equal(cb.lower(root.get("category").get("slug")), catQuery);
                Predicate nameMatch = cb.equal(cb.lower(root.get("category").get("name")), catQuery);
                predicates.add(cb.or(slugMatch, nameMatch));
            }

            if (search != null && !search.trim().isEmpty()) {
                String searchPattern = "%" + search.trim().toLowerCase() + "%";
                Predicate nameLike = cb.like(cb.lower(root.get("name")), searchPattern);
                Predicate brandLike = cb.like(cb.lower(root.get("brand")), searchPattern);
                Predicate descLike = cb.like(cb.lower(root.get("description")), searchPattern);
                predicates.add(cb.or(nameLike, brandLike, descLike));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<Product> productPage = productRepository.findAll(spec, pageable);

        List<ProductSummaryDTO> content = productPage.getContent().stream()
                .map(this::mapToSummaryDTO)
                .collect(Collectors.toList());

        return new PagedResponse<>(
                content,
                productPage.getNumber(),
                productPage.getSize(),
                productPage.getTotalElements(),
                productPage.getTotalPages(),
                productPage.isLast()
        );
    }

    @Override
    public List<ProductSummaryDTO> getFeaturedProducts() {
        return productRepository.findFeaturedProducts().stream()
                .map(this::mapToSummaryDTO)
                .collect(Collectors.toList());
    }

    @Override
    public ProductDetailDTO getProductById(String id) {
        if (id == null || id.trim().isEmpty()) {
            throw new BadRequestException("Product ID cannot be null or empty.");
        }

        Product product = productRepository.findByIdWithCategory(id.trim())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + id));

        return mapToDetailDTO(product);
    }

    private Sort resolveSort(String sortBy) {
        if (sortBy == null || sortBy.trim().isEmpty() || "default".equalsIgnoreCase(sortBy.trim())) {
            return Sort.by(Sort.Direction.ASC, "name");
        }

        String sortKey = sortBy.trim().toLowerCase();
        if (!ALLOWED_SORT_FIELDS.contains(sortKey)) {
            throw new BadRequestException("Unsupported sort parameter: '" + sortBy + "'. Allowed values are: " + String.join(", ", ALLOWED_SORT_FIELDS));
        }

        switch (sortKey) {
            case "price-asc":
                return Sort.by(Sort.Direction.ASC, "price");
            case "price-desc":
                return Sort.by(Sort.Direction.DESC, "price");
            case "rating":
                return Sort.by(Sort.Direction.DESC, "rating").and(Sort.by(Sort.Direction.DESC, "reviewsCount"));
            case "name":
                return Sort.by(Sort.Direction.ASC, "name");
            case "newest":
                return Sort.by(Sort.Direction.DESC, "createdAt");
            default:
                return Sort.by(Sort.Direction.ASC, "name");
        }
    }

    private ProductSummaryDTO mapToSummaryDTO(Product p) {
        boolean inStock = p.getStockQuantity() != null && p.getStockQuantity() > 0;
        return new ProductSummaryDTO(
                p.getId(),
                p.getName(),
                p.getBrand(),
                p.getCategory() != null ? p.getCategory().getId() : null,
                p.getCategory() != null ? p.getCategory().getName() : null,
                p.getCategory() != null ? p.getCategory().getSlug() : null,
                p.getPrice(),
                p.getOriginalPrice(),
                p.getRating(),
                p.getReviewsCount(),
                p.getImageUrl(),
                p.getDescription(),
                p.getDiscountTag(),
                p.getFeatured(),
                inStock
        );
    }

    private ProductDetailDTO mapToDetailDTO(Product p) {
        boolean inStock = p.getStockQuantity() != null && p.getStockQuantity() > 0;
        return new ProductDetailDTO(
                p.getId(),
                p.getName(),
                p.getBrand(),
                p.getCategory() != null ? p.getCategory().getId() : null,
                p.getCategory() != null ? p.getCategory().getName() : null,
                p.getCategory() != null ? p.getCategory().getSlug() : null,
                p.getPrice(),
                p.getOriginalPrice(),
                p.getRating(),
                p.getReviewsCount(),
                p.getImageUrl(),
                p.getDescription(),
                p.getDiscountTag(),
                p.getFeatured(),
                p.getStockQuantity(),
                inStock,
                p.getCreatedAt(),
                p.getUpdatedAt()
        );
    }
}

