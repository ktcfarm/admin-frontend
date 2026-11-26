export const RATE_STATUS_BADGE_VARIANT = Object.freeze({
  DRAFT: 'warning',
  PUBLISHED: 'success',
  ARCHIVED: 'neutral'
});

export const RATE_TREND_BADGE_VARIANT = Object.freeze({
  UP: 'success',
  DOWN: 'danger',
  STABLE: 'neutral'
});

export const RATE_TRENDS = Object.freeze(['STABLE', 'UP', 'DOWN']);

export const FALLBACK_GRADES = Object.freeze([
  { code: 'GRADE_A', label: 'Grade A' },
  { code: 'GRADE_B', label: 'Grade B' },
  { code: 'FAQ', label: 'Fair Average Quality' }
]);

export function getTodayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

export function getVarietyGradeOptions(variety) {
  const specs = variety?.gradeSpecs;
  if (Array.isArray(specs) && specs.length > 0) {
    return specs
      .filter((item) => item?.code)
      .map((item) => ({
        value: item.code,
        label: item.labelHi
          ? `${item.code} — ${item.label} (${item.labelHi})`
          : item.label
            ? `${item.code} — ${item.label}`
            : item.code
      }));
  }

  if (specs && typeof specs === 'object' && !Array.isArray(specs)) {
    const keys = Object.keys(specs);
    if (keys.length > 0) {
      return keys.map((code) => ({
        value: code,
        label: specs[code]?.label ? `${code} — ${specs[code].label}` : code
      }));
    }
  }

  return FALLBACK_GRADES.map((item) => ({
    value: item.code,
    label: `${item.code} — ${item.label}`
  }));
}

export function getVarietyUnitOptions(variety, tradeUnitLabels = {}) {
  const baseUnit = variety?.crop?.baseUnit || 'KG';
  const cropConversions =
    variety?.crop?.unitConversions &&
    typeof variety.crop.unitConversions === 'object'
      ? variety.crop.unitConversions
      : {};
  const varietyConversions =
    variety?.unitConversions && typeof variety.unitConversions === 'object'
      ? variety.unitConversions
      : {};

  const mergedConversions = {
    ...cropConversions,
    ...varietyConversions
  };

  const units = [baseUnit, ...Object.keys(mergedConversions).filter((u) => u !== baseUnit)];

  return units.map((unit) => {
    const factor = mergedConversions[unit];
    const baseLabel = tradeUnitLabels[unit] || unit;
    return {
      value: unit,
      label:
        unit === baseUnit
          ? `${baseLabel} (1:1 Base)`
          : factor
            ? `${baseLabel} (1 = ${factor} ${baseUnit})`
            : baseLabel
    };
  });
}

export function computeLiveMargin(farmerBuyRate, consumerSellRate) {
  const buy = Number(farmerBuyRate);
  const sell = Number(consumerSellRate);
  if (!Number.isFinite(buy) || !Number.isFinite(sell) || buy <= 0 || sell <= 0) {
    return null;
  }
  const profit = sell - buy;
  const percent = (profit / buy) * 100;
  return {
    profit,
    percent,
    isNegative: profit < 0
  };
}
