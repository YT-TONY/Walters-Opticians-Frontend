import React from 'react';
import { Link } from 'react-router-dom';
import bestSellerFrame from '../../assets/best-seller-frame.png';

interface Props {
  categorySlug?: string;
  onClose: () => void;
}

export const FeaturedBanner: React.FC<Props> = ({ categorySlug, onClose }) => {
  const isSunglasses = categorySlug === 'sunglasses';

  return (
    <div className="col-span-4 bg-white/80 p-4 rounded-xl border border-walters-border/30 flex flex-col justify-between shadow-xs group h-full">
      <div className="relative w-full aspect-4/3 rounded-lg overflow-hidden bg-[#F2EFE9] mb-3 border border-walters-border/20">
        <span className="absolute top-2.5 left-2.5 z-10 bg-amber-900/80 backdrop-blur-md text-amber-100 text-[9px] font-bold px-2 py-0.5 rounded tracking-wider uppercase">
          {isSunglasses ? 'Summer Luxury' : 'Signature Line'}
        </span>
        <img 
          src={bestSellerFrame} 
          alt="Featured Eyeglasses" 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
        />
      </div>

      <div className="flex flex-col justify-between flex-1 pt-1">
        <div>
          <h4 className="font-bold text-walters-navy text-sm">
            {isSunglasses ? 'Polarized UV400 Collection' : 'The Artisan Series'}
          </h4>
          <p className="text-[11px] text-walters-slate mt-1 mb-2 leading-relaxed">
            {isSunglasses 
              ? '100% UVA/UVB protection with anti-glare polarized luxury lenses.'
              : 'Hand-crafted Italian acetate with premium anti-reflective lenses included.'}
          </p>
        </div>
        <Link 
          to={isSunglasses ? '/catalog?category=sunglasses' : '/catalog?collection=artisan'}
          onClick={onClose}
          className="inline-flex items-center text-xs font-semibold text-amber-800 hover:text-amber-950 transition-colors pt-1"
        >
          Shop Collection &rarr;
        </Link>
      </div>
    </div>
  );
};