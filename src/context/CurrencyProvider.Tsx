// src/context/CurrencyProvider.tsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { CurrencyContext, type CurrencyCode, type CurrencyDetails } from './CurrencyContext';

// Standard supported currencies & fallback exchange rates (Base: 1 GBP)
const SUPPORTED_CURRENCIES: Record<CurrencyCode, CurrencyDetails> = {
  GBP: { symbol: '£', label: 'GBP (£)', defaultRate: 1 },
  NGN: { symbol: '₦', label: 'NGN (₦)', defaultRate: 2050 },
  USD: { symbol: '$', label: 'USD ($)', defaultRate: 1.28 },
  EUR: { symbol: '€', label: 'EUR (€)', defaultRate: 1.17 },
};

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currency, setCurrencyState] = useState<CurrencyCode>('GBP');
  const [rates, setRates] = useState<Record<string, number>>({
    GBP: 1,
    NGN: 2050,
    USD: 1.28,
    EUR: 1.17,
  });
  const [loading, setLoading] = useState(true);

  // Update currency and persist user preference in localStorage
  const setCurrency = (code: CurrencyCode) => {
    setCurrencyState(code);
    localStorage.setItem('walters_user_currency', code);
  };

  // 1. Fetch real-time exchange rates relative to GBP
  useEffect(() => {
    fetch('https://open.er-api.com/v6/latest/GBP')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.rates) {
          setRates((prev) => ({
            ...prev,
            USD: data.rates.USD || prev.USD,
            EUR: data.rates.EUR || prev.EUR,
            NGN: data.rates.NGN || prev.NGN,
          }));
        }
      })
      .catch(() => {
        // Fallback to static rates if API fails
      });
  }, []);

  // 2. IP-based automatic location and currency detection
  useEffect(() => {
    const savedCurrency = localStorage.getItem('walters_user_currency') as CurrencyCode | null;

    if (savedCurrency && SUPPORTED_CURRENCIES[savedCurrency]) {
      setCurrencyState(savedCurrency);
      setLoading(false);
      return;
    }

    // IP Geolocation API lookup
    fetch('https://ipapi.co/json/')
      .then((res) => res.json())
      .then((data) => {
        const detectedCurrency = data?.currency;
        // Check if key exists in SUPPORTED_CURRENCIES and cast safely
        if (detectedCurrency && detectedCurrency in SUPPORTED_CURRENCIES) {
          setCurrencyState(detectedCurrency as CurrencyCode);
        } else if (data?.country_code === 'NG') {
          setCurrencyState('NGN');
        } else if (data?.country_code === 'US') {
          setCurrencyState('USD');
        } else if (['FR', 'DE', 'IT', 'ES', 'NL', 'BE'].includes(data?.country_code)) {
          setCurrencyState('EUR');
        } else {
          setCurrencyState('GBP');
        }
      })
      .catch(() => {
        setCurrencyState('GBP');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const convertPrice = useCallback(
    (amountInGbp: number): number => {
      const rate = rates[currency] || 1;
      return amountInGbp * rate;
    },
    [currency, rates]
  );

  const formatPrice = useCallback(
    (amountInGbp: number): string => {
      const converted = convertPrice(amountInGbp);
      const symbol = SUPPORTED_CURRENCIES[currency]?.symbol || '£';

      if (currency === 'NGN') {
        return `${symbol}${Math.round(converted).toLocaleString('en-NG')}`;
      }

      return `${symbol}${converted.toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      })}`;
    },
    [currency, convertPrice]
  );

  const activeSymbol = useMemo(
    () => SUPPORTED_CURRENCIES[currency]?.symbol || '£',
    [currency]
  );

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        symbol: activeSymbol,
        setCurrency,
        formatPrice,
        convertPrice,
        availableCurrencies: SUPPORTED_CURRENCIES,
        loading,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};