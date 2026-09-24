// src/pages/BrandPage.tsx

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiClient } from '../api/client';
import type { Product } from '../types/index';
import type { Brand } from '../context/Category';
import { ProductCard, type ProductGroup } from '../components/ProductCard';
import { FilterDrawer, type FilterState, type FacetsData } from '../components/FilterDrawer';
import { Breadcrumb } from '../components/Breadcrumb';
import { useCart } from '../hooks/useCart';
import { useCurrency } from '../hooks/useCurrency';
import { Search, SlidersHorizontal, Loader2, ArrowLeft, PackageX, RefreshCw, X, AlertTriangle } from 'lucide-react';

interface ExtendedBrand extends Brand {
  hero_image_url?: string;
  tagline?: string;
}

interface BrandCatalogApiResponse {
  items?: Product[];
  total_count?: number;
  total_pages?: number;
  facets?: FacetsData;
}

const BATCH_PAGE_SIZE = 24;

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
  const [serverFacets, setServerFacets] = useState<FacetsData | undefined>(undefined);
  
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);
  
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [errorStatus, setErrorStatus] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [activeCategoryPill, setActiveCategoryPill] = useState<string>('all');
  const [modelSearch, setModelSearch] = useState<string>('');
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);

  const { handleAddStandard, handleAddFrameOnly, handleSelectPrescription } = useCart();
  const { formatPrice } = useCurrency();

  const currentParamsKey = `${brandSlug}|${activeCategoryPill}|${modelSearch}|${JSON.stringify(filters)}`;
  const [prevParamsKey, setPrevParamsKey] = useState(currentParamsKey);
  
  if (currentParamsKey !== prevParamsKey) {
    setPrevParamsKey(currentParamsKey);
    setPage(1);
    
    if (prevParamsKey !== '' && !prevParamsKey.startsWith(`${brandSlug}|`)) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setProducts([]);
      setFilters(INITIAL_FILTERS);
      setActiveCategoryPill('all');
      setModelSearch('');
      setBrand(null);
    }
  }

  useEffect(() => {
    let isMounted = true;
    const fetchBrandInfo = async () => {
      if (!brandSlug) return;
      try {
        const brandsRes = await apiClient.get<ExtendedBrand[]>('/categories/brands/all');
        const foundBrand = brandsRes.data.find(
          (b) => b.slug.toLowerCase() === brandSlug.toLowerCase()
        );
        const formattedBrandName = brandSlug.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());

        if (isMounted) {
          if (foundBrand) {
            setBrand(foundBrand);
          } else {
            setBrand({ id: 0, name: formattedBrandName, slug: brandSlug });
          }
        }
      } catch (err) {
        console.error('Failed to load brand metadata:', err);
      }
    };

    fetchBrandInfo();
    return () => {
      isMounted = false;
    };
  }, [brandSlug]);

  useEffect(() => {
    const fetchBrandCatalog = async () => {
      if (!brandSlug) return;

      const isFirstPage = page === 1;

      if (isFirstPage) {
        setLoading(true);
        setErrorStatus(null);
        setErrorMessage(null);
      } else {
        setLoadingMore(true);
      }

      try {
        const queryParams = new URLSearchParams();
        const brandNameQuery = brand?.name || brandSlug.replace(/-/g, ' ');
        queryParams.append('brand', brandNameQuery);
        
        if (modelSearch) queryParams.append('q', modelSearch);
        
        if (activeCategoryPill !== 'all') {
          queryParams.append('category', activeCategoryPill);
        } else {
          // EXCLUSION WORKAROUND: If no category is selected ("All Frames"), explicitly request 
          // eyeglasses and sunglasses. This safely filters out contact lenses for brands too.
          queryParams.append('category', 'eyeglasses');
          queryParams.append('category', 'sunglasses');
        }
        
        if (filters.sortBy) queryParams.append('sort_by', filters.sortBy);

        // ALIAS WORKAROUND: Append both singular and plural keys
        filters.gender.forEach((v) => {
          queryParams.append('gender', v.toLowerCase());
          queryParams.append('genders', v.toLowerCase());
        });
        filters.shapes.forEach((v) => {
          queryParams.append('shape', v.toLowerCase());
          queryParams.append('shapes', v.toLowerCase());
        });
        filters.colors.forEach((v) => {
          queryParams.append('color', v.toLowerCase());
          queryParams.append('colors', v.toLowerCase());
        });
        filters.frameMaterials.forEach((v) => {
          queryParams.append('frame_material', v);
          queryParams.append('frame_materials', v);
          queryParams.append('materials', v);
        });
        filters.lensTypes.forEach((v) => {
          queryParams.append('lens_type', v);
          queryParams.append('lens_types', v);
        });
        filters.sizes.forEach((v) => {
          queryParams.append('size', v.toUpperCase());
          queryParams.append('sizes', v.toUpperCase());
        });

        if (filters.priceRange[0] > 0) queryParams.append('min_price', Math.floor(filters.priceRange[0]).toString());
        if (filters.priceRange[1] < 2000) queryParams.append('max_price', Math.ceil(filters.priceRange[1]).toString());
        if (filters.lensWidthRange[0] > 38) queryParams.append('min_width', filters.lensWidthRange[0].toString());
        if (filters.lensWidthRange[1] < 69) queryParams.append('max_width', filters.lensWidthRange[1].toString());
        
        queryParams.append('page', page.toString());
        queryParams.append('page_size', BATCH_PAGE_SIZE.toString());

        const res = await apiClient.get<BrandCatalogApiResponse | Product[]>('/products/', {
          params: queryParams,
        });

        if (Array.isArray(res.data)) {
          setProducts(res.data);
          setTotalCount(res.data.length);
          setTotalPages(1);
          setServerFacets(undefined);
        } else {
          const newItems = res.data.items || [];
          setTotalCount(res.data.total_count || 0);
          setTotalPages(res.data.total_pages || 1);
          setServerFacets(res.data.facets);

          if (isFirstPage) {
            setProducts(newItems);
          } else {
            setProducts((prev) => [...prev, ...newItems]);
          }
        }
      } catch (error) {
        const err = error as { response?: { status: number } };
        console.error('Failed to load brand catalog:', err);
        if (err.response) {
          const status = err.response.status;
          setErrorStatus(status);
          if (status === 422) {
            setErrorMessage('Invalid request parameter format. Retrying with default catalog bounds...');
          } else if (status === 404) {
            setErrorMessage('Brand catalog not found.');
          } else {
            setErrorMessage(`Server error (${status}). Please try again later.`);
          }
        } else {
          setErrorMessage('Network connection lost. Please check your internet.');
        }
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    };

    fetchBrandCatalog();
  }, [page, brandSlug, activeCategoryPill, modelSearch, filters, brand?.name]);

  const sortedProductGroups = useMemo(() => {
    return groupProductsByModel(products);
  }, [products]);

  const handleLoadMore = () => {
    if (page < totalPages) {
      setPage((prevPage) => prevPage + 1);
    }
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

  if (errorMessage && !loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6 text-center font-sans">
        <div className="max-w-md bg-slate-50 border border-slate-200 p-8 rounded-3xl space-y-4 shadow-sm animate-scale-in">
          <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center mx-auto">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h2 className="font-serif text-xl font-semibold text-walters-navy">
            {errorStatus === 422 ? 'Catalog Format Error' : 'Unable to Load Catalog'}
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            {errorMessage}
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                setFilters(INITIAL_FILTERS);
                setModelSearch('');
                setActiveCategoryPill('all');
                setPage(1); 
              }}
              className="inline-flex items-center space-x-1.5 px-4 py-2.5 bg-walters-navy text-white text-xs font-medium rounded-full hover:bg-slate-800 transition-all duration-300 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry Request</span>
            </button>
            <Link
              to="/catalog"
              className="inline-flex items-center space-x-1.5 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 text-xs font-medium rounded-full hover:bg-slate-100 transition-all duration-300"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>All Frames</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const heroStyle = brand?.hero_image_url
    ? { backgroundImage: `url(${brand.hero_image_url})` }
    : { background: HERO_FALLBACK_GRADIENT };

  return (
    <div className="min-h-screen bg-white font-sans text-walters-charcoal antialiased pb-24 relative">

      <Breadcrumb
        items={[
          { label: 'Glasses', path: '/catalog' },
          { label: brand?.name || 'Designer Brand' },
        ]}
      />

      <div
        className="relative text-white py-14 sm:py-20 px-8 lg:px-12 shadow-md overflow-hidden bg-cover bg-center animate-blur-in"
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
            {brand?.name}
          </h1>

          <p className="text-xs sm:text-sm text-white/75 max-w-2xl font-light leading-relaxed">
            {brand?.tagline || `Handcrafted luxury frames, Italian acetate, and bespoke optical dispensing from ${brand?.name || 'this designer'}.`}
          </p>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-8 lg:px-12 pt-8 pb-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-slate-100 pb-6 gap-4">
          <div className="space-y-1">
            <h2 className="font-serif text-2xl sm:text-3xl text-walters-navy font-normal capitalize">
              {brand?.name} Eyewear
            </h2>
            <p className="text-xs text-slate-400 font-light transition-opacity duration-500">
              {totalCount.toLocaleString()} models available
            </p>
          </div>

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
                className={`px-4 py-2 rounded-full text-xs font-medium transition-all duration-300 cursor-pointer whitespace-nowrap ${
                  activeCategoryPill === pill.id
                    ? 'bg-walters-navy text-white shadow-2xs'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/80'
                }`}
              >
                {pill.label}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={() => setIsFilterOpen(true)}
              className="inline-flex items-center space-x-2 px-4 py-2.5 bg-slate-50 hover:bg-walters-navy hover:text-white rounded-full text-xs text-slate-700 transition-all duration-300 cursor-pointer border border-slate-200/80 shadow-2xs font-medium"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-walters-gold" />
              <span>Filters & Sort</span>
            </button>

            <div className="relative w-full sm:w-72">
              <input
                type="text"
                value={modelSearch}
                onChange={(e) => setModelSearch(e.target.value)}
                placeholder={`Search ${brand?.name || 'collection'}...`}
                className="w-full pl-8 pr-7 py-2.5 bg-slate-50 border border-slate-200/80 rounded-full text-xs text-walters-charcoal focus:outline-none focus:border-walters-navy focus:bg-white transition-all"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3 pointer-events-none" />
              {modelSearch && (
                <button
                  type="button"
                  onClick={() => setModelSearch('')}
                  className="absolute right-2.5 top-3 text-slate-400 hover:text-walters-navy cursor-pointer transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-8 lg:px-12 pt-4">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div key={n} className="bg-slate-50 rounded-2xl h-96 animate-pulse border border-slate-100" />
            ))}
          </div>
        ) : sortedProductGroups.length === 0 ? (
          <div className="text-center py-24 bg-slate-50/50 rounded-3xl border border-slate-100 max-w-lg mx-auto space-y-4 animate-fade-up">
            <PackageX className="w-8 h-8 text-slate-300 mx-auto stroke-1" />
            <div className="space-y-1">
              <h3 className="font-serif text-lg text-walters-navy">No frames found</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                We couldn't find any eyewear from {brand?.name} matching your active parameters.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setModelSearch('');
                setActiveCategoryPill('all');
                setFilters(INITIAL_FILTERS);
              }}
              className="inline-flex items-center space-x-1.5 px-5 py-2.5 bg-walters-navy text-white text-xs rounded-full hover:bg-walters-gold hover:text-walters-navy transition-all duration-300 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset parameters</span>
            </button>
          </div>
        ) : (
          <div className="space-y-14">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {sortedProductGroups.map((group, index) => (
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

      <FilterDrawer
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        filters={filters}
        setFilters={setFilters}
        totalResultsCount={totalCount}
        onClearAll={() => setFilters(INITIAL_FILTERS)}
        facets={serverFacets}
        products={products}
      />
    </div>
  );
};