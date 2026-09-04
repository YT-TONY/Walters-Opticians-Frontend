// src/context/CurrencyContext.ts
import { createContext } from 'react';

export type CurrencyCode = 'GBP' | 'USD' | 'EUR' | 'NGN';

export interface CurrencyDetails {
  symbol: string;
  label: string;
  flag: string;
  defaultRate: number;
  defaultCountry: string;
}

export interface CurrencyContextType {
  currency: CurrencyCode;
  countryCode: string; // ISO 2-letter country code (e.g., 'nl', 'gb', 'us')
  symbol: string;
  flag: string;
  setCurrency: (code: CurrencyCode) => void;
  formatPrice: (priceInGbp: number) => string;
  convertPrice: (priceInGbp: number) => number;
  availableCurrencies: Record<CurrencyCode, CurrencyDetails>;
  loading: boolean;
}

export const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);