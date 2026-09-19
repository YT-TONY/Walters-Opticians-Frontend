// src/components/LoadingDock.tsx

import React, { useState, useEffect } from 'react';

interface LoadingDockProps {
  /** Mode: 'pulse' for heartbeat expansion, or 'flip' for slow-mo Y-axis rotation */
  mode?: 'pulse' | 'flip';
}

export const LoadingDock: React.FC<LoadingDockProps> = ({ mode = 'pulse' }) => {
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const handleLoadingChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ isLoading: boolean }>;
      setIsLoading(customEvent.detail.isLoading);
    };

    window.addEventListener('api-loading-change', handleLoadingChange);
    return () => {
      window.removeEventListener('api-loading-change', handleLoadingChange);
    };
  }, []);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-9999 flex flex-col items-center justify-center bg-walters-navy/95 backdrop-blur-md transition-all duration-500 font-sans">
      
      {/* Inline Keyframes for Pulse & Flip Animations */}
      <style>{`
        @keyframes heartbeat-glow {
          0%, 100% {
            transform: scale(0.95);
            opacity: 0.25;
          }
          50% {
            transform: scale(1.35);
            opacity: 0.75;
          }
        }

        @keyframes heartbeat-logo {
          0%, 100% {
            transform: scale(0.98);
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
          animation: heartbeat-glow 2.4s ease-in-out infinite;
        }

        .animate-heartbeat-logo {
          animation: heartbeat-logo 2.4s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }

        .animate-y-flip {
          animation: slow-y-flip 4.5s ease-in-out infinite;
        }
      `}</style>

      {/* Main Centered Animation Box */}
      <div className="relative flex flex-col items-center justify-center p-8">
        
        {/* Glowing Pulsing Gold Aura Ring */}
        <div className="absolute w-48 h-48 rounded-full bg-linear-to-tr from-walters-gold/40 via-amber-300/30 to-yellow-500/10 blur-2xl animate-heartbeat-glow pointer-events-none" />

        {/* Walters Monogram / Brand Icon */}
        <div
          className={`relative z-10 flex items-center justify-center w-24 h-24 rounded-full bg-white/10 border border-walters-gold/40 shadow-[0_0_50px_rgba(197,162,101,0.3)] backdrop-blur-sm ${
            mode === 'pulse' ? 'animate-heartbeat-logo' : 'animate-y-flip'
          }`}
        >
          {/* Glasses Frame Silhouette Icon */}
          <svg
            className="w-12 h-12 text-walters-gold drop-shadow-[0_2px_8px_rgba(197,162,101,0.6)]"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {/* Bridge */}
            <path d="M8 12a4 4 0 0 1 8 0" />
            {/* Left Lens */}
            <circle cx="6" cy="13" r="4" />
            {/* Right Lens */}
            <circle cx="18" cy="13" r="4" />
            {/* Temples */}
            <path d="M2 11l1.5 2" />
            <path d="M22 11l-1.5 2" />
          </svg>
        </div>

        {/* Brand Text & Status Indicator */}
        <div className="relative z-10 mt-8 text-center space-y-2">
          <h2 className="font-serif text-lg tracking-[0.3em] uppercase text-white font-normal">
            Walters Opticians
          </h2>
          <p className="text-xs text-walters-gold/80 tracking-widest font-light animate-pulse">
            Crafting precision optics...
          </p>
        </div>
      </div>
    </div>
  );
};