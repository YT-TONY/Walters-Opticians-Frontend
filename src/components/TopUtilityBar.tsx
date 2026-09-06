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

  useEffect(() => {
    let isMounted = true;
    apiClient
      .get('/orders/settings')
      .then((res) => {
        if (!isMounted || !res.data) return;
        const rates = res.data.rates || res.data;
        if (rates.promo_banner_text !== undefined) setPromoText(String(rates.promo_banner_text));
        if (rates.promo_banner_active !== undefined) {
          setIsPromoActive(Boolean(rates.promo_banner_active));
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  const getCountryCode = (currCode: string): string => {
    if (currCode === 'EUR' && userCountryCode) return userCountryCode;
    return CURRENCY_TO_COUNTRY[currCode] || userCountryCode || currCode.slice(0, 2).toLowerCase();
  };

  const activeCountryCode = getCountryCode(currency);

  return (
    <div className="w-full bg-navy text-white text-[11px] font-sans py-1 px-4 sm:px-6 lg:px-8 border-b border-white/10 antialiased">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-1.5">
        
        {/* Left/Center Promo Text */}
        <div className="flex items-center space-x-2 text-center md:text-left overflow-hidden">
          {isPromoActive && promoText && (
            <span className="truncate text-white/90 font-normal tracking-wide text-[11px]">
              {promoText}
            </span>
          )}
        </div>

        {/* Right Actions */}
        <div className="flex items-center space-x-3 sm:space-x-4 text-white/80 font-normal shrink-0">
          <a href="tel:+441427616506" className="flex items-center space-x-1 hover:text-white transition-colors">
            <Phone size={12} weight="fill" className="text-[#1B75BC] shrink-0" />
            <span>+44 (0)1427 616506</span>
          </a>

          <span className="text-white/20">|</span>

          <Link to="/profile?tab=orders" className="flex items-center space-x-1 hover:text-white transition-colors">
            <Truck size={13} weight="fill" className="text-white/80 shrink-0" />
            <span>Track Order</span>
          </Link>

          <span className="text-white/20">|</span>

          <Link to="/profile?tab=support" className="flex items-center space-x-1 hover:text-white transition-colors">
            <Question size={13} weight="fill" className="text-white/80 shrink-0" />
            <span>Help</span>
          </Link>

          <span className="text-white/20">|</span>

          {/* Currency Dropdown */}
          <div className="relative inline-flex items-center space-x-1.5 bg-white/10 pl-2 pr-5 py-0.5 rounded border border-white/15">
            <img
              src={`https://flagcdn.com/${activeCountryCode}.svg`}
              alt={`${currency} Flag`}
              className="w-3.5 h-3.5 rounded-full object-cover shrink-0 border border-white/30"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://flagcdn.com/gb.svg';
              }}
            />
            
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
              className="bg-transparent text-white font-semibold text-[11px] focus:outline-none cursor-pointer appearance-none"
            >
              {Object.keys(availableCurrencies).map((code) => (
                <option key={code} value={code} className="bg-navy text-white">
                  {code} ({availableCurrencies[code as CurrencyCode]?.symbol?.trim() || code})
                </option>
              ))}
            </select>

            <CaretDown size={9} weight="bold" className="text-white/80 absolute right-1.5 pointer-events-none" />
          </div>

        </div>

      </div>
    </div>
  );
};