// src/components/megamenu/MegaMenuSubCategoryList.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import type { Category } from '../../context/Category';

interface MegaMenuSubCategoryListProps {
  activeCategory?: Category | null;
  onItemClick?: () => void;
}

// Added 'sale' to EXCLUDED_SLUGS to prevent double rendering
const EXCLUDED_SLUGS = ['inserts', 'blue-light-blocking-glasses', 'blue-light', 'sale'];

// Fallback demographic subcategories for Sunglasses if DB list is unpopulated
const DEFAULT_SUNGLASS_SUBS = [
  { id: 'womens', name: "Women's Sunglasses", slug: 'womens-sunglasses' },
  { id: 'mens', name: "Men's Sunglasses", slug: 'mens-sunglasses' },
  { id: 'kids', name: "Kids' Sunglasses", slug: 'kids-sunglasses' },
];

export const MegaMenuSubCategoryList: React.FC<MegaMenuSubCategoryListProps> = ({
  activeCategory,
  onItemClick,
}) => {
  if (!activeCategory) return null;

  const categorySlug = activeCategory.slug || 'glasses';
  const isSunglasses = categorySlug.toLowerCase().includes('sunglass');
  const isSaleCategory = categorySlug.toLowerCase() === 'sale' || activeCategory.name.toLowerCase() === 'sale';

  const filteredSubcategories = (activeCategory.subcategories || []).filter((sub) => {
    const slugLower = sub.slug.toLowerCase();
    const nameLower = sub.name.toLowerCase();
    return !EXCLUDED_SLUGS.some((ex) => slugLower.includes(ex) || nameLower.includes(ex));
  });

  const demographicList =
    filteredSubcategories.length > 0 ? filteredSubcategories : DEFAULT_SUNGLASS_SUBS;

  return (
    <div className="w-48 shrink-0 pr-4 space-y-3">
      <h3 className="text-xs font-bold uppercase tracking-widest text-walters-navy">
        {activeCategory.name}
      </h3>

      <nav className="flex flex-col space-y-1.5 text-xs font-medium">
        {/* Demographic Links */}
        {demographicList.map((sub) => (
          <Link
            key={sub.slug}
            to={`/catalog?category=${categorySlug}&subcategory=${sub.slug}`}
            onClick={onItemClick}
            className="text-walters-charcoal/80 hover:text-walters-navy hover:translate-x-1 transition-all py-0.5 block"
          >
            {sub.name}
          </Link>
        ))}

        {/* Curated Filters for Sunglasses */}
        {isSunglasses && (
          <>
            <Link
              to={`/catalog?category=${categorySlug}&filter=new-arrivals`}
              onClick={onItemClick}
              className="text-walters-charcoal/80 hover:text-walters-navy hover:translate-x-1 transition-all py-0.5 block"
            >
              New Arrivals
            </Link>
            <Link
              to={`/catalog?category=${categorySlug}&filter=best-sellers`}
              onClick={onItemClick}
              className="text-walters-charcoal/80 hover:text-walters-navy hover:translate-x-1 transition-all py-0.5 block"
            >
              Best Sellers
            </Link>
            <Link
              to={`/catalog?category=${categorySlug}&brand=ray-ban-meta`}
              onClick={onItemClick}
              className="text-walters-charcoal/80 hover:text-walters-navy hover:translate-x-1 transition-all py-0.5 block"
            >
              Ray-Ban Meta
            </Link>
            <Link
              to={`/catalog?category=${categorySlug}&brand=oakley-meta`}
              onClick={onItemClick}
              className="text-walters-charcoal/80 hover:text-walters-navy hover:translate-x-1 transition-all py-0.5 block"
            >
              Oakley Meta
            </Link>
          </>
        )}

        {/* Single Red Sale Link */}
        {!isSaleCategory && (
          <Link
            to={`/catalog?category=${categorySlug}&on_sale=true`}
            onClick={onItemClick}
            className="text-rose-600 font-bold text-xs hover:text-rose-700 hover:translate-x-1 transition-all py-1 block"
          >
            Sale
          </Link>
        )}
      </nav>
    </div>
  );
};