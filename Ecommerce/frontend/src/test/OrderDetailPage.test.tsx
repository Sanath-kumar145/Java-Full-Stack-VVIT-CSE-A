import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { OrderDetailPage } from '../pages/OrderDetailPage';
import * as api from '../services/api';
import { AuthProvider } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';
import { WishlistProvider } from '../context/WishlistContext';
import { User, OrderResponse } from '../types';

const mockUser: User = {
  id: 1,
  fullName: 'Rohit Sharma',
  email: 'rohit@thinkmart.in',
  role: 'ROLE_CUSTOMER',
};

const mockOrder: OrderResponse = {
  id: 10,
  orderNumber: 'TM-20261101-ABC123',
  customerName: 'Rohit Sharma',
  customerPhone: '9876543210',
  shippingAddress: '123 Brigade Road, Bengaluru, Karnataka - 560001, India',
  subtotal: 124999,
  taxAmount: 6249.95,
  shippingAmount: 0,
  totalAmount: 131248.95,
  orderStatus: 'PROCESSING',
  paymentMethod: 'Simulated UPI',
  paymentStatus: 'PAID',
  createdAt: '2026-11-01T12:00:00Z',
  totalItems: 1,
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
};

const renderOrderDetail = (orderNumber = 'TM-20261101-ABC123') => {
  return render(
    <MemoryRouter initialEntries={[`/orders/${orderNumber}`]}>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <Routes>
              <Route path="/orders/:orderNumber" element={<OrderDetailPage />} />
            </Routes>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </MemoryRouter>
  );
};

describe('OrderDetailPage', () => {
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

  it('renders order receipt with delivery details, item snapshot, status stepper, and totals', async () => {
    vi.spyOn(api, 'getOrderByNumber').mockResolvedValue(mockOrder);

    renderOrderDetail();

    expect(await screen.findByText('TM-20261101-ABC123')).toBeInTheDocument();
    expect(screen.getByText('ThinkPad X1 Carbon')).toBeInTheDocument();
    expect(screen.getByText(/123 Brigade Road, Bengaluru/i)).toBeInTheDocument();
    expect(screen.getByText(/Contact Phone: 9876543210/i)).toBeInTheDocument();
    expect(screen.getByText(/Order Placed/i)).toBeInTheDocument();
    expect(screen.getByText(/Processing/i)).toBeInTheDocument();
    expect(screen.getByText(/Print Receipt/i)).toBeInTheDocument();
  });

  it('renders error view when order reference does not exist or access is forbidden', async () => {
    vi.spyOn(api, 'getOrderByNumber').mockRejectedValue({
      response: {
        data: {
          message: 'Access denied: You do not have permission to view order TM-20261101-RESTRICTED',
        },
      },
    });

    renderOrderDetail('TM-20261101-RESTRICTED');

    expect(await screen.findByText(/Unable to Access Order/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Access denied: You do not have permission to view order/i)
    ).toBeInTheDocument();
  });
});

