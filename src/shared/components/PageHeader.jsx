import React from 'react';
import { ChevronRight } from 'lucide-react';
import { cn } from '../utils/cn.js';

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  actions,
  breadcrumbs = [],
  className = '',
}) {
  return (
    <div
      className={cn(
        'flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-gray-200/80 mb-6',
        className
      )}
    >
      <div className="flex-1 min-w-0">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav aria-label="Breadcrumb" className="mb-2">
            <ol className="flex items-center gap-1.5 text-xs text-gray-500">
              {breadcrumbs.map((crumb, idx) => {
                const isLast = idx === breadcrumbs.length - 1;
                return (
                  <li key={crumb.label ?? idx} className="flex items-center gap-1.5">
                    {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-gray-400" />}
                    {isLast ? (
                      <span className="font-medium text-gray-800" aria-current="page">
                        {crumb.label}
                      </span>
                    ) : crumb.href ? (
                      <a
                        href={crumb.href}
                        className="hover:text-gray-900 transition-colors"
                      >
                        {crumb.label}
                      </a>
                    ) : crumb.onClick ? (
                      <button
                        type="button"
                        onClick={crumb.onClick}
                        className="hover:text-gray-900 transition-colors"
                      >
                        {crumb.label}
                      </button>
                    ) : (
                      <span>{crumb.label}</span>
                    )}
                  </li>
                );
              })}
            </ol>
          </nav>
        )}

        {eyebrow && (
          <p className="text-xs font-semibold uppercase tracking-wider text-[#0E4B2E] mb-1">
            {eyebrow}
          </p>
        )}

        {title && (
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight sm:text-3xl">
            {title}
          </h1>
        )}

        {subtitle && (
          <p className="text-sm text-gray-500 mt-1 max-w-3xl">{subtitle}</p>
        )}
      </div>

      {actions && (
        <div className="flex items-center gap-3 flex-shrink-0">{actions}</div>
      )}
    </div>
  );
}
