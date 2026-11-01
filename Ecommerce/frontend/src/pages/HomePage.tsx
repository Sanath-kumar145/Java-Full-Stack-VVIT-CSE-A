import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Truck, ShieldCheck, RefreshCw, Headphones, ArrowRight } from 'lucide-react';
import { ProductSummary, Category } from '../types';
import { getCategories, getFeaturedProducts } from '../services/api';
import { ProductCard } from '../components/ProductCard';
import { LoadingSpinner } from '../components/LoadingSpinner';

export const HomePage: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<ProductSummary[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [featuredRes, categoriesRes] = await Promise.all([
          getFeaturedProducts(),
          getCategories(),
        ]);
        setFeaturedProducts(featuredRes);
        setCategories(categoriesRes);
      } catch (err: unknown) {
        console.error('Error loading homepage data:', err);
        setError('Could not connect to ThinkMart catalog API. Ensure backend is running.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="space-y-16 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-ink via-ink-light to-purple-dark text-white p-8 sm:p-12 lg:p-16 shadow-xl">
        <div className="max-w-2xl relative z-10 space-y-6">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/10 backdrop-blur-md text-purple-light uppercase tracking-wider">
            ✨ Next-Gen Shopping Experience
          </span>
          <h1 className="font-heading font-extrabold text-3xl sm:text-5xl lg:text-6xl tracking-tight leading-tight">
            Upgrade Your Tech Lifestyle with <span className="text-purple-light">ThinkMart</span>
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-xl">
            Explore authentic gadgets, flagship smartphones, powerful laptops, and premium audio with verified warranties and express pan-India delivery.
          </p>
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link
              to="/products"
              className="px-6 py-3.5 bg-purple hover:bg-purple-light text-white font-bold rounded-xl shadow-lg hover:shadow-purple/50 transition-all flex items-center gap-2"
            >
              🛍️ Shop All Products
            </Link>
            <Link
              to="/products?category=Laptops"
              className="px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl backdrop-blur-md transition-all flex items-center gap-2"
            >
              💻 Explore Laptops
            </Link>
          </div>
        </div>

        {/* Decorative background badges */}
        <div className="hidden lg:flex absolute right-12 top-1/2 -translate-y-1/2 text-8xl opacity-80 select-none animate-pulse">
          💻📱🎧
        </div>
      </section>

      {/* Trust Benefits Strip */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 py-2">
        <div className="flex items-center gap-4 p-5 bg-surface rounded-2xl border border-line shadow-card">
          <div className="w-12 h-12 rounded-xl bg-purple/10 text-purple flex items-center justify-center flex-shrink-0">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-ink">Free Shipping</h4>
            <p className="text-xs text-muted mt-0.5">On all orders above ₹999 across India</p>
          </div>
        </div>

        <div className="flex items-center gap-4 p-5 bg-surface rounded-2xl border border-line shadow-card">
          <div className="w-12 h-12 rounded-xl bg-green/10 text-green flex items-center justify-center flex-shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-ink">100% Genuine</h4>
            <p className="text-xs text-muted mt-0.5">Official brand warranty &amp; tax invoice</p>
          </div>
        </div>

        <div className="flex items-center gap-4 p-5 bg-surface rounded-2xl border border-line shadow-card">
          <div className="w-12 h-12 rounded-xl bg-orange/10 text-orange flex items-center justify-center flex-shrink-0">
            <RefreshCw className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-ink">7-Day Easy Return</h4>
            <p className="text-xs text-muted mt-0.5">No-questions-asked replacement policy</p>
          </div>
        </div>

        <div className="flex items-center gap-4 p-5 bg-surface rounded-2xl border border-line shadow-card">
          <div className="w-12 h-12 rounded-xl bg-purple/10 text-purple flex items-center justify-center flex-shrink-0">
            <Headphones className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-ink">24/7 Expert Support</h4>
            <p className="text-xs text-muted mt-0.5">Dedicated customer helpline assistance</p>
          </div>
        </div>
      </section>

      {/* Shop by Category Section */}
      <section className="space-y-6">
        <div className="text-center space-y-1">
          <span className="text-xs font-extrabold text-purple tracking-widest uppercase">
            Browse Catalogue
          </span>
          <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-ink">
            Shop by Category
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/products?category=${encodeURIComponent(cat.slug)}`}
              className="p-6 bg-surface hover:bg-lavender/50 rounded-2xl border border-line shadow-card hover:shadow-cardHover text-center transition-all duration-300 hover:-translate-y-1 group"
            >
              <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">{cat.icon}</div>
              <h3 className="font-heading font-bold text-sm sm:text-base text-ink group-hover:text-purple transition-colors">
                {cat.name}
              </h3>
              <p className="text-xs text-muted mt-1 line-clamp-1">{cat.description}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="space-y-6">
        <div className="flex items-end justify-between flex-wrap gap-4 border-b border-line pb-4">
          <div>
            <span className="text-xs font-extrabold text-purple tracking-widest uppercase">
              Handpicked For You
            </span>
            <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-ink">
              Featured Products
            </h2>
          </div>
          <Link
            to="/products"
            className="text-sm font-bold text-purple hover:text-purple-dark flex items-center gap-1 group transition-colors"
          >
            View All 12 Products
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {loading ? (
          <LoadingSpinner text="Loading featured ThinkMart products..." />
        ) : error ? (
          <div className="bg-red/10 border border-red/20 text-red p-4 rounded-xl text-center text-sm">
            {error}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Promotional Festive Banner */}
      <section className="rounded-3xl bg-gradient-to-r from-ink via-ink-light to-purple-dark text-white p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl">
        <div className="space-y-3 max-w-xl">
          <span className="bg-orange text-white text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
            Festival Offer
          </span>
          <h3 className="font-heading font-extrabold text-2xl sm:text-3xl">
            Save Big with Exclusive Bank Discounts
          </h3>
          <p className="text-slate-300 text-sm leading-relaxed">
            Get instant ₹2,000 flat discount on UPI and credit card transactions for all orders over ₹49,990. Plus, enjoy 5% GST transparent pricing.
          </p>
        </div>
        <Link
          to="/products"
          className="px-6 py-3.5 bg-orange hover:bg-orange/90 text-white font-bold rounded-xl shadow-lg transition-all flex-shrink-0"
        >
          Grab Festive Deals →
        </Link>
      </section>
    </div>
  );
};

