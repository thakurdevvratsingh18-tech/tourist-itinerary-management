import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  LayoutDashboard,
  Users,
  MapPin,
  Map,
  MessageSquare,
  Mail,
  Shield,
  LogOut,
  Compass,
  Menu,
  X,
} from 'lucide-react';

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const adminNav = [
    { label: 'Admin Dashboard', path: '/admin', icon: LayoutDashboard },
    { label: 'User Management', path: '/admin/users', icon: Users },
    { label: 'Destinations CRUD', path: '/admin/destinations', icon: MapPin },
    { label: 'Trip Monitoring', path: '/admin/trips', icon: Map },
    { label: 'Review Moderation', path: '/admin/reviews', icon: MessageSquare },
    { label: 'Contact Messages', path: '/admin/contact', icon: Mail },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Mobile Top Header */}
      <div className="md:hidden bg-charcoal text-white px-4 py-3 flex items-center justify-between border-b border-gray-700">
        <div className="flex items-center space-x-2">
          <Shield className="w-5 h-5 text-terracotta" />
          <span className="font-display font-bold text-lg">Admin Control</span>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="text-gray-300 p-1.5 focus:outline-none"
        >
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Admin Sidebar */}
      <aside
        className={`fixed md:sticky top-0 z-40 h-screen w-64 bg-charcoal text-gray-200 flex flex-col justify-between transition-transform duration-200 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div>
          {/* Header */}
          <div className="h-16 px-6 border-b border-gray-700 flex items-center space-x-2.5">
            <div className="w-8 h-8 bg-terracotta rounded flex items-center justify-center text-white">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <span className="font-display text-lg font-bold text-white block leading-tight">
                TravelCraft
              </span>
              <span className="text-[10px] tracking-widest text-gray-400 uppercase block">
                Administrator
              </span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="p-4 space-y-1">
            {adminNav.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.path === '/admin'
                  ? location.pathname === '/admin'
                  : location.pathname.startsWith(item.path);

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center space-x-3 px-3.5 py-2.5 rounded text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-forest-800 text-white font-semibold'
                      : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4 text-gray-400" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-gray-700">
          <div className="flex items-center space-x-3 px-3 py-2 bg-gray-800/80 rounded mb-3">
            <div className="w-8 h-8 rounded bg-forest-700 text-white flex items-center justify-center font-bold text-xs">
              A
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">{user?.name || 'Administrator'}</p>
              <p className="text-[10px] text-gray-400 truncate">{user?.email || 'admin@travelcraft.com'}</p>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <Link to="/dashboard" className="text-gray-400 hover:text-white transition-colors">
              User Dashboard →
            </Link>
            <button
              onClick={handleLogout}
              className="text-red-400 hover:text-red-300 flex items-center"
            >
              <LogOut className="w-3.5 h-3.5 mr-1" />
              <span>Exit</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
