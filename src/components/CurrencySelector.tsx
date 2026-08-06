import React from 'react';
import { useCurrency } from '../hooks/useCurrency';
import { Globe } from 'lucide-react';

export const CurrencySelector: React.FC = () => {
  const { currency, setCurrency, availableCurrencies, loading } = useCurrency();

  if (loading) return null;

  return (
    <div className="relative flex items-center space-x-1.5 text-xs text-[#5E6470] bg-[#FBFAF5] px-2.5 py-1.5 rounded-xl border border-[#E5E0D8]">
      <Globe className="w-3.5 h-3.5 text-[#021438]" />
      <select
        value={currency}
        onChange={(e) => setCurrency(e.target.value)}
        className="bg-transparent font-semibold text-[#021438] focus:outline-none cursor-pointer pr-1"
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