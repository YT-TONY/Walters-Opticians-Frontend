// src/pages/BrandPage.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiClient } from '../api/client';
import type { Product } from '../types/index';
import type { Brand } from '../context/Category';
import { ProductCard, type ProductGroup } from '../components/ProductCard';
import { FilterDrawer, type FilterState } from '../components/FilterDrawer';
import { Breadcrumb } from '../components/Breadcrumb';
import { useCart } from '../hooks/useCart';
import { useCurrency } from '../hooks/useCurrency';
import { Search, SlidersHorizontal, Loader2, ArrowLeft, PackageX, RefreshCw } from 'lucide-react';

interface ExtendedBrand extends Brand {
  hero_image_url?: string;
  tagline?: string;
}

const INITIAL_FILTERS: FilterState = {
  gender: [],
  shapes: [],
  colors: [],
  frameTypes: [],
  lensTypes: [],
  priceRange: [0, 1000],
  sortBy: 'popularity',
};

const BRAND_HERO_GRADIENTS = [
  'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
  'linear-gradient(135deg, #0f172a 0%, #064e3b 100%)',
  'linear-gradient(135deg, #18181b 0%, #312e81 100%)',
  'linear-gradient(135deg, #1e1b4b 0%, #4c1d95 100%)',
  'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
];

const getBrandHeroGradient = (slug: string): string => {
  let hash = 0;
  for (let i = 0; i < slug.length; i++) {
    hash = slug.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % BRAND_HERO_GRADIENTS.length;
  return BRAND_HERO_GRADIENTS[index];
};

const groupProductsByModel = (products: Product[]): ProductGroup[] => {
  const groupMap = new Map<string, Product[]>();

  products.forEach((product) => {
    const groupKey =
      product.model_code && product.model_code.trim() !== ''
        ? product.model_code.toLowerCase().trim()
        : `${product.brand.toLowerCase().trim()}-${product.name.toLowerCase().trim()}`;

    if (!groupMap.has(groupKey)) {
      groupMap.set(groupKey, []);
    }
    groupMap.get(groupKey)!.push(product);
  });

  return Array.from(groupMap.entries()).map(([key, variants]) => ({
    groupKey: key,
    defaultProduct: variants[0],
    variants,
  }));
};

export const BrandPage: React.FC = () => {
  const { brandSlug } = useParams<{ brandSlug: string }>();

  const [brand, setBrand] = useState<ExtendedBrand | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filter & Search Controls
  const [activeCategoryPill, setActiveCategoryPill] = useState<string>('all');
  const [modelSearch, setModelSearch] = useState<string>('');
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);

  const { handleAddStandard, handleAddFrameOnly, handleSelectPrescription } = useCart();
  const { formatPrice } = useCurrency();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [brandSlug]);

  useEffect(() => {
    const fetchBrandData = async () => {
      try {
        setLoading(true);
        setError(null);

        const brandsRes = await apiClient.get<ExtendedBrand[]>('/categories/brands/all');
        const foundBrand = brandsRes.data.find(
          (b) => b.slug.toLowerCase() === brandSlug?.toLowerCase()
        );

        if (foundBrand) {
          setBrand(foundBrand);
        } else {
          const formattedName = (brandSlug || '')
            .split('-')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');

          setBrand({
            id: 0,
            name: formattedName,
            slug: brandSlug || '',
          });
        }

        const productsRes = await apiClient.get<Product[]>('/products/');
        const targetBrandName = foundBrand ? foundBrand.name.toLowerCase() : (brandSlug || '').replace(/-/g, ' ');

        const filteredByBrand = productsRes.data.filter((p) => {
          const pBrand = (p.brand || '').toLowerCase();
          return pBrand.includes(targetBrandName) || targetBrandName.includes(pBrand);
        });

        setProducts(filteredByBrand);
      } catch (err) {
        console.error('Failed to load brand catalog:', err);
        setError('Unable to load brand catalog. Please check your connection.');
      } finally {
        setLoading(false);
      }
    };

    if (brandSlug) {
      fetchBrandData();
    }
  }, [brandSlug]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (activeCategoryPill === 'eyeglasses' && p.category?.toLowerCase().includes('sun')) return false;
      if (activeCategoryPill === 'sunglasses' && !p.category?.toLowerCase().includes('sun')) return false;

      if (modelSearch.trim()) {
        const query = modelSearch.toLowerCase().trim();
        const matchesName = (p.name || '').toLowerCase().includes(query);
        const matchesModel = (p.model_code || '').toLowerCase().includes(query);
        const matchesDesc = (p.description || '').toLowerCase().includes(query);
        if (!matchesName && !matchesModel && !matchesDesc) return false;
      }

      if (filters.gender.length > 0) {
        const pGender = (p.gender || '').toLowerCase();
        const match = filters.gender.some((g) => g.toLowerCase() === pGender || pGender === 'unisex');
        if (!match) return false;
      }

      if (filters.shapes.length > 0) {
        const pShape = (p.shape || '').toLowerCase();
        const match = filters.shapes.some((s) => s.toLowerCase() === pShape);
        if (!match) return false;
      }

      if (filters.colors.length > 0) {
        const pColor = (p.color_description || (p.colors && p.colors.length > 0 ? p.colors.join(' ') : '')).toLowerCase();
        const match = filters.colors.some((c) => pColor.includes(c.toLowerCase()));
        if (!match) return false;
      }

      return true;
    });
  }, [products, activeCategoryPill, modelSearch, filters]);

  const sortedProductGroups = useMemo(() => {
    const groups = groupProductsByModel(filteredProducts);

    return groups.sort((a, b) => {
      const pA = a.defaultProduct;
      const pB = b.defaultProduct;

      if (filters.sortBy === 'price_asc') {
        return pA.price_full_gbp - pB.price_full_gbp;
      }
      if (filters.sortBy === 'price_desc') {
        return pB.price_full_gbp - pA.price_full_gbp;
      }
      if (filters.sortBy === 'newest') {
        return (pB.id || 0) - (pA.id || 0);
      }
      return (pB.is_bestseller ? 1 : 0) - (pA.is_bestseller ? 1 : 0);
    });
  }, [filteredProducts, filters.sortBy]);

  const handleAddToCart = (product: Product, option: string) => {
    switch (option.toLowerCase()) {
      case 'prescription':
        handleSelectPrescription(product);
        break;
      case 'just frames':
      case 'frames_only':
        handleAddFrameOnly(product);
        break;
      case 'standard':
      default:
        handleAddStandard(product);
        break;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-walters-cream/30 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-walters-navy" />
        <p className="text-xs font-light tracking-widest text-walters-navy uppercase">Loading Brand Catalog...</p>
      </div>
    );
  }

  if (error || !brand) {
    return (
      <div className="min-h-screen bg-walters-cream/30 py-20 px-4 text-center font-sans">
        <div className="max-w-md mx-auto space-y-6">
          <h2 className="font-serif text-2xl text-walters-navy">Brand Catalog Unavailable</h2>
          <p className="text-sm font-light text-walters-charcoal/70">{error || 'Brand not found.'}</p>
          <Link
            to="/"
            className="inline-flex items-center space-x-2 text-xs font-light text-walters-navy underline underline-offset-4 hover:opacity-70"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Catalog</span>
          </Link>
        </div>
      </div>
    );
  }

  const heroStyle = brand.hero_image_url
    ? { backgroundImage: `url(${brand.hero_image_url})` }
    : { background: getBrandHeroGradient(brand.slug || brand.name) };

  return (
    <div className="min-h-screen bg-walters-cream/10 font-sans text-walters-charcoal antialiased pb-20">
      
      {/* 1. TOP BREADCRUMB NAVIGATION */}
      <Breadcrumb
        items={[
          { label: 'Glasses', path: '/catalog' },
          { label: brand.name },
        ]}
      />

      {/* 2. ENLARGED HERO BANNER: EXPANDED VERTICAL HEIGHT & PROPORTIONS */}
      <div className="relative w-full bg-walters-navy text-white py-24 sm:py-32 lg:py-36 min-h-90 sm:min-h-110 overflow-hidden shadow-xs flex items-center">
        <div 
          className="absolute inset-0 bg-cover bg-center transition-all duration-700 opacity-85"
          style={heroStyle}
        />
        <div className="absolute inset-0 bg-linear-to-r from-walters-navy/95 via-walters-navy/80 to-transparent" />

        <div className="relative w-full max-w-[1600px] mx-auto px-6 sm:px-10 lg:px-16 flex flex-col justify-center space-y-2 z-10">
          <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-normal tracking-tight text-white drop-shadow-md">
            {brand.name}
          </h1>
          <p className="font-serif text-xl sm:text-2xl lg:text-3xl text-slate-200/90 font-light tracking-[0.25em] uppercase pt-1">
            Eyewear
          </p>
        </div>
      </div>

      {/* 3. CONTROL STRIP LAYOUT: BALANCED SIZING */}
      <div className="w-full max-w-[1600px] mx-auto px-6 sm:px-10 lg:px-16 pt-6 pb-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 border-b border-neutral-200/80 pb-6">
          
          {/* FAR LEFT: ISOLATED FILTER BUTTON + TITLE & BALANCED COUNT */}
          <div className="flex items-center space-x-4 shrink-0">
            <div className="relative group shrink-0">
              <div className="absolute -inset-1 rounded-full bg-amber-500/20 ring-2 ring-amber-500/30 animate-pulse group-hover:ring-amber-500 group-hover:bg-amber-500/20 transition-all duration-300" />
              <button
                type="button"
                onClick={() => setIsFilterOpen(true)}
                title="Filter & Sort"
                className="relative w-11 h-11 rounded-full bg-walters-navy text-white flex items-center justify-center shadow-md transition-all duration-300 hover:scale-105 hover:bg-amber-500 cursor-pointer"
              >
                <SlidersHorizontal className="w-4 h-4 text-white transition-transform group-hover:rotate-90 duration-300" />
              </button>
            </div>

            <div className="flex items-center space-x-2.5">
              <h2 className="font-serif text-xl sm:text-2xl font-normal text-walters-navy">
                Designer Eyewear
              </h2>
              <span className="text-xs sm:text-sm font-semibold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200/80 font-sans shadow-2xs">
                {filteredProducts.length}
              </span>
            </div>
          </div>

          {/* CENTER: BALANCED CATEGORY PILLS */}
          <div className="flex items-center space-x-2.5 overflow-x-auto no-scrollbar py-1">
            {[
              { id: 'all', label: 'All Frames' },
              { id: 'eyeglasses', label: 'Eyeglasses' },
              { id: 'sunglasses', label: 'Sunglasses' },
            ].map((pill) => (
              <button
                key={pill.id}
                type="button"
                onClick={() => setActiveCategoryPill(pill.id)}
                className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap h-10 flex items-center ${
                  activeCategoryPill === pill.id
                    ? 'bg-walters-navy text-white shadow-sm'
                    : 'bg-neutral-100 hover:bg-neutral-200/80 text-neutral-700 border border-neutral-200/90'
                }`}
              >
                {pill.label}
              </button>
            ))}
          </div>

          {/* FAR RIGHT: BALANCED SEARCH BAR */}
          <div className="relative w-full lg:w-80 shrink-0">
            <input
              type="text"
              value={modelSearch}
              onChange={(e) => setModelSearch(e.target.value)}
              placeholder={`Search in ${brand.name}...`}
              className="w-full bg-white border border-neutral-300 rounded-full h-10 py-2 pl-10 pr-4 text-xs text-walters-charcoal placeholder-neutral-400 focus:outline-none focus:border-walters-navy shadow-2xs transition-all"
            />
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          </div>

        </div>
      </div>

      {/* 4. WIDE 4-COLUMN PRODUCT GRID & FAINT EMPTY STATE */}
      <div className="w-full max-w-[1600px] mx-auto px-6 sm:px-10 lg:px-16">
        {sortedProductGroups.length === 0 ? (
          <div className="text-center py-20 px-4 my-6 max-w-md mx-auto space-y-3">
            <div className="w-14 h-14 mx-auto rounded-full bg-neutral-100/80 flex items-center justify-center text-neutral-300 mb-2">
              <PackageX className="w-7 h-7 stroke-1 text-slate-300" />
            </div>
            <p className="text-sm font-light text-neutral-400">
              Product currently unavailable
            </p>
            {(modelSearch || activeCategoryPill !== 'all' || filters.gender.length > 0 || filters.shapes.length > 0 || filters.colors.length > 0) && (
              <button
                type="button"
                onClick={() => {
                  setModelSearch('');
                  setActiveCategoryPill('all');
                  setFilters(INITIAL_FILTERS);
                }}
                className="inline-flex items-center space-x-1.5 text-xs font-semibold text-walters-navy underline hover:text-amber-600 transition-colors cursor-pointer pt-1"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset filters</span>
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
            {sortedProductGroups.map((group) => (
              <ProductCard
                key={group.groupKey}
                group={group}
                onAddToCart={handleAddToCart}
                formatPrice={formatPrice}
              />
            ))}
          </div>
        )}
      </div>

      {/* 5. SLIDE-OVER FILTER DRAWER */}
      <FilterDrawer
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        filters={filters}
        setFilters={setFilters}
        totalResultsCount={filteredProducts.length}
        onClearAll={() => setFilters(INITIAL_FILTERS)}
        availableProducts={products}
      />

    </div>
  );
};