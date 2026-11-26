import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useCopy } from '../../../core/constants/index.js';
import {
  Button,
  Input,
  StatusBadge
} from '../../../shared/components/index.js';

export function BulkTiersEditor({
  rows = [],
  onChange,
  unit = 'KG',
  consumerSellRate = '',
  disabled = false
}) {
  const copy = useCopy();
  const tiersCopy = copy.pricing.tiersEditor;

  const sellNum = Number(consumerSellRate);
  const hasSellRate = Number.isFinite(sellNum) && sellNum > 0;

  const handleAddTier = () => {
    const lastQty = rows.length > 0 ? Number(rows[rows.length - 1].minQty) || 0 : 0;
    const suggestedQty = lastQty > 0 ? String(lastQty * 2) : '10';
    onChange([...rows, { minQty: suggestedQty, unitPrice: '', label: '' }]);
  };

  const handleRowChange = (index, field, value) => {
    onChange(
      rows.map((row, idx) => (idx === index ? { ...row, [field]: value } : row))
    );
  };

  const handleRemoveRow = (index) => {
    onChange(rows.filter((_, idx) => idx !== index));
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50/60 p-4 space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h4 className="text-sm font-semibold text-gray-900">{tiersCopy.title}</h4>
          <p className="text-xs text-gray-500 mt-0.5">{tiersCopy.subtitle}</p>
        </div>

        {!disabled && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            leftIcon={Plus}
            disabled={rows.length >= 10}
            onClick={handleAddTier}
          >
            {tiersCopy.addTierBtn}
          </Button>
        )}
      </div>

      {rows.length === 0 ? (
        <p className="text-xs text-gray-500 italic py-1">{tiersCopy.emptyNotice}</p>
      ) : (
        <div className="space-y-2.5">
          {rows.map((row, index) => {
            const tierPriceNum = Number(row.unitPrice);
            const discountPct =
              hasSellRate && Number.isFinite(tierPriceNum) && tierPriceNum > 0
                ? (((sellNum - tierPriceNum) / sellNum) * 100).toFixed(1)
                : null;

            return (
              <div
                key={`tier-${index}`}
                className="bg-white p-3 rounded-lg border border-gray-200 space-y-2"
              >
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end w-full">
                  <div className="sm:col-span-3 min-w-0">
                    <Input
                      label={index === 0 ? tiersCopy.minQtyLabel : undefined}
                      type="number"
                      min="0.01"
                      step="any"
                      suffix={unit}
                      disabled={disabled}
                      value={row.minQty}
                      placeholder="10"
                      onChange={(e) => handleRowChange(index, 'minQty', e.target.value)}
                    />
                  </div>

                  <div className="sm:col-span-4 min-w-0">
                    <Input
                      label={index === 0 ? tiersCopy.unitPriceLabel : undefined}
                      type="number"
                      min="0.01"
                      step="0.01"
                      prefix="₹"
                      disabled={disabled}
                      value={row.unitPrice}
                      placeholder="0.00"
                      onChange={(e) =>
                        handleRowChange(index, 'unitPrice', e.target.value)
                      }
                    />
                  </div>

                  <div className="sm:col-span-4 min-w-0">
                    <Input
                      label={index === 0 ? tiersCopy.labelHeading : undefined}
                      disabled={disabled}
                      value={row.label}
                      placeholder={tiersCopy.labelPlaceholder}
                      onChange={(e) => handleRowChange(index, 'label', e.target.value)}
                    />
                  </div>

                  <div className="sm:col-span-1 min-w-0 flex justify-end pb-0.5">
                    {!disabled && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveRow(index)}
                        aria-label="Remove tier"
                        className="text-rose-600 hover:bg-rose-50 hover:text-rose-700 px-2"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>

                {discountPct !== null && (
                  <div className="flex items-center justify-end gap-1.5">
                    <span className="text-[11px] text-gray-500">
                      {tiersCopy.discountPrefix}
                    </span>
                    <StatusBadge
                      status={Number(discountPct) >= 0 ? 'success' : 'danger'}
                      size="sm"
                      dot={false}
                    >
                      {discountPct}%
                    </StatusBadge>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default BulkTiersEditor;
