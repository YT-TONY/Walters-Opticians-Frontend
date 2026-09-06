// src/components/megamenu/MegaMenuTabNav.tsx
import React from 'react';
import { X } from 'lucide-react';
import type { Category } from '../../context/Category';

interface MegaMenuTabNavProps {
  categories: Category[];
  activeCategoryId: number | null;
  onSelectCategory: (id: number) => void;
  onClose: () => void;
}

export const MegaMenuTabNav: React.FC<MegaMenuTabNavProps> = ({
  categories,
  activeCategoryId,
  onSelectCategory,
  onClose,
}) => {
  return (
    <div className="w-full bg-white px-4 sm:px-6 lg:px-8 border-b border-walters-border/15">
      <div className="max-w-7xl mx-auto flex items-center justify-between h-11">
        {/* Navigation Category Tabs */}
        <nav className="flex items-center space-x-8 tracking-wider overflow-x-auto no-scrollbar">
          {categories.map((cat) => {
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

        {/* Minimalist Close Action */}
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