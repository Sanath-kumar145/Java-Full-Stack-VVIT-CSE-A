import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { OrdersPage } from '../pages/OrdersPage';
import * as api from '../services/api';
import { AuthProvider } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';
import { WishlistProvider } from '../context/WishlistContext';
import { User, OrderSummary } from '../types';

const mockUser: User = {
  id: 1,
  fullName: 'Rohit Sharma',
  email: 'rohit@thinkmart.in',
  role: 'ROLE_CUSTOMER',
};

const mockOrders: OrderSummary[] = [
  {
    id: 10,
    orderNumber: 'TM-20261101-ABC123',
    totalAmount: 131248.95,
    orderStatus: 'PROCESSING',
    paymentMethod: 'Simulated UPI',
    paymentStatus: 'PAID',
    createdAt: '2026-11-01T12:00:00Z',
    totalItems: 1,
    distinctItemCount: 1,
    items: [
      {
        id: 201,
        productId: 'thinkpad-x1',
        productName: 'ThinkPad X1 Carbon',
        productImage: 'assets/images/products/thinkpad.webp',
        unitPrice: 124999,
        quantity: 1,
        subtotal: 124999,
      },
    ],
  },
];

const renderOrdersPage = () => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <OrdersPage />
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('OrdersPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem('thinkmart_token', 'valid-jwt-token');

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
      amountNeededForFreeShipping: 999,
      eligibleForFreeShipping: false,
    });
    vi.spyOn(api, 'getWishlist').mockResolvedValue({ items: [], totalItems: 0 });
  });

  it('renders order list with order number, status, and items snapshot', async () => {
    vi.spyOn(api, 'getMyOrders').mockResolvedValue(mockOrders);

    renderOrdersPage();

    expect(await screen.findByText('TM-20261101-ABC123')).toBeInTheDocument();
    expect(screen.getByText('ThinkPad X1 Carbon')).toBeInTheDocument();
    expect(screen.getByText('PROCESSING')).toBeInTheDocument();
    expect(screen.getByText(/View Details/i)).toBeInTheDocument();
  });

  it('renders empty state when customer has no past orders', async () => {
    vi.spyOn(api, 'getMyOrders').mockResolvedValue([]);

    renderOrdersPage();

    expect(await screen.findByText(/No Orders Placed Yet/i)).toBeInTheDocument();
    expect(screen.getByText(/Start Shopping/i)).toBeInTheDocument();
  });

  it('displays error message when API call fails', async () => {
    vi.spyOn(api, 'getMyOrders').mockRejectedValue(new Error('Failed to load past orders'));

    renderOrdersPage();

    expect(await screen.findByText(/Failed to load past orders/i)).toBeInTheDocument();
  });
});

