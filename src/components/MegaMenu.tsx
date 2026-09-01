//src/components/MegaMenu.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { FRAME_IMAGES } from '../constants/frameImages';

import bestSellerFrame from '../assets/best-seller-frame.png';

export interface Subcategory {
  id: number;
  name: string;
  slug: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  subcategories?: Subcategory[];
}

interface MegaMenuProps {
  isOpen: boolean;
  categories: Category[];
  activeCategoryId: number | null;
  onCategoryHover: (id: number) => void;
  onClose: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

const SHAPES = ['Oval', 'Rectangle', 'Browline', 'Square', 'Round', 'Wayfarer', 'CatEye', 'Pilot'];
const TYPES = ['FullRim', 'SemiRim', 'Rimless'];

export const MegaMenu: React.FC<MegaMenuProps> = ({
  isOpen,
  categories,
  activeCategoryId,
  onCategoryHover,
  onClose,
  onMouseEnter,
  onMouseLeave,
}) => {
  if (!isOpen) return null;

  const currentCategory = categories.find((c) => c.id === activeCategoryId) || categories[0];

  return (
    <>
      {/* Backdrop overlay */}
      <div 
        onClick={onClose}
        className="fixed inset-0 top-16 sm:top-20 bg-black/40 z-30 transition-opacity"
      />

      {/* Main Panel */}
      <div
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        className="absolute top-full left-0 w-full bg-walters-cream border-t border-b border-walters-border shadow-xl z-40"
      >
        <div className="max-w-6xl mx-auto px-6 py-6">
          
          {/* Top Category Nav */}
          <div className="flex items-center space-x-8 border-b border-walters-border/40 pb-3 mb-6 text-xs font-semibold uppercase tracking-wider">
            <Link 
              to="/" 
              onClick={onClose} 
              className="py-1 border-b-2 border-transparent hover:border-walters-gold text-walters-charcoal transition-all"
            >
              Home
            </Link>

            {categories.map((cat) => {
              const isActive = currentCategory?.id === cat.id;
              return (
                <button
                  key={cat.id}
                  onMouseEnter={() => onCategoryHover(cat.id)}
                  onClick={() => onCategoryHover(cat.id)}
                  className={`py-1 cursor-pointer border-b-2 transition-all ${
                    isActive 
                      ? 'border-walters-gold text-walters-gold font-bold' 
                      : 'border-transparent text-walters-charcoal hover:border-walters-gold'
                  }`}
                >
                  {cat.name}
                </button>
              );
            })}

            <Link 
              to="/catalog" 
              onClick={onClose} 
              className="py-1 border-b-2 border-transparent hover:border-walters-gold text-walters-charcoal transition-all"
            >
              Catalog
            </Link>

            <button 
              onClick={onClose} 
              className="ml-auto text-xs text-walters-slate hover:text-walters-navy cursor-pointer"
            >
              Close ✕
            </button>
          </div>

          {/* 3-Column Content Layout */}
          <div className="grid grid-cols-12 gap-6 items-stretch">
            
            {/* Column 1: Subcategory Links */}
            <div className="col-span-3 border-r border-walters-border/30 pr-4">
              <ul className="space-y-2">
                {currentCategory?.subcategories && currentCategory.subcategories.length > 0 ? (
                  currentCategory.subcategories.map((sub) => (
                    <li key={sub.id}>
                      <Link
                        to={`/catalog?subcategory=${sub.slug}`}
                        onClick={onClose}
                        className={`text-xs font-medium block py-0.5 transition-all hover:text-amber-700 w-max ${
                          sub.name.toLowerCase() === 'sale' ? 'text-red-600 font-bold' : 'text-walters-charcoal'
                        }`}
                      >
                        {sub.name}
                      </Link>
                    </li>
                  ))
                ) : (
                  [
                    "Women's Glasses", "Men's Glasses", "Kids' Glasses", "New Arrivals", 
                    "Best Sellers", "Blue Light Blocking Glasses", "Our Favorites", 
                    "Ray-Ban Meta", "Oakley Meta", "Sale"
                  ].map((name) => (
                    <li key={name}>
                      <Link
                        to={`/catalog?search=${encodeURIComponent(name)}`}
                        onClick={onClose}
                        className={`text-xs font-medium block py-0.5 transition-all hover:text-amber-700 w-max ${
                          name === 'Sale' ? 'text-red-600 font-bold' : 'text-walters-charcoal'
                        }`}
                      >
                        {name}
                      </Link>
                    </li>
                  ))
                )}
              </ul>
            </div>

            {/* Column 2: Shapes & Frame Types Grid (Enlarged Images) */}
            <div className="col-span-5 space-y-6">
              
              {/* Popular Shapes (4x2 Grid) */}
              <div>
                <h4 className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-3">
                  Popular Shapes
                </h4>
                <div className="grid grid-cols-4 gap-2">
                  {SHAPES.map((shape) => (
                    <Link
                      key={shape}
                      to={`/catalog?shape=${shape.toLowerCase()}`}
                      onClick={onClose}
                      className="flex flex-col items-center justify-center p-2 rounded-lg hover:bg-black/5 transition-all group"
                    >
                      {/* Increased width and height container */}
                      <div className="w-20 h-10 flex items-center justify-center">
                        <img 
                          src={FRAME_IMAGES[shape]} 
                          alt={shape}
                          className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform duration-200" 
                        />
                      </div>
                      <span className="text-[11px] text-walters-slate mt-1 group-hover:text-black font-medium text-center">
                        {shape.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Popular Frame Types (3-Column Grid) */}
              <div>
                <h4 className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-3">
                  Popular Frame Types
                </h4>
                <div className="grid grid-cols-3 gap-2">
                  {TYPES.map((type) => (
                    <Link
                      key={type}
                      to={`/catalog?type=${type.toLowerCase()}`}
                      onClick={onClose}
                      className="flex flex-col items-center justify-center p-2 rounded-lg hover:bg-black/5 transition-all group"
                    >
                      {/* Increased width and height container */}
                      <div className="w-20 h-10 flex items-center justify-center">
                        <img 
                          src={FRAME_IMAGES[type]} 
                          alt={type}
                          className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform duration-200" 
                        />
                      </div>
                      <span className="text-[11px] text-walters-slate mt-1 group-hover:text-black font-medium text-center">
                        {type.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>

            </div>

            {/* Column 3: Featured Collection Banner */}
            <div className="col-span-4 bg-white/80 p-4 rounded-xl border border-walters-border/30 flex flex-col justify-between shadow-sm group h-full">
              <div className="relative w-full aspect-4/3 rounded-lg overflow-hidden bg-[#F2EFE9] mb-3 border border-walters-border/20">
                <span className="absolute top-2.5 left-2.5 z-10 bg-amber-900/80 backdrop-blur-md text-amber-100 text-[9px] font-bold px-2 py-0.5 rounded tracking-wider uppercase">
                  Signature Line
                </span>
                <img 
                  src={bestSellerFrame} 
                  alt="Best Seller Eyeglasses" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                />
              </div>

              <div className="flex flex-col justify-between flex-1 pt-1">
                <div>
                  <h4 className="font-bold text-walters-navy text-sm">The Artisan Series</h4>
                  <p className="text-[11px] text-walters-slate mt-1 mb-2 leading-relaxed">
                    Hand-crafted Italian acetate with premium anti-reflective lenses included.
                  </p>
                </div>
                <Link 
                  to="/catalog?collection=artisan"
                  onClick={onClose}
                  className="inline-flex items-center text-xs font-semibold text-amber-800 hover:text-amber-950 transition-colors pt-1"
                >
                  Shop Collection &rarr;
                </Link>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default MegaMenu;