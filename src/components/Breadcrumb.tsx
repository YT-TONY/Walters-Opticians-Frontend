// src/components/Breadcrumb.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ChevronRight } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => {
  return (
    <nav className="w-full bg-slate-100/80 border-b border-slate-200 py-3.5 px-6 sm:px-10 lg:px-16">
      <div className="max-w-[1600px] mx-auto flex items-center space-x-2.5 text-xs sm:text-sm font-semibold uppercase tracking-wider text-slate-700">
        <Link to="/" className="hover:text-walters-navy flex items-center gap-1.5 transition-colors font-normal text-slate-700 hover:underline">
          <Home className="w-4 h-4 text-walters-navy shrink-0" />
          <span>Home</span>
        </Link>

        {items.map((item, idx) => {
          const isLast = idx === items.length - 1;
          return (
            <React.Fragment key={item.label}>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              {isLast || !item.path ? (
                <span className="text-walters-navy font-bold truncate tracking-wide">{item.label}</span>
              ) : (
                <Link to={item.path} className="hover:text-walters-navy transition-colors truncate text-slate-700 font-semibold hover:underline">
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