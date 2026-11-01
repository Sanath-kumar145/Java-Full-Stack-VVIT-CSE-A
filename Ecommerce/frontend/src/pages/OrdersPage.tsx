import React, { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import {
  Package,
  ArrowRight,
  AlertCircle,
  Truck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getMyOrders } from '../services/api';
import { OrderSummary } from '../types';
import { LoadingSpinner } from '../components/LoadingSpinner';

export const OrdersPage: React.FC = () => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      setLoading(true);
      getMyOrders()
        .then((data) => {
          setOrders(data);
          setError(null);
        })
        .catch((err: any) => {
          const msg = err.response?.data?.message || err.message || 'Failed to load past orders.';
          setError(msg);
        })
        .finally(() => setLoading(false));
    }
  }, [isAuthenticated]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case 'DELIVERED':
        return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
      case 'SHIPPED':
        return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      case 'CONFIRMED':
        return 'bg-green/10 text-green border-green/20';
      case 'CANCELLED':
        return 'bg-red/10 text-red border-red/20';
      case 'PROCESSING':
      default:
        return 'bg-purple/10 text-purple border-purple/20';
    }
  };

  if (authLoading || (loading && isAuthenticated)) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: '/orders' }} replace />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Page Title & Breadcrumb */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-line gap-4 mb-8">
        <div>
          <h1 className="font-heading font-extrabold text-3xl text-ink">
            My Orders
          </h1>
          <p className="text-muted text-sm mt-1">
            Track, view receipts, and review the history of your simulated ThinkMart purchases.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-extrabold uppercase px-3 py-1 bg-lavender text-purple rounded-full">
            {orders.length} {orders.length === 1 ? 'Order' : 'Orders'} Total
          </span>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="bg-red/10 border border-red/30 rounded-2xl p-4 mb-8 text-red text-sm font-semibold flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Empty Orders State */}
      {orders.length === 0 ? (
        <div className="max-w-3xl mx-auto px-4 py-16 text-center">
          <div className="w-24 h-24 bg-lavender text-purple rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
            <Package className="w-12 h-12" />
          </div>
          <h2 className="font-heading font-extrabold text-2xl text-ink mb-3">
            No Orders Placed Yet
          </h2>
          <p className="text-muted text-sm max-w-md mx-auto mb-8">
            You haven't placed any orders yet. Discover our curated catalog of premium laptops, smartphones, and accessories.
          </p>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-purple hover:bg-purple-dark text-white font-bold rounded-xl shadow-md transition-all text-sm"
          >
            Start Shopping <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        /* Orders List */
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-surface rounded-brand border border-line shadow-card overflow-hidden hover:border-purple/30 transition-all"
            >
              {/* Order Header Bar */}
              <div className="bg-bg px-6 py-4 border-b border-line flex flex-wrap items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-6">
                  <div>
                    <span className="block text-muted text-[11px] font-semibold">ORDER PLACED</span>
                    <span className="font-bold text-ink">{formatDate(order.createdAt)}</span>
                  </div>
                  <div>
                    <span className="block text-muted text-[11px] font-semibold">TOTAL AMOUNT</span>
                    <span className="font-extrabold text-purple font-heading text-sm">
                      {formatPrice(order.totalAmount)}
                    </span>
                  </div>
                  <div className="hidden sm:block">
                    <span className="block text-muted text-[11px] font-semibold">REFERENCE</span>
                    <span className="font-bold text-ink">{order.orderNumber}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`px-3 py-1 rounded-full text-[11px] font-extrabold border uppercase ${getStatusBadge(
                      order.orderStatus
                    )}`}
                  >
                    {order.orderStatus}
                  </span>
                  <Link
                    to={`/orders/${order.orderNumber}`}
                    className="px-3.5 py-1.5 bg-surface hover:bg-lavender text-purple border border-line hover:border-purple/30 font-bold rounded-lg text-xs transition-colors flex items-center gap-1.5"
                  >
                    View Details <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>

              {/* Order Items Snapshot Preview */}
              <div className="p-6 divide-y divide-line">
                {order.items.map((item) => (
                  <div key={item.id} className="py-3.5 first:pt-0 last:pb-0 flex items-center gap-4">
                    <img
                      src={item.productImage}
                      alt={item.productName}
                      className="w-14 h-14 rounded-xl object-contain bg-bg p-1 border border-line flex-shrink-0"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'assets/images/products/placeholder.webp';
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-heading font-bold text-sm text-ink truncate">
                        {item.productName}
                      </h3>
                      <p className="text-xs text-muted mt-0.5">
                        Qty: <span className="font-bold text-ink">{item.quantity}</span> &bull; Unit Price:{' '}
                        <span className="font-bold text-ink">{formatPrice(item.unitPrice)}</span>
                      </p>
                    </div>
                    <div className="font-heading font-extrabold text-sm text-ink text-right">
                      {formatPrice(item.subtotal)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Footer Bar */}
              <div className="bg-bg/50 px-6 py-3 border-t border-line flex items-center justify-between text-xs text-muted">
                <div className="flex items-center gap-2">
                  <Truck className="w-3.5 h-3.5 text-purple" />
                  <span>Payment: {order.paymentMethod} &bull; Status: {order.paymentStatus}</span>
                </div>
                <div className="text-[11px] font-medium">
                  {order.totalItems} {order.totalItems === 1 ? 'unit' : 'units'} purchased
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
