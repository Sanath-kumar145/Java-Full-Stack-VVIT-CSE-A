import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  TrendingUp,
  AlertTriangle,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  Truck,
  XCircle,
  ShieldAlert,
  RefreshCw,
  Search,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  getAdminDashboardStats,
  getAdminProducts,
  createAdminProduct,
  updateAdminProduct,
  deleteAdminProduct,
  getAdminOrders,
  updateAdminOrderStatus,
  getCategories,
} from '../services/api';
import {
  AdminDashboardStats,
  ProductDetail,
  OrderResponse,
  Category,
  AdminProductPayload,
} from '../types';
import { LoadingSpinner } from '../components/LoadingSpinner';

export const AdminPage: React.FC = () => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders'>('overview');
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [products, setProducts] = useState<ProductDetail[]>([]);
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionError, setActionError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Search & filter state
  const [productSearch, setProductSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('ALL');

  // Product modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductDetail | null>(null);
  const [formData, setFormData] = useState<AdminProductPayload>({
    name: '',
    brand: '',
    categoryId: 1,
    price: 0,
    originalPrice: 0,
    stockQuantity: 10,
    imageUrl: '',
    description: '',
    discountTag: '',
    featured: false,
  });
  const [submittingProduct, setSubmittingProduct] = useState(false);

  const isAdmin = isAuthenticated && user?.role === 'ROLE_ADMIN';

  const loadAllData = useCallback(async () => {
    if (!isAdmin) return;
    setLoading(true);
    setActionError(null);
    try {
      const [statsData, productsData, ordersData, categoriesData] = await Promise.all([
        getAdminDashboardStats(),
        getAdminProducts(),
        getAdminOrders(),
        getCategories(),
      ]);
      setStats(statsData);
      setProducts(productsData);
      setOrders(ordersData);
      setCategories(categoriesData);
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string } }; message?: string };
      setActionError(
        errorObj.response?.data?.message || errorObj.message || 'Failed to load administrative data.'
      );
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    if (isAdmin) {
      loadAllData();
    }
  }, [isAdmin, loadAllData]);

  const handleOpenCreateModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      brand: '',
      categoryId: categories.length > 0 ? categories[0].id : 1,
      price: 999,
      originalPrice: 1299,
      stockQuantity: 25,
      imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500',
      description: '',
      discountTag: 'Special Offer',
      featured: false,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (product: ProductDetail) => {
    setEditingProduct(product);
    setFormData({
      id: product.id,
      name: product.name,
      brand: product.brand,
      categoryId: product.categoryId,
      price: product.price,
      originalPrice: product.originalPrice,
      stockQuantity: product.stockQuantity,
      imageUrl: product.imageUrl,
      description: product.description,
      discountTag: product.discountTag || '',
      featured: product.featured,
    });
    setIsModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingProduct(true);
    setActionError(null);
    try {
      if (editingProduct) {
        const updated = await updateAdminProduct(editingProduct.id, formData);
        setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
        setSuccessMessage(`Product "${updated.name}" updated successfully.`);
      } else {
        const created = await createAdminProduct(formData);
        setProducts((prev) => [created, ...prev]);
        setSuccessMessage(`Product "${created.name}" created successfully.`);
      }
      setIsModalOpen(false);
      // Refresh metrics
      const newStats = await getAdminDashboardStats();
      setStats(newStats);
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string } }; message?: string };
      setActionError(
        errorObj.response?.data?.message || errorObj.message || 'Failed to save product.'
      );
    } finally {
      setSubmittingProduct(false);
      setTimeout(() => setSuccessMessage(null), 4000);
    }
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete product "${name}"? This action cannot be undone.`)) {
      return;
    }
    setActionError(null);
    try {
      await deleteAdminProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      setSuccessMessage(`Product "${name}" deleted successfully.`);
      const newStats = await getAdminDashboardStats();
      setStats(newStats);
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string } }; message?: string };
      setActionError(
        errorObj.response?.data?.message || errorObj.message || 'Failed to delete product.'
      );
    } finally {
      setTimeout(() => setSuccessMessage(null), 4000);
    }
  };

  const handleUpdateOrderStatus = async (
    orderId: number,
    newStatus: 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'
  ) => {
    setActionError(null);
    try {
      const updated = await updateAdminOrderStatus(orderId, { status: newStatus });
      setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
      setSuccessMessage(`Order #${updated.orderNumber} status changed to ${newStatus}.`);
      const newStats = await getAdminDashboardStats();
      setStats(newStats);
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string } }; message?: string };
      setActionError(
        errorObj.response?.data?.message || errorObj.message || 'Failed to update order status.'
      );
    } finally {
      setTimeout(() => setSuccessMessage(null), 4000);
    }
  };

  if (authLoading) {
    return <LoadingSpinner text="Checking credentials..." />;
  }

  if (!isAdmin) {
    return (
      <main className="min-h-[70vh] flex items-center justify-center py-16 px-4 bg-slate-50">
        <div className="max-w-md w-full bg-white rounded-2xl p-8 border border-slate-200 text-center shadow-sm">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center text-red-600">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Restricted Access</h1>
          <p className="text-slate-600 mb-6">
            You do not have administrative privileges to access the ThinkMart Operations Dashboard.
          </p>
          <div className="space-y-3">
            <Link
              to="/login"
              className="block w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition"
            >
              Sign In with Administrator Account
            </Link>
            <Link
              to="/"
              className="block w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition"
            >
              Return to Storefront
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.brand.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.id.toLowerCase().includes(productSearch.toLowerCase())
  );

  const filteredOrders = orders.filter((o) => {
    if (orderStatusFilter === 'ALL') return true;
    return o.orderStatus === orderStatusFilter;
  });

  return (
    <main className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Banner */}
        <header className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800">
                ADMIN CONSOLE
              </span>
              <span className="text-xs text-slate-500">Live Enterprise Operations</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              ThinkMart Operations Center
            </h1>
            <p className="text-sm text-slate-600">
              Manage inventory, product catalog, customer fulfillment, and platform metrics.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadAllData}
              disabled={loading}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={handleOpenCreateModal}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition"
            >
              <Plus className="w-4 h-4" />
              Add Product
            </button>
          </div>
        </header>

        {/* Global Notifications */}
        {actionError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">{actionError}</span>
            </div>
            <button
              onClick={() => setActionError(null)}
              className="text-red-500 hover:text-red-700 text-sm font-bold"
            >
              Dismiss
            </button>
          </div>
        )}

        {successMessage && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl flex items-center gap-2">
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm">{successMessage}</span>
          </div>
        )}

        {/* Navigation Tabs */}
        <nav aria-label="Admin Navigation Tabs" className="flex border-b border-slate-200 bg-white rounded-xl px-4 pt-2 shadow-sm space-x-6">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition ${
              activeTab === 'overview'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            Overview & Metrics
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition ${
              activeTab === 'products'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Package className="w-4 h-4" />
            Catalog Products ({products.length})
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition ${
              activeTab === 'orders'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            Fulfillment Orders ({orders.length})
          </button>
        </nav>

        {loading ? (
          <LoadingSpinner text="Retrieving administrative records..." />
        ) : (
          <>
            {/* TAB 1: OVERVIEW & METRICS */}
            {activeTab === 'overview' && stats && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  {/* Revenue */}
                  <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-500">Gross Revenue</span>
                      <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center text-green-600">
                        <TrendingUp className="w-5 h-5" />
                      </div>
                    </div>
                    <div className="mt-3">
                      <div className="text-2xl font-bold text-slate-900">
                        ₹{stats.totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        Excludes cancelled transactions
                      </div>
                    </div>
                  </div>

                  {/* Total Orders */}
                  <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-500">Total Orders</span>
                      <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                        <ShoppingBag className="w-5 h-5" />
                      </div>
                    </div>
                    <div className="mt-3">
                      <div className="text-2xl font-bold text-slate-900">{stats.totalOrders}</div>
                      <div className="text-xs text-slate-500 mt-1">
                        {stats.processingOrders} processing, {stats.shippedOrders} shipped
                      </div>
                    </div>
                  </div>

                  {/* Total Products */}
                  <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-500">Total Products</span>
                      <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                        <Package className="w-5 h-5" />
                      </div>
                    </div>
                    <div className="mt-3">
                      <div className="text-2xl font-bold text-slate-900">{stats.totalProducts}</div>
                      <div className="text-xs text-slate-500 mt-1">
                        Across {categories.length} active categories
                      </div>
                    </div>
                  </div>

                  {/* Low Stock Alert */}
                  <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-500">Low Stock Alert</span>
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        stats.lowStockCount > 0 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'
                      }`}>
                        <AlertTriangle className="w-5 h-5" />
                      </div>
                    </div>
                    <div className="mt-3">
                      <div className="text-2xl font-bold text-slate-900">{stats.lowStockCount}</div>
                      <div className="text-xs text-slate-500 mt-1">
                        {stats.lowStockCount > 0 ? 'Stock ≤ 10 units' : 'Inventory levels healthy'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status Breakdown Panel */}
                <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                  <h3 className="text-lg font-bold text-slate-900 mb-4">Order Pipeline Status</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-center">
                      <div className="text-sm text-blue-700 font-medium flex items-center justify-center gap-1">
                        <Clock className="w-4 h-4" /> Processing
                      </div>
                      <div className="text-2xl font-bold text-blue-900 mt-1">
                        {stats.processingOrders}
                      </div>
                    </div>

                    <div className="bg-purple-50 border border-purple-100 rounded-lg p-4 text-center">
                      <div className="text-sm text-purple-700 font-medium flex items-center justify-center gap-1">
                        <Truck className="w-4 h-4" /> Shipped
                      </div>
                      <div className="text-2xl font-bold text-purple-900 mt-1">
                        {stats.shippedOrders}
                      </div>
                    </div>

                    <div className="bg-green-50 border border-green-100 rounded-lg p-4 text-center">
                      <div className="text-sm text-green-700 font-medium flex items-center justify-center gap-1">
                        <CheckCircle className="w-4 h-4" /> Delivered
                      </div>
                      <div className="text-2xl font-bold text-green-900 mt-1">
                        {stats.deliveredOrders}
                      </div>
                    </div>

                    <div className="bg-red-50 border border-red-100 rounded-lg p-4 text-center">
                      <div className="text-sm text-red-700 font-medium flex items-center justify-center gap-1">
                        <XCircle className="w-4 h-4" /> Cancelled
                      </div>
                      <div className="text-2xl font-bold text-red-900 mt-1">
                        {stats.cancelledOrders}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: PRODUCT MANAGEMENT */}
            {activeTab === 'products' && (
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-3">
                  <div className="relative w-full sm:w-80">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search products by name or brand..."
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      className="w-full pl-9 pr-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="text-xs text-slate-500">
                    Showing {filteredProducts.length} of {products.length} catalog items
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-600">
                    <thead className="bg-slate-50 text-slate-700 text-xs uppercase font-semibold border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-3">Product</th>
                        <th className="px-4 py-3">Category</th>
                        <th className="px-4 py-3">Price / MRP</th>
                        <th className="px-4 py-3">Stock Status</th>
                        <th className="px-4 py-3">Featured</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredProducts.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-50/75 transition">
                          <td className="px-4 py-3 flex items-center gap-3">
                            <img
                              src={p.imageUrl}
                              alt={p.name}
                              className="w-10 h-10 rounded-lg object-cover bg-slate-100 flex-shrink-0"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                  'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100';
                              }}
                            />
                            <div>
                              <div className="font-semibold text-slate-900">{p.name}</div>
                              <div className="text-xs text-slate-500">
                                {p.brand} • <span className="font-mono">{p.id}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-slate-700">
                            {p.categoryName || 'General'}
                          </td>
                          <td className="px-4 py-3">
                            <div className="font-semibold text-slate-900">
                              ₹{p.price.toLocaleString('en-IN')}
                            </div>
                            <div className="text-xs text-slate-400 line-through">
                              ₹{p.originalPrice.toLocaleString('en-IN')}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                p.stockQuantity <= 0
                                  ? 'bg-red-100 text-red-800'
                                  : p.stockQuantity <= 10
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-green-100 text-green-800'
                              }`}
                            >
                              {p.stockQuantity} in stock
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {p.featured ? (
                              <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                                YES
                              </span>
                            ) : (
                              <span className="text-xs text-slate-400">No</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right space-x-2">
                            <button
                              onClick={() => handleOpenEditModal(p)}
                              className="text-slate-600 hover:text-indigo-600 p-1 rounded hover:bg-slate-100 transition"
                              title="Edit product"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(p.id, p.name)}
                              className="text-slate-600 hover:text-red-600 p-1 rounded hover:bg-red-50 transition"
                              title="Delete product"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 3: ORDER FULFILLMENT */}
            {activeTab === 'orders' && (
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-600">Filter Status:</span>
                    <select
                      value={orderStatusFilter}
                      onChange={(e) => setOrderStatusFilter(e.target.value)}
                      className="text-sm border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="ALL">All Statuses</option>
                      <option value="PROCESSING">Processing</option>
                      <option value="SHIPPED">Shipped</option>
                      <option value="DELIVERED">Delivered</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                  </div>
                  <div className="text-xs text-slate-500">
                    Showing {filteredOrders.length} of {orders.length} orders
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-600">
                    <thead className="bg-slate-50 text-slate-700 text-xs uppercase font-semibold border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-3">Order #</th>
                        <th className="px-4 py-3">Customer Details</th>
                        <th className="px-4 py-3">Date</th>
                        <th className="px-4 py-3">Total Amount</th>
                        <th className="px-4 py-3">Payment</th>
                        <th className="px-4 py-3">Fulfillment Status</th>
                        <th className="px-4 py-3 text-right">Update Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredOrders.map((order) => (
                        <tr key={order.id} className="hover:bg-slate-50/75 transition">
                          <td className="px-4 py-3 font-mono font-semibold text-indigo-600">
                            {order.orderNumber}
                          </td>
                          <td className="px-4 py-3">
                            <div className="font-semibold text-slate-900">{order.customerName}</div>
                            <div className="text-xs text-slate-500">{order.customerPhone}</div>
                          </td>
                          <td className="px-4 py-3 text-xs text-slate-500">
                            {new Date(order.createdAt).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </td>
                          <td className="px-4 py-3 font-semibold text-slate-900">
                            ₹{order.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                order.paymentStatus === 'PAID'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {order.paymentStatus}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                                order.orderStatus === 'DELIVERED'
                                  ? 'bg-green-100 text-green-800'
                                  : order.orderStatus === 'SHIPPED'
                                  ? 'bg-purple-100 text-purple-800'
                                  : order.orderStatus === 'CANCELLED'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-blue-100 text-blue-800'
                              }`}
                            >
                              {order.orderStatus}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <select
                              value={order.orderStatus}
                              onChange={(e) =>
                                handleUpdateOrderStatus(
                                  order.id,
                                  e.target.value as 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'
                                )
                              }
                              className="text-xs border border-slate-300 rounded px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            >
                              <option value="PROCESSING">PROCESSING</option>
                              <option value="SHIPPED">SHIPPED</option>
                              <option value="DELIVERED">DELIVERED</option>
                              <option value="CANCELLED">CANCELLED</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* CREATE / EDIT PRODUCT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-xl border border-slate-200">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100">
              <h3 className="text-xl font-bold text-slate-900">
                {editingProduct ? 'Edit Catalog Product' : 'Add New Catalog Product'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    placeholder="e.g. ThinkPad X1 Carbon"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Brand *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    placeholder="e.g. Lenovo"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Category *
                  </label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) =>
                      setFormData({ ...formData, categoryId: Number(e.target.value) })
                    }
                    className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Stock Quantity *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.stockQuantity}
                    onChange={(e) =>
                      setFormData({ ...formData, stockQuantity: Number(e.target.value) })
                    }
                    className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Sale Price (₹) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Original MSRP (₹) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    required
                    value={formData.originalPrice}
                    onChange={(e) =>
                      setFormData({ ...formData, originalPrice: Number(e.target.value) })
                    }
                    className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Image URL *
                  </label>
                  <input
                    type="url"
                    required
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    placeholder="https://images.unsplash.com/..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Discount Badge Text
                  </label>
                  <input
                    type="text"
                    value={formData.discountTag || ''}
                    onChange={(e) => setFormData({ ...formData, discountTag: e.target.value })}
                    className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    placeholder="e.g. 15% OFF"
                  />
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="featuredCheckbox"
                    checked={formData.featured || false}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 border-slate-300"
                  />
                  <label htmlFor="featuredCheckbox" className="text-sm font-medium text-slate-700">
                    Feature on Homepage Carousel
                  </label>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Description *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    placeholder="Full product description, specs, and features..."
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingProduct}
                  className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition disabled:opacity-50"
                >
                  {submittingProduct ? 'Saving...' : editingProduct ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
};
export default AdminPage;
