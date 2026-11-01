import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { AuthProvider } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';
import { WishlistProvider } from '../context/WishlistContext';

describe('Navbar Component', () => {
  it('renders branding, primary navigation links, cart and wishlist', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <Navbar />
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    );

    expect(screen.getByLabelText('ThinkMart Home')).toBeInTheDocument();
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Products')).toBeInTheDocument();
    expect(screen.getByText('Sign In')).toBeInTheDocument();
    expect(screen.getByText('Register')).toBeInTheDocument();
    expect(screen.getByLabelText('Wishlist')).toBeInTheDocument();
    expect(screen.getByLabelText('Shopping Cart')).toBeInTheDocument();
  });
});
