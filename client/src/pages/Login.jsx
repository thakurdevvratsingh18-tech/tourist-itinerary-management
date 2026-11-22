import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Compass, Mail, Lock, ArrowRight } from 'lucide-react';
import { toast } from 'react-toastify';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(email, password);
      toast.success(`Welcome back, ${user.name}!`);
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate(from, { replace: true });
      }
    } catch (err) {
      toast.error(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = (type) => {
    if (type === 'admin') {
      setEmail('admin@travelcraft.com');
      setPassword('Admin@123');
    } else {
      setEmail('user@travelcraft.com');
      setPassword('User@123');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="card p-8 w-full max-w-md space-y-6">
        <div className="text-center space-y-1">
          <div className="w-10 h-10 bg-forest-800 rounded mx-auto flex items-center justify-center text-white mb-2 shadow-sm">
            <Compass className="w-5 h-5 text-beige" />
          </div>
          <h1 className="font-display text-2xl font-bold text-charcoal">Sign In to TravelCraft</h1>
          <p className="text-xs text-gray-500">Access your saved itineraries, trips, and route plans.</p>
        </div>

        {/* Demo Account Pills */}
        <div className="p-3 bg-beige/60 rounded border border-gray-200/80 text-xs space-y-2">
          <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider block">
            Demo Credentials (1-Click Fill):
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => handleDemoFill('user')}
              className="flex-1 py-1 px-2 bg-white border border-gray-200 rounded text-xs font-medium text-forest-900 hover:border-forest-700 transition-colors"
            >
              Demo User
            </button>
            <button
              type="button"
              onClick={() => handleDemoFill('admin')}
              className="flex-1 py-1 px-2 bg-white border border-gray-200 rounded text-xs font-medium text-forest-900 hover:border-forest-700 transition-colors"
            >
              Demo Admin
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field pl-9 text-xs"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-semibold text-gray-600">Password</label>
              <Link to="/forgot-password" className="text-[11px] text-forest-800 hover:underline">
                Forgot?
              </Link>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field pl-9 text-xs"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full text-xs py-2.5 flex items-center justify-center space-x-1"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        <div className="text-center text-xs text-gray-500 pt-2 border-t border-gray-100">
          Don't have an account?{' '}
          <Link to="/register" className="font-semibold text-forest-800 hover:underline">
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
}
