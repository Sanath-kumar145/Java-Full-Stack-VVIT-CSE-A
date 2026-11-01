import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard';
import { ProductSummary } from '../types';
import { AuthProvider } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';
import { WishlistProvider } from '../context/WishlistContext';

const mockProduct: ProductSummary = {
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
  imageUrl: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=600&q=80',
  description: 'Intel Core i7 12th Gen, 16GB RAM, 512GB SSD.',
  discountTag: '18% OFF',
  featured: true,
  inStock: true,
};

describe('ProductCard Component', () => {
  it('renders product details correctly', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <ProductCard product={mockProduct} />
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    );

    expect(screen.getByText('ThinkBook Pro 15 Laptop')).toBeInTheDocument();
    expect(screen.getByText(/18% OFF/i)).toBeInTheDocument();
    expect(screen.getByText(/4.8/i)).toBeInTheDocument();
    expect(screen.getByText(/\(142 reviews\)/i)).toBeInTheDocument();
    expect(screen.getByText(/THINKMART • LAPTOPS/i)).toBeInTheDocument();

    const links = screen.getAllByRole('link');
    expect(links.some((l) => l.getAttribute('href') === '/products/tm-laptop-01')).toBe(true);
  });
});

