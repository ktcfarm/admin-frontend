import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useCopy } from '../../../core/constants/index.js';
import { Button, Input } from '../../../shared/components/index.js';
import {
  QUICK_GRADE_PRESETS,
  normalizeGradeCode
} from '../constants/catalog.constants.js';

export function GradeSpecsEditor({ rows = [], onChange, disabled = false }) {
  const copy = useCopy();
  const gradeCopy = copy.catalog.gradeEditor;

  const handleAddCustom = () => {
    onChange([
      ...rows,
      {
        code: '',
        label: '',
        labelHi: '',
        maxMoisturePercent: '',
        maxForeignMatterPercent: '',
        notes: ''
      }
    ]);
  };

  const handleAddPreset = (preset) => {
    const exists = rows.some((row) => normalizeGradeCode(row.code) === preset.code);
    if (exists) return;
    onChange([
      ...rows,
      {
        code: preset.code,
        label: preset.label,
        labelHi: preset.labelHi || '',
        maxMoisturePercent:
          preset.maxMoisturePercent !== null && preset.maxMoisturePercent !== undefined
            ? String(preset.maxMoisturePercent)
            : '',
        maxForeignMatterPercent:
          preset.maxForeignMatterPercent !== null && preset.maxForeignMatterPercent !== undefined
            ? String(preset.maxForeignMatterPercent)
            : '',
        notes: preset.notes || ''
      }
    ]);
  };

  const handleRowChange = (index, field, value) => {
    const nextValue = field === 'code' ? value.toUpperCase() : value;
    onChange(
      rows.map((row, idx) => (idx === index ? { ...row, [field]: nextValue } : row))
    );
  };

  const handleRemove = (index) => {
    onChange(rows.filter((_, idx) => idx !== index));
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50/60 p-4 space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h4 className="text-sm font-semibold text-gray-900">{gradeCopy.title}</h4>
          <p className="text-xs text-gray-500 mt-0.5">{gradeCopy.subtitle}</p>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          leftIcon={Plus}
          disabled={disabled}
          onClick={handleAddCustom}
        >
          {gradeCopy.addCustomBtn}
        </Button>
      </div>

      {!disabled && (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-medium text-gray-500 mr-1">
            {gradeCopy.presetsLabel}
          </span>
          {QUICK_GRADE_PRESETS.map((preset) => {
            const alreadyAdded = rows.some(
              (row) => normalizeGradeCode(row.code) === preset.code
            );
            return (
              <Button
                key={preset.code}
                type="button"
                variant="ghost"
                size="sm"
                disabled={alreadyAdded}
                onClick={() => handleAddPreset(preset)}
                className="h-7 px-2.5 text-xs border border-gray-200 bg-white hover:border-ktc-green"
              >
                + {preset.label}
              </Button>
            );
          })}
        </div>
      )}

      {rows.length === 0 ? (
        <p className="text-xs text-gray-500 italic py-1">{gradeCopy.emptyNotice}</p>
      ) : (
        <div className="space-y-3">
          {rows.map((row, index) => (
            <div
              key={`grade-row-${index}`}
              className="rounded-lg border border-gray-200 bg-white p-3.5 space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1">
                  <Input
                    label={gradeCopy.codeLabel}
                    required
                    disabled={disabled}
                    value={row.code}
                    placeholder={gradeCopy.codePlaceholder}
                    onChange={(e) => handleRowChange(index, 'code', e.target.value)}
                  />
                  <Input
                    label={gradeCopy.labelEnLabel}
                    required
                    disabled={disabled}
                    value={row.label}
                    placeholder={gradeCopy.labelEnPlaceholder}
                    onChange={(e) => handleRowChange(index, 'label', e.target.value)}
                  />
                  <Input
                    label={gradeCopy.labelHiLabel}
                    disabled={disabled}
                    value={row.labelHi}
                    placeholder={gradeCopy.labelHiPlaceholder}
                    onChange={(e) => handleRowChange(index, 'labelHi', e.target.value)}
                  />
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={disabled}
                  onClick={() => handleRemove(index)}
                  aria-label="Remove quality grade"
                  className="mt-6 text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Input
                  label={gradeCopy.maxMoistureLabel}
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  suffix="%"
                  disabled={disabled}
                  value={row.maxMoisturePercent ?? ''}
                  placeholder="12.0"
                  onChange={(e) =>
                    handleRowChange(index, 'maxMoisturePercent', e.target.value)
                  }
                />
                <Input
                  label={gradeCopy.maxForeignLabel}
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  suffix="%"
                  disabled={disabled}
                  value={row.maxForeignMatterPercent ?? ''}
                  placeholder="1.5"
                  onChange={(e) =>
                    handleRowChange(index, 'maxForeignMatterPercent', e.target.value)
                  }
                />
                <Input
                  label={gradeCopy.notesLabel}
                  disabled={disabled}
                  value={row.notes ?? ''}
                  placeholder={gradeCopy.notesPlaceholder}
                  onChange={(e) => handleRowChange(index, 'notes', e.target.value)}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default GradeSpecsEditor;
