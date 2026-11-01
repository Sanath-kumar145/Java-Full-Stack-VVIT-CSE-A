import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { CartProvider, useCart } from '../context/CartContext';
import { AuthProvider } from '../context/AuthContext';
import * as api from '../services/api';
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
      id: 10,
      productId: 'prod-01',
      productName: 'ThinkPhone',
      productImage: 'https://img.jpg',
      categoryName: 'Phones',
      unitPrice: 500,
      originalPrice: 600,
      quantity: 1,
      itemTotal: 500,
      inStock: true,
      availableStock: 20,
    },
  ],
  totalItems: 1,
  itemCount: 1,
  subtotal: 500,
  tax: 25,
  shippingFee: 99,
  grandTotal: 624,
  freeShippingThreshold: 999,
  amountNeededForFreeShipping: 499,
  eligibleForFreeShipping: false,
};

describe('CartContext and State Management', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <AuthProvider>
      <CartProvider>{children}</CartProvider>
    </AuthProvider>
  );

  it('initializes with null cart when unauthenticated', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    expect(result.current.cart).toBeNull();
    expect(result.current.totalItems).toBe(0);
    expect(result.current.itemCount).toBe(0);
  });

  it('rejects adding to cart when user is not authenticated', async () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    await expect(result.current.addToCart('prod-01', 1)).rejects.toThrow(
      'Please sign in to add products to your cart.'
    );
  });

  it('loads cart automatically when token is present', async () => {
    localStorage.setItem('thinkmart_token', 'valid-token');
    vi.spyOn(api, 'getCurrentUser').mockResolvedValue(mockUser);
    vi.spyOn(api, 'getCart').mockResolvedValue(mockCart);

    const { result } = renderHook(() => useCart(), { wrapper });

    await act(async () => {
      await result.current.refreshCart();
    });

    expect(result.current.cart).toEqual(mockCart);
    expect(result.current.totalItems).toBe(1);
    expect(result.current.itemCount).toBe(1);
  });

  it('updates cart state after addToCart call', async () => {
    localStorage.setItem('thinkmart_token', 'valid-token');
    vi.spyOn(api, 'getCurrentUser').mockResolvedValue(mockUser);
    vi.spyOn(api, 'getCart').mockResolvedValue(mockCart);

    const updatedCart: CartSummary = {
      ...mockCart,
      items: [{ ...mockCart.items[0], quantity: 2, itemTotal: 1000 }],
      totalItems: 2,
      subtotal: 1000,
      tax: 50,
      shippingFee: 0,
      grandTotal: 1050,
      eligibleForFreeShipping: true,
      amountNeededForFreeShipping: 0,
    };
    vi.spyOn(api, 'addToCart').mockResolvedValue(updatedCart);

    const { result } = renderHook(() => useCart(), { wrapper });

    await act(async () => {
      await result.current.refreshCart();
    });

    await act(async () => {
      const res = await result.current.addToCart('prod-01', 1);
      expect(res).toEqual(updatedCart);
    });

    expect(result.current.cart?.totalItems).toBe(2);
    expect(result.current.cart?.eligibleForFreeShipping).toBe(true);
  });

  it('clears cart state on clearCart call', async () => {
    localStorage.setItem('thinkmart_token', 'valid-token');
    vi.spyOn(api, 'getCurrentUser').mockResolvedValue(mockUser);
    vi.spyOn(api, 'getCart').mockResolvedValue(mockCart);
    vi.spyOn(api, 'clearCart').mockResolvedValue();

    const { result } = renderHook(() => useCart(), { wrapper });

    await act(async () => {
      await result.current.refreshCart();
    });

    await act(async () => {
      await result.current.clearCart();
    });

    expect(result.current.cart?.items).toEqual([]);
    expect(result.current.totalItems).toBe(0);
    expect(result.current.cart?.subtotal).toBe(0);
  });
});
