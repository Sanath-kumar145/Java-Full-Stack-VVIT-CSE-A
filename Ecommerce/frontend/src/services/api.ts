import axios, { AxiosError } from 'axios';
import {
  AddToCartPayload,
  AuthResponse,
  CartSummary,
  Category,
  PagedResponse,
  ProductDetail,
  ProductSummary,
  UpdateCartPayload,
  User,
  WishlistSummary,
  CreateOrderPayload,
  OrderResponse,
  OrderSummary,
  AdminDashboardStats,
  AdminProductPayload,
  UpdateOrderStatusPayload,
} from '../types';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('thinkmart_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Clear token if server rejects authentication
      localStorage.removeItem('thinkmart_token');
    }
    return Promise.reject(error);
  }
);

export const getHealth = async () => {
  const { data } = await api.get('/health');
  return data;
};

export const getCategories = async (): Promise<Category[]> => {
  const { data } = await api.get<Category[]>('/categories');
  return data;
};

export const getProducts = async (params?: {
  category?: string;
  search?: string;
  sort?: string;
  page?: number;
  size?: number;
}): Promise<PagedResponse<ProductSummary>> => {
  const { data } = await api.get<PagedResponse<ProductSummary>>('/products', {
    params,
  });
  return data;
};

export const getFeaturedProducts = async (): Promise<ProductSummary[]> => {
  const { data } = await api.get<ProductSummary[]>('/products/featured');
  return data;
};

export const getProductById = async (id: string): Promise<ProductDetail> => {
  const { data } = await api.get<ProductDetail>(`/products/${id}`);
  return data;
};

export const login = async (credentials: {
  email: string;
  password: string;
}): Promise<AuthResponse> => {
  const { data } = await api.post<AuthResponse>('/auth/login', credentials);
  return data;
};

export const register = async (userData: {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
}): Promise<AuthResponse> => {
  const { data } = await api.post<AuthResponse>('/auth/register', userData);
  return data;
};

export const getCurrentUser = async (): Promise<User> => {
  const { data } = await api.get<User>('/auth/me');
  return data;
};

// ==============================================================================
// Cart API Endpoints
// ==============================================================================

export const getCart = async (): Promise<CartSummary> => {
  const { data } = await api.get<CartSummary>('/cart');
  return data;
};

export const addToCart = async (payload: AddToCartPayload): Promise<CartSummary> => {
  const { data } = await api.post<CartSummary>('/cart/items', payload);
  return data;
};

export const updateCartItemQuantity = async (
  productId: string,
  payload: UpdateCartPayload
): Promise<CartSummary> => {
  const { data } = await api.put<CartSummary>(`/cart/items/${productId}`, payload);
  return data;
};

export const removeCartItem = async (productId: string): Promise<CartSummary> => {
  const { data } = await api.delete<CartSummary>(`/cart/items/${productId}`);
  return data;
};

export const clearCart = async (): Promise<void> => {
  await api.delete('/cart');
};

// ==============================================================================
// Wishlist API Endpoints
// ==============================================================================

export const getWishlist = async (): Promise<WishlistSummary> => {
  const { data } = await api.get<WishlistSummary>('/wishlist');
  return data;
};

export const addToWishlist = async (productId: string): Promise<WishlistSummary> => {
  const { data } = await api.post<WishlistSummary>('/wishlist/items', { productId });
  return data;
};

export const removeFromWishlist = async (productId: string): Promise<WishlistSummary> => {
  const { data } = await api.delete<WishlistSummary>(`/wishlist/items/${productId}`);
  return data;
};

export const checkWishlist = async (productId: string): Promise<{ inWishlist: boolean }> => {
  const { data } = await api.get<{ inWishlist: boolean }>(`/wishlist/check/${productId}`);
  return data;
};

// ==============================================================================
// Orders & Checkout API Endpoints (Phase 7 Scope)
// ==============================================================================

export const createOrder = async (payload: CreateOrderPayload): Promise<OrderResponse> => {
  const { data } = await api.post<OrderResponse>('/orders', payload);
  return data;
};

export const getMyOrders = async (): Promise<OrderSummary[]> => {
  const { data } = await api.get<OrderSummary[]>('/orders/my-orders');
  return data;
};

export const getOrderByNumber = async (orderNumber: string): Promise<OrderResponse> => {
  const { data } = await api.get<OrderResponse>(`/orders/${orderNumber}`);
  return data;
};

// ==============================================================================
// Admin API Endpoints (Phase 8 Scope)
// ==============================================================================

export const getAdminDashboardStats = async (): Promise<AdminDashboardStats> => {
  const { data } = await api.get<AdminDashboardStats>('/admin/dashboard/stats');
  return data;
};

export const getAdminProducts = async (): Promise<ProductDetail[]> => {
  const { data } = await api.get<ProductDetail[]>('/admin/products');
  return data;
};

export const createAdminProduct = async (payload: AdminProductPayload): Promise<ProductDetail> => {
  const { data } = await api.post<ProductDetail>('/admin/products', payload);
  return data;
};

export const updateAdminProduct = async (id: string, payload: AdminProductPayload): Promise<ProductDetail> => {
  const { data } = await api.put<ProductDetail>(`/admin/products/${id}`, payload);
  return data;
};

export const deleteAdminProduct = async (id: string): Promise<void> => {
  await api.delete(`/admin/products/${id}`);
};

export const getAdminOrders = async (): Promise<OrderResponse[]> => {
  const { data } = await api.get<OrderResponse[]>('/admin/orders');
  return data;
};

export const updateAdminOrderStatus = async (
  id: string | number,
  payload: UpdateOrderStatusPayload
): Promise<OrderResponse> => {
  const { data } = await api.patch<OrderResponse>(`/admin/orders/${id}/status`, payload);
  return data;
};

export default api;

