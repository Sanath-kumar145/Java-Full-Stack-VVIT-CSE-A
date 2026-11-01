import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { HomePage } from '../pages/HomePage';
import * as api from '../services/api';
import { Category, ProductSummary } from '../types';
import { AuthProvider } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';
import { WishlistProvider } from '../context/WishlistContext';

const mockCategories: Category[] = [
  { id: 1, name: 'Laptops', slug: 'laptops', icon: '💻', description: 'Gaming & Ultrabooks', displayOrder: 1 },
  { id: 2, name: 'Smartphones', slug: 'smartphones', icon: '📱', description: '5G phones', displayOrder: 2 },
];

const mockFeatured: ProductSummary[] = [
  {
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
    description: 'High performance laptop.',
    discountTag: '18% OFF',
    featured: true,
    inStock: true,
  },
];

describe('HomePage Component', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  const renderHomePage = () => {
    return render(
      <BrowserRouter>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <HomePage />
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    );
  };

  it('renders hero banner, benefits, and featured products', async () => {
    vi.spyOn(api, 'getCategories').mockResolvedValueOnce(mockCategories);
    vi.spyOn(api, 'getFeaturedProducts').mockResolvedValueOnce(mockFeatured);

    renderHomePage();

    expect(screen.getByText(/Upgrade Your Tech Lifestyle with/i)).toBeInTheDocument();
    expect(screen.getByText('Free Shipping')).toBeInTheDocument();
    expect(screen.getByText('100% Genuine')).toBeInTheDocument();
    expect(screen.getByText('7-Day Easy Return')).toBeInTheDocument();

    expect(await screen.findByText('ThinkBook Pro 15 Laptop')).toBeInTheDocument();
    expect(screen.getByText('Shop by Category')).toBeInTheDocument();
  });

  it('handles error gracefully when backend catalog is unavailable', async () => {
    vi.spyOn(api, 'getCategories').mockRejectedValueOnce(new Error('Connection Refused'));
    vi.spyOn(api, 'getFeaturedProducts').mockRejectedValueOnce(new Error('Connection Refused'));

    renderHomePage();

    expect(await screen.findByText(/Could not connect to ThinkMart catalog API/i)).toBeInTheDocument();
  });
});

