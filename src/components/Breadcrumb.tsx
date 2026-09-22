// src/components/Breadcrumb.tsx

import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => {
  const [searchParams] = useSearchParams();

  // Hide breadcrumb navigation on search results view
  if (searchParams.get('search')) {
    return null;
  }

  return (
    <nav 
      aria-label="Breadcrumb Navigation"
      className="w-full bg-slate-50/80 backdrop-blur-md border-b border-slate-200/60 py-3 px-6 sm:px-10 lg:px-16 select-none"
    >
      <div className="max-w-[1600px] mx-auto flex items-center space-x-1.5 text-[11px] sm:text-xs font-normal tracking-tight text-slate-500">
        <Link 
          to="/" 
          className="text-slate-500 hover:text-slate-900 transition-colors duration-150 font-normal"
        >
          Home
        </Link>

        {items.map((item, idx) => {
          const isLast = idx === items.length - 1;
          return (
            <React.Fragment key={`${item.label}-${idx}`}>
              <ChevronRight className="w-3 h-3 text-slate-400 shrink-0 opacity-70" />
              {isLast || !item.path ? (
                <span className="text-slate-900 font-semibold truncate tracking-normal">
                  {item.label}
                </span>
              ) : (
                <Link 
                  to={item.path} 
                  className="text-slate-500 hover:text-slate-900 transition-colors duration-150 truncate"
                >
                  {item.label}
                </Link>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </nav>
  );
};