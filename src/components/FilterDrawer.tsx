// src/components/FilterDrawer.tsx
import React, { useMemo } from 'react';
import { X, RotateCcw, Check } from 'lucide-react';
import type { Product } from '../types/index';

export interface FilterState {
  gender: string[];
  shapes: string[];
  colors: string[];
  frameTypes: string[];
  lensTypes: string[];
  priceRange: [number, number];
  sortBy: string;
}

interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  totalResultsCount: number;
  onClearAll: () => void;
  availableProducts?: Product[];
}

const GENDER_OPTIONS = ['Men', 'Women', 'Unisex'];
const ALL_SHAPES = ['Aviator', 'Wayfarer', 'Cat Eye', 'Round', 'Square', 'Rectangle', 'Oval'];
const FRAME_TYPE_OPTIONS = ['Full Rim', 'Semi-Rimless', 'Rimless'];
const LENS_TYPE_OPTIONS = ['Single Vision', 'Blue Light Glasses', 'Multifocal/Progressive', 'Polarized'];

// Map frame shape to public image assets
const SHAPE_IMAGE_MAP: Record<string, string> = {
  Aviator: '/IMAGES/GLASSES/SHAPES/aviator.png',
  Wayfarer: '/IMAGES/GLASSES/SHAPES/wayfarer.png',
  'Cat Eye': '/IMAGES/GLASSES/SHAPES/cat-eye.png',
  Round: '/IMAGES/GLASSES/SHAPES/round.png',
  Square: '/IMAGES/GLASSES/SHAPES/square.png',
  Rectangle: '/IMAGES/GLASSES/SHAPES/rectangle.png',
  Oval: '/IMAGES/GLASSES/SHAPES/oval.png',
};

// Swatch style dictionary for color name lookups
const COLOR_SWATCH_MAP: Record<string, React.CSSProperties> = {
  black: { backgroundColor: '#18181b' },
  tortoise: { background: 'linear-gradient(135deg, #4a2810 0%, #b45309 50%, #d97706 100%)' },
  havana: { background: 'linear-gradient(135deg, #4a2810 0%, #b45309 50%, #d97706 100%)' },
  gold: { background: 'linear-gradient(135deg, #d97706 0%, #fef08a 50%, #ca8a04 100%)' },
  silver: { backgroundColor: '#94a3b8' },
  grey: { backgroundColor: '#64748b' },
  gray: { backgroundColor: '#64748b' },
  blue: { backgroundColor: '#1e3a8a' },
  navy: { backgroundColor: '#0f172a' },
  clear: { background: 'linear-gradient(135deg, #e2e8f0 0%, #ffffff 100%)' },
  crystal: { background: 'linear-gradient(135deg, #e2e8f0 0%, #ffffff 100%)' },
  transparent: { background: 'linear-gradient(135deg, #e2e8f0 0%, #ffffff 100%)' },
  'rose gold': { background: 'linear-gradient(135deg, #fb7185 0%, #fecdd3 50%, #e11d48 100%)' },
  rose: { backgroundColor: '#f472b6' },
  pink: { backgroundColor: '#f472b6' },
  red: { backgroundColor: '#dc2626' },
  burgundy: { backgroundColor: '#881337' },
  green: { backgroundColor: '#14532d' },
  brown: { backgroundColor: '#78350f' },
  gunmetal: { background: 'linear-gradient(135deg, #334155 0%, #94a3b8 100%)' },
  titanium: { background: 'linear-gradient(135deg, #475569 0%, #cbd5e1 100%)' },
};

const getSwatchStyle = (colorName: string): React.CSSProperties => {
  const normalized = colorName.toLowerCase().trim();
  for (const [key, style] of Object.entries(COLOR_SWATCH_MAP)) {
    if (normalized.includes(key)) return style;
  }
  return { backgroundColor: '#64748b' };
};

export const FilterDrawer: React.FC<FilterDrawerProps> = ({
  isOpen,
  onClose,
  filters,
  setFilters,
  totalResultsCount,
  onClearAll,
  availableProducts = [],
}) => {
  // 1. Dynamically extract colors available under the active product set (ALWAYS CALL HOOKS AT TOP LEVEL)
  const dynamicColors = useMemo(() => {
    if (!availableProducts.length) {
      return ['Black', 'Tortoise', 'Gold', 'Silver', 'Blue', 'Clear', 'Rose Gold'];
    }

    const colorSet = new Set<string>();
    availableProducts.forEach((p) => {
      const rawColor = p.color_description || (p.colors && p.colors.length > 0 ? p.colors.join(', ') : '');
      if (rawColor) {
        const tokens = rawColor.split(/[/,]/);
        tokens.forEach((t: string) => {
          const clean = t.trim();
          if (clean.length > 0 && clean.length < 20) {
            colorSet.add(clean.charAt(0).toUpperCase() + clean.slice(1).toLowerCase());
          }
        });
      }
    });

    return Array.from(colorSet).slice(0, 12);
  }, [availableProducts]);

  // 2. Dynamically extract shapes available under the active product set
  const dynamicShapes = useMemo(() => {
    if (!availableProducts.length) return ALL_SHAPES;

    const presentShapes = new Set<string>();
    availableProducts.forEach((p) => {
      if (p.shape) {
        const matchingShape = ALL_SHAPES.find(
          (s) => s.toLowerCase() === p.shape?.toLowerCase().trim()
        );
        if (matchingShape) presentShapes.add(matchingShape);
      }
    });

    return presentShapes.size > 0 ? Array.from(presentShapes) : ALL_SHAPES;
  }, [availableProducts]);

  // EARLY RETURN PLACED AFTER HOOK DECLARATIONS
  if (!isOpen) return null;

  const toggleArrayFilter = (key: keyof FilterState, value: string) => {
    setFilters((prev) => {
      const current = (prev[key] as string[]) || [];
      const updated = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      return { ...prev, [key]: updated };
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden font-sans">
      {/* Background Blur Overlay */}
      <div
        className="fixed inset-0 bg-walters-navy/40 backdrop-blur-md transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 left-0 max-w-full flex">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between animate-in slide-in-from-left duration-300">
          
          {/* Header */}
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
            <div>
              <h2 className="font-serif text-xl font-bold text-walters-navy">Filter & Sort</h2>
              <p className="text-[11px] font-light text-slate-400">Refine catalog selections</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-walters-navy rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Filter Body */}
          <div className="p-6 space-y-7 overflow-y-auto grow">
            
            {/* Sorting */}
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

            {/* Gender */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <label className="text-xs font-bold uppercase tracking-wider text-walters-navy block font-serif">
                Gender
              </label>
              <div className="flex flex-wrap gap-2">
                {GENDER_OPTIONS.map((g) => {
                  const active = filters.gender.includes(g);
                  return (
                    <button
                      key={g}
                      type="button"
                      onClick={() => toggleArrayFilter('gender', g)}
                      className={`px-4 py-2 rounded-full text-xs font-medium border transition-all cursor-pointer ${
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

            {/* Frame Shape (With Visual Shape Icons) */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-walters-navy block font-serif">
                  Frame Shape
                </label>
                <span className="text-[10px] text-slate-400">{dynamicShapes.length} Shapes Available</span>
              </div>

              <div className="grid grid-cols-3 gap-2.5 text-xs">
                {dynamicShapes.map((shapeName) => {
                  const active = filters.shapes.includes(shapeName);
                  const imageSrc = SHAPE_IMAGE_MAP[shapeName];

                  return (
                    <button
                      key={shapeName}
                      type="button"
                      onClick={() => toggleArrayFilter('shapes', shapeName)}
                      className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all cursor-pointer group ${
                        active
                          ? 'border-walters-navy bg-walters-navy/5 text-walters-navy font-semibold ring-1 ring-walters-navy shadow-2xs'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <div className="w-12 h-6 flex items-center justify-center mb-1.5 overflow-hidden">
                        {imageSrc ? (
                          <img
                            src={imageSrc}
                            alt={shapeName}
                            className={`max-h-full max-w-full object-contain transition-transform group-hover:scale-110 ${
                              active ? 'opacity-100' : 'opacity-70'
                            }`}
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="w-8 h-3 border border-slate-400 rounded-sm" />
                        )}
                      </div>
                      <span className="text-[11px] truncate w-full text-center">{shapeName}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Frame Color (Dynamic Color Swatches) */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-walters-navy block font-serif">
                  Frame Color
                </label>
                <span className="text-[10px] text-slate-400">{dynamicColors.length} Colors</span>
              </div>

              <div className="flex flex-wrap gap-3">
                {dynamicColors.map((colorName) => {
                  const active = filters.colors.includes(colorName);
                  return (
                    <button
                      key={colorName}
                      type="button"
                      onClick={() => toggleArrayFilter('colors', colorName)}
                      title={colorName}
                      className={`relative w-8 h-8 rounded-full border transition-all cursor-pointer flex items-center justify-center ${
                        active
                          ? 'ring-2 ring-walters-navy ring-offset-2 border-white scale-110 shadow-xs'
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

            {/* Frame Type */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <label className="text-xs font-bold uppercase tracking-wider text-walters-navy block font-serif">
                Frame Type
              </label>
              <div className="flex flex-wrap gap-2">
                {FRAME_TYPE_OPTIONS.map((ft) => {
                  const active = filters.frameTypes.includes(ft);
                  return (
                    <button
                      key={ft}
                      type="button"
                      onClick={() => toggleArrayFilter('frameTypes', ft)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                        active
                          ? 'bg-walters-navy text-white border-walters-navy shadow-xs'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {ft}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Lens Type */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <label className="text-xs font-bold uppercase tracking-wider text-walters-navy block font-serif">
                Lens Type
              </label>
              <div className="space-y-2 text-xs">
                {LENS_TYPE_OPTIONS.map((lt) => {
                  const active = filters.lensTypes.includes(lt);
                  return (
                    <button
                      key={lt}
                      type="button"
                      onClick={() => toggleArrayFilter('lensTypes', lt)}
                      className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        active
                          ? 'border-walters-navy bg-walters-navy/5 text-walters-navy font-semibold ring-1 ring-walters-navy'
                          : 'border-slate-200 text-slate-600 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <span>{lt}</span>
                      {active && <Check className="w-4 h-4 text-walters-navy" />}
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Sticky Bottom Actions */}
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
              Show {totalResultsCount} {totalResultsCount === 1 ? 'Product' : 'Products'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};