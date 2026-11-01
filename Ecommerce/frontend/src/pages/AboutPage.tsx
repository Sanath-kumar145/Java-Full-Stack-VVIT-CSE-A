import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Zap, Users, Award, Truck, Heart } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-ink via-ink-light to-purple-dark text-white rounded-3xl p-8 sm:p-14 lg:p-16 flex flex-col md:flex-row items-center justify-between gap-10 shadow-xl">
        <div className="max-w-2xl space-y-5">
          <span className="text-xs font-extrabold text-purple-light uppercase tracking-widest px-3 py-1 bg-white/10 rounded-full">
            Our Journey &amp; Purpose
          </span>
          <h1 className="font-heading font-extrabold text-3xl sm:text-5xl leading-tight">
            Democratising Tech Access <span className="text-purple-light">Across India</span>
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Founded with a passion for innovation, ThinkMart bridges the gap between premium global electronics brands and tech enthusiasts with authentic products, transparent pricing, and fast fulfillment.
          </p>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-6 py-3.5 bg-purple hover:bg-purple-light text-white font-bold rounded-xl shadow-lg transition-all"
          >
            Explore Catalogue →
          </Link>
        </div>

        <div className="hidden lg:flex flex-col items-center justify-center p-8 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-md text-center space-y-2">
          <span className="text-5xl font-extrabold text-purple-light font-heading">100K+</span>
          <span className="text-xs uppercase font-bold tracking-wider text-slate-300">Satisfied Tech Shoppers</span>
        </div>
      </section>

      {/* Core Values */}
      <section className="space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="text-xs font-extrabold text-purple tracking-widest uppercase">What Drives Us</span>
          <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-ink">Our Core Values</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 bg-surface rounded-2xl border border-line shadow-card space-y-3">
            <div className="w-12 h-12 rounded-xl bg-purple/10 text-purple flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-heading font-bold text-lg text-ink">100% Authenticity</h3>
            <p className="text-muted text-sm leading-relaxed">
              Every laptop, smartphone, and audio device is sourced directly from brand-authorized distribution partners with official warranty.
            </p>
          </div>

          <div className="p-8 bg-surface rounded-2xl border border-line shadow-card space-y-3">
            <div className="w-12 h-12 rounded-xl bg-green/10 text-green flex items-center justify-center">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="font-heading font-bold text-lg text-ink">Transparent Pricing</h3>
            <p className="text-muted text-sm leading-relaxed">
              No hidden fees. Every product displays clear INR pricing, savings tags, 5% standard GST, and free shipping for orders over ₹999.
            </p>
          </div>

          <div className="p-8 bg-surface rounded-2xl border border-line shadow-card space-y-3">
            <div className="w-12 h-12 rounded-xl bg-orange/10 text-orange flex items-center justify-center">
              <Truck className="w-6 h-6" />
            </div>
            <h3 className="font-heading font-bold text-lg text-ink">Express Fulfillment</h3>
            <p className="text-muted text-sm leading-relaxed">
              Carefully packaged in tamper-evident materials and dispatched with top courier networks for safe, timely delivery across India.
            </p>
          </div>
        </div>
      </section>

      {/* Academic Project Credits */}
      <section className="bg-lavender/60 border border-purple/20 rounded-3xl p-8 sm:p-12 text-center space-y-4">
        <span className="inline-block px-3 py-1 bg-purple text-white text-[11px] font-bold rounded-full uppercase tracking-wider">
          Portfolio &amp; Project Info
        </span>
        <h3 className="font-heading font-extrabold text-2xl text-ink">
          ThinkMart Full-Stack E-Commerce Project
        </h3>
        <p className="text-muted text-sm max-w-2xl mx-auto leading-relaxed">
          Designed and developed as an enterprise-grade full-stack tech retail showcase. Built with React 18, TypeScript, Tailwind CSS, Spring Boot 4.1.2 on Java 17 LTS, and MySQL 8.
        </p>
        <div className="pt-2 flex justify-center items-center gap-6 text-xs text-ink font-bold flex-wrap">
          <span className="flex items-center gap-1.5"><Users className="w-4 h-4 text-purple" /> VVIT CSE-A Project</span>
          <span className="flex items-center gap-1.5"><Award className="w-4 h-4 text-purple" /> Clean Architecture</span>
          <span className="flex items-center gap-1.5"><Heart className="w-4 h-4 text-red fill-red" /> Built with Precision</span>
        </div>
      </section>
    </div>
  );
};

