// src/components/admin/AdminSidebar.tsx
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  Calendar, 
  BarChart3, 
  LogOut, 
  ChevronLeft, 
  ChevronRight,
  Glasses,
  Settings // Imported Settings Icon
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface AdminSidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  pendingOrdersCount?: number;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  isCollapsed,
  onToggleCollapse,
  pendingOrdersCount = 0
}) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Overview', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Stock Inventory', path: '/admin/inventory', icon: Package },
    { 
      label: 'Orders & Prescription', 
      path: '/admin/orders', 
      icon: ShoppingBag,
      badge: pendingOrdersCount > 0 ? pendingOrdersCount : null 
    },
    { label: 'Appointments', path: '/admin/bookings', icon: Calendar },
    { label: 'Market Overview', path: '/admin/analytics', icon: BarChart3 },
    { label: 'Global Settings', path: '/admin/settings', icon: Settings }, // Added Settings Route
  ];

  return (
    <aside
      className={`h-screen sticky top-0 bg-navy text-white transition-all duration-300 ease-in-out flex flex-col justify-between shrink-0 z-40 border-r border-[#1B2B4C] ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Sidebar Header */}
      <div>
        <div className="flex items-center justify-between p-4 border-b border-[#1B2B4C]">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="p-2 bg-[#1B75BC] rounded-xl shrink-0">
              <Glasses className="w-5 h-5 text-white" />
            </div>
            {!isCollapsed && (
              <div className="truncate">
                <h2 className="font-serif font-bold text-sm text-white tracking-wide leading-none">WALTERS</h2>
                <span className="text-[10px] text-slate-300 uppercase tracking-widest">Admin Portal</span>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={onToggleCollapse}
            className="p-1.5 rounded-lg bg-[#0C214A] hover:bg-[#1B75BC] text-slate-300 hover:text-white transition-colors cursor-pointer"
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#1B75BC] text-white shadow-md'
                      : 'text-slate-300 hover:bg-[#0C214A] hover:text-white'
                  }`
                }
              >
                <div className="flex items-center space-x-3 truncate">
                  <Icon className="w-4 h-4 shrink-0" />
                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                </div>

                {!isCollapsed && item.badge && (
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-rose-500 text-white rounded-full animate-pulse">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer / Logout */}
      <div className="p-3 border-t border-[#1B2B4C]">
        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-rose-300 hover:bg-rose-500/20 hover:text-rose-200 transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4 shrink-0 text-rose-400" />
          {!isCollapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
};