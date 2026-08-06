import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthProvider';
import { Navbar } from './components/Navbar';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Products } from './pages/Products';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Cart } from './pages/CartPage';
import { CartDrawer } from './components/CartDrawer';
import { Dashboard } from './pages/admin/Dashboard';
import type { CartItem, Product, PrescriptionData } from './types';

export const App: React.FC = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleAddToCart = (
    product: Product,
    type: 'frames_only' | 'prescription',
    rx?: PrescriptionData
  ) => {
    setCart((prev) => [
      ...prev,
      { product, quantity: 1, purchaseType: type, prescription: rx },
    ]);
    // Automatically open the cart slider when an item is added
    setIsDrawerOpen(true);
  };

  const handleUpdateQty = (index: number, delta: number) => {
    setCart((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
      )
    );
  };

  const handleRemove = (index: number) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col font-sans bg-[#FBFAF5] text-[#1A1A1A]">
          {/* Navbar controls opening the slider drawer */}
          <Navbar
            cartCount={cart.length}
            onOpenCartDrawer={() => setIsDrawerOpen(true)}
          />

          {/* Slide-over Cart Drawer */}
          <CartDrawer
            isOpen={isDrawerOpen}
            onClose={() => setIsDrawerOpen(false)}
            cartItems={cart}
            onUpdateQty={handleUpdateQty}
            onRemove={handleRemove}
          />

          {/* Main Routing Setup */}
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Products onAddToCart={handleAddToCart} />} />
              <Route
                path="/cart"
                element={
                  <Cart
                    cartItems={cart}
                    onUpdateQty={handleUpdateQty}
                    onRemove={handleRemove}
                  />
                }
              />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute requireAdmin>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;