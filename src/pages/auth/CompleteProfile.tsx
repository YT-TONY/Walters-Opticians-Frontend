// src/pages/auth/CompleteProfile.tsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { apiClient } from '../../api/client';
import { useAuth } from '../../hooks/useAuth';
import { AUTH_TOKEN_KEY } from '../../context/AuthProvider';

interface ApiErrorResponse {
  response?: { data?: { detail?: string } };
}

export const CompleteProfile: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { setAuthData } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const res = await apiClient.patch('/auth/me', { full_name: fullName });

      const token = localStorage.getItem(AUTH_TOKEN_KEY) || '';
      setAuthData(token, res.data);

      toast.success('Profile completed successfully!');
      navigate('/');
    } catch (err: unknown) {
      const error = err as ApiErrorResponse;
      const errorMsg = error.response?.data?.detail || 'Failed to update profile.';
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-6 font-sans">
      <div className="bg-white p-8 md:p-10 rounded-2xl border border-walters-border max-w-md w-full space-y-6 shadow-xs">
        <div className="space-y-2 text-center">
          <h2 className="font-serif text-2xl tracking-tight text-walters-navy font-semibold">
            Complete Your Account
          </h2>
          <p className="text-xs text-walters-slate leading-relaxed">
            Welcome to Walters Opticians. Please enter your preferred full name to finalize your profile setup.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-walters-navy">
              Full Name
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. John Doe"
              className="w-full px-4 py-3 bg-white border border-walters-border rounded-xl text-sm text-walters-charcoal placeholder:text-slate-400 focus:outline-none focus:border-walters-navy focus:ring-1 focus:ring-walters-navy transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 bg-walters-navy text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-slate-800 transition-all cursor-pointer disabled:opacity-50 shadow-xs"
          >
            {isSubmitting ? 'Saving Profile...' : 'Save & Continue'}
          </button>
        </form>
      </div>
    </div>
  );
};