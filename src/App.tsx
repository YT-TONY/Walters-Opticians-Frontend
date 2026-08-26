import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { useCurrency } from './hooks/useCurrency';
import { useCart } from './hooks/useCart';

// Context Providers
import { AuthProvider } from './context/AuthProvider'; 
import { CurrencyProvider } from './context/CurrencyProvider';
import { CategoryProvider } from './context/CategoryProvider';
import { CartProvider } from './context/CartProvider';

// Layout & UI Components
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { PrescriptionModal } from './components/PrescriptionModal';
import { ChatBot } from './components/ChatBot';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Toaster } from 'sonner';

// Pages
import { Catalog } from './pages/Catalog';
import { ProductDetail } from './pages/ProductDetail';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Checkout } from './pages/Checkout';
import { OrderSuccess } from './pages/OrderSucess';
import { Profile } from './pages/Profile';
import { Dashboard } from './pages/admin/Dashboard';

const AppContent: React.FC = () => {
  const { isAuthenticated, isAdmin } = useAuth();
  const { formatPrice } = useCurrency();

  const { 
    cartItems, 
    isModalOpen, 
    selectedProduct, 
    handleConfirmPrescription, 
    handleCloseModal,
    handleClearCart
  } = useCart();

  // Helper redirect target based on user role
  const authenticatedRedirect = isAdmin ? "/admin/dashboard" : "/";

  return (
    <div className="min-h-screen bg-cream flex flex-col font-sans text-charcoal">
      <Toaster position="bottom-right" richColors />

      {/* Render Navbar */}
      <Navbar />

      <main className="grow">
        <Routes>
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

          {/* Alias /admin to /admin/dashboard */}
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />

          {/* Admin Protected Route */}
          <Route 
            path="/admin/dashboard" 
            element={
              <ProtectedRoute requireAdmin={true}>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
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

      {/* Global AI Chatbot */}
      <ChatBot />
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
              <AppContent />
            </CartProvider>
          </CategoryProvider>
        </CurrencyProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;