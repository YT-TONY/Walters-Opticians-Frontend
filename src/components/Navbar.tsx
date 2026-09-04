// src/components/Navbar.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, User, Phone, Menu, X, Search, ChevronRight, Shield, LogOut, Heart } from 'lucide-react';
import { useCart } from '../hooks/useCart';
import { useCategories } from '../hooks/useCategories';
import { useAuth } from '../hooks/useAuth';
import { MegaMenu } from './megamenu/MegaMenu';
import { TopUtilityBar } from './TopUtilityBar';

export const Navbar: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
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

  const totalItemCount = cartItems.reduce((total, item) => total + (item.quantity || 1), 0);
  const prevCountRef = useRef(totalItemCount);

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
      className="sticky top-0 z-50 w-full bg-walters-cream font-sans text-walters-charcoal shadow-[0_2px_8px_rgba(26,26,26,0.08)]"
      onMouseLeave={handleCategoryMouseLeave}
    >
      {/* 1. TOP NAVY UTILITY BAR */}
      <TopUtilityBar />

      {/* 2. MAIN NAVBAR HEADER BAR */}
      <div className="w-full px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-center gap-50 max-w-7xl mx-auto">
        
        {/* LEFT: Logo | Brand Name | Phone | Hamburger Icon */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          <Link to="/" className="flex items-center space-x-2.5" onClick={closeMegaMenu}>
            <img 
              src="/logo.png" 
              alt="Walters Opticians" 
              className="h-8 sm:h-10 w-auto object-contain shrink-0" 
            />
            <span className="font-serif text-lg sm:text-2xl font-bold tracking-[0.15em] uppercase text-walters-navy transition-colors duration-200 hover:text-walters-gold hidden xs:inline-block">
              Walters Opticians
            </span>
          </Link>

          <span className="hidden lg:inline-block text-walters-border">|</span>

          <a
            href="tel:+441427616506"
            className="hidden lg:flex items-center space-x-1.5 text-xs font-semibold text-walters-slate opacity-70 hover:opacity-100 transition-opacity"
          >
            <Phone className="w-3.5 h-3.5 text-walters-navy" />
            <span>+44 (0)1427 616506</span>
          </a>

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

        {/* CENTER: Functional Search Bar */}
        {!isAdmin && (
          <div className="hidden md:flex flex-1 max-w-md mx-4">
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search optical frames, brands, or prescription types..."
                className="w-full bg-white/90 border border-walters-border rounded-full py-2 pl-10 pr-9 text-xs text-walters-charcoal placeholder-walters-slate/60 focus:outline-none focus:ring-1 focus:ring-walters-gold focus:bg-white transition-all shadow-2xs"
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
        <div className="flex items-center space-x-3 sm:space-x-4">
          {isAuthenticated ? (
            <>
              {isAdmin ? (
                <>
                  <Link
                    to="/admin"
                    onClick={closeMegaMenu}
                    className="hidden xl:flex items-center space-x-1 text-xs font-bold text-walters-gold hover:text-walters-navy transition-colors"
                  >
                    <Shield className="w-3.5 h-3.5" />
                    <span>Admin</span>
                  </Link>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="hidden sm:flex items-center space-x-1.5 text-xs font-semibold text-walters-slate hover:text-rose-600 transition-colors cursor-pointer"
                    title="Sign Out"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </>
              ) : (
                <Link
                  to="/profile"
                  onClick={closeMegaMenu}
                  className="hidden sm:flex items-center space-x-1.5 text-xs font-semibold text-walters-navy hover:text-walters-gold transition-colors cursor-pointer"
                  title="View Profile & Orders"
                >
                  <User className="w-4 h-4 text-walters-navy shrink-0" />
                  <span className="max-w-30 truncate">{user?.full_name || 'Account'}</span>
                </Link>
              )}
            </>
          ) : (
            <Link
              to="/login"
              onClick={closeMegaMenu}
              className="hidden sm:flex items-center space-x-1.5 text-xs font-medium text-walters-charcoal opacity-70 hover:opacity-100 transition-opacity"
            >
              <User className="w-4 h-4 text-walters-navy" />
              <span>Sign In</span>
            </Link>
          )}

          {/* WISHLIST BUTTON */}
          {!isAdmin && (
            <Link
              to="/favorites"
              onClick={closeMegaMenu}
              className="p-2 text-walters-navy hover:text-walters-gold transition-colors"
              title="Favorites & Wishlist"
            >
              <Heart className="w-4 h-4" />
            </Link>
          )}

          {/* DYNAMIC BAG BUTTON */}
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
        <div className="md:hidden bg-walters-cream px-6 pt-2 pb-6 space-y-4 border-t border-walters-border/40 max-h-[80vh] overflow-y-auto">
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
                  {isAdmin ? (
                    <>
                      <Link
                        to="/admin"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center space-x-2 text-xs font-bold text-walters-gold hover:underline py-1"
                      >
                        <Shield className="w-4 h-4" />
                        <span>Admin Dashboard</span>
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
                      to="/profile"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center space-x-2 text-xs font-bold text-walters-navy hover:text-walters-gold py-1"
                    >
                      <User className="w-4 h-4" />
                      <span>{user?.full_name || user?.email || 'My Profile'}</span>
                    </Link>
                  )}
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