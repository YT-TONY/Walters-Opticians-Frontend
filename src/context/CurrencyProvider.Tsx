// src/context/CurrencyProvider.tsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { CurrencyContext, type CurrencyCode, type CurrencyDetails } from './CurrencyContext';

const DEFAULT_CURRENCIES: Record<string, CurrencyDetails & { defaultCountry: string }> = {
  GBP: { symbol: '£', label: 'GBP (£)', flag: '🇬🇧', defaultRate: 1, defaultCountry: 'gb' },
  USD: { symbol: '$', label: 'USD ($)', flag: '🇺🇸', defaultRate: 1.28, defaultCountry: 'us' },
  EUR: { symbol: '€', label: 'EUR (€)', flag: '🇪🇺', defaultRate: 1.17, defaultCountry: 'eu' },
  NGN: { symbol: '₦', label: 'NGN (₦)', flag: '🇳🇬', defaultRate: 2050, defaultCountry: 'ng' },
};

// Expanded currency symbol lookup for dynamic ingestion
const CURRENCY_SYMBOLS: Record<string, string> = {
  CHF: 'CHF ',
  CAD: 'CA$',
  AUD: 'AU$',
  JPY: '¥',
  CNY: '¥',
  INR: '₹',
  AED: 'AED ',
  LRD: 'L$',
};

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currency, setCurrencyState] = useState<CurrencyCode>('GBP');
  const [countryCode, setCountryCode] = useState<string>('gb');
  const [availableCurrencies, setAvailableCurrencies] = useState<Record<string, CurrencyDetails>>(DEFAULT_CURRENCIES);
  const [rates, setRates] = useState<Record<string, number>>({
    GBP: 1,
    NGN: 2050,
    USD: 1.28,
    EUR: 1.17,
  });
  const [loading, setLoading] = useState(true);

  // Manual currency change updates state and synced ISO flag country
  const setCurrency = (code: string) => {
    setCurrencyState(code as CurrencyCode);
    const targetDetails = availableCurrencies[code] as (CurrencyDetails & { defaultCountry?: string }) | undefined;
    const targetCountry = targetDetails?.defaultCountry || code.slice(0, 2).toLowerCase();

    setCountryCode(targetCountry);
    localStorage.setItem('walters_user_currency', code);
    localStorage.setItem('walters_user_country', targetCountry);
  };

  // 1. Fetch real-time exchange rates relative to GBP
  useEffect(() => {
    fetch('https://open.er-api.com/v6/latest/GBP')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.rates) {
          setRates(data.rates);
        }
      })
      .catch((err) => {
        console.error('Failed to fetch real-time exchange rates:', err);
      });
  }, []);

  // 2. Dynamic IP Geolocation & Dynamic Currency/Country Ingestion
  useEffect(() => {
    const savedCurrency = localStorage.getItem('walters_user_currency');
    const savedCountry = localStorage.getItem('walters_user_country');

    if (savedCurrency) {
      setCurrencyState(savedCurrency as CurrencyCode);
      if (savedCountry) setCountryCode(savedCountry);
      setLoading(false);
      return;
    }

    fetch('https://ipapi.co/json/')
      .then((res) => res.json())
      .then((data) => {
        const detectedCurrency = data?.currency;
        const detectedCountry = data?.country_code?.toLowerCase();

        if (detectedCountry) {
          setCountryCode(detectedCountry);
        }

        if (detectedCurrency) {
          // Dynamically register unlisted local currencies (e.g. LRD, CHF)
          if (!DEFAULT_CURRENCIES[detectedCurrency]) {
            const dynamicSymbol = CURRENCY_SYMBOLS[detectedCurrency] || `${detectedCurrency} `;
            const dynamicDetails: CurrencyDetails & { defaultCountry: string } = {
              symbol: dynamicSymbol,
              label: `${detectedCurrency} (${dynamicSymbol.trim()})`,
              flag: detectedCountry || '🌐',
              defaultRate: rates[detectedCurrency] || 1,
              defaultCountry: detectedCountry || detectedCurrency.slice(0, 2).toLowerCase(),
            };

            setAvailableCurrencies((prev) => ({
              ...prev,
              [detectedCurrency]: dynamicDetails,
            }));
          }

          setCurrencyState(detectedCurrency as CurrencyCode);
        } else {
          setCurrencyState('GBP');
          setCountryCode('gb');
        }
      })
      .catch(() => {
        setCurrencyState('GBP');
        setCountryCode('gb');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [rates]);

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
      const symbol = availableCurrencies[currency]?.symbol || '£';

      if (currency === 'NGN') {
        return `${symbol}${Math.round(converted).toLocaleString('en-NG')}`;
      }

      return `${symbol}${converted.toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      })}`;
    },
    [currency, convertPrice, availableCurrencies]
  );

  const activeSymbol = useMemo(
    () => availableCurrencies[currency]?.symbol || '£',
    [currency, availableCurrencies]
  );

  const activeFlag = useMemo(
    () => availableCurrencies[currency]?.flag || '🇬🇧',
    [currency, availableCurrencies]
  );

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        countryCode,
        symbol: activeSymbol,
        flag: activeFlag,
        setCurrency: (code) => setCurrency(code as CurrencyCode),
        formatPrice,
        convertPrice,
        availableCurrencies: availableCurrencies as Record<CurrencyCode, CurrencyDetails>,
        loading,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};