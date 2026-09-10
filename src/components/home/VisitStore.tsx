// src/components/home/VisitStore.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, ArrowRight, CheckCircle2 } from 'lucide-react';

const STORE_SLIDES = [
  {
    id: 1,
    url: '/IMAGES/HOMEPAGE/STORE_INTERIOR.png',
    title: 'Gainsborough Practice',
    address: 'Gainsborough & Lincoln, UK',
  },
  {
    id: 2,
    url: '/IMAGES/HOMEPAGE/STORE_DISPLAYS.png',
    title: 'Precision Ophthalmic Lab',
    address: 'On-Site Spectacle Manufacturing',
  },
  {
    id: 3,
    url: '/IMAGES/HOMEPAGE/STORE_CLINIC.png',
    title: 'Boutique Frame Suite',
    address: 'Budget to Luxury Collections',
  },
];

const PRACTICE_SERVICES = [
  'Comprehensive eye testing for all ages',
  'On-site laboratory for fast spectacle glazing',
  'Specialist contact lens fitting & care',
  'Digital retinal photography & diagnostics',
];

export const VisitStore: React.FC = () => {
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % STORE_SLIDES.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="w-full bg-neutral-100/80 py-16 sm:py-20 border-y border-neutral-200/60">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* LEFT: EDITORIAL COPY */}
          <div className="lg:col-span-6 space-y-6">
            <h2 className="text-4xl sm:text-5xl font-extrabold text-walters-navy tracking-tight font-serif leading-tight">
              Visit <span className="font-serif italic text-[#1B75BC]">Our Store</span>
            </h2>

            <p className="text-walters-slate/80 text-xs sm:text-sm leading-relaxed max-w-lg">
              Walters Opticians is an independent, family-run practice located in Gainsborough & Lincoln. We combine personal patient-first care with an extensive frame selection and on-site optical lab.
            </p>

            {/* STRUCTURED SERVICES LIST */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              {PRACTICE_SERVICES.map((service) => (
                <div key={service} className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-walters-gold shrink-0 mt-0.5" />
                  <span className="text-xs text-walters-navy font-medium leading-snug">
                    {service}
                  </span>
                </div>
              ))}
            </div>

            {/* ELECTRIC BLUE CTA BUTTON */}
            <div className="pt-3">
              <Link
                to="/catalog"
                className="inline-flex items-center gap-2.5 px-8 py-3.5 bg-[#1B75BC] hover:bg-walters-navy text-white font-bold text-xs uppercase tracking-wider rounded-full shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 cursor-pointer"
              >
                <span>Find Our Shop</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* RIGHT: PORTRAIT CAROUSEL WITH FAINT MATTED LAYER */}
          <div className="lg:col-span-6 flex justify-center">
            {/* THIN FAINT BLUE/GRAY MAT LAYER (20% OPACITY) */}
            <div className="p-2.5 sm:p-3 bg-[#1B75BC]/10 rounded-3xl border border-[#1B75BC]/20 w-full max-w-md">
              
              {/* TALL PORTRAIT SLIDER CONTAINER */}
              <div className="relative w-full h-120 sm:h-130 rounded-2xl overflow-hidden bg-neutral-900 group">
                {STORE_SLIDES.map((slide, idx) => (
                  <div
                    key={slide.id}
                    className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                      idx === activeSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
                    }`}
                  >
                    <img
                      src={slide.url}
                      alt={slide.title}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-1000 ease-out"
                    />
                    
                    {/* GRADIENT OVERLAY */}
                    <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

                    {/* OVERLAID LOCATION BADGE - FROSTY GLASS (40% OPACITY) */}
                    <div className="absolute bottom-5 left-5 right-5 z-20">
                      <div className="inline-flex items-center gap-2.5 bg-black/40 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/20 text-white shadow-lg">
                        <div className="p-1.5 rounded-full bg-white/20 text-white">
                          <MapPin className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="text-xs font-extrabold tracking-tight text-white">{slide.title}</p>
                          <p className="text-[10px] text-neutral-200">{slide.address}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* SLIDE INDICATORS */}
                <div className="absolute top-4 right-4 z-30 flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20">
                  {STORE_SLIDES.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveSlide(idx)}
                      className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                        idx === activeSlide ? 'w-5 bg-walters-gold' : 'w-1.5 bg-white/50 hover:bg-white'
                      }`}
                      aria-label={`Go to slide ${idx + 1}`}
                    />
                  ))}
                </div>

              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};