// src/components/megamenu/BrandsGrid.tsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

interface BrandsGridProps {
  variant?: 'full' | 'mini' | 'mega-view';
  categorySlug?: string;
  onClose?: () => void;
}

const MINI_BRANDS = [
  { name: 'Ray-Ban', slug: 'ray-ban', logo: '/IMAGES/BRAND LOGO/RAY BAN.png' },
  { name: 'Nike', slug: 'nike', logo: '/IMAGES/BRAND LOGO/NIKE.png' },
  { name: 'Oakley', slug: 'oakley', logo: '/IMAGES/BRAND LOGO/OAKLEY.png' },
];

const FULL_BRANDS = [
  { name: 'Ray-Ban', slug: 'ray-ban', logo: '/IMAGES/BRAND LOGO/RAY BAN.png' },
  { name: 'Tom Ford', slug: 'tom-ford', logo: '/IMAGES/BRAND LOGO/TOMFORD.png' },
  { name: 'Oakley', slug: 'oakley', logo: '/IMAGES/BRAND LOGO/OAKLEY.png' },
  { name: 'Gucci', slug: 'gucci', logo: '/IMAGES/BRAND LOGO/GUCCI.png' },
  { name: 'Prada', slug: 'prada', logo: '/IMAGES/BRAND LOGO/PRADA.png' },
  { name: 'Carrera', slug: 'carrera', logo: '/IMAGES/BRAND LOGO/CARRERA.png' },
  { name: 'Boss', slug: 'boss', logo: '/IMAGES/BRAND LOGO/BOSS.png' },
  { name: 'Persol', slug: 'persol', logo: '/IMAGES/BRAND LOGO/PERSOL.png' },
  { name: 'Nike', slug: 'nike', logo: '/IMAGES/BRAND LOGO/NIKE.png' },
  { name: 'Kate Spade', slug: 'kate-spade', logo: '/IMAGES/BRAND LOGO/KATE SPADE.png' },
  { name: 'Chanel', slug: 'chanel', logo: '/IMAGES/BRAND LOGO/CHANEL.png' },
  { name: 'Dior', slug: 'dior', logo: '/IMAGES/BRAND LOGO/DIOR.png' },
  { name: 'ralph lauren', slug: 'ralph-lauren', logo: '/IMAGES/BRAND LOGO/RALPH LAUREN.png' },
  { name: 'stella mccartney', slug: 'stella-mccartney', logo: '/IMAGES/BRAND LOGO/STELLA McCARTNEY.png' },
  { name: 'Valentino', slug: 'valentino', logo: '/IMAGES/BRAND LOGO/VALENTINO.png' },
  { name: 'Versace', slug: 'versace', logo: '/IMAGES/BRAND LOGO/VERSACE.png' },
  { name: 'Vogue', slug: 'vogue', logo: '/IMAGES/BRAND LOGO/VOGUE.png' }
];

export const BrandsGrid: React.FC<BrandsGridProps> = ({
  variant = 'full',
  categorySlug = 'sunglasses',
  onClose,
}) => {
  const [activeType, setActiveType] = useState<'glasses' | 'sunglasses'>('glasses');
  const [activeTab, setActiveTab] = useState<'top' | 'all'>('top');

  // Mini Brand Grid (Used inside Sunglasses column)
  if (variant === 'mini') {
    return (
      <div className="w-48 shrink-0">
        <h4 className="text-[11px] font-semibold uppercase tracking-widest text-walters-gold/90 mb-2.5">
          Top Brands
        </h4>
        <div className="grid grid-cols-2 gap-2">
          {MINI_BRANDS.map((brand) => (
            <Link
              key={brand.slug}
              to={`/catalog?category=${categorySlug}&brand=${brand.slug}`}
              onClick={onClose}
              className="flex items-center justify-center p-2 bg-white border border-walters-border/30 rounded-xl hover:border-walters-gold hover:shadow-2xs transition-all h-12 group"
            >
              <img
                src={brand.logo}
                alt={brand.name}
                className="max-h-6 max-w-[80%] object-contain opacity-80 group-hover:opacity-100 transition-opacity"
              />
            </Link>
          ))}
          <Link
            to={`/catalog?category=${categorySlug}&view=brands`}
            onClick={onClose}
            className="flex items-center justify-center p-2 bg-walters-navy text-white rounded-xl hover:bg-walters-gold hover:text-walters-navy transition-all text-[11px] font-medium h-12"
          >
            Shop All
          </Link>
        </div>
      </div>
    );
  }

  // Full Mega Menu Brands Tab Layout
  if (variant === 'mega-view') {
    return (
      <div className="flex-1 max-w-2xl space-y-5">
        {/* Segmented Type Toggle Switch (Glasses vs. Sunglasses) */}
        <div className="flex justify-center">
          <div className="bg-neutral-900 text-white p-1 rounded-full flex items-center w-80 shadow-inner">
            <button
              type="button"
              onClick={() => setActiveType('glasses')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-full transition-all cursor-pointer ${
                activeType === 'glasses'
                  ? 'bg-neutral-800 text-white shadow-xs'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Glasses
            </button>
            <button
              type="button"
              onClick={() => setActiveType('sunglasses')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-full transition-all cursor-pointer ${
                activeType === 'sunglasses'
                  ? 'bg-neutral-800 text-white shadow-xs'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Sunglasses
            </button>
          </div>
        </div>

        {/* Sub-Filter Tabs (Top Brands vs. All Brands) */}
        <div className="flex items-center justify-center space-x-8 border-b border-walters-border/20 pb-2">
          <button
            type="button"
            onClick={() => setActiveTab('top')}
            className={`text-xs font-semibold transition-all border-b-2 cursor-pointer pb-2 ${
              activeTab === 'top'
                ? 'border-walters-gold text-walters-navy font-bold'
                : 'border-transparent text-walters-charcoal/60 hover:text-walters-navy'
            }`}
          >
            Top Brands
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`text-xs font-semibold transition-all border-b-2 cursor-pointer pb-2 ${
              activeTab === 'all'
                ? 'border-walters-gold text-walters-navy font-bold'
                : 'border-transparent text-walters-charcoal/60 hover:text-walters-navy'
            }`}
          >
            All Brands
          </button>
        </div>

        {/* 12-Card Logo Grid */}
        <div className="grid grid-cols-4 gap-3">
          {FULL_BRANDS.map((brand) => (
            <Link
              key={brand.slug}
              to={`/catalog?category=${activeType}&brand=${brand.slug}`}
              onClick={onClose}
              className="flex items-center justify-center p-3 bg-white border border-walters-border/30 rounded-xl hover:border-walters-gold hover:shadow-2xs transition-all h-16 group"
            >
              <img
                src={brand.logo}
                alt={brand.name}
                className="max-h-8 max-w-[85%] object-contain opacity-80 group-hover:opacity-100 transition-opacity"
              />
            </Link>
          ))}
        </div>
      </div>
    );
  }

  // Fallback Standard Grid
  return (
    <div className="space-y-4">
      <h4 className="text-[11px] font-semibold uppercase tracking-widest text-walters-gold/90 mb-3">
        Featured Eyewear Brands
      </h4>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {FULL_BRANDS.map((brand) => (
          <Link
            key={brand.slug}
            to={`/catalog?brand=${brand.slug}`}
            onClick={onClose}
            className="flex items-center justify-center p-4 bg-white border border-walters-border/30 rounded-xl hover:border-walters-gold hover:shadow-2xs transition-all h-14 group"
          >
            <img
              src={brand.logo}
              alt={brand.name}
              className="max-h-7 max-w-[80%] object-contain opacity-80 group-hover:opacity-100 transition-opacity"
            />
          </Link>
        ))}
      </div>
    </div>
  );
};