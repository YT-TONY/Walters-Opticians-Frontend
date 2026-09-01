//src/components/CurrencySelector.tsx
import React from 'react';
import { useCurrency } from '../hooks/useCurrency';
import type { CurrencyCode } from '../context/CurrencyContext';
import { Globe } from 'lucide-react';

export const CurrencySelector: React.FC = () => {
  const { currency, setCurrency, availableCurrencies, loading } = useCurrency();

  if (loading) return null;

  return (
    <div className="relative flex items-center space-x-1.5 text-xs text-slate[#FBFAF5] px-2.5 py-1.5 rounded-xl border border-border">
      <Globe className="w-3.5 h-3.5 text-navy" />
      <select
        value={currency}
        onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
        className="bg-transparent font-semibold text-navy focus:outline-none cursor-pointer pr-1"
      >
        {Object.entries(availableCurrencies).map(([code, config]) => (
          <option key={code} value={code}>
            {config.label}
          </option>
        ))}
      </select>
    </div>
  );
};