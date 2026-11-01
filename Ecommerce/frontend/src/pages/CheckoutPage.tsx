import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import {
  ShieldCheck,
  Truck,
  CreditCard,
  QrCode,
  Building2,
  Banknote,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Lock,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { createOrder } from '../services/api';
import { LoadingSpinner } from '../components/LoadingSpinner';

const PAYMENT_OPTIONS = [
  {
    id: 'Simulated UPI',
    name: 'Simulated UPI',
    description: 'Instant simulated payment via Google Pay, PhonePe, Paytm, or BHIM',
    icon: QrCode,
    badge: 'Popular',
  },
  {
    id: 'Simulated Card',
    name: 'Simulated Credit / Debit Card',
    description: 'Simulated Visa, Mastercard, RuPay processing without real credentials',
    icon: CreditCard,
  },
  {
    id: 'Simulated Net Banking',
    name: 'Simulated Net Banking',
    description: 'Simulated approval from major Indian banks (HDFC, ICICI, SBI, Axis)',
    icon: Building2,
  },
  {
    id: 'Cash on Delivery (Simulated)',
    name: 'Cash on Delivery (Simulated)',
    description: 'Pay with simulated cash upon physical doorstep delivery',
    icon: Banknote,
  },
];

export const CheckoutPage: React.FC = () => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { cart, isLoading: cartLoading, refreshCart } = useCart();
  const navigate = useNavigate();

  // Form State
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
  });

  const [paymentMethod, setPaymentMethod] = useState('Simulated UPI');
  const [simulateFailure, setSimulateFailure] = useState(false);
  const [idempotencyKey] = useState(() => 'tm-idem-' + Date.now() + '-' + Math.random().toString(36).substring(2, 9));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-populate customer info from AuthContext
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        customerName: prev.customerName || user.fullName || '',
        customerPhone: prev.customerPhone || user.phone || '',
      }));
    }
  }, [user]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  if (authLoading || (cartLoading && !cart)) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: '/checkout' }} replace />;
  }

  if (!cart || cart.items.length === 0) {
    return <Navigate to="/cart" replace />;
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.customerName.trim()) {
      newErrors.customerName = 'Customer full name is required';
    }

    if (!formData.customerPhone.trim()) {
      newErrors.customerPhone = 'Contact phone number is required';
    } else if (!/^[0-9+\-\s()]{10,20}$/.test(formData.customerPhone.trim())) {
      newErrors.customerPhone = 'Please enter a valid 10-digit mobile number';
    }

    if (!formData.addressLine1.trim()) {
      newErrors.addressLine1 = 'Street address line 1 is required';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }

    if (!formData.state.trim()) {
      newErrors.state = 'State / Union Territory is required';
    }

    if (!formData.postalCode.trim()) {
      newErrors.postalCode = 'PIN code is required';
    } else if (!/^[0-9]{6}$/.test(formData.postalCode.trim())) {
      newErrors.postalCode = 'PIN code must be a valid 6-digit Indian postal code';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);

    if (!validateForm()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);

    try {
      const order = await createOrder({
        customerName: formData.customerName.trim(),
        customerPhone: formData.customerPhone.trim(),
        addressLine1: formData.addressLine1.trim(),
        addressLine2: formData.addressLine2.trim() || undefined,
        city: formData.city.trim(),
        state: formData.state.trim(),
        postalCode: formData.postalCode.trim(),
        country: formData.country.trim() || 'India',
        paymentMethod,
        simulateFailure,
        idempotencyKey,
      });

      // Clear the local cart context state immediately
      await refreshCart();

      // Navigate to order confirmation
      navigate(`/order-confirmation/${order.orderNumber}`, {
        state: { order },
        replace: true,
      });
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to complete order. Please try again.';
      setApiError(msg);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs text-muted mb-6">
        <Link to="/cart" className="hover:text-purple flex items-center gap-1 font-semibold">
          <ArrowLeft className="w-3.5 h-3.5" /> Return to Cart
        </Link>
        <span>/</span>
        <span className="text-ink font-bold">Secure Checkout</span>
      </div>

      <div className="pb-6 border-b border-line mb-8">
        <h1 className="font-heading font-extrabold text-3xl text-ink">
          Checkout &amp; Shipping
        </h1>
        <p className="text-muted text-sm mt-1">
          Provide your shipping details and select a simulated payment method to finalize your ThinkMart order.
        </p>
      </div>

      {/* Prominent Simulation Environment Notice */}
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 sm:p-5 mb-8 flex items-start gap-3.5 text-amber-900">
        <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="text-xs sm:text-sm">
          <p className="font-bold text-amber-900">
            Payment Simulation Mode Active
          </p>
          <p className="text-amber-800/90 mt-0.5 leading-relaxed">
            This e-commerce application uses a safe, simulated payment workflow. No real banking credentials, credit card details, or UPI PINs are collected or transmitted. Real money will not be deducted.
          </p>
        </div>
      </div>

      {/* Global API Error Banner */}
      {apiError && (
        <div className="bg-red/10 border border-red/30 rounded-2xl p-4 mb-8 text-red text-sm font-semibold flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <span>{apiError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Delivery Address & Payment Method */}
        <div className="lg:col-span-7 space-y-8">
          {/* Step 1: Delivery Address */}
          <section className="bg-surface rounded-brand border border-line p-6 shadow-card">
            <div className="flex items-center gap-3 pb-4 border-b border-line mb-5">
              <div className="w-7 h-7 rounded-full bg-purple text-white text-xs font-heading font-extrabold flex items-center justify-center">
                1
              </div>
              <h2 className="font-heading font-extrabold text-xl text-ink">
                Delivery Address &amp; Contact
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label htmlFor="customerName" className="block text-xs font-bold text-ink mb-1.5">
                  Full Name <span className="text-red">*</span>
                </label>
                <input
                  id="customerName"
                  type="text"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleChange}
                  placeholder="e.g. Rohit Sharma"
                  className={`w-full px-4 py-2.5 bg-bg border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple/30 ${
                    errors.customerName ? 'border-red ring-1 ring-red/30' : 'border-line focus:border-purple'
                  }`}
                />
                {errors.customerName && (
                  <p className="text-xs text-red mt-1 font-semibold">{errors.customerName}</p>
                )}
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="customerPhone" className="block text-xs font-bold text-ink mb-1.5">
                  Contact Phone Number <span className="text-red">*</span>
                </label>
                <input
                  id="customerPhone"
                  type="tel"
                  name="customerPhone"
                  value={formData.customerPhone}
                  onChange={handleChange}
                  placeholder="e.g. 9876543210"
                  className={`w-full px-4 py-2.5 bg-bg border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple/30 ${
                    errors.customerPhone ? 'border-red ring-1 ring-red/30' : 'border-line focus:border-purple'
                  }`}
                />
                {errors.customerPhone && (
                  <p className="text-xs text-red mt-1 font-semibold">{errors.customerPhone}</p>
                )}
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="addressLine1" className="block text-xs font-bold text-ink mb-1.5">
                  Address Line 1 (Flat, House no., Building, Street) <span className="text-red">*</span>
                </label>
                <input
                  id="addressLine1"
                  type="text"
                  name="addressLine1"
                  value={formData.addressLine1}
                  onChange={handleChange}
                  placeholder="e.g. 123 Brigade Road, Koramangala"
                  className={`w-full px-4 py-2.5 bg-bg border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple/30 ${
                    errors.addressLine1 ? 'border-red ring-1 ring-red/30' : 'border-line focus:border-purple'
                  }`}
                />
                {errors.addressLine1 && (
                  <p className="text-xs text-red mt-1 font-semibold">{errors.addressLine1}</p>
                )}
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="addressLine2" className="block text-xs font-bold text-ink mb-1.5">
                  Address Line 2 (Area, Landmark) <span className="text-muted font-normal">(Optional)</span>
                </label>
                <input
                  id="addressLine2"
                  type="text"
                  name="addressLine2"
                  value={formData.addressLine2}
                  onChange={handleChange}
                  placeholder="e.g. Near Forum Mall"
                  className="w-full px-4 py-2.5 bg-bg border border-line rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple/30 focus:border-purple"
                />
              </div>

              <div>
                <label htmlFor="city" className="block text-xs font-bold text-ink mb-1.5">
                  City <span className="text-red">*</span>
                </label>
                <input
                  id="city"
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="e.g. Bengaluru"
                  className={`w-full px-4 py-2.5 bg-bg border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple/30 ${
                    errors.city ? 'border-red ring-1 ring-red/30' : 'border-line focus:border-purple'
                  }`}
                />
                {errors.city && (
                  <p className="text-xs text-red mt-1 font-semibold">{errors.city}</p>
                )}
              </div>

              <div>
                <label htmlFor="state" className="block text-xs font-bold text-ink mb-1.5">
                  State / UT <span className="text-red">*</span>
                </label>
                <input
                  id="state"
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="e.g. Karnataka"
                  className={`w-full px-4 py-2.5 bg-bg border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple/30 ${
                    errors.state ? 'border-red ring-1 ring-red/30' : 'border-line focus:border-purple'
                  }`}
                />
                {errors.state && (
                  <p className="text-xs text-red mt-1 font-semibold">{errors.state}</p>
                )}
              </div>

              <div>
                <label htmlFor="postalCode" className="block text-xs font-bold text-ink mb-1.5">
                  PIN Code (6 digits) <span className="text-red">*</span>
                </label>
                <input
                  id="postalCode"
                  type="text"
                  name="postalCode"
                  maxLength={6}
                  value={formData.postalCode}
                  onChange={handleChange}
                  placeholder="e.g. 560001"
                  className={`w-full px-4 py-2.5 bg-bg border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple/30 ${
                    errors.postalCode ? 'border-red ring-1 ring-red/30' : 'border-line focus:border-purple'
                  }`}
                />
                {errors.postalCode && (
                  <p className="text-xs text-red mt-1 font-semibold">{errors.postalCode}</p>
                )}
              </div>

              <div>
                <label htmlFor="country" className="block text-xs font-bold text-ink mb-1.5">
                  Country
                </label>
                <input
                  id="country"
                  type="text"
                  name="country"
                  value={formData.country}
                  disabled
                  className="w-full px-4 py-2.5 bg-slate-100 border border-line rounded-xl text-sm text-muted cursor-not-allowed"
                />
              </div>
            </div>
          </section>

          {/* Step 2: Payment Simulation Method */}
          <section className="bg-surface rounded-brand border border-line p-6 shadow-card">
            <div className="flex items-center gap-3 pb-4 border-b border-line mb-5">
              <div className="w-7 h-7 rounded-full bg-purple text-white text-xs font-heading font-extrabold flex items-center justify-center">
                2
              </div>
              <h2 className="font-heading font-extrabold text-xl text-ink">
                Simulated Payment Selection
              </h2>
            </div>

            <div className="space-y-3">
              {PAYMENT_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                const isSelected = paymentMethod === opt.id;
                return (
                  <label
                    key={opt.id}
                    className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-purple bg-lavender/50 ring-1 ring-purple'
                        : 'border-line hover:border-purple/40 bg-surface'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={opt.id}
                      checked={isSelected}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mt-1 text-purple focus:ring-purple h-4 w-4"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4 text-purple" />
                        <span className="font-bold text-sm text-ink">{opt.name}</span>
                        {opt.badge && (
                          <span className="px-2 py-0.5 bg-purple text-white text-[10px] font-extrabold rounded-full uppercase">
                            {opt.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted mt-0.5">{opt.description}</p>
                    </div>
                  </label>
                );
              })}
            </div>

            {/* Test Simulation Edge Cases */}
            <div className="mt-6 pt-5 border-t border-line">
              <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-muted hover:text-ink">
                <input
                  type="checkbox"
                  checked={simulateFailure}
                  onChange={(e) => setSimulateFailure(e.target.checked)}
                  className="rounded border-line text-red focus:ring-red h-4 w-4"
                />
                <span className="text-red">
                  Simulate Gateway Failure (Test edge-case handling without placing order)
                </span>
              </label>
            </div>
          </section>
        </div>

        {/* Right Column: Order Summary & Placement */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-surface rounded-brand border border-line p-6 shadow-card sticky top-28">
            <h2 className="font-heading font-extrabold text-xl text-ink pb-4 border-b border-line">
              Order Review ({cart.totalItems} items)
            </h2>

            {/* Cart Items List */}
            <div className="divide-y divide-line max-h-64 overflow-y-auto pr-1 my-3">
              {cart.items.map((item) => (
                <div key={item.id} className="py-3 flex items-center gap-3">
                  <img
                    src={item.productImage}
                    alt={item.productName}
                    className="w-12 h-12 rounded-lg object-contain bg-bg p-1 border border-line flex-shrink-0"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'assets/images/products/placeholder.webp';
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-ink truncate">{item.productName}</h4>
                    <p className="text-[11px] text-muted">
                      Qty: {item.quantity} × {formatPrice(item.unitPrice)}
                    </p>
                  </div>
                  <div className="text-xs font-heading font-extrabold text-ink">
                    {formatPrice(item.itemTotal)}
                  </div>
                </div>
              ))}
            </div>

            {/* Price Calculations */}
            <div className="space-y-3 py-4 border-t border-b border-line text-sm">
              <div className="flex items-center justify-between text-muted">
                <span>Items Subtotal</span>
                <span className="font-bold text-ink">{formatPrice(cart.subtotal)}</span>
              </div>

              <div className="flex items-center justify-between text-muted">
                <span>Standard GST Tax (5%)</span>
                <span className="font-bold text-ink">{formatPrice(cart.tax)}</span>
              </div>

              <div className="flex items-center justify-between text-muted">
                <span>Shipping Fee</span>
                {cart.eligibleForFreeShipping ? (
                  <span className="font-extrabold text-green uppercase text-xs">FREE</span>
                ) : (
                  <span className="font-bold text-ink">{formatPrice(cart.shippingFee)}</span>
                )}
              </div>
            </div>

            {/* Grand Total */}
            <div className="py-4 border-b border-line flex items-baseline justify-between">
              <div>
                <span className="font-heading font-extrabold text-lg text-ink">Final Amount</span>
                <span className="block text-[11px] text-muted font-medium">Inclusive of all taxes</span>
              </div>
              <span className="font-heading font-extrabold text-2xl text-purple">
                {formatPrice(cart.grandTotal)}
              </span>
            </div>

            {/* Submit Button */}
            <div className="pt-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-purple hover:bg-purple-dark text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Processing Order...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Place Simulated Order &bull; {formatPrice(cart.grandTotal)}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

            {/* Trust Badges */}
            <div className="mt-6 pt-5 border-t border-line space-y-2 text-xs text-muted">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-green flex-shrink-0" />
                <span>Simulated Transaction &bull; 100% Risk Free</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-purple flex-shrink-0" />
                <span>Express Pan-India Delivery (Simulated)</span>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CheckoutPage;

