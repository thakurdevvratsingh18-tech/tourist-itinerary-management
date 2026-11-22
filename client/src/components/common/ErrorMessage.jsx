import React from 'react';
import { AlertCircle } from 'lucide-react';

export default function ErrorMessage({ message = 'An unexpected error occurred', onRetry }) {
  return (
    <div className="p-4 bg-red-50 border border-red-200 rounded text-red-800 text-sm flex items-start justify-between">
      <div className="flex items-center space-x-2.5">
        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
        <span>{message}</span>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="text-xs font-semibold underline hover:text-red-950 ml-4 flex-shrink-0"
        >
          Try Again
        </button>
      )}
    </div>
  );
}
