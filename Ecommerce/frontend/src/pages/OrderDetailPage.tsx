import React, { useState, useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import {
  ArrowLeft,
  Package,
  MapPin,
  Phone,
  CreditCard,
  AlertCircle,
  CheckCircle2,
  Clock,
  Printer,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getOrderByNumber } from '../services/api';
import { OrderResponse } from '../types';
import { LoadingSpinner } from '../components/LoadingSpinner';

export const OrderDetailPage: React.FC = () => {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated && orderNumber) {
      setLoading(true);
      getOrderByNumber(orderNumber)
        .then((data) => {
          setOrder(data);
          setError(null);
        })
        .catch((err: any) => {
          const msg =
            err.response?.data?.message || err.message || 'Failed to load order details.';
          setError(msg);
        })
        .finally(() => setLoading(false));
    }
  }, [isAuthenticated, orderNumber]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (authLoading || (loading && isAuthenticated)) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: `/orders/${orderNumber}` }} replace />;
  }

  if (error || !order) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="w-20 h-20 bg-red/10 text-red rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-10 h-10" />
        </div>
        <h1 className="font-heading font-extrabold text-2xl text-ink mb-2">
          Unable to Access Order
        </h1>
        <p className="text-muted text-sm mb-6">
          {error || `Order with reference '${orderNumber}' was not found or access is restricted.`}
        </p>
        <Link
          to="/orders"
          className="inline-flex items-center gap-2 px-6 py-3 bg-purple text-white font-bold rounded-xl text-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Back to My Orders
        </Link>
      </div>
    );
  }

  // Stepper status logic
  const steps = [
    { label: 'Order Placed', active: true, done: true },
    {
      label: 'Processing',
      active: order.orderStatus === 'PROCESSING' || order.orderStatus === 'CONFIRMED' || order.orderStatus === 'SHIPPED' || order.orderStatus === 'DELIVERED',
      done: order.orderStatus === 'CONFIRMED' || order.orderStatus === 'SHIPPED' || order.orderStatus === 'DELIVERED',
    },
    {
      label: 'Shipped',
      active: order.orderStatus === 'SHIPPED' || order.orderStatus === 'DELIVERED',
      done: order.orderStatus === 'DELIVERED',
    },
    {
      label: 'Delivered',
      active: order.orderStatus === 'DELIVERED',
      done: order.orderStatus === 'DELIVERED',
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Back button & Action bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-line gap-4 mb-8">
        <div>
          <Link
            to="/orders"
            className="text-xs font-bold text-muted hover:text-purple inline-flex items-center gap-1.5 mb-2 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to All Orders
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-ink">
              Order Receipt
            </h1>
            <span className="text-xs font-mono font-bold bg-lavender text-purple px-3 py-1 rounded-lg">
              {order.orderNumber}
            </span>
          </div>
          <p className="text-muted text-xs mt-1">Placed on {formatDate(order.createdAt)}</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-surface hover:bg-lavender text-ink border border-line font-bold rounded-xl text-xs flex items-center gap-2 shadow-sm transition-colors"
          >
            <Printer className="w-3.5 h-3.5" /> Print Receipt
          </button>
        </div>
      </div>

      {/* Order Status Stepper */}
      <div className="bg-surface rounded-brand border border-line p-6 shadow-card mb-8">
        <h2 className="text-xs font-extrabold uppercase tracking-wider text-muted mb-6">
          Fulfillment Timeline (Simulated)
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative">
          {steps.map((st, idx) => (
            <div key={st.label} className="flex flex-col items-center text-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm mb-2 transition-all ${
                  st.done
                    ? 'bg-green text-white shadow-sm'
                    : st.active
                    ? 'bg-purple text-white shadow-md animate-pulse'
                    : 'bg-bg text-muted border border-line'
                }`}
              >
                {st.done ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : st.active ? (
                  <Clock className="w-5 h-5" />
                ) : (
                  <span>{idx + 1}</span>
                )}
              </div>
              <span
                className={`text-xs font-bold ${
                  st.active || st.done ? 'text-ink' : 'text-muted'
                }`}
              >
                {st.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Two Column Grid: Details & Items */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
        {/* Left: Shipping & Payment Info */}
        <div className="lg:col-span-5 space-y-6">
          {/* Shipping Address */}
          <div className="bg-surface rounded-brand border border-line p-6 shadow-card">
            <h3 className="font-heading font-extrabold text-base text-ink flex items-center gap-2 pb-3 border-b border-line mb-4">
              <MapPin className="w-4 h-4 text-purple" /> Shipping Address
            </h3>
            <p className="text-sm font-bold text-ink">{order.customerName}</p>
            <p className="text-xs text-muted leading-relaxed mt-1">{order.shippingAddress}</p>
            <div className="flex items-center gap-1.5 text-xs text-muted mt-3 pt-3 border-t border-line font-medium">
              <Phone className="w-3.5 h-3.5 text-purple" />
              <span>Contact Phone: {order.customerPhone}</span>
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-surface rounded-brand border border-line p-6 shadow-card">
            <h3 className="font-heading font-extrabold text-base text-ink flex items-center gap-2 pb-3 border-b border-line mb-4">
              <CreditCard className="w-4 h-4 text-purple" /> Payment Information
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted">Payment Method:</span>
                <span className="font-bold text-ink">{order.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Payment Status:</span>
                <span className="font-extrabold text-green bg-green/10 px-2 py-0.5 rounded uppercase">
                  {order.paymentStatus}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Gateway:</span>
                <span className="font-bold text-purple">ThinkMart Simulated</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Purchased Items & Financial Breakdown */}
        <div className="lg:col-span-7">
          <div className="bg-surface rounded-brand border border-line p-6 shadow-card">
            <h3 className="font-heading font-extrabold text-base text-ink flex items-center gap-2 pb-3 border-b border-line mb-4">
              <Package className="w-4 h-4 text-purple" /> Order Line Items ({order.totalItems} units)
            </h3>

            <div className="divide-y divide-line">
              {order.items.map((item) => (
                <div key={item.id} className="py-3.5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.productImage}
                      alt={item.productName}
                      className="w-12 h-12 rounded-lg object-contain bg-bg p-1 border border-line flex-shrink-0"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'assets/images/products/placeholder.webp';
                      }}
                    />
                    <div>
                      <h4 className="font-heading font-bold text-xs sm:text-sm text-ink line-clamp-1">
                        {item.productName}
                      </h4>
                      <p className="text-[11px] text-muted">
                        Qty: {item.quantity} × {formatPrice(item.unitPrice)}
                      </p>
                    </div>
                  </div>
                  <div className="font-heading font-extrabold text-sm text-ink text-right flex-shrink-0">
                    {formatPrice(item.subtotal)}
                  </div>
                </div>
              ))}
            </div>

            {/* Financial Totals */}
            <div className="border-t border-line mt-4 pt-4 space-y-2.5 text-xs sm:text-sm">
              <div className="flex items-center justify-between text-muted">
                <span>Items Subtotal</span>
                <span className="font-bold text-ink">{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex items-center justify-between text-muted">
                <span>Applicable GST (5%)</span>
                <span className="font-bold text-ink">{formatPrice(order.taxAmount)}</span>
              </div>
              <div className="flex items-center justify-between text-muted">
                <span>Shipping &amp; Handling</span>
                {order.shippingAmount === 0 ? (
                  <span className="font-extrabold text-green uppercase text-xs">FREE</span>
                ) : (
                  <span className="font-bold text-ink">{formatPrice(order.shippingAmount)}</span>
                )}
              </div>
              <div className="border-t border-line pt-3 flex items-baseline justify-between font-heading font-extrabold">
                <span className="text-base text-ink">Grand Total</span>
                <span className="text-xl sm:text-2xl text-purple">{formatPrice(order.totalAmount)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;
