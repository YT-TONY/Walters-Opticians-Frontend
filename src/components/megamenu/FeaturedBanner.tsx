// src/components/megamenu/FeatureBanner.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

interface FeatureBannerProps {
  categorySlug?: string;
  imageUrl?: string;
  tag?: string;
  onItemClick?: () => void;
}

const SUNGLASSES_FEATURE_CARDS = [
  {
    id: 'sports',
    title: 'Sports',
    subtitle: 'Sunglasses for all sporting activities',
    image: '/IMAGES/COVERS/SPORT.webp',
    query: 'tag=sports',
  },
  {
    id: 'polarized',
    title: 'Polarized',
    subtitle: 'Reduce glare when most needed',
    image: '/IMAGES/COVERS/POLARIZED.webp',
    query: 'feature=polarized',
  },
  {
    id: 'classics',
    title: "People's Favorite",
    subtitle: 'All-time best sellers rated by volume',
    image: '/IMAGES/COVERS/CLASSICS.webp',
    query: 'filter=best-sellers',
  },
];

export const FeatureBanner: React.FC<FeatureBannerProps> = ({
  categorySlug = 'glasses',
  imageUrl = '/IMAGES/COVERS/LUXURY HOOK.png',
  tag = 'luxury',
  onItemClick,
}) => {
  const isSunglasses = categorySlug.toLowerCase().includes('sunglass');

  // Sunglasses Layout: 3 Elongated Spotlight Cards with Sharp Edges & Larger Text
  if (isSunglasses) {
    return (
      <div className="grid grid-cols-3 gap-4 w-full pt-2">
        {SUNGLASSES_FEATURE_CARDS.map((card) => (
          <Link
            key={card.id}
            to={`/catalog?category=${categorySlug}&${card.query}`}
            onClick={onItemClick}
            className="group flex flex-col space-y-2"
          >
            {/* Extended Height & Sharp Borders */}
            <div className="w-full h-44 rounded-none overflow-hidden relative bg-walters-navy/5 shadow-2xs">
              <img
                src={card.image}
                alt={card.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            {/* Increased Text Sizes */}
            <div>
              <h5 className="text-sm font-semibold text-walters-navy group-hover:text-walters-gold transition-colors">
                {card.title}
              </h5>
              <p className="text-xs text-walters-slate/80 font-normal leading-snug mt-0.5">
                {card.subtitle}
              </p>
            </div>
          </Link>
        ))}
      </div>
    );
  }

  // Optical Glasses Layout: Tall Full-Bleed Portrait Banner Card
  return (
    <div className="w-64 h-84 shrink-0 relative rounded-none overflow-hidden shadow-2xs group">
      <img
        src={imageUrl}
        alt="Shop Luxury"
        className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
      />

      <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/15 to-transparent" />

      <div className="absolute bottom-4 left-4 right-4">
        <Link
          to={`/catalog?category=${categorySlug}&tag=${tag}`}
          onClick={onItemClick}
          className="w-full inline-flex items-center justify-center space-x-2 bg-white/95 hover:bg-walters-gold text-walters-navy font-semibold text-xs py-2.5 px-4 rounded-none shadow-md transition-all duration-200"
        >
          <span>Shop Luxury</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};