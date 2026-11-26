import { useEffect, useId, useState } from 'react';
import { Info } from 'lucide-react';
import { cn } from '../utils/cn.js';

export function InfoTooltip({
  content,
  label = 'More information',
  align = 'center',
  className = ''
}) {
  const [open, setOpen] = useState(false);
  const tooltipId = useId();

  useEffect(() => {
    if (!open) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  if (!content) return null;

  const alignClasses =
    align === 'left'
      ? 'left-0'
      : align === 'right'
        ? 'right-0'
        : 'left-1/2 -translate-x-1/2';

  return (
    <span
      className={cn('relative inline-flex items-center align-middle', className)}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        aria-label={label}
        aria-describedby={open ? tooltipId : undefined}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex items-center justify-center rounded-full p-0.5 text-slate-400 hover:text-[#0E4B2E] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0E4B2E]/30 transition-colors"
      >
        <Info className="w-3.5 h-3.5" aria-hidden="true" />
      </button>

      {open ? (
        <span
          id={tooltipId}
          role="tooltip"
          className={cn(
            'absolute bottom-full mb-2 z-50 w-60 rounded-lg bg-[#082a19] border border-white/10 px-3 py-2 text-xs font-normal leading-relaxed text-white shadow-lg pointer-events-none',
            alignClasses
          )}
        >
          {content}
        </span>
      ) : null}
    </span>
  );
}
