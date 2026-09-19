// src/components/SocialAuthButtons.tsx

import React, { useEffect } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { apiClient } from '../api/client';
import { useAuth } from '../hooks/useAuth';

declare global {
  interface Window {
    FB?: {
      init: (params: { appId: string; cookie: boolean; xfbml: boolean; version: string }) => void;
      login: (
        callback: (response: { authResponse?: { accessToken: string } }) => void,
        options?: { scope: string }
      ) => void;
    };
    fbAsyncInit?: () => void;
  }
}

interface SocialAuthButtonsProps {
  mode: 'login' | 'signup';
}

export const SocialAuthButtons: React.FC<SocialAuthButtonsProps> = ({ mode }) => {
  const navigate = useNavigate();
  const auth = (useAuth() as unknown) as Record<string, unknown>;
  const actionText = mode === 'login' ? 'Sign in' : 'Sign up';

  const appId = import.meta.env.VITE_FACEBOOK_APP_ID;

  useEffect(() => {
    if (!appId) {
      console.warn('VITE_FACEBOOK_APP_ID is missing from .env');
      return;
    }

    // Attach global callback before injecting SDK
    window.fbAsyncInit = () => {
      if (window.FB) {
        window.FB.init({
          appId: appId,
          cookie: true,
          xfbml: true,
          version: 'v19.0',
        });
      }
    };

    // Dynamically inject script tag if not present
    if (!document.getElementById('facebook-jssdk')) {
      const js = document.createElement('script');
      js.id = 'facebook-jssdk';
      js.src = 'https://connect.facebook.net/en_US/sdk.js';
      js.async = true;
      js.defer = true;
      js.crossOrigin = 'anonymous';
      document.head.appendChild(js);
    } else if (window.FB) {
      window.FB.init({
        appId: appId,
        cookie: true,
        xfbml: true,
        version: 'v19.0',
      });
    }
  }, [appId]);

  const handleAuthSuccess = (accessToken: string, user: unknown, role: string, isNewUser?: boolean) => {
    if (typeof auth.setAuthData === 'function') {
      (auth.setAuthData as (token: string, user: unknown) => void)(accessToken, user);
    } else {
      localStorage.setItem('walters_auth_token', accessToken);
    }

    toast.success('Successfully authenticated!');

    if (isNewUser) {
      navigate('/complete-profile');
    } else {
      navigate(role === 'admin' ? '/admin/dashboard' : '/');
    }
  };

  const googleLoginHandler = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const res = await apiClient.post('/auth/google', {
          id_token: tokenResponse.access_token,
        });
        handleAuthSuccess(res.data.access_token, res.data.user, res.data.role, res.data.is_new_user);
      } catch (err: unknown) {
        const apiError = err as { response?: { data?: { detail?: string } } };
        toast.error(apiError.response?.data?.detail || 'Google authentication failed.');
      }
    },
    onError: () => toast.error('Google Sign-In was cancelled or failed.'),
  });

  const handleFacebookLogin = () => {
    if (!appId) {
      toast.error('Facebook App ID is missing. Check your .env file and restart Vite.');
      return;
    }

    if (!window.FB) {
      toast.error('Facebook SDK is loading or blocked by an ad-blocker.');
      return;
    }

    window.FB.login(
      (response) => {
        if (response.authResponse?.accessToken) {
          apiClient
            .post('/auth/facebook', {
              id_token: response.authResponse.accessToken,
            })
            .then((res) => {
              handleAuthSuccess(
                res.data.access_token,
                res.data.user,
                res.data.role,
                res.data.is_new_user
              );
            })
            .catch((err: unknown) => {
              const apiError = err as { response?: { data?: { detail?: string } } };
              toast.error(apiError.response?.data?.detail || 'Facebook authentication failed.');
            });
        } else {
          toast.error('Facebook Sign-In was cancelled.');
        }
      },
      { scope: 'public_profile,email' }
    );
  };

  return (
    <div className="space-y-3 font-sans w-full">
      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-walters-border/80" />
        </div>
        <div className="relative flex justify-center text-[10px] uppercase tracking-wider">
          <span className="bg-white px-3 text-walters-slate font-bold">
            Or {actionText.toLowerCase()} with
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => googleLoginHandler()}
          className="flex items-center justify-center space-x-2 py-2.5 px-4 bg-white border border-walters-border rounded-full text-xs font-bold text-walters-navy hover:bg-slate-50 hover:border-walters-navy transition-all cursor-pointer shadow-2xs"
        >
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Google</span>
        </button>

        <button
          type="button"
          onClick={handleFacebookLogin}
          className="flex items-center justify-center space-x-2 py-2.5 px-4 bg-[#1877F2] text-white rounded-full text-xs font-bold hover:bg-[#166fe5] transition-all cursor-pointer shadow-2xs"
        >
          <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
          <span>Facebook</span>
        </button>
      </div>
    </div>
  );
};