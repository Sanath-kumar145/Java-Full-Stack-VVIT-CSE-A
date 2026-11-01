import { describe, it, expect, vi } from 'vitest';
import api, {
  getProducts,
  getCategories,
  getProductById,
  createOrder,
  getMyOrders,
  getOrderByNumber,
  getAdminDashboardStats,
  getAdminProducts,
  createAdminProduct,
  updateAdminProduct,
  deleteAdminProduct,
  getAdminOrders,
  updateAdminOrderStatus,
} from '../services/api';

describe('Frontend API Client Services', () => {
  it('calls getCategories endpoint', async () => {
    const mockCategories = [
      { id: 1, name: 'Laptops', slug: 'laptops', icon: '💻', description: 'Laptops', displayOrder: 1 },
    ];
    vi.spyOn(api, 'get').mockResolvedValueOnce({ data: mockCategories });

    const result = await getCategories();
    expect(result).toEqual(mockCategories);
    expect(api.get).toHaveBeenCalledWith('/categories');
  });

  it('calls getProducts endpoint with parameters', async () => {
    const mockPaged = {
      content: [],
      pageNumber: 0,
      pageSize: 12,
      totalElements: 0,
      totalPages: 0,
      last: true,
    };
    vi.spyOn(api, 'get').mockResolvedValueOnce({ data: mockPaged });

    const result = await getProducts({ category: 'laptops', sort: 'price-asc', page: 0 });
    expect(result).toEqual(mockPaged);
    expect(api.get).toHaveBeenCalledWith('/products', {
      params: { category: 'laptops', sort: 'price-asc', page: 0 },
    });
  });

  it('calls getProductById with path variable', async () => {
    const mockDetail = { id: 'tm-laptop-01', name: 'Laptop' };
    vi.spyOn(api, 'get').mockResolvedValueOnce({ data: mockDetail });

    const result = await getProductById('tm-laptop-01');
    expect(result).toEqual(mockDetail);
    expect(api.get).toHaveBeenCalledWith('/products/tm-laptop-01');
  });

  it('calls createOrder endpoint with payload', async () => {
    const payload = {
      customerName: 'Rohit Sharma',
      customerPhone: '9876543210',
      addressLine1: 'Brigade Road',
      city: 'Bengaluru',
      state: 'Karnataka',
      postalCode: '560001',
    };
    const mockResponse = { id: 1, orderNumber: 'TM-20261101-ABC123' };
    vi.spyOn(api, 'post').mockResolvedValueOnce({ data: mockResponse });

    const result = await createOrder(payload);
    expect(result).toEqual(mockResponse);
    expect(api.post).toHaveBeenCalledWith('/orders', payload);
  });

  it('calls getMyOrders endpoint', async () => {
    const mockOrders = [{ id: 1, orderNumber: 'TM-20261101-ABC123' }];
    vi.spyOn(api, 'get').mockResolvedValueOnce({ data: mockOrders });

    const result = await getMyOrders();
    expect(result).toEqual(mockOrders);
    expect(api.get).toHaveBeenCalledWith('/orders/my-orders');
  });

  it('calls getOrderByNumber endpoint', async () => {
    const mockOrder = { id: 1, orderNumber: 'TM-20261101-ABC123' };
    vi.spyOn(api, 'get').mockResolvedValueOnce({ data: mockOrder });

    const result = await getOrderByNumber('TM-20261101-ABC123');
    expect(result).toEqual(mockOrder);
    expect(api.get).toHaveBeenCalledWith('/orders/TM-20261101-ABC123');
  });

  it('calls getAdminDashboardStats endpoint', async () => {
    const mockStats = { totalRevenue: 100000, totalOrders: 10 };
    vi.spyOn(api, 'get').mockResolvedValueOnce({ data: mockStats });

    const result = await getAdminDashboardStats();
    expect(result).toEqual(mockStats);
    expect(api.get).toHaveBeenCalledWith('/admin/dashboard/stats');
  });

  it('calls getAdminProducts endpoint', async () => {
    const mockProducts = [{ id: 'p1', name: 'Product 1' }];
    vi.spyOn(api, 'get').mockResolvedValueOnce({ data: mockProducts });

    const result = await getAdminProducts();
    expect(result).toEqual(mockProducts);
    expect(api.get).toHaveBeenCalledWith('/admin/products');
  });

  it('calls createAdminProduct endpoint', async () => {
    const payload = {
      name: 'New Product',
      brand: 'Brand',
      categoryId: 1,
      price: 100,
      originalPrice: 150,
      imageUrl: 'img.webp',
      description: 'Desc',
      stockQuantity: 10,
    };
    const mockCreated = { id: 'new-product', ...payload };
    vi.spyOn(api, 'post').mockResolvedValueOnce({ data: mockCreated });

    const result = await createAdminProduct(payload);
    expect(result).toEqual(mockCreated);
    expect(api.post).toHaveBeenCalledWith('/admin/products', payload);
  });

  it('calls updateAdminProduct endpoint', async () => {
    const payload = {
      name: 'Updated Product',
      brand: 'Brand',
      categoryId: 1,
      price: 120,
      originalPrice: 150,
      imageUrl: 'img.webp',
      description: 'Desc',
      stockQuantity: 15,
    };
    const mockUpdated = { id: 'p1', ...payload };
    vi.spyOn(api, 'put').mockResolvedValueOnce({ data: mockUpdated });

    const result = await updateAdminProduct('p1', payload);
    expect(result).toEqual(mockUpdated);
    expect(api.put).toHaveBeenCalledWith('/admin/products/p1', payload);
  });

  it('calls deleteAdminProduct endpoint', async () => {
    vi.spyOn(api, 'delete').mockResolvedValueOnce({ data: null });

    await deleteAdminProduct('p1');
    expect(api.delete).toHaveBeenCalledWith('/admin/products/p1');
  });

  it('calls getAdminOrders endpoint', async () => {
    const mockOrders = [{ id: 1, orderNumber: 'TM-01' }];
    vi.spyOn(api, 'get').mockResolvedValueOnce({ data: mockOrders });

    const result = await getAdminOrders();
    expect(result).toEqual(mockOrders);
    expect(api.get).toHaveBeenCalledWith('/admin/orders');
  });

  it('calls updateAdminOrderStatus endpoint', async () => {
    const mockUpdated = { id: 1, orderStatus: 'SHIPPED' };
    vi.spyOn(api, 'patch').mockResolvedValueOnce({ data: mockUpdated });

    const result = await updateAdminOrderStatus(1, { status: 'SHIPPED' });
    expect(result).toEqual(mockUpdated);
    expect(api.patch).toHaveBeenCalledWith('/admin/orders/1/status', { status: 'SHIPPED' });
  });
});


