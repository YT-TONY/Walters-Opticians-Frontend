import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ShoppingBag, User as UserIcon, LogOut } from 'lucide-react';

export interface NavbarProps {
  cartCount: number;
  onOpenCartDrawer: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ cartCount, onOpenCartDrawer }) => {
  const { user, isAuthenticated, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="w-full bg-[#FBFAF5] border-b border-[#E5E0D8] sticky top-0 z-40 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="w-9 h-9 rounded-full bg-[#021438] text-[#E6AA38] flex items-center justify-center font-serif font-bold text-lg group-hover:scale-105 transition-transform">
            W
          </div>
          <span className="font-serif text-lg font-bold tracking-wider text-[#021438]">
            WALTERS OPTICIANS
          </span>
        </Link>

        <nav className="hidden md:flex space-x-8 text-xs font-semibold uppercase tracking-wider text-[#5E6470]">
          <Link to="/" className="hover:text-[#021438]">Frames</Link>
          <Link to="/" className="hover:text-[#021438]">Lenses</Link>
          <Link to="/" className="hover:text-[#021438]">Home Try-On</Link>
          {isAdmin && (
            <Link to="/admin/dashboard" className="text-[#E6AA38] font-bold hover:underline">
              Admin Portal
            </Link>
          )}
        </nav>

        <div className="flex items-center space-x-4 text-xs font-semibold">
          {isAuthenticated ? (
            <div className="flex items-center space-x-3">
              <span className="text-[#021438]">{user?.full_name || user?.email}</span>
              <button onClick={logout} className="p-2 text-[#5E6470] hover:text-[#021438]" title="Logout">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="text-[#5E6470] hover:text-[#021438] flex items-center space-x-1"
            >
              <UserIcon className="w-4 h-4" />
              <span>Account</span>
            </button>
          )}

          <button
            onClick={onOpenCartDrawer}
            className="bg-[#021438] text-[#FBFAF5] px-4 py-2 rounded-full hover:bg-[#E6AA38] hover:text-[#021438] transition-all flex items-center space-x-2"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Bag</span>
            <span className="w-5 h-5 rounded-full bg-[#E6AA38] text-[#021438] text-[10px] font-bold flex items-center justify-center">
              {cartCount}
            </span>
          </button>
        </div>

      </div>
    </header>
  );
};