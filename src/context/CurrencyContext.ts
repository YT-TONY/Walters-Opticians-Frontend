// src/context/CurrencyContext.ts
import { createContext } from 'react';

// 1. Export the CurrencyCode type so other files can import it
export type CurrencyCode = 'GBP' | 'USD' | 'EUR' | 'NGN';

export interface CurrencyDetails {
  symbol: string;
  label: string;
  defaultRate: number;
}

export interface CurrencyContextType {
  currency: CurrencyCode;
  symbol: string;
  setCurrency: (code: CurrencyCode) => void;
  formatPrice: (priceInGbp: number) => string;
  convertPrice: (priceInGbp: number) => number;
  availableCurrencies: Record<string, CurrencyDetails>;
  loading: boolean;
}

// 2. Export the context
export const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);