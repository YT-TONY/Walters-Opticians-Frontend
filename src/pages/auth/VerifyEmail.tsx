// src/pages/auth/VerifyEmail.tsx

import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '../../api/client';
import { WavyDivider } from '../../components/WavyDivider';
import { useAuth } from '../../hooks/useAuth';

export const VerifyEmail: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const { setAuthData } = useAuth();

  const [loading, setLoading] = useState(() => Boolean(token));
  const [errorMessage, setErrorMessage] = useState<string | null>(() =>
    !token ? 'Verification token is missing.' : null
  );

  // Execution guard to prevent React 18 StrictMode double-invocation
  const hasExecuted = useRef(false);

  useEffect(() => {
    if (!token || hasExecuted.current) return;
    hasExecuted.current = true;

    apiClient
      .post('/auth/verify-email', { token })
      .then((res) => {
        // 1. Authenticate user in session context
        setAuthData(res.data.access_token, res.data.user);

        // 2. Show notification and navigate directly to home
        toast.success('Email verified successfully! Welcome to Walters Opticians.');
        navigate('/', { replace: true });
      })
      .catch((err: unknown) => {
        const apiError = err as { response?: { data?: { detail?: string } } };
        setErrorMessage(
          apiError.response?.data?.detail || 'Verification failed or token has expired.'
        );
        setLoading(false);
      });
  }, [token, setAuthData, navigate]);

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
            Email Verification
          </h1>
          <p className="text-xs text-white/70">
            Activating your account for secure online optical prescriptions.
          </p>
        </div>
        <WavyDivider />
      </div>

      <div className="w-full md:w-[62vw] bg-walters-cream flex items-center justify-center p-8 sm:p-16 min-h-[65vh] md:min-h-screen">
        <div className="w-full max-w-sm mx-auto">
          {loading ? (
            <div className="bg-white p-8 rounded-3xl border border-walters-border text-center space-y-3 shadow-2xs">
              <Loader2 className="w-8 h-8 text-walters-navy animate-spin mx-auto" />
              <h3 className="font-serif text-lg text-walters-navy">Verifying Account...</h3>
              <p className="text-xs text-walters-slate">Please wait while we validate your activation token.</p>
            </div>
          ) : (
            <div className="bg-white p-8 rounded-3xl border border-walters-border text-center space-y-4 shadow-2xs">
              <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-2xl text-walters-navy">Verification Failed</h3>
              <p className="text-xs text-walters-slate leading-relaxed">{errorMessage}</p>
              <Link
                to="/login"
                className="block w-full py-3 border border-walters-navy text-walters-navy rounded-xl text-xs font-semibold hover:bg-walters-navy hover:text-white transition-all text-center"
              >
                Return to Login
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};