import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center space-y-4">
      <div className="w-12 h-12 bg-beige rounded flex items-center justify-center text-forest-800 mb-2">
        <Compass className="w-6 h-6" />
      </div>
      <h1 className="font-display text-5xl font-bold text-charcoal">404</h1>
      <h2 className="font-display text-xl font-semibold text-gray-700">Page Off The Beaten Path</h2>
      <p className="text-xs text-gray-500 max-w-sm">
        The destination or page you were trying to access does not exist or has been relocated.
      </p>
      <Link to="/" className="btn-primary text-xs py-2.5 px-5 inline-flex items-center space-x-1.5 mt-2">
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Return to Homepage</span>
      </Link>
    </div>
  );
}
