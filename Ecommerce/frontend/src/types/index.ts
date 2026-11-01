export interface ProductSummary {
  id: string;
  name: string;
  brand: string;
  categoryId: number;
  categoryName: string;
  categorySlug: string;
  price: number;
  originalPrice: number;
  rating: number;
  reviewsCount: number;
  imageUrl: string;
  description: string;
  discountTag: string;
  featured: boolean;
  inStock: boolean;
}

export interface ProductDetail extends ProductSummary {
  stockQuantity: number;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  icon: string;
  description: string;
  displayOrder: number;
}

export interface PagedResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last?: boolean;
  isLast?: boolean;
}

export interface User {
  id: number;
  email: string;
  fullName: string;
  phone?: string;
  role: string;
}

export interface AuthResponse {
  token: string;
  type: string;
  user: User;
}

export interface ApiError {
  status: number;
  error: string;
  message: string;
  path: string;
  timestamp: string;
  fieldErrors?: Record<string, string>;
}

export interface CartItem {
  id: number;
  productId: string;
  productName: string;
  productImage: string;
  categoryName: string;
  unitPrice: number;
  originalPrice: number;
  quantity: number;
  itemTotal: number;
  inStock: boolean;
  availableStock: number;
}

export interface CartSummary {
  items: CartItem[];
  totalItems: number;
  itemCount: number;
  subtotal: number;
  tax: number;
  shippingFee: number;
  grandTotal: number;
  freeShippingThreshold: number;
  amountNeededForFreeShipping: number;
  eligibleForFreeShipping: boolean;
}

export interface AddToCartPayload {
  productId: string;
  quantity?: number;
}

export interface UpdateCartPayload {
  quantity: number;
}

export interface WishlistItem {
  id: number;
  productId: string;
  productName: string;
  productImage: string;
  categoryName: string;
  price: number;
  originalPrice: number;
  rating: number;
  reviewsCount: number;
  stockQuantity: number;
  inStock: boolean;
  discountTag?: string;
  addedAt: string;
}

export interface WishlistSummary {
  items: WishlistItem[];
  totalItems: number;
}

// ==============================================================================
// Order & Checkout Types (Phase 7 Scope)
// ==============================================================================

export interface CreateOrderPayload {
  customerName: string;
  customerPhone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country?: string;
  paymentMethod?: string;
  simulateFailure?: boolean;
  idempotencyKey?: string;
}

export interface OrderItemResponse {
  id: number;
  productId: string;
  productName: string;
  productImage: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

export interface OrderResponse {
  id: number;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  shippingAddress: string;
  subtotal: number;
  taxAmount: number;
  shippingAmount: number;
  totalAmount: number;
  orderStatus: string;
  paymentMethod: string;
  paymentStatus: string;
  createdAt: string;
  totalItems: number;
  items: OrderItemResponse[];
}

export interface OrderSummary {
  id: number;
  orderNumber: string;
  totalAmount: number;
  orderStatus: string;
  paymentMethod: string;
  paymentStatus: string;
  createdAt: string;
  totalItems: number;
  distinctItemCount: number;
  items: OrderItemResponse[];
}

// ==============================================================================
// Admin Management Types (Phase 8 Scope)
// ==============================================================================

export interface AdminDashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  lowStockCount: number;
  processingOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
}

export interface AdminProductPayload {
  id?: string;
  name: string;
  brand: string;
  categoryId: number;
  price: number;
  originalPrice: number;
  rating?: number;
  reviewsCount?: number;
  imageUrl: string;
  description: string;
  discountTag?: string;
  featured?: boolean;
  stockQuantity: number;
}

export interface UpdateOrderStatusPayload {
  status: 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
}



