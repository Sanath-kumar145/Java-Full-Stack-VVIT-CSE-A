import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ProductDetailPage } from '../pages/ProductDetailPage';
import * as api from '../services/api';
import { ProductDetail } from '../types';
import { AuthProvider } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';
import { WishlistProvider } from '../context/WishlistContext';

const mockProductDetail: ProductDetail = {
  id: 'tm-laptop-01',
  name: 'ThinkBook Pro 15 Laptop',
  brand: 'ThinkMart',
  categoryId: 1,
  categoryName: 'Laptops',
  categorySlug: 'laptops',
  price: 64990,
  originalPrice: 79990,
  rating: 4.8,
  reviewsCount: 142,
  imageUrl: 'https://example.com/laptop.jpg',
  description: 'Intel Core i7 12th Gen, 16GB RAM, 512GB SSD.',
  discountTag: '18% OFF',
  featured: true,
  stockQuantity: 45,
  inStock: true,
  createdAt: '2026-11-01T00:00:00Z',
  updatedAt: '2026-11-01T00:00:00Z',
};

describe('ProductDetailPage Component', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  const renderWithProviders = (initialEntry: string) => {
    return render(
      <MemoryRouter initialEntries={[initialEntry]}>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <Routes>
                <Route path="/products/:id" element={<ProductDetailPage />} />
              </Routes>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </MemoryRouter>
    );
  };

  it('renders product specifications and pricing', async () => {
    vi.spyOn(api, 'getProductById').mockResolvedValueOnce(mockProductDetail);

    renderWithProviders('/products/tm-laptop-01');

    expect(screen.getByText(/Fetching product specifications/i)).toBeInTheDocument();

    expect(await screen.findByRole('heading', { name: 'ThinkBook Pro 15 Laptop' })).toBeInTheDocument();
    expect(screen.getByText(/45 units available/i)).toBeInTheDocument();
    expect(screen.getByText(/Inclusive of 5% GST/i)).toBeInTheDocument();
    expect(screen.getByText(/Intel Core i7 12th Gen/i)).toBeInTheDocument();
  });

  it('handles quantity increment and decrement controls', async () => {
    vi.spyOn(api, 'getProductById').mockResolvedValueOnce(mockProductDetail);

    renderWithProviders('/products/tm-laptop-01');

    expect(await screen.findByRole('heading', { name: 'ThinkBook Pro 15 Laptop' })).toBeInTheDocument();

    const plusBtn = screen.getByText('+');
    const minusBtn = screen.getByText('-');

    fireEvent.click(plusBtn);
    expect(screen.getByText(/Add to Cart \(2\)/i)).toBeInTheDocument();

    fireEvent.click(minusBtn);
    expect(screen.getByText(/Add to Cart \(1\)/i)).toBeInTheDocument();
  });

  it('renders error state when product ID does not exist', async () => {
    vi.spyOn(api, 'getProductById').mockRejectedValueOnce(new Error('404 Not Found'));

    renderWithProviders('/products/unknown-product');

    expect(await screen.findByText(/Product Unavailable/i)).toBeInTheDocument();
    expect(screen.getByText(/Return to Catalogue/i)).toBeInTheDocument();
  });
});

