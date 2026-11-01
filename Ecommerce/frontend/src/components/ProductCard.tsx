import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Star, ShoppingCart, Eye, Heart, Check } from 'lucide-react';
import { ProductSummary } from '../types';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';

interface ProductCardProps {
  product: ProductSummary;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const navigate = useNavigate();

  const [isAdding, setIsAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const saved = isInWishlist(product.id);

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

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    try {
      await toggleWishlist(product.id);
    } catch {
      // Ignored or handled by context
    }
  };

  const handleQuickAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setIsAdding(true);
    try {
      await addToCart(product.id, 1);
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 2000);
    } catch {
      // Handled
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <article className="bg-surface rounded-brand border border-line overflow-hidden shadow-card hover:shadow-cardHover transition-all duration-300 hover:-translate-y-1 flex flex-col group">
      {/* Product Image Box */}
      <div className="relative aspect-[4/3] bg-bg overflow-hidden flex items-center justify-center p-4">
        {product.discountTag && (
          <span className="absolute top-3 left-3 z-10 bg-green text-white text-[11px] font-extrabold px-2.5 py-1 rounded-full shadow-sm tracking-wider uppercase">
            {product.discountTag}
          </span>
        )}

        {/* Wishlist toggle button */}
        <button
          type="button"
          onClick={handleWishlistToggle}
          className={`absolute top-3 right-3 z-20 w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-all ${
            saved
              ? 'bg-red text-white hover:bg-red/90'
              : 'bg-surface/90 text-muted hover:text-red hover:bg-surface'
          }`}
          title={saved ? 'Remove from wishlist' : 'Save to wishlist'}
          aria-label={saved ? 'Remove from wishlist' : 'Save to wishlist'}
        >
          <Heart className={`w-4 h-4 ${saved ? 'fill-current' : ''}`} />
        </button>

        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        {/* Quick view button overlay */}
        <Link
          to={`/products/${product.id}`}
          className="absolute inset-0 bg-ink/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
          aria-label={`View ${product.name}`}
        >
          <span className="bg-surface text-ink px-4 py-2 rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 transform translate-y-2 group-hover:translate-y-0 transition-transform">
            <Eye className="w-3.5 h-3.5" /> View Details
          </span>
        </Link>
      </div>

      {/* Info Section */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="text-[11px] font-bold text-muted uppercase tracking-wider mb-1">
            {product.brand} • {product.categoryName}
          </div>

          <h3 className="font-heading font-bold text-base text-ink line-clamp-1 group-hover:text-purple transition-colors">
            <Link to={`/products/${product.id}`}>{product.name}</Link>
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1.5 mt-2">
            <div className="flex items-center text-amber-500 text-xs font-bold">
              <Star className="w-3.5 h-3.5 fill-current" />
              <span className="ml-1 text-ink">{product.rating.toFixed(1)}</span>
            </div>
            <span className="text-muted text-xs">({product.reviewsCount} reviews)</span>
          </div>
        </div>

        {/* Pricing & CTA */}
        <div className="mt-4 pt-3 border-t border-line/60">
          <div className="flex items-baseline gap-2 mb-3">
            <span className="font-heading font-extrabold text-xl text-ink">
              {formattedPrice}
            </span>
            {product.originalPrice > product.price && (
              <del className="text-xs text-muted font-medium">
                {formattedOriginalPrice}
              </del>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={!product.inStock || isAdding}
              onClick={handleQuickAddToCart}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm ${
                justAdded
                  ? 'bg-green text-white'
                  : 'bg-purple hover:bg-purple-dark disabled:bg-purple/40 text-white hover:shadow'
              }`}
              title="Add 1 unit to cart"
            >
              {justAdded ? (
                <>
                  <Check className="w-3.5 h-3.5" /> Added!
                </>
              ) : (
                <>
                  <ShoppingCart className="w-3.5 h-3.5" /> Add to Cart
                </>
              )}
            </button>
            <Link
              to={`/products/${product.id}`}
              className="py-2.5 px-3 bg-bg hover:bg-lavender text-ink border border-line rounded-xl text-xs font-bold transition-colors flex items-center justify-center"
              title="View Specs"
              aria-label="View Specs"
            >
              <Eye className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
};

