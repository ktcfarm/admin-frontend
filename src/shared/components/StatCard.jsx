import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '../utils/cn.js';

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  className = '',
  onClick,
}) {
  const isClickable = Boolean(onClick);

  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex flex-col justify-between transition-all',
        isClickable && 'cursor-pointer hover:border-gray-300 hover:shadow-md active:scale-[0.99]',
        className
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <h4 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight mt-1">
            {value}
          </h4>
        </div>

        {Icon && (
          <div className="flex-shrink-0 p-3 rounded-xl bg-[#ECFDF5] text-[#0E4B2E]">
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>

      {(trend || subtitle) && (
        <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-gray-100 text-xs">
          {trend && (
            <div
              className={cn(
                'inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-medium',
                trend.direction === 'up' && 'text-emerald-700 bg-emerald-50 border border-emerald-100',
                trend.direction === 'down' && 'text-rose-700 bg-rose-50 border border-rose-100',
                (!trend.direction || trend.direction === 'neutral') &&
                  'text-gray-600 bg-gray-100 border border-gray-200'
              )}
            >
              {trend.direction === 'up' && <TrendingUp className="w-3.5 h-3.5" />}
              {trend.direction === 'down' && <TrendingDown className="w-3.5 h-3.5" />}
              {(!trend.direction || trend.direction === 'neutral') && (
                <Minus className="w-3.5 h-3.5" />
              )}
              <span>{trend.value}</span>
            </div>
          )}

          {trend?.label && <span className="text-gray-500">{trend.label}</span>}

          {!trend && subtitle && <span className="text-gray-500">{subtitle}</span>}
        </div>
      )}
    </div>
  );
}
