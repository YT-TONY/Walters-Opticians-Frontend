// src/components/megamenu/MegaMenu.tsx
import React from 'react';
import type { Category } from '../../context/Category';
import { MegaMenuTabNav } from './MegaMenuTabNav';
import { MegaMenuSubCategoryList } from './MegaMenuSubCategoryList';
import { ShapesAndTypesGrid } from './ShapesAndTypesGrid';
import { BrandsGrid } from './BrandsGrid';
import { FeatureBanner } from './FeaturedBanner';

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
    categories.find((cat) => cat.id === activeCategoryId) || categories[0] || null;

  const isSunglasses = activeCategory?.slug.toLowerCase().includes('sunglass');

  return (
    <div
      className="absolute top-full left-0 w-full bg-white shadow-2xl z-50 border-b border-walters-border/20 animate-in fade-in duration-150"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* 1. TOP TAB NAV */}
      <MegaMenuTabNav
        categories={categories}
        activeCategoryId={activeCategory?.id || null}
        onSelectCategory={onCategoryHover}
        onClose={onClose}
      />

      {/* 2. DYNAMIC CONTENT BODY */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-start justify-start gap-10">
          {/* COLUMN 1: Dynamic Subcategories */}
          <MegaMenuSubCategoryList
            activeCategory={activeCategory}
            onItemClick={onClose}
          />

          {/* COLUMN 2 & 3 CONTAINER */}
          {isSunglasses ? (
            <div className="flex-1 max-w-155 flex flex-col space-y-2">
              {/* Top Row: Shapes Grid + Brands Grid Side-by-Side */}
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

              {/* Bottom Row: Spotlight Cards starting directly beneath the frames */}
              <FeatureBanner
                categorySlug={activeCategory?.slug || 'sunglasses'}
                onItemClick={onClose}
              />
            </div>
          ) : (
            <>
              {/* Optical Glasses View */}
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
      </div>
    </div>
  );
};