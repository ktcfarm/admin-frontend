export const BASE_UNITS = Object.freeze(['KG', 'PIECE']);

export const TRADE_UNITS = Object.freeze([
  'KG',
  'QUINTAL',
  'CRATE',
  'BAG',
  'PIECE',
  'DOZEN'
]);

export const PERISHABILITY_TYPES = Object.freeze([
  'PERISHABLE',
  'NON_PERISHABLE'
]);

export const PERISHABILITY_BADGE_VARIANT = Object.freeze({
  PERISHABLE: 'warning',
  NON_PERISHABLE: 'info'
});

export const QUICK_GRADE_PRESETS = Object.freeze([
  {
    code: 'GRADE_A',
    label: 'Grade A (Premium)',
    labelHi: 'ग्रेड A (प्रीमियम)',
    maxMoisturePercent: 12,
    maxForeignMatterPercent: 1,
    notes: ''
  },
  {
    code: 'GRADE_B',
    label: 'Grade B (Standard)',
    labelHi: 'ग्रेड B (मानक)',
    maxMoisturePercent: 14,
    maxForeignMatterPercent: 2,
    notes: ''
  },
  {
    code: 'FAQ',
    label: 'FAQ (Fair Average Quality)',
    labelHi: 'एफएक्यू (औसत अच्छी गुणवत्ता)',
    maxMoisturePercent: 14,
    maxForeignMatterPercent: 2,
    notes: ''
  }
]);

export const QUICK_UNIT_PRESETS = Object.freeze({
  KG: [
    { unit: 'QUINTAL', factor: 100 },
    { unit: 'BAG', factor: 50 },
    { unit: 'CRATE', factor: 20 }
  ],
  PIECE: [
    { unit: 'DOZEN', factor: 12 },
    { unit: 'CRATE', factor: 120 }
  ]
});

export function normalizeGradeCode(raw) {
  return String(raw || '')
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9_]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

export function buildConversionRows(conversionsObj = {}, baseUnit = 'KG') {
  if (!conversionsObj || typeof conversionsObj !== 'object') {
    return [];
  }
  return Object.entries(conversionsObj)
    .filter(([unit]) => unit !== baseUnit)
    .map(([unit, factor]) => ({
      unit,
      factor: String(factor ?? '')
    }));
}

export function serializeConversionRows(rows = [], baseUnit = 'KG') {
  const result = {};
  for (const row of rows) {
    if (!row?.unit || row.unit === baseUnit) continue;
    const numeric = Number(row.factor);
    if (Number.isFinite(numeric) && numeric > 0) {
      result[row.unit] = numeric;
    }
  }
  return Object.keys(result).length > 0 ? result : null;
}
