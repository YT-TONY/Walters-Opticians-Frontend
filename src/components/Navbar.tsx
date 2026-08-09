// src/components/Navbar.tsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, User, Phone, Menu, X, Globe } from 'lucide-react';

export const Navbar: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currency, setCurrency] = useState('GBP');

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrency(e.target.value);
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-walters-cream font-sans text-walters-charcoal shadow-[0_2px_8px_rgba(26,26,26,0.30)]">
      <div className="w-full px-4 sm:px-6 lg:px-8 h-[8vh] min-h-15 flex items-center justify-center gap-50">
        
        {/* LEFT SECTION: Brand Logo & Phone Number */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          
          {/* Mobile Currency Switcher */}
          <div className="flex md:hidden items-center space-x-1 text-xs text-walters-slate opacity-70">
            <Globe className="w-3.5 h-3.5" />
            <select
              value={currency}
              onChange={handleCurrencyChange}
              className="bg-transparent border-none text-xs font-medium text-walters-charcoal focus:outline-none cursor-pointer"
            >
              <option value="GBP">£</option>
              <option value="USD">$</option>
              <option value="EUR">€</option>
            </select>
          </div>

          {/* Text Brand Title */}
          <Link to="/" className="flex items-center">
            <span className="font-serif text-lg sm:text-xl font-bold tracking-[0.15em] uppercase text-walters-navy transition-colors duration-200 hover:text-walters-gold">
              WALTERS OPTICIANS
            </span>
          </Link>

          <span className="hidden lg:inline-block text-walters-border">|</span>

          {/* Desktop Phone Number */}
          <a
            href="tel:+441427616506"
            className="hidden lg:flex items-center space-x-1.5 text-xs font-semibold text-walters-slate opacity-60 hover:opacity-100 transition-opacity duration-200"
          >
            <Phone className="w-3.5 h-3.5 text-walters-navy" />
            <span>+44 (0)1427 616506</span>
          </a>
        </div>

        {/* CENTER SECTION: Navigation Links */}
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
          <Link
            to="/"
            className="text-walters-charcoal opacity-60 hover:opacity-90 transition-opacity duration-200 py-1"
          >
            Home
          </Link>
          <Link
            to="/frames"
            className="text-walters-charcoal opacity-60 hover:opacity-90 transition-opacity duration-200 py-1"
          >
            Frames
          </Link>
          <Link
            to="/lenses"
            className="text-walters-charcoal opacity-60 hover:opacity-90 transition-opacity duration-200 py-1"
          >
            Lenses
          </Link>
        </nav>

        {/* RIGHT SECTION: Account + Currency + Bag Button */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          
          {/* Account Link */}
          <Link
            to="/login"
            className="hidden sm:flex items-center space-x-1.5 text-sm font-medium text-walters-charcoal opacity-60 hover:opacity-90 transition-opacity duration-200 px-1 py-1"
          >
            <User className="w-4 h-4 text-walters-slate" />
            <span>Account</span>
          </Link>

          {/* Desktop Currency Switcher */}
          <div className="hidden md:flex items-center space-x-1 text-xs text-walters-slate opacity-70">
            <Globe className="w-3.5 h-3.5" />
            <select
              value={currency}
              onChange={handleCurrencyChange}
              className="bg-transparent border-none text-xs font-semibold text-walters-charcoal opacity-60 hover:opacity-100 focus:outline-none cursor-pointer pr-1 transition-opacity"
            >
              <option value="GBP">GBP (£)</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
            </select>
          </div>

          {/* Bag Button: Seamless Hover Navy Border */}
          <Link
            to="/checkout"
            className="flex items-center space-x-2 bg-white text-walters-navy text-xs font-semibold px-4 py-2 rounded-full cursor-pointer transition-all duration-200 border border-walters-navy/0 hover:border-walters-navy active:border-transparent focus:outline-none"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-walters-navy" />
            <span>Bag</span>
          </Link>

          {/* Mobile Hamburger Toggle */}
          <button
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
        <div className="md:hidden bg-walters-cream px-6 pt-2 pb-6 space-y-4">
          <nav className="flex flex-col space-y-3 font-sans text-base font-medium">
            <Link
              to="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-walters-charcoal opacity-60 hover:opacity-90 transition-opacity py-1"
            >
              Home
            </Link>
            <Link
              to="/frames"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-walters-charcoal opacity-60 hover:opacity-90 transition-opacity py-1"
            >
              Frames
            </Link>
            <Link
              to="/lenses"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-walters-charcoal opacity-60 hover:opacity-90 transition-opacity py-1"
            >
              Lenses
            </Link>
            <Link
              to="/login"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-walters-charcoal opacity-60 hover:opacity-90 transition-opacity py-1 flex items-center space-x-2"
            >
              <User className="w-4 h-4" />
              <span>Account</span>
            </Link>
          </nav>

          <div className="pt-4 border-t border-walters-border/60 space-y-3">
            <a
              href="tel:+441427616506"
              className="flex items-center space-x-2 text-xs font-semibold text-walters-slate hover:text-walters-navy"
            >
              <Phone className="w-4 h-4 text-walters-navy" />
              <span>+44 (0)1427 616506</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
};