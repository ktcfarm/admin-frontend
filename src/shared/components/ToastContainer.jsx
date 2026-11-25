import React, { useEffect } from 'react';
import { Info, CheckCircle2, AlertTriangle, AlertCircle, X } from 'lucide-react';
import { useUiStore } from '../../core/ui/ui.store.js';
import { cn } from '../utils/cn.js';

const typeConfig = {
  info: {
    icon: Info,
    iconColor: 'text-blue-500',
    border: 'border-blue-100',
    bg: 'bg-white',
  },
  success: {
    icon: CheckCircle2,
    iconColor: 'text-emerald-600',
    border: 'border-emerald-100',
    bg: 'bg-white',
  },
  warning: {
    icon: AlertTriangle,
    iconColor: 'text-amber-500',
    border: 'border-amber-100',
    bg: 'bg-white',
  },
  error: {
    icon: AlertCircle,
    iconColor: 'text-rose-600',
    border: 'border-rose-100',
    bg: 'bg-white',
  },
};

function ToastItem({ toast, onRemove }) {
  const { id, type = 'info', title, message, duration = 4000 } = toast;
  const config = typeConfig[type] || typeConfig.info;
  const Icon = config.icon;

  useEffect(() => {
    if (!duration || duration <= 0) return;
    const timer = setTimeout(() => {
      onRemove(id);
    }, duration);
    return () => clearTimeout(timer);
  }, [id, duration, onRemove]);

  return (
    <div
      role="status"
      className={cn(
        'pointer-events-auto flex items-start gap-3 w-full p-4 rounded-xl shadow-lg border text-sm transition-all duration-200',
        config.bg,
        config.border
      )}
    >
      <div className={cn('flex-shrink-0 mt-0.5', config.iconColor)}>
        <Icon className="w-5 h-5" />
      </div>

      <div className="flex-1 min-w-0">
        {title && <h6 className="font-semibold text-gray-900 mb-0.5">{title}</h6>}
        {message && <p className="text-xs text-gray-600 leading-relaxed">{message}</p>}
      </div>

      <button
        type="button"
        onClick={() => onRemove(id)}
        className="flex-shrink-0 -mr-1 -mt-1 p-1 text-gray-400 hover:text-gray-600 rounded-lg transition-colors focus:outline-none"
        aria-label="Close notification"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export function ToastContainer({
  toasts: propToasts,
  onRemove: propOnRemove,
  position = 'top-right',
  className = '',
}) {
  const storeToasts = useUiStore((state) => state.toasts);
  const storeRemove = useUiStore((state) => state.removeToast);

  const activeToasts = propToasts || storeToasts || [];
  const handleRemove = propOnRemove || storeRemove;

  if (activeToasts.length === 0) return null;

  const positionClasses = {
    'top-right': 'top-5 right-5',
    'top-left': 'top-5 left-5',
    'bottom-right': 'bottom-5 right-5',
    'bottom-left': 'bottom-5 left-5',
  };

  return (
    <aside
      aria-live="polite"
      aria-label="Notifications"
      className={cn(
        'fixed z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none',
        positionClasses[position] || positionClasses['top-right'],
        className
      )}
    >
      {activeToasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={handleRemove} />
      ))}
    </aside>
  );
}
