import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Search, 
  Sun, 
  Moon, 
  Bell, 
  Menu, 
  LogOut, 
  User as UserIcon, 
  ChevronDown, 
  Store, 
  Calendar,
  ShieldCheck,
  CheckCircle
} from 'lucide-react';

export default function Navbar({ isDark, setIsDark, onToggleSidebar, activePage }) {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [storeFilter, setStoreFilter] = useState('ALL_STORES');
  const [dateFilter, setDateFilter] = useState('7D');
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getRoleBadgeStyle = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'retail_manager':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'inventory_manager':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'procurement_manager':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'analyst':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'customer_support':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const formattedRole = user?.role
    ? user.role.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())
    : 'Viewer';

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between shrink-0 shadow-xs z-20">
      {/* Left section: Drawer Toggle & Global Search Bar */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="md:hidden p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          title="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search Bar */}
        <div className="relative w-48 sm:w-72 md:w-80 lg:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search SKUs, orders, suppliers, or ask AI..."
            className="w-full bg-slate-50 border border-slate-200/90 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
          />
        </div>

        {/* Store Selector */}
        <div className="hidden lg:flex items-center gap-1.5 bg-slate-50 border border-slate-200/90 rounded-xl px-3 py-1.5 text-xs text-slate-700">
          <Store className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={storeFilter}
            onChange={(e) => setStoreFilter(e.target.value)}
            className="bg-transparent font-medium text-slate-800 focus:outline-none cursor-pointer"
          >
            <option value="ALL_STORES">All Stores (Global)</option>
            <option value="STORE_USA">RetailSense Hub (USA)</option>
            <option value="STORE_UK">RetailSense Hub (UK)</option>
            <option value="STORE_GERMANY">RetailSense Hub (Germany)</option>
            <option value="STORE_JAPAN">RetailSense Hub (Japan)</option>
          </select>
        </div>

        {/* Date Selector */}
        <div className="hidden xl:flex items-center gap-1.5 bg-slate-50 border border-slate-200/90 rounded-xl px-3 py-1.5 text-xs text-slate-700">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="bg-transparent font-medium text-slate-800 focus:outline-none cursor-pointer"
          >
            <option value="7D">Last 7 Days</option>
            <option value="14D">Last 14 Days</option>
            <option value="30D">Last 30 Days</option>
            <option value="90D">Last 90 Days</option>
            <option value="YTD">Year To Date</option>
          </select>
        </div>
      </div>

      {/* Right Controls: Theme, Notifications, User Profile */}
      <div className="flex items-center gap-3">
        {/* Theme Toggle */}
        <button
          onClick={() => setIsDark(!isDark)}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          title="Toggle Theme"
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>

        {/* Notifications Button */}
        <button 
          className="relative p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          title="System Notifications"
        >
          <Bell className="w-4 h-4 text-slate-600" />
          <span className="w-2 h-2 rounded-full bg-blue-600 absolute top-1.5 right-1.5 ring-2 ring-white"></span>
        </button>

        {/* User Profile Dropdown Menu */}
        <div className="relative pl-2 border-l border-slate-200" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-slate-50 transition-colors focus:outline-none"
          >
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
              {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-xs font-bold text-slate-900 leading-tight">
                {user?.full_name || 'System User'}
              </p>
              <div className="flex items-center gap-1 mt-0.5">
                <span className={`text-[10px] font-semibold px-1.5 py-0.2 rounded border ${getRoleBadgeStyle(user?.role)}`}>
                  {formattedRole}
                </span>
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {/* Dropdown Menu Overlay */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200/90 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-4 py-3 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-900">{user?.full_name}</p>
                <p className="text-xs text-slate-500">{user?.email}</p>
                <div className="mt-2 flex items-center gap-1.5 text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-2 py-1">
                  <CheckCircle className="w-3 h-3" />
                  <span>Role Scope: {formattedRole}</span>
                </div>
              </div>

              <div className="py-1">
                <div className="px-4 py-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Session Permissions
                </div>
                <div className="px-4 py-1 text-xs text-slate-600 space-y-1">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                    <span>Active Token Expiry: 24h</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-1">
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    logout();
                  }}
                  className="w-full text-left px-4 py-2.5 text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
