// src/components/FilterDrawer.tsx

import React, { useState, useEffect } from 'react';
import { X, RotateCcw, Check, Loader2 } from 'lucide-react';
import { useCurrency } from '../hooks/useCurrency';
import type { Product } from '../types/index';

export interface FilterState {
  gender: string[];
  shapes: string[];
  colors: string[];
  frameTypes: string[];
  lensTypes: string[];
  frameMaterials: string[];
  sizes: string[];
  priceRange: [number, number];
  lensWidthRange: [number, number];
  sortBy: string;
}

export interface FacetsData {
  min_price?: number;
  max_price?: number;
  brands?: string[];
  shapes?: string[];
  colors?: string[];
  genders?: string[];
  frameMaterials?: string[];
  lensTypes?: string[];
  sizes?: string[];
  available_brands?: string[];
  available_shapes?: string[];
  available_colors?: string[];
  available_genders?: string[];
  available_materials?: string[];
  available_sizes?: string[];
}

interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  totalResultsCount: number;
  onClearAll: () => void;
  facets?: FacetsData;
  products?: Product[];
  activeBrand?: string;
  activeCategory?: string;
  searchQuery?: string;
}

const SHAPE_IMAGE_MAP: Record<string, string> = {
  aviator: '/IMAGES/GLASSES/SHAPE/AVIATOR.png',
  wayfarer: '/IMAGES/GLASSES/SHAPE/WAYFAYER.png',
  cateye: '/IMAGES/GLASSES/SHAPE/CATEYE.png',
  round: '/IMAGES/GLASSES/SHAPE/ROUND.png',
  square: '/IMAGES/GLASSES/SHAPE/SQUARE.png',
  rectangle: '/IMAGES/GLASSES/SHAPE/RECTANGLE.png',
  oval: '/IMAGES/GLASSES/SHAPE/OVAL.png',
};

const getShapeImage = (shapeName: string): string | undefined => {
  const normalized = shapeName.toLowerCase().replace(/[^a-z]/g, '');
  return SHAPE_IMAGE_MAP[normalized];
};

const COLOR_SWATCH_MAP: Record<string, React.CSSProperties> = {
  black: { backgroundColor: '#18181b' },
  tortoise: { background: 'linear-gradient(135deg, #4a2810 0%, #b45309 50%, #d97706 100%)' },
  gold: { background: 'linear-gradient(135deg, #d97706 0%, #fef08a 50%, #ca8a04 100%)' },
  silver: { backgroundColor: '#94a3b8' },
  grey: { backgroundColor: '#64748b' },
  gray: { backgroundColor: '#64748b' },
  blue: { backgroundColor: '#1e3a8a' },
  clear: { background: 'linear-gradient(135deg, #e2e8f0 0%, #ffffff 100%)' },
  transparent: { background: 'linear-gradient(135deg, #e2e8f0 0%, #ffffff 100%)' },
  'rose gold': { background: 'linear-gradient(135deg, #fb7185 0%, #fecdd3 50%, #e11d48 100%)' },
  brown: { backgroundColor: '#78350f' },
  green: { backgroundColor: '#14532d' },
  red: { backgroundColor: '#991b1b' },
  pink: { backgroundColor: '#f472b6' },
};

const getSwatchStyle = (colorName: string): React.CSSProperties => {
  const normalized = colorName.toLowerCase().trim();
  for (const [key, style] of Object.entries(COLOR_SWATCH_MAP)) {
    if (normalized.includes(key)) return style;
  }
  return { backgroundColor: '#64748b' };
};

const DEFAULT_MATERIALS = ['Italian Acetate', 'Titanium', 'Monel Metal', 'TR90 Memory Plastic', 'Bio-Acetate'];
const DEFAULT_LENS_TYPES = ['Polycarbonate', 'CR-39 Lens', 'Demo Lens', 'Polarized', 'Blue Light Filter'];
const DEFAULT_SHAPES = ['aviator', 'wayfarer', 'cateye', 'round', 'square', 'rectangle', 'oval'];
const DEFAULT_COLORS = ['Black', 'Tortoise', 'Gold', 'Silver', 'Grey', 'Blue', 'Clear', 'Rose Gold'];
const SIZE_ORDER = ['XS', 'S', 'M', 'L', 'XL'];

const getProductPrice = (p: Product): number => {
  const item = p as unknown as { price_gbp?: number; price?: number };
  return item.price_gbp ?? item.price ?? 0;
};

const countActiveFilters = (f: FilterState, minBound: number, maxBound: number): number => {
  const isMinActive = f.priceRange[0] > minBound + 0.5;
  const isMaxActive = f.priceRange[1] < maxBound - 0.5 && f.priceRange[1] < 2000;
  const isPriceActive = isMinActive || isMaxActive;

  return (
    f.gender.length +
    f.shapes.length +
    f.colors.length +
    f.frameTypes.length +
    f.lensTypes.length +
    f.frameMaterials.length +
    f.sizes.length +
    (isPriceActive ? 1 : 0)
  );
};

const calculateLocalCount = (
  productList: Product[],
  f: FilterState,
  minBound: number,
  maxBound: number
): number => {
  return productList.filter((p) => {
    const item = p as unknown as {
      shape?: string;
      color_description?: string;
      color?: string;
      frame_material?: string;
      gender?: string;
      size?: string;
      lens_type?: string;
    };

    const shape = (item.shape || '').toLowerCase();
    const color = (item.color_description || item.color || '').toLowerCase();
    const material = (item.frame_material || '').toLowerCase();
    const gender = (item.gender || '').toLowerCase();
    const size = (item.size || '').toLowerCase();
    const lensType = (item.lens_type || '').toLowerCase();
    const price = getProductPrice(p);

    if (f.shapes.length > 0 && !f.shapes.some((s) => shape.includes(s.toLowerCase()))) return false;
    if (f.colors.length > 0 && !f.colors.some((c) => color.includes(c.toLowerCase()))) return false;
    if (f.gender.length > 0 && !f.gender.some((g) => gender.includes(g.toLowerCase()))) return false;
    if (f.frameMaterials.length > 0 && !f.frameMaterials.some((m) => material.includes(m.toLowerCase()))) return false;
    if (f.lensTypes.length > 0 && !f.lensTypes.some((l) => lensType.includes(l.toLowerCase()))) return false;
    if (f.sizes.length > 0 && !f.sizes.some((sz) => size.includes(sz.toLowerCase()))) return false;

    if (f.priceRange[0] > minBound + 0.5 && price < f.priceRange[0]) return false;
    if (f.priceRange[1] < maxBound - 0.5 && f.priceRange[1] < 2000 && price > f.priceRange[1]) return false;

    return true;
  }).length;
};

export const FilterDrawer: React.FC<FilterDrawerProps> = ({
  isOpen,
  onClose,
  filters,
  setFilters,
  totalResultsCount,
  onClearAll,
  facets,
  products = [],
  activeBrand,
  activeCategory,
  searchQuery,
}) => {
  const { convertPrice, symbol } = useCurrency();

  const minPriceBoundGbp =
    facets?.min_price ??
    (products.length > 0 ? Math.min(...products.map(getProductPrice)) : 0);

  const maxPriceBoundGbp = Math.max(
    facets?.max_price ??
      (products.length > 0 ? Math.max(...products.map(getProductPrice)) : 500),
    minPriceBoundGbp + 1
  );

  const minPriceConverted = Math.floor(convertPrice(minPriceBoundGbp));
  const maxPriceConverted = Math.ceil(convertPrice(maxPriceBoundGbp));

  // STAGED LOCAL FILTERS & COUNT STATE
  const [localFilters, setLocalFilters] = useState<FilterState>(filters);
  const [stagedCount, setStagedCount] = useState<number>(0);
  const [isCounting, setIsCounting] = useState<boolean>(false);

  const [displayMinInput, setDisplayMinInput] = useState<number>(
    localFilters.priceRange[0] > minPriceBoundGbp + 0.1
      ? Math.floor(convertPrice(localFilters.priceRange[0]))
      : minPriceConverted
  );
  const [displayMaxInput, setDisplayMaxInput] = useState<number>(
    localFilters.priceRange[1] < maxPriceBoundGbp - 0.1 && localFilters.priceRange[1] < 2000
      ? Math.ceil(convertPrice(localFilters.priceRange[1]))
      : maxPriceConverted
  );

  const [prevSync, setPrevSync] = useState({
    isOpen,
    minGbp: filters.priceRange[0],
    maxGbp: filters.priceRange[1],
    minBound: minPriceBoundGbp,
    maxBound: maxPriceBoundGbp,
  });

  if (
    prevSync.isOpen !== isOpen ||
    prevSync.minGbp !== filters.priceRange[0] ||
    prevSync.maxGbp !== filters.priceRange[1] ||
    prevSync.minBound !== minPriceBoundGbp ||
    prevSync.maxBound !== maxPriceBoundGbp
  ) {
    setPrevSync({
      isOpen,
      minGbp: filters.priceRange[0],
      maxGbp: filters.priceRange[1],
      minBound: minPriceBoundGbp,
      maxBound: maxPriceBoundGbp,
    });
    if (isOpen) {
      setLocalFilters(filters);
      setStagedCount(0);

      if (countActiveFilters(filters, minPriceBoundGbp, maxPriceBoundGbp) > 0) {
        setIsCounting(true);
      }

      const currentMinGbp = filters.priceRange[0] > minPriceBoundGbp ? filters.priceRange[0] : minPriceBoundGbp;
      const currentMaxGbp =
        filters.priceRange[1] < maxPriceBoundGbp && filters.priceRange[1] < 2000
          ? filters.priceRange[1]
          : maxPriceBoundGbp;

      setDisplayMinInput(Math.floor(convertPrice(currentMinGbp)));
      setDisplayMaxInput(Math.ceil(convertPrice(currentMaxGbp)));
    }
  }

  const availableShapes =
    facets?.shapes?.length ? facets.shapes : facets?.available_shapes?.length ? facets.available_shapes : DEFAULT_SHAPES;
  const availableColors =
    facets?.colors?.length ? facets.colors : facets?.available_colors?.length ? facets.available_colors : DEFAULT_COLORS;
  const availableMaterials =
    facets?.frameMaterials?.length ? facets.frameMaterials : facets?.available_materials?.length ? facets.available_materials : DEFAULT_MATERIALS;
  const availableLensTypes =
    facets?.lensTypes?.length ? facets.lensTypes : DEFAULT_LENS_TYPES;
  const availableSizes =
    facets?.sizes?.length ? facets.sizes : facets?.available_sizes?.length ? facets.available_sizes : SIZE_ORDER;
  const availableGenders =
    facets?.genders?.length ? facets.genders : facets?.available_genders?.length ? facets.available_genders : ['male', 'female', 'unisex'];

  // COUNT ACTIVE SELECTED FILTERS
  const activeFilterCount = countActiveFilters(localFilters, minPriceBoundGbp, maxPriceBoundGbp);

  // FETCH ACCURATE DATABASE COUNT (NO SYNCHRONOUS SETSTATE IN EFFECT BODY)
  useEffect(() => {
    if (!isOpen || activeFilterCount === 0) {
      return;
    }

    const controller = new AbortController();

    const queryParams = new URLSearchParams();
    if (activeBrand) queryParams.append('brand', activeBrand);
    if (activeCategory) queryParams.append('category', activeCategory);
    if (searchQuery) queryParams.append('q', searchQuery);

    localFilters.shapes.forEach((s) => queryParams.append('shape', s));
    localFilters.colors.forEach((c) => queryParams.append('color', c));
    localFilters.gender.forEach((g) => queryParams.append('gender', g));
    localFilters.frameMaterials.forEach((m) => queryParams.append('frame_material', m));
    localFilters.lensTypes.forEach((l) => queryParams.append('lens_type', l));
    localFilters.sizes.forEach((sz) => queryParams.append('size', sz));

    const isMinActive = localFilters.priceRange[0] > minPriceBoundGbp + 0.5;
    const isMaxActive = localFilters.priceRange[1] < maxPriceBoundGbp - 0.5 && localFilters.priceRange[1] < 2000;

    if (isMinActive) queryParams.append('min_price', localFilters.priceRange[0].toString());
    if (isMaxActive) queryParams.append('max_price', localFilters.priceRange[1].toString());

    fetch(`/api/v1/products/count?${queryParams.toString()}`, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error('API returned non-200');
        return res.json();
      })
      .then((data) => {
        if (data && typeof data.count === 'number') {
          setStagedCount(data.count);
        } else if (products.length > 0) {
          setStagedCount(calculateLocalCount(products, localFilters, minPriceBoundGbp, maxPriceBoundGbp));
        }
        setIsCounting(false);
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
          if (products.length > 0) {
            setStagedCount(calculateLocalCount(products, localFilters, minPriceBoundGbp, maxPriceBoundGbp));
          } else {
            setStagedCount(0);
          }
          setIsCounting(false);
        }
      });

    return () => controller.abort();
  }, [isOpen, localFilters, activeFilterCount, activeBrand, activeCategory, searchQuery, minPriceBoundGbp, maxPriceBoundGbp, products]);

  const toggleArrayFilter = (key: keyof FilterState, value: string) => {
    const current = (localFilters[key] as string[]) || [];
    const normalizedValue = value.toLowerCase();
    const exists = current.some((v) => v.toLowerCase() === normalizedValue);
    const updated = exists
      ? current.filter((v) => v.toLowerCase() !== normalizedValue)
      : [...current, value];

    const nextFilters: FilterState = { ...localFilters, [key]: updated };
    const nextActiveCount = countActiveFilters(nextFilters, minPriceBoundGbp, maxPriceBoundGbp);

    setLocalFilters(nextFilters);
    if (nextActiveCount === 0) {
      setIsCounting(false);
      setStagedCount(0);
    } else {
      setIsCounting(true);
    }
  };

  const handleDisplayMinChange = (val: number) => {
    const clampedVal = Math.min(val, displayMaxInput);
    setDisplayMinInput(clampedVal);
    const rate = convertPrice(1) || 1;
    const gbpMin = clampedVal / rate;

    const nextFilters: FilterState = {
      ...localFilters,
      priceRange: [gbpMin, localFilters.priceRange[1]],
    };
    const nextActiveCount = countActiveFilters(nextFilters, minPriceBoundGbp, maxPriceBoundGbp);

    setLocalFilters(nextFilters);
    if (nextActiveCount === 0) {
      setIsCounting(false);
      setStagedCount(0);
    } else {
      setIsCounting(true);
    }
  };

  const handleDisplayMaxChange = (val: number) => {
    const clampedVal = Math.max(val, displayMinInput);
    setDisplayMaxInput(clampedVal);
    const rate = convertPrice(1) || 1;
    const gbpMax = clampedVal / rate;

    const nextFilters: FilterState = {
      ...localFilters,
      priceRange: [localFilters.priceRange[0], gbpMax],
    };
    const nextActiveCount = countActiveFilters(nextFilters, minPriceBoundGbp, maxPriceBoundGbp);

    setLocalFilters(nextFilters);
    if (nextActiveCount === 0) {
      setIsCounting(false);
      setStagedCount(0);
    } else {
      setIsCounting(true);
    }
  };

  const handleApply = () => {
    setFilters(localFilters);
    onClose();
  };

  const handleLocalClearAll = () => {
    onClearAll();
    setIsCounting(false);
    setStagedCount(0);
    setLocalFilters({
      gender: [],
      shapes: [],
      colors: [],
      frameTypes: [],
      lensTypes: [],
      frameMaterials: [],
      sizes: [],
      priceRange: [minPriceBoundGbp, maxPriceBoundGbp],
      lensWidthRange: [38, 69],
      sortBy: 'popularity',
    });
    setDisplayMinInput(minPriceConverted);
    setDisplayMaxInput(maxPriceConverted);
  };

  return (
    <div
      className={`fixed inset-0 z-50 overflow-hidden font-sans transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        isOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
      }`}
    >
      <div
        className={`fixed inset-0 bg-slate-900/40 backdrop-blur-md transition-opacity duration-700 ease-out ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
      />

      <div className="fixed inset-y-0 left-0 max-w-full flex">
        <div
          className={`w-screen max-w-120 bg-white shadow-2xl flex flex-col justify-between transform transition-transform duration-700 ${
            isOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
          style={{ transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
        >
          {/* Header */}
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
            <div>
              <h2 className="font-serif text-xl font-bold text-walters-navy">Filter & Sort</h2>
              <p className="text-[11px] font-light text-slate-400">Refine catalog selections</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-walters-navy rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Filter Body */}
          <div className="p-6 space-y-7 overflow-y-auto grow">

            {/* 1. SORT BY */}
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-walters-navy block font-serif">
                Sort By
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { label: 'Popularity', value: 'popularity' },
                  { label: 'Price: Low to High', value: 'price_asc' },
                  { label: 'Price: High to Low', value: 'price_desc' },
                  { label: 'Newest Arrivals', value: 'newest' },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      setLocalFilters((p) => ({ ...p, sortBy: opt.value }));
                    }}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      localFilters.sortBy === opt.value
                        ? 'border-walters-navy bg-walters-navy/5 text-walters-navy font-semibold ring-1 ring-walters-navy shadow-2xs'
                        : 'border-slate-200 text-slate-600 hover:border-slate-300 bg-white'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. PRICE BOUNDS */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-walters-navy block font-serif">
                  Price Bounds ({symbol})
                </label>
                <span className="text-xs font-medium text-slate-600">
                  {symbol}{displayMinInput.toLocaleString()} – {symbol}{displayMaxInput.toLocaleString()}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400">Min ({symbol})</span>
                  <input
                    type="number"
                    min={minPriceConverted}
                    max={displayMaxInput}
                    value={displayMinInput}
                    onChange={(e) => handleDisplayMinChange(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-walters-navy font-medium"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400">Max ({symbol})</span>
                  <input
                    type="number"
                    min={displayMinInput}
                    max={maxPriceConverted}
                    value={displayMaxInput}
                    onChange={(e) => handleDisplayMaxChange(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-walters-navy font-medium"
                  />
                </div>
              </div>

              {/* Dual Range Slider Track */}
              <div className="relative pt-2 pb-1 px-1">
                <div className="h-1.5 bg-slate-200 rounded-full relative">
                  <div
                    className="absolute h-full bg-walters-navy rounded-full"
                    style={{
                      left: `${Math.max(0, Math.min(100, ((displayMinInput - minPriceConverted) / (maxPriceConverted - minPriceConverted || 1)) * 100))}%`,
                      right: `${Math.max(0, Math.min(100, 100 - ((displayMaxInput - minPriceConverted) / (maxPriceConverted - minPriceConverted || 1)) * 100))}%`,
                    }}
                  />
                  <div
                    className="absolute w-4 h-4 bg-walters-navy rounded-full -top-1.25 shadow-md border-2 border-white pointer-events-none"
                    style={{
                      left: `${Math.max(0, Math.min(100, ((displayMinInput - minPriceConverted) / (maxPriceConverted - minPriceConverted || 1)) * 100))}%`,
                    }}
                  />
                  <div
                    className="absolute w-4 h-4 bg-walters-navy rounded-full -top-1.25 shadow-md border-2 border-white pointer-events-none"
                    style={{
                      left: `${Math.max(0, Math.min(100, ((displayMaxInput - minPriceConverted) / (maxPriceConverted - minPriceConverted || 1)) * 100))}%`,
                    }}
                  />
                </div>

                {/* Min Price Slider Input */}
                <input
                  type="range"
                  min={minPriceConverted}
                  max={maxPriceConverted}
                  value={displayMinInput}
                  onChange={(e) => handleDisplayMinChange(Number(e.target.value))}
                  className="absolute inset-0 w-full opacity-0 cursor-pointer h-6 pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-moz-range-thumb]:pointer-events-auto z-30"
                />

                {/* Max Price Slider Input */}
                <input
                  type="range"
                  min={minPriceConverted}
                  max={maxPriceConverted}
                  value={displayMaxInput}
                  onChange={(e) => handleDisplayMaxChange(Number(e.target.value))}
                  className="absolute inset-0 w-full opacity-0 cursor-pointer h-6 pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-moz-range-thumb]:pointer-events-auto z-20"
                />
              </div>
            </div>

            {/* 3. SIZE */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <label className="text-xs font-bold uppercase tracking-wider text-walters-navy block font-serif">
                Size
              </label>
              <div className="flex flex-wrap gap-2">
                {availableSizes.map((sz) => {
                  const active = localFilters.sizes.some((s) => s.toLowerCase() === sz.toLowerCase());
                  return (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => toggleArrayFilter('sizes', sz)}
                      className={`min-w-11 h-10 px-3 rounded-lg text-xs font-semibold border transition-all cursor-pointer flex items-center justify-center ${
                        active
                          ? 'border-walters-navy bg-walters-navy text-white shadow-2xs scale-105'
                          : 'border-slate-300 bg-white text-slate-700 hover:border-slate-400'
                      }`}
                    >
                      {sz}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. GENDER */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <label className="text-xs font-bold uppercase tracking-wider text-walters-navy block font-serif">
                Gender
              </label>
              <div className="flex flex-wrap gap-2">
                {availableGenders.map((g) => {
                  const active = localFilters.gender.some((selectedG) => selectedG.toLowerCase() === g.toLowerCase());
                  return (
                    <button
                      key={g}
                      type="button"
                      onClick={() => toggleArrayFilter('gender', g)}
                      className={`px-4 py-2 rounded-full text-xs font-medium border transition-all cursor-pointer capitalize ${
                        active
                          ? 'bg-walters-navy text-white border-walters-navy shadow-xs scale-105'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {g}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 5. LENS TYPE */}
            {availableLensTypes.length > 0 && (
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <label className="text-xs font-bold uppercase tracking-wider text-walters-navy block font-serif">
                  Lens Type
                </label>
                <div className="flex flex-wrap gap-2">
                  {availableLensTypes.map((lt) => {
                    const active = localFilters.lensTypes.some((selectedLt) => selectedLt.toLowerCase() === lt.toLowerCase());
                    return (
                      <button
                        key={lt}
                        type="button"
                        onClick={() => toggleArrayFilter('lensTypes', lt)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                          active
                            ? 'bg-walters-navy text-white border-walters-navy shadow-xs scale-105'
                            : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        {lt}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 6. FRAME MATERIAL */}
            {availableMaterials.length > 0 && (
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <label className="text-xs font-bold uppercase tracking-wider text-walters-navy block font-serif">
                  Frame Material
                </label>
                <div className="flex flex-wrap gap-2">
                  {availableMaterials.map((fm) => {
                    const active = localFilters.frameMaterials.some((selectedFm) => selectedFm.toLowerCase() === fm.toLowerCase());
                    return (
                      <button
                        key={fm}
                        type="button"
                        onClick={() => toggleArrayFilter('frameMaterials', fm)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                          active
                            ? 'bg-walters-navy text-white border-walters-navy shadow-xs scale-105'
                            : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        {fm}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 7. FRAME SHAPE */}
            {availableShapes.length > 0 && (
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <label className="text-xs font-bold uppercase tracking-wider text-walters-navy block font-serif">
                  Frame Shape
                </label>
                <div className="grid grid-cols-3 gap-2.5 text-xs">
                  {availableShapes.map((shapeName) => {
                    const active = localFilters.shapes.some((s) => s.toLowerCase() === shapeName.toLowerCase());
                    const imageSrc = getShapeImage(shapeName);

                    return (
                      <button
                        key={shapeName}
                        type="button"
                        onClick={() => toggleArrayFilter('shapes', shapeName)}
                        className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all cursor-pointer ${
                          active
                            ? 'border-walters-navy bg-walters-navy/5 text-walters-navy font-semibold ring-1 ring-walters-navy shadow-2xs scale-[1.02]'
                            : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        <div className="w-10 h-5 flex items-center justify-center mb-1 overflow-hidden">
                          {imageSrc ? (
                            <img src={imageSrc} alt={shapeName} className="max-h-full max-w-full object-contain" />
                          ) : (
                            <div className="w-6 h-2 border border-slate-400 rounded-xs" />
                          )}
                        </div>
                        <span className="text-[10px] truncate capitalize">{shapeName}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 8. FRAME COLOR */}
            {availableColors.length > 0 && (
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <label className="text-xs font-bold uppercase tracking-wider text-walters-navy block font-serif">
                  Frame Color
                </label>
                <div className="flex flex-wrap gap-3">
                  {availableColors.map((colorName) => {
                    const active = localFilters.colors.some((c) => c.toLowerCase() === colorName.toLowerCase());
                    return (
                      <button
                        key={colorName}
                        type="button"
                        onClick={() => toggleArrayFilter('colors', colorName)}
                        title={colorName}
                        className={`relative w-8 h-8 rounded-full border transition-all cursor-pointer flex items-center justify-center ${
                          active
                            ? 'ring-2 ring-walters-navy ring-offset-2 border-white scale-110'
                            : 'border-slate-200 hover:scale-105'
                        }`}
                        style={getSwatchStyle(colorName)}
                      >
                        {active && <Check className="w-3.5 h-3.5 text-white drop-shadow-md" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

          </div>

          {/* Sticky Actions */}
          <div className="p-4 border-t border-slate-100 bg-white flex items-center space-x-3 sticky bottom-0 z-10 shadow-lg">
            <button
              type="button"
              onClick={handleLocalClearAll}
              className="px-4 py-3 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:text-walters-navy hover:border-slate-300 transition-colors flex items-center space-x-1.5 cursor-pointer shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear All</span>
            </button>

            <button
              type="button"
              onClick={handleApply}
              disabled={isCounting}
              className="flex-1 py-3 bg-walters-navy text-white rounded-xl text-xs font-medium uppercase tracking-wider hover:bg-slate-800 transition-colors cursor-pointer shadow-md flex items-center justify-center space-x-2 text-center"
            >
              {isCounting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Calculating...</span>
                </>
              ) : activeFilterCount === 0 ? (
                <span>SEE ALL RESULTS ({totalResultsCount})</span>
              ) : (
                <span>
                  APPLY {activeFilterCount} FILTER{activeFilterCount > 1 ? 'S' : ''} ({stagedCount} RESULT{stagedCount === 1 ? '' : 'S'})
                </span>
              )}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};