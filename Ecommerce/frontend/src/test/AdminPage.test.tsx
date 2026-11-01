import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AdminPage from '../pages/AdminPage';
import * as api from '../services/api';
import { AuthContext } from '../context/AuthContext';

describe('AdminPage Component', () => {
  const mockCategories = [
    { id: 1, name: 'Laptops', slug: 'laptops', icon: 'laptop', description: 'Laptops', displayOrder: 1 },
  ];

  const mockStats = {
    totalRevenue: 250000,
    totalOrders: 15,
    totalProducts: 12,
    lowStockCount: 2,
    processingOrders: 5,
    shippedOrders: 4,
    deliveredOrders: 5,
    cancelledOrders: 1,
  };

  const mockProducts = [
    {
      id: 'thinkpad-x1',
      name: 'ThinkPad X1 Carbon',
      brand: 'Lenovo',
      categoryId: 1,
      categoryName: 'Laptops',
      categorySlug: 'laptops',
      price: 124999,
      originalPrice: 139999,
      rating: 4.8,
      reviewsCount: 120,
      imageUrl: 'laptop.webp',
      description: 'Ultra-slim laptop',
      discountTag: '11% OFF',
      featured: true,
      stockQuantity: 8,
      inStock: true,
      createdAt: '2026-11-01T10:00:00Z',
      updatedAt: '2026-11-01T10:00:00Z',
    },
  ];

  const mockOrders = [
    {
      id: 101,
      orderNumber: 'TM-20261101-ABCD12',
      customerName: 'Rohit Sharma',
      customerPhone: '9876543210',
      shippingAddress: '123 Brigade Road, Bengaluru',
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
          id: 1,
          productId: 'thinkpad-x1',
          productName: 'ThinkPad X1 Carbon',
          productImage: 'laptop.webp',
          unitPrice: 124999,
          quantity: 1,
          subtotal: 124999,
        },
      ],
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(api, 'getAdminDashboardStats').mockResolvedValue(mockStats);
    vi.spyOn(api, 'getAdminProducts').mockResolvedValue(mockProducts);
    vi.spyOn(api, 'getAdminOrders').mockResolvedValue(mockOrders);
    vi.spyOn(api, 'getCategories').mockResolvedValue(mockCategories);
  });

  const renderWithAuth = (user: { id: number; email: string; fullName: string; role: string } | null) => {
    return render(
      <MemoryRouter>
        <AuthContext.Provider
          value={{
            user,
            token: user ? 'fake-token' : null,
            isAuthenticated: !!user,
            isLoading: false,
            login: vi.fn(),
            register: vi.fn(),
            logout: vi.fn(),
          }}
        >
          <AdminPage />
        </AuthContext.Provider>
      </MemoryRouter>
    );
  };

  it('renders restricted access screen when user is not an administrator', () => {
    renderWithAuth({ id: 2, email: 'customer@thinkmart.in', fullName: 'Customer', role: 'ROLE_CUSTOMER' });

    expect(screen.getByText(/Restricted Access/i)).toBeInTheDocument();
    expect(screen.getByText(/You do not have administrative privileges/i)).toBeInTheDocument();
  });

  it('renders dashboard metrics when authenticated as administrator', async () => {
    renderWithAuth({ id: 1, email: 'admin@thinkmart.in', fullName: 'Administrator', role: 'ROLE_ADMIN' });

    await waitFor(() => {
      expect(screen.getByText(/ThinkMart Operations Center/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/Gross Revenue/i)).toBeInTheDocument();
    expect(screen.getByText(/15/)).toBeInTheDocument(); // total orders
    expect(screen.getByText(/12/)).toBeInTheDocument(); // total products
    expect(screen.getByText(/Order Pipeline Status/i)).toBeInTheDocument();
  });

  it('switches to products tab and displays catalog items', async () => {
    renderWithAuth({ id: 1, email: 'admin@thinkmart.in', fullName: 'Administrator', role: 'ROLE_ADMIN' });

    await waitFor(() => {
      expect(screen.getByText(/ThinkMart Operations Center/i)).toBeInTheDocument();
    });

    const productsTab = screen.getByText(/Catalog Products/i);
    fireEvent.click(productsTab);

    expect(screen.getByText('ThinkPad X1 Carbon')).toBeInTheDocument();
    expect(screen.getByText(/8 in stock/i)).toBeInTheDocument();
  });

  it('switches to orders tab and allows order fulfillment status update', async () => {
    vi.spyOn(api, 'updateAdminOrderStatus').mockResolvedValue({
      ...mockOrders[0],
      orderStatus: 'SHIPPED',
    });

    renderWithAuth({ id: 1, email: 'admin@thinkmart.in', fullName: 'Administrator', role: 'ROLE_ADMIN' });

    await waitFor(() => {
      expect(screen.getByText(/ThinkMart Operations Center/i)).toBeInTheDocument();
    });

    const ordersTab = screen.getByText(/Fulfillment Orders/i);
    fireEvent.click(ordersTab);

    expect(screen.getByText('TM-20261101-ABCD12')).toBeInTheDocument();
    expect(screen.getByText('Rohit Sharma')).toBeInTheDocument();

    const statusSelect = screen.getByDisplayValue('PROCESSING');
    fireEvent.change(statusSelect, { target: { value: 'SHIPPED' } });

    await waitFor(() => {
      expect(api.updateAdminOrderStatus).toHaveBeenCalledWith(101, { status: 'SHIPPED' });
    });
  });
});
