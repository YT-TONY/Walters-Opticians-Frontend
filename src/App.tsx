// src/App.tsx

import React, { useState, useEffect, useMemo, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { useCurrency } from './hooks/useCurrency';
import { useCart } from './hooks/useCart';
import { apiClient } from './api/client';
import type { Product } from './types/index';

// Context Providers
import { AuthProvider } from './context/AuthProvider'; 
import { FavoriteProvider } from './context/FavoriteProvider';
import { CurrencyProvider } from './context/CurrencyProvider';
import { CategoryProvider } from './context/CategoryProvider';
import { CartProvider } from './context/CartProvider';
import { OrderProvider } from './context/OrderProvider';

// Layout & UI Components
import { TopUtilityBar } from './components/TopUtilityBar';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { HomeFeatureGrid } from './components/home/HomeFeatureGrid';
import { RecommendedCollections } from './components/home/RecommendedCollections';
import { FeaturedFrames } from './components/home/FeaturedFrames';
import { VisitStore } from './components/home/VisitStore';
import { Footer } from './components/Footer';
import { PrescriptionModal } from './components/PrescriptionModal';
import { ChatBot } from './components/ChatBot';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoadingDock } from './components/LoadingDock';
import { Toaster } from 'sonner';

// Lazy-Loaded Customer Pages
const Catalog = lazy(() => import('./pages/Catalog').then(m => ({ default: m.Catalog })));
const BrandPage = lazy(() => import('./pages/BrandPage').then(m => ({ default: m.BrandPage })));
const ProductDetail = lazy(() => import('./pages/ProductDetail').then(m => ({ default: m.ProductDetail })));
const Favorites = lazy(() => import('./pages/Favorites').then(m => ({ default: m.Favorites })));
const Login = lazy(() => import('./pages/auth/Login').then(m => ({ default: m.Login })));
const Register = lazy(() => import('./pages/auth/Register').then(m => ({ default: m.Register })));
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword').then(m => ({ default: m.ForgotPassword })));
const ResetPassword = lazy(() => import('./pages/auth/ResetPassword').then(m => ({ default: m.ResetPassword })));
const VerifyEmail = lazy(() => import('./pages/auth/VerifyEmail').then(m => ({ default: m.VerifyEmail })));
const CompleteProfile = lazy(() => import('./pages/auth/CompleteProfile').then(m => ({ default: m.CompleteProfile })));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy').then(m => ({ default: m.PrivacyPolicy })));
const Cart = lazy(() => import('./pages/CartPage').then(m => ({ default: m.Cart })));
const Checkout = lazy(() => import('./pages/Checkout').then(m => ({ default: m.Checkout })));
const OrderSuccess = lazy(() => import('./pages/OrderSucess').then(m => ({ default: m.OrderSuccess })));
const Profile = lazy(() => import('./pages/Profile').then(m => ({ default: m.Profile })));

// Lazy-Loaded Admin Portal Routes
const AdminLayout = lazy(() => import('./components/admin/AdminLayout').then(m => ({ default: m.AdminLayout })));
const AdminOverview = lazy(() => import('./pages/admin/Overview').then(m => ({ default: m.AdminOverview })));
const AdminStockInventory = lazy(() => import('./pages/admin/StockInventory').then(m => ({ default: m.AdminStockInventory })));
const OrdersTab = lazy(() => import('./pages/admin/OrdersTab').then(m => ({ default: m.OrdersTab })));
const BookingsTab = lazy(() => import('./pages/admin/BookingsTab').then(m => ({ default: m.BookingsTab })));
const AdminMarketOverview = lazy(() => import('./pages/admin/MarketOverview').then(m => ({ default: m.AdminMarketOverview })));
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings').then(m => ({ default: m.AdminSettings })));

// Branded Page Transition Skeleton Fallback (Used during React Suspense page chunks load)
const PageLoadingFallback: React.FC = () => (
  <div className="w-full min-h-[70vh] flex flex-col items-center justify-center p-8 relative overflow-hidden bg-white">
    {/* Animated Top Progress Line */}
    <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-walters-cream overflow-hidden">
      <div className="h-full bg-walters-gold animate-pulse w-full origin-left transform duration-500" />
    </div>

    <div className="relative flex flex-col items-center justify-center space-y-4">
      {/* Soft Gold Backdrop Pulse */}
      <div className="absolute w-32 h-32 rounded-full bg-walters-gold/15 blur-xl animate-pulse" />
      
      {/* Glasses Emblem Icon */}
      <div className="relative z-10 w-16 h-16 rounded-full bg-walters-navy flex items-center justify-center shadow-lg border border-walters-gold/30">
        <svg
          className="w-8 h-8 text-walters-gold animate-pulse"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M8 12a4 4 0 0 1 8 0" />
          <circle cx="6" cy="13" r="4" />
          <circle cx="18" cy="13" r="4" />
          <path d="M2 11l1.5 2" />
          <path d="M22 11l-1.5 2" />
        </svg>
      </div>

      <div className="text-center space-y-1 z-10">
        <span className="font-serif text-xs tracking-[0.25em] uppercase text-walters-navy font-bold block">
          Walters Opticians
        </span>
        <p className="text-[11px] text-walters-slate animate-pulse">Preparing view...</p>
      </div>
    </div>
  </div>
);

// Helper function to check if a product is a contact lens
const isContactLens = (product: Product) => {
  const cat = (product.category || '').toLowerCase().trim();
  return cat === 'contact_lenses' || cat === 'contact-lenses' || cat === 'contacts';
};

// Public Landing Page View
const HomeView: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchHomeProducts = async () => {
      try {
        const res = await apiClient.get<Product[]>('/products/');
        setProducts(res.data);
      } catch (error) {
        console.error('Failed to fetch home products', error);
      }
    };
    fetchHomeProducts();
  }, []);

  const frameProducts = useMemo(() => {
    return products.filter((p) => !isContactLens(p));
  }, [products]);

  return (
    <>
      <Hero />
      <HomeFeatureGrid />
      <FeaturedFrames products={frameProducts} />
      <RecommendedCollections />
      <VisitStore />
    </>
  );
};

const AppContent: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { formatPrice } = useCurrency();
  const location = useLocation();

  const { 
    cartItems, 
    isModalOpen, 
    selectedProduct, 
    handleConfirmPrescription, 
    handleCloseModal,
    handleClearCart
  } = useCart();

  const isAdminRoute = location.pathname.startsWith('/admin');
  const isAuthRoute = [
    '/login', 
    '/register', 
    '/forgot-password', 
    '/reset-password', 
    '/verify-email',
    '/complete-profile',
    '/privacy'
  ].includes(location.pathname);
  
  const hideHeader = isAdminRoute || isAuthRoute;

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans text-charcoal relative">
      {/* Centered Brand Loading Overlay (Fires on all API Requests) */}
      <LoadingDock mode="pulse" />

      <Toaster position="bottom-right" richColors />

      {!hideHeader && (
        <header className="w-full sticky top-0 z-50">
          <TopUtilityBar />
          <Navbar />
        </header>
      )}

      <main className="grow">
        <Suspense fallback={<PageLoadingFallback />}>
          <Routes>
            {/* Default Public Storefront Routes */}
            <Route path="/" element={<HomeView />} />
            <Route path="/catalog" element={<Catalog />} />
            <Route path="/brands/:brandSlug" element={<BrandPage />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />

            {/* Authentication & Profile Setup Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/complete-profile" element={<CompleteProfile />} />
            
            {/* Checkout & User Account Routes */}
            <Route path="/checkout" element={<Checkout cartItems={cartItems} onClearCart={handleClearCart} />} />
            <Route path="/order-success/:orderId" element={<OrderSuccess />} />
            <Route path="/profile" element={isAuthenticated ? <Profile /> : <Navigate to="/login" replace />} />

            {/* Admin Portal Protected Routes */}
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute requireAdmin={true}>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<AdminOverview />} />
              <Route path="inventory" element={<AdminStockInventory />} />
              <Route path="orders" element={<OrdersTab />} />
              <Route path="bookings" element={<BookingsTab bookings={[]} onToggleStatus={() => {}} />} />
              <Route path="analytics" element={<AdminMarketOverview />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>

            {/* Fallback Route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </main>

      {!hideHeader && <Footer />}

      {selectedProduct && (
        <PrescriptionModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onConfirm={handleConfirmPrescription}
          frameName={selectedProduct.name}
          framePrice={formatPrice(selectedProduct.price_full_gbp)}
        />
      )}

      {!isAdminRoute && !isAuthRoute && <ChatBot />}
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <FavoriteProvider>
          <CurrencyProvider>
            <CategoryProvider>
              <CartProvider>
                <OrderProvider>
                  <AppContent />
                </OrderProvider>
              </CartProvider>
            </CategoryProvider>
          </CurrencyProvider>
        </FavoriteProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;