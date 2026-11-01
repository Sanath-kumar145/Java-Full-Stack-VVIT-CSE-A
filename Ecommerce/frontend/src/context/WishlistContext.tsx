import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { WishlistSummary } from '../types';
import * as api from '../services/api';
import { useAuth } from './AuthContext';

interface WishlistContextType {
  wishlist: WishlistSummary | null;
  itemCount: number;
  isLoading: boolean;
  error: string | null;
  refreshWishlist: () => Promise<void>;
  addToWishlist: (productId: string) => Promise<WishlistSummary | null>;
  removeFromWishlist: (productId: string) => Promise<WishlistSummary | null>;
  toggleWishlist: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [wishlist, setWishlist] = useState<WishlistSummary | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(() => !!localStorage.getItem('thinkmart_token'));
  const [error, setError] = useState<string | null>(null);

  const refreshWishlist = useCallback(async () => {
    if (!isAuthenticated) {
      setWishlist(null);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getWishlist();
      setWishlist(data);
    } catch (err: any) {
      if (err.response?.status !== 401) {
        setError(err.response?.data?.message || 'Failed to load wishlist.');
      }
      setWishlist(null);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      refreshWishlist();
    } else {
      setWishlist(null);
    }
  }, [isAuthenticated, refreshWishlist]);

  const addToWishlist = async (productId: string): Promise<WishlistSummary | null> => {
    if (!isAuthenticated) {
      throw new Error('Please sign in to save items to your wishlist.');
    }
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.addToWishlist(productId);
      setWishlist(data);
      return data;
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Failed to add item to wishlist.';
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromWishlist = async (productId: string): Promise<WishlistSummary | null> => {
    if (!isAuthenticated) return null;
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.removeFromWishlist(productId);
      setWishlist(data);
      return data;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to remove item from wishlist.';
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const isInWishlist = (productId: string): boolean => {
    if (!wishlist || !wishlist.items) return false;
    return wishlist.items.some((item) => item.productId === productId);
  };

  const toggleWishlist = async (productId: string): Promise<void> => {
    if (!isAuthenticated) {
      throw new Error('Please sign in to manage your wishlist.');
    }
    if (isInWishlist(productId)) {
      await removeFromWishlist(productId);
    } else {
      await addToWishlist(productId);
    }
  };

  const itemCount = wishlist ? wishlist.items.length : 0;

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        itemCount,
        isLoading,
        error,
        refreshWishlist,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        isInWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
