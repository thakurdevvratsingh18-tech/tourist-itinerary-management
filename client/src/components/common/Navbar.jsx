import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Compass, User, LogOut, Menu, X, Sparkles, MapPin, Shield } from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setUserDropdownOpen(false);
  };

  const navLinks = [
    { label: 'Destinations', path: '/destinations' },
    { label: 'Smart Composer', path: '/dashboard/composer', badge: 'Signature' },
    { label: 'About', path: '/about' },
    { label: 'Contact', path: '/contact' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-ivory/95 backdrop-blur-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2.5">
            <div className="w-9 h-9 bg-forest-800 rounded flex items-center justify-center text-white shadow-sm">
              <Compass className="w-5 h-5 text-beige" />
            </div>
            <div>
              <span className="font-display text-xl font-bold tracking-tight text-forest-900 block leading-tight">
                TravelCraft
              </span>
              <span className="text-[10px] uppercase tracking-widest text-gray-500 block leading-none">
                Itinerary Management
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                  location.pathname === link.path
                    ? 'text-forest-800 font-semibold'
                    : 'text-gray-600 hover:text-forest-800'
                }`}
              >
                <span>{link.label}</span>
                {link.badge && (
                  <span className="text-[10px] bg-terracotta/10 text-terracotta px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                    {link.badge}
                  </span>
                )}
              </Link>
            ))}
          </nav>

          {/* User / Auth CTA */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center space-x-2 text-sm text-charcoal bg-beige px-3 py-1.5 border border-gray-300 rounded hover:border-forest-700 transition-colors"
                >
                  <div className="w-6 h-6 rounded-full bg-forest-700 text-white flex items-center justify-center text-xs font-bold">
                    {user?.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <span className="font-medium max-w-[120px] truncate">{user?.name}</span>
                </button>

                {userDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded shadow-lg py-1.5 z-50"
                    onMouseLeave={() => setUserDropdownOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-xs text-gray-400">Signed in as</p>
                      <p className="text-sm font-semibold truncate text-charcoal">{user?.email}</p>
                    </div>

                    <Link
                      to="/dashboard"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-forest-50 hover:text-forest-900"
                    >
                      <User className="w-4 h-4 mr-2.5 text-gray-400" />
                      Dashboard
                    </Link>

                    <Link
                      to="/dashboard/composer"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-forest-50 hover:text-forest-900"
                    >
                      <Sparkles className="w-4 h-4 mr-2.5 text-terracotta" />
                      Smart Composer
                    </Link>

                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center px-4 py-2 text-sm text-forest-800 font-medium hover:bg-forest-50"
                      >
                        <Shield className="w-4 h-4 mr-2.5 text-forest-700" />
                        Admin Panel
                      </Link>
                    )}

                    <button
                      onClick={handleLogout}
                      className="w-full text-left flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 border-t border-gray-100 mt-1"
                    >
                      <LogOut className="w-4 h-4 mr-2.5" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="text-sm font-medium text-charcoal hover:text-forest-800 px-3 py-1.5"
                >
                  Sign In
                </Link>
                <Link to="/register" className="btn-primary text-xs py-2 px-4">
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-600 hover:text-forest-800 p-2"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-200 px-4 pt-3 pb-6 space-y-3">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-base font-medium text-gray-700 hover:text-forest-800 border-b border-gray-50"
            >
              {link.label}
            </Link>
          ))}

          {isAuthenticated ? (
            <div className="pt-2 space-y-2">
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-base font-medium text-forest-800"
              >
                Go to Dashboard
              </Link>
              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2 text-base font-medium text-forest-900"
                >
                  Admin Console
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="block w-full text-left py-2 text-base font-medium text-red-600"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="pt-4 flex flex-col space-y-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="btn-secondary w-full text-center"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="btn-primary w-full text-center"
              >
                Create Account
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
