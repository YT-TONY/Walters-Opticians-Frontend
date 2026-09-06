import React from 'react';
import { Link } from 'react-router-dom';

interface Props {
  onClose: () => void;
}

const BRANDS = [
  'Ray-Ban', 'Oakley', 'Tom Ford', 'Gucci',
  'Prada', 'Carrera', 'Boss', 'Persol'
];

export const BrandsGrid: React.FC<Props> = ({ onClose }) => {
  return (
    <div className="col-span-5 space-y-4">
      <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-3">
        Featured Eyewear Brands
      </h4>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {BRANDS.map((brand) => (
          <Link
            key={brand}
            to={`/catalog?brand=${encodeURIComponent(brand)}`}
            onClick={onClose}
            className="flex items-center justify-center p-4 bg-white border border-walters-border/40 rounded-xl hover:border-walters-navy hover:shadow-xs transition-all text-xs font-bold text-walters-navy text-center"
          >
            {brand}
          </Link>
        ))}
      </div>
    </div>
  );
};