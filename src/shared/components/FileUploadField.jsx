import React, { useId, useRef } from 'react';
import {
  CheckCircle2,
  Eye,
  FileText,
  RefreshCw,
  Trash2,
  Upload
} from 'lucide-react';
import { Button } from './Button.jsx';
import { StatusBadge } from './StatusBadge.jsx';
import { cn } from '../utils/cn.js';

const statusBadgeVariant = {
  APPROVED: 'success',
  VERIFIED: 'success',
  PENDING: 'warning',
  REJECTED: 'danger'
};

export function FileUploadField({
  label,
  required = false,
  requiredLabel = 'Compulsory',
  optionalLabel = 'Optional',
  accept = '.pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/jpeg,image/png,image/webp',
  acceptedFormatsLabel = 'PDF, JPG, PNG, WebP',
  fileName = '',
  status,
  statusLabel,
  rejectionReason = '',
  uploading = false,
  disabled = false,
  error = '',
  onFileSelect,
  onPreview,
  onRemove,
  uploadLabel = 'Upload',
  replaceLabel = 'Replace',
  previewLabel = 'Preview',
  uploadingLabel = 'Uploading...',
  className = ''
}) {
  const inputId = useId();
  const inputRef = useRef(null);

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (file && onFileSelect) {
      onFileSelect(file);
    }
    event.target.value = '';
  };

  const hasFile = Boolean(fileName);
  const badgeStatus = status ? statusBadgeVariant[status] || 'neutral' : null;

  return (
    <div
      className={cn(
        'rounded-xl border border-gray-200 bg-white p-3.5 transition-colors',
        error && 'border-red-300 bg-red-50/30',
        className
      )}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <label
              htmlFor={inputId}
              className="text-sm font-semibold text-gray-900 cursor-pointer"
            >
              {label}
            </label>

            <StatusBadge
              status={required ? 'gold' : 'neutral'}
              size="sm"
              dot={false}
            >
              {required ? requiredLabel : optionalLabel}
            </StatusBadge>

            {badgeStatus && (
              <StatusBadge status={badgeStatus} size="sm">
                {statusLabel || status}
              </StatusBadge>
            )}
          </div>

          <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
            {hasFile ? (
              <span className="inline-flex items-center gap-1.5 font-medium text-[#0E4B2E] truncate">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <FileText className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{fileName}</span>
              </span>
            ) : (
              <span>{acceptedFormatsLabel}</span>
            )}
          </div>

          {rejectionReason && (
            <p className="mt-1 text-xs text-red-600">{rejectionReason}</p>
          )}
          {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <input
            ref={inputRef}
            id={inputId}
            type="file"
            accept={accept}
            disabled={disabled || uploading}
            onChange={handleFileChange}
            className="sr-only"
          />

          {hasFile && onPreview && (
            <Button
              size="sm"
              variant="outline"
              leftIcon={Eye}
              disabled={uploading}
              onClick={onPreview}
            >
              {previewLabel}
            </Button>
          )}

          <Button
            size="sm"
            variant={hasFile ? 'outline' : 'primary'}
            leftIcon={hasFile ? RefreshCw : Upload}
            loading={uploading}
            disabled={disabled}
            onClick={() => inputRef.current?.click()}
          >
            {uploading ? uploadingLabel : hasFile ? replaceLabel : uploadLabel}
          </Button>

          {hasFile && onRemove && !disabled && (
            <Button
              size="sm"
              variant="ghost"
              leftIcon={Trash2}
              disabled={uploading}
              onClick={onRemove}
              className="text-red-600 hover:bg-red-50 hover:text-red-700"
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default FileUploadField;
