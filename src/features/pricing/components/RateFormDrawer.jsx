import React, { useMemo, useState } from 'react';
import { TrendingDown, TrendingUp } from 'lucide-react';
import { ROLES, useCopy } from '../../../core/constants/index.js';
import { useAuthStore } from '../../../core/auth/auth.store.js';
import { ACTIONS } from '../../../core/rbac/actions.js';
import { usePermission } from '../../../core/rbac/usePermission.js';
import {
  Alert,
  Button,
  DatePicker,
  InfoTooltip,
  Input,
  Select,
  SlideOver,
  StatusBadge,
  Toggle
} from '../../../shared/components/index.js';
import { formatINR } from '../../../shared/utils/formatters.js';
import {
  RATE_TRENDS,
  computeLiveMargin,
  getTodayIsoDate,
  getVarietyGradeOptions,
  getVarietyUnitOptions
} from '../constants/pricing.constants.js';
import {
  useCreateRate,
  usePricingEditorCatalog,
  useUpdateRate,
  useUpdateRateStatus
} from '../hooks/usePricing.js';
import { BulkTiersEditor } from './BulkTiersEditor.jsx';

function buildInitialForm(initialRate, defaultHubId) {
  if (initialRate) {
    return {
      hubId: initialRate.hubId || '',
      cropVarietyId: initialRate.cropVarietyId || '',
      gradeCode: initialRate.gradeCode || 'GRADE_A',
      unit: initialRate.unit || initialRate.cropVariety?.crop?.baseUnit || 'KG',
      effectiveDate:
        initialRate.effectiveDate ||
        (initialRate.rateDate ? String(initialRate.rateDate).slice(0, 10) : getTodayIsoDate()),
      farmerBuyRate: String(initialRate.farmerBuyRate ?? ''),
      consumerSellRate: String(initialRate.consumerSellRate ?? ''),
      minRatePerUnit:
        initialRate.minRatePerUnit !== undefined && initialRate.minRatePerUnit !== null
          ? String(initialRate.minRatePerUnit)
          : '',
      maxRatePerUnit:
        initialRate.maxRatePerUnit !== undefined && initialRate.maxRatePerUnit !== null
          ? String(initialRate.maxRatePerUnit)
          : '',
      trend: initialRate.trend || 'STABLE',
      apmcDelta:
        initialRate.apmcDelta !== undefined && initialRate.apmcDelta !== null
          ? String(initialRate.apmcDelta)
          : '',
      notes: initialRate.notes || '',
      isProcurementActive: initialRate.isProcurementActive ?? true
    };
  }

  return {
    hubId: defaultHubId || '',
    cropVarietyId: '',
    gradeCode: '',
    unit: '',
    effectiveDate: getTodayIsoDate(),
    farmerBuyRate: '',
    consumerSellRate: '',
    minRatePerUnit: '',
    maxRatePerUnit: '',
    trend: 'STABLE',
    apmcDelta: '',
    notes: '',
    isProcurementActive: true
  };
}

function buildInitialTiers(initialRate) {
  if (!Array.isArray(initialRate?.bulkTiers)) return [];
  return initialRate.bulkTiers.map((tier) => ({
    minQty: String(tier.minQty ?? ''),
    unitPrice: String(tier.unitPrice ?? ''),
    label: tier.label || ''
  }));
}

export function RateFormDrawer({ isOpen, onClose, initialRate = null }) {
  const copy = useCopy();
  const pricingCopy = copy.pricing;
  const formCopy = pricingCopy.form;
  const actionsCopy = pricingCopy.actions;

  const activeHubId = useAuthStore((state) => state.activeHubId);
  const activeRole = useAuthStore((state) => state.activeRole);
  const staffAssignments = useAuthStore((state) => state.staffAssignments);

  const canSetGlobal = usePermission(ACTIONS.MANDI_RATE.SET_GLOBAL);
  const canSetHub = usePermission(ACTIONS.MANDI_RATE.SET_HUB);

  const isEdit = Boolean(initialRate?.id);
  const isGlobalTarget = initialRate ? !initialRate.hubId : false;
  const canMutateThisRecord = isEdit
    ? isGlobalTarget
      ? canSetGlobal
      : canSetGlobal || canSetHub
    : canSetGlobal || canSetHub;

  const defaultScopedHubId = canSetGlobal
    ? activeHubId || ''
    : activeHubId || staffAssignments?.[0]?.hubId || '';

  const [form, setForm] = useState(() =>
    buildInitialForm(initialRate, defaultScopedHubId)
  );
  const [bulkTiers, setBulkTiers] = useState(() =>
    buildInitialTiers(initialRate)
  );
  const [errorMsg, setErrorMsg] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const { varieties, hubs } = usePricingEditorCatalog(isOpen);
  const createMutation = useCreateRate({ onSuccess: () => onClose?.() });
  const updateMutation = useUpdateRate({ onSuccess: () => onClose?.() });
  const statusMutation = useUpdateRateStatus({ onSuccess: () => onClose?.() });

  const clearFieldError = (field) => {
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
    setErrorMsg('');
  };

  const scopeOptions = useMemo(() => {
    const options = [];
    if (canSetGlobal) {
      options.push({ value: '', label: formCopy.globalNetworkOption });
    }

    if (hubs.length > 0) {
      for (const hub of hubs) {
        options.push({
          value: hub.id,
          label: `${hub.name} (${hub.code})`
        });
      }
    } else if (Array.isArray(staffAssignments)) {
      for (const assignment of staffAssignments) {
        if (!assignment.hubId) continue;
        options.push({
          value: assignment.hubId,
          label: assignment.hubName || assignment.hubCode || assignment.hubId
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
        subtitle: v.crop?.name
          ? `${v.crop.name}${v.crop.category?.name ? ` • ${v.crop.category.name}` : ''}`
          : undefined
      })),
    [varieties]
  );

  const selectedVariety = useMemo(
    () =>
      varieties.find((v) => v.id === form.cropVarietyId) ||
      (initialRate?.cropVariety?.id === form.cropVarietyId
        ? initialRate.cropVariety
        : null),
    [varieties, form.cropVarietyId, initialRate]
  );

  const gradeOptions = useMemo(
    () => getVarietyGradeOptions(selectedVariety),
    [selectedVariety]
  );

  const unitOptions = useMemo(
    () => getVarietyUnitOptions(selectedVariety, copy.catalog.tradeUnits),
    [selectedVariety, copy.catalog.tradeUnits]
  );

  const trendOptions = useMemo(
    () =>
      RATE_TRENDS.map((t) => ({
        value: t,
        label: pricingCopy.trends[t] || t
      })),
    [pricingCopy.trends]
  );

  const marginPreview = useMemo(
    () => computeLiveMargin(form.farmerBuyRate, form.consumerSellRate),
    [form.farmerBuyRate, form.consumerSellRate]
  );

  const handleVarietyChange = (event) => {
    const nextVarietyId = event?.target?.value ?? '';
    const nextVariety = varieties.find((v) => v.id === nextVarietyId) || null;
    const nextGrades = getVarietyGradeOptions(nextVariety);
    const nextUnits = getVarietyUnitOptions(nextVariety, copy.catalog.tradeUnits);

    setForm((prev) => ({
      ...prev,
      cropVarietyId: nextVarietyId,
      gradeCode: nextGrades[0]?.value || 'GRADE_A',
      unit: nextUnits[0]?.value || 'KG'
    }));
    clearFieldError('cropVarietyId');
    clearFieldError('gradeCode');
    clearFieldError('unit');
  };

  const validateAndBuildPayload = (publishOnCreate = false) => {
    const nextErrors = {};
    if (!form.cropVarietyId) {
      nextErrors.cropVarietyId = formCopy.validationVarietyRequired;
    }
    if (!form.gradeCode) {
      nextErrors.gradeCode = formCopy.validationGradeRequired;
    }
    if (!form.unit) {
      nextErrors.unit = formCopy.validationUnitRequired;
    }
    if (!form.effectiveDate) {
      nextErrors.effectiveDate = formCopy.validationDateRequired;
    }

    const buyRate = Number(form.farmerBuyRate);
    if (!Number.isFinite(buyRate) || buyRate <= 0) {
      nextErrors.farmerBuyRate = formCopy.validationBuyRatePositive;
    }

    const sellRate = Number(form.consumerSellRate);
    if (!Number.isFinite(sellRate) || sellRate <= 0) {
      nextErrors.consumerSellRate = formCopy.validationSellRatePositive;
    }

    const minRate = form.minRatePerUnit !== '' ? Number(form.minRatePerUnit) : null;
    const maxRate = form.maxRatePerUnit !== '' ? Number(form.maxRatePerUnit) : null;
    if (minRate !== null && maxRate !== null && minRate > maxRate) {
      nextErrors.minRatePerUnit = formCopy.validationMinMaxRange;
      nextErrors.maxRatePerUnit = formCopy.validationMinMaxRange;
    }

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      setErrorMsg(formCopy.validationSummary);
      return null;
    }

    const normalizedTiers = [];
    const seenQty = new Set();
    for (const row of bulkTiers) {
      const qty = Number(row.minQty);
      const price = Number(row.unitPrice);
      if (!Number.isFinite(qty) || qty <= 0 || !Number.isFinite(price) || price <= 0 || seenQty.has(qty)) {
        setFieldErrors({});
        setErrorMsg(formCopy.validationTiersInvalid);
        return null;
      }
      seenQty.add(qty);
      normalizedTiers.push({
        minQty: qty,
        unitPrice: price,
        label: (row.label || '').trim()
      });
    }

    setFieldErrors({});
    setErrorMsg('');

    return {
      ...(!isEdit ? { hubId: form.hubId || null, cropVarietyId: form.cropVarietyId } : {}),
      gradeCode: form.gradeCode,
      effectiveDate: form.effectiveDate,
      unit: form.unit,
      farmerBuyRate: buyRate,
      consumerSellRate: sellRate,
      minRatePerUnit: minRate,
      maxRatePerUnit: maxRate,
      trend: form.trend,
      apmcDelta: form.apmcDelta !== '' ? Number(form.apmcDelta) : null,
      bulkTiers: normalizedTiers.length > 0 ? normalizedTiers : null,
      isProcurementActive: Boolean(form.isProcurementActive),
      notes: form.notes.trim() || null,
      ...(!isEdit ? { status: publishOnCreate ? 'PUBLISHED' : 'DRAFT' } : {})
    };
  };

  const handleSave = async (publishAfterSave = false) => {
    if (!canMutateThisRecord) return;
    const payload = validateAndBuildPayload(publishAfterSave);
    if (!payload) return;

    if (!isEdit) {
      createMutation.mutate(payload);
      return;
    }

    await updateMutation.mutateAsync({ id: initialRate.id, payload });
    if (publishAfterSave && initialRate.status !== 'PUBLISHED') {
      await statusMutation.mutateAsync({ id: initialRate.id, status: 'PUBLISHED' });
    }
  };

  const isSaving =
    createMutation.isPending || updateMutation.isPending || statusMutation.isPending;

  return (
    <SlideOver
      isOpen={isOpen}
      onClose={onClose}
      size="xl"
      title={isEdit ? formCopy.editTitle : formCopy.createTitle}
      description={formCopy.description}
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            {actionsCopy.cancel}
          </Button>
          {canMutateThisRecord && (
            <>
              <Button
                variant="outline"
                loading={updateMutation.isPending || (createMutation.isPending && !isEdit)}
                disabled={isSaving}
                onClick={() => handleSave(false)}
              >
                {isEdit ? actionsCopy.saveChanges : actionsCopy.saveDraft}
              </Button>
              <Button
                variant="primary"
                loading={isSaving}
                onClick={() => handleSave(true)}
              >
                {actionsCopy.savePublish}
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
            value={form.hubId}
            disabled={!canMutateThisRecord || isEdit || (!canSetGlobal && scopeOptions.length <= 1)}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, hubId: e?.target?.value ?? '' }))
            }
          />

          <DatePicker
            label={formCopy.effectiveDateLabel}
            placeholder={formCopy.effectiveDatePlaceholder}
            todayLabel={formCopy.todayLabel}
            clearLabel={formCopy.clearLabel}
            required
            disabled={!canMutateThisRecord}
            value={form.effectiveDate}
            error={fieldErrors.effectiveDate}
            onChange={(nextDate) => {
              setForm((prev) => ({ ...prev, effectiveDate: nextDate }));
              clearFieldError('effectiveDate');
            }}
          />
        </div>

        <Select
          label={formCopy.varietyLabel}
          placeholder={formCopy.varietyPlaceholder}
          required
          disabled={!canMutateThisRecord || isEdit}
          options={varietyOptions}
          value={form.cropVarietyId}
          error={fieldErrors.cropVarietyId}
          onChange={handleVarietyChange}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label={formCopy.gradeLabel}
            placeholder={formCopy.gradePlaceholder}
            required
            disabled={!canMutateThisRecord || !form.cropVarietyId}
            options={gradeOptions}
            value={form.gradeCode}
            error={fieldErrors.gradeCode}
            onChange={(e) => {
              setForm((prev) => ({ ...prev, gradeCode: e?.target?.value ?? '' }));
              clearFieldError('gradeCode');
            }}
          />

          <Select
            label={formCopy.unitLabel}
            placeholder={formCopy.unitPlaceholder}
            required
            disabled={!canMutateThisRecord || !form.cropVarietyId}
            options={unitOptions}
            value={form.unit}
            error={fieldErrors.unit}
            onChange={(e) => {
              setForm((prev) => ({ ...prev, unit: e?.target?.value ?? '' }));
              clearFieldError('unit');
            }}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label={formCopy.buyRateLabel}
            placeholder={formCopy.buyRatePlaceholder}
            type="number"
            min="0.01"
            step="0.01"
            prefix="₹"
            suffix={form.unit ? `/ ${form.unit}` : undefined}
            required
            disabled={!canMutateThisRecord}
            value={form.farmerBuyRate}
            error={fieldErrors.farmerBuyRate}
            onChange={(e) => {
              setForm((prev) => ({ ...prev, farmerBuyRate: e.target.value }));
              clearFieldError('farmerBuyRate');
            }}
          />

          <Input
            label={formCopy.sellRateLabel}
            placeholder={formCopy.sellRatePlaceholder}
            type="number"
            min="0.01"
            step="0.01"
            prefix="₹"
            suffix={form.unit ? `/ ${form.unit}` : undefined}
            required
            disabled={!canMutateThisRecord}
            value={form.consumerSellRate}
            error={fieldErrors.consumerSellRate}
            onChange={(e) => {
              setForm((prev) => ({ ...prev, consumerSellRate: e.target.value }));
              clearFieldError('consumerSellRate');
            }}
          />
        </div>

        {marginPreview ? (
          <div
            className={`rounded-xl border p-4 flex flex-wrap items-center justify-between gap-3 ${
              marginPreview.isNegative
                ? 'bg-rose-50 border-rose-200 text-rose-900'
                : 'bg-ktc-green-light border-emerald-200 text-ktc-green'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {marginPreview.isNegative ? (
                <TrendingDown className="w-5 h-5 text-rose-600 shrink-0" />
              ) : (
                <TrendingUp className="w-5 h-5 text-ktc-green shrink-0" />
              )}
              <div>
                <p className="text-xs font-bold uppercase tracking-wider">
                  {marginPreview.isNegative
                    ? formCopy.negativeMarginTitle
                    : formCopy.marginPreviewTitle}
                </p>
                <p className="text-xs opacity-85 mt-0.5">
                  {formCopy.profitPerUnitLabel}:{' '}
                  <span className="font-semibold">
                    {formatINR(marginPreview.profit)} / {form.unit || 'UNIT'}
                  </span>
                </p>
              </div>
            </div>

            <StatusBadge
              status={marginPreview.isNegative ? 'danger' : 'success'}
              size="lg"
              dot={false}
            >
              {formCopy.marginPercentLabel}: {marginPreview.percent >= 0 ? '+' : ''}
              {marginPreview.percent.toFixed(2)}%
            </StatusBadge>
          </div>
        ) : (
          <Alert type="info">{formCopy.enterRatesHint}</Alert>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-sm font-medium text-gray-700">
                {formCopy.minRateLabel}
              </span>
              <InfoTooltip
                content={formCopy.minRateTooltip}
                label={formCopy.moreInfoLabel}
              />
            </div>
            <Input
              type="number"
              min="0.01"
              step="0.01"
              prefix="₹"
              disabled={!canMutateThisRecord}
              value={form.minRatePerUnit}
              error={fieldErrors.minRatePerUnit}
              onChange={(e) => {
                setForm((prev) => ({ ...prev, minRatePerUnit: e.target.value }));
                clearFieldError('minRatePerUnit');
              }}
            />
          </div>

          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-sm font-medium text-gray-700">
                {formCopy.maxRateLabel}
              </span>
              <InfoTooltip
                content={formCopy.maxRateTooltip}
                label={formCopy.moreInfoLabel}
              />
            </div>
            <Input
              type="number"
              min="0.01"
              step="0.01"
              prefix="₹"
              disabled={!canMutateThisRecord}
              value={form.maxRatePerUnit}
              error={fieldErrors.maxRatePerUnit}
              onChange={(e) => {
                setForm((prev) => ({ ...prev, maxRatePerUnit: e.target.value }));
                clearFieldError('maxRatePerUnit');
              }}
            />
          </div>

          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-sm font-medium text-gray-700">
                {formCopy.trendLabel}
              </span>
              <InfoTooltip
                content={formCopy.trendTooltip}
                label={formCopy.moreInfoLabel}
              />
            </div>
            <Select
              disabled={!canMutateThisRecord}
              options={trendOptions}
              value={form.trend}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, trend: e?.target?.value ?? 'STABLE' }))
              }
            />
          </div>

          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-sm font-medium text-gray-700">
                {formCopy.apmcDeltaLabel}
              </span>
              <InfoTooltip
                content={formCopy.apmcDeltaTooltip}
                label={formCopy.moreInfoLabel}
                align="right"
              />
            </div>
            <Input
              type="number"
              step="0.01"
              prefix="₹"
              disabled={!canMutateThisRecord}
              value={form.apmcDelta}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, apmcDelta: e.target.value }))
              }
            />
          </div>
        </div>

        <BulkTiersEditor
          rows={bulkTiers}
          onChange={setBulkTiers}
          unit={form.unit || 'KG'}
          consumerSellRate={form.consumerSellRate}
          disabled={!canMutateThisRecord}
        />

        <Input
          label={formCopy.notesLabel}
          placeholder={formCopy.notesPlaceholder}
          disabled={!canMutateThisRecord}
          value={form.notes}
          onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
        />

        <div className="pt-2 border-t border-gray-100">
          <Toggle
            label={formCopy.activeLabel}
            description={formCopy.activeDesc}
            checked={Boolean(form.isProcurementActive)}
            disabled={!canMutateThisRecord}
            onChange={(checked) =>
              setForm((prev) => ({ ...prev, isProcurementActive: checked }))
            }
          />
        </div>
      </div>
    </SlideOver>
  );
}

export default RateFormDrawer;
