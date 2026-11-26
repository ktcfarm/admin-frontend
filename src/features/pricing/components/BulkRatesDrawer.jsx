import React, { useMemo, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { ROLES, useCopy } from '../../../core/constants/index.js';
import { useAuthStore } from '../../../core/auth/auth.store.js';
import { ACTIONS } from '../../../core/rbac/actions.js';
import { usePermission } from '../../../core/rbac/usePermission.js';
import {
  Alert,
  Button,
  DatePicker,
  Input,
  Select,
  SlideOver,
  StatusBadge
} from '../../../shared/components/index.js';
import {
  computeLiveMargin,
  getTodayIsoDate,
  getVarietyGradeOptions,
  getVarietyUnitOptions
} from '../constants/pricing.constants.js';
import {
  useBulkUpsertRates,
  usePricingEditorCatalog
} from '../hooks/usePricing.js';

function createEmptyRow() {
  return {
    cropVarietyId: '',
    gradeCode: '',
    unit: '',
    farmerBuyRate: '',
    consumerSellRate: ''
  };
}

export function BulkRatesDrawer({ isOpen, onClose }) {
  const copy = useCopy();
  const pricingCopy = copy.pricing;
  const formCopy = pricingCopy.form;
  const actionsCopy = pricingCopy.actions;

  const activeHubId = useAuthStore((state) => state.activeHubId);
  const activeRole = useAuthStore((state) => state.activeRole);
  const staffAssignments = useAuthStore((state) => state.staffAssignments);

  const canSetGlobal = usePermission(ACTIONS.MANDI_RATE.SET_GLOBAL);
  const canSetHub = usePermission(ACTIONS.MANDI_RATE.SET_HUB);
  const canMutate = canSetGlobal || canSetHub;

  const defaultHubId = canSetGlobal
    ? activeHubId || ''
    : activeHubId || staffAssignments?.[0]?.hubId || '';

  const [hubId, setHubId] = useState(defaultHubId);
  const [effectiveDate, setEffectiveDate] = useState(getTodayIsoDate());
  const [rows, setRows] = useState(() => [createEmptyRow()]);
  const [errorMsg, setErrorMsg] = useState('');
  const [rowErrors, setRowErrors] = useState({});

  const { varieties, hubs } = usePricingEditorCatalog(isOpen);
  const bulkMutation = useBulkUpsertRates({ onSuccess: () => onClose?.() });

  const scopeOptions = useMemo(() => {
    const options = [];
    if (canSetGlobal) {
      options.push({ value: '', label: formCopy.globalNetworkOption });
    }
    if (hubs.length > 0) {
      for (const hub of hubs) {
        options.push({ value: hub.id, label: `${hub.name} (${hub.code})` });
      }
    } else if (Array.isArray(staffAssignments)) {
      for (const a of staffAssignments) {
        if (!a.hubId) continue;
        options.push({
          value: a.hubId,
          label: a.hubName || a.hubCode || a.hubId
        });
      }
    }
    return options;
  }, [canSetGlobal, formCopy.globalNetworkOption, hubs, staffAssignments]);

  const varietyOptions = useMemo(
    () =>
      varieties.map((v) => ({
        value: v.id,
        label: v.translations?.hi ? `${v.name} (${v.translations.hi})` : v.name,
        subtitle: v.crop?.name || undefined
      })),
    [varieties]
  );

  const clearRowError = (idx, field) => {
    setRowErrors((prev) => {
      const current = prev[idx];
      if (!current?.[field]) return prev;
      const nextRow = { ...current };
      delete nextRow[field];
      return { ...prev, [idx]: nextRow };
    });
    setErrorMsg('');
  };

  const handleVarietyChange = (index, nextVarietyId) => {
    const selectedVariety = varieties.find((v) => v.id === nextVarietyId) || null;
    const grades = getVarietyGradeOptions(selectedVariety);
    const units = getVarietyUnitOptions(selectedVariety, copy.catalog.tradeUnits);

    setRows((prev) =>
      prev.map((row, idx) =>
        idx === index
          ? {
              ...row,
              cropVarietyId: nextVarietyId,
              gradeCode: grades[0]?.value || 'GRADE_A',
              unit: units[0]?.value || 'KG'
            }
          : row
      )
    );
    clearRowError(index, 'cropVarietyId');
    clearRowError(index, 'gradeCode');
    clearRowError(index, 'unit');
  };

  const handleFieldChange = (index, field, value) => {
    setRows((prev) =>
      prev.map((row, idx) => (idx === index ? { ...row, [field]: value } : row))
    );
    clearRowError(index, field);
  };

  const handleSubmit = (publishAll = false) => {
    if (!canMutate) return;
    if (!effectiveDate) {
      setErrorMsg(formCopy.validationDateRequired);
      return;
    }

    const nextRowErrors = {};
    const items = [];

    rows.forEach((row, idx) => {
      const errs = {};
      if (!row.cropVarietyId) errs.cropVarietyId = formCopy.validationVarietyRequired;
      if (!row.gradeCode) errs.gradeCode = formCopy.validationGradeRequired;
      if (!row.unit) errs.unit = formCopy.validationUnitRequired;

      const buy = Number(row.farmerBuyRate);
      if (!Number.isFinite(buy) || buy <= 0) {
        errs.farmerBuyRate = formCopy.validationBuyRatePositive;
      }

      const sell = Number(row.consumerSellRate);
      if (!Number.isFinite(sell) || sell <= 0) {
        errs.consumerSellRate = formCopy.validationSellRatePositive;
      }

      if (Object.keys(errs).length > 0) {
        nextRowErrors[idx] = errs;
      } else {
        items.push({
          hubId: hubId || null,
          cropVarietyId: row.cropVarietyId,
          gradeCode: row.gradeCode,
          unit: row.unit,
          effectiveDate,
          farmerBuyRate: buy,
          consumerSellRate: sell,
          status: publishAll ? 'PUBLISHED' : 'DRAFT'
        });
      }
    });

    if (Object.keys(nextRowErrors).length > 0 || items.length === 0) {
      setRowErrors(nextRowErrors);
      setErrorMsg(formCopy.validationSummary);
      return;
    }

    setRowErrors({});
    setErrorMsg('');
    bulkMutation.mutate(items);
  };

  return (
    <SlideOver
      isOpen={isOpen}
      onClose={onClose}
      size="xl"
      title={formCopy.bulkTitle}
      description={formCopy.bulkDescription}
      footer={
        <>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={bulkMutation.isPending}
          >
            {actionsCopy.cancel}
          </Button>
          {canMutate && (
            <>
              <Button
                variant="outline"
                loading={bulkMutation.isPending}
                onClick={() => handleSubmit(false)}
              >
                {formCopy.bulkSaveDraftBtn}
              </Button>
              <Button
                variant="primary"
                loading={bulkMutation.isPending}
                onClick={() => handleSubmit(true)}
              >
                {formCopy.bulkPublishBtn}
              </Button>
            </>
          )}
        </>
      }
    >
      <div className="space-y-5">
        {!canSetGlobal && activeRole === ROLES.HUB_MANAGER && (
          <Alert type="info">{formCopy.hubOverrideNotice}</Alert>
        )}

        {errorMsg && <Alert type="error" title={errorMsg} />}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label={formCopy.scopeLabel}
            options={scopeOptions}
            value={hubId}
            disabled={!canMutate || (!canSetGlobal && scopeOptions.length <= 1)}
            onChange={(e) => setHubId(e?.target?.value ?? '')}
          />

          <DatePicker
            label={formCopy.effectiveDateLabel}
            placeholder={formCopy.effectiveDatePlaceholder}
            todayLabel={formCopy.todayLabel}
            clearLabel={formCopy.clearLabel}
            required
            disabled={!canMutate}
            value={effectiveDate}
            onChange={(nextDate) => setEffectiveDate(nextDate)}
          />
        </div>

        <div className="space-y-3">
          {rows.map((row, index) => {
            const selectedVariety =
              varieties.find((v) => v.id === row.cropVarietyId) || null;
            const gradeOptions = getVarietyGradeOptions(selectedVariety);
            const unitOptions = getVarietyUnitOptions(
              selectedVariety,
              copy.catalog.tradeUnits
            );
            const margin = computeLiveMargin(
              row.farmerBuyRate,
              row.consumerSellRate
            );
            const errs = rowErrors[index] || {};

            return (
              <div
                key={`bulk-row-${index}`}
                className="rounded-xl border border-gray-200 bg-gray-50/70 p-4 space-y-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                      {formCopy.bulkRowPrefix} #{index + 1}
                    </span>
                    {margin && (
                      <StatusBadge
                        status={margin.isNegative ? 'danger' : 'success'}
                        size="sm"
                        dot={false}
                      >
                        {margin.percent >= 0 ? '+' : ''}
                        {margin.percent.toFixed(2)}%
                      </StatusBadge>
                    )}
                  </div>

                  {rows.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setRows((prev) => prev.filter((_, idx) => idx !== index))
                      }
                      className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Select
                    label={formCopy.varietyLabel}
                    placeholder={formCopy.varietyPlaceholder}
                    options={varietyOptions}
                    value={row.cropVarietyId}
                    error={errs.cropVarietyId}
                    required
                    onChange={(e) =>
                      handleVarietyChange(index, e?.target?.value ?? '')
                    }
                  />

                  <Select
                    label={formCopy.gradeLabel}
                    placeholder={formCopy.gradePlaceholder}
                    options={gradeOptions}
                    value={row.gradeCode}
                    error={errs.gradeCode}
                    disabled={!row.cropVarietyId}
                    required
                    onChange={(e) =>
                      handleFieldChange(index, 'gradeCode', e?.target?.value ?? '')
                    }
                  />

                  <Select
                    label={formCopy.unitLabel}
                    placeholder={formCopy.unitPlaceholder}
                    options={unitOptions}
                    value={row.unit}
                    error={errs.unit}
                    disabled={!row.cropVarietyId}
                    required
                    onChange={(e) =>
                      handleFieldChange(index, 'unit', e?.target?.value ?? '')
                    }
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    label={formCopy.buyRateLabel}
                    type="number"
                    min="0.01"
                    step="0.01"
                    prefix="₹"
                    suffix={row.unit ? `/ ${row.unit}` : undefined}
                    value={row.farmerBuyRate}
                    error={errs.farmerBuyRate}
                    required
                    onChange={(e) =>
                      handleFieldChange(index, 'farmerBuyRate', e.target.value)
                    }
                  />

                  <Input
                    label={formCopy.sellRateLabel}
                    type="number"
                    min="0.01"
                    step="0.01"
                    prefix="₹"
                    suffix={row.unit ? `/ ${row.unit}` : undefined}
                    value={row.consumerSellRate}
                    error={errs.consumerSellRate}
                    required
                    onChange={(e) =>
                      handleFieldChange(index, 'consumerSellRate', e.target.value)
                    }
                  />
                </div>
              </div>
            );
          })}
        </div>

        <Button
          variant="outline"
          size="sm"
          leftIcon={Plus}
          disabled={rows.length >= 25}
          onClick={() => setRows((prev) => [...prev, createEmptyRow()])}
        >
          {formCopy.bulkAddRowBtn}
        </Button>
      </div>
    </SlideOver>
  );
}

export default BulkRatesDrawer;
