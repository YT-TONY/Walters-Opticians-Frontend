// src/pages/auth/ForgotPassword.tsx

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Mail, ArrowRight, CheckCircle2, RefreshCw } from 'lucide-react';
import { apiClient } from '../../api/client';
import { WavyDivider } from '../../components/WavyDivider';

export const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email address.');
      return;
    }

    try {
      setIsSubmitting(true);
      await apiClient.post('/auth/forgot-password', { email });
      setIsSubmitted(true);
      toast.success('Reset link request sent.');
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { detail?: string } } };
      toast.error(apiError.response?.data?.detail || 'Failed to send reset link.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-white text-walters-charcoal font-sans overflow-x-hidden">
      {/* Left Brand Panel */}
      <div className="relative w-full md:w-[45vw] lg:w-[42vw] bg-walters-navy text-white min-h-[35vh] md:min-h-screen p-8 sm:p-12 lg:p-16 flex flex-col justify-between shrink-0 z-20 shadow-2xl">
        <div className="relative z-10">
          <span className="tracking-[0.25em] text-white text-xs font-bold uppercase">
            WALTERS OPTICIANS
          </span>
        </div>
        <div className="my-auto py-8 relative z-10 space-y-4">
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal leading-tight text-white">
            Account Recovery
          </h1>
          <p className="text-xs text-white/70">
            We will send a secure link to reset your account password.
          </p>
        </div>
        <WavyDivider />
      </div>

      {/* Right Form Panel */}
      <div className="w-full md:w-[55vw] lg:w-[58vw] bg-white flex items-center justify-center p-8 sm:p-12 lg:p-16 min-h-[65vh] md:min-h-screen relative z-10">
        <div className="w-full max-w-md mx-auto space-y-6">
          <Link
            to="/login"
            className="inline-flex items-center text-xs text-walters-slate hover:text-walters-navy transition-colors font-medium"
          >
            ← Back to Sign In
          </Link>

          {!isSubmitted ? (
            <>
              <div className="space-y-1">
                <h2 className="font-serif text-3xl text-walters-navy">Forgot Password?</h2>
                <p className="text-xs text-walters-slate">
                  Enter the email address tied to your Walters Opticians account.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-walters-slate">
                    Email Address
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
                      className="w-full pl-10 pr-4 py-3 bg-slate-50/80 border border-walters-border rounded-lg text-walters-charcoal text-sm focus:outline-none focus:border-walters-navy focus:bg-white transition-all shadow-xs"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-walters-navy text-white py-3.5 px-6 rounded-lg font-semibold text-xs tracking-wider uppercase hover:bg-walters-gold hover:text-walters-navy transition-all duration-300 shadow-md flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
                >
                  <span>{isSubmitting ? 'Sending Link...' : 'Send Reset Link'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </>
          ) : (
            <div className="bg-white p-8 rounded-3xl border border-walters-border shadow-xs space-y-5 text-center">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-200">
                <CheckCircle2 className="w-6 h-6" />
              </div>

              <div className="space-y-2">
                <h3 className="font-serif text-2xl text-walters-navy">Request Received</h3>
                <p className="text-xs text-walters-slate leading-relaxed">
                  If an account exists for <strong className="text-walters-navy">{email}</strong>, you will receive a password reset link shortly.
                </p>
              </div>

              {/* HELPFUL FALLBACK ASSISTANCE BOX */}
              <div className="bg-slate-50 border border-walters-border/80 p-4 rounded-2xl text-left space-y-2 text-xs text-walters-slate">
                <p className="font-semibold text-walters-navy text-[11px] uppercase tracking-wider">
                  Didn't receive the email?
                </p>
                <ul className="list-disc pl-4 space-y-1 text-[11px] leading-normal text-walters-slate/90">
                  <li>Check your spam or junk mail folder.</li>
                  <li>Verify that <strong className="text-walters-navy">{email}</strong> was spelled correctly.</li>
                  <li>Emails may take 1 to 2 minutes to arrive.</li>
                </ul>
              </div>

              <div className="pt-2 space-y-2.5">
                <button
                  type="button"
                  onClick={() => setIsSubmitted(false)}
                  className="w-full py-2.5 bg-slate-50 border border-walters-border rounded-xl text-xs font-bold text-walters-navy hover:bg-walters-navy hover:text-white transition-all flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Try Another Email Address</span>
                </button>

                <Link
                  to="/login"
                  className="block w-full py-2.5 bg-walters-navy text-white rounded-xl text-xs font-bold hover:bg-walters-gold hover:text-walters-navy transition-all text-center"
                >
                  Return to Sign In
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};