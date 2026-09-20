// src/components/LoadingDock.tsx

import React, { useState, useEffect, useRef } from 'react';

interface LoadingDockProps {
  /** Mode: 'pulse' for heartbeat expansion, or 'flip' for slow-mo Y-axis rotation */
  mode?: 'pulse' | 'flip';
  /** Delay in milliseconds before showing the loader (prevents flickering on fast requests) */
  delayMs?: number;
}

export const LoadingDock: React.FC<LoadingDockProps> = ({ mode = 'pulse', delayMs = 500 }) => {
  const [isVisible, setIsVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isApiLoadingRef = useRef(false);

  useEffect(() => {
    const handleLoadingChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ isLoading: boolean }>;
      const isCurrentlyLoading = customEvent.detail.isLoading;
      isApiLoadingRef.current = isCurrentlyLoading;

      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }

      if (isCurrentlyLoading) {
        timerRef.current = setTimeout(() => {
          if (isApiLoadingRef.current) {
            setIsVisible(true);
          }
        }, delayMs);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('api-loading-change', handleLoadingChange);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      window.removeEventListener('api-loading-change', handleLoadingChange);
    };
  }, [delayMs]);

  return (
    <div
      className={`fixed inset-0 z-9999 flex items-center justify-center bg-walters-navy/60 backdrop-blur-md transition-opacity duration-300 font-sans p-4 ${
        isVisible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
    >
      {/* Inline Keyframes */}
      <style>{`
        @keyframes heartbeat-glow {
          0%, 100% {
            transform: scale(0.9);
            opacity: 0.3;
          }
          50% {
            transform: scale(1.3);
            opacity: 0.8;
          }
        }

        @keyframes heartbeat-logo {
          0%, 100% {
            transform: scale(0.96);
          }
          30% {
            transform: scale(1.06);
          }
          45% {
            transform: scale(1.02);
          }
          60% {
            transform: scale(1.08);
          }
        }

        @keyframes slow-y-flip {
          0% {
            transform: perspective(1000px) rotateY(0deg);
          }
          50% {
            transform: perspective(1000px) rotateY(180deg);
          }
          100% {
            transform: perspective(1000px) rotateY(360deg);
          }
        }

        .animate-heartbeat-glow {
          animation: heartbeat-glow 2.2s ease-in-out infinite;
        }

        .animate-heartbeat-logo {
          animation: heartbeat-logo 2.2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }

        .animate-y-flip {
          animation: slow-y-flip 4.5s ease-in-out infinite;
        }
      `}</style>

      {/* Solid High-Contrast Luxury Dark Card Container */}
      <div className="relative flex flex-col items-center justify-center px-10 py-9 rounded-3xl bg-walters-navy border border-walters-gold/40 shadow-[0_20px_60px_rgba(0,0,0,0.6)] text-center min-w-70">
        {/* Glowing Pulsing Gold Aura Ring */}
        <div className="absolute w-40 h-40 rounded-full bg-linear-to-tr from-walters-gold/50 via-amber-300/40 to-yellow-500/20 blur-2xl animate-heartbeat-glow pointer-events-none" />

        {/* Glasses Icon Badge */}
        <div
          className={`relative z-10 flex items-center justify-center w-20 h-20 rounded-full bg-slate-900/80 border-2 border-walters-gold shadow-[0_0_30px_rgba(197,162,101,0.4)] backdrop-blur-md ${
            mode === 'pulse' ? 'animate-heartbeat-logo' : 'animate-y-flip'
          }`}
        >
          <svg
            className="w-10 h-10 text-walters-gold drop-shadow-[0_2px_10px_rgba(197,162,101,0.8)]"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M8 12a4 4 0 0 1 8 0" />
            <circle cx="6" cy="13" r="4" />
            <circle cx="18" cy="13" r="4" />
            <path d="M2 11l1.5 2" />
            <path d="M22 11l-1.5 2" />
          </svg>
        </div>

        {/* High-Contrast Brand Typography */}
        <div className="relative z-10 mt-6 space-y-1.5">
          <h2 className="font-serif text-sm tracking-[0.25em] uppercase text-white font-bold drop-shadow-md">
            Walters Opticians
          </h2>
          <p className="text-[11px] text-walters-gold font-semibold tracking-wider animate-pulse drop-shadow-xs">
            Crafting precision optics...
          </p>
        </div>
      </div>
    </div>
  );
};