import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  LayoutDashboard,
  Map,
  Sparkles,
  CalendarDays,
  Wallet,
  BookmarkCheck,
  Heart,
  Star,
  User,
  LogOut,
  Menu,
  X,
  Compass,
} from 'lucide-react';

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = [
    { label: 'Overview', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Smart Composer', path: '/dashboard/composer', icon: Sparkles, badge: 'AI/Math' },
    { label: 'My Trips', path: '/dashboard/trips', icon: Map },
    { label: 'Bookings', path: '/dashboard/bookings', icon: BookmarkCheck },
    { label: 'Favorites', path: '/dashboard/favorites', icon: Heart },
    { label: 'My Reviews', path: '/dashboard/reviews', icon: Star },
    { label: 'Profile', path: '/dashboard/profile', icon: User },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-beige/40 flex flex-col md:flex-row">
      {/* Mobile Header Bar */}
      <div className="md:hidden bg-forest-900 text-white px-4 py-3 flex items-center justify-between border-b border-forest-800">
        <Link to="/" className="flex items-center space-x-2">
          <Compass className="w-5 h-5 text-beige" />
          <span className="font-display font-bold text-lg tracking-tight">TravelCraft</span>
        </Link>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="text-ivory p-1.5 focus:outline-none"
        >
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar - Forest Green Palette */}
      <aside
        className={`fixed md:sticky top-0 z-40 h-screen w-64 bg-forest-900 text-ivory flex flex-col justify-between transition-transform duration-200 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div>
          {/* Brand */}
          <div className="h-16 px-6 border-b border-forest-800 flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2.5">
              <div className="w-8 h-8 bg-beige rounded flex items-center justify-center text-forest-900 font-bold">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <span className="font-display text-lg font-bold tracking-tight text-white block leading-tight">
                  TravelCraft
                </span>
                <span className="text-[10px] tracking-widest text-forest-300 uppercase block">
                  User Workspace
                </span>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.path === '/dashboard'
                  ? location.pathname === '/dashboard'
                  : location.pathname.startsWith(item.path);

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-forest-800 text-white font-semibold shadow-xs'
                      : 'text-forest-200 hover:bg-forest-800/50 hover:text-white'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="w-4 h-4 text-forest-300" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[9px] bg-terracotta text-white font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Card & Logout */}
        <div className="p-4 border-t border-forest-800/80">
          <div className="flex items-center space-x-3 px-3 py-2 bg-forest-800/40 rounded mb-2">
            <div className="w-8 h-8 rounded bg-forest-700 text-white flex items-center justify-center font-bold text-xs">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">{user?.name}</p>
              <p className="text-[10px] text-forest-300 truncate">{user?.email}</p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <Link
              to="/"
              className="text-xs text-forest-300 hover:text-white transition-colors"
            >
              ← Back to Site
            </Link>
            <button
              onClick={handleLogout}
              className="text-xs text-red-300 hover:text-red-200 flex items-center space-x-1"
            >
              <LogOut className="w-3.5 h-3.5 mr-1" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
