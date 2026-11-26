import React, { useMemo, useState } from 'react';
import { useCopy } from '../../../core/constants/index.js';
import { ACTIONS } from '../../../core/rbac/actions.js';
import { usePermission } from '../../../core/rbac/usePermission.js';
import { useUiStore } from '../../../core/ui/ui.store.js';
import {
  Alert,
  Button,
  FileUploadField,
  Input,
  Select,
  SlideOver,
  StatusBadge,
  Toggle
} from '../../../shared/components/index.js';
import { catalogApi } from '../api/catalog.api.js';
import {
  PERISHABILITY_BADGE_VARIANT,
  buildConversionRows,
  normalizeGradeCode,
  serializeConversionRows
} from '../constants/catalog.constants.js';
import { useCatalogMutations, useCropOptions } from '../hooks/useCatalog.js';
import { GradeSpecsEditor } from './GradeSpecsEditor.jsx';
import { UnitConversionsEditor } from './UnitConversionsEditor.jsx';

const INITIAL_FORM = {
  cropId: '',
  en: '',
  hi: '',
  slug: '',
  imageUrl: '',
  isActive: true
};

export function VarietyFormDrawer({ isOpen, onClose, initialVariety = null }) {
  const copy = useCopy();
  const catalogCopy = copy.catalog;
  const formCopy = catalogCopy.forms;
  const actionsCopy = catalogCopy.actions;

  const isEdit = Boolean(initialVariety?.id);
  const canCreate = usePermission(ACTIONS.CROP.CREATE);
  const canUpdate = usePermission(ACTIONS.CROP.UPDATE);
  const canMutate = isEdit ? canUpdate : canCreate;

  const addToast = useUiStore((state) => state.addToast);
  const { data: cropsData } = useCropOptions(isOpen && canMutate);
  const { createVariety, updateVariety } = useCatalogMutations();

  const [form, setForm] = useState(() =>
    initialVariety
      ? {
          cropId: initialVariety.cropId || '',
          en: initialVariety.translations?.en || initialVariety.name || '',
          hi: initialVariety.translations?.hi || '',
          slug: initialVariety.slug || '',
          imageUrl: initialVariety.imageUrl || '',
          isActive: initialVariety.isActive ?? true
        }
      : INITIAL_FORM
  );
  const [conversionRows, setConversionRows] = useState(() =>
    initialVariety
      ? buildConversionRows(
          initialVariety.unitConversions,
          initialVariety.crop?.baseUnit || 'KG'
        )
      : []
  );
  const [gradeRows, setGradeRows] = useState(() =>
    Array.isArray(initialVariety?.gradeSpecs)
      ? initialVariety.gradeSpecs.map((g) => ({
          code: g.code || '',
          label: g.label || '',
          labelHi: g.labelHi || '',
          maxMoisturePercent:
            g.maxMoisturePercent !== null && g.maxMoisturePercent !== undefined
              ? String(g.maxMoisturePercent)
              : '',
          maxForeignMatterPercent:
            g.maxForeignMatterPercent !== null && g.maxForeignMatterPercent !== undefined
              ? String(g.maxForeignMatterPercent)
              : '',
          notes: g.notes || ''
        }))
      : []
  );
  const [errorMsg, setErrorMsg] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const clearFieldError = (field) => {
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
    setErrorMsg('');
  };

  const cropsList = useMemo(() => cropsData?.items || [], [cropsData?.items]);

  const selectedCrop = useMemo(
    () =>
      cropsList.find((c) => c.id === form.cropId) ||
      (initialVariety?.crop?.id === form.cropId ? initialVariety.crop : null),
    [cropsList, form.cropId, initialVariety]
  );

  const cropOptions = useMemo(
    () =>
      cropsList.map((crop) => ({
        value: crop.id,
        label: crop.translations?.hi ? `${crop.name} (${crop.translations.hi})` : crop.name,
        subtitle: `${crop.baseUnit} • ${catalogCopy.perishability[crop.perishabilityType] || crop.perishabilityType}`
      })),
    [cropsList, catalogCopy.perishability]
  );

  const effectiveBaseUnit = selectedCrop?.baseUnit || 'KG';

  const handleCropChange = (event) => {
    const nextCropId = event?.target?.value ?? '';
    const targetCrop = cropsList.find((c) => c.id === nextCropId);
    setForm((prev) => ({ ...prev, cropId: nextCropId }));
    if (targetCrop?.baseUnit) {
      setConversionRows((prev) => prev.filter((row) => row.unit !== targetCrop.baseUnit));
    }
    clearFieldError('cropId');
  };

  const handlePhotoUpload = async (file) => {
    setUploadingPhoto(true);
    setErrorMsg('');
    try {
      const uploaded = await catalogApi.uploadCatalogPhoto(file);
      setForm((prev) => ({ ...prev, imageUrl: uploaded.imageUrl || '' }));
      addToast({
        type: 'success',
        title: catalogCopy.toasts.imageUploaded,
        message: catalogCopy.toasts.imageUploadedMsg
      });
    } catch (err) {
      setErrorMsg(err?.message || 'Failed to upload variety photo');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canMutate) return;

    const en = form.en.trim();
    const hi = form.hi.trim();
    const nextErrors = {};

    if (!form.cropId) {
      nextErrors.cropId = formCopy.validationCropRequired;
    }
    if (!en) {
      nextErrors.en = formCopy.validationNameEnRequired;
    }
    if (!hi) {
      nextErrors.hi = formCopy.validationNameHiRequired;
    }

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      setErrorMsg(formCopy.validationSummary);
      return;
    }

    for (const row of conversionRows) {
      const num = Number(row.factor);
      if (!Number.isFinite(num) || num <= 0) {
        setFieldErrors({});
        setErrorMsg(formCopy.validationConversionPositive);
        return;
      }
    }

    const seenCodes = new Set();
    const normalizedGrades = [];
    for (const row of gradeRows) {
      const code = normalizeGradeCode(row.code);
      const label = (row.label || '').trim();
      if (!code || !label || seenCodes.has(code)) {
        setFieldErrors({});
        setErrorMsg(formCopy.validationGradeRequired);
        return;
      }
      seenCodes.add(code);
      normalizedGrades.push({
        code,
        label,
        labelHi: (row.labelHi || '').trim(),
        maxMoisturePercent:
          row.maxMoisturePercent !== '' && row.maxMoisturePercent !== null
            ? Number(row.maxMoisturePercent)
            : null,
        maxForeignMatterPercent:
          row.maxForeignMatterPercent !== '' && row.maxForeignMatterPercent !== null
            ? Number(row.maxForeignMatterPercent)
            : null,
        notes: (row.notes || '').trim()
      });
    }

    setFieldErrors({});
    setErrorMsg('');
    const payload = {
      cropId: form.cropId,
      name: en,
      translations: { en, hi },
      ...(form.slug.trim() ? { slug: form.slug.trim() } : {}),
      unitConversions: serializeConversionRows(conversionRows, effectiveBaseUnit),
      gradeSpecs: normalizedGrades.length > 0 ? normalizedGrades : null,
      imageUrl: form.imageUrl.trim() || null,
      isActive: form.isActive
    };

    try {
      if (isEdit) {
        await updateVariety.mutateAsync({ id: initialVariety.id, payload });
      } else {
        await createVariety.mutateAsync(payload);
      }
      onClose();
    } catch (err) {
      setErrorMsg(err?.message || 'Unable to save crop variety');
    }
  };

  const isSaving = createVariety.isPending || updateVariety.isPending;

  return (
    <SlideOver
      isOpen={isOpen}
      onClose={onClose}
      size="xl"
      title={isEdit ? formCopy.varietyEditTitle : formCopy.varietyCreateTitle}
      description={formCopy.varietyDesc}
      footer={
        <>
          <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>
            {actionsCopy.cancel}
          </Button>
          {canMutate && (
            <Button
              type="submit"
              form="variety-form"
              loading={isSaving}
              disabled={uploadingPhoto}
            >
              {isEdit ? actionsCopy.saveUpdate : actionsCopy.saveCreate}
            </Button>
          )}
        </>
      }
    >
      <form id="variety-form" noValidate onSubmit={handleSubmit} className="space-y-5">
        {errorMsg && <Alert type="error" title={errorMsg} />}

        <div className="space-y-2">
          <Select
            label={formCopy.cropSelectLabel}
            required
            disabled={!canMutate}
            placeholder={formCopy.cropSelectPlaceholder}
            options={cropOptions}
            value={form.cropId}
            error={fieldErrors.cropId}
            onChange={handleCropChange}
          />
          {selectedCrop && (
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <StatusBadge status="neutral" size="sm" dot={false}>
                {catalogCopy.columns.baseUnit}: {selectedCrop.baseUnit}
              </StatusBadge>
              <StatusBadge
                status={
                  PERISHABILITY_BADGE_VARIANT[selectedCrop.perishabilityType] || 'neutral'
                }
                size="sm"
              >
                {catalogCopy.perishability[selectedCrop.perishabilityType] ||
                  selectedCrop.perishabilityType}
              </StatusBadge>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label={formCopy.nameEnLabel}
            required
            disabled={!canMutate}
            value={form.en}
            error={fieldErrors.en}
            placeholder={formCopy.nameEnPlaceholder}
            onChange={(e) => {
              setForm((p) => ({ ...p, en: e.target.value }));
              clearFieldError('en');
            }}
          />
          <Input
            label={formCopy.nameHiLabel}
            required
            disabled={!canMutate}
            value={form.hi}
            error={fieldErrors.hi}
            placeholder={formCopy.nameHiPlaceholder}
            onChange={(e) => {
              setForm((p) => ({ ...p, hi: e.target.value }));
              clearFieldError('hi');
            }}
          />
        </div>

        <Input
          label={formCopy.slugLabel}
          disabled={!canMutate}
          value={form.slug}
          placeholder={formCopy.slugPlaceholder}
          onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))}
        />

        <UnitConversionsEditor
          baseUnit={effectiveBaseUnit}
          rows={conversionRows}
          onChange={setConversionRows}
          inheritedConversions={selectedCrop?.unitConversions || null}
          disabled={!canMutate}
        />

        <GradeSpecsEditor
          rows={gradeRows}
          onChange={setGradeRows}
          disabled={!canMutate}
        />

        <FileUploadField
          label={formCopy.imageLabel}
          accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
          acceptedFormatsLabel={formCopy.imageFormats}
          fileName={form.imageUrl ? form.imageUrl.split('/').pop() : ''}
          status={form.imageUrl ? 'VERIFIED' : undefined}
          uploading={uploadingPhoto}
          disabled={!canMutate}
          uploadLabel={formCopy.uploadImageBtn}
          replaceLabel={formCopy.replaceImageBtn}
          uploadingLabel={formCopy.uploadingImageBtn}
          onFileSelect={handlePhotoUpload}
          onPreview={
            form.imageUrl
              ? () => window.open(form.imageUrl, '_blank', 'noopener,noreferrer')
              : undefined
          }
          onRemove={
            canMutate && form.imageUrl
              ? () => setForm((p) => ({ ...p, imageUrl: '' }))
              : undefined
          }
        />

        {form.imageUrl && (
          <div className="rounded-xl border border-gray-200 p-2 bg-gray-50 inline-block">
            <img
              src={form.imageUrl}
              alt={form.en || 'Variety preview'}
              className="h-24 w-24 object-cover rounded-lg"
            />
          </div>
        )}

        <div className="pt-2 border-t border-gray-100">
          <Toggle
            label={formCopy.activeLabel}
            description={formCopy.activeDesc}
            checked={form.isActive}
            disabled={!canMutate}
            onChange={(checked) => setForm((p) => ({ ...p, isActive: checked }))}
          />
        </div>
      </form>
    </SlideOver>
  );
}

export default VarietyFormDrawer;
