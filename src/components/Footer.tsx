// src/components/Footer.tsx
import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-walters-navy text-white border-t border-white/10 pt-12 pb-10 font-sans">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        
        {/* MAIN CONTENT GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 pb-12 border-b border-white/10">
          
          {/* LEFT COLUMN: LOGO + BRAND + BIO + NEWSLETTER */}
          <div className="lg:col-span-6 space-y-6">
            <Link to="/" className="inline-flex items-center gap-2.5">
              <img 
                src="/favicon.svg" 
                alt="Walters Opticians Logo" 
                className="h-8 sm:h-9 w-auto object-contain shrink-0"
              />
              <span className="text-2xl sm:text-3xl font-normal font-serif tracking-tight text-white leading-none">
                WALTERS <span className="text-walters-gold font-normal">OPTICIANS</span>
              </span>
            </Link>

            <p className="text-neutral-300 text-xs sm:text-sm leading-relaxed max-w-md">
              Independent, family-run practices in Gainsborough & Lincoln. Dedicated to personal patient-first care, advanced eye testing, and precision optical dispensing.
            </p>

            {/* NEWSLETTER FORM */}
            <div className="space-y-3 pt-2">
              <p className="text-xs font-bold text-white font-serif tracking-wide">
                Subscribe to Newsletter
              </p>
              
              <form onSubmit={(e) => e.preventDefault()} className="flex items-center bg-white/5 border border-white/15 rounded-full p-1.5 max-w-md focus-within:border-[#1B75BC] transition-colors">
                <div className="pl-4 pr-2 text-neutral-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                </div>
                <input
                  type="email"
                  placeholder="Enter your email address"
                  className="grow bg-transparent text-xs text-white placeholder:text-neutral-400 focus:outline-hidden px-2"
                  required
                />
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-walters-gold hover:bg-[#1B75BC] text-walters-navy hover:text-white font-bold text-xs uppercase tracking-wider rounded-full transition-all duration-300 shrink-0 cursor-pointer shadow-xs"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </div>

          {/* RIGHT COLUMNS: NAVIGATION LINKS */}
          <div className="lg:col-span-6 grid grid-cols-2 sm:grid-cols-3 gap-8">
            
            {/* COLUMN 1: CATEGORIES */}
            <div className="space-y-4">
              <h4 className="font-serif font-bold text-white text-base tracking-tight">
                Categories
              </h4>
              <ul className="space-y-2.5 text-xs text-neutral-300">
                <li>
                  <Link to="/catalog?category=glasses" className="hover:text-walters-gold transition-colors">
                    Glasses
                  </Link>
                </li>
                <li>
                  <Link to="/catalog?category=sunglasses" className="hover:text-walters-gold transition-colors">
                    Sunglasses
                  </Link>
                </li>
                <li>
                  <Link to="/catalog?sort=top_sales" className="hover:text-walters-gold transition-colors">
                    Best Sellers
                  </Link>
                </li>
                <li>
                  <Link to="/catalog" className="hover:text-walters-gold transition-colors">
                    All Collections
                  </Link>
                </li>
                <li>
                  <Link to="/catalog?top_only=true" className="hover:text-walters-gold transition-colors">
                    Top Brands
                  </Link>
                </li>
              </ul>
            </div>

            {/* COLUMN 2: LEGAL */}
            <div className="space-y-4">
              <h4 className="font-serif font-bold text-white text-base tracking-tight">
                Legal
              </h4>
              <ul className="space-y-2.5 text-xs text-neutral-300">
                <li>
                  <Link to="/privacy" className="hover:text-walters-gold transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="hover:text-walters-gold transition-colors">
                    Terms & Conditions
                  </Link>
                </li>
                <li>
                  <Link to="/returns" className="hover:text-walters-gold transition-colors">
                    Refund Policy
                  </Link>
                </li>
              </ul>
            </div>

            {/* COLUMN 3: HELP */}
            <div className="space-y-4">
              <h4 className="font-serif font-bold text-white text-base tracking-tight">
                Help
              </h4>
              <ul className="space-y-2.5 text-xs text-neutral-300">
                <li>
                  <a href="tel:+4401427616506" className="hover:text-walters-gold transition-colors">
                    Book Eye Test
                  </a>
                </li>
                <li>
                  <Link to="/profile" className="hover:text-walters-gold transition-colors">
                    Track Order
                  </Link>
                </li>
                <li>
                  <a href="tel:+4401427616506" className="hover:text-walters-gold transition-colors">
                    Contact Us
                  </a>
                </li>
              </ul>
            </div>

          </div>

        </div>

        {/* BOTTOM STRIP WITH LIVE SOCIAL LINKS */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-neutral-400">
          <p>© {new Date().getFullYear()} Copyright by Walters Opticians. All Rights Reserved</p>

          <div className="flex flex-wrap items-center gap-2">
            <a
              href="https://www.facebook.com/waltersopticians/"
              target="_blank"
              rel="noreferrer"
              className="px-4 py-1.5 bg-white/5 hover:bg-[#1B75BC] hover:text-white border border-white/10 rounded-full text-xs text-neutral-300 transition-colors"
            >
              Facebook
            </a>
            <a
              href="https://www.instagram.com/waltersopticians/"
              target="_blank"
              rel="noreferrer"
              className="px-4 py-1.5 bg-white/5 hover:bg-[#1B75BC] hover:text-white border border-white/10 rounded-full text-xs text-neutral-300 transition-colors"
            >
              Instagram
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
};