import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShieldCheck, Truck, Headphones } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-ink text-white mt-auto pt-14 pb-8 border-t border-ink-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-white/10">
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple text-white font-heading font-extrabold flex items-center justify-center text-lg">
                T
              </div>
              <span className="font-heading font-extrabold text-xl tracking-tight text-white">
                Think<span className="text-purple-light">Mart</span>
              </span>
            </div>
            <p className="text-muted text-sm leading-relaxed">
              India's premier online tech retail platform. Discover authentic laptops, 5G smartphones, and audio gear with genuine warranty.
            </p>
            <div className="text-xs text-muted flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-green"></span>
              Secure 256-bit SSL encrypted checkout
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-white mb-4">Shop Catalogue</h4>
            <ul className="space-y-2.5 text-sm text-muted">
              <li>
                <Link to="/products?category=Laptops" className="hover:text-white transition-colors">
                  💻 Laptops &amp; Ultrabooks
                </Link>
              </li>
              <li>
                <Link to="/products?category=Smartphones" className="hover:text-white transition-colors">
                  📱 Flagship Smartphones
                </Link>
              </li>
              <li>
                <Link to="/products?category=Watches" className="hover:text-white transition-colors">
                  ⌚ Smartwatches
                </Link>
              </li>
              <li>
                <Link to="/products?category=Headphones" className="hover:text-white transition-colors">
                  🎧 Noise Cancelling Audio
                </Link>
              </li>
              <li>
                <Link to="/products?category=Accessories" className="hover:text-white transition-colors">
                  🔌 Fast Chargers &amp; Cables
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-white mb-4">Customer Care</h4>
            <ul className="space-y-2.5 text-sm text-muted">
              <li>
                <Link to="/about" className="hover:text-white transition-colors">
                  About ThinkMart
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition-colors">
                  Contact &amp; Helpline
                </Link>
              </li>
              <li>
                <span className="hover:text-white transition-colors cursor-pointer">
                  Track Delivery
                </span>
              </li>
              <li>
                <span className="hover:text-white transition-colors cursor-pointer">
                  7-Day Return Policy
                </span>
              </li>
              <li>
                <span className="hover:text-white transition-colors cursor-pointer">
                  Warranty Claim
                </span>
              </li>
            </ul>
          </div>

          {/* Delivery & Guarantees */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-white mb-4">ThinkMart Promise</h4>
            <div className="flex items-start gap-3 text-sm text-muted">
              <Truck className="w-5 h-5 text-purple-light flex-shrink-0 mt-0.5" />
              <span><strong>Free Shipping:</strong> On all orders above ₹999 pan-India.</span>
            </div>
            <div className="flex items-start gap-3 text-sm text-muted">
              <ShieldCheck className="w-5 h-5 text-green flex-shrink-0 mt-0.5" />
              <span><strong>100% Genuine:</strong> Direct from brand authorized distributors.</span>
            </div>
            <div className="flex items-start gap-3 text-sm text-muted">
              <Headphones className="w-5 h-5 text-orange flex-shrink-0 mt-0.5" />
              <span><strong>24/7 Helpline:</strong> Dedicated support for all purchases.</span>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted">
          <p>© 2026 ThinkMart India. Full-Stack E-Commerce Demonstration.</p>
          <p className="flex items-center gap-1">
            Built with React, TypeScript, Tailwind CSS &amp; Spring Boot <Heart className="w-3.5 h-3.5 text-red fill-red" />
          </p>
        </div>
      </div>
    </footer>
  );
};

