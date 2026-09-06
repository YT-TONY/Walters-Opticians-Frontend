// src/components/megamenu/ShapesAndTypesGrid.tsx
import React from 'react';
import { Link } from 'react-router-dom';

interface ShapeItem {
  name: string;
  slug: string;
  image: string;
}

interface TypeItem {
  name: string;
  slug: string;
  image: string;
}

const OPTICAL_SHAPES: ShapeItem[] = [
  { name: 'Aviator', slug: 'aviator', image: '/IMAGES/GLASSES/SHAPE/AVIATOR.png' },
  { name: 'Cat Eye', slug: 'cat-eye', image: '/IMAGES/GLASSES/SHAPE/CATEYE.png' },
  { name: 'Wayfarer', slug: 'wayfarer', image: '/IMAGES/GLASSES/SHAPE/WAYFAYER.png' },
  { name: 'Round', slug: 'round', image: '/IMAGES/GLASSES/SHAPE/ROUND.png' },
  { name: 'Square', slug: 'square', image: '/IMAGES/GLASSES/SHAPE/SQUARE.png' },
  { name: 'Browline', slug: 'browline', image: '/IMAGES/GLASSES/SHAPE/BROWLINE.png' },
  { name: 'Rectangle', slug: 'rectangle', image: '/IMAGES/GLASSES/SHAPE/RECTANGLE.png' },
  { name: 'Oval', slug: 'oval', image: '/IMAGES/GLASSES/SHAPE/OVAL.png' },
];

const SUNGLASS_SHAPES: ShapeItem[] = [
  { name: 'Aviator', slug: 'aviator', image: '/IMAGES/SUNGLASSES/AVIATOR.png' },
  { name: 'Wayfarer', slug: 'wayfarer', image: '/IMAGES/SUNGLASSES/WAYFAYER.png' },
  { name: 'Oval', slug: 'oval', image: '/IMAGES/SUNGLASSES/OVAL.png' },
  { name: 'Square', slug: 'square', image: '/IMAGES/SUNGLASSES/SQUARE.png' },
  { name: 'Cat Eye', slug: 'cat-eye', image: '/IMAGES/SUNGLASSES/CATEYE.png' },
  { name: 'Wraparound', slug: 'wraparound', image: '/IMAGES/SUNGLASSES/WRAP AROUND.png' },
  { name: 'Round', slug: 'round', image: '/IMAGES/SUNGLASSES/ROUND.png' },
  { name: 'Browline', slug: 'browline', image: '/IMAGES/SUNGLASSES/BROWLINE.png' },
];

const GLASSES_TYPES: TypeItem[] = [
  { name: 'Full Rim', slug: 'full-rim', image: '/IMAGES/GLASSES/TYPES/FULL-RIM.png' },
  { name: 'Half Rim', slug: 'half-rim', image: '/IMAGES/GLASSES/TYPES/HALF-RIM.png' },
  { name: 'Rimless', slug: 'rimless', image: '/IMAGES/GLASSES/TYPES/RIMLESS.png' },
];

interface ShapesAndTypesGridProps {
  categorySlug?: string;
  onItemClick?: () => void;
}

export const ShapesAndTypesGrid: React.FC<ShapesAndTypesGridProps> = ({
  categorySlug = 'glasses',
  onItemClick,
}) => {
  const isSunglasses = categorySlug.toLowerCase().includes('sunglass');
  const activeShapes = isSunglasses ? SUNGLASS_SHAPES : OPTICAL_SHAPES;

  return (
    <div className="w-112.5 shrink-0 space-y-4">
      {/* Popular Shapes Grid */}
      <div>
        <h4 className="text-[11px] font-semibold uppercase tracking-widest text-walters-gold/90 mb-2.5">
          Popular Shapes
        </h4>
        <div className="grid grid-cols-4 gap-2">
          {activeShapes.map((shape) => (
            <Link
              key={shape.slug}
              to={`/catalog?category=${categorySlug}&shape=${shape.slug}`}
              onClick={onItemClick}
              className="flex flex-col items-center justify-center p-1.5 rounded-xl hover:bg-walters-cream/50 transition-all group"
            >
              <img
                src={shape.image}
                alt={shape.name}
                className="h-7 w-auto object-contain opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all"
              />
              <span className="text-[10px] font-medium text-walters-charcoal/80 group-hover:text-walters-navy mt-1">
                {shape.name}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Optical Frame Rim Types */}
      {!isSunglasses && (
        <div>
          <h4 className="text-[11px] font-semibold uppercase tracking-widest text-walters-gold/90 mb-2.5">
            Popular Frame Types
          </h4>
          <div className="grid grid-cols-3 gap-2">
            {GLASSES_TYPES.map((type) => (
              <Link
                key={type.slug}
                to={`/catalog?category=${categorySlug}&rim=${type.slug}`}
                onClick={onItemClick}
                className="flex flex-col items-center justify-center p-1.5 rounded-xl hover:bg-walters-cream/50 transition-all group"
              >
                <img
                  src={type.image}
                  alt={type.name}
                  className="h-7 w-auto object-contain opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all"
                />
                <span className="text-[10px] font-medium text-walters-charcoal/80 group-hover:text-walters-navy mt-1">
                  {type.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};