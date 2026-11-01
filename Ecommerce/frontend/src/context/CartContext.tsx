import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { CartSummary } from '../types';
import * as api from '../services/api';
import { useAuth } from './AuthContext';

interface CartContextType {
  cart: CartSummary | null;
  totalItems: number;
  itemCount: number;
  isLoading: boolean;
  error: string | null;
  refreshCart: () => Promise<void>;
  addToCart: (productId: string, quantity?: number) => Promise<CartSummary | null>;
  updateQuantity: (productId: string, quantity: number) => Promise<CartSummary | null>;
  removeFromCart: (productId: string) => Promise<CartSummary | null>;
  clearCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState<CartSummary | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(() => !!localStorage.getItem('thinkmart_token'));
  const [error, setError] = useState<string | null>(null);

  const refreshCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCart(null);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getCart();
      setCart(data);
    } catch (err: any) {
      // If 401, session might be invalid or unauthenticated
      if (err.response?.status !== 401) {
        setError(err.response?.data?.message || 'Failed to load shopping cart.');
      }
      setCart(null);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      refreshCart();
    } else {
      setCart(null);
    }
  }, [isAuthenticated, refreshCart]);

  const addToCart = async (productId: string, quantity = 1): Promise<CartSummary | null> => {
    if (!isAuthenticated) {
      throw new Error('Please sign in to add products to your cart.');
    }
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.addToCart({ productId, quantity });
      setCart(data);
      return data;
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Failed to add item to cart.';
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const updateQuantity = async (productId: string, quantity: number): Promise<CartSummary | null> => {
    if (!isAuthenticated) return null;
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.updateCartItemQuantity(productId, { quantity });
      setCart(data);
      return data;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to update item quantity.';
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromCart = async (productId: string): Promise<CartSummary | null> => {
    if (!isAuthenticated) return null;
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.removeCartItem(productId);
      setCart(data);
      return data;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to remove item from cart.';
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const clearCart = async (): Promise<void> => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    setError(null);
    try {
      await api.clearCart();
      setCart({
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
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to clear cart.');
    } finally {
      setIsLoading(false);
    }
  };

  const totalItems = cart ? cart.totalItems : 0;
  const itemCount = cart ? cart.itemCount : 0;

  return (
    <CartContext.Provider
      value={{
        cart,
        totalItems,
        itemCount,
        isLoading,
        error,
        refreshCart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
