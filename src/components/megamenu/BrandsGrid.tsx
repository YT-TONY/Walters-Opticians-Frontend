// src/components/megamenu/BrandsGrid.tsx
import React from 'react';
import { Link } from 'react-router-dom';

interface BrandsGridProps {
  variant?: 'full' | 'mini';
  categorySlug?: string;
  onClose?: () => void;
}

const MINI_BRANDS = [
  { name: 'Ray-Ban', slug: 'ray-ban', logo: '/IMAGES/BRAND LOGO/RAY BAN.png' },
  { name: 'Nike', slug: 'nike', logo: '/IMAGES/BRAND LOGO/NIKE.png' },
  { name: 'Oakley', slug: 'oakley', logo: '/IMAGES/BRAND LOGO/OAKLEY.png' },
];

const FULL_BRANDS = [
  { name: 'Ray-Ban', slug: 'ray-ban', logo: '/IMAGES/BRAND LOGO/RAY BAN.png' },
  { name: 'Oakley', slug: 'oakley', logo: '/IMAGES/BRAND LOGO/OAKLEY.png' },
  { name: 'Tom Ford', slug: 'tom-ford', logo: '/IMAGES/BRAND LOGO/TOMFORD.png' },
  { name: 'Gucci', slug: 'gucci', logo: '/IMAGES/BRAND LOGO/GUCCI.png' },
  { name: 'Prada', slug: 'prada', logo: '/IMAGES/BRAND LOGO/PRADA.png' },
  { name: 'Carrera', slug: 'carrera', logo: '/IMAGES/BRAND LOGO/CARRERA.png' },
  { name: 'Boss', slug: 'boss', logo: '/IMAGES/BRAND LOGO/BOSS.png' },
  { name: 'Persol', slug: 'persol', logo: '/IMAGES/BRAND LOGO/PERSOL.png' },

];

export const BrandsGrid: React.FC<BrandsGridProps> = ({
  variant = 'full',
  categorySlug = 'sunglasses',
  onClose,
}) => {
  if (variant === 'mini') {
    return (
      <div className="w-48 shrink-0">
        <h4 className="text-[11px] font-semibold uppercase tracking-widest text-walters-gold/90 mb-2.5">
          Top Brands
        </h4>
        <div className="grid grid-cols-2 gap-2">
          {MINI_BRANDS.map((brand) => (
            <Link
              key={brand.slug}
              to={`/catalog?category=${categorySlug}&brand=${brand.slug}`}
              onClick={onClose}
              className="flex items-center justify-center p-2 bg-white border border-walters-border/30 rounded-xl hover:border-walters-gold hover:shadow-2xs transition-all h-12 group"
            >
              <img
                src={brand.logo}
                alt={brand.name}
                className="max-h-6 max-w-[80%] object-contain opacity-80 group-hover:opacity-100 transition-opacity"
                onError={(e) => {
                  // Fallback to text if brand logo PNG is missing
                  e.currentTarget.style.display = 'none';
                  if (e.currentTarget.nextElementSibling) {
                    (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'block';
                  }
                }}
              />
              <span className="hidden text-[11px] font-medium text-walters-navy">
                {brand.name}
              </span>
            </Link>
          ))}
          <Link
            to={`/catalog?category=${categorySlug}&view=brands`}
            onClick={onClose}
            className="flex items-center justify-center p-2 bg-walters-navy text-white rounded-xl hover:bg-walters-gold hover:text-walters-navy transition-all text-[11px] font-medium h-12"
          >
            Shop All
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h4 className="text-[11px] font-semibold uppercase tracking-widest text-walters-gold/90 mb-3">
        Featured Eyewear Brands
      </h4>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {FULL_BRANDS.map((brand) => (
          <Link
            key={brand.slug}
            to={`/catalog?brand=${brand.slug}`}
            onClick={onClose}
            className="flex items-center justify-center p-4 bg-white border border-walters-border/30 rounded-xl hover:border-walters-gold hover:shadow-2xs transition-all h-14 group"
          >
            <img
              src={brand.logo}
              alt={brand.name}
              className="max-h-7 max-w-[80%] object-contain opacity-80 group-hover:opacity-100 transition-opacity"
            />
          </Link>
        ))}
      </div>
    </div>
  );
};