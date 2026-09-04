// src/components/TopUtilityBar.tsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Phone, Truck, Question, CaretDown } from '@phosphor-icons/react';
import { useCurrency } from '../hooks/useCurrency';
import { apiClient } from '../api/client';
import type { CurrencyCode } from '../context/CurrencyContext';

const CURRENCY_TO_COUNTRY: Record<string, string> = {
  GBP: 'gb',
  USD: 'us',
  EUR: 'nl',
  NGN: 'ng',
  CHF: 'ch',
  CAD: 'ca',
  AUD: 'au',
  LRD: 'lr',
  JPY: 'jp',
  CNY: 'cn',
  INR: 'in',
  AED: 'ae',
};

export const TopUtilityBar: React.FC = () => {
  const { currency, setCurrency, availableCurrencies } = useCurrency();
  const [promoText, setPromoText] = useState<string>(
    'Complimentary UK Express Shipping & Lens Anti-Reflective Coating Included'
  );
  const [isPromoActive, setIsPromoActive] = useState<boolean>(true);
  const [userCountryCode, setUserCountryCode] = useState<string>('nl');

  // 1. Detect exact user country IP code on mount
  useEffect(() => {
    fetch('https://ipapi.co/json/')
      .then((res) => res.json())
      .then((data) => {
        if (data?.country_code) {
          setUserCountryCode(data.country_code.toLowerCase());
        }
      })
      .catch(() => {});
  }, []);

  // 2. Fetch public store settings (No admin auth required)
  useEffect(() => {
    let isMounted = true;

    apiClient
      .get('/orders/settings')
      .then((res) => {
        if (!isMounted || !res.data) return;

        const rates = res.data.rates || res.data;

        if (rates.promo_banner_text !== undefined && rates.promo_banner_text !== null) {
          setPromoText(String(rates.promo_banner_text));
        }

        if (rates.promo_banner_active !== undefined && rates.promo_banner_active !== null) {
          const isActive =
            typeof rates.promo_banner_active === 'boolean'
              ? rates.promo_banner_active
              : String(rates.promo_banner_active).toLowerCase() === 'true';
          setIsPromoActive(isActive);
        }
      })
      .catch((err) => {
        console.error('Failed to load public store promo settings:', err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Resolve ISO 2-letter country code for FlagCDN
  const getCountryCode = (currCode: string): string => {
    if (currCode === 'EUR' && userCountryCode) {
      return userCountryCode;
    }
    return CURRENCY_TO_COUNTRY[currCode] || userCountryCode || currCode.slice(0, 2).toLowerCase();
  };

  const activeCountryCode = getCountryCode(currency);

  return (
    <div className="w-full bg-navy text-white text-[11px] font-sans py-2 px-4 sm:px-6 lg:px-8 border-b border-white/10 antialiased">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2">
        
        {/* Left/Center: Promotional Text */}
        <div className="flex items-center space-x-2 text-center md:text-left overflow-hidden">
          {isPromoActive && promoText && (
            <span className="truncate text-white font-normal tracking-wide">
              {promoText}
            </span>
          )}
        </div>

        {/* Right: Solid Phosphor Icons & Circular FlagCDN Badge */}
        <div className="flex items-center space-x-4 sm:space-x-5 text-white/90 font-normal shrink-0">
          
          <a href="tel:+441427616506" className="flex items-center space-x-1.5 hover:text-white transition-colors">
            <Phone size={15} weight="fill" className="text-white shrink-0" />
            <span>+44 (0)1427 616506</span>
          </a>

          <span className="text-white/20">|</span>

          <Link to="/profile?tab=orders" className="flex items-center space-x-1.5 hover:text-white transition-colors">
            <Truck size={15} weight="fill" className="text-white shrink-0" />
            <span>Track Order</span>
          </Link>

          <span className="text-white/20">|</span>

          <Link to="/profile?tab=support" className="flex items-center space-x-1.5 hover:text-white transition-colors">
            <Question size={15} weight="fill" className="text-white shrink-0" />
            <span>Help</span>
          </Link>

          <span className="text-white/20">|</span>

          {/* Circular SVG Flag Badge + Currency Selector */}
          <div className="relative inline-flex items-center space-x-2 bg-white/10 pl-2 pr-6 py-1 rounded-md border border-white/15">
            <img
              src={`https://flagcdn.com/${activeCountryCode}.svg`}
              alt={`${currency} Flag`}
              className="w-4 h-4 rounded-full object-cover shrink-0 border border-white/30 shadow-2xs"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://flagcdn.com/gb.svg';
              }}
            />
            
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
              className="bg-transparent text-white font-semibold text-[11px] focus:outline-none cursor-pointer appearance-none"
            >
              {Object.keys(availableCurrencies).map((code) => {
                const details = availableCurrencies[code as CurrencyCode];
                return (
                  <option key={code} value={code} className="bg-navy text-white">
                    {code} ({details?.symbol?.trim() || code})
                  </option>
                );
              })}
            </select>

            <CaretDown size={10} weight="bold" className="text-white/80 absolute right-2 pointer-events-none" />
          </div>

        </div>

      </div>
    </div>
  );
};