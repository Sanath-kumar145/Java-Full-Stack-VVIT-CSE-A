import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Return to intended page if redirected
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/products';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Please provide both email and password.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await login({ email: email.trim().toLowerCase(), password });
      navigate(from, { replace: true });
    } catch (err: unknown) {
      console.error('Login error:', err);
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Invalid email or password. Please verify your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-280px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-surface rounded-3xl border border-line p-8 sm:p-10 shadow-card space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-purple text-white font-heading font-extrabold flex items-center justify-center text-2xl mx-auto shadow-md">
            T
          </div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-ink">
            Welcome Back
          </h1>
          <p className="text-muted text-xs sm:text-sm">
            Sign in to continue shopping on ThinkMart
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 bg-red/10 border border-red/20 rounded-xl text-red text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-1.5">
              Email Address <span className="text-red">*</span>
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-4 py-2.5 bg-bg border border-line rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple/30 focus:border-purple"
              />
              <Mail className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-1.5">
              Password <span className="text-red">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full pl-10 pr-10 py-2.5 bg-bg border border-line rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple/30 focus:border-purple"
              />
              <Lock className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink text-xs font-bold"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-muted font-medium">
              <input type="checkbox" className="rounded text-purple focus:ring-purple" />
              <span>Remember me</span>
            </label>
            <span className="text-purple hover:underline cursor-pointer font-bold">
              Forgot password?
            </span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-purple hover:bg-purple-dark disabled:opacity-50 text-white font-bold rounded-xl shadow-lg hover:shadow-purple/30 transition-all flex items-center justify-center gap-2 text-sm"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        {/* Footer Link */}
        <div className="pt-4 border-t border-line text-center text-xs text-muted">
          Don't have an account yet?{' '}
          <Link to="/register" className="text-purple font-bold hover:underline">
            Create an Account
          </Link>
        </div>
      </div>
    </div>
  );
};

