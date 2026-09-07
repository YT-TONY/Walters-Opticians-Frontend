// src/components/megamenu/MegaMenu.tsx
import React from 'react';
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
      className="absolute top-full left-0 w-full bg-white shadow-2xl z-50 border-b border-neutral-200 animate-in fade-in duration-150"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <MegaMenuTabNav
        categories={categories}
        activeCategoryId={activeCategory?.id || null}
        onSelectCategory={onCategoryHover}
        onClose={onClose}
      />

      <div className="max-w-7xl mx-auto px-8 py-8">
        {isBrandsTab ? (
          /* BRANDS TAB VIEW: BrandsGrid now completely controls the full-width layout */
          <BrandsGrid variant="mega-view" onClose={onClose} />
        ) : (
          /* OPTICAL & SUNGLASSES VIEWS */
          <div className="flex items-start justify-start gap-12">
            <MegaMenuSubCategoryList
              activeCategory={activeCategory}
              onItemClick={onClose}
            />

            {isSunglasses ? (
              <div className="flex-1 max-w-2xl flex flex-col space-y-5">
                <div className="flex items-start gap-10">
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