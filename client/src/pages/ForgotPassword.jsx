import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../services/api';
import { Compass, Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { toast } from 'react-toastify';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [dispatched, setDispatched] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authService.forgotPassword(email);
      setDispatched(true);
      toast.success('Password reset instructions generated.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to request reset. Please verify email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="card p-8 w-full max-w-md space-y-6">
        <div className="text-center space-y-1">
          <div className="w-10 h-10 bg-forest-800 rounded mx-auto flex items-center justify-center text-white mb-2 shadow-sm">
            <Compass className="w-5 h-5 text-beige" />
          </div>
          <h1 className="font-display text-2xl font-bold text-charcoal">Reset Password</h1>
          <p className="text-xs text-gray-500">
            Enter your registered email and we'll send you recovery instructions.
          </p>
        </div>

        {dispatched ? (
          <div className="text-center py-6 space-y-3">
            <CheckCircle2 className="w-10 h-10 text-forest-700 mx-auto" />
            <h3 className="font-display text-base font-bold text-charcoal">Check Your Inbox</h3>
            <p className="text-xs text-gray-500">
              If an account matches <strong>{email}</strong>, a password reset link has been dispatched.
            </p>
            <Link to="/login" className="btn-secondary text-xs inline-block mt-4">
              Return to Login
            </Link>
          </div>
        ) : (
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

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full text-xs py-2.5"
            >
              {loading ? 'Processing...' : 'Send Reset Link'}
            </button>

            <div className="text-center pt-2">
              <Link
                to="/login"
                className="inline-flex items-center text-xs text-forest-800 hover:underline"
              >
                <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                <span>Back to Sign In</span>
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
