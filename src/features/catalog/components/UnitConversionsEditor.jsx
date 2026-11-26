import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useCopy } from '../../../core/constants/index.js';
import {
  Button,
  Input,
  Select,
  StatusBadge
} from '../../../shared/components/index.js';
import {
  QUICK_UNIT_PRESETS,
  TRADE_UNITS
} from '../constants/catalog.constants.js';

export function UnitConversionsEditor({
  baseUnit = 'KG',
  rows = [],
  onChange,
  inheritedConversions = null,
  disabled = false
}) {
  const copy = useCopy();
  const unitCopy = copy.catalog.unitEditor;
  const tradeUnitCopy = copy.catalog.tradeUnits;

  const availableUnits = TRADE_UNITS.filter((unit) => unit !== baseUnit);
  const presets = QUICK_UNIT_PRESETS[baseUnit] || QUICK_UNIT_PRESETS.KG;

  const handleAddRow = () => {
    const usedUnits = new Set(rows.map((r) => r.unit));
    const nextUnit = availableUnits.find((u) => !usedUnits.has(u)) || availableUnits[0];
    onChange([...rows, { unit: nextUnit, factor: '' }]);
  };

  const handleApplyPreset = (preset) => {
    const existingIndex = rows.findIndex((r) => r.unit === preset.unit);
    if (existingIndex >= 0) {
      const updated = rows.map((row, idx) =>
        idx === existingIndex ? { ...row, factor: String(preset.factor) } : row
      );
      onChange(updated);
    } else {
      onChange([...rows, { unit: preset.unit, factor: String(preset.factor) }]);
    }
  };

  const handleRowChange = (index, field, value) => {
    const updated = rows.map((row, idx) =>
      idx === index ? { ...row, [field]: value } : row
    );
    onChange(updated);
  };

  const handleRemoveRow = (index) => {
    onChange(rows.filter((_, idx) => idx !== index));
  };

  const inheritedEntries =
    inheritedConversions && typeof inheritedConversions === 'object'
      ? Object.entries(inheritedConversions).filter(([u]) => u !== baseUnit)
      : [];

  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50/60 p-4 space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h4 className="text-sm font-semibold text-gray-900">{unitCopy.title}</h4>
          <p className="text-xs text-gray-500 mt-0.5">
            {unitCopy.subtitlePrefix} <span className="font-semibold text-ktc-green">{baseUnit}</span>.
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          leftIcon={Plus}
          disabled={disabled || rows.length >= availableUnits.length}
          onClick={handleAddRow}
        >
          {unitCopy.addUnitBtn}
        </Button>
      </div>

      {inheritedEntries.length > 0 && (
        <div className="rounded-lg bg-white border border-gray-200 p-2.5 space-y-1.5">
          <p className="text-[11px] font-medium text-gray-500">{unitCopy.inheritedHint}</p>
          <div className="flex flex-wrap gap-1.5">
            {inheritedEntries.map(([unit, factor]) => (
              <StatusBadge key={unit} status="neutral" size="sm" dot={false}>
                1 {unit} = {factor} {baseUnit}
              </StatusBadge>
            ))}
          </div>
        </div>
      )}

      {!disabled && presets.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-medium text-gray-500 mr-1">{unitCopy.presetsLabel}</span>
          {presets.map((preset) => (
            <Button
              key={preset.unit}
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => handleApplyPreset(preset)}
              className="h-7 px-2.5 text-xs border border-gray-200 bg-white hover:border-ktc-green"
            >
              + 1 {preset.unit} = {preset.factor} {baseUnit}
            </Button>
          ))}
        </div>
      )}

      {rows.length === 0 ? (
        <p className="text-xs text-gray-500 italic py-1">{unitCopy.emptyNotice}</p>
      ) : (
        <div className="space-y-2">
          {rows.map((row, index) => {
            const usedElsewhere = new Set(
              rows.filter((_, i) => i !== index).map((r) => r.unit)
            );
            const rowOptions = availableUnits.map((unit) => ({
              value: unit,
              label: tradeUnitCopy[unit] || unit,
              disabled: usedElsewhere.has(unit)
            }));

            return (
              <div
                key={`${row.unit}-${index}`}
                className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-end bg-white p-3 rounded-lg border border-gray-200"
              >
                <div className="sm:col-span-5">
                  <Select
                    label={index === 0 ? unitCopy.unitLabel : undefined}
                    options={rowOptions}
                    value={row.unit}
                    disabled={disabled}
                    onChange={(e) => handleRowChange(index, 'unit', e?.target?.value ?? '')}
                  />
                </div>

                <div className="sm:col-span-6">
                  <Input
                    label={index === 0 ? `${unitCopy.multiplierPrefix} (${baseUnit})` : undefined}
                    type="number"
                    min="0.01"
                    step="any"
                    prefix={`1 ${row.unit} =`}
                    suffix={baseUnit}
                    value={row.factor}
                    disabled={disabled}
                    placeholder="e.g. 50"
                    onChange={(e) => handleRowChange(index, 'factor', e.target.value)}
                  />
                </div>

                <div className="sm:col-span-1 flex justify-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={disabled}
                    onClick={() => handleRemoveRow(index)}
                    aria-label="Remove unit conversion"
                    className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default UnitConversionsEditor;
