// src/components/megamenu/SaleGrid.tsx
import React from 'react';
import { Link } from 'react-router-dom';

interface SaleBannerItem {
  id: string;
  title: string;
  subtitle: string;
  link: string;
  image: string;
}

const SALE_BANNERS: SaleBannerItem[] = [
  {
    id: '1',
    title: 'Clearance Sale',
    subtitle: 'Up to 50% Off Frames',
    link: '/catalog?on_sale=true&filter=clearance',
    image: '/IMAGES/SALE/CLEARANCE_SALE.png',
  },
  {
    id: '2',
    title: 'Designer Outlet',
    subtitle: 'Exclusive Brand Discounts',
    link: '/catalog?on_sale=true&filter=designer-outlet',
    image: '/IMAGES/SALE/DESIGNER_OUTLET.png',
  },
  {
    id: '3',
    title: 'Buy 1 Get 1 50% Off',
    subtitle: 'Limited Time Offer',
    link: '/catalog?on_sale=true&filter=bogo',
    image: '/IMAGES/SALE/BOGO_SALE.png',
  },
];

interface SaleGridProps {
  onClose?: () => void;
}

export const SaleGrid: React.FC<SaleGridProps> = ({ onClose }) => {
  return (
    <div className="w-full max-w-5xl mx-auto py-2">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {SALE_BANNERS.map((banner) => (
          <Link
            key={banner.id}
            to={banner.link}
            onClick={onClose}
            className="relative block h-80 w-full overflow-hidden group border border-neutral-200 shadow-2xs rounded-none bg-neutral-900"
          >
            {/* Background Image */}
            <img
              src={banner.image}
              alt={banner.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
            />

            {/* Gradient Overlay for Text Readability */}
            <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/35 to-transparent flex flex-col justify-end p-6">
              <span className="text-walters-gold text-xs font-bold uppercase tracking-widest mb-1.5">
                {banner.subtitle}
              </span>
              <h3 className="text-white font-extrabold text-lg uppercase tracking-wider group-hover:text-walters-gold transition-colors">
                {banner.title}
              </h3>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};