import React from 'react';
import { Link } from 'react-router-dom';
import { FRAME_IMAGES } from '../../constants/frameImages';

interface Props {
  onClose: () => void;
}

const SHAPES = ['Oval', 'Rectangle', 'Browline', 'Square', 'Round', 'Wayfarer', 'CatEye', 'Pilot'];
const TYPES = ['FullRim', 'SemiRim', 'Rimless'];

export const ShapesAndTypesGrid: React.FC<Props> = ({ onClose }) => {
  return (
    <div className="col-span-5 space-y-6">
      {/* Popular Frame Shapes */}
      <div>
        <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-3">
          Popular Shapes
        </h4>
        <div className="grid grid-cols-4 gap-2">
          {SHAPES.map((shape) => (
            <Link
              key={shape}
              to={`/catalog?shape=${shape.toLowerCase()}`}
              onClick={onClose}
              className="flex flex-col items-center justify-center p-2 rounded-lg hover:bg-black/5 transition-all group"
            >
              <div className="w-20 h-10 flex items-center justify-center">
                <img 
                  src={FRAME_IMAGES[shape]} 
                  alt={shape}
                  className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform duration-200" 
                />
              </div>
              <span className="text-[11px] text-walters-slate mt-1 group-hover:text-black font-medium text-center">
                {shape.replace(/([A-Z])/g, ' $1').trim()}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Popular Rim Types */}
      <div>
        <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-3">
          Popular Frame Types
        </h4>
        <div className="grid grid-cols-3 gap-2">
          {TYPES.map((type) => (
            <Link
              key={type}
              to={`/catalog?type=${type.toLowerCase()}`}
              onClick={onClose}
              className="flex flex-col items-center justify-center p-2 rounded-lg hover:bg-black/5 transition-all group"
            >
              <div className="w-20 h-10 flex items-center justify-center">
                <img 
                  src={FRAME_IMAGES[type]} 
                  alt={type}
                  className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform duration-200" 
                />
              </div>
              <span className="text-[11px] text-walters-slate mt-1 group-hover:text-black font-medium text-center">
                {type.replace(/([A-Z])/g, ' $1').trim()}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};