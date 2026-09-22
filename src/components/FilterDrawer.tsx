// src/components/FilterDrawer.tsx

import React, { useState, useMemo } from 'react';
import { X, RotateCcw, Check, ChevronDown, ChevronUp } from 'lucide-react';
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
const SIZE_ORDER = ['XS', 'S', 'M', 'L', 'XL'];

// Removed export to fix React Fast Refresh "only-export-components" error
const deriveSizeFromWidth = (width?: number): string | null => {
  if (!width) return null;
  if (width >= 42 && width <= 46) return 'XS';
  if (width >= 47 && width <= 49) return 'S';
  if (width >= 50 && width <= 53) return 'M';
  if (width >= 54 && width <= 56) return 'L';
  if (width >= 57) return 'XL';
  return null;
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
}) => {
  const [isCustomWidthOpen, setIsCustomWidthOpen] = useState(true);
  const { formatPrice, convertPrice, symbol } = useCurrency();

  const [localPriceRange, setLocalPriceRange] = useState<[number, number]>(filters.priceRange);
  const [localWidthRange, setLocalWidthRange] = useState<[number, number]>(filters.lensWidthRange);

  const [prevSyncState, setPrevSyncState] = useState({
    isOpen,
    priceRange: filters.priceRange,
    lensWidthRange: filters.lensWidthRange,
  });

  if (
    isOpen !== prevSyncState.isOpen ||
    filters.priceRange !== prevSyncState.priceRange ||
    filters.lensWidthRange !== prevSyncState.lensWidthRange
  ) {
    setPrevSyncState({
      isOpen,
      priceRange: filters.priceRange,
      lensWidthRange: filters.lensWidthRange,
    });
    if (isOpen) {
      setLocalPriceRange(filters.priceRange);
      setLocalWidthRange(filters.lensWidthRange);
    }
  }

  const pageFacets = useMemo(() => {
    if (!products.length) return null;

    const pricesGbp = products.map((p) => p.price_full_gbp || 0).filter((p) => p > 0);
    const min_p = pricesGbp.length ? Math.floor(Math.min(...pricesGbp)) : 0;
    const max_p = pricesGbp.length ? Math.ceil(Math.max(...pricesGbp)) : 500;

    const widths = products.map((p) => p.lens_width).filter((w): w is number => typeof w === 'number' && w > 0);
    const min_w = widths.length ? Math.floor(Math.min(...widths)) : 38;
    const max_w = widths.length ? Math.ceil(Math.max(...widths)) : 69;

    const shapesSet = new Set<string>();
    const colorsSet = new Set<string>();
    const materialsSet = new Set<string>();
    const lensTypesSet = new Set<string>();
    const sizesSet = new Set<string>();
    const gendersSet = new Set<string>();

    products.forEach((p) => {
      if (p.shape) shapesSet.add(p.shape.toLowerCase());
      if (p.color_description) colorsSet.add(p.color_description);
      if (p.colors) p.colors.forEach((c) => colorsSet.add(c));

      if (p.frame_material) materialsSet.add(p.frame_material);

      if (p.lens_material) lensTypesSet.add(p.lens_material);
      const itemWithLensType = p as Product & { lens_type?: string };
      if (itemWithLensType.lens_type) {
        lensTypesSet.add(itemWithLensType.lens_type);
      }

      if (p.sizes) p.sizes.forEach((s) => sizesSet.add(s.toUpperCase()));
      const detectedSize = deriveSizeFromWidth(p.lens_width);
      if (detectedSize) sizesSet.add(detectedSize);

      if (p.gender) gendersSet.add(p.gender.toLowerCase());
    });

    return {
      min_price_gbp: min_p,
      max_price_gbp: max_p,
      min_width: min_w,
      max_width: max_w,
      shapes: Array.from(shapesSet),
      colors: Array.from(colorsSet),
      frameMaterials: materialsSet.size ? Array.from(materialsSet) : DEFAULT_MATERIALS,
      lensTypes: lensTypesSet.size ? Array.from(lensTypesSet) : DEFAULT_LENS_TYPES,
      sizes: Array.from(sizesSet).sort((a, b) => {
        const indexA = SIZE_ORDER.indexOf(a);
        const indexB = SIZE_ORDER.indexOf(b);
        if (indexA === -1 && indexB === -1) return a.localeCompare(b);
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;
        return indexA - indexB;
      }),
      genders: Array.from(gendersSet),
    };
  }, [products]);

  const minPriceBoundGbp = pageFacets?.min_price_gbp ?? facets?.min_price ?? 0;
  const maxPriceBoundGbp = Math.max(pageFacets?.max_price_gbp ?? facets?.max_price ?? 500, minPriceBoundGbp + 1);

  const minWidthBound = pageFacets?.min_width ?? 38;
  const maxWidthBound = Math.max(pageFacets?.max_width ?? 69, minWidthBound + 1);

  const minPriceConverted = Math.floor(convertPrice(minPriceBoundGbp));
  const maxPriceConverted = Math.ceil(convertPrice(maxPriceBoundGbp));

  const availableShapes = pageFacets?.shapes.length ? pageFacets.shapes : facets?.shapes || [];
  const availableColors = pageFacets?.colors.length ? pageFacets.colors : facets?.colors || [];
  const availableMaterials = pageFacets?.frameMaterials.length ? pageFacets.frameMaterials : DEFAULT_MATERIALS;
  const availableLensTypes = pageFacets?.lensTypes.length ? pageFacets.lensTypes : DEFAULT_LENS_TYPES;
  const availableSizes = pageFacets?.sizes.length ? pageFacets.sizes : SIZE_ORDER;
  const availableGenders = pageFacets?.genders.length ? pageFacets.genders : ['male', 'female', 'unisex'];

  const toggleArrayFilter = (key: keyof FilterState, value: string) => {
    setFilters((prev) => {
      const current = (prev[key] as string[]) || [];
      const normalizedValue = value.toLowerCase();
      const exists = current.some((v) => v.toLowerCase() === normalizedValue);
      const updated = exists
        ? current.filter((v) => v.toLowerCase() !== normalizedValue)
        : [...current, value];
      return { ...prev, [key]: updated };
    });
  };

  const handlePriceCommit = () => {
    setFilters((prev) => ({ ...prev, priceRange: localPriceRange }));
  };

  const handleWidthCommit = () => {
    setFilters((prev) => ({ ...prev, lensWidthRange: localWidthRange }));
  };

  return (
    <div
      className={`fixed inset-0 z-50 overflow-hidden font-sans transition-all duration-500 ${
        isOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
      }`}
    >
      <div
        className={`fixed inset-0 bg-slate-900/40 backdrop-blur-md transition-opacity duration-500 ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
      />

      <div className="fixed inset-y-0 left-0 max-w-full flex">
        <div
          className={`w-screen max-w-120 bg-white shadow-2xl flex flex-col justify-between transform transition-transform duration-500 ease-in-out ${
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
                    onClick={() => setFilters((p) => ({ ...p, sortBy: opt.value }))}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      filters.sortBy === opt.value
                        ? 'border-walters-navy bg-walters-navy/5 text-walters-navy font-semibold ring-1 ring-walters-navy shadow-2xs'
                        : 'border-slate-200 text-slate-600 hover:border-slate-300 bg-white'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. DYNAMIC PRICE BOUNDS */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-walters-navy block font-serif">
                  Price Bounds ({symbol})
                </label>
                <span className="text-xs font-medium text-slate-600">
                  {formatPrice(localPriceRange[0])} – {formatPrice(localPriceRange[1])}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400">Min ({symbol})</span>
                  <input
                    type="number"
                    min={minPriceConverted}
                    max={Math.ceil(convertPrice(localPriceRange[1]))}
                    value={Math.floor(convertPrice(localPriceRange[0]))}
                    onChange={(e) => {
                      const convertedVal = Number(e.target.value);
                      const gbpVal = convertedVal / (convertPrice(1) || 1);
                      const nextMin = Math.max(minPriceBoundGbp, gbpVal);
                      setLocalPriceRange([nextMin, localPriceRange[1]]);
                    }}
                    onBlur={handlePriceCommit}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-walters-navy font-medium"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400">Max ({symbol})</span>
                  <input
                    type="number"
                    min={Math.floor(convertPrice(localPriceRange[0]))}
                    max={maxPriceConverted}
                    value={Math.ceil(convertPrice(localPriceRange[1]))}
                    onChange={(e) => {
                      const convertedVal = Number(e.target.value);
                      const gbpVal = convertedVal / (convertPrice(1) || 1);
                      const nextMax = Math.min(maxPriceBoundGbp, gbpVal);
                      setLocalPriceRange([localPriceRange[0], nextMax]);
                    }}
                    onBlur={handlePriceCommit}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-walters-navy font-medium"
                  />
                </div>
              </div>

              {/* Slider Track */}
              <div className="relative pt-2 pb-1 px-1">
                <div className="h-1.5 bg-slate-200 rounded-full relative">
                  <div
                    className="absolute h-full bg-walters-navy rounded-full"
                    style={{
                      left: `${Math.max(0, ((localPriceRange[0] - minPriceBoundGbp) / (maxPriceBoundGbp - minPriceBoundGbp)) * 100)}%`,
                      right: `${Math.max(0, 100 - ((localPriceRange[1] - minPriceBoundGbp) / (maxPriceBoundGbp - minPriceBoundGbp)) * 100)}%`,
                    }}
                  />
                  <div
                    className="absolute w-4 h-4 bg-walters-navy rounded-full -top-1.25 shadow-md border-2 border-white cursor-pointer"
                    style={{
                      left: `${Math.max(0, Math.min(100, ((localPriceRange[0] - minPriceBoundGbp) / (maxPriceBoundGbp - minPriceBoundGbp)) * 100))}%`,
                    }}
                  />
                  <div
                    className="absolute w-4 h-4 bg-walters-navy rounded-full -top-1.25 shadow-md border-2 border-white cursor-pointer"
                    style={{
                      left: `${Math.max(0, Math.min(100, ((localPriceRange[1] - minPriceBoundGbp) / (maxPriceBoundGbp - minPriceBoundGbp)) * 100))}%`,
                    }}
                  />
                </div>
                <input
                  type="range"
                  min={minPriceBoundGbp}
                  max={maxPriceBoundGbp}
                  value={localPriceRange[0]}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setLocalPriceRange([Math.min(val, localPriceRange[1] - 1), localPriceRange[1]]);
                  }}
                  onMouseUp={handlePriceCommit}
                  onTouchEnd={handlePriceCommit}
                  className="absolute inset-0 w-full opacity-0 cursor-pointer h-6"
                />
                <input
                  type="range"
                  min={minPriceBoundGbp}
                  max={maxPriceBoundGbp}
                  value={localPriceRange[1]}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setLocalPriceRange([localPriceRange[0], Math.max(val, localPriceRange[0] + 1)]);
                  }}
                  onMouseUp={handlePriceCommit}
                  onTouchEnd={handlePriceCommit}
                  className="absolute inset-0 w-full opacity-0 cursor-pointer h-6 pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto"
                />
              </div>
            </div>

            {/* 3. SIZE & CUSTOM WIDTH SLIDER */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <label className="text-xs font-bold uppercase tracking-wider text-walters-navy block font-serif">
                Size
              </label>

              <div className="flex flex-wrap gap-2">
                {availableSizes.map((sz) => {
                  const active = filters.sizes.some((s) => s.toLowerCase() === sz.toLowerCase());
                  return (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => toggleArrayFilter('sizes', sz)}
                      className={`min-w-11 h-10 px-3 rounded-lg text-xs font-semibold border transition-all cursor-pointer flex items-center justify-center ${
                        active
                          ? 'border-amber-500 bg-amber-50 text-amber-700 shadow-2xs'
                          : 'border-slate-300 bg-white text-slate-700 hover:border-slate-400'
                      }`}
                    >
                      {sz}
                    </button>
                  );
                })}
              </div>

              {/* Custom Width Slider */}
              <div className="space-y-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCustomWidthOpen(!isCustomWidthOpen)}
                  className="flex items-center space-x-1.5 text-xs font-medium text-slate-700 hover:text-walters-navy cursor-pointer"
                >
                  <span>Custom Width</span>
                  {isCustomWidthOpen ? (
                    <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  )}
                </button>

                {isCustomWidthOpen && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between space-x-3">
                      <div className="flex-1">
                        <input
                          type="text"
                          readOnly
                          value={`${localWidthRange[0]} mm`}
                          className="w-full text-center py-2 border border-slate-300 rounded-md text-xs text-slate-700 bg-white font-medium"
                        />
                      </div>
                      <span className="text-slate-400 text-xs">—</span>
                      <div className="flex-1">
                        <input
                          type="text"
                          readOnly
                          value={`${localWidthRange[1]} mm`}
                          className="w-full text-center py-2 border border-slate-300 rounded-md text-xs text-slate-700 bg-white font-medium"
                        />
                      </div>
                    </div>

                    <div className="relative pt-2 pb-1 px-1">
                      <div className="h-1.5 bg-walters-navy rounded-full relative">
                        <div
                          className="absolute w-4 h-4 bg-walters-navy rounded-full -top-1.25 shadow-md border-2 border-white cursor-pointer"
                          style={{
                            left: `${Math.max(0, Math.min(100, ((localWidthRange[0] - minWidthBound) / (maxWidthBound - minWidthBound)) * 100))}%`,
                          }}
                        />
                        <div
                          className="absolute w-4 h-4 bg-walters-navy rounded-full -top-1.25 shadow-md border-2 border-white cursor-pointer"
                          style={{
                            left: `${Math.max(0, Math.min(100, ((localWidthRange[1] - minWidthBound) / (maxWidthBound - minWidthBound)) * 100))}%`,
                          }}
                        />
                      </div>
                      <input
                        type="range"
                        min={minWidthBound}
                        max={maxWidthBound}
                        value={localWidthRange[0]}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setLocalWidthRange([Math.min(val, localWidthRange[1] - 1), localWidthRange[1]]);
                        }}
                        onMouseUp={handleWidthCommit}
                        onTouchEnd={handleWidthCommit}
                        className="absolute inset-0 w-full opacity-0 cursor-pointer h-6"
                      />
                      <input
                        type="range"
                        min={minWidthBound}
                        max={maxWidthBound}
                        value={localWidthRange[1]}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setLocalWidthRange([localWidthRange[0], Math.max(val, localWidthRange[0] + 1)]);
                        }}
                        onMouseUp={handleWidthCommit}
                        onTouchEnd={handleWidthCommit}
                        className="absolute inset-0 w-full opacity-0 cursor-pointer h-6 pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 4. GENDER */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <label className="text-xs font-bold uppercase tracking-wider text-walters-navy block font-serif">
                Gender
              </label>
              <div className="flex flex-wrap gap-2">
                {availableGenders.map((g) => {
                  const active = filters.gender.some((selectedG) => selectedG.toLowerCase() === g.toLowerCase());
                  return (
                    <button
                      key={g}
                      type="button"
                      onClick={() => toggleArrayFilter('gender', g)}
                      className={`px-4 py-2 rounded-full text-xs font-medium border transition-all cursor-pointer capitalize ${
                        active
                          ? 'bg-walters-navy text-white border-walters-navy shadow-xs'
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
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <label className="text-xs font-bold uppercase tracking-wider text-walters-navy block font-serif">
                Lens Type
              </label>
              <div className="flex flex-wrap gap-2">
                {availableLensTypes.map((lt) => {
                  const active = filters.lensTypes.some((selectedLt) => selectedLt.toLowerCase() === lt.toLowerCase());
                  return (
                    <button
                      key={lt}
                      type="button"
                      onClick={() => toggleArrayFilter('lensTypes', lt)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                        active
                          ? 'bg-walters-navy text-white border-walters-navy shadow-xs'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {lt}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 6. FRAME MATERIAL */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <label className="text-xs font-bold uppercase tracking-wider text-walters-navy block font-serif">
                Frame Material
              </label>
              <div className="flex flex-wrap gap-2">
                {availableMaterials.map((fm) => {
                  const active = filters.frameMaterials.some((selectedFm) => selectedFm.toLowerCase() === fm.toLowerCase());
                  return (
                    <button
                      key={fm}
                      type="button"
                      onClick={() => toggleArrayFilter('frameMaterials', fm)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                        active
                          ? 'bg-walters-navy text-white border-walters-navy shadow-xs'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {fm}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 7. FRAME SHAPE */}
            {availableShapes.length > 0 && (
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <label className="text-xs font-bold uppercase tracking-wider text-walters-navy block font-serif">
                  Frame Shape
                </label>
                <div className="grid grid-cols-3 gap-2.5 text-xs">
                  {availableShapes.map((shapeName) => {
                    const active = filters.shapes.some((s) => s.toLowerCase() === shapeName.toLowerCase());
                    const imageSrc = getShapeImage(shapeName);

                    return (
                      <button
                        key={shapeName}
                        type="button"
                        onClick={() => toggleArrayFilter('shapes', shapeName)}
                        className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all cursor-pointer ${
                          active
                            ? 'border-walters-navy bg-walters-navy/5 text-walters-navy font-semibold ring-1 ring-walters-navy shadow-2xs'
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
                    const active = filters.colors.some((c) => c.toLowerCase() === colorName.toLowerCase());
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
              onClick={onClearAll}
              className="px-4 py-3 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:text-walters-navy hover:border-slate-300 transition-colors flex items-center space-x-1.5 cursor-pointer shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear All</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-walters-navy text-white rounded-xl text-xs font-medium uppercase tracking-wider hover:bg-slate-800 transition-colors cursor-pointer shadow-md text-center"
            >
              Show {totalResultsCount} Results
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};