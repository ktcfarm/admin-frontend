import React from 'react';
import { Info, CheckCircle2, AlertTriangle, AlertCircle, X } from 'lucide-react';
import { cn } from '../utils/cn.js';

const alertConfig = {
  info: {
    container: 'bg-blue-50 border-blue-200 text-blue-900',
    icon: Info,
    iconColor: 'text-blue-600',
  },
  success: {
    container: 'bg-emerald-50 border-emerald-200 text-emerald-900',
    icon: CheckCircle2,
    iconColor: 'text-emerald-600',
  },
  warning: {
    container: 'bg-amber-50 border-amber-200 text-amber-900',
    icon: AlertTriangle,
    iconColor: 'text-amber-600',
  },
  error: {
    container: 'bg-rose-50 border-rose-200 text-rose-900',
    icon: AlertCircle,
    iconColor: 'text-rose-600',
  },
};

export function Alert({
  type = 'info',
  title,
  children,
  onClose,
  className = '',
}) {
  const config = alertConfig[type] || alertConfig.info;
  const Icon = config.icon;

  return (
    <div
      role="alert"
      className={cn(
        'relative flex items-start gap-3 p-4 rounded-xl border text-sm',
        config.container,
        className
      )}
    >
      <div className={cn('flex-shrink-0 mt-0.5', config.iconColor)}>
        <Icon className="w-5 h-5" />
      </div>

      <div className="flex-1 min-w-0">
        {title && <h5 className="font-semibold mb-0.5">{title}</h5>}
        {children && <div className="text-xs leading-relaxed opacity-90">{children}</div>}
      </div>

      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="flex-shrink-0 -mr-1 -mt-1 p-1 rounded-lg opacity-60 hover:opacity-100 transition-opacity focus:outline-none"
          aria-label="Dismiss alert"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
