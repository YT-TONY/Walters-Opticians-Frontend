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
import { Search, SlidersHorizontal, Loader2, ArrowLeft, PackageX, RefreshCw, X } from 'lucide-react';

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
  frameMaterials: [],
  sizes: [],
  priceRange: [0, 2000],
  lensWidthRange: [38, 69],
  sortBy: 'popularity',
};

const HERO_FALLBACK_GRADIENT = 'linear-gradient(135deg, #0f172a 0%, #064e3b 100%)';

// Local helper to bypass React Fast Refresh component export constraints
const deriveSizeFromWidth = (width?: number): string | null => {
  if (!width) return null;
  if (width >= 42 && width <= 46) return 'XS';
  if (width >= 47 && width <= 49) return 'S';
  if (width >= 50 && width <= 53) return 'M';
  if (width >= 54 && width <= 56) return 'L';
  if (width >= 57) return 'XL';
  return null;
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

        const formattedBrandName = (brandSlug || '')
          .split('-')
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');

        if (foundBrand) {
          setBrand(foundBrand);
        } else {
          setBrand({
            id: 0,
            name: formattedBrandName,
            slug: brandSlug || '',
          });
        }

        const paramsBrand = foundBrand ? foundBrand.name : formattedBrandName;

        const productsRes = await apiClient.get<Product[] | { items?: Product[] }>('/products/', {
          params: { page_size: 100, brand: paramsBrand },
        });

        const rawProducts = Array.isArray(productsRes.data)
          ? productsRes.data
          : productsRes.data?.items || [];

        const targetBrandName = paramsBrand.toLowerCase();
        const filteredByBrand = rawProducts.filter((p) => {
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

  const facetsData = useMemo(() => {
    if (!products.length) return undefined;
    const prices = products.map((p) => p.price_full_gbp || 0);
    const min_price = Math.min(...prices);
    const max_price = Math.max(...prices);
    const shapes = Array.from(new Set(products.map((p) => p.shape).filter(Boolean) as string[]));
    const colors = Array.from(new Set(products.map((p) => p.color_description).filter(Boolean) as string[]));
    const brands = Array.from(new Set(products.map((p) => p.brand).filter(Boolean) as string[]));
    const genders = Array.from(new Set(products.map((p) => p.gender).filter(Boolean) as string[]));

    return { min_price, max_price, brands, shapes, colors, genders };
  }, [products]);

  const { hasEyeglasses, hasSunglasses } = useMemo(() => {
    let eyeglassCount = 0;
    let sunglassCount = 0;

    products.forEach((p) => {
      const cat = (p.category || '').toLowerCase();
      if (cat.includes('sun')) {
        sunglassCount++;
      } else {
        eyeglassCount++;
      }
    });

    return {
      hasEyeglasses: eyeglassCount > 0,
      hasSunglasses: sunglassCount > 0,
    };
  }, [products]);

  const showCategoryPills = hasEyeglasses && hasSunglasses;

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (showCategoryPills) {
        if (activeCategoryPill === 'eyeglasses' && (p.category || '').toLowerCase().includes('sun')) return false;
        if (activeCategoryPill === 'sunglasses' && !(p.category || '').toLowerCase().includes('sun')) return false;
      }

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

      if (filters.frameMaterials.length > 0) {
        const pMat = (p.frame_material || p.description || '').toLowerCase();
        const match = filters.frameMaterials.some((m) => pMat.includes(m.toLowerCase()));
        if (!match) return false;
      }

      if (filters.lensTypes.length > 0) {
        // Correct strict typing for unexpected dynamic types
        const pLens = (p.lens_material || (p as Product & { lens_type?: string }).lens_type || p.lens_design || p.description || '').toLowerCase();
        const match = filters.lensTypes.some((l) => pLens.includes(l.toLowerCase()));
        if (!match) return false;
      }

      if (filters.sizes.length > 0) {
        const rawSize = (p as Product & { size?: string }).size;
        const productSizes = p.sizes ? [...p.sizes] : (rawSize ? [rawSize] : []);

        const derivedSize = deriveSizeFromWidth(p.lens_width);
        if (derivedSize && !productSizes.includes(derivedSize)) {
          productSizes.push(derivedSize);
        }

        const match = filters.sizes.some((s) =>
          productSizes.some((ps) => ps.toString().toUpperCase() === s.toUpperCase())
        );
        if (!match) return false;
      }

      if (p.lens_width) {
        if (p.lens_width < filters.lensWidthRange[0] || p.lens_width > filters.lensWidthRange[1]) {
          return false;
        }
      }

      const pPrice = p.price_full_gbp || 0;
      if (pPrice < filters.priceRange[0] || pPrice > filters.priceRange[1]) {
        return false;
      }

      return true;
    });
  }, [products, showCategoryPills, activeCategoryPill, modelSearch, filters]);

  const sortedProductGroups = useMemo(() => {
    const groups = groupProductsByModel(filteredProducts);

    return groups.sort((a, b) => {
      const pA = a.defaultProduct;
      const pB = b.defaultProduct;

      if (filters.sortBy === 'price_asc') {
        return (pA.price_full_gbp || 0) - (pB.price_full_gbp || 0);
      }
      if (filters.sortBy === 'price_desc') {
        return (pB.price_full_gbp || 0) - (pA.price_full_gbp || 0);
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
      <div className="min-h-screen bg-white flex flex-col items-center justify-center space-y-4 font-sans">
        <Loader2 className="w-8 h-8 animate-spin text-walters-navy" />
        <p className="text-xs font-light tracking-widest text-walters-navy uppercase">Loading Brand Catalog...</p>
      </div>
    );
  }

  if (error || !brand) {
    return (
      <div className="min-h-screen bg-white py-20 px-4 text-center font-sans">
        <div className="max-w-md mx-auto space-y-6">
          <h2 className="font-serif text-2xl text-walters-navy">Brand Catalog Unavailable</h2>
          <p className="text-sm font-light text-walters-charcoal/70">{error || 'Brand not found.'}</p>
          <Link
            to="/catalog"
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
    : { background: HERO_FALLBACK_GRADIENT };

  return (
    <div className="min-h-screen bg-white font-sans text-walters-charcoal antialiased pb-24 relative">
      <Breadcrumb
        items={[
          { label: 'Glasses', path: '/catalog' },
          { label: brand.name },
        ]}
      />

      <div
        className="relative text-white py-14 sm:py-20 px-8 lg:px-12 shadow-md overflow-hidden bg-cover bg-center"
        style={heroStyle}
      >
        <div className="absolute inset-0 bg-linear-to-r from-walters-navy/95 via-walters-navy/80 to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(197,162,101,0.18),transparent_55%)] pointer-events-none" />

        <div className="max-w-[1600px] mx-auto relative z-10 space-y-3">
          <div className="flex items-center space-x-2 text-xs font-bold tracking-[0.25em] text-walters-gold uppercase">
            <span>Walters Opticians</span>
            <span>•</span>
            <span>Designer Collection</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-white drop-shadow-md">
            {brand.name}
          </h1>

          <p className="text-xs sm:text-sm text-white/75 max-w-2xl font-light leading-relaxed">
            {brand.tagline || `Handcrafted luxury frames, Italian acetate, and bespoke optical dispensing from ${brand.name}.`}
          </p>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-8 lg:px-12 pt-8 pb-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-slate-100 pb-6 gap-4">
          <div className="space-y-1">
            <h2 className="font-serif text-2xl sm:text-3xl text-walters-navy font-normal capitalize">
              {brand.name} Eyewear
            </h2>
            <p className="text-xs text-slate-400 font-light">
              {sortedProductGroups.length} models available
            </p>
          </div>

          {showCategoryPills && (
            <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar py-1">
              {[
                { id: 'all', label: 'All Frames' },
                { id: 'eyeglasses', label: 'Eyeglasses' },
                { id: 'sunglasses', label: 'Sunglasses' },
              ].map((pill) => (
                <button
                  key={pill.id}
                  type="button"
                  onClick={() => setActiveCategoryPill(pill.id)}
                  className={`px-4 py-2 rounded-full text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                    activeCategoryPill === pill.id
                      ? 'bg-walters-navy text-white shadow-2xs'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/80'
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>
          )}

          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={() => setIsFilterOpen(true)}
              className="inline-flex items-center space-x-2 px-4 py-2.5 bg-slate-50 hover:bg-walters-navy hover:text-white rounded-full text-xs text-slate-700 transition-all duration-200 cursor-pointer border border-slate-200/80 shadow-2xs font-medium"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-walters-gold" />
              <span>Filters & Sort</span>
            </button>

            <div className="relative w-full sm:w-72">
              <input
                type="text"
                value={modelSearch}
                onChange={(e) => setModelSearch(e.target.value)}
                placeholder={`Search ${brand.name}...`}
                className="w-full pl-8 pr-7 py-2.5 bg-slate-50 border border-slate-200/80 rounded-full text-xs text-walters-charcoal focus:outline-none focus:border-walters-navy focus:bg-white transition-all"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3 pointer-events-none" />
              {modelSearch && (
                <button
                  type="button"
                  onClick={() => setModelSearch('')}
                  className="absolute right-2.5 top-3 text-slate-400 hover:text-walters-navy cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-8 lg:px-12 pt-4">
        {sortedProductGroups.length === 0 ? (
          <div className="text-center py-24 bg-slate-50/50 rounded-3xl border border-slate-100 max-w-lg mx-auto space-y-4">
            <PackageX className="w-8 h-8 text-slate-300 mx-auto stroke-1" />
            <div className="space-y-1">
              <h3 className="font-serif text-lg text-walters-navy">No frames found</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                We couldn't find any eyewear from {brand.name} matching your active parameters.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setModelSearch('');
                setActiveCategoryPill('all');
                setFilters(INITIAL_FILTERS);
              }}
              className="inline-flex items-center space-x-1.5 px-5 py-2.5 bg-walters-navy text-white text-xs rounded-full hover:bg-walters-gold hover:text-walters-navy transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset parameters</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
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

      <FilterDrawer
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        filters={filters}
        setFilters={setFilters}
        totalResultsCount={filteredProducts.length}
        onClearAll={() => setFilters(INITIAL_FILTERS)}
        facets={facetsData}
        products={products}
      />
    </div>
  );
};