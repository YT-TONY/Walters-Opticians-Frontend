// src/components/Footer.tsx

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Mail, Phone, MapPin, CheckCircle2} from 'lucide-react';
import { toast } from 'sonner';

export const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setIsSubscribed(true);
      toast.success('Thank you for subscribing to Walters Opticians updates.');
      setEmail('');
      setTimeout(() => setIsSubscribed(false), 4000);
    }
  };

  return (
    <footer className="w-full bg-walters-navy text-white border-t border-white/10 pt-16 pb-12 font-sans relative overflow-hidden">
      {/* Background Ambient Glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-walters-gold/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        
        {/* MAIN CONTENT GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 pb-16 border-b border-white/10">
          
          {/* BRAND + NEWSLETTER (COLUMN 1-5) */}
          <div className="lg:col-span-5 space-y-7 pr-0 lg:pr-6">
            <Link to="/" className="inline-flex items-center gap-3 group">
              <img 
                src="/favicon.svg" 
                alt="Walters Opticians" 
                className="h-9 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
              />
              <span className="text-2xl sm:text-3xl font-serif tracking-tight text-white leading-none">
                WALTERS <span className="text-walters-gold font-normal">OPTICIANS</span>
              </span>
            </Link>

            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed font-light max-w-md">
              Independent, family-run practices in Gainsborough & Lincoln. Dedicated to personal patient-first care, advanced clinical eye testing, and bespoke optical dispensing.
            </p>

            {/* PRACTICE LOCATIONS QUICK PILLS */}
            <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-400">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/5 border border-white/10 rounded-full">
                <MapPin className="w-3 h-3 text-walters-gold" />
                <span>Gainsborough</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/5 border border-white/10 rounded-full">
                <MapPin className="w-3 h-3 text-walters-gold" />
                <span>North Hykeham</span>
              </span>
            </div>

            {/* APPLE HIG NEWSLETTER INPUT FORM */}
            <div className="space-y-3 pt-2">
              <label htmlFor="footer-email" className="text-xs font-semibold uppercase tracking-wider text-slate-300 block font-serif">
                Join Exclusive Privileges & Eye Care Updates
              </label>
              
              <form onSubmit={handleSubscribe} className="relative flex items-center max-w-md">
                <div className="relative w-full flex items-center bg-white/5 border border-white/15 rounded-full p-1.5 focus-within:border-walters-gold focus-within:ring-1 focus-within:ring-walters-gold/50 transition-all duration-300 shadow-inner">
                  <Mail className="w-4 h-4 text-slate-400 ml-3.5 shrink-0" />
                  <input
                    id="footer-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="w-full bg-transparent text-xs text-white placeholder:text-slate-500 focus:outline-none px-3 py-1.5 font-medium"
                    required
                  />
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-walters-gold hover:bg-amber-500 text-walters-navy font-bold text-xs uppercase tracking-wider rounded-full transition-all duration-300 shrink-0 cursor-pointer shadow-md hover:shadow-walters-gold/20 flex items-center space-x-1.5"
                  >
                    {isSubscribed ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-walters-navy" />
                        <span>Subscribed</span>
                      </>
                    ) : (
                      <span>Subscribe</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* NAVIGATION COLUMNS (COLUMN 6-12) */}
          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8 pt-2">
            
            {/* COLUMN 1: EYEWEAR */}
            <div className="space-y-4">
              <h4 className="font-serif font-bold text-white text-sm uppercase tracking-wider border-b border-white/10 pb-2">
                Eyewear
              </h4>
              <ul className="space-y-2 text-xs text-slate-300 font-medium">
                <li>
                  <Link to="/catalog?category=glasses" className="py-1 block hover:text-walters-gold hover:translate-x-1 transition-all duration-200">
                    Prescription Glasses
                  </Link>
                </li>
                <li>
                  <Link to="/catalog?category=sunglasses" className="py-1 block hover:text-walters-gold hover:translate-x-1 transition-all duration-200">
                    Designer Sunglasses
                  </Link>
                </li>
                <li>
                  <Link to="/catalog?category=contact_lenses" className="py-1 block hover:text-walters-gold hover:translate-x-1 transition-all duration-200">
                    Contact Lenses
                  </Link>
                </li>
                <li>
                  <Link to="/catalog?sort_by=popularity" className="py-1 block hover:text-walters-gold hover:translate-x-1 transition-all duration-200">
                    Best Sellers
                  </Link>
                </li>
                <li>
                  <Link to="/catalog?on_sale=true" className="py-1 block hover:text-rose-400 hover:translate-x-1 transition-all duration-200 font-semibold">
                    Special Offers & Sale
                  </Link>
                </li>
              </ul>
            </div>

            {/* COLUMN 2: LEGAL & POLICIES */}
            <div className="space-y-4">
              <h4 className="font-serif font-bold text-white text-sm uppercase tracking-wider border-b border-white/10 pb-2">
                Legal
              </h4>
              <ul className="space-y-2 text-xs text-slate-300 font-medium">
                <li>
                  <Link to="/privacy" className="py-1 block hover:text-walters-gold hover:translate-x-1 transition-all duration-200">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="py-1 block hover:text-walters-gold hover:translate-x-1 transition-all duration-200">
                    Terms & Conditions
                  </Link>
                </li>
                <li>
                  <Link to="/returns" className="py-1 block hover:text-walters-gold hover:translate-x-1 transition-all duration-200">
                    Returns & Refunds
                  </Link>
                </li>
              </ul>
            </div>

            {/* COLUMN 3: CLINICAL HELP */}
            <div className="space-y-4">
              <h4 className="font-serif font-bold text-white text-sm uppercase tracking-wider border-b border-white/10 pb-2">
                Services
              </h4>
              <ul className="space-y-2 text-xs text-slate-300 font-medium">
                <li>
                  <a href="tel:+4401427616506" className="py-1 inline-flex items-center space-x-1.5 hover:text-walters-gold transition-colors">
                    <Phone className="w-3 h-3 text-walters-gold" />
                    <span>Book Eye Examination</span>
                  </a>
                </li>
                <li>
                  <Link to="/profile" className="py-1 block hover:text-walters-gold hover:translate-x-1 transition-all duration-200">
                    Track Prescription Order
                  </Link>
                </li>
                <li>
                  <a href="tel:+4401427616506" className="py-1 block hover:text-walters-gold hover:translate-x-1 transition-all duration-200">
                    Contact Practice Team
                  </a>
                </li>
              </ul>
            </div>

          </div>

        </div>

        {/* BOTTOM STRIP: COPYRIGHT + SOCIAL + AI BADGE */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} Walters Opticians. All Rights Reserved.</p>

          <div className="flex items-center space-x-6">
            {/* SOCIAL BUTTONS */}
            <div className="flex items-center space-x-2">
              <a
                href="https://www.facebook.com/waltersopticians/"
                target="_blank"
                rel="noreferrer"
                className="px-4 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-full text-xs text-slate-200 transition-all flex items-center space-x-1 group"
              >
                <span>Facebook</span>
                <ArrowUpRight className="w-3 h-3 text-slate-400 group-hover:text-white transition-colors" />
              </a>
              <a
                href="https://www.instagram.com/waltersopticians/"
                target="_blank"
                rel="noreferrer"
                className="px-4 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-full text-xs text-slate-200 transition-all flex items-center space-x-1 group"
              >
                <span>Instagram</span>
                <ArrowUpRight className="w-3 h-3 text-slate-400 group-hover:text-white transition-colors" />
              </a>
            </div>

          </div>
        </div>

      </div>
    </footer>
  );
};