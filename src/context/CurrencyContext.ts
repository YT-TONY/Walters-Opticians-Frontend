import { createContext } from 'react';

export type CurrencyCode = 'GBP' | 'NGN' | 'USD' | 'EUR' | string;

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  rateVsGbp: number; // Conversion rate relative to 1 GBP
}

export interface CurrencyContextType {
  currency: CurrencyCode;
  symbol: string;
  setCurrency: (code: CurrencyCode) => void;
  formatPrice: (amountInGbp: number) => string;
  convertPrice: (amountInGbp: number) => number;
  availableCurrencies: Record<string, { symbol: string; label: string }>;
  loading: boolean;
}

export const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);