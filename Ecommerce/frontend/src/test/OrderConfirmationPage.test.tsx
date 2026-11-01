import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { OrderConfirmationPage } from '../pages/OrderConfirmationPage';
import * as api from '../services/api';
import { OrderResponse } from '../types';

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

const renderConfirmation = (orderNumber = 'TM-20261101-ABC123', initialOrder?: OrderResponse) => {
  return render(
    <MemoryRouter
      initialEntries={[
        {
          pathname: `/order-confirmation/${orderNumber}`,
          state: initialOrder ? { order: initialOrder } : undefined,
        },
      ]}
    >
      <Routes>
        <Route path="/order-confirmation/:orderNumber" element={<OrderConfirmationPage />} />
      </Routes>
    </MemoryRouter>
  );
};

describe('OrderConfirmationPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders order confirmation with order state passed from checkout', async () => {
    renderConfirmation('TM-20261101-ABC123', mockOrder);

    expect(await screen.findByText(/Order Placed Successfully!/i)).toBeInTheDocument();
    expect(screen.getByText('TM-20261101-ABC123')).toBeInTheDocument();
    expect(screen.getByText('ThinkPad X1 Carbon')).toBeInTheDocument();
    expect(screen.getByText(/View My Orders/i)).toBeInTheDocument();
    expect(screen.getByText(/Continue Shopping/i)).toBeInTheDocument();
  });

  it('fetches order from API when state is not passed in router navigation', async () => {
    vi.spyOn(api, 'getOrderByNumber').mockResolvedValue(mockOrder);

    renderConfirmation('TM-20261101-ABC123');

    expect(await screen.findByText(/Order Placed Successfully!/i)).toBeInTheDocument();
    expect(api.getOrderByNumber).toHaveBeenCalledWith('TM-20261101-ABC123');
    expect(screen.getByText('TM-20261101-ABC123')).toBeInTheDocument();
  });
});

