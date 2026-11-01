import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Heart,
  ShoppingCart,
  Trash2,
  ArrowRight,
  Star,
  AlertCircle,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner } from '../components/LoadingSpinner';

export const WishlistPage: React.FC = () => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { wishlist, itemCount, isLoading, error, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleRemove = async (productId: string) => {
    setActionError(null);
    setActionMessage(null);
    setBusyId(productId);
    try {
      await removeFromWishlist(productId);
      setActionMessage('Item removed from wishlist.');
    } catch (err: any) {
      setActionError(err.message || 'Failed to remove item.');
    } finally {
      setBusyId(null);
    }
  };

  const handleMoveToCart = async (productId: string, productName: string) => {
    setActionError(null);
    setActionMessage(null);
    setBusyId(productId);
    try {
      await addToCart(productId, 1);
      await removeFromWishlist(productId);
      setActionMessage(`"${productName}" moved to your cart!`);
    } catch (err: any) {
      setActionError(err.message || 'Failed to move item to cart.');
    } finally {
      setBusyId(null);
    }
  };

  // 1. Loading State (Auth initialization or wishlist fetching)
  if (authLoading || (isLoading && !wishlist)) {
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
          Sign In to Access Your Wishlist
        </h1>
        <p className="text-muted text-sm max-w-md mx-auto mb-8">
          Save your favorite laptops, phones, and accessories to track price drops and purchase anytime from any device.
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
            Browse Catalog
          </Link>
        </div>
      </div>
    );
  }

  // 3. Empty State
  if (!wishlist || wishlist.items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="w-24 h-24 bg-lavender text-purple rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
          <Heart className="w-12 h-12" />
        </div>
        <h1 className="font-heading font-extrabold text-3xl text-ink mb-3">
          Your Wishlist is Empty
        </h1>
        <p className="text-muted text-sm max-w-md mx-auto mb-8">
          Explore our trending tech catalog and tap the heart icon on any product to save it here for later.
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-line gap-4 mb-8">
        <div>
          <h1 className="font-heading font-extrabold text-3xl text-ink">
            My Wishlist
          </h1>
          <p className="text-muted text-sm mt-1">
            Your saved favorites and tracked electronics.
          </p>
        </div>
        <span className="bg-lavender text-purple px-3 py-1.5 rounded-lg text-xs font-bold">
          {itemCount} item{itemCount !== 1 ? 's' : ''} saved
        </span>
      </div>

      {/* Notifications */}
      {actionMessage && (
        <div className="mb-6 p-4 bg-green/10 border border-green/20 text-green rounded-xl text-sm font-medium flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span>{actionMessage}</span>
        </div>
      )}

      {(error || actionError) && (
        <div className="mb-6 p-4 bg-red/10 border border-red/20 text-red rounded-xl text-sm font-medium flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{actionError || error}</span>
        </div>
      )}

      {/* Wishlist Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {wishlist.items.map((item) => (
          <article
            key={item.id}
            className="bg-surface rounded-brand border border-line overflow-hidden shadow-card hover:shadow-cardHover transition-all flex flex-col justify-between"
          >
            {/* Image Box */}
            <div className="relative aspect-[4/3] bg-bg overflow-hidden flex items-center justify-center p-4">
              {item.discountTag && (
                <span className="absolute top-3 left-3 z-10 bg-green text-white text-[11px] font-extrabold px-2.5 py-1 rounded-full shadow-sm tracking-wider uppercase">
                  {item.discountTag}
                </span>
              )}

              <button
                type="button"
                disabled={busyId === item.productId}
                onClick={() => handleRemove(item.productId)}
                className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-surface/90 text-red hover:bg-surface flex items-center justify-center shadow-sm transition-all"
                title="Remove from wishlist"
                aria-label={`Remove ${item.productName}`}
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <Link to={`/products/${item.productId}`} className="w-full h-full flex items-center justify-center">
                <img
                  src={item.productImage}
                  alt={item.productName}
                  className="w-full h-full object-contain mix-blend-multiply hover:scale-105 transition-transform"
                />
              </Link>
            </div>

            {/* Info */}
            <div className="p-5 flex-1 flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-bold text-muted uppercase tracking-wider block mb-1">
                  {item.categoryName}
                </span>

                <h3 className="font-heading font-bold text-base text-ink line-clamp-1 hover:text-purple transition-colors">
                  <Link to={`/products/${item.productId}`}>{item.productName}</Link>
                </h3>

                {/* Rating */}
                <div className="flex items-center gap-1.5 mt-2">
                  <div className="flex items-center text-amber-500 text-xs font-bold">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span className="ml-1 text-ink">{Number(item.rating).toFixed(1)}</span>
                  </div>
                  <span className="text-muted text-xs">({item.reviewsCount} reviews)</span>
                </div>
              </div>

              {/* Price & Actions */}
              <div className="mt-4 pt-4 border-t border-line/60">
                <div className="flex items-baseline gap-2 mb-3">
                  <span className="font-heading font-extrabold text-xl text-ink">
                    {formatPrice(item.price)}
                  </span>
                  {item.originalPrice > item.price && (
                    <del className="text-xs text-muted font-medium">
                      {formatPrice(item.originalPrice)}
                    </del>
                  )}
                </div>

                <div className="text-[11px] font-semibold mb-3">
                  {item.inStock ? (
                    <span className="text-green">● In Stock ({item.stockQuantity} units)</span>
                  ) : (
                    <span className="text-red">● Out of Stock</span>
                  )}
                </div>

                <button
                  type="button"
                  disabled={!item.inStock || busyId === item.productId}
                  onClick={() => handleMoveToCart(item.productId, item.productName)}
                  className="w-full py-2.5 px-4 bg-purple hover:bg-purple-dark disabled:bg-purple/40 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
                >
                  <ShoppingCart className="w-3.5 h-3.5" /> Move to Cart
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};
