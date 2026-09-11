// src/components/Navbar.tsx
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ShoppingBag, 
  User, 
  Menu, 
  X, 
  Search, 
  ChevronRight, 
  Shield, 
  LogOut, 
  Heart, 
  ChevronDown,
  Package,
  History,
  TrendingUp,
  Trash2,
  HelpCircle
} from 'lucide-react';

import { useCart } from '../hooks/useCart';
import { useCategories } from '../hooks/useCategories';
import { useAuth } from '../hooks/useAuth';
import { MegaMenu } from './megamenu/MegaMenu';
import { apiClient } from '../api/client';
import type { Brand } from '../context/Category';

const FALLBACK_BRANDS = [
  'Ray-Ban',
  'Tiffany & Co.',
  'Oakley',
  'Gucci',
  'Prada',
  'Tom Ford',
  'Persol',
  'Versace',
  'Burberry',
  'Chanel',
  'Dior',
  'Cartier',
  'Bottega Veneta',
  'Bulgari',
  'Calvin Klein',
  'Dolce & Gabbana',
  'Emporio Armani',
  'Hugo Boss',
  'Jimmy Choo',
  'Lacoste',
  'Marc Jacobs',
  'Michael Kors',
  'Nike',
  'Polo Ralph Lauren',
  'Saint Laurent',
  'Ted Baker'
];

const GENERIC_OPTICAL_TYPES = [
  'Aviator',
  'Wayfarer',
  'Cat Eye',
  'Round Frames',
  'Square Frames',
  'Titanium Frames',
  'Blue Light Lenses',
  'Single Vision',
  'Varifocal Lenses',
  'Reading Glasses',
  'Polarized Sunglasses'
];

const TRENDING_INITIAL = [
  'Ray-Ban Aviator',
  'Titanium Frames',
  'Blue Light Lenses',
  'Designer Sunglasses',
  'Reading Glasses'
];

// Strip non-alphanumeric characters ("ray ban" -> "rayban")
const normalizeStr = (str: string) => str.toLowerCase().replace(/[^a-z0-9]/g, '');

// Levenshtein Distance matrix calculation
const getLevenshteinDistance = (a: string, b: string): number => {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;

  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[b.length][a.length];
};

export const Navbar: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [activeCategoryId, setActiveCategoryId] = useState<number | null>(null);
  const [animateBadge, setAnimateBadge] = useState(false);
  const [databaseBrands, setDatabaseBrands] = useState<Brand[]>([]);

  // Search Overlay States
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Lazy Initial State for LocalStorage History
  const [searchHistory, setSearchHistory] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('walters_search_history') || '[]');
    } catch {
      return [];
    }
  });

  const { cartItems, setIsDrawerOpen } = useCart();
  const { categories } = useCategories();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const totalItemCount = cartItems.reduce((total, item) => total + (item.quantity || 1), 0);
  const prevCountRef = useRef(totalItemCount);

  // COMPUTED DYNAMIC USER INITIAL FOR GMAIL-STYLE AVATAR
  const userInitial = useMemo(() => {
    if (user?.full_name?.trim()) {
      return user.full_name.trim().charAt(0).toUpperCase();
    }
    if (user?.email?.trim()) {
      return user.email.trim().charAt(0).toUpperCase();
    }
    return 'U';
  }, [user]);

  // FETCH ALL BRANDS FROM DATABASE API
  useEffect(() => {
    let isMounted = true;
    const fetchBrands = async () => {
      try {
        const response = await apiClient.get<Brand[]>('/categories/brands/all');
        if (isMounted && Array.isArray(response.data)) {
          setDatabaseBrands(response.data);
        }
      } catch (err) {
        console.error('Failed to fetch dynamic database brands for search', err);
      }
    };
    fetchBrands();

    return () => {
      isMounted = false;
    };
  }, []);

  // DYNAMIC SEARCH TERMS POOL (DB Brands + Categories + Subcategories + Fallbacks)
  const searchTermsIndex = useMemo(() => {
    const termSet = new Set<string>();

    // 1. Add Database Brands from API or Fallback List
    if (databaseBrands.length > 0) {
      databaseBrands.forEach((b) => {
        if (b.name) termSet.add(b.name);
      });
    } else {
      FALLBACK_BRANDS.forEach((b) => termSet.add(b));
    }

    // 2. Add Category and Subcategory Names from Context
    categories.forEach((cat) => {
      if (cat.name) termSet.add(cat.name);
      cat.subcategories?.forEach((sub) => {
        if (sub.name) termSet.add(sub.name);
        sub.brands?.forEach((b) => {
          if (b.name) termSet.add(b.name);
        });
      });
    });

    // 3. Add Generic Lens & Frame Descriptors
    GENERIC_OPTICAL_TYPES.forEach((type) => termSet.add(type));

    return Array.from(termSet);
  }, [databaseBrands, categories]);

  // ENHANCED LIVE SUGGESTIONS & FUZZY MATCHING (Token + Whole Word)
  const { autoSuggestions, didYouMean, isFuzzyResult } = useMemo(() => {
    const cleanQuery = normalizeStr(searchQuery);
    if (!cleanQuery) return { autoSuggestions: [], didYouMean: null, isFuzzyResult: false };

    // 1. Direct / Substring / Token Prefix Matches
    const exactMatches = searchTermsIndex.filter((term) => {
      const cleanTerm = normalizeStr(term);
      if (cleanTerm.includes(cleanQuery)) return true;

      // Check word tokens (e.g. query "aviator" matching "Ray-Ban Aviator")
      const words = term.toLowerCase().split(/[^a-z0-9]+/);
      return words.some((w) => w.startsWith(cleanQuery));
    });

    if (exactMatches.length > 0) {
      return { 
        autoSuggestions: exactMatches.slice(0, 8), 
        didYouMean: null, 
        isFuzzyResult: false 
      };
    }

    // 2. Fuzzy Matching if no direct match exists (e.g., "guchi" -> "Gucci")
    const queryTokens = searchQuery.toLowerCase().trim().split(/\s+/);
    const candidatesWithScores: { term: string; dist: number }[] = [];

    for (const term of searchTermsIndex) {
      const cleanTerm = normalizeStr(term);
      const fullDist = getLevenshteinDistance(cleanQuery, cleanTerm);

      // Token-by-token distance (compares "guchi" against "gucci" inside brand strings)
      const termTokens = term.toLowerCase().split(/[^a-z0-9]+/);
      let minTokenDist = Infinity;

      for (const qToken of queryTokens) {
        const cleanQToken = normalizeStr(qToken);
        if (!cleanQToken) continue;

        for (const tToken of termTokens) {
          const cleanTToken = normalizeStr(tToken);
          if (!cleanTToken) continue;

          const dist = getLevenshteinDistance(cleanQToken, cleanTToken);
          if (dist < minTokenDist) {
            minTokenDist = dist;
          }
        }
      }

      const effectiveDist = Math.min(fullDist, minTokenDist);
      const maxAllowedDist = Math.max(2, Math.floor(cleanQuery.length * 0.45));

      if (effectiveDist <= maxAllowedDist) {
        candidatesWithScores.push({ term, dist: effectiveDist });
      }
    }

    // Sort candidates by lowest edit distance
    candidatesWithScores.sort((a, b) => a.dist - b.dist);

    const fuzzySuggestions = candidatesWithScores.map((c) => c.term).slice(0, 6);
    const bestMatch = fuzzySuggestions.length > 0 ? fuzzySuggestions[0] : null;

    return {
      autoSuggestions: fuzzySuggestions,
      didYouMean: bestMatch,
      isFuzzyResult: fuzzySuggestions.length > 0
    };
  }, [searchQuery, searchTermsIndex]);

  // Badge animation trigger on cart add
  useEffect(() => {
    if (totalItemCount > prevCountRef.current) {
      const animationFrame = requestAnimationFrame(() => setAnimateBadge(true));
      const timer = setTimeout(() => setAnimateBadge(false), 300);
      prevCountRef.current = totalItemCount;
      return () => {
        cancelAnimationFrame(animationFrame);
        clearTimeout(timer);
      };
    }
    prevCountRef.current = totalItemCount;
  }, [totalItemCount]);

  // Click outside listener for dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const saveSearchTerm = (term: string) => {
    const cleanTerm = term.trim();
    if (!cleanTerm) return;

    const updated = [cleanTerm, ...searchHistory.filter((item) => normalizeStr(item) !== normalizeStr(cleanTerm))].slice(0, 6);
    setSearchHistory(updated);
    try {
      localStorage.setItem('walters_search_history', JSON.stringify(updated));
    } catch {
      // localStorage fallback
    }
  };

  const removeHistoryItem = (e: React.MouseEvent, termToRemove: string) => {
    e.stopPropagation();
    const updated = searchHistory.filter((item) => item !== termToRemove);
    setSearchHistory(updated);
    try {
      localStorage.setItem('walters_search_history', JSON.stringify(updated));
    } catch {
      // localStorage fallback
    }
  };

  const clearAllHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('walters_search_history');
  };

  const executeSearch = (term: string) => {
    if (!term.trim()) return;
    saveSearchTerm(term);
    setSearchQuery(term);
    setIsSearchFocused(false);
    closeMegaMenu();
    setIsMobileMenuOpen(false);
    navigate(`/catalog?search=${encodeURIComponent(term.trim())}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch(searchQuery);
  };

  const handleOpenMegaMenu = (catId?: number) => {
    if (isAdmin) return;
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    if (catId) setActiveCategoryId(catId);
    setIsMegaMenuOpen(true);
  };

  const handleCategoryMouseLeave = () => {
    if (isAdmin) return;
    hoverTimeoutRef.current = setTimeout(() => {
      setIsMegaMenuOpen(false);
      setActiveCategoryId(null);
    }, 200);
  };

  const closeMegaMenu = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setIsMegaMenuOpen(false);
    setActiveCategoryId(null);
  };

  const handleLogout = () => {
    logout();
    setIsProfileDropdownOpen(false);
    closeMegaMenu();
    navigate('/login');
  };

  const handleCartClick = () => {
    if (isAdmin) return;
    if (clickTimerRef.current) return;

    clickTimerRef.current = setTimeout(() => {
      clickTimerRef.current = null;
      closeMegaMenu();
      setIsDrawerOpen(true);
    }, 250);
  };

  const handleCartDoubleClick = () => {
    if (isAdmin) return;
    if (clickTimerRef.current) {
      clearTimeout(clickTimerRef.current);
      clickTimerRef.current = null;
    }
    closeMegaMenu();
    setIsDrawerOpen(false);
    navigate('/cart');
  };

  return (
    <>
      {/* PAGE FOCUS BACKDROP BLUR */}
      {(isProfileDropdownOpen || isSearchFocused) && (
        <div 
          className="fixed inset-0 top-16 sm:top-20 bg-black/25 backdrop-blur-xs z-40 transition-all duration-200"
          onClick={() => {
            setIsProfileDropdownOpen(false);
            setIsSearchFocused(false);
          }}
        />
      )}

      {/* HEADER WITH SHADOW ONLY */}
      <header 
        className="sticky top-0 z-50 w-full bg-white font-sans text-walters-charcoal shadow-md"
        onMouseLeave={handleCategoryMouseLeave}
      >
        {/* MAIN NAVBAR BAR */}
        <div className="w-full px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-8 max-w-7xl mx-auto">
          
          {/* LEFT: Logo & Menu Toggle */}
          <div className="flex items-center space-x-3 shrink-0">
            <Link to="/" className="flex items-center space-x-2.5 group" onClick={closeMegaMenu}>
              <img 
                src="/favicon.svg" 
                alt="Walters Opticians" 
                className="h-9 sm:h-11 w-auto object-contain shrink-0" 
              />
              <span className="font-serif text-lg sm:text-xl font-bold tracking-[0.12em] uppercase text-walters-navy transition-colors duration-200 hover:text-walters-navy/80 hidden sm:inline-block">
                Walters Opticians
              </span>
            </Link>

            <span className="hidden md:inline-block text-neutral-300">|</span>

            {!isAdmin && (
              <button
                type="button"
                onMouseEnter={() => handleOpenMegaMenu()}
                onClick={() => setIsMegaMenuOpen(!isMegaMenuOpen)}
                className="hidden md:flex items-center justify-center p-1.5 rounded text-walters-navy hover:text-neutral-600 transition-colors cursor-pointer"
                aria-label="Toggle Categories Mega Menu"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* CENTER: WIDER SEARCH BAR */}
          {!isAdmin && (
            <div className="hidden md:flex flex-1 max-w-2xl mx-4 relative" ref={searchContainerRef}>
              <form onSubmit={handleSearchSubmit} className="relative w-full z-50">
                <input
                  type="text"
                  value={searchQuery}
                  onFocus={(e) => {
                    setIsSearchFocused(true);
                    e.target.select();
                  }}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search optical frames, brands, or prescription types..."
                  className="w-full bg-white border border-walters-border rounded-full py-2.5 pl-10 pr-9 text-sm text-walters-charcoal placeholder-walters-slate/60 focus:outline-none transition-all shadow-2xs"
                />
                <button
                  type="submit"
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-walters-slate/60 hover:text-walters-navy transition-colors cursor-pointer"
                  title="Search"
                >
                  <Search className="w-4 h-4" />
                </button>

                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-walters-slate/60 hover:text-walters-navy transition-colors cursor-pointer"
                    title="Clear search"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </form>

              {/* CLEAN DYNAMIC SEARCH OVERLAY */}
              {isSearchFocused && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-neutral-200 shadow-xl z-50 text-walters-charcoal animate-in fade-in zoom-in-95 duration-150 overflow-hidden rounded-none">
                  
                  {/* LIVE TYPING SUGGESTIONS / FUZZY MATCHING */}
                  {searchQuery.trim().length > 0 ? (
                    <div className="p-4">
                      
                      {/* DID YOU MEAN BANNER FOR TYPOS */}
                      {isFuzzyResult && didYouMean && (
                        <div className="mb-3 pb-2.5 border-b border-neutral-100 flex items-center justify-between">
                          <div className="flex items-center gap-2 text-xs text-neutral-500">
                            <HelpCircle className="w-4 h-4 text-walters-navy shrink-0" />
                            <span>No exact match for "{searchQuery}". Did you mean <button type="button" onClick={() => executeSearch(didYouMean)} className="font-bold text-walters-navy underline hover:text-amber-700 cursor-pointer">{didYouMean}</button>?</span>
                          </div>
                        </div>
                      )}

                      {autoSuggestions.length > 0 ? (
                        <div className="space-y-0.5">
                          {autoSuggestions.map((suggestion) => (
                            <button
                              key={suggestion}
                              type="button"
                              onClick={() => executeSearch(suggestion)}
                              className="w-full flex items-center justify-between px-3.5 py-2.5 text-left hover:bg-neutral-50 text-walters-navy text-sm font-medium transition-colors duration-150 cursor-pointer group"
                            >
                              <span className="flex items-center gap-3">
                                <Search className="w-4 h-4 text-neutral-400 group-hover:text-walters-navy transition-colors" />
                                <span>{suggestion}</span>
                              </span>
                              <ChevronRight className="w-4 h-4 text-neutral-300 group-hover:text-walters-navy transition-colors" />
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="py-6 text-center text-sm text-neutral-500">
                          <p>Press <span className="font-bold text-walters-navy">Enter</span> to search for "{searchQuery}"</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* EMPTY INPUT: RECENT & POPULAR */
                    <>
                      {/* RECENT SEARCHES */}
                      {searchHistory.length > 0 && (
                        <div className="p-4 border-b border-neutral-100">
                          <div className="flex items-center justify-between mb-2.5">
                            <span className="flex items-center gap-2 font-semibold text-walters-navy text-xs uppercase tracking-wider font-serif">
                              <History className="w-3.5 h-3.5 text-neutral-400" />
                              Recent Searches
                            </span>
                            <button
                              type="button"
                              onClick={clearAllHistory}
                              className="text-xs text-neutral-400 hover:text-rose-600 transition-colors cursor-pointer flex items-center gap-1"
                            >
                              <Trash2 className="w-3 h-3" />
                              Clear
                            </button>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {searchHistory.map((term) => (
                              <div
                                key={term}
                                onClick={() => executeSearch(term)}
                                className="inline-flex items-center gap-2 px-3 py-1.5 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 text-walters-navy text-xs sm:text-sm font-medium transition-colors cursor-pointer group"
                              >
                                <span>{term}</span>
                                <button
                                  type="button"
                                  onClick={(e) => removeHistoryItem(e, term)}
                                  className="text-neutral-400 group-hover:text-rose-600 transition-colors p-0.5"
                                  title="Remove term"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* POPULAR COLLECTIONS */}
                      <div className="p-4">
                        <span className="flex items-center gap-2 font-semibold text-walters-navy text-xs uppercase tracking-wider font-serif mb-2.5">
                          <TrendingUp className="w-3.5 h-3.5 text-neutral-400" />
                          Popular Collections
                        </span>

                        <div className="grid grid-cols-2 gap-1.5">
                          {TRENDING_INITIAL.map((trending) => (
                            <button
                              key={trending}
                              type="button"
                              onClick={() => executeSearch(trending)}
                              className="flex items-center justify-between px-3.5 py-2.5 text-left bg-white hover:bg-neutral-50 border border-neutral-200/80 text-walters-navy font-medium text-xs sm:text-sm transition-colors cursor-pointer group"
                            >
                              <span className="truncate">{trending}</span>
                              <ChevronRight className="w-3.5 h-3.5 text-neutral-300 group-hover:text-walters-navy transition-colors shrink-0" />
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                </div>
              )}
            </div>
          )}

          {/* RIGHT: Actions */}
          <div className="flex items-center space-x-3 sm:space-x-4 shrink-0">
            
            {/* DYNAMIC PROFILE PILL ICON WITH INITIAL */}
            {isAuthenticated ? (
              <div className="relative" ref={profileDropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="flex items-center space-x-2 pl-1 pr-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200/80 transition-colors cursor-pointer focus:outline-none"
                  aria-expanded={isProfileDropdownOpen}
                  aria-label="User Account Menu"
                >
                  <div className="w-8 h-8 rounded-full bg-walters-navy text-white flex items-center justify-center font-serif text-sm font-bold shadow-xs">
                    {userInitial}
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 text-walters-navy transition-transform duration-200 ${isProfileDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* DROPDOWN MENU CARD */}
                {isProfileDropdownOpen && (
                  <div className="absolute right-0 mt-3.5 w-64 bg-white rounded-none border border-neutral-200 py-0 z-50 text-sm text-walters-charcoal shadow-2xl animate-in fade-in zoom-in-95 duration-150 overflow-hidden">
                    <div className="px-5 py-4 border-b border-neutral-100 bg-neutral-50/60">
                      <p className="font-bold text-walters-navy text-sm truncate uppercase tracking-wider font-serif">{user?.full_name || 'Valued Customer'}</p>
                      <p className="text-xs text-neutral-400 truncate mt-0.5">{user?.email}</p>
                    </div>

                    <div className="py-0">
                      <Link
                        to="/profile"
                        onClick={() => setIsProfileDropdownOpen(false)}
                        className="group flex items-center space-x-3.5 px-5 py-3.5 bg-white hover:bg-walters-navy hover:text-white text-walters-charcoal transition-colors duration-150"
                      >
                        <User className="w-5 h-5 text-walters-slate group-hover:text-white transition-colors shrink-0" />
                        <span className="font-medium text-sm">My Profile Details</span>
                      </Link>

                      <Link
                        to="/profile?tab=orders"
                        onClick={() => setIsProfileDropdownOpen(false)}
                        className="group flex items-center space-x-3.5 px-5 py-3.5 bg-white hover:bg-walters-navy hover:text-white text-walters-charcoal transition-colors duration-150"
                      >
                        <Package className="w-5 h-5 text-walters-slate group-hover:text-white transition-colors shrink-0" />
                        <span className="font-medium text-sm">Order History</span>
                      </Link>

                      {isAdmin && (
                        <Link
                          to="/admin"
                          onClick={() => setIsProfileDropdownOpen(false)}
                          className="group flex items-center space-x-3.5 px-5 py-3.5 bg-white hover:bg-walters-navy hover:text-white text-walters-navy font-bold transition-colors duration-150"
                        >
                          <Shield className="w-5 h-5 text-walters-navy group-hover:text-white shrink-0" />
                          <span className="text-sm">Admin Control Panel</span>
                        </Link>
                      )}
                    </div>

                    <div className="border-t border-neutral-100">
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="group w-full flex items-center space-x-3.5 px-5 py-3.5 bg-white hover:bg-neutral-900 hover:text-rose-400 text-rose-600 font-semibold text-left transition-colors duration-150 cursor-pointer"
                      >
                        <LogOut className="w-5 h-5 text-rose-600 group-hover:text-rose-400 transition-colors shrink-0" />
                        <span className="text-sm">Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                onClick={closeMegaMenu}
                className="flex items-center space-x-2.5 group cursor-pointer"
              >
                <div className="w-9 h-9 rounded-full bg-walters-navy/10 border border-walters-navy/20 flex items-center justify-center text-walters-navy group-hover:bg-walters-navy group-hover:text-white transition-all shadow-2xs">
                  <User className="w-5 h-5 fill-current" />
                </div>
                <span className="hidden sm:inline-block text-xs font-medium text-walters-charcoal opacity-70 hover:opacity-100 transition-opacity">
                  Sign In
                </span>
              </Link>
            )}

            {/* FAVORITE HEART ICON */}
            {!isAdmin && (
              <Link
                to="/favorites"
                onClick={closeMegaMenu}
                className="p-2 text-walters-navy hover:text-neutral-600 transition-colors"
                title="Favorites & Wishlist"
              >
                <Heart className="w-6 h-10 fill-current text-walters-navy hover:text-neutral-600 transition-colors" />
              </Link>
            )}

            {/* SHOPPING BAG BUTTON */}
            {!isAdmin && (
              <button
                type="button"
                onClick={handleCartClick}
                onDoubleClick={handleCartDoubleClick}
                className="relative flex items-center space-x-2 bg-white text-walters-navy text-xs font-medium px-4 py-2 rounded-full cursor-pointer border border-walters-border hover:border-walters-navy transition-colors shadow-2xs"
                aria-label="Shopping Bag Drawer"
              >
                <ShoppingBag className="w-3.5 h-3.5 text-walters-navy" />
                <span>Bag</span>

                {totalItemCount > 0 && (
                  <span
                    className={`absolute -top-1.5 -right-1.5 bg-walters-navy text-white text-[10px] font-bold h-4 min-w-4 px-1 rounded-full border border-white flex items-center justify-center transition-transform duration-200 ${
                      animateBadge ? 'scale-125' : 'scale-100'
                    }`}
                  >
                    {totalItemCount}
                  </span>
                )}
              </button>
            )}

            {/* MOBILE MENU TOGGLE */}
            <button
              type="button"
              onClick={() => {
                setIsMobileMenuOpen(!isMobileMenuOpen);
                closeMegaMenu();
              }}
              className="md:hidden p-2 text-walters-navy focus:outline-none rounded-lg hover:bg-white/60"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* MEGA MENU OVERLAY */}
        {!isAdmin && (
          <MegaMenu
            isOpen={isMegaMenuOpen}
            activeCategoryId={activeCategoryId}
            categories={categories}
            onCategoryHover={(id: number) => setActiveCategoryId(id)}
            onClose={closeMegaMenu}
            onMouseEnter={() => {
              if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
            }}
            onMouseLeave={handleCategoryMouseLeave}
          />
        )}

        {/* MOBILE OVERLAY */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white px-6 pt-2 pb-6 space-y-4 border-t border-walters-border/40 max-h-[80vh] overflow-y-auto">
            {!isAdmin && (
              <form onSubmit={handleSearchSubmit} className="relative w-full pt-2">
                <input
                  type="text"
                  value={searchQuery}
                  onFocus={(e) => e.target.select()}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search optical frames, brands..."
                  className="w-full bg-white border border-walters-border rounded-full py-2 pl-10 pr-8 text-xs text-walters-charcoal focus:outline-none"
                />
                <button type="submit" className="absolute left-3.5 top-1/2 -translate-y-1/2 mt-1 text-walters-slate/60">
                  <Search className="w-4 h-4" />
                </button>
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 mt-1 text-walters-slate/60"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </form>
            )}

            <nav className="flex flex-col space-y-3 font-sans text-base font-medium">
              <div className="pb-3 border-b border-walters-border/30 space-y-2">
                {isAuthenticated ? (
                  <>
                    <p className="text-xs font-bold text-walters-navy py-1">{user?.full_name}</p>
                    <Link
                      to="/profile"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center space-x-2 text-xs font-medium text-walters-slate py-1"
                    >
                      <User className="w-4 h-4" />
                      <span>My Profile</span>
                    </Link>

                    <button
                      type="button"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        handleLogout();
                      }}
                      className="flex items-center space-x-2 text-xs font-medium text-rose-600 py-1 cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center space-x-2 text-sm font-medium text-walters-navy py-1"
                  >
                    <User className="w-4 h-4" />
                    <span>Sign In / Create Account</span>
                  </Link>
                )}
              </div>

              <Link 
                to="/" 
                onClick={() => setIsMobileMenuOpen(false)} 
                className="text-walters-charcoal opacity-80 hover:opacity-100 py-1"
              >
                Home
              </Link>

              {categories.map((cat) => (
                <div key={cat.id} className="space-y-2 pt-2 border-t border-walters-border/30">
                  <Link
                    to={`/catalog?category=${cat.slug}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-xs font-bold text-walters-navy uppercase tracking-wider flex items-center justify-between"
                  >
                    <span>{cat.name}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
                  </Link>

                  {cat.subcategories && cat.subcategories.map((sub) => (
                    <div key={sub.id} className="pl-3 space-y-1.5 pt-1">
                      <Link
                        to={`/catalog?subcategory=${sub.slug}`}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="text-sm font-medium text-walters-charcoal block hover:text-walters-navy"
                      >
                        {sub.name}
                      </Link>
                    </div>
                  ))}
                </div>
              ))}

              <Link 
                to="/catalog" 
                onClick={() => setIsMobileMenuOpen(false)} 
                className="text-walters-charcoal opacity-80 hover:opacity-100 py-1 pt-2 border-t border-walters-border/30"
              >
                Browse All Products
              </Link>
            </nav>
          </div>
        )}
      </header>
    </>
  );
};