// src/App.tsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { useCurrency } from './hooks/useCurrency';
import { useCart } from './hooks/useCart';

// Context Providers
import { AuthProvider } from './context/AuthProvider'; 
import { CurrencyProvider } from './context/CurrencyProvider';
import { CategoryProvider } from './context/CategoryProvider';
import { CartProvider } from './context/CartProvider';
import { OrderProvider } from './context/OrderProvider';

// Layout & UI Components
import { TopUtilityBar } from './components/TopUtilityBar';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { PrescriptionModal } from './components/PrescriptionModal';
import { ChatBot } from './components/ChatBot';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Toaster } from 'sonner';

// Customer Pages
import { Catalog } from './pages/Catalog';
import { ProductDetail } from './pages/ProductDetail';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Cart } from './pages/CartPage';
import { Checkout } from './pages/Checkout';
import { OrderSuccess } from './pages/OrderSucess';
import { Profile } from './pages/Profile';

// Admin Portal Layout & Sub-Pages
import { AdminLayout } from './components/admin/AdminLayout';
import { AdminOverview } from './pages/admin/Overview';
import { AdminStockInventory } from './pages/admin/StockInventory';
import { OrdersTab } from './pages/admin/OrdersTab';
import { BookingsTab } from './pages/admin/BookingsTab';
import { AdminMarketOverview } from './pages/admin/MarketOverview';
import { AdminSettings } from './pages/admin/AdminSettings';

const AppContent: React.FC = () => {
  const { isAuthenticated, isAdmin } = useAuth();
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

  // Route visibility checks
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isAuthRoute = ['/login', '/register'].includes(location.pathname);
  
  // Suppress public store header (utility bar & navbar) on admin and auth pages
  const hideHeader = isAdminRoute || isAuthRoute;

  // Helper redirect target based on user role
  const authenticatedRedirect = isAdmin ? "/admin/dashboard" : "/";

  return (
    <div className="min-h-screen bg-cream flex flex-col font-sans text-charcoal">
      <Toaster position="bottom-right" richColors />

      {/* Render Top Utility Bar & Public Navbar together */}
      {!hideHeader && (
        <header className="w-full sticky top-0 z-50">
          <TopUtilityBar />
          <Navbar />
        </header>
      )}

      <main className="grow">
        <Routes>
          {/* Storefront Routes */}
          <Route 
            path="/" 
            element={
              <>
                <Hero />
                <Catalog />
              </>
            } 
          />
          
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />

          <Route 
            path="/login" 
            element={isAuthenticated ? <Navigate to={authenticatedRedirect} replace /> : <Login />} 
          />
          <Route 
            path="/register" 
            element={isAuthenticated ? <Navigate to={authenticatedRedirect} replace /> : <Register />} 
          />
          
          <Route path="/checkout" element={<Checkout cartItems={cartItems} onClearCart={handleClearCart} />} />
          <Route path="/order-success/:orderId" element={<OrderSuccess />} />
          <Route path="/profile" element={isAuthenticated ? <Profile /> : <Navigate to="/login" />} />

          {/* Admin Redesign Nested Routes */}
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
        </Routes>
      </main>

      {selectedProduct && (
        <PrescriptionModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onConfirm={handleConfirmPrescription}
          frameName={selectedProduct.name}
          framePrice={formatPrice(selectedProduct.price_full_gbp)}
        />
      )}

      {/* Global AI Chatbot (Only active on storefront) */}
      {!isAdminRoute && !isAuthRoute && <ChatBot />}
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CurrencyProvider>
          <CategoryProvider>
            <CartProvider>
              <OrderProvider>
                <AppContent />
              </OrderProvider>
            </CartProvider>
          </CategoryProvider>
        </CurrencyProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;