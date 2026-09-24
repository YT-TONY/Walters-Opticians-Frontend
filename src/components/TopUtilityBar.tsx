//src/components/TopUtilityBar.tsx

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Phone, Truck, Question, CaretDown } from '@phosphor-icons/react';
import { useCurrency } from '../hooks/useCurrency';
import { apiClient } from '../api/client';

export const TopUtilityBar: React.FC = () => {
  const { currency, countryCode, setCurrency, availableCurrencies } = useCurrency();
  const [promoText, setPromoText] = useState<string>(
    'Complimentary UK Express Shipping & Lens Anti-Reflective Coating Included'
  );
  const [isPromoActive, setIsPromoActive] = useState<boolean>(true);

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

  return (
    <div className="w-full bg-walters-navy backdrop-blur-md text-white text-[11px] font-sans py-1.5 px-4 sm:px-6 lg:px-8 border-b border-white/10 antialiased transition-all duration-300">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2">
        
        {/* Left/Center Promo Text */}
        <div className="flex items-center space-x-2 text-center md:text-left overflow-hidden">
          {isPromoActive && promoText && (
            <span className="truncate text-white/90 font-light tracking-wide text-[11px]">
              {promoText}
            </span>
          )}
        </div>

        {/* Right Actions & Apple HIG Selector */}
        <div className="flex items-center space-x-3 sm:space-x-4 text-white/80 font-normal shrink-0">
          <a href="tel:+441427616506" className="flex items-center space-x-1.5 hover:text-white transition-colors">
            <Phone size={12} weight="fill" className="text-[#1B75BC] shrink-0" />
            <span className="font-mono text-[10.5px]">+44 (0)1427 616506</span>
          </a>

          <span className="text-white/20">|</span>

          <Link to="/profile?tab=orders" className="flex items-center space-x-1.5 hover:text-white transition-colors">
            <Truck size={13} weight="fill" className="text-white/80 shrink-0" />
            <span>Track Order</span>
          </Link>

          <span className="text-white/20">|</span>

          <Link to="/profile?tab=support" className="flex items-center space-x-1.5 hover:text-white transition-colors">
            <Question size={13} weight="fill" className="text-white/80 shrink-0" />
            <span>Help</span>
          </Link>

          <span className="text-white/20">|</span>

          {/* iOS-Inspired Selector Pill */}
          <div className="relative inline-flex items-center space-x-1.5 bg-white/10 hover:bg-white/15 px-2.5 py-1 rounded-full border border-white/20 transition-all cursor-pointer">
            <img
              src={`https://flagcdn.com/${countryCode || 'gb'}.svg`}
              alt={`${currency} Flag`}
              className="w-3.5 h-3.5 rounded-full object-cover shrink-0 border border-white/40 shadow-2xs"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://flagcdn.com/gb.svg';
              }}
            />
            
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="bg-transparent text-white font-semibold text-[11px] focus:outline-none cursor-pointer appearance-none pr-3"
            >
              {Object.keys(availableCurrencies).map((code) => (
                <option key={code} value={code} className="bg-[#0B132B] text-white py-1">
                  {code} ({availableCurrencies[code]?.symbol?.trim() || code})
                </option>
              ))}
            </select>

            <CaretDown size={9} weight="bold" className="text-white/80 absolute right-2 pointer-events-none" />
          </div>

        </div>

      </div>
    </div>
  );
};