// src/components/megamenu/BrandsGrid.tsx
import React, { useState, useMemo, useContext } from 'react';
import { Link } from 'react-router-dom';
import type { Brand } from '../../context/Category';
import { CategoryContext } from '../../context/CategoryContext';

// Extended Brand interface supporting backend & admin badge metadata
export interface ExtendedBrand extends Brand {
  badge_text?: string;  // e.g. "NEW", "SALE", "PROMO", "20% OFF"
  badge_color?: string; // e.g. "bg-rose-600", "bg-amber-500", "bg-emerald-600"
  promo_tag?: string;   // Backend field from FastAPI
  created_at?: string;  // ISO Timestamp from FastAPI
}

interface BrandsGridProps {
  variant?: 'full' | 'mini' | 'mega-view';
  categorySlug?: string;
  onClose?: () => void;
  brands?: ExtendedBrand[];
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

const MINI_BRANDS = [
  { name: 'Ray-Ban', slug: 'ray-ban', logo: '/IMAGES/BRAND LOGO/RAY BAN.png' },
  { name: 'Nike', slug: 'nike', logo: '/IMAGES/BRAND LOGO/NIKE.png' },
  { name: 'Oakley', slug: 'oakley', logo: '/IMAGES/BRAND LOGO/OAKLEY.png' },
];

export const BrandsGrid: React.FC<BrandsGridProps> = ({
  variant = 'full',
  categorySlug = 'sunglasses',
  onClose,
  brands = [],
}) => {
  const [activeType, setActiveType] = useState<'glasses' | 'sunglasses'>('glasses');
  const [activeTab, setActiveTab] = useState<'top' | 'all'>('top');
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});
  
  // Capture current timestamp safely in initial state initializer
  const [now] = useState(() => Date.now());

  const categoryCtx = useContext(CategoryContext);

  const brandList = useMemo(() => {
    if (brands.length > 0) return brands;

    const categories = categoryCtx?.categories || [];
    const brandMap = new Map<string, ExtendedBrand>();

    categories.forEach((cat) => {
      cat.subcategories?.forEach((sub) => {
        sub.brands?.forEach((b) => {
          if (!brandMap.has(b.slug)) {
            brandMap.set(b.slug, b as ExtendedBrand);
          }
        });
      });
    });

    return Array.from(brandMap.values());
  }, [brands, categoryCtx?.categories]);

  const handleImageError = (slugKey: string) => {
    setFailedImages((prev) => ({ ...prev, [slugKey]: true }));
  };

  const getBrandLogo = (brand: ExtendedBrand) => {
    if (brand.logo_url && !failedImages[brand.slug]) {
      return brand.logo_url;
    }
    if (LOCAL_LOGO_MAP[brand.slug] && !failedImages[`local-${brand.slug}`]) {
      return LOCAL_LOGO_MAP[brand.slug];
    }
    return null;
  };

  const filteredBrands = useMemo(() => {
    return brandList.filter(
      (b) => !b.category_type || b.category_type === 'both' || b.category_type === activeType
    );
  }, [brandList, activeType]);

  // Compute dynamic badges using the pure 'now' state
  const processedBrands = useMemo(() => {
    const FOURTEEN_DAYS_MS = 14 * 24 * 60 * 60 * 1000;

    return filteredBrands.map((brand) => {
      const creationTime = brand.created_at ? new Date(brand.created_at).getTime() : 0;
      const isNew = creationTime > 0 && (now - creationTime) <= FOURTEEN_DAYS_MS;

      const badgeText = brand.promo_tag || brand.badge_text || (isNew ? 'NEW' : undefined);
      const badgeColor =
        brand.badge_color || (brand.promo_tag ? 'bg-rose-600' : isNew ? 'bg-emerald-600' : 'bg-rose-600');

      return {
        ...brand,
        badge_text: badgeText,
        badge_color: badgeColor,
      };
    });
  }, [filteredBrands, now]);

  // 15 Brands total for the 5x3 Grid
  const topBrands = useMemo(() => {
    const topFiltered = processedBrands.filter((b) => b.is_top_brand || b.is_popular);
    const list = topFiltered.length > 0 ? topFiltered : processedBrands;
    return list.slice(0, 15);
  }, [processedBrands]);

  const alphabeticalGrouped = useMemo(() => {
    const sorted = [...processedBrands].sort((a, b) => a.name.localeCompare(b.name));
    const groups: { [key: string]: ExtendedBrand[] } = {};
    sorted.forEach((brand) => {
      const letter = brand.name.charAt(0).toUpperCase();
      if (!groups[letter]) groups[letter] = [];
      groups[letter].push(brand);
    });
    return Object.keys(groups).sort().map((letter) => ({
      letter,
      brands: groups[letter],
    }));
  }, [processedBrands]);

  // MINI BRANDS GRID
  if (variant === 'mini') {
    return (
      <div className="w-60 shrink-0">
        <h4 className="text-xs font-bold uppercase tracking-widest text-walters-navy mb-3">
          Top Brands
        </h4>
        <div className="grid grid-cols-2 gap-2.5">
          {MINI_BRANDS.map((brand) => (
            <Link
              key={brand.slug}
              to={`/catalog?category=${categorySlug}&brand=${brand.slug}`}
              onClick={onClose}
              className="flex items-center justify-center p-3 bg-white border border-neutral-200 rounded-lg hover:border-walters-navy hover:shadow-xs transition-all h-16 group"
            >
              <img
                src={brand.logo}
                alt={brand.name}
                className="max-h-8 max-w-[85%] object-contain opacity-85 group-hover:opacity-100 transition-opacity"
              />
            </Link>
          ))}
          <Link
            to={`/catalog?category=${categorySlug}&view=brands`}
            onClick={onClose}
            className="flex items-center justify-center p-3 bg-walters-navy text-white hover:bg-neutral-800 transition-all text-xs font-bold tracking-wider uppercase h-16 rounded-lg shadow-2xs"
          >
            Shop All
          </Link>
        </div>
      </div>
    );
  }

  // MEGA MENU FULL VIEW
  if (variant === 'mega-view') {
    return (
      <div className="w-full flex flex-col items-center">
        
        {/* EXTENDED NAVY PILL SWITCH */}
        <div className="flex justify-center w-full mb-6">
          <div className="inline-flex items-center rounded-full border border-neutral-300 bg-white p-1 shadow-xs w-full max-w-xl">
            <button
              type="button"
              onClick={() => setActiveType('glasses')}
              className={`flex-1 py-2 text-xs font-bold tracking-wider uppercase rounded-full transition-all cursor-pointer ${
                activeType === 'glasses'
                  ? 'bg-walters-navy text-white shadow-xs'
                  : 'bg-transparent text-neutral-600 hover:text-walters-navy'
              }`}
            >
              Glasses
            </button>
            <div className="h-4 w-px bg-neutral-300 mx-1" />
            <button
              type="button"
              onClick={() => setActiveType('sunglasses')}
              className={`flex-1 py-2 text-xs font-bold tracking-wider uppercase rounded-full transition-all cursor-pointer ${
                activeType === 'sunglasses'
                  ? 'bg-walters-navy text-white shadow-xs'
                  : 'bg-transparent text-neutral-600 hover:text-walters-navy'
              }`}
            >
              Sunglasses
            </button>
          </div>
        </div>

        {/* FULL-WIDTH SUB-FILTER TABS */}
        <div className="w-full border-b border-neutral-200 mb-6 flex justify-center">
          <div className="flex space-x-16">
            <button
              type="button"
              onClick={() => setActiveTab('top')}
              className={`text-xs font-bold uppercase tracking-wider transition-all border-b-2 cursor-pointer pb-3 -mb-px ${
                activeTab === 'top'
                  ? 'border-walters-navy text-walters-navy'
                  : 'border-transparent text-neutral-400 hover:text-walters-navy'
              }`}
            >
              Top Brands
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`text-xs font-bold uppercase tracking-wider transition-all border-b-2 cursor-pointer pb-3 -mb-px ${
                activeTab === 'all'
                  ? 'border-walters-navy text-walters-navy'
                  : 'border-transparent text-neutral-400 hover:text-walters-navy'
              }`}
            >
              All Brands
            </button>
          </div>
        </div>

        {/* 5x3 BRAND GRID WITH DIAGONAL CORNER BADGES */}
        <div className="w-full">
          {activeTab === 'top' && (
            <div className="grid grid-cols-5 gap-3.5">
              {topBrands.map((brand) => {
                const logoSrc = getBrandLogo(brand);

                return (
                  <Link
                    key={brand.slug}
                    to={`/catalog?category=${activeType}&brand=${brand.slug}`}
                    onClick={onClose}
                    className="relative flex items-center justify-center p-3.5 bg-white border border-neutral-200 rounded-none hover:border-walters-navy hover:shadow-xs transition-all h-24 group overflow-hidden"
                  >
                    {/* Corner Ribbon Badge */}
                    {brand.badge_text && (
                      <div className="absolute top-0 left-0 w-16 h-16 overflow-hidden pointer-events-none z-10">
                        <div
                          className={`absolute top-2.5 -left-6 w-24 -rotate-45 py-0.5 text-[8px] font-black uppercase tracking-wider text-center text-white shadow-xs ${
                            brand.badge_color
                          }`}
                        >
                          {brand.badge_text}
                        </div>
                      </div>
                    )}

                    {logoSrc ? (
                      <img
                        src={logoSrc}
                        alt={brand.name}
                        onError={() => handleImageError(brand.logo_url ? brand.slug : `local-${brand.slug}`)}
                        className="max-h-11 max-w-[85%] object-contain opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300"
                      />
                    ) : (
                      <span className="text-xs font-bold text-neutral-800 uppercase tracking-wider text-center group-hover:scale-105 transition-transform">
                        {brand.name}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          )}

          {activeTab === 'all' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-x-6 gap-y-6 max-h-100 overflow-y-auto pr-2 pt-1 no-scrollbar">
              {alphabeticalGrouped.map((group) => (
                <div key={group.letter} className="space-y-2">
                  <h5 className="text-xs font-bold text-walters-navy border-b border-neutral-200 pb-1">
                    {group.letter}
                  </h5>
                  <ul className="space-y-1.5 text-xs">
                    {group.brands.map((b) => (
                      <li key={b.slug} className="relative">
                        <Link
                          to={`/catalog?category=${activeType}&brand=${b.slug}`}
                          onClick={onClose}
                          className="text-neutral-700 hover:text-walters-navy transition-colors py-0.5 flex items-center justify-between truncate capitalize font-medium text-xs"
                        >
                          <span className="truncate">{b.name}</span>
                          {b.badge_text && (
                            <span
                              className={`ml-1.5 px-1 py-0.2 text-[8px] font-black uppercase text-white rounded-2xs ${b.badge_color}`}
                            >
                              {b.badge_text}
                            </span>
                          )}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
};