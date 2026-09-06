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
  Package,
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
    <header 
      className="sticky top-0 z-50 w-full bg-white font-sans text-walters-charcoal shadow-xs border-b border-walters-border/40"
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
          
          {/* PROFILE / ACCOUNT WITH SEAMLESS DROPDOWN */}
          {isAuthenticated ? (
            <div className="relative" ref={profileDropdownRef}>
              <button
                type="button"
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="flex items-center space-x-2 group cursor-pointer focus:outline-none"
                aria-expanded={isProfileDropdownOpen}
                aria-label="User Account Menu"
              >
                <div className="w-8 h-8 rounded-full bg-walters-navy/10 border border-walters-navy/20 flex items-center justify-center text-walters-navy group-hover:bg-walters-navy group-hover:text-white transition-all shadow-2xs">
                  <User className="w-4 h-4 fill-current" />
                </div>
                <span className="hidden sm:inline-block text-xs font-semibold text-walters-navy group-hover:text-walters-gold max-w-28 truncate transition-colors">
                  {user?.full_name?.split(' ')[0] || 'Account'}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-walters-navy/60 transition-transform duration-200 hidden sm:inline-block ${isProfileDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* DROPDOWN CARD */}
              {isProfileDropdownOpen && (
                <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-xl border border-walters-border/60 py-2 z-50 text-xs text-walters-charcoal animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-4 py-2.5 border-b border-walters-border/30">
                    <p className="font-bold text-walters-navy truncate">{user?.full_name || 'Valued Customer'}</p>
                    <p className="text-[11px] text-walters-slate truncate">{user?.email}</p>
                  </div>

                  <div className="py-1">
                    <Link
                      to="/profile"
                      onClick={() => setIsProfileDropdownOpen(false)}
                      className="flex items-center space-x-2.5 px-4 py-2 hover:bg-walters-cream text-walters-charcoal hover:text-walters-navy transition-colors"
                    >
                      <User className="w-4 h-4 text-walters-slate" />
                      <span>My Profile Details</span>
                    </Link>

                    <Link
                      to="/profile?tab=orders"
                      onClick={() => setIsProfileDropdownOpen(false)}
                      className="flex items-center space-x-2.5 px-4 py-2 hover:bg-walters-cream text-walters-charcoal hover:text-walters-navy transition-colors"
                    >
                      <Package className="w-4 h-4 text-walters-slate" />
                      <span>Order History</span>
                    </Link>

                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setIsProfileDropdownOpen(false)}
                        className="flex items-center space-x-2.5 px-4 py-2 hover:bg-walters-cream text-walters-gold font-bold transition-colors"
                      >
                        <Shield className="w-4 h-4" />
                        <span>Admin Control Panel</span>
                      </Link>
                    )}
                  </div>

                  <div className="pt-1 border-t border-walters-border/30">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-2.5 px-4 py-2 text-rose-600 hover:bg-rose-50 font-semibold text-left transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              onClick={closeMegaMenu}
              className="flex items-center space-x-2 group cursor-pointer"
            >
              <div className="w-8 h-8 rounded-full bg-walters-navy/10 border border-walters-navy/20 flex items-center justify-center text-walters-navy group-hover:bg-walters-navy group-hover:text-white transition-all shadow-2xs">
                <User className="w-4 h-4 fill-current" />
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
              <Heart className="w-4 h-4 fill-current text-walters-navy hover:text-walters-gold transition-colors" />
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
  );
};