import React from 'react';
import { Link } from 'react-router-dom';

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

interface Props {
  currentCategory?: Category;
  onClose: () => void;
}

const DEFAULT_LINKS = [
  "Women's Glasses", "Men's Glasses", "Kids' Glasses", "New Arrivals", 
  "Best Sellers", "Blue Light Blocking Glasses", "Our Favorites", 
  "Ray-Ban Meta", "Oakley Meta", "Sale"
];

export const MegaMenuSubcategories: React.FC<Props> = ({ currentCategory, onClose }) => {
  const hasSubcategories = currentCategory?.subcategories && currentCategory.subcategories.length > 0;

  return (
    <div className="col-span-3 border-r border-walters-border/30 pr-4">
      <h4 className="text-xs font-bold text-walters-navy uppercase tracking-wider mb-3">
        {currentCategory?.name || 'Categories'}
      </h4>
      <ul className="space-y-2">
        {hasSubcategories ? (
          currentCategory!.subcategories!.map((sub) => (
            <li key={sub.id}>
              <Link
                to={`/catalog?subcategory=${sub.slug}`}
                onClick={onClose}
                className={`text-xs font-medium block py-0.5 transition-all hover:text-walters-gold w-max ${
                  sub.name.toLowerCase() === 'sale' ? 'text-rose-600 font-bold' : 'text-walters-charcoal'
                }`}
              >
                {sub.name}
              </Link>
            </li>
          ))
        ) : (
          DEFAULT_LINKS.map((name) => (
            <li key={name}>
              <Link
                to={`/catalog?search=${encodeURIComponent(name)}`}
                onClick={onClose}
                className={`text-xs font-medium block py-0.5 transition-all hover:text-walters-gold w-max ${
                  name === 'Sale' ? 'text-rose-600 font-bold' : 'text-walters-charcoal'
                }`}
              >
                {name}
              </Link>
            </li>
          ))
        )}
      </ul>
    </div>
  );
};