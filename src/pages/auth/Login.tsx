// src/pages/auth/Login.tsx

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'sonner';
import { ArrowRight, Lock, Mail, Eye, EyeOff } from 'lucide-react';
import { WavyDivider } from '../../components/WavyDivider';
import { SocialAuthButtons } from '../../components/SocialAuthButtons';

interface ApiErrorResponse {
  response?: { data?: { detail?: string } };
}

export const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setEmail('');
    setPassword('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!acceptedTerms) {
      toast.error('You must accept the Privacy Policy & Terms of Service to log in.');
      return;
    }

    if (!email || !password) {
      toast.error('Please enter both email and password.');
      return;
    }

    try {
      setIsSubmitting(true);
      const loggedInUser = await login({ email, password });
      toast.success('Welcome back to Walters Opticians!');

      resetForm();

      if (loggedInUser.role === 'admin' || (loggedInUser as { is_admin?: boolean }).is_admin) {
        navigate('/admin/dashboard');
      } else {
        navigate('/');
      }
    } catch (err: unknown) {
      const error = err as ApiErrorResponse;
      const errorMsg = error.response?.data?.detail || 'Invalid email or password.';
      toast.error(errorMsg);
      setPassword('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-white text-walters-charcoal overflow-x-hidden font-sans">
      <div className="relative w-full md:w-[38vw] bg-walters-navy text-white min-h-[45vh] md:min-h-screen p-8 sm:p-12 lg:p-16 flex flex-col justify-between shrink-0 z-20 shadow-2xl">
        <div className="relative z-10">
          <span className="font-sans tracking-[0.25em] text-white text-xs font-bold uppercase">
            WALTERS OPTICIANS
          </span>
        </div>

        <div className="my-auto py-12 relative z-10 space-y-6">
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-normal leading-[1.15] text-white tracking-normal">
            Precision eyewear, <br />
            delivered to your door.
          </h1>
        </div>

        <div className="relative z-10 space-y-1">
          <p className="font-serif tracking-[0.2em] text-white text-sm font-bold uppercase">
            WALTERS OPTICIANS
          </p>
          <p className="font-sans text-[11px] text-white/70 font-normal">
            Hand-finished frames, prescription lenses edged in our workshop.
          </p>
        </div>

        <WavyDivider />
      </div>

      <div className="w-full md:w-[62vw] bg-white flex items-center justify-center p-8 sm:p-16 lg:p-24 relative z-10 min-h-[55vh] md:min-h-screen">
        <div className="absolute top-1/3 right-12 w-md h-112 bg-walters-gold/10 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-sm mx-auto space-y-8 relative z-10">
          <div className="space-y-2">
            <h2 className="font-serif text-4xl font-normal text-walters-navy tracking-tight">
              Sign in
            </h2>
            <p className="font-sans text-xs text-walters-slate">
              Access your orders, prescriptions and try-on boxes.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 font-sans">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-walters-slate">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-walters-slate/60">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50/80 border border-walters-border rounded-lg text-walters-charcoal text-sm focus:outline-none focus:border-walters-navy focus:bg-white transition-all duration-200 placeholder:text-walters-slate/40 shadow-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold uppercase tracking-wider text-walters-slate">
                  Password
                </label>
                <Link to="/forgot-password" className="text-xs text-walters-gold hover:underline font-medium">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-walters-slate/60">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-3 bg-slate-50/80 border border-walters-border rounded-lg text-walters-charcoal text-sm focus:outline-none focus:border-walters-navy focus:bg-white transition-all duration-200 placeholder:text-walters-slate/40 shadow-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-walters-slate/60 hover:text-walters-navy transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-start space-x-2 pt-1">
              <input
                type="checkbox"
                id="terms-login"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-walters-border text-walters-navy focus:ring-walters-gold cursor-pointer"
              />
              <label htmlFor="terms-login" className="text-xs text-walters-slate select-none">
                I accept the{' '}
                <Link to="/privacy" className="text-walters-navy font-bold hover:underline">
                  Privacy Policy
                </Link>{' '}
                and Terms of Service.
              </label>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !acceptedTerms}
              className="w-full mt-2 bg-walters-navy text-white py-3.5 px-6 rounded-lg font-sans font-semibold text-xs tracking-wider uppercase hover:bg-walters-gold hover:text-walters-navy transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center space-x-2 group disabled:opacity-50 cursor-pointer"
            >
              <span>{isSubmitting ? 'Signing in...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
            </button>
          </form>

          <SocialAuthButtons mode="login" />

          <div className="pt-4 text-center font-sans text-xs text-walters-slate border-t border-walters-border/60">
            <p>
              New to Walters?{' '}
              <Link to="/register" className="text-walters-navy font-bold hover:text-walters-gold transition-colors underline">
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};