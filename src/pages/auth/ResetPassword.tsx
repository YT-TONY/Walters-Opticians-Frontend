// src/pages/auth/ResetPassword.tsx

import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { apiClient } from '../../api/client';
import { WavyDivider } from '../../components/WavyDivider';
import { useAuth } from '../../hooks/useAuth';

export const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const { setAuthData } = useAuth();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast.error('Invalid or missing reset token.');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await apiClient.post('/auth/reset-password', {
        token,
        new_password: newPassword,
      });

      // Authenticate user and land directly on home page
      setAuthData(res.data.access_token, res.data.user);
      toast.success('Password updated! Welcome back.');
      navigate('/', { replace: true });
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { detail?: string } } };
      toast.error(apiError.response?.data?.detail || 'Failed to reset password. Link may be expired.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-walters-cream text-walters-charcoal font-sans">
      <div className="relative w-full md:w-[38vw] bg-walters-navy text-white min-h-[35vh] md:min-h-screen p-8 sm:p-12 flex flex-col justify-between shrink-0 z-20 shadow-2xl">
        <div className="relative z-10">
          <span className="tracking-[0.25em] text-white text-xs font-bold uppercase">
            WALTERS OPTICIANS
          </span>
        </div>
        <div className="my-auto py-8 relative z-10 space-y-4">
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal leading-tight text-white">
            Set New Password
          </h1>
          <p className="text-xs text-white/70">
            Choose a strong password to protect your optical parameters and orders.
          </p>
        </div>
        <WavyDivider />
      </div>

      <div className="w-full md:w-[62vw] bg-walters-cream flex items-center justify-center p-8 sm:p-16 min-h-[65vh] md:min-h-screen">
        <div className="w-full max-w-sm mx-auto space-y-6">
          <div className="space-y-1">
            <h2 className="font-serif text-3xl text-walters-navy">Reset Password</h2>
            <p className="text-xs text-walters-slate">Enter your new account password below.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-walters-slate">
                New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-walters-slate/60">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-3 bg-white/80 border border-walters-border rounded-lg text-walters-charcoal text-sm focus:outline-none focus:border-walters-navy focus:bg-white transition-all shadow-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-walters-slate/60 hover:text-walters-navy transition-colors cursor-pointer"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-walters-slate">
                Confirm New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-walters-slate/60">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-3 bg-white/80 border border-walters-border rounded-lg text-walters-charcoal text-sm focus:outline-none focus:border-walters-navy focus:bg-white transition-all shadow-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-walters-slate/60 hover:text-walters-navy transition-colors cursor-pointer"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-walters-navy text-white py-3.5 px-6 rounded-lg font-semibold text-xs tracking-wider uppercase hover:bg-walters-gold hover:text-walters-navy transition-all duration-300 shadow-md flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
            >
              <span>{isSubmitting ? 'Updating...' : 'Update Password & Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};