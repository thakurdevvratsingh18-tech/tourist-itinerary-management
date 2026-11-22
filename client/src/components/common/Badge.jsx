import React from 'react';

const VARIANTS = {
  default: 'bg-gray-100 text-gray-800 border-gray-200',
  forest: 'bg-forest-100 text-forest-900 border-forest-200',
  terracotta: 'bg-terracotta/10 text-terracotta border-terracotta/20',
  success: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  warning: 'bg-amber-50 text-amber-800 border-amber-200',
  danger: 'bg-red-50 text-red-800 border-red-200',
  blue: 'bg-sky-50 text-sky-800 border-sky-200',
};

export default function Badge({ label, variant = 'default', size = 'text-xs', className = '' }) {
  const chosenVariant = VARIANTS[variant] || VARIANTS.default;
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded font-medium border uppercase tracking-wider ${size} ${chosenVariant} ${className}`}
    >
      {label}
    </span>
  );
}
