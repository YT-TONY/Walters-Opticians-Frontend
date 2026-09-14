// src/components/megamenu/ContactLensesGrid.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

interface ContactLensesGridProps {
  onClose: () => void;
}

const FREQUENCY_LINKS = [
  { label: 'Daily', filter: 'daily' },
  { label: 'Weekly', filter: 'bi_weekly' },
  { label: 'Monthly', filter: 'monthly' },
];

const LENS_TYPE_LINKS = [
  { label: 'Silicone Hydrogel Lenses', filter: 'silicone_hydrogel' },
  { label: 'Spherical Lenses', filter: 'spherical' },
  { label: 'Toric Lenses', filter: 'toric' },
  { label: 'Multifocal Lenses', filter: 'multifocal' },
  { label: 'Coloured Contact Lenses', filter: 'colored' },
];

const CONTACT_BRANDS = [
  { name: 'ACUVUE', image: '/IMAGES/BRAND LOGO/ACUVUE.png' },
  { name: 'AIR OPTIX', image: '/IMAGES/BRAND LOGO/AIR OPTIX.png' },
  { name: 'Avaira', image: '/IMAGES/BRAND LOGO/AVAIRA.png' },
  { name: 'Biofinity', image: '/IMAGES/BRAND LOGO/BIOFINITY.png' },
  { name: 'clariti', image: '/IMAGES/BRAND LOGO/CLARITI.png' },
  { name: 'SofLens', image: '/IMAGES/BRAND LOGO/SOFTLENS.png' },
];

export const ContactLensesGrid: React.FC<ContactLensesGridProps> = ({ onClose }) => {
  return (
    <div className="flex items-start justify-between gap-8 py-2">
      {/* LEFT COLUMN: Subcategories Grouped by Frequency & Lens Type */}
      <div className="w-56 space-y-6 shrink-0">
        {/* Frequency Group */}
        <div>
          <h3 className="text-amber-600 font-semibold text-base tracking-wide mb-2.5">
            Frequency
          </h3>
          <ul className="space-y-2">
            {FREQUENCY_LINKS.map((item) => (
              <li key={item.label}>
                <Link
                  to={`/catalog?category=contact_lenses&frequency=${item.filter}`}
                  onClick={onClose}
                  className="text-neutral-700 hover:text-amber-600 text-sm font-medium block py-0.5 transition-colors"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Lens Type Group */}
        <div>
          <h3 className="text-amber-600 font-semibold text-base tracking-wide mb-2.5">
            Lens Type
          </h3>
          <ul className="space-y-2">
            {LENS_TYPE_LINKS.map((item) => (
              <li key={item.label}>
                <Link
                  to={`/catalog?category=contact_lenses&design=${item.filter}`}
                  onClick={onClose}
                  className="text-neutral-700 hover:text-amber-600 text-sm font-medium block py-0.5 transition-colors"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* MIDDLE COLUMN: Expanded 2x3 Brand Logo Grid */}
      <div className="flex-1 max-w-lg">
        <div className="grid grid-cols-2 gap-4">
          {CONTACT_BRANDS.map((brand) => (
            <Link
              key={brand.name}
              to={`/catalog?category=contact_lenses&brand=${encodeURIComponent(brand.name)}`}
              onClick={onClose}
              className="h-26 bg-white border border-neutral-200 rounded-lg flex items-center justify-center p-4 hover:border-amber-500 hover:shadow-xs transition-all group"
            >
              <img
                src={brand.image}
                alt={`${brand.name} logo`}
                className="max-h-16 w-auto object-contain group-hover:scale-105 transition-transform duration-200"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                  if (e.currentTarget.parentElement) {
                    e.currentTarget.parentElement.innerText = brand.name;
                  }
                }}
              />
            </Link>
          ))}
        </div>
      </div>

      {/* RIGHT COLUMN: Larger Promotional Banner Tile */}
      <div className="w-97.5 shrink-0">
        <Link
          to="/catalog?category=contact_lenses"
          onClick={onClose}
          className="relative block h-85 overflow-hidden group shadow-md bg-linear-to-br from-slate-900 via-slate-800 to-blue-950"
        >
          <img
            src="/IMAGES/COVERS/CONTACT LENS.png"
            alt="Contact Lenses Promo"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
          <div className="absolute inset-0 bg-linear-to-t from-slate-950/85 via-slate-950/30 to-transparent flex flex-col justify-end p-6">
            <h4 className="text-white font-serif text-2xl font-bold leading-tight drop-shadow-xs">
              Buy More, Save More
            </h4>
            <p className="text-neutral-200 text-sm mt-2 flex items-center font-medium">
              Explore multi-pack offers & subscriptions
              <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
};