// src/pages/Catalog.tsx

import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';
import type { Product } from '../types/index';
import { ProductCard, type ProductGroup } from '../components/ProductCard';
import { FilterDrawer, type FilterState, type FacetsData } from '../components/FilterDrawer';
import { useCart } from '../hooks/useCart';
import { useCurrency } from '../hooks/useCurrency';
import { toast } from 'sonner';
import { Search, X, SlidersHorizontal, Sparkles, Loader2 } from 'lucide-react';

interface ExtendedApiProduct extends Product {
  subcategory?: string | { slug?: string; name?: string };
  frame_type?: string;
  lens_type?: string;
}

interface CatalogApiResponse {
  items?: ExtendedApiProduct[];
  total_count?: number;
  total_pages?: number;
  facets?: FacetsData;
  did_you_mean?: string;
  original_query?: string;
}

const BATCH_PAGE_SIZE = 24;

const INITIAL_FILTER_STATE: FilterState = {
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

export const Catalog: React.FC = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<ExtendedApiProduct[]>([]);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [serverFacets, setServerFacets] = useState<FacetsData | undefined>(undefined);
  const [didYouMean, setDidYouMean] = useState<string | null>(null);
  const [originalQuery, setOriginalQuery] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [localSearchInput, setLocalSearchInput] = useState<string>('');

  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState<boolean>(false);
  const [drawerFilters, setDrawerFilters] = useState<FilterState>(INITIAL_FILTER_STATE);

  const [searchParams, setSearchParams] = useSearchParams();

  const searchQueryParam = searchParams.get('search') || '';
  const categoryParam = searchParams.get('category') || '';
  const brandParam = searchParams.get('brand') || '';

  const { handleAddStandard, handleAddFrameOnly, handleSelectPrescription } = useCart();
  const { formatPrice } = useCurrency();

  useEffect(() => {
    if (brandParam.trim()) {
      const slug = brandParam.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      navigate(`/brands/${slug}`, { replace: true });
    }
  }, [brandParam, navigate]);

  const currentParamsKey = `${searchQueryParam}|${categoryParam}|${JSON.stringify(drawerFilters)}`;
  const [prevParamsKey, setPrevParamsKey] = useState(currentParamsKey);
  
  if (currentParamsKey !== prevParamsKey) {
    setPrevParamsKey(currentParamsKey);
    setPage(1);
    setLocalSearchInput(searchQueryParam);
  }

  useEffect(() => {
    const fetchCatalogBatch = async () => {
      if (brandParam) return;

      const isFirstPage = page === 1;

      if (isFirstPage) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      try {
        const queryParams = new URLSearchParams();
        
        if (searchQueryParam) queryParams.append('q', searchQueryParam);
        
        if (categoryParam) {
          queryParams.append('category', categoryParam);
        } else {
          // EXCLUSION WORKAROUND: If no category is selected ("All Frames"), explicitly request 
          // eyeglasses and sunglasses. This safely filters out contact lenses.
          queryParams.append('category', 'eyeglasses');
          queryParams.append('category', 'sunglasses');
        }

        if (drawerFilters.sortBy) queryParams.append('sort_by', drawerFilters.sortBy);

        // ALIAS WORKAROUND: Append both singular and plural keys to satisfy strict FastAPI validation
        drawerFilters.gender.forEach((v) => {
          queryParams.append('gender', v.toLowerCase());
          queryParams.append('genders', v.toLowerCase());
        });
        drawerFilters.shapes.forEach((v) => {
          queryParams.append('shape', v.toLowerCase());
          queryParams.append('shapes', v.toLowerCase());
        });
        drawerFilters.colors.forEach((v) => {
          queryParams.append('color', v.toLowerCase());
          queryParams.append('colors', v.toLowerCase());
        });
        drawerFilters.frameMaterials.forEach((v) => {
          queryParams.append('frame_material', v);
          queryParams.append('frame_materials', v);
          queryParams.append('materials', v);
        });
        drawerFilters.lensTypes.forEach((v) => {
          queryParams.append('lens_type', v);
          queryParams.append('lens_types', v);
        });
        drawerFilters.sizes.forEach((v) => {
          queryParams.append('size', v.toUpperCase());
          queryParams.append('sizes', v.toUpperCase());
        });

        // Add bounds
        if (drawerFilters.priceRange[0] > 0) queryParams.append('min_price', Math.floor(drawerFilters.priceRange[0]).toString());
        if (drawerFilters.priceRange[1] < 2000) queryParams.append('max_price', Math.ceil(drawerFilters.priceRange[1]).toString());
        if (drawerFilters.lensWidthRange[0] > 38) queryParams.append('min_width', drawerFilters.lensWidthRange[0].toString());
        if (drawerFilters.lensWidthRange[1] < 69) queryParams.append('max_width', drawerFilters.lensWidthRange[1].toString());

        queryParams.append('page', page.toString());
        queryParams.append('page_size', BATCH_PAGE_SIZE.toString());

        const res = await apiClient.get<CatalogApiResponse | ExtendedApiProduct[]>('/products/', {
          params: queryParams,
        });

        if (Array.isArray(res.data)) {
          setProducts(res.data);
          setTotalCount(res.data.length);
          setTotalPages(1);
          setServerFacets(undefined);
          setDidYouMean(null);
          setOriginalQuery(null);
        } else {
          const newItems = res.data.items || [];
          setTotalCount(res.data.total_count || 0);
          setTotalPages(res.data.total_pages || 1);
          setServerFacets(res.data.facets);
          setDidYouMean(res.data.did_you_mean || null);
          setOriginalQuery(res.data.original_query || null);

          if (isFirstPage) {
            setProducts(newItems);
          } else {
            setProducts((prev) => [...prev, ...newItems]);
          }
        }
      } catch (error) {
        console.error('Failed to fetch catalog batch', error);
        toast.error('Failed to load catalog products.');
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    };

    fetchCatalogBatch();
  }, [page, searchQueryParam, categoryParam, brandParam, drawerFilters]);

  const productGroups = useMemo(() => {
    return groupProductsByModel(products);
  }, [products]);

  const handleLoadMore = () => {
    if (page < totalPages) {
      setPage((prevPage) => prevPage + 1);
    }
  };

  const handleCategoryPillClick = (catSlug: string) => {
    const nextParams = new URLSearchParams(searchParams);
    if (catSlug) {
      nextParams.set('category', catSlug);
    } else {
      nextParams.delete('category');
    }
    setSearchParams(nextParams);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nextParams = new URLSearchParams(searchParams);
    if (localSearchInput.trim()) {
      nextParams.set('search', localSearchInput.trim());
    } else {
      nextParams.delete('search');
    }
    setSearchParams(nextParams);
  };

  const clearFilter = (key: string) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete(key);
    if (key === 'search') setLocalSearchInput('');
    setSearchParams(nextParams);
  };

  const handleClearAllFilters = () => {
    setLocalSearchInput('');
    setSearchParams(new URLSearchParams());
    setDrawerFilters(INITIAL_FILTER_STATE);
  };

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

  const isContactCategory = categoryParam.toLowerCase().includes('contact') || categoryParam.toLowerCase().includes('care');

  return (
    <div className="min-h-screen bg-white pb-24 font-sans text-walters-charcoal">
      <FilterDrawer
        isOpen={isFilterDrawerOpen}
        onClose={() => setIsFilterDrawerOpen(false)}
        filters={drawerFilters}
        setFilters={setDrawerFilters}
        totalResultsCount={totalCount}
        onClearAll={handleClearAllFilters}
        facets={serverFacets}
        products={products}
      />

      {!searchQueryParam && (
        <div 
          className="relative text-white py-14 sm:py-20 px-8 lg:px-12 shadow-md overflow-hidden animate-blur-in"
          style={{ background: HERO_FALLBACK_GRADIENT }}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(197,162,101,0.18),transparent_55%)] pointer-events-none" />
          
          <div className="max-w-[1600px] mx-auto relative z-10 space-y-3">
            <div className="flex items-center space-x-2 text-xs font-bold tracking-[0.25em] text-walters-gold uppercase">
              <span>Walters Opticians</span>
              <span>•</span>
              <span>Precision Eyewear</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-white">
              {isContactCategory 
                ? 'Contact Lenses & Care' 
                : categoryParam
                ? `${categoryParam.replace(/_/g, ' ')}`
                : 'Designer Frames & Sunglasses'}
            </h1>

            <p className="text-xs sm:text-sm text-white/75 max-w-2xl font-light leading-relaxed">
              {isContactCategory 
                ? 'Daily, monthly, toric, and multifocal contact lens solutions backed by optical precision.' 
                : 'Handcrafted luxury frames, Italian acetate, and bespoke prescription dispensing.'}
            </p>
          </div>
        </div>
      )}

      <div className="max-w-[1600px] mx-auto px-8 lg:px-12 pt-8 pb-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-slate-100 pb-6 gap-4">
          <div className="space-y-1">
            <h2 className="font-serif text-2xl sm:text-3xl text-walters-navy font-normal capitalize">
              {searchQueryParam 
                ? `Search: "${searchQueryParam}"` 
                : categoryParam 
                ? `${categoryParam.replace(/_/g, ' ')}` 
                : 'Eyewear & Frames'}
            </h2>
            <p className="text-xs text-slate-400 font-light transition-opacity duration-500">
              {totalCount.toLocaleString()} models available
            </p>
          </div>

          <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar py-1">
            {[
              { id: '', label: 'All Frames' },
              { id: 'eyeglasses', label: 'Eyeglasses' },
              { id: 'sunglasses', label: 'Sunglasses' },
            ].map((pill) => {
              const isActive = (categoryParam.toLowerCase() === pill.id.toLowerCase()) || (!categoryParam && pill.id === '');
              return (
                <button
                  key={pill.id || 'all'}
                  type="button"
                  onClick={() => handleCategoryPillClick(pill.id)}
                  className={`px-4 py-2 rounded-full text-xs font-medium transition-all duration-300 cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-walters-navy text-white shadow-2xs font-semibold'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/80'
                  }`}
                >
                  {pill.label}
                </button>
              );
            })}
          </div>

          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={() => setIsFilterDrawerOpen(true)}
              className="inline-flex items-center space-x-2 px-4 py-2.5 bg-slate-50 hover:bg-walters-navy hover:text-white rounded-full text-xs text-slate-700 transition-all duration-300 cursor-pointer border border-slate-200/80 shadow-2xs font-medium"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-walters-gold" />
              <span>Filters & Sort</span>
            </button>

            <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-72">
              <input
                type="text"
                value={localSearchInput}
                onChange={(e) => setLocalSearchInput(e.target.value)}
                placeholder="Search catalog..."
                className="w-full pl-8 pr-7 py-2.5 bg-slate-50 border border-slate-200/80 rounded-full text-xs text-walters-charcoal focus:outline-none focus:border-walters-navy focus:bg-white transition-all"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3 pointer-events-none" />
              {localSearchInput && (
                <button
                  type="button"
                  onClick={() => {
                    setLocalSearchInput('');
                    clearFilter('search');
                  }}
                  className="absolute right-2.5 top-3 text-slate-400 hover:text-walters-navy cursor-pointer transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </form>
          </div>
        </div>

        {didYouMean && (
          <div className="mt-4 p-3.5 bg-amber-50/80 border border-amber-200/80 rounded-2xl flex items-center space-x-2 text-xs text-amber-900 animate-fade-up">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              Showing results for <strong className="font-semibold text-amber-950 underline">{didYouMean}</strong> instead of <em>"{originalQuery}"</em>
            </span>
            <button
              type="button"
              onClick={() => {
                const nextParams = new URLSearchParams(searchParams);
                nextParams.set('search', didYouMean);
                setSearchParams(nextParams);
              }}
              className="ml-auto font-bold text-walters-navy hover:underline cursor-pointer"
            >
              Search for {didYouMean}
            </button>
          </div>
        )}

        {searchQueryParam && (
          <div className="flex flex-wrap items-center gap-2 pt-3 animate-fade-up">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-700 text-xs rounded-full">
              Search: "{searchQueryParam}"
              <button type="button" onClick={() => clearFilter('search')} className="hover:text-walters-navy cursor-pointer">
                <X className="w-3 h-3" />
              </button>
            </span>
          </div>
        )}
      </div>

      <div className="max-w-[1600px] mx-auto px-8 lg:px-12 pt-4">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div key={n} className="bg-slate-50 rounded-2xl h-96 animate-pulse border border-slate-100" />
            ))}
          </div>
        ) : productGroups.length === 0 ? (
          <div className="text-center py-24 bg-slate-50/50 rounded-3xl border border-slate-100 max-w-lg mx-auto space-y-4 animate-fade-up">
            <Search className="w-8 h-8 text-slate-300 mx-auto" />
            <div className="space-y-1">
              <h3 className="font-serif text-lg text-walters-navy">No products found</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                We couldn't find any eyewear matching your selected parameters.
              </p>
            </div>
            <button
              type="button"
              onClick={handleClearAllFilters}
              className="px-5 py-2.5 bg-walters-navy text-white text-xs rounded-full hover:bg-walters-gold hover:text-walters-navy transition-all duration-300 cursor-pointer"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="space-y-14">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {productGroups.map((group, index) => (
                <div 
                  key={group.groupKey}
                  className="animate-fade-up"
                  style={{ animationDelay: `${(index % BATCH_PAGE_SIZE) * 60}ms` }}
                >
                  <ProductCard
                    group={group}
                    onAddToCart={handleAddToCart}
                    formatPrice={formatPrice}
                  />
                </div>
              ))}
            </div>

            {page < totalPages && (
              <div className="flex flex-col items-center justify-center pt-8 space-y-3">
                <span className="text-[11px] text-slate-400 font-medium transition-opacity duration-300">
                  Showing <strong className="text-walters-navy font-semibold">{products.length.toLocaleString()}</strong> of{' '}
                  <strong className="text-walters-navy font-semibold">{totalCount.toLocaleString()}</strong> products
                </span>

                <div className="w-56 h-1 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-walters-navy transition-all duration-500 ease-out rounded-full"
                    style={{ width: `${Math.min(100, (products.length / (totalCount || 1)) * 100)}%` }}
                  />
                </div>

                <button
                  type="button"
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="mt-2 inline-flex items-center space-x-2 px-8 py-3 bg-walters-navy text-white font-medium text-xs tracking-wider rounded-full hover:bg-slate-800 transition-all duration-300 shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {loadingMore ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Loading...</span>
                    </>
                  ) : (
                    <span>Load More ({BATCH_PAGE_SIZE} items)</span>
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};