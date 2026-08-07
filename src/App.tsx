// src/App.tsx
import React from 'react';
import { Routes, Route, Link, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { useCurrency } from './hooks/useCurrency';
import { CartProvider } from './context/CartProvider';
import { useCart } from './hooks/useCart';
import { CurrencySelector } from './components/CurrencySelector';
import { PrescriptionModal } from './components/PrescriptionModal';
import { ChatBot } from './components/ChatBot';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Catalog } from './pages/Catalog';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Checkout } from './pages/Checkout';
import { OrderSuccess } from './pages/OrderSucess';
import { Profile } from './pages/Profile';
import { Dashboard } from './pages/admin/Dashboard';
import { ShoppingBag, User as UserIcon, LogOut, Shield } from 'lucide-react';
import { Toaster, toast } from 'sonner';

const AppContent: React.FC = () => {
  const { user, isAuthenticated, logout, isAdmin } = useAuth();
  const { formatPrice } = useCurrency();
  const navigate = useNavigate();
  
  const { 
    cartItems, 
    isModalOpen, 
    selectedProduct, 
    handleConfirmPrescription, 
    handleCloseModal,
    handleClearCart
  } = useCart();

  const handleLogout = () => {
    logout();
    toast.info('You have been logged out safely.');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#FBFAF5] flex flex-col font-sans text-[#1A1A1A]">
      <Toaster position="bottom-right" richColors />

      <header className="w-full bg-white border-b border-[#E5E0D8] sticky top-0 z-40 px-6 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-9 h-9 rounded-full bg-[#021438] text-[#E6AA38] flex items-center justify-center font-serif font-bold text-lg group-hover:scale-105 transition-transform">
              W
            </div>
            <span className="font-serif text-lg font-bold tracking-wider text-[#021438]">
              WALTERS OPTICIANS
            </span>
          </Link>

          <div className="flex items-center space-x-4">
            <CurrencySelector />

            {isAuthenticated ? (
              <div className="flex items-center space-x-3 text-xs font-semibold">
                {isAdmin && (
                  <Link to="/admin/dashboard" className="flex items-center text-[#E6AA38] hover:text-[#021438]">
                    <Shield className="w-4 h-4 mr-1" />
                    Admin
                  </Link>
                )}
                <Link to="/profile" className="text-[#021438] hover:text-[#E6AA38] flex items-center">
                  <UserIcon className="w-4 h-4 mr-1" />
                  {user?.full_name || 'Profile'}
                </Link>
                <button onClick={handleLogout} className="p-2 text-[#5E6470] hover:text-red-600 transition-colors">
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link to="/login" className="text-xs font-semibold text-[#5E6470] hover:text-[#021438] flex items-center">
                <UserIcon className="w-4 h-4 mr-1" />
                Login
              </Link>
            )}

            <Link
              to="/checkout"
              className="bg-[#021438] text-[#FBFAF5] px-4 py-2 rounded-full hover:bg-[#E6AA38] hover:text-[#021438] transition-all flex items-center space-x-2 text-xs font-bold"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Bag</span>
              {cartItems.length > 0 && (
                <span className="w-5 h-5 rounded-full bg-[#E6AA38] text-[#021438] text-[10px] font-bold flex items-center justify-center">
                  {cartItems.length}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Catalog />} />
          <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <Login />} />
          <Route path="/register" element={isAuthenticated ? <Navigate to="/" /> : <Register />} />
          <Route path="/checkout" element={<Checkout cartItems={cartItems} onClearCart={handleClearCart} />} />
          <Route path="/order-success/:orderId" element={<OrderSuccess />} />
          <Route path="/profile" element={isAuthenticated ? <Profile /> : <Navigate to="/login" />} />
          
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
    <CartProvider>
      <AppContent />
    </CartProvider>
  );
};

export default App;