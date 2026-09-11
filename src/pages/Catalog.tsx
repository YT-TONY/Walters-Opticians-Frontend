// src/pages/Catalog.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { apiClient } from '../api/client';
import type { Product } from '../types/index';
import { ProductCard, type ProductGroup } from '../components/ProductCard';
import { useCart } from '../hooks/useCart';
import { useCurrency } from '../hooks/useCurrency';
import { toast } from 'sonner';
import { Search, X, Filter, HelpCircle } from 'lucide-react';

interface ExtendedApiProduct extends Product {
  subcategory?: string | { slug?: string; name?: string };
}

const FALLBACK_BRANDS = [
  'Ray-Ban',
  'Tiffany & Co.',
  'Oakley',
  'Gucci',
  'Prada',
  'Tom Ford',
  'Persol',
  'Versace',
  'Burberry',
  'Chanel',
  'Dior',
  'Cartier',
  'Bottega Veneta',
  'Bulgari',
  'Calvin Klein',
  'Dolce & Gabbana',
  'Emporio Armani',
  'Hugo Boss',
  'Jimmy Choo',
  'Lacoste',
  'Marc Jacobs',
  'Michael Kors',
  'Nike',
  'Polo Ralph Lauren',
  'Saint Laurent',
  'Ted Baker'
];

const GENERIC_OPTICAL_TYPES = [
  'Aviator',
  'Wayfarer',
  'Cat Eye',
  'Round Frames',
  'Square Frames',
  'Titanium Frames',
  'Blue Light Lenses',
  'Single Vision',
  'Varifocal Lenses',
  'Reading Glasses',
  'Polarized Sunglasses'
];

// Strip non-alphanumeric characters for normalized comparison ("ray ban" == "rayban" == "Ray-Ban")
const normalizeStr = (str: string) => str.toLowerCase().replace(/[^a-z0-9]/g, '');

// Levenshtein Distance Matrix Calculation
const getLevenshteinDistance = (a: string, b: string): number => {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;

  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[b.length][a.length];
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

export const Catalog: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [forceExactSearch, setForceExactSearch] = useState<boolean>(false);
  
  const [searchParams, setSearchParams] = useSearchParams();

  const searchQueryParam = searchParams.get('search') || '';
  const categoryParam = searchParams.get('category') || '';
  const subcategoryParam = searchParams.get('subcategory') || '';
  const brandParam = searchParams.get('brand') || '';

  // Track previous search query to reset forceExactSearch during render (replaces useEffect)
  const [prevSearchQuery, setPrevSearchQuery] = useState(searchQueryParam);
  if (searchQueryParam !== prevSearchQuery) {
    setPrevSearchQuery(searchQueryParam);
    setForceExactSearch(false);
  }

  const { handleAddStandard, handleAddFrameOnly, handleSelectPrescription } = useCart();
  const { formatPrice } = useCurrency();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const res = await apiClient.get<ExtendedApiProduct[]>('/products/');
        setProducts(res.data);
      } catch (error) {
        console.error('Failed to fetch products', error);
        toast.error('Failed to load catalog. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // POOL OF ALL AVAILABLE TARGET TERMS FOR FUZZY MATCHING
  const searchTermsIndex = useMemo(() => {
    const termSet = new Set<string>();

    products.forEach((p) => {
      if (p.brand) termSet.add(p.brand);
      if (p.name) termSet.add(p.name);
      if (p.category) termSet.add(p.category);
    });

    FALLBACK_BRANDS.forEach((b) => termSet.add(b));
    GENERIC_OPTICAL_TYPES.forEach((t) => termSet.add(t));

    return Array.from(termSet);
  }, [products]);

  // CLIENT-SIDE FILTERING WITH AUTOMATIC FUZZY FALLBACK
  const { displayProducts, fuzzyCorrection } = useMemo(() => {
    if (!products.length) return { displayProducts: [], fuzzyCorrection: null };

    const filterByTerm = (searchTerm: string) => {
      const queryClean = normalizeStr(searchTerm);

      return products.filter((p) => {
        // 1. Search Query Match
        if (queryClean !== '') {
          const matchesName = normalizeStr(p.name || '').includes(queryClean);
          const matchesBrand = normalizeStr(p.brand || '').includes(queryClean);
          const matchesModel = normalizeStr(p.model_code || '').includes(queryClean);
          const matchesDesc = normalizeStr(p.description || '').includes(queryClean);
          const matchesColor = normalizeStr(p.color_description || '').includes(queryClean);

          if (!matchesName && !matchesBrand && !matchesModel && !matchesDesc && !matchesColor) {
            return false;
          }
        }

        // 2. Category Match
        if (categoryParam) {
          const catClean = normalizeStr(p.category || '');
          const paramClean = normalizeStr(categoryParam);
          if (catClean !== paramClean) return false;
        }

        // 3. Subcategory Match
        if (subcategoryParam) {
          const rawSub = (p as ExtendedApiProduct).subcategory;
          const subStr = typeof rawSub === 'string' 
            ? rawSub 
            : rawSub?.slug || rawSub?.name || '';
          
          if (normalizeStr(subStr) !== normalizeStr(subcategoryParam)) return false;
        }

        // 4. Brand Match
        if (brandParam) {
          if (normalizeStr(p.brand || '') !== normalizeStr(brandParam)) return false;
        }

        return true;
      });
    };

    // First attempt exact filtering
    const exactMatches = filterByTerm(searchQueryParam);

    if (exactMatches.length > 0 || !searchQueryParam.trim() || forceExactSearch) {
      return { displayProducts: exactMatches, fuzzyCorrection: null };
    }

    // Exact search yielded 0 results: Run Fuzzy Matching
    const cleanQuery = normalizeStr(searchQueryParam);
    const queryTokens = searchQueryParam.toLowerCase().trim().split(/\s+/);
    let bestCandidate: string | null = null;
    let lowestDistance = Infinity;

    for (const term of searchTermsIndex) {
      const cleanTerm = normalizeStr(term);
      const fullDist = getLevenshteinDistance(cleanQuery, cleanTerm);

      const termTokens = term.toLowerCase().split(/[^a-z0-9]+/);
      let minTokenDist = Infinity;

      for (const qToken of queryTokens) {
        const cleanQToken = normalizeStr(qToken);
        if (!cleanQToken) continue;

        for (const tToken of termTokens) {
          const cleanTToken = normalizeStr(tToken);
          if (!cleanTToken) continue;

          const dist = getLevenshteinDistance(cleanQToken, cleanTToken);
          if (dist < minTokenDist) {
            minTokenDist = dist;
          }
        }
      }

      const effectiveDist = Math.min(fullDist, minTokenDist);
      const maxAllowedDist = Math.max(2, Math.floor(cleanQuery.length * 0.45));

      if (effectiveDist <= maxAllowedDist && effectiveDist < lowestDistance) {
        lowestDistance = effectiveDist;
        bestCandidate = term;
      }
    }

    if (bestCandidate) {
      const fuzzyMatches = filterByTerm(bestCandidate);
      if (fuzzyMatches.length > 0) {
        return { displayProducts: fuzzyMatches, fuzzyCorrection: bestCandidate };
      }
    }

    return { displayProducts: [], fuzzyCorrection: null };
  }, [products, searchQueryParam, categoryParam, subcategoryParam, brandParam, forceExactSearch, searchTermsIndex]);

  const productGroups = useMemo(() => {
    return groupProductsByModel(displayProducts);
  }, [displayProducts]);

  const clearFilter = (key: string) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete(key);
    setSearchParams(nextParams);
  };

  const clearAllFilters = () => {
    setSearchParams(new URLSearchParams());
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

  const hasActiveFilters = Boolean(searchQueryParam || categoryParam || subcategoryParam || brandParam);

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      {/* CATALOG TITLE & ACTIVE FILTER BADGES */}
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-walters-navy">
          {searchQueryParam ? `Search Results for "${searchQueryParam}"` : 'Optical Frames Catalog'}
        </h1>
        
        <p className="text-sm text-walters-slate/80 mt-1">
          Select a frame and add your custom prescription, or buy them frame-only.
        </p>

        {/* ACTIVE FILTER TAG STRIP */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 pt-4">
            <span className="text-xs font-bold text-walters-navy uppercase tracking-wider flex items-center gap-1 mr-1">
              <Filter className="w-3.5 h-3.5 text-walters-gold" />
              Active Filters:
            </span>

            {searchQueryParam && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-walters-navy text-white text-xs rounded-full">
                Search: "{searchQueryParam}"
                <button type="button" onClick={() => clearFilter('search')} className="hover:text-walters-gold cursor-pointer">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {categoryParam && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-walters-navy text-white text-xs rounded-full">
                Category: {categoryParam}
                <button type="button" onClick={() => clearFilter('category')} className="hover:text-walters-gold cursor-pointer">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {subcategoryParam && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-walters-navy text-white text-xs rounded-full">
                Subcategory: {subcategoryParam}
                <button type="button" onClick={() => clearFilter('subcategory')} className="hover:text-walters-gold cursor-pointer">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {brandParam && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-walters-navy text-white text-xs rounded-full">
                Brand: {brandParam}
                <button type="button" onClick={() => clearFilter('brand')} className="hover:text-walters-gold cursor-pointer">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            <button
              type="button"
              onClick={clearAllFilters}
              className="text-xs text-rose-600 hover:underline font-bold ml-2 cursor-pointer"
            >
              Reset All
            </button>
          </div>
        )}
      </div>

      {/* FUZZY CORRECTION BANNER */}
      {fuzzyCorrection && (
        <div className="mb-6 p-4 bg-amber-50/80 border border-amber-200/90 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-amber-950 animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5 text-sm">
            <HelpCircle className="w-5 h-5 text-amber-600 shrink-0" />
            <span>
              Showing results for <strong className="font-bold underline text-walters-navy">{fuzzyCorrection}</strong> instead of <em>"{searchQueryParam}"</em>
            </span>
          </div>
          <button
            type="button"
            onClick={() => setForceExactSearch(true)}
            className="text-xs font-semibold text-amber-800 hover:text-amber-950 underline cursor-pointer shrink-0"
          >
            Search for "{searchQueryParam}" anyway
          </button>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="bg-neutral-100 rounded-3xl h-80 animate-pulse border border-neutral-200"></div>
          ))}
        </div>
      ) : productGroups.length === 0 ? (
        <div className="text-center py-20 bg-neutral-50 rounded-3xl border border-dashed border-neutral-200">
          <Search className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
          <h3 className="font-serif text-lg font-bold text-walters-navy">No frames match your search</h3>
          <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
            Try checking for spelling errors, adjusting your filter parameters, or browsing all collections.
          </p>
          <button
            type="button"
            onClick={clearAllFilters}
            className="mt-4 px-6 py-2.5 bg-walters-navy text-white font-bold text-xs uppercase tracking-wider rounded-full hover:bg-walters-gold hover:text-walters-navy transition-colors cursor-pointer"
          >
            Clear Search & Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {productGroups.map((group) => (
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
  );
};