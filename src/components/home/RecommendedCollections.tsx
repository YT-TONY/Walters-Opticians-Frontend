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
  category_type?: string;
  badge_text?: string;
}

interface ContactSlot {
  is_personalized: boolean;
  id?: number | null;
  name: string;
  slug: string;
  logo_url?: string | null;
  hero_image_url?: string | null;
  tagline?: string | null;
  badge_text: string;
  category_type: string;
}

interface FYPRecommendationsResponse {
  main_eyewear: RecommendedBrand;
  top_right_eyewear: RecommendedBrand;
  contact_slot: ContactSlot;
}

const FALLBACK_STYLES = [
  'bg-linear-to-br from-[#0f172a] via-[#1e293b] to-[#064e3b]',
  'bg-linear-to-br from-[#fdfbf7] via-[#f3efe6] to-[#e7dfd0]',
  'bg-linear-to-br from-[#0f172a] via-[#1e293b] to-[#0284c7]',
];

export const RecommendedCollections: React.FC = () => {
  const [fypData, setFypData] = useState<FYPRecommendationsResponse | null>(null);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const history: string[] = JSON.parse(localStorage.getItem('walters_search_history') || '[]');
        const searchParam = history.length > 0 ? `?user_searches=${encodeURIComponent(history.join(','))}` : '';
        const res = await apiClient.get<FYPRecommendationsResponse>(`/categories/brands/recommended${searchParam}`);
        setFypData(res.data);
      } catch (error) {
        console.error('Failed to load recommended collections', error);
      }
    };

    fetchRecommendations();
  }, []);

  const handleImageError = (slotKey: string) => {
    setFailedImages((prev) => ({ ...prev, [slotKey]: true }));
  };

  // Render skeleton while loading API response
  if (!fypData) {
    return (
      <section className="max-w-[1600px] mx-auto px-8 lg:px-12 py-12 space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2 animate-pulse">
          <div className="h-4 w-32 bg-slate-200 rounded-full mx-auto" />
          <div className="h-8 w-80 bg-slate-200 rounded-xl mx-auto" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-120">
          <div className="lg:col-span-7 rounded-3xl bg-slate-100 animate-pulse min-h-105 lg:min-h-120" />
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="rounded-3xl bg-slate-100 animate-pulse min-h-57 flex-1" />
            <div className="rounded-3xl bg-slate-100 animate-pulse min-h-57 flex-1" />
          </div>
        </div>
      </section>
    );
  }

  const { main_eyewear, top_right_eyewear, contact_slot } = fypData;

  return (
    <section className="max-w-[1600px] mx-auto px-8 lg:px-12 py-12 font-sans text-walters-charcoal space-y-6">
      
      {/* UNIFORM SECTION HEADER */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="text-xs font-bold uppercase tracking-[0.2em] text-walters-gold block">
          Personalized Eyewear
        </span>
        <h2 className="text-3xl sm:text-4xl font-serif text-walters-navy font-bold tracking-tight">
          Most Recommended Collections For You
        </h2>
        <p className="text-slate-500 text-xs sm:text-sm font-light leading-relaxed max-w-lg mx-auto">
          Handpicked collections based on top sales volume and your recent browsing preferences.
        </p>
      </div>

      {/* ASYMMETRIC 3-CARD GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-120">
        
        {/* LEFT TALL PORTRAIT CARD: MAIN EYEWEAR BRAND */}
        <div className={`lg:col-span-7 group relative rounded-3xl overflow-hidden ${FALLBACK_STYLES[0]} flex flex-col justify-end border border-slate-100 shadow-2xs hover:shadow-xl transition-all duration-500 min-h-105 lg:min-h-120`}>
          {main_eyewear.hero_image_url && !failedImages['main'] && (
            <img
              src={main_eyewear.hero_image_url}
              alt={main_eyewear.name}
              onError={() => handleImageError('main')}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-95"
            />
          )}
          
          <div className="absolute inset-0 bg-linear-to-t from-slate-950/90 via-slate-950/35 to-transparent pointer-events-none" />

          <div className="relative z-10 p-6 sm:p-10 flex flex-col justify-end h-full space-y-3 max-w-xl">
            <span className="inline-flex items-center space-x-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-walters-gold px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 w-fit">
              <Sparkles className="w-3 h-3 text-walters-gold" />
              <span>{main_eyewear.badge_text || 'TOP FEATURED'}</span>
            </span>

            <h3 className="text-white font-serif text-2xl sm:text-4xl font-normal tracking-tight leading-tight">
              {main_eyewear.name}
            </h3>

            <p className="text-slate-200 text-xs font-light leading-relaxed">
              {main_eyewear.tagline}
            </p>

            <div className="pt-1">
              <Link
                to={`/catalog?brand=${main_eyewear.slug}&sort=top_sales`}
                className="inline-flex items-center space-x-2 px-6 py-2.5 bg-white/90 backdrop-blur-md hover:bg-white text-walters-navy font-semibold text-xs uppercase tracking-wider rounded-full shadow-xs hover:shadow-md transition-all duration-300 group-hover:translate-x-1 border border-white/20"
              >
                <span>Explore Collection</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-walters-navy" />
              </Link>
            </div>
          </div>
        </div>

        {/* RIGHT STACKED CARDS */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          {/* TOP RIGHT CARD: POPULAR EYEWEAR BRAND */}
          <div className={`group relative rounded-3xl overflow-hidden ${FALLBACK_STYLES[1]} flex flex-col justify-end border border-slate-200/60 shadow-2xs hover:shadow-lg transition-all duration-500 min-h-57 flex-1`}>
            {top_right_eyewear.hero_image_url && !failedImages['top_right'] && (
              <img
                src={top_right_eyewear.hero_image_url}
                alt={top_right_eyewear.name}
                onError={() => handleImageError('top_right')}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-95"
              />
            )}
            
            <div className="absolute inset-0 bg-linear-to-t from-slate-950/85 via-slate-950/25 to-transparent pointer-events-none" />

            <div className="relative z-10 p-6 flex flex-col justify-end h-full space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-walters-gold">
                {top_right_eyewear.badge_text || 'POPULAR PICK'}
              </span>
              <h4 className="text-white font-serif text-xl sm:text-2xl font-normal tracking-tight">
                {top_right_eyewear.name}
              </h4>
              <div>
                <Link
                  to={`/catalog?brand=${top_right_eyewear.slug}&sort=top_sales`}
                  className="inline-flex items-center space-x-1.5 px-4 py-2 bg-white/90 backdrop-blur-md hover:bg-white text-walters-navy text-[11px] font-semibold uppercase tracking-wider rounded-full transition-all duration-300 shadow-2xs group-hover:translate-x-1 border border-white/20"
                >
                  <span>View Collection</span>
                  <ArrowUpRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>

          {/* BOTTOM RIGHT CARD: CONTACT LENSES SLOT */}
          <div className={`group relative rounded-3xl overflow-hidden ${FALLBACK_STYLES[2]} flex flex-col justify-end border border-slate-200/60 shadow-2xs hover:shadow-lg transition-all duration-500 min-h-57 flex-1`}>
            {contact_slot.hero_image_url && !failedImages['contact'] && (
              <img
                src={contact_slot.hero_image_url}
                alt={contact_slot.name}
                onError={() => handleImageError('contact')}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-95"
              />
            )}

            <div className="absolute inset-0 bg-linear-to-t from-slate-950/90 via-slate-950/35 to-transparent pointer-events-none" />

            <div className="relative z-10 p-6 flex flex-col justify-end h-full space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-400 flex items-center space-x-1">
                <Sparkles className="w-3 h-3" />
                <span>{contact_slot.badge_text}</span>
              </span>
              <h4 className="text-white font-serif text-xl sm:text-2xl font-normal tracking-tight">
                {contact_slot.name}
              </h4>
              <p className="text-slate-300 text-[11px] font-light leading-snug line-clamp-2">
                {contact_slot.tagline}
              </p>
              <div className="pt-1">
                <Link
                  to={contact_slot.is_personalized ? `/catalog?category=contact_lenses&brand=${contact_slot.slug}` : '/catalog?category=contact_lenses'}
                  className="inline-flex items-center space-x-1.5 px-4 py-2 bg-white/90 backdrop-blur-md hover:bg-white text-walters-navy text-[11px] font-semibold uppercase tracking-wider rounded-full transition-all duration-300 shadow-2xs group-hover:translate-x-1 border border-white/20"
                >
                  <span>{contact_slot.is_personalized ? 'Explore Brand' : 'Explore Contacts'}</span>
                  <ArrowUpRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* FULL-WIDTH BANNER: TRENDING NOW (EDITORIAL UNIFIED PATTERN) */}
      <div className="group relative rounded-3xl overflow-hidden min-h-85 sm:min-h-90 flex items-center p-8 sm:p-12 shadow-2xs hover:shadow-xl transition-all duration-500 border border-slate-100 bg-slate-900">
        <img
          src="/IMAGES/HOMEPAGE/TRENDING_BANNER.png"
          alt="Trending Now Optical Frames"
          className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
        />

        {/* Linear Gradient Overlay: Text readable on left, image stays bright on right */}
        <div className="absolute inset-0 bg-linear-to-r from-slate-950/90 via-slate-950/40 to-transparent pointer-events-none" />

        <div className="relative z-10 max-w-md space-y-3">
          <span className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-white/10 backdrop-blur-md text-walters-gold text-[10px] font-bold uppercase tracking-[0.2em] border border-white/20">
            <TrendingUp className="w-3.5 h-3.5 text-walters-gold" />
            <span>High Sales & High Demand</span>
          </span>

          <h3 className="font-serif text-3xl sm:text-4xl text-white font-normal leading-tight">
            Trending Now
          </h3>

          <p className="text-xs text-slate-200 font-light leading-relaxed">
            Explore our highest volume optical precision frames, luxury silhouettes, and customer favorites.
          </p>

          <div className="pt-2">
            <Link
              to="/catalog?sort=top_sales"
              className="inline-flex items-center space-x-2 px-6 py-3 bg-white text-walters-navy font-semibold text-xs tracking-wider uppercase rounded-full shadow-xs hover:bg-walters-gold hover:text-walters-navy transition-all duration-300 group-hover:translate-x-1"
            >
              <span>Explore Shop</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

      </div>

    </section>
  );
};