import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { CartPage } from '../pages/CartPage';
import * as api from '../services/api';
import { AuthProvider } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';
import { WishlistProvider } from '../context/WishlistContext';
import { CartSummary, User } from '../types';

const mockUser: User = {
  id: 1,
  fullName: 'Rahul Sharma',
  email: 'rahul@thinkmart.in',
  role: 'ROLE_CUSTOMER',
};

const mockCart: CartSummary = {
  items: [
    {
      id: 101,
      productId: 'tm-phone-01',
      productName: 'Galaxy S24 Ultra',
      productImage: 'https://example.com/phone.jpg',
      categoryName: 'Smartphones',
      unitPrice: 1000,
      originalPrice: 1200,
      quantity: 2,
      itemTotal: 2000,
      inStock: true,
      availableStock: 10,
    },
  ],
  totalItems: 2,
  itemCount: 1,
  subtotal: 2000,
  tax: 100, // 5% GST of 2000
  shippingFee: 0, // >= 999 qualifies for free shipping
  grandTotal: 2100,
  freeShippingThreshold: 999,
  amountNeededForFreeShipping: 0,
  eligibleForFreeShipping: true,
};

describe('CartPage Component', () => {
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
              <CartPage />
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    );

    expect(screen.getByText('Sign In to Access Your Cart')).toBeInTheDocument();
    expect(screen.getByText('Sign In Now')).toBeInTheDocument();
  });

  it('renders empty cart state when user has zero items', async () => {
    localStorage.setItem('thinkmart_token', 'mock-jwt-token');
    vi.spyOn(api, 'getCurrentUser').mockResolvedValue(mockUser);
    vi.spyOn(api, 'getCart').mockResolvedValue({
      items: [],
      totalItems: 0,
      itemCount: 0,
      subtotal: 0,
      tax: 0,
      shippingFee: 0,
      grandTotal: 0,
      freeShippingThreshold: 999,
      amountNeededForFreeShipping: 0,
      eligibleForFreeShipping: false,
    });

    render(
      <BrowserRouter>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <CartPage />
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    );

    expect(
      await screen.findByText('Your Shopping Cart is Empty', {}, { timeout: 3000 })
    ).toBeInTheDocument();
    expect(screen.getByText('Explore Catalog')).toBeInTheDocument();
  });

  it('renders cart items and correct subtotal, tax, and free shipping breakdown', async () => {
    localStorage.setItem('thinkmart_token', 'mock-jwt-token');
    vi.spyOn(api, 'getCurrentUser').mockResolvedValue(mockUser);
    vi.spyOn(api, 'getCart').mockResolvedValue(mockCart);

    render(
      <BrowserRouter>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <CartPage />
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    );

    expect(await screen.findByText('Galaxy S24 Ultra')).toBeInTheDocument();
    expect(screen.getByText('2 items in cart')).toBeInTheDocument();
    expect(screen.getByText(/You have unlocked FREE Express Pan-India Delivery/i)).toBeInTheDocument();
    expect(screen.getByText('FREE')).toBeInTheDocument();
    expect(screen.getByText('Order Summary')).toBeInTheDocument();
  });

  it('triggers item quantity update and removal calls', async () => {
    localStorage.setItem('thinkmart_token', 'mock-jwt-token');
    vi.spyOn(api, 'getCurrentUser').mockResolvedValue(mockUser);
    vi.spyOn(api, 'getCart').mockResolvedValue(mockCart);
    const updateSpy = vi.spyOn(api, 'updateCartItemQuantity').mockResolvedValue({
      ...mockCart,
      items: [{ ...mockCart.items[0], quantity: 3, itemTotal: 3000 }],
      totalItems: 3,
      subtotal: 3000,
      grandTotal: 3150,
    });

    render(
      <BrowserRouter>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <CartPage />
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    );

    expect(await screen.findByText('Galaxy S24 Ultra')).toBeInTheDocument();

    const plusBtn = screen.getByLabelText('Increase quantity');
    fireEvent.click(plusBtn);

    await waitFor(() => {
      expect(updateSpy).toHaveBeenCalledWith('tm-phone-01', { quantity: 3 });
    });
  });
});
