import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { CheckoutPage } from '../pages/CheckoutPage';
import * as api from '../services/api';
import { AuthProvider } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';
import { WishlistProvider } from '../context/WishlistContext';
import { CartSummary, User, OrderResponse } from '../types';

const mockUser: User = {
  id: 1,
  fullName: 'Rohit Sharma',
  email: 'rohit@thinkmart.in',
  phone: '9876543210',
  role: 'ROLE_CUSTOMER',
};

const mockCart: CartSummary = {
  items: [
    {
      id: 101,
      productId: 'thinkpad-x1',
      productName: 'ThinkPad X1 Carbon',
      productImage: 'assets/images/products/thinkpad.webp',
      categoryName: 'Laptops',
      unitPrice: 124999,
      originalPrice: 139999,
      quantity: 1,
      itemTotal: 124999,
      inStock: true,
      availableStock: 5,
    },
  ],
  totalItems: 1,
  itemCount: 1,
  subtotal: 124999,
  tax: 6249.95,
  shippingFee: 0,
  grandTotal: 131248.95,
  freeShippingThreshold: 999,
  amountNeededForFreeShipping: 0,
  eligibleForFreeShipping: true,
};

const mockOrderResponse: OrderResponse = {
  id: 10,
  orderNumber: 'TM-20261101-ABC123',
  customerName: 'Rohit Sharma',
  customerPhone: '9876543210',
  shippingAddress: '123 Brigade Road, Apt 4B, Bengaluru, Karnataka - 560001, India',
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

const renderCheckout = () => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <CheckoutPage />
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('CheckoutPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem('thinkmart_token', 'valid-jwt-token');

    vi.spyOn(api, 'getCurrentUser').mockResolvedValue(mockUser);
    vi.spyOn(api, 'getCart').mockResolvedValue(mockCart);
    vi.spyOn(api, 'getWishlist').mockResolvedValue({ items: [], totalItems: 0 });
    vi.spyOn(api, 'createOrder').mockResolvedValue(mockOrderResponse);
  });

  it('renders checkout screen with address fields, simulation disclaimer, and order review', async () => {
    renderCheckout();

    // Verify simulation mode disclaimer is prominently displayed
    expect(await screen.findByText(/Payment Simulation Mode Active/i)).toBeInTheDocument();

    // Verify section headings
    expect(screen.getByText(/Delivery Address & Contact/i)).toBeInTheDocument();
    expect(screen.getByText(/Simulated Payment Selection/i)).toBeInTheDocument();
    expect(screen.getByText(/Order Review/i)).toBeInTheDocument();

    // Verify cart product snapshot is displayed in review
    expect(screen.getByText('ThinkPad X1 Carbon')).toBeInTheDocument();

    // Verify payment simulation options
    expect(screen.getByText('Simulated UPI')).toBeInTheDocument();
    expect(screen.getByText('Simulated Credit / Debit Card')).toBeInTheDocument();
  });

  it('validates required fields and shows validation messages when fields are missing', async () => {
    renderCheckout();

    await screen.findByText(/Delivery Address & Contact/i);

    // Clear prefilled name
    const nameInput = screen.getByLabelText(/Full Name/i);
    fireEvent.change(nameInput, { target: { value: '' } });

    // Click submit button
    const submitBtn = screen.getByRole('button', { name: /Place Simulated Order/i });
    fireEvent.click(submitBtn);

    // Validation messages should appear
    expect(await screen.findByText(/Customer full name is required/i)).toBeInTheDocument();
    expect(screen.getByText(/Street address line 1 is required/i)).toBeInTheDocument();
    expect(screen.getByText(/City is required/i)).toBeInTheDocument();
    expect(screen.getByText(/State \/ Union Territory is required/i)).toBeInTheDocument();
    expect(screen.getByText(/PIN code is required/i)).toBeInTheDocument();
  });

  it('submits valid order with correct address, payment method, and triggers createOrder', async () => {
    renderCheckout();

    await screen.findByText(/Delivery Address & Contact/i);

    // Fill form
    fireEvent.change(screen.getByLabelText(/Full Name/i), { target: { value: 'Rohit Sharma' } });
    fireEvent.change(screen.getByLabelText(/Contact Phone Number/i), { target: { value: '9876543210' } });
    fireEvent.change(screen.getByLabelText(/Address Line 1/i), { target: { value: '123 Brigade Road' } });
    fireEvent.change(screen.getByLabelText(/City/i), { target: { value: 'Bengaluru' } });
    fireEvent.change(screen.getByLabelText(/State/i), { target: { value: 'Karnataka' } });
    fireEvent.change(screen.getByLabelText(/PIN Code/i), { target: { value: '560001' } });

    // Submit
    const submitBtn = screen.getByRole('button', { name: /Place Simulated Order/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(api.createOrder).toHaveBeenCalledWith(
        expect.objectContaining({
          customerName: 'Rohit Sharma',
          customerPhone: '9876543210',
          addressLine1: '123 Brigade Road',
          city: 'Bengaluru',
          state: 'Karnataka',
          postalCode: '560001',
          paymentMethod: 'Simulated UPI',
          simulateFailure: false,
        })
      );
    });
  });

  it('displays API error banner when payment simulation failure is toggled', async () => {
    vi.spyOn(api, 'createOrder').mockRejectedValueOnce({
      response: {
        data: {
          message: 'Simulated payment failed. The test transaction was declined.',
        },
      },
    });

    renderCheckout();

    await screen.findByText(/Delivery Address & Contact/i);

    // Fill address
    fireEvent.change(screen.getByLabelText(/Address Line 1/i), { target: { value: '123 Brigade Road' } });
    fireEvent.change(screen.getByLabelText(/City/i), { target: { value: 'Bengaluru' } });
    fireEvent.change(screen.getByLabelText(/State/i), { target: { value: 'Karnataka' } });
    fireEvent.change(screen.getByLabelText(/PIN Code/i), { target: { value: '560001' } });

    // Toggle simulate failure checkbox
    const failureCheckbox = screen.getByLabelText(/Simulate Gateway Failure/i);
    fireEvent.click(failureCheckbox);

    // Submit
    const submitBtn = screen.getByRole('button', { name: /Place Simulated Order/i });
    fireEvent.click(submitBtn);

    expect(
      await screen.findByText(/Simulated payment failed\. The test transaction was declined\./i)
    ).toBeInTheDocument();
  });
});

