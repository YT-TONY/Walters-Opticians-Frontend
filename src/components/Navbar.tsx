// src/components/Navbar.tsx
import React, { useState, useEffect, useRef } from 'react';
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
  Package
} from 'lucide-react';

import { useCart } from '../hooks/useCart';
import { useCategories } from '../hooks/useCategories';
import { useAuth } from '../hooks/useAuth';
import { MegaMenu } from './megamenu/MegaMenu';

export const Navbar: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [activeCategoryId, setActiveCategoryId] = useState<number | null>(null);
  const [animateBadge, setAnimateBadge] = useState(false);

  // Search State
  const [searchQuery, setSearchQuery] = useState('');

  const { cartItems, setIsDrawerOpen } = useCart();
  const { categories, loading } = useCategories();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  const totalItemCount = cartItems.reduce((total, item) => total + (item.quantity || 1), 0);
  const prevCountRef = useRef(totalItemCount);

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

  // Click outside to close profile dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;

    try {
      const history: string[] = JSON.parse(localStorage.getItem('walters_search_history') || '[]');
      const updated = [query.toLowerCase(), ...history.filter((item) => item !== query.toLowerCase())].slice(0, 5);
      localStorage.setItem('walters_search_history', JSON.stringify(updated));
    } catch {
      // Storage fallback ignore
    }

    closeMegaMenu();
    setIsMobileMenuOpen(false);
    navigate(`/catalog?search=${encodeURIComponent(query)}`);
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
      {/* PAGE FOCUS BACKDROP BLUR WHEN DROPDOWN IS ACTIVE */}
      {isProfileDropdownOpen && (
        <div 
          className="fixed inset-0 top-16 sm:top-20 bg-black/25 backdrop-blur-xs z-40 transition-all duration-200"
          onClick={() => setIsProfileDropdownOpen(false)}
        />
      )}

      <header 
        className="sticky top-0 z-50 w-full bg-white font-sans text-walters-charcoal shadow-md border-b border-walters-border/40"
        onMouseLeave={handleCategoryMouseLeave}
      >
        {/* MAIN NAVBAR HEADER BAR */}
        <div className="w-full px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-16 max-w-7xl mx-auto">
          
          {/* LEFT: [Logo] WALTERS OPTICIANS | [Hamburger Menu] */}
          <div className="flex items-center space-x-3 shrink-0">
            <Link to="/" className="flex items-center space-x-2.5 group" onClick={closeMegaMenu}>
              <img 
                src="/favicon.svg" 
                alt="Walters Opticians" 
                className="h-9 sm:h-11 w-auto object-contain shrink-0" 
              />
              <span className="font-serif text-lg sm:text-xl font-bold tracking-[0.12em] uppercase text-walters-navy transition-colors duration-200 hover:text-walters-gold hidden sm:inline-block">
                Walters Opticians
              </span>
            </Link>

            <span className="hidden md:inline-block text-walters-border">|</span>

            {!isAdmin && (
              <button
                type="button"
                onMouseEnter={() => handleOpenMegaMenu()}
                onClick={() => setIsMegaMenuOpen(!isMegaMenuOpen)}
                className="hidden md:flex items-center justify-center p-1.5 rounded text-walters-navy hover:text-walters-gold transition-colors cursor-pointer"
                aria-label="Toggle Categories Mega Menu"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* CENTER: Search Bar */}
          {!isAdmin && (
            <div className="hidden md:flex flex-1 max-w-lg mx-2">
              <form onSubmit={handleSearchSubmit} className="relative w-full">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search optical frames, brands, or prescription types..."
                  className="w-full bg-white border border-walters-border rounded-full py-2 pl-10 pr-9 text-xs text-walters-charcoal placeholder-walters-slate/60 focus:outline-none focus:ring-1 focus:ring-walters-gold focus:border-walters-gold transition-all shadow-2xs"
                />
                <button
                  type="submit"
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-walters-slate/60 hover:text-walters-navy transition-colors"
                  title="Search"
                >
                  <Search className="w-4 h-4" />
                </button>

                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-walters-slate/60 hover:text-walters-navy transition-colors"
                    title="Clear search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </form>
            </div>
          )}

          {/* RIGHT: Actions */}
          <div className="flex items-center space-x-3 sm:space-x-4 shrink-0">
            
            {/* PROFILE / ACCOUNT WITH SHARP, DARK-HOVER DROPDOWN */}
            {isAuthenticated ? (
              <div className="relative" ref={profileDropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="flex items-center space-x-2.5 group cursor-pointer focus:outline-none"
                  aria-expanded={isProfileDropdownOpen}
                  aria-label="User Account Menu"
                >
                  <div className="w-9 h-9 rounded-full bg-walters-navy/10 border border-walters-navy/20 flex items-center justify-center text-walters-navy group-hover:bg-walters-navy group-hover:text-white transition-all shadow-2xs">
                    <User className="w-5 h-5 fill-current" />
                  </div>
                  <span className="hidden sm:inline-block text-sm font-semibold text-walters-navy group-hover:text-walters-gold max-w-32 truncate transition-colors">
                    {user?.full_name?.split(' ')[0] || 'Account'}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-walters-navy/60 transition-transform duration-200 hidden sm:inline-block ${isProfileDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* SHARP RECTANGULAR DROPDOWN CARD */}
                {isProfileDropdownOpen && (
                  <div className="absolute right-0 mt-3.5 w-64 bg-white rounded-none border border-neutral-200/80 py-0 z-50 text-sm text-walters-charcoal shadow-2xl animate-in fade-in zoom-in-95 duration-150 overflow-hidden">
                    
                    {/* USER HEADER WITH FAINT DEMARCATION */}
                    <div className="px-5 py-4 border-b border-neutral-100 bg-neutral-50/60">
                      <p className="font-bold text-walters-navy text-sm truncate uppercase tracking-wider font-serif">{user?.full_name || 'Valued Customer'}</p>
                      <p className="text-xs text-neutral-400 truncate mt-0.5">{user?.email}</p>
                    </div>

                    {/* MENU OPTIONS WITH DARK SHADE HOVER STATES */}
                    <div className="py-0">
                      <Link
                        to="/profile"
                        onClick={() => setIsProfileDropdownOpen(false)}
                        className="group flex items-center space-x-3.5 px-5 py-3.5 bg-white hover:bg-walters-navy hover:text-white text-walters-charcoal transition-colors duration-150"
                      >
                        <User className="w-5 h-5 text-walters-slate group-hover:text-walters-gold transition-colors shrink-0" />
                        <span className="font-medium text-sm">My Profile Details</span>
                      </Link>

                      <Link
                        to="/profile?tab=orders"
                        onClick={() => setIsProfileDropdownOpen(false)}
                        className="group flex items-center space-x-3.5 px-5 py-3.5 bg-white hover:bg-walters-navy hover:text-white text-walters-charcoal transition-colors duration-150"
                      >
                        <Package className="w-5 h-5 text-walters-slate group-hover:text-walters-gold transition-colors shrink-0" />
                        <span className="font-medium text-sm">Order History</span>
                      </Link>

                      {isAdmin && (
                        <Link
                          to="/admin"
                          onClick={() => setIsProfileDropdownOpen(false)}
                          className="group flex items-center space-x-3.5 px-5 py-3.5 bg-white hover:bg-walters-navy hover:text-white text-walters-gold font-bold transition-colors duration-150"
                        >
                          <Shield className="w-5 h-5 text-walters-gold shrink-0" />
                          <span className="text-sm">Admin Control Panel</span>
                        </Link>
                      )}
                    </div>

                    {/* FAINT SIGN OUT DIVIDER */}
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

            {/* SOLID FAVORITE HEART ICON */}
            {!isAdmin && (
              <Link
                to="/favorites"
                onClick={closeMegaMenu}
                className="p-2 text-walters-navy hover:text-walters-gold transition-colors"
                title="Favorites & Wishlist"
              >
                <Heart className="w-6 h-10 fill-current text-walters-navy hover:text-walters-gold transition-colors" />
              </Link>
            )}

            {/* ORIGINAL BAG BUTTON */}
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
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search optical frames, brands..."
                  className="w-full bg-white border border-walters-border rounded-full py-2 pl-10 pr-8 text-xs text-walters-charcoal focus:outline-none focus:ring-1 focus:ring-walters-gold"
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
                      className="flex items-center space-x-2 text-xs font-medium text-walters-slate hover:text-walters-gold py-1"
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

              {!loading && categories.map((cat) => (
                <div key={cat.id} className="space-y-2 pt-2 border-t border-walters-border/30">
                  <Link
                    to={`/catalog?category=${cat.slug}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-xs font-bold text-walters-navy uppercase tracking-wider flex items-center justify-between"
                  >
                    <span>{cat.name}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-walters-gold" />
                  </Link>

                  {cat.subcategories && cat.subcategories.map((sub) => (
                    <div key={sub.id} className="pl-3 space-y-1.5 pt-1">
                      <Link
                        to={`/catalog?subcategory=${sub.slug}`}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="text-sm font-medium text-walters-charcoal block hover:text-walters-gold"
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