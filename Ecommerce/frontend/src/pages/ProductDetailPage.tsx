import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Star, ShieldCheck, Truck, RefreshCw, ChevronRight, ShoppingCart, ArrowLeft, CheckCircle2, Heart, AlertCircle } from 'lucide-react';
import { ProductDetail } from '../types';
import { getProductById } from '../services/api';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner } from '../components/LoadingSpinner';

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [addedNotice, setAddedNotice] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      try {
        setLoading(true);
        setError(null);
        const data = await getProductById(id);
        setProduct(data);
      } catch (err: unknown) {
        console.error('Failed to load product details:', err);
        setError('Product not found or currently unavailable. Please check the catalog.');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    if (!product) return;
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setActionError(null);
    setIsSubmitting(true);
    try {
      await addToCart(product.id, quantity);
      setAddedNotice(true);
      setTimeout(() => setAddedNotice(false), 4000);
    } catch (err: any) {
      setActionError(err.message || 'Failed to add item to cart.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleWishlist = async () => {
    if (!product) return;
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setActionError(null);
    try {
      await toggleWishlist(product.id);
    } catch (err: any) {
      setActionError(err.message || 'Failed to update wishlist.');
    }
  };

  if (loading) {
    return <LoadingSpinner text="Fetching product specifications..." />;
  }

  if (error || !product) {
    return (
      <div className="max-w-3xl mx-auto py-16 px-4 text-center space-y-4">
        <div className="text-5xl">⚠️</div>
        <h2 className="font-heading font-bold text-2xl text-ink">Product Unavailable</h2>
        <p className="text-muted text-sm">{error || 'The requested product could not be found.'}</p>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple text-white text-xs font-bold rounded-xl shadow-md hover:bg-purple-dark transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Catalogue
        </Link>
      </div>
    );
  }

  const formattedPrice = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(product.price);

  const formattedOriginalPrice = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(product.originalPrice);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-muted font-medium flex-wrap" aria-label="Breadcrumb">
        <Link to="/" className="hover:text-purple transition-colors">Home</Link>
        <ChevronRight className="w-3.5 h-3.5 text-line" />
        <Link to="/products" className="hover:text-purple transition-colors">Products</Link>
        <ChevronRight className="w-3.5 h-3.5 text-line" />
        <Link to={`/products?category=${encodeURIComponent(product.categorySlug)}`} className="hover:text-purple transition-colors">
          {product.categoryName}
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-line" />
        <span className="text-ink font-semibold truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Main Product Showcase Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 bg-surface rounded-3xl border border-line p-6 sm:p-10 shadow-card">
        {/* Left Column: Image Area */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center p-6 bg-bg rounded-2xl relative border border-line/60">
          {product.discountTag && (
            <span className="absolute top-4 left-4 bg-green text-white text-xs font-extrabold px-3 py-1 rounded-full shadow-sm tracking-wider uppercase">
              {product.discountTag}
            </span>
          )}

          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full max-h-[380px] object-contain mix-blend-multiply"
          />

          <div className="mt-4 flex items-center gap-2 text-xs text-muted font-semibold">
            <CheckCircle2 className="w-4 h-4 text-green" />
            <span>Verified Genuine Product • Tax Invoice Included</span>
          </div>
        </div>

        {/* Right Column: Details & Actions */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            {/* Category & Brand Header */}
            <div className="flex items-center gap-2 text-xs font-extrabold text-muted uppercase tracking-wider">
              <span>{product.brand}</span>
              <span>•</span>
              <span className="text-purple">{product.categoryName}</span>
            </div>

            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-ink leading-tight">
              {product.name}
            </h1>

            {/* Ratings Bar */}
            <div className="flex items-center gap-3">
              <div className="flex items-center bg-amber-500/10 text-amber-600 px-2.5 py-1 rounded-lg text-xs font-bold gap-1">
                <Star className="w-4 h-4 fill-current text-amber-500" />
                <span>{product.rating.toFixed(1)}</span>
              </div>
              <span className="text-xs text-muted font-medium">({product.reviewsCount} customer reviews)</span>
              <span className="text-line">|</span>
              <span className="text-xs font-bold text-green flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Official Warranty
              </span>
            </div>

            {/* Price Row */}
            <div className="pt-2 pb-3 border-y border-line space-y-1">
              <div className="flex items-baseline gap-3">
                <span className="font-heading font-extrabold text-3xl sm:text-4xl text-ink">
                  {formattedPrice}
                </span>
                {product.originalPrice > product.price && (
                  <del className="text-base text-muted font-medium">
                    {formattedOriginalPrice}
                  </del>
                )}
                {product.discountTag && (
                  <span className="text-xs font-extrabold text-green bg-green/10 px-2.5 py-0.5 rounded-full">
                    {product.discountTag}
                  </span>
                )}
              </div>
              <p className="text-xs text-muted">
                Inclusive of 5% GST • <strong>FREE Shipping</strong> for orders of ₹999 or more
              </p>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted">Overview</h3>
              <p className="text-sm text-ink leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Stock Quantity */}
            <div className="flex items-center gap-2 text-xs">
              <span className="font-bold text-ink">Availability:</span>
              {product.stockQuantity > 0 ? (
                <span className="text-green font-bold flex items-center gap-1">
                  ● In Stock ({product.stockQuantity} units available)
                </span>
              ) : (
                <span className="text-red font-bold">● Out of Stock</span>
              )}
            </div>

            {/* Quantity Selector & Action Buttons */}
            <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="flex items-center border border-line rounded-xl bg-bg w-32 justify-between p-1">
                <button
                  type="button"
                  disabled={quantity <= 1}
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-8 h-8 rounded-lg bg-surface text-ink font-bold disabled:opacity-40 flex items-center justify-center hover:bg-lavender"
                >
                  -
                </button>
                <span className="text-sm font-bold text-ink">{quantity}</span>
                <button
                  type="button"
                  disabled={quantity >= product.stockQuantity}
                  onClick={() => setQuantity((q) => Math.min(product.stockQuantity, q + 1))}
                  className="w-8 h-8 rounded-lg bg-surface text-ink font-bold disabled:opacity-40 flex items-center justify-center hover:bg-lavender"
                >
                  +
                </button>
              </div>

              <button
                type="button"
                disabled={product.stockQuantity <= 0 || isSubmitting}
                onClick={handleAddToCart}
                className="flex-1 py-3.5 px-6 bg-purple hover:bg-purple-dark disabled:bg-purple/40 text-white font-bold rounded-xl shadow-lg hover:shadow-purple/30 transition-all flex items-center justify-center gap-2 text-sm"
              >
                <ShoppingCart className="w-4 h-4" /> {isSubmitting ? 'Adding...' : `Add to Cart (${quantity})`}
              </button>

              <button
                type="button"
                onClick={handleToggleWishlist}
                className={`p-3.5 rounded-xl border transition-all flex items-center justify-center ${
                  isInWishlist(product.id)
                    ? 'bg-red text-white border-red'
                    : 'bg-surface text-ink border-line hover:border-red hover:text-red'
                }`}
                title={isInWishlist(product.id) ? 'Remove from Wishlist' : 'Add to Wishlist'}
                aria-label="Toggle Wishlist"
              >
                <Heart className={`w-5 h-5 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
              </button>
            </div>

            {actionError && (
              <div className="p-3 bg-red/10 border border-red/20 text-red rounded-xl text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{actionError}</span>
              </div>
            )}

            {addedNotice && (
              <div className="p-3 bg-green/10 border border-green/20 text-green rounded-xl text-xs font-bold flex items-center justify-between gap-2 animate-fade-in">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  <span>Added {quantity} unit(s) of {product.name} to your cart.</span>
                </div>
                <Link to="/cart" className="underline hover:text-green font-extrabold text-xs">
                  View Cart →
                </Link>
              </div>
            )}
          </div>

          {/* Guarantees Box */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-6 border-t border-line text-xs text-muted">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-purple flex-shrink-0" />
              <span>Pan-India Express Delivery</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-green flex-shrink-0" />
              <span>1-Year Official Warranty</span>
            </div>
            <div className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-orange flex-shrink-0" />
              <span>7-Day Replacement Guarantee</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

