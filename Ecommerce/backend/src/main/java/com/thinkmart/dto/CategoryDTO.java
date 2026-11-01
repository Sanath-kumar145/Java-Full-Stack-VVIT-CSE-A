package com.thinkmart.dto;

public class CategoryDTO {
    private Long id;
    private String name;
    private String slug;
    private String icon;
    private String description;
    private Integer displayOrder;

    public CategoryDTO() {
    }

    public CategoryDTO(Long id, String name, String slug, String icon, String description, Integer displayOrder) {
        this.id = id;
        this.name = name;
        this.slug = slug;
        this.icon = icon;
        this.description = description;
        this.displayOrder = displayOrder;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getSlug() {
        return slug;
    }

    public void setSlug(String slug) {
        this.slug = slug;
    }

    public String getIcon() {
        return icon;
    }

    public void setIcon(String icon) {
        this.icon = icon;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Integer getDisplayOrder() {
        return displayOrder;
    }

    public void setDisplayOrder(Integer displayOrder) {
        this.displayOrder = displayOrder;
    }
}

