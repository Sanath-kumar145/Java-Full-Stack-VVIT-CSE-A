import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { WishlistProvider, useWishlist } from '../context/WishlistContext';
import { AuthProvider } from '../context/AuthContext';
import * as api from '../services/api';
import { WishlistSummary, User } from '../types';

const mockUser: User = {
  id: 1,
  fullName: 'Priya Patel',
  email: 'priya@thinkmart.in',
  role: 'ROLE_CUSTOMER',
};

const mockWishlist: WishlistSummary = {
  items: [
    {
      id: 20,
      productId: 'prod-laptop-01',
      productName: 'ThinkBook',
      productImage: 'https://img.jpg',
      categoryName: 'Laptops',
      price: 65000,
      originalPrice: 75000,
      rating: 4.8,
      reviewsCount: 80,
      stockQuantity: 15,
      inStock: true,
      addedAt: '2026-11-01T00:00:00Z',
    },
  ],
  totalItems: 1,
};

describe('WishlistContext and State Management', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <AuthProvider>
      <WishlistProvider>{children}</WishlistProvider>
    </AuthProvider>
  );

  it('initializes with null wishlist when unauthenticated', () => {
    const { result } = renderHook(() => useWishlist(), { wrapper });

    expect(result.current.wishlist).toBeNull();
    expect(result.current.itemCount).toBe(0);
    expect(result.current.isInWishlist('prod-laptop-01')).toBe(false);
  });

  it('rejects adding to wishlist when user is not authenticated', async () => {
    const { result } = renderHook(() => useWishlist(), { wrapper });

    await expect(result.current.addToWishlist('prod-laptop-01')).rejects.toThrow(
      'Please sign in to save items to your wishlist.'
    );
  });

  it('loads wishlist automatically when token is present', async () => {
    localStorage.setItem('thinkmart_token', 'valid-token');
    vi.spyOn(api, 'getCurrentUser').mockResolvedValue(mockUser);
    vi.spyOn(api, 'getWishlist').mockResolvedValue(mockWishlist);

    const { result } = renderHook(() => useWishlist(), { wrapper });

    await act(async () => {
      await result.current.refreshWishlist();
    });

    expect(result.current.wishlist).toEqual(mockWishlist);
    expect(result.current.itemCount).toBe(1);
    expect(result.current.isInWishlist('prod-laptop-01')).toBe(true);
    expect(result.current.isInWishlist('other-item')).toBe(false);
  });

  it('toggles wishlist item by removing if already present', async () => {
    localStorage.setItem('thinkmart_token', 'valid-token');
    vi.spyOn(api, 'getCurrentUser').mockResolvedValue(mockUser);
    vi.spyOn(api, 'getWishlist').mockResolvedValue(mockWishlist);

    const removeSpy = vi.spyOn(api, 'removeFromWishlist').mockResolvedValue({
      items: [],
      totalItems: 0,
    });

    const { result } = renderHook(() => useWishlist(), { wrapper });

    await act(async () => {
      await result.current.refreshWishlist();
    });

    await act(async () => {
      await result.current.toggleWishlist('prod-laptop-01');
    });

    expect(removeSpy).toHaveBeenCalledWith('prod-laptop-01');
  });
});

