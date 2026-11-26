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
  Toggle
} from '../../../shared/components/index.js';
import { catalogApi } from '../api/catalog.api.js';
import {
  BASE_UNITS,
  PERISHABILITY_TYPES,
  buildConversionRows,
  serializeConversionRows
} from '../constants/catalog.constants.js';
import { useCatalogMutations, useCategoryOptions } from '../hooks/useCatalog.js';
import { UnitConversionsEditor } from './UnitConversionsEditor.jsx';

const INITIAL_FORM = {
  categoryId: '',
  en: '',
  hi: '',
  slug: '',
  botanicalName: '',
  perishabilityType: 'NON_PERISHABLE',
  shelfLifeDays: '',
  baseUnit: 'KG',
  standardMoistureThreshold: '',
  imageUrl: '',
  isActive: true
};

export function CropFormDrawer({ isOpen, onClose, initialCrop = null }) {
  const copy = useCopy();
  const catalogCopy = copy.catalog;
  const formCopy = catalogCopy.forms;
  const actionsCopy = catalogCopy.actions;

  const isEdit = Boolean(initialCrop?.id);
  const canCreate = usePermission(ACTIONS.CROP.CREATE);
  const canUpdate = usePermission(ACTIONS.CROP.UPDATE);
  const canMutate = isEdit ? canUpdate : canCreate;

  const addToast = useUiStore((state) => state.addToast);
  const { data: categoriesData } = useCategoryOptions(isOpen && canMutate);
  const { createCrop, updateCrop } = useCatalogMutations();

  const [form, setForm] = useState(() =>
    initialCrop
      ? {
          categoryId: initialCrop.categoryId || '',
          en: initialCrop.translations?.en || initialCrop.name || '',
          hi: initialCrop.translations?.hi || '',
          slug: initialCrop.slug || '',
          botanicalName: initialCrop.botanicalName || '',
          perishabilityType: initialCrop.perishabilityType || 'NON_PERISHABLE',
          shelfLifeDays:
            initialCrop.shelfLifeDays !== null && initialCrop.shelfLifeDays !== undefined
              ? String(initialCrop.shelfLifeDays)
              : '',
          baseUnit: initialCrop.baseUnit || 'KG',
          standardMoistureThreshold:
            initialCrop.standardMoistureThreshold !== null &&
            initialCrop.standardMoistureThreshold !== undefined
              ? String(initialCrop.standardMoistureThreshold)
              : '',
          imageUrl: initialCrop.imageUrl || '',
          isActive: initialCrop.isActive ?? true
        }
      : INITIAL_FORM
  );
  const [conversionRows, setConversionRows] = useState(() =>
    initialCrop
      ? buildConversionRows(initialCrop.unitConversions, initialCrop.baseUnit || 'KG')
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

  const hasVarieties = (initialCrop?._count?.varieties || 0) > 0;

  const categoryOptions = useMemo(
    () =>
      (categoriesData?.items || []).map((cat) => ({
        value: cat.id,
        label: cat.translations?.hi ? `${cat.name} (${cat.translations.hi})` : cat.name
      })),
    [categoriesData?.items]
  );

  const baseUnitOptions = useMemo(
    () =>
      BASE_UNITS.map((unit) => ({
        value: unit,
        label: catalogCopy.baseUnits[unit] || unit
      })),
    [catalogCopy.baseUnits]
  );

  const perishabilityOptions = useMemo(
    () =>
      PERISHABILITY_TYPES.map((type) => ({
        value: type,
        label: catalogCopy.perishability[type] || type
      })),
    [catalogCopy.perishability]
  );

  const handleBaseUnitChange = (event) => {
    const nextUnit = event?.target?.value ?? '';
    setForm((prev) => ({ ...prev, baseUnit: nextUnit }));
    setConversionRows((prev) => prev.filter((row) => row.unit !== nextUnit));
    clearFieldError('baseUnit');
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
      setErrorMsg(err?.message || 'Failed to upload crop photo');
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

    if (!form.categoryId) {
      nextErrors.categoryId = formCopy.validationCategoryRequired;
    }
    if (!form.perishabilityType) {
      nextErrors.perishabilityType = formCopy.validationPerishabilityRequired;
    }
    if (!en) {
      nextErrors.en = formCopy.validationNameEnRequired;
    }
    if (!hi) {
      nextErrors.hi = formCopy.validationNameHiRequired;
    }
    if (!form.baseUnit) {
      nextErrors.baseUnit = formCopy.validationBaseUnitRequired;
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

    setFieldErrors({});
    setErrorMsg('');
    const payload = {
      categoryId: form.categoryId,
      name: en,
      translations: { en, hi },
      ...(form.slug.trim() ? { slug: form.slug.trim() } : {}),
      botanicalName: form.botanicalName.trim() || null,
      perishabilityType: form.perishabilityType,
      shelfLifeDays: form.shelfLifeDays ? Number(form.shelfLifeDays) : null,
      ...(!isEdit || !hasVarieties ? { baseUnit: form.baseUnit } : {}),
      unitConversions: serializeConversionRows(conversionRows, form.baseUnit),
      standardMoistureThreshold: form.standardMoistureThreshold
        ? Number(form.standardMoistureThreshold)
        : null,
      imageUrl: form.imageUrl.trim() || null,
      isActive: form.isActive
    };

    try {
      if (isEdit) {
        await updateCrop.mutateAsync({ id: initialCrop.id, payload });
      } else {
        await createCrop.mutateAsync(payload);
      }
      onClose();
    } catch (err) {
      setErrorMsg(err?.message || 'Unable to save master crop');
    }
  };

  const isSaving = createCrop.isPending || updateCrop.isPending;

  return (
    <SlideOver
      isOpen={isOpen}
      onClose={onClose}
      size="xl"
      title={isEdit ? formCopy.cropEditTitle : formCopy.cropCreateTitle}
      description={formCopy.cropDesc}
      footer={
        <>
          <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>
            {actionsCopy.cancel}
          </Button>
          {canMutate && (
            <Button
              type="submit"
              form="crop-form"
              loading={isSaving}
              disabled={uploadingPhoto}
            >
              {isEdit ? actionsCopy.saveUpdate : actionsCopy.saveCreate}
            </Button>
          )}
        </>
      }
    >
      <form id="crop-form" noValidate onSubmit={handleSubmit} className="space-y-5">
        {errorMsg && <Alert type="error" title={errorMsg} />}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label={formCopy.categorySelectLabel}
            required
            disabled={!canMutate}
            placeholder={formCopy.categorySelectPlaceholder}
            options={categoryOptions}
            value={form.categoryId}
            error={fieldErrors.categoryId}
            onChange={(e) => {
              const nextCategoryId = e?.target?.value ?? '';
              setForm((p) => ({ ...p, categoryId: nextCategoryId }));
              clearFieldError('categoryId');
            }}
          />
          <Select
            label={formCopy.perishabilityLabel}
            required
            disabled={!canMutate}
            options={perishabilityOptions}
            value={form.perishabilityType}
            error={fieldErrors.perishabilityType}
            onChange={(e) => {
              const nextPerishability = e?.target?.value ?? '';
              setForm((p) => ({ ...p, perishabilityType: nextPerishability }));
              clearFieldError('perishabilityType');
            }}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label={formCopy.nameEnLabel}
            required
            disabled={!canMutate}
            value={form.en}
            error={fieldErrors.en}
            placeholder="e.g. Wheat"
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
            placeholder="e.g. गेहूं"
            onChange={(e) => {
              setForm((p) => ({ ...p, hi: e.target.value }));
              clearFieldError('hi');
            }}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            label={formCopy.slugLabel}
            disabled={!canMutate}
            value={form.slug}
            placeholder={formCopy.slugPlaceholder}
            onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))}
          />
          <Input
            label={formCopy.botanicalNameLabel}
            disabled={!canMutate}
            value={form.botanicalName}
            placeholder={formCopy.botanicalNamePlaceholder}
            onChange={(e) => setForm((p) => ({ ...p, botanicalName: e.target.value }))}
          />
          <Input
            label={formCopy.shelfLifeLabel}
            type="number"
            min="1"
            max="3650"
            disabled={!canMutate}
            value={form.shelfLifeDays}
            placeholder={formCopy.shelfLifePlaceholder}
            onChange={(e) => setForm((p) => ({ ...p, shelfLifeDays: e.target.value }))}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label={formCopy.baseUnitLabel}
            required
            disabled={!canMutate || (isEdit && hasVarieties)}
            options={baseUnitOptions}
            value={form.baseUnit}
            error={fieldErrors.baseUnit}
            helperText={isEdit && hasVarieties ? formCopy.baseUnitLockedNotice : undefined}
            onChange={handleBaseUnitChange}
          />
          <Input
            label={formCopy.moistureLabel}
            type="number"
            min="0"
            max="100"
            step="0.1"
            suffix="%"
            disabled={!canMutate}
            value={form.standardMoistureThreshold}
            placeholder={formCopy.moisturePlaceholder}
            onChange={(e) =>
              setForm((p) => ({ ...p, standardMoistureThreshold: e.target.value }))
            }
          />
        </div>

        <UnitConversionsEditor
          baseUnit={form.baseUnit}
          rows={conversionRows}
          onChange={setConversionRows}
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
              alt={form.en || 'Crop preview'}
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

export default CropFormDrawer;
