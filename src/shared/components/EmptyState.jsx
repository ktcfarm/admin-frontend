import React from 'react';
import { FolderOpen } from 'lucide-react';
import { cn } from '../utils/cn.js';

export function EmptyState({
  icon: Icon = FolderOpen,
  title = 'No records found',
  description = 'There are no items matching your criteria at this moment.',
  action,
  className = '',
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-8 text-center',
        className
      )}
    >
      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 text-gray-400 mb-3.5">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-base font-semibold text-gray-900 mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-gray-500 max-w-sm mb-4">{description}</p>
      )}
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
}
