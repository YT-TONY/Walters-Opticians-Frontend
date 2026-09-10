// src/components/home/RecommendedCollections.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Sparkles, TrendingUp } from 'lucide-react';
import { apiClient } from '../../api/client';

interface RecommendedBrand {
  id: number;
  name: string;
  slug: string;
  logo_url?: string;
  hero_image_url?: string;
  tagline?: string;
  category_type: string;
  badge_text?: string;
}

const FALLBACK_STYLES = [
  'bg-gradient-to-br from-[#EAE5D9] via-[#DFD8C8] to-[#C8BEA7]',
  'bg-gradient-to-br from-[#E8ECEF] via-[#D3DADE] to-[#B5C0C7]',
  'bg-gradient-to-br from-[#F2E8E1] via-[#E2D3C7] to-[#CBB7A6]',
];

export const RecommendedCollections: React.FC = () => {
  const [brands, setBrands] = useState<RecommendedBrand[]>([]);
  const [failedImages, setFailedImages] = useState<Record<number, boolean>>({});

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const history: string[] = JSON.parse(localStorage.getItem('walters_search_history') || '[]');
        const searchParam = history.length > 0 ? `?user_searches=${encodeURIComponent(history.join(','))}` : '';
        const res = await apiClient.get<RecommendedBrand[]>(`/categories/brands/recommended${searchParam}`);
        setBrands(res.data);
      } catch (error) {
        console.error('Failed to load recommended collections', error);
      }
    };

    fetchRecommendations();
  }, []);

  const handleImageError = (brandId: number) => {
    setFailedImages((prev) => ({ ...prev, [brandId]: true }));
  };

  if (brands.length < 3) return null;

  const mainBrand = brands[0];
  const topRightBrand = brands[1];
  const bottomRightBrand = brands[2];

  return (
    <section className="max-w-7xl mx-auto px-6 lg:px-8 py-14 space-y-6">
      {/* SECTION HEADER */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-walters-navy tracking-tight font-serif">
          Most Recommended Collections For You
        </h2>
        <p className="text-neutral-500 text-sm max-w-lg mx-auto">
          Handpicked optical collections based on top sales volume and your recent browsing preferences.
        </p>
      </div>

      {/* TOP PORTRAIT 3-CARD GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-auto lg:h-150">
        
        {/* LEFT TALL PORTRAIT CARD (Cols 1-7) */}
        <div className={`lg:col-span-7 h-125 lg:h-full relative rounded-3xl overflow-hidden group border border-neutral-200/80 shadow-xs ${FALLBACK_STYLES[0]} flex flex-col justify-end`}>
          {mainBrand.hero_image_url && !failedImages[mainBrand.id] && (
            <img
              src={mainBrand.hero_image_url}
              alt={mainBrand.name}
              onError={() => handleImageError(mainBrand.id)}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
          )}
          <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/30 to-transparent pointer-events-none" />

          <div className="relative z-10 p-8 sm:p-12 flex flex-col justify-end h-full">
            <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-widest text-walters-gold bg-walters-navy/90 backdrop-blur-md px-3.5 py-1.5 rounded-full w-fit mb-4">
              <Sparkles className="w-3 h-3" />
              <span>{mainBrand.badge_text || 'TOP FEATURED'}</span>
            </span>

            <h3 className="text-white font-serif text-3xl sm:text-5xl font-extrabold tracking-tight mb-2">
              {mainBrand.name}
            </h3>

            <p className="text-neutral-200 text-xs sm:text-sm font-normal max-w-md leading-relaxed mb-6">
              {mainBrand.tagline || `Discover top-performing eyewear and precision craftsmanship from ${mainBrand.name}.`}
            </p>

            <Link
              to={`/catalog?brand=${mainBrand.slug}&sort=top_sales`}
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-white text-walters-navy hover:bg-walters-gold hover:text-walters-navy font-bold text-xs uppercase tracking-wider rounded-full transition-all duration-300 w-fit shadow-md"
            >
              <span>Explore Collection</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* RIGHT STACKED PORTRAIT CARDS (Cols 8-12) */}
        <div className="lg:col-span-5 flex flex-col gap-6 h-auto lg:h-full">
          
          {/* TOP RIGHT CARD */}
          <div className={`h-70 lg:h-1/2 relative rounded-3xl overflow-hidden group border border-neutral-200/80 shadow-xs ${FALLBACK_STYLES[1]} flex flex-col justify-end`}>
            {topRightBrand.hero_image_url && !failedImages[topRightBrand.id] && (
              <img
                src={topRightBrand.hero_image_url}
                alt={topRightBrand.name}
                onError={() => handleImageError(topRightBrand.id)}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
            )}
            <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

            <div className="relative z-10 p-6 sm:p-8 flex flex-col justify-end h-full">
              <span className="text-[10px] font-black uppercase tracking-widest text-walters-gold mb-1">
                {topRightBrand.badge_text || 'POPULAR PICK'}
              </span>
              <h4 className="text-white font-serif text-2xl font-bold tracking-tight mb-4">
                {topRightBrand.name}
              </h4>
              <Link
                to={`/catalog?brand=${topRightBrand.slug}&sort=top_sales`}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-white/95 hover:bg-white text-walters-navy text-[11px] font-bold uppercase tracking-wider rounded-full transition-all w-fit shadow-xs"
              >
                <span>View Collection</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* BOTTOM RIGHT CARD */}
          <div className={`h-70 lg:h-1/2 relative rounded-3xl overflow-hidden group border border-neutral-200/80 shadow-xs ${FALLBACK_STYLES[2]} flex flex-col justify-end`}>
            {bottomRightBrand.hero_image_url && !failedImages[bottomRightBrand.id] && (
              <img
                src={bottomRightBrand.hero_image_url}
                alt={bottomRightBrand.name}
                onError={() => handleImageError(bottomRightBrand.id)}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
            )}
            <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

            <div className="relative z-10 p-6 sm:p-8 flex flex-col justify-end h-full">
              <span className="text-[10px] font-black uppercase tracking-widest text-walters-gold mb-1">
                {bottomRightBrand.badge_text || 'FEATURED'}
              </span>
              <h4 className="text-white font-serif text-2xl font-bold tracking-tight mb-4">
                {bottomRightBrand.name}
              </h4>
              <Link
                to={`/catalog?brand=${bottomRightBrand.slug}&sort=top_sales`}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-white/95 hover:bg-white text-walters-navy text-[11px] font-bold uppercase tracking-wider rounded-full transition-all w-fit shadow-xs"
              >
                <span>View Collection</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

        </div>
      </div>

      {/* 4TH FULL-WIDTH BANNER: TRENDING NOW (EXTENDED HEIGHT & TIGHTENED GAP) */}
      <div className="relative h-78 sm:h-90 w-full rounded-3xl overflow-hidden group border border-neutral-200/80 shadow-xs bg-neutral-900 flex flex-col justify-end">
        <img
          src="/IMAGES/HOMEPAGE/TRENDING_BANNER.png"
          alt="Trending Now Optical Frames"
          className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 opacity-90"
        />
        <div className="absolute inset-0 bg-linear-to-r from-black/90 via-black/50 to-transparent pointer-events-none" />

        <div className="relative z-10 p-8 sm:p-12 max-w-xl flex flex-col justify-end h-full">
          <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-widest text-walters-gold bg-black/60 backdrop-blur-md px-3.5 py-1.5 rounded-full w-fit mb-3 border border-walters-gold/30">
            <TrendingUp className="w-3.5 h-3.5 text-walters-gold" />
            <span>High Sales & High Demand</span>
          </span>

          <h3 className="text-white font-serif text-3xl sm:text-5xl font-extrabold tracking-tight mb-3">
            Trending Now
          </h3>

          <p className="text-neutral-300 text-xs sm:text-sm font-normal leading-relaxed mb-6">
            Explore our highest volume optical precision frames, luxury silhouettes, and customer favorites.
          </p>

          <Link
            to="/catalog?sort=top_sales"
            className="inline-flex items-center gap-2 px-7 py-3.5 bg-white text-walters-navy hover:bg-walters-gold hover:text-walters-navy font-bold text-xs uppercase tracking-wider rounded-full transition-all duration-300 w-fit shadow-md"
          >
            <span>Explore Shop</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};