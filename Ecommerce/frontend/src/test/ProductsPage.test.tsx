import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ProductsPage } from '../pages/ProductsPage';
import * as api from '../services/api';
import { ProductSummary, Category, PagedResponse } from '../types';
import { AuthProvider } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';
import { WishlistProvider } from '../context/WishlistContext';

const mockCategories: Category[] = [
  { id: 1, name: 'Laptops', slug: 'laptops', icon: '💻', description: 'Ultrabooks', displayOrder: 1 },
  { id: 2, name: 'Smartphones', slug: 'smartphones', icon: '📱', description: '5G phones', displayOrder: 2 },
];

const mockProducts: ProductSummary[] = [
  {
    id: 'tm-laptop-01',
    name: 'ThinkBook Pro 15',
    brand: 'ThinkMart',
    categoryId: 1,
    categoryName: 'Laptops',
    categorySlug: 'laptops',
    price: 64990,
    originalPrice: 79990,
    rating: 4.8,
    reviewsCount: 142,
    imageUrl: 'https://example.com/laptop.jpg',
    description: 'High performance laptop.',
    discountTag: '18% OFF',
    featured: true,
    inStock: true,
  },
  {
    id: 'tm-phone-01',
    name: 'Galaxy S24 Ultra',
    brand: 'Samsung',
    categoryId: 2,
    categoryName: 'Smartphones',
    categorySlug: 'smartphones',
    price: 119999,
    originalPrice: 134999,
    rating: 4.9,
    reviewsCount: 215,
    imageUrl: 'https://example.com/phone.jpg',
    description: 'Flagship phone.',
    discountTag: '11% OFF',
    featured: true,
    inStock: true,
  },
];

const mockPagedResponse: PagedResponse<ProductSummary> = {
  content: mockProducts,
  pageNumber: 0,
  pageSize: 12,
  totalElements: 2,
  totalPages: 1,
  last: true,
};

describe('ProductsPage Component', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  const renderProductsPage = () => {
    return render(
      <BrowserRouter>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <ProductsPage />
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    );
  };

  it('renders product catalog and category pills on initial load', async () => {
    vi.spyOn(api, 'getCategories').mockResolvedValueOnce(mockCategories);
    vi.spyOn(api, 'getProducts').mockResolvedValueOnce(mockPagedResponse);

    renderProductsPage();

    expect(screen.getByText(/Retrieving ThinkMart products/i)).toBeInTheDocument();

    expect(await screen.findByText('ThinkBook Pro 15')).toBeInTheDocument();
    expect(screen.getByText('Galaxy S24 Ultra')).toBeInTheDocument();
    expect(screen.getByText('💻')).toBeInTheDocument();
    expect(screen.getByText('Laptops')).toBeInTheDocument();
    expect(screen.getByText('Smartphones')).toBeInTheDocument();
    expect(screen.getByText(/Showing 2 of 2 products/i)).toBeInTheDocument();
  });

  it('displays error message when API call fails', async () => {
    vi.spyOn(api, 'getCategories').mockResolvedValueOnce(mockCategories);
    vi.spyOn(api, 'getProducts').mockRejectedValueOnce(new Error('Network Error'));

    renderProductsPage();

    expect(await screen.findByText(/Unable to fetch ThinkMart products from backend/i)).toBeInTheDocument();
  });

  it('displays empty state when zero products match the filter', async () => {
    vi.spyOn(api, 'getCategories').mockResolvedValueOnce(mockCategories);
    vi.spyOn(api, 'getProducts').mockResolvedValueOnce({
      content: [],
      pageNumber: 0,
      pageSize: 12,
      totalElements: 0,
      totalPages: 0,
      last: true,
    });

    renderProductsPage();

    expect(await screen.findByText(/No matching products found/i)).toBeInTheDocument();
  });

  it('renders pagination buttons when multiple pages exist', async () => {
    vi.spyOn(api, 'getCategories').mockResolvedValueOnce(mockCategories);
    vi.spyOn(api, 'getProducts').mockResolvedValueOnce({
      content: mockProducts,
      pageNumber: 0,
      pageSize: 2,
      totalElements: 6,
      totalPages: 3,
      last: false,
    });

    renderProductsPage();

    await waitFor(() => {
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
    });
  });
});

