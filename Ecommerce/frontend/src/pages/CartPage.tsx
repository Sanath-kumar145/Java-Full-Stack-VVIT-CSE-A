import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBag,
  Trash2,
  ArrowRight,
  ShieldCheck,
  Truck,
  RotateCcw,
  AlertCircle,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner } from '../components/LoadingSpinner';

export const CartPage: React.FC = () => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const {
    cart,
    totalItems,
    isLoading,
    error,
    updateQuantity,
    removeFromCart,
    clearCart,
  } = useCart();

  const [actionError, setActionError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleUpdate = async (productId: string, newQty: number) => {
    setActionError(null);
    setUpdatingId(productId);
    try {
      await updateQuantity(productId, newQty);
    } catch (err: any) {
      setActionError(err.message || 'Failed to update quantity.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRemove = async (productId: string) => {
    setActionError(null);
    setUpdatingId(productId);
    try {
      await removeFromCart(productId);
    } catch (err: any) {
      setActionError(err.message || 'Failed to remove item.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleClear = async () => {
    if (window.confirm('Are you sure you want to clear your entire cart?')) {
      setActionError(null);
      try {
        await clearCart();
      } catch (err: any) {
        setActionError(err.message || 'Failed to clear cart.');
      }
    }
  };

  // 1. Loading State (Auth initialization or cart fetching)
  if (authLoading || (isLoading && !cart)) {
    return <LoadingSpinner />;
  }

  // 2. Unauthenticated View
  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="w-20 h-20 bg-lavender text-purple rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
          <Lock className="w-10 h-10" />
        </div>
        <h1 className="font-heading font-extrabold text-3xl text-ink mb-3">
          Sign In to Access Your Cart
        </h1>
        <p className="text-muted text-sm max-w-md mx-auto mb-8">
          Sign in or create an account to view your saved products, manage items, and enjoy seamless multi-device checkout.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/login"
            className="w-full sm:w-auto px-8 py-3.5 bg-purple hover:bg-purple-dark text-white font-bold rounded-xl shadow-md transition-all text-sm"
          >
            Sign In Now
          </Link>
          <Link
            to="/products"
            className="w-full sm:w-auto px-8 py-3.5 bg-surface hover:bg-lavender text-ink border border-line font-bold rounded-xl transition-all text-sm"
          >
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  // 3. Empty Cart State
  if (!cart || cart.items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="w-24 h-24 bg-lavender text-purple rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
          <ShoppingBag className="w-12 h-12" />
        </div>
        <h1 className="font-heading font-extrabold text-3xl text-ink mb-3">
          Your Shopping Cart is Empty
        </h1>
        <p className="text-muted text-sm max-w-md mx-auto mb-8">
          Looks like you haven't added any tech essentials yet. Browse our curated collection of laptops, smartphones, and accessories.
        </p>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 px-8 py-3.5 bg-purple hover:bg-purple-dark text-white font-bold rounded-xl shadow-md transition-all text-sm"
        >
          Explore Catalog <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  const freeShippingProgress = Math.min(100, Math.round((cart.subtotal / cart.freeShippingThreshold) * 100));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Title & Stats */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-line gap-4 mb-8">
        <div>
          <h1 className="font-heading font-extrabold text-3xl text-ink">
            Shopping Cart
          </h1>
          <p className="text-muted text-sm mt-1">
            Review your selected items, adjust quantities, and verify order totals.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="bg-lavender text-purple px-3 py-1.5 rounded-lg text-xs font-bold">
            {totalItems} item{totalItems !== 1 ? 's' : ''} in cart
          </span>
          <button
            type="button"
            onClick={handleClear}
            className="text-xs font-bold text-red hover:underline flex items-center gap-1 p-1"
          >
            <Trash2 className="w-3.5 h-3.5" /> Clear Cart
          </button>
        </div>
      </div>

      {/* Global & Action Errors */}
      {(error || actionError) && (
        <div className="mb-6 p-4 bg-red/10 border border-red/20 text-red rounded-xl text-sm font-medium flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{actionError || error}</span>
        </div>
      )}

      {/* Free Shipping Alert Banner */}
      <div className="mb-8 p-4 bg-surface rounded-brand border border-line shadow-card">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-xs font-bold text-ink">
            <Truck className="w-4 h-4 text-purple" />
            {cart.eligibleForFreeShipping ? (
              <span className="text-green flex items-center gap-1 font-bold">
                <CheckCircle2 className="w-4 h-4" /> You have unlocked FREE Express Pan-India Delivery!
              </span>
            ) : (
              <span>
                Add <span className="text-purple font-extrabold">{formatPrice(cart.amountNeededForFreeShipping)}</span> more to unlock FREE Delivery!
              </span>
            )}
          </div>
          <span className="text-xs font-bold text-muted">{freeShippingProgress}%</span>
        </div>
        <div className="w-full bg-bg h-2 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 rounded-full ${
              cart.eligibleForFreeShipping ? 'bg-green' : 'bg-purple'
            }`}
            style={{ width: `${freeShippingProgress}%` }}
          />
        </div>
      </div>

      {/* Grid: Items + Order Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Cart Items List */}
        <div className="lg:col-span-8 space-y-4">
          {cart.items.map((item) => (
            <div
              key={item.id}
              className="bg-surface rounded-brand border border-line p-5 shadow-card hover:shadow-cardHover transition-all flex flex-col sm:flex-row items-center gap-5"
            >
              {/* Product Thumbnail */}
              <Link
                to={`/products/${item.productId}`}
                className="w-24 h-24 bg-bg rounded-xl p-2 flex-shrink-0 flex items-center justify-center border border-line/60"
              >
                <img
                  src={item.productImage}
                  alt={item.productName}
                  className="w-full h-full object-contain mix-blend-multiply hover:scale-105 transition-transform"
                />
              </Link>

              {/* Product Info */}
              <div className="flex-1 text-center sm:text-left">
                <span className="text-[11px] font-bold text-muted uppercase tracking-wider">
                  {item.categoryName}
                </span>
                <h3 className="font-heading font-bold text-base text-ink line-clamp-1 hover:text-purple transition-colors">
                  <Link to={`/products/${item.productId}`}>{item.productName}</Link>
                </h3>
                <div className="text-xs font-bold text-purple mt-1">
                  Unit Price: {formatPrice(item.unitPrice)}
                </div>
                <div className="text-[11px] text-muted mt-1">
                  {item.inStock ? (
                    <span className="text-green font-medium">● In Stock ({item.availableStock} available)</span>
                  ) : (
                    <span className="text-red font-medium">● Currently Out of Stock</span>
                  )}
                </div>
              </div>

              {/* Quantity Controls */}
              <div className="flex items-center border border-line rounded-xl bg-bg p-1">
                <button
                  type="button"
                  disabled={item.quantity <= 1 || updatingId === item.productId}
                  onClick={() => handleUpdate(item.productId, item.quantity - 1)}
                  className="w-7 h-7 rounded-lg bg-surface text-ink font-bold disabled:opacity-40 flex items-center justify-center hover:bg-lavender text-xs transition-colors"
                  aria-label="Decrease quantity"
                >
                  -
                </button>
                <span className="w-8 text-center text-xs font-bold text-ink">
                  {item.quantity}
                </span>
                <button
                  type="button"
                  disabled={item.quantity >= item.availableStock || item.quantity >= 99 || updatingId === item.productId}
                  onClick={() => handleUpdate(item.productId, item.quantity + 1)}
                  className="w-7 h-7 rounded-lg bg-surface text-ink font-bold disabled:opacity-40 flex items-center justify-center hover:bg-lavender text-xs transition-colors"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>

              {/* Item Total & Remove */}
              <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-28 gap-2 pt-3 sm:pt-0 border-t sm:border-t-0 border-line">
                <div className="font-heading font-extrabold text-base text-ink">
                  {formatPrice(item.itemTotal)}
                </div>
                <button
                  type="button"
                  disabled={updatingId === item.productId}
                  onClick={() => handleRemove(item.productId)}
                  className="text-xs font-bold text-muted hover:text-red transition-colors flex items-center gap-1"
                  title="Remove item"
                  aria-label={`Remove ${item.productName}`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="sm:inline">Remove</span>
                </button>
              </div>
            </div>
          ))}

          {/* Continue Shopping Link */}
          <div className="pt-4">
            <Link
              to="/products"
              className="text-sm font-bold text-purple hover:underline inline-flex items-center gap-1.5"
            >
              ← Continue Shopping
            </Link>
          </div>
        </div>

        {/* Right Column: Order Summary Card */}
        <div className="lg:col-span-4 bg-surface rounded-brand border border-line p-6 shadow-card sticky top-28">
          <h2 className="font-heading font-extrabold text-xl text-ink pb-4 border-b border-line">
            Order Summary
          </h2>

          <div className="space-y-3 py-4 border-b border-line text-sm">
            <div className="flex items-center justify-between text-muted">
              <span>Items Subtotal ({totalItems} units)</span>
              <span className="font-bold text-ink">{formatPrice(cart.subtotal)}</span>
            </div>

            <div className="flex items-center justify-between text-muted">
              <span>GST Tax (5% Standard)</span>
              <span className="font-bold text-ink">{formatPrice(cart.tax)}</span>
            </div>

            <div className="flex items-center justify-between text-muted">
              <span>Pan-India Shipping</span>
              {cart.eligibleForFreeShipping ? (
                <span className="font-extrabold text-green uppercase text-xs">FREE</span>
              ) : (
                <span className="font-bold text-ink">{formatPrice(cart.shippingFee)}</span>
              )}
            </div>
          </div>

          <div className="py-4 border-b border-line flex items-baseline justify-between">
            <div>
              <span className="font-heading font-extrabold text-lg text-ink">Total Amount</span>
              <span className="block text-[11px] text-muted font-medium">Inclusive of all taxes</span>
            </div>
            <span className="font-heading font-extrabold text-2xl text-purple">
              {formatPrice(cart.grandTotal)}
            </span>
          </div>

          {/* Checkout CTA */}
          <div className="pt-6">
            <Link
              to="/checkout"
              className="w-full py-4 bg-purple hover:bg-purple-dark text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <p className="text-[11px] text-center text-muted font-medium mt-2">
              Simulated Checkout &bull; Address &amp; Payment Verification
            </p>
          </div>

          {/* Value Props */}
          <div className="mt-6 pt-6 border-t border-line space-y-2.5 text-xs text-muted">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-green flex-shrink-0" />
              <span>100% Secure SSL 256-Bit Checkout</span>
            </div>
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-purple flex-shrink-0" />
              <span>Free Delivery on all orders &ge; ₹999</span>
            </div>
            <div className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-orange flex-shrink-0" />
              <span>7-Day Replacement Guarantee</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
