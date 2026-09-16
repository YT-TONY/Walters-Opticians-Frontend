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
    <nav className="w-full bg-neutral-50/80 border-b border-neutral-200/60 py-2.5 px-6 sm:px-10 lg:px-16">
      <div className="max-w-[1600px] mx-auto flex items-center space-x-2 text-[11px] font-semibold uppercase tracking-wider text-neutral-400 font-serif">
        <Link to="/" className="hover:text-walters-navy flex items-center gap-1 transition-colors">
          <Home className="w-3.5 h-3.5" />
          <span>Home</span>
        </Link>

        {items.map((item, idx) => {
          const isLast = idx === items.length - 1;
          return (
            <React.Fragment key={item.label}>
              <ChevronRight className="w-3 h-3 text-neutral-300 shrink-0" />
              {isLast || !item.path ? (
                <span className="text-walters-navy font-bold truncate">{item.label}</span>
              ) : (
                <Link to={item.path} className="hover:text-walters-navy transition-colors truncate">
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