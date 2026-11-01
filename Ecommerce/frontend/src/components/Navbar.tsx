import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, ShoppingBag, Heart, User as UserIcon, LogOut, Shield, Package } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { totalItems: cartCount } = useCart();
  const { itemCount: wishlistCount } = useWishlist();
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/products');
    }
  };

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <>
      {/* Top Demo Notice Banner */}
      <div className="bg-ink text-white text-xs py-2 px-4 text-center font-medium tracking-wide">
        <span className="bg-purple text-white px-2 py-0.5 rounded text-[10px] font-bold mr-2 uppercase">
          Festive Tech Sale
        </span>
        Up to 30% Off top brand laptops, smartphones &amp; audio gear! • Free Shipping on orders &ge; ₹999
      </div>

      {/* Main Site Header */}
      <header className="bg-surface sticky top-0 z-50 border-b border-line shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group flex-shrink-0" aria-label="ThinkMart Home">
            <div className="w-10 h-10 rounded-xl bg-purple text-white font-heading font-extrabold flex items-center justify-center text-xl shadow-md group-hover:scale-105 transition-transform">
              T
            </div>
            <div>
              <span className="font-heading font-extrabold text-2xl tracking-tight text-ink">
                Think<span className="text-purple">Mart</span>
              </span>
              <span className="block text-[10px] tracking-widest text-muted font-bold -mt-1">
                INDIAN TECH STORE
              </span>
            </div>
          </Link>

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-md relative">
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search electronics, laptops, phones..."
              className="w-full pl-4 pr-10 py-2.5 bg-bg border border-line rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple/30 focus:border-purple transition-all"
            />
            <button
              type="submit"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-purple transition-colors"
              aria-label="Search"
            >
              <Search className="w-4 h-4" />
            </button>
          </form>

          {/* Navigation Links */}
          <nav className="flex items-center gap-1 sm:gap-4">
            <Link
              to="/"
              className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                isActive('/') && location.pathname === '/'
                  ? 'text-purple bg-lavender'
                  : 'text-muted hover:text-ink'
              }`}
            >
              Home
            </Link>

            <Link
              to="/products"
              className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                isActive('/products')
                  ? 'text-purple bg-lavender'
                  : 'text-muted hover:text-ink'
              }`}
            >
              Products
            </Link>

            <Link
              to="/about"
              className={`hidden lg:inline-block px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                isActive('/about')
                  ? 'text-purple bg-lavender'
                  : 'text-muted hover:text-ink'
              }`}
            >
              About
            </Link>

            <Link
              to="/contact"
              className={`hidden lg:inline-block px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                isActive('/contact')
                  ? 'text-purple bg-lavender'
                  : 'text-muted hover:text-ink'
              }`}
            >
              Contact
            </Link>

            {/* Wishlist Link */}
            <Link
              to="/wishlist"
              className="relative p-2 text-ink hover:text-red transition-colors"
              title="My Wishlist"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {wishlistCount > 99 ? '99+' : wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart Link */}
            <Link
              to="/cart"
              className="relative p-2 text-ink hover:text-purple transition-colors"
              title="Shopping Cart"
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-purple text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Link>

            {/* Orders Link (Authenticated) */}
            {isAuthenticated && (
              <Link
                to="/orders"
                className={`p-2 transition-colors ${
                  isActive('/orders') ? 'text-purple' : 'text-ink hover:text-purple'
                }`}
                title="My Orders"
                aria-label="My Orders"
              >
                <Package className="w-5 h-5" />
              </Link>
            )}

            {/* Admin Operations Link (ROLE_ADMIN Only) */}
            {isAuthenticated && user?.role === 'ROLE_ADMIN' && (
              <Link
                to="/admin"
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                  isActive('/admin')
                    ? 'bg-purple text-white shadow-sm'
                    : 'bg-lavender text-purple hover:bg-purple/20'
                }`}
                title="Admin Console"
              >
                <Shield className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Admin</span>
              </Link>
            )}

            {/* Auth Section */}
            {isAuthenticated && user ? (
              <div className="flex items-center gap-2 pl-2 border-l border-line">
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-xs font-bold text-ink leading-tight">{user.fullName}</span>
                  <span className="text-[10px] font-semibold text-purple flex items-center justify-end gap-1">
                    {user.role === 'ROLE_ADMIN' && <Shield className="w-2.5 h-2.5" />}
                    {user.role === 'ROLE_ADMIN' ? 'Admin' : 'Customer'}
                  </span>
                </div>
                <button
                  onClick={logout}
                  className="p-2 text-muted hover:text-red transition-colors"
                  title="Logout"
                  aria-label="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-bold text-purple hover:bg-lavender rounded-xl transition-all"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 text-sm font-bold text-white bg-purple hover:bg-purple-dark rounded-xl shadow-md hover:shadow-lg transition-all"
                >
                  <UserIcon className="w-4 h-4" />
                  Register
                </Link>
              </div>
            )}
          </nav>
        </div>
      </header>
    </>
  );
};

