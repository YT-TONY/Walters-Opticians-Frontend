// src/components/megamenu/MegaMenu.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import type { Category } from '../../context/Category';
import { MegaMenuTabNav } from './MegaMenuTabNav';
import { MegaMenuSubCategoryList } from './MegaMenuSubCategoryList';
import { ShapesAndTypesGrid } from './ShapesAndTypesGrid';
import { BrandsGrid } from './BrandsGrid';
import { FeatureBanner } from './FeaturedBanner';
import { BrandsVirtualCategory } from './constants';

interface MegaMenuProps {
  isOpen: boolean;
  activeCategoryId: number | null;
  categories: Category[];
  onCategoryHover: (id: number) => void;
  onClose: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export const MegaMenu: React.FC<MegaMenuProps> = ({
  isOpen,
  activeCategoryId,
  categories,
  onCategoryHover,
  onClose,
  onMouseEnter,
  onMouseLeave,
}) => {
  if (!isOpen) return null;

  const activeCategory =
    activeCategoryId === BrandsVirtualCategory.id
      ? BrandsVirtualCategory
      : categories.find((cat) => cat.id === activeCategoryId) || categories[0] || null;

  const isBrandsTab = activeCategory?.id === BrandsVirtualCategory.id || activeCategory?.slug === 'brands';
  const isSunglasses = activeCategory?.slug.toLowerCase().includes('sunglass');

  return (
    <div
      className="absolute top-full left-0 w-full bg-white shadow-2xl z-50 border-b border-walters-border/20 animate-in fade-in duration-150"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <MegaMenuTabNav
        categories={categories}
        activeCategoryId={activeCategory?.id || null}
        onSelectCategory={onCategoryHover}
        onClose={onClose}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {isBrandsTab ? (
          <div className="flex items-start justify-center gap-10">
            <BrandsGrid variant="mega-view" onClose={onClose} />

            <div className="w-64 shrink-0 space-y-4">
              <Link
                to="/catalog?tag=luxury"
                onClick={onClose}
                className="relative block h-36 rounded-xl overflow-hidden group shadow-2xs"
              >
                <img
                  src="/IMAGES/COVERS/LUXURY HOOK.png"
                  alt="Shop Luxury"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent flex items-end p-3">
                  <span className="text-white font-bold text-xs">Shop Luxury</span>
                </div>
              </Link>

              <Link
                to="/catalog?tag=smart-eyewear"
                onClick={onClose}
                className="relative block h-36 rounded-xl overflow-hidden group shadow-2xs"
              >
                <img
                  src="/IMAGES/GLASSES/TYPES/FULL-RIM.png"
                  alt="Smart Eyewear"
                  className="w-full h-full object-contain p-4 bg-neutral-100 group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/70 via-transparent to-transparent flex items-end p-3">
                  <span className="text-white font-bold text-xs">Smart Eyewear</span>
                </div>
              </Link>
            </div>
          </div>
        ) : (
          <div className="flex items-start justify-start gap-10">
            <MegaMenuSubCategoryList
              activeCategory={activeCategory}
              onItemClick={onClose}
            />

            {isSunglasses ? (
              <div className="flex-1 max-w-155 flex flex-col space-y-2">
                <div className="flex items-start gap-8">
                  <ShapesAndTypesGrid
                    categorySlug={activeCategory?.slug || 'sunglasses'}
                    onItemClick={onClose}
                  />
                  <BrandsGrid
                    variant="mini"
                    categorySlug={activeCategory?.slug || 'sunglasses'}
                    onClose={onClose}
                  />
                </div>
                <FeatureBanner
                  categorySlug={activeCategory?.slug || 'sunglasses'}
                  onItemClick={onClose}
                />
              </div>
            ) : (
              <>
                <ShapesAndTypesGrid
                  categorySlug={activeCategory?.slug || 'glasses'}
                  onItemClick={onClose}
                />
                <FeatureBanner
                  categorySlug={activeCategory?.slug || 'glasses'}
                  onItemClick={onClose}
                />
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};