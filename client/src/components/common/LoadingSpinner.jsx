import React from 'react';

export default function LoadingSpinner({ message = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-3">
      <div className="w-8 h-8 border-3 border-forest-200 border-t-forest-800 rounded-full animate-spin"></div>
      {message && <p className="text-xs text-gray-500 font-medium">{message}</p>}
    </div>
  );
}
