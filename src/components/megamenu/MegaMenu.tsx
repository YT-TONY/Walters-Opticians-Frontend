import React from 'react';
import { Link } from 'react-router-dom';
import { MegaMenuSubcategories, type Category } from './MegaMenuSubCategoryList';
import { ShapesAndTypesGrid } from './ShapesAndTypesGrid';
import { BrandsGrid } from './BrandsGrid';
import { FeaturedBanner } from './FeaturedBanner';

interface MegaMenuProps {
  isOpen: boolean;
  categories: Category[];
  activeCategoryId: number | null;
  onCategoryHover: (id: number) => void;
  onClose: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

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
  const isBrandsTab = currentCategory?.slug === 'brands' || currentCategory?.name?.toLowerCase() === 'brands';

  return (
    <>
      <div 
        onClick={onClose}
        className="fixed inset-0 top-24 bg-black/40 z-30 transition-opacity"
      />

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
            <MegaMenuSubcategories currentCategory={currentCategory} onClose={onClose} />

            {isBrandsTab ? (
              <BrandsGrid onClose={onClose} />
            ) : (
              <ShapesAndTypesGrid onClose={onClose} />
            )}

            <FeaturedBanner categorySlug={currentCategory?.slug} onClose={onClose} />
          </div>

        </div>
      </div>
    </>
  );
};