import React, { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import {
  CheckCircle2,
  Package,
  ArrowRight,
  Truck,
  MapPin,
  Calendar,
  AlertCircle,
  ShoppingBag,
} from 'lucide-react';
import { getOrderByNumber } from '../services/api';
import { OrderResponse } from '../types';
import { LoadingSpinner } from '../components/LoadingSpinner';

export const OrderConfirmationPage: React.FC = () => {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const location = useLocation();

  const [order, setOrder] = useState<OrderResponse | null>(
    (location.state as any)?.order || null
  );
  const [loading, setLoading] = useState<boolean>(!order);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!order && orderNumber) {
      setLoading(true);
      getOrderByNumber(orderNumber)
        .then((data) => {
          setOrder(data);
          setError(null);
        })
        .catch((err: any) => {
          const msg = err.response?.data?.message || err.message || 'Failed to load order receipt.';
          setError(msg);
        })
        .finally(() => setLoading(false));
    }
  }, [order, orderNumber]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error || !order) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="w-20 h-20 bg-red/10 text-red rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-10 h-10" />
        </div>
        <h1 className="font-heading font-extrabold text-2xl text-ink mb-2">
          Unable to Load Order Receipt
        </h1>
        <p className="text-muted text-sm mb-6">{error || 'Order reference was not found.'}</p>
        <Link
          to="/orders"
          className="inline-flex items-center gap-2 px-6 py-3 bg-purple text-white font-bold rounded-xl text-sm"
        >
          View My Orders <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  // Calculate estimated delivery date: 4 days from order creation
  const orderDate = new Date(order.createdAt);
  const estDelivery = new Date(orderDate);
  estDelivery.setDate(orderDate.getDate() + 4);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Success Hero Header */}
      <div className="text-center pb-8 border-b border-line mb-8">
        <div className="w-20 h-20 bg-green/10 text-green rounded-full flex items-center justify-center mx-auto mb-5 shadow-inner animate-bounce">
          <CheckCircle2 className="w-12 h-12" />
        </div>
        <span className="text-xs font-extrabold uppercase tracking-widest text-purple bg-lavender px-3 py-1 rounded-full">
          Simulation Confirmed
        </span>
        <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-ink mt-3">
          Order Placed Successfully!
        </h1>
        <p className="text-muted text-sm mt-2 max-w-lg mx-auto">
          Thank you for shopping at ThinkMart. Your order has been placed in simulation mode and is now being processed.
        </p>

        {/* Reference Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 mt-4 bg-bg border border-line rounded-xl text-sm">
          <span className="text-muted text-xs">Order Reference:</span>
          <span className="font-heading font-extrabold text-purple tracking-wider">
            {order.orderNumber}
          </span>
        </div>
      </div>

      {/* Info Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {/* Estimated Delivery */}
        <div className="bg-surface rounded-2xl border border-line p-5 shadow-card">
          <div className="flex items-center gap-3 text-purple mb-2">
            <Calendar className="w-5 h-5" />
            <h3 className="font-heading font-bold text-sm text-ink">Estimated Delivery</h3>
          </div>
          <p className="text-sm font-extrabold text-ink">
            {estDelivery.toLocaleDateString('en-IN', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </p>
          <span className="inline-block mt-1 text-[11px] font-semibold text-green bg-green/10 px-2 py-0.5 rounded-md">
            Standard Express (Simulated)
          </span>
        </div>

        {/* Shipping Destination */}
        <div className="bg-surface rounded-2xl border border-line p-5 shadow-card">
          <div className="flex items-center gap-3 text-purple mb-2">
            <MapPin className="w-5 h-5" />
            <h3 className="font-heading font-bold text-sm text-ink">Delivery Address</h3>
          </div>
          <p className="text-xs font-bold text-ink truncate">{order.customerName}</p>
          <p className="text-xs text-muted line-clamp-2 mt-0.5">{order.shippingAddress}</p>
          <p className="text-[11px] text-muted mt-1 font-medium">Contact: {order.customerPhone}</p>
        </div>

        {/* Payment Simulation Status */}
        <div className="bg-surface rounded-2xl border border-line p-5 shadow-card">
          <div className="flex items-center gap-3 text-purple mb-2">
            <Truck className="w-5 h-5" />
            <h3 className="font-heading font-bold text-sm text-ink">Payment Status</h3>
          </div>
          <p className="text-xs font-extrabold text-ink">{order.paymentMethod}</p>
          <div className="flex items-center gap-2 mt-1">
            <span
              className={`text-[11px] font-extrabold px-2 py-0.5 rounded-md uppercase ${
                order.paymentStatus === 'PAID'
                  ? 'bg-green/10 text-green'
                  : 'bg-amber-500/10 text-amber-700'
              }`}
            >
              {order.paymentStatus}
            </span>
            <span className="text-[10px] text-muted font-medium">Simulated Gateway</span>
          </div>
        </div>
      </div>

      {/* Itemized Order Breakdown */}
      <div className="bg-surface rounded-brand border border-line p-6 shadow-card mb-8">
        <div className="flex items-center justify-between pb-4 border-b border-line mb-4">
          <h2 className="font-heading font-extrabold text-lg text-ink flex items-center gap-2">
            <Package className="w-5 h-5 text-purple" />
            Purchased Items ({order.totalItems} units)
          </h2>
          <span className="text-xs font-extrabold text-purple bg-lavender px-2.5 py-1 rounded-lg uppercase">
            Status: {order.orderStatus}
          </span>
        </div>

        <div className="divide-y divide-line">
          {order.items.map((item) => (
            <div key={item.id} className="py-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <img
                  src={item.productImage}
                  alt={item.productName}
                  className="w-14 h-14 rounded-xl object-contain bg-bg p-1 border border-line flex-shrink-0"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'assets/images/products/placeholder.webp';
                  }}
                />
                <div>
                  <h4 className="font-heading font-bold text-sm text-ink">{item.productName}</h4>
                  <p className="text-xs text-muted mt-0.5">
                    Quantity: <span className="font-bold text-ink">{item.quantity}</span> &bull; Unit Price:{' '}
                    <span className="font-bold text-ink">{formatPrice(item.unitPrice)}</span>
                  </p>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="font-heading font-extrabold text-base text-ink">
                  {formatPrice(item.subtotal)}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pricing Summary */}
        <div className="border-t border-line mt-4 pt-4 space-y-2.5 text-sm">
          <div className="flex items-center justify-between text-muted">
            <span>Items Subtotal</span>
            <span className="font-bold text-ink">{formatPrice(order.subtotal)}</span>
          </div>
          <div className="flex items-center justify-between text-muted">
            <span>Standard GST (5%)</span>
            <span className="font-bold text-ink">{formatPrice(order.taxAmount)}</span>
          </div>
          <div className="flex items-center justify-between text-muted">
            <span>Shipping Fee</span>
            {order.shippingAmount === 0 ? (
              <span className="font-extrabold text-green uppercase text-xs">FREE</span>
            ) : (
              <span className="font-bold text-ink">{formatPrice(order.shippingAmount)}</span>
            )}
          </div>
          <div className="border-t border-line pt-3 flex items-baseline justify-between font-heading font-extrabold">
            <span className="text-base text-ink">Total Paid (Simulated)</span>
            <span className="text-2xl text-purple">{formatPrice(order.totalAmount)}</span>
          </div>
        </div>
      </div>

      {/* Navigation Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link
          to="/orders"
          className="w-full sm:w-auto px-8 py-3.5 bg-purple hover:bg-purple-dark text-white font-bold rounded-xl shadow-md transition-all text-sm flex items-center justify-center gap-2"
        >
          <Package className="w-4 h-4" /> View My Orders
        </Link>
        <Link
          to="/products"
          className="w-full sm:w-auto px-8 py-3.5 bg-surface hover:bg-lavender text-ink border border-line font-bold rounded-xl transition-all text-sm flex items-center justify-center gap-2"
        >
          <ShoppingBag className="w-4 h-4" /> Continue Shopping
        </Link>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;
