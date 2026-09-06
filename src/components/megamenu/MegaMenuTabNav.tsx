// src/components/megamenu/MegaMenuTabNav.tsx
import React from 'react';
import { X } from 'lucide-react';
import type { Category } from '../../context/Category';
import { BrandsVirtualCategory } from './constants';

interface MegaMenuTabNavProps {
  categories: Category[];
  activeCategoryId: number | null;
  onSelectCategory: (id: number) => void;
  onClose: () => void;
}

const EXCLUDED_CATEGORY_SLUGS = ['lenses', 'to-notice', 'to_notice', 'to-notice-2'];

export const MegaMenuTabNav: React.FC<MegaMenuTabNavProps> = ({
  categories,
  activeCategoryId,
  onSelectCategory,
  onClose,
}) => {
  const cleanCategories = categories.filter((cat) => {
    const slugLower = cat.slug.toLowerCase();
    const nameLower = cat.name.toLowerCase();
    
    if (slugLower.includes('contact')) return true;
    
    return !EXCLUDED_CATEGORY_SLUGS.some(
      (ex) => slugLower === ex || nameLower === ex || nameLower === 'to notice'
    );
  });

  const finalCategories: Category[] = [];
  cleanCategories.forEach((cat) => {
    finalCategories.push(cat);
    if (cat.slug.toLowerCase().includes('sunglass')) {
      finalCategories.push(BrandsVirtualCategory);
    }
  });

  if (!finalCategories.some((cat) => cat.id === -100)) {
    finalCategories.splice(2, 0, BrandsVirtualCategory);
  }

  return (
    <div className="w-full bg-white px-4 sm:px-6 lg:px-8 border-b border-walters-border/15">
      <div className="max-w-7xl mx-auto flex items-center justify-between h-11">
        <nav className="flex items-center space-x-8 tracking-wider overflow-x-auto no-scrollbar">
          {finalCategories.map((cat) => {
            const isActive = cat.id === activeCategoryId;
            const isSale = cat.slug.toLowerCase() === 'sale' || cat.name.toLowerCase() === 'sale';

            if (isSale) {
              return (
                <button
                  key={cat.id}
                  type="button"
                  onMouseEnter={() => onSelectCategory(cat.id)}
                  onClick={() => onSelectCategory(cat.id)}
                  className={`py-2.5 text-[11px] font-bold uppercase transition-all border-b-2 cursor-pointer ${
                    isActive
                      ? 'border-rose-600 text-rose-600'
                      : 'border-transparent text-rose-600 hover:text-rose-700 hover:border-rose-600'
                  }`}
                >
                  {cat.name}
                </button>
              );
            }

            return (
              <button
                key={cat.id}
                type="button"
                onMouseEnter={() => onSelectCategory(cat.id)}
                onClick={() => onSelectCategory(cat.id)}
                className={`py-2.5 text-xs uppercase font-semibold transition-all border-b-2 cursor-pointer ${
                  isActive
                    ? 'border-walters-gold text-walters-navy font-bold'
                    : 'border-transparent text-walters-charcoal/70 hover:text-walters-navy hover:border-walters-gold'
                }`}
              >
                {cat.name}
              </button>
            );
          })}
        </nav>

        <button
          type="button"
          onClick={onClose}
          className="flex items-center space-x-1 text-xs font-semibold text-walters-slate/70 hover:text-walters-navy transition-colors cursor-pointer py-1"
        >
          <span>Close</span>
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};