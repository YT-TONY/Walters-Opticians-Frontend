// src/components/search/BrandSearchCard.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import type { Brand } from '../../context/Category';

interface BrandSearchCardProps {
  brand: Brand;
  onSelect?: () => void;
  variant?: 'compact' | 'featured';
}

const LOCAL_LOGO_MAP: Record<string, string> = {
  'ray-ban': '/IMAGES/BRAND LOGO/RAY BAN.png',
  'tom-ford': '/IMAGES/BRAND LOGO/TOMFORD.png',
  'oakley': '/IMAGES/BRAND LOGO/OAKLEY.png',
  'gucci': '/IMAGES/BRAND LOGO/GUCCI.png',
  'prada': '/IMAGES/BRAND LOGO/PRADA.png',
  'carrera': '/IMAGES/BRAND LOGO/CARRERA.png',
  'boss': '/IMAGES/BRAND LOGO/BOSS.png',
  'persol': '/IMAGES/BRAND LOGO/PERSOL.png',
  'nike': '/IMAGES/BRAND LOGO/NIKE.png',
  'kate-spade': '/IMAGES/BRAND LOGO/KATE SPADE.png',
  'chanel': '/IMAGES/BRAND LOGO/CHANEL.png',
  'dior': '/IMAGES/BRAND LOGO/DIOR.png',
  'ralph-lauren': '/IMAGES/BRAND LOGO/RALPH LAUREN.png',
  'stella-mccartney': '/IMAGES/BRAND LOGO/STELLA McCARTNEY.png',
  'valentino': '/IMAGES/BRAND LOGO/VALENTINO.png',
  'versace': '/IMAGES/BRAND LOGO/VERSACE.png',
  'vogue': '/IMAGES/BRAND LOGO/VOGUE.png',
};

export const BrandSearchCard: React.FC<BrandSearchCardProps> = ({
  brand,
  onSelect,
  variant = 'compact',
}) => {
  const navigate = useNavigate();
  const [imgFailed, setImgFailed] = useState(false);

  // Always prioritize admin-uploaded DB logo first, then local image fallback
  const logoSrc = !imgFailed && brand.logo_url ? brand.logo_url : LOCAL_LOGO_MAP[brand.slug];

  const handleClick = () => {
    if (onSelect) onSelect();
    navigate(`/brands/${brand.slug}`);
  };

  if (variant === 'featured') {
    return (
      <div
        onClick={handleClick}
        className="group relative bg-white border border-neutral-200/80 rounded-2xl p-5 flex items-center justify-between cursor-pointer hover:border-walters-navy hover:shadow-md transition-all duration-200"
      >
        <div className="flex items-center space-x-4">
          <div className="w-20 h-11 bg-neutral-50 rounded-xl border border-neutral-200/60 p-1 flex items-center justify-center shrink-0">
            {logoSrc ? (
              <img
                src={logoSrc}
                alt={brand.name}
                onError={() => setImgFailed(true)}
                className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform"
              />
            ) : (
              <span className="font-serif text-sm font-bold text-walters-navy uppercase tracking-wider">
                {brand.name.slice(0, 3)}
              </span>
            )}
          </div>
          <div>
            <h4 className="font-serif text-sm sm:text-base font-bold text-walters-navy group-hover:underline">
              {brand.name} Collection
            </h4>
            <p className="text-xs text-neutral-400 font-light">
              Explore official brand catalog & models
            </p>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-neutral-300 group-hover:text-walters-navy group-hover:translate-x-0.5 transition-all" />
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="flex items-center space-x-3.5 bg-neutral-50 hover:bg-neutral-100/90 border border-neutral-200/90 rounded-xl p-3 sm:p-3.5 transition-all cursor-pointer group shadow-2xs text-left w-full min-h-13"
    >
      {/* ENLARGED LOGO CONTAINER */}
      <div className="w-16 h-9.5 bg-white rounded-lg border border-neutral-200/80 overflow-hidden shrink-0 flex items-center justify-center p-1 shadow-2xs">
        {logoSrc ? (
          <img
            src={logoSrc}
            alt={brand.name}
            onError={() => setImgFailed(true)}
            className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-150"
          />
        ) : (
          <span className="text-xs font-bold text-walters-navy font-serif">
            {brand.name.substring(0, 3)}
          </span>
        )}
      </div>

      <span className="text-sm font-semibold text-walters-navy group-hover:underline truncate">
        {brand.name}
      </span>
    </button>
  );
};