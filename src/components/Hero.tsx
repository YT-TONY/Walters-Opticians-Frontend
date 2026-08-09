// src/components/Hero.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import heroImage from '../assets/hero-frames (2).jpg';

export const Hero: React.FC = () => {
  return (
    <section className="relative w-full min-h-[90vh] bg-walters-navy text-white overflow-hidden flex items-center py-12 lg:py-16">
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* LEFT COLUMN: Text Content */}
          <div className="lg:col-span-6 space-y-8">
            {/* Tagline */}
            <span className="text-xs sm:text-sm font-semibold tracking-[0.25em] uppercase text-walters-gold block">
              AUTUMN COLLECTION
            </span>

            {/* Main Heading */}
            <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl font-normal leading-[1.1] tracking-tight">
              Frames worth <br className="hidden sm:inline" />
              <span className="text-walters-gold">looking twice</span> at.
            </h1>

            {/* Subtext Paragraph */}
            <p className="text-walters-cream/80 text-base sm:text-lg font-light leading-relaxed max-w-xl">
              Italian acetate and titanium frames, hand-finished in small runs.
              Prescription lenses and shipping are included in every price.
            </p>

            {/* CTA Button & Details */}
            <div className="pt-4 flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-8">
              <Link
                to="/frames"
                className="bg-walters-gold text-walters-navy font-semibold text-base px-9 py-4 rounded-full opacity-100 hover:opacity-70 transition-opacity duration-200 shadow-xl"
              >
                Shop the collection
              </Link>
              <span className="text-sm text-walters-cream/70 font-light">
                From £168, lenses included
              </span>
            </div>
          </div>

          {/* RIGHT COLUMN: Model/Product Image Card */}
          <div className="lg:col-span-6 flex justify-center lg:justify-end items-center">
            <div className="relative w-full max-w-md lg:max-w-lg rounded-2xl overflow-hidden shadow-2xl border border-white/10 max-h-[75vh]">
              <img
                src={heroImage}
                alt="Walters Opticians Autumn Collection Eyewear"
                className="w-full h-full object-cover aspect-4/5"
              />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};