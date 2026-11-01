import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { WishlistPage } from '../pages/WishlistPage';
import * as api from '../services/api';
import { AuthProvider } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';
import { WishlistProvider } from '../context/WishlistContext';
import { User, WishlistSummary } from '../types';

const mockUser: User = {
  id: 2,
  fullName: 'Priya Patel',
  email: 'priya@thinkmart.in',
  role: 'ROLE_CUSTOMER',
};

const mockWishlist: WishlistSummary = {
  items: [
    {
      id: 201,
      productId: 'tm-laptop-01',
      productName: 'ThinkBook Pro 15 Laptop',
      productImage: 'https://example.com/laptop.jpg',
      categoryName: 'Laptops',
      price: 64990,
      originalPrice: 79990,
      rating: 4.8,
      reviewsCount: 142,
      stockQuantity: 25,
      inStock: true,
      discountTag: '18% OFF',
      addedAt: '2026-11-01T00:00:00Z',
    },
  ],
  totalItems: 1,
};

describe('WishlistPage Component', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('renders unauthenticated sign-in prompt when user is not logged in', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <WishlistPage />
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    );

    expect(screen.getByText('Sign In to Access Your Wishlist')).toBeInTheDocument();
  });

  it('renders empty wishlist state when user has 0 saved items', async () => {
    localStorage.setItem('thinkmart_token', 'mock-jwt-token');
    vi.spyOn(api, 'getCurrentUser').mockResolvedValue(mockUser);
    vi.spyOn(api, 'getWishlist').mockResolvedValue({ items: [], totalItems: 0 });

    render(
      <BrowserRouter>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <WishlistPage />
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    );

    expect(
      await screen.findByText('Your Wishlist is Empty', {}, { timeout: 3000 })
    ).toBeInTheDocument();
  });

  it('renders wishlist products with details and stock status', async () => {
    localStorage.setItem('thinkmart_token', 'mock-jwt-token');
    vi.spyOn(api, 'getCurrentUser').mockResolvedValue(mockUser);
    vi.spyOn(api, 'getWishlist').mockResolvedValue(mockWishlist);

    render(
      <BrowserRouter>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <WishlistPage />
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    );

    expect(await screen.findByText('ThinkBook Pro 15 Laptop')).toBeInTheDocument();
    expect(screen.getByText('1 item saved')).toBeInTheDocument();
    expect(screen.getByText('Move to Cart')).toBeInTheDocument();
    expect(screen.getByText(/In Stock \(25 units\)/i)).toBeInTheDocument();
  });

  it('moves item to cart when clicking Move to Cart button', async () => {
    localStorage.setItem('thinkmart_token', 'mock-jwt-token');
    vi.spyOn(api, 'getCurrentUser').mockResolvedValue(mockUser);
    vi.spyOn(api, 'getWishlist').mockResolvedValue(mockWishlist);

    const addToCartSpy = vi.spyOn(api, 'addToCart').mockResolvedValue({
      items: [],
      totalItems: 1,
      itemCount: 1,
      subtotal: 64990,
      tax: 3249.5,
      shippingFee: 0,
      grandTotal: 68239.5,
      freeShippingThreshold: 999,
      amountNeededForFreeShipping: 0,
      eligibleForFreeShipping: true,
    });
    const removeWishlistSpy = vi.spyOn(api, 'removeFromWishlist').mockResolvedValue({
      items: [],
      totalItems: 0,
    });

    render(
      <BrowserRouter>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <WishlistPage />
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    );

    expect(await screen.findByText('ThinkBook Pro 15 Laptop')).toBeInTheDocument();

    const moveBtn = screen.getByText('Move to Cart');
    fireEvent.click(moveBtn);

    await waitFor(() => {
      expect(addToCartSpy).toHaveBeenCalledWith({ productId: 'tm-laptop-01', quantity: 1 });
      expect(removeWishlistSpy).toHaveBeenCalledWith('tm-laptop-01');
    });
  });
});
