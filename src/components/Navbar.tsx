// src/components/Navbar.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, User, Phone, Menu, X, Globe } from 'lucide-react';
import { useCart } from '../hooks/useCart';
import { useCurrency } from '../hooks/useCurrency';
import type { CurrencyCode } from '../context/CurrencyContext';

export const Navbar: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [animateBadge, setAnimateBadge] = useState(false);

  const { cartItems } = useCart();
  const { currency, setCurrency, availableCurrencies } = useCurrency();

  const totalItemCount = cartItems.reduce((total, item) => total + (item.quantity || 1), 0);
  const prevCountRef = useRef(totalItemCount);

  useEffect(() => {
    if (totalItemCount > prevCountRef.current) {
      const animationFrame = requestAnimationFrame(() => {
        setAnimateBadge(true);
      });

      const timer = setTimeout(() => {
        setAnimateBadge(false);
      }, 300);

      prevCountRef.current = totalItemCount;

      return () => {
        cancelAnimationFrame(animationFrame);
        clearTimeout(timer);
      };
    }
    prevCountRef.current = totalItemCount;
  }, [totalItemCount]);

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrency(e.target.value as CurrencyCode);
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-walters-cream font-sans text-walters-charcoal shadow-[0_2px_8px_rgba(26,26,26,0.08)]">
      <div className="w-full px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
        
        {/* LEFT SECTION */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          <div className="flex md:hidden items-center space-x-1 text-xs text-walters-slate opacity-70">
            <Globe className="w-3.5 h-3.5 text-walters-navy" />
            <select
              value={currency}
              onChange={handleCurrencyChange}
              className="bg-transparent border-none text-xs font-medium text-walters-charcoal focus:outline-none cursor-pointer"
            >
              {Object.entries(availableCurrencies).map(([code, details]) => (
                <option key={code} value={code}>
                  {details.symbol}
                </option>
              ))}
            </select>
          </div>

          <Link to="/" className="flex items-center">
            <span className="font-serif text-lg sm:text-xl font-bold tracking-[0.15em] uppercase text-walters-navy transition-colors duration-200 hover:text-walters-gold">
              WALTERS OPTICIANS
            </span>
          </Link>

          {/* Divider bar placed between logo and phone */}
          <span className="hidden lg:inline-block text-walters-border">|</span>

          {/* Phone Number */}
          <a
            href="tel:+441427616506"
            className="hidden lg:flex items-center space-x-1.5 text-xs font-semibold text-walters-slate opacity-60 hover:opacity-100 transition-opacity duration-200"
          >
            <Phone className="w-3.5 h-3.5 text-walters-navy" />
            <span>+44 (0)1427 616506</span>
          </a>

          {/* Categories Hamburger (Desktop Only, placed after the phone number) */}
          <button 
            type="button"
            className="hidden md:flex items-center justify-center text-walters-navy opacity-70 hover:opacity-100 hover:text-walters-gold transition-all duration-200 cursor-pointer ml-1"
            aria-label="Categories"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>

        {/* CENTER SECTION */}
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
          <Link to="/" className="text-walters-charcoal opacity-60 hover:opacity-90 transition-opacity duration-200 py-1">
            Home
          </Link>
          <Link to="/" className="text-walters-charcoal opacity-60 hover:opacity-90 transition-opacity duration-200 py-1">
            Frames
          </Link>
          <Link to="/" className="text-walters-charcoal opacity-60 hover:opacity-90 transition-opacity duration-200 py-1">
            Lenses
          </Link>
        </nav>

        {/* RIGHT SECTION */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          <Link
            to="/login"
            className="hidden sm:flex items-center space-x-1.5 text-sm font-medium text-walters-charcoal opacity-60 hover:opacity-90 transition-opacity duration-200 px-1 py-1"
          >
            <User className="w-4 h-4 text-walters-slate" />
            <span>Account</span>
          </Link>

          {/* Desktop Currency Switcher */}
          <div className="hidden md:flex items-center space-x-1 text-xs text-walters-slate opacity-70">
            <Globe className="w-3.5 h-3.5 text-walters-navy" />
            <select
              value={currency}
              onChange={handleCurrencyChange}
              className="bg-transparent border-none text-xs font-semibold text-walters-charcoal opacity-60 hover:opacity-100 focus:outline-none cursor-pointer pr-1 transition-opacity"
            >
              {Object.entries(availableCurrencies).map(([code, details]) => (
                <option key={code} value={code}>
                  {details.label}
                </option>
              ))}
            </select>
          </div>

          {/* Bag Button */}
          <Link
            to="/checkout"
            className="relative flex items-center space-x-2 bg-white text-[#0B132B] text-xs font-medium px-4 py-2 rounded-full cursor-pointer border border-[#E0DCD5] hover:border-[#0B132B] transition-colors duration-150"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-[#0B132B]" />
            <span>Bag</span>

            {/* Badge */}
            {totalItemCount > 0 && (
              <span
                className={`absolute -top-1.5 -right-1.5 bg-[#0B132B] text-white text-[10px] font-bold h-4 min-w-4 px-1 rounded-full border border-white flex items-center justify-center shadow-xs transition-transform duration-200 ${
                  animateBadge ? 'scale-125' : 'scale-100'
                }`}
              >
                {totalItemCount}
              </span>
            )}
          </Link>

          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-walters-navy focus:outline-none rounded-lg hover:bg-white/60"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* MOBILE OVERLAY MENU */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-walters-cream px-6 pt-2 pb-6 space-y-4 border-t border-walters-border/40">
          <nav className="flex flex-col space-y-3 font-sans text-base font-medium">
            <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="text-walters-charcoal opacity-60 hover:opacity-90 py-1">
              Home
            </Link>
            <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="text-walters-charcoal opacity-60 hover:opacity-90 py-1">
              Frames
            </Link>
            <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="text-walters-charcoal opacity-60 hover:opacity-90 py-1">
              Lenses
            </Link>
            <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="text-walters-charcoal opacity-60 hover:opacity-90 py-1 flex items-center space-x-2">
              <User className="w-4 h-4" />
              <span>Account</span>
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};