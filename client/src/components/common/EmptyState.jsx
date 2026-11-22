import React from 'react';
import { FolderOpen } from 'lucide-react';

export default function EmptyState({
  title = 'No records found',
  description = 'There is currently no information to display.',
  actionLabel,
  onAction,
  icon: Icon = FolderOpen,
}) {
  return (
    <div className="text-center py-12 px-4 border border-dashed border-gray-300 rounded bg-white/50">
      <Icon className="w-10 h-10 text-gray-400 mx-auto mb-3 stroke-1" />
      <h3 className="font-display text-lg text-charcoal font-medium mb-1">{title}</h3>
      <p className="text-xs text-gray-500 max-w-sm mx-auto mb-5">{description}</p>
      {actionLabel && onAction && (
        <button onClick={onAction} className="btn-primary text-xs py-2 px-4">
          {actionLabel}
        </button>
      )}
    </div>
  );
}
