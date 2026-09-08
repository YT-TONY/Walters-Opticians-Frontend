// src/components/home/HomeFeatureGrid.tsx
import React from 'react';
import { Link } from 'react-router-dom';

interface FeatureCard {
  id: string;
  badge?: string;
  title: string;
  description: string;
  buttonText: string;
  link: string;
  image: string;
}

const FEATURE_CARDS: FeatureCard[] = [
  {
    id: 'luxury',
    badge: 'Luxury Series',
    title: 'Italian Acetate & High-End Craft',
    description: 'Exquisite designer frames hand-finished with titanium precision and luxury detail.',
    buttonText: 'Shop Luxury',
    link: '/catalog?filter=luxury',
    image: '/IMAGES/HOMEPAGE/LUXURY_BANNER.png',
  },
  {
    id: 'budget',
    badge: 'Everyday Value',
    title: 'Premium Quality, Budget Friendly',
    description: 'Durable, stylish prescription glasses engineered for comfort without breaking the bank.',
    buttonText: 'Shop Budget',
    link: '/catalog?filter=budget',
    image: '/IMAGES/HOMEPAGE/BUDGET_BANNER.png',
  },
  {
    id: 'discounts',
    badge: 'Special Offers',
    title: 'Discounts Crafted Just For You',
    description: 'Looking to save? Explore exclusive frame & lens bundles with up to 50% off.',
    buttonText: 'Claim Discounts',
    link: '/catalog?on_sale=true',
    image: '/IMAGES/HOMEPAGE/DISCOUNT_BANNER.png',
  },
];

export const HomeFeatureGrid: React.FC = () => {
  return (
    <section className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {FEATURE_CARDS.map((card) => (
          <div
            key={card.id}
            className="relative h-128 w-full rounded-2xl overflow-hidden group border border-neutral-200/80 shadow-xs bg-neutral-900 flex flex-col justify-end"
          >
            {/* Background Image */}
            <img
              src={card.image}
              alt={card.title}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90"
            />

            {/* Dark Gradient Overlay for Typography Readability */}
            <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />

            {/* Card Content Overlay */}
            <div className="relative z-10 p-8 flex flex-col justify-end h-full">
              {card.badge && (
                <span className="inline-block text-[10px] font-black uppercase tracking-widest text-walters-gold bg-walters-navy/85 backdrop-blur-xs px-3 py-1 rounded-sm w-fit mb-3">
                  {card.badge}
                </span>
              )}

              <h3 className="text-white font-extrabold text-2xl leading-snug tracking-tight mb-2.5 group-hover:text-walters-gold transition-colors">
                {card.title}
              </h3>

              <p className="text-neutral-300 text-xs font-normal leading-relaxed mb-6 line-clamp-2">
                {card.description}
              </p>

              <Link
                to={card.link}
                className="w-full sm:w-fit px-6 py-3 bg-white text-walters-navy hover:bg-walters-navy hover:text-white font-bold text-xs uppercase tracking-wider rounded-lg transition-all duration-300 shadow-sm text-center"
              >
                {card.buttonText}
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};