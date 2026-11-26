import React, { useState } from 'react';
import { useCopy } from '../../../core/constants/index.js';
import { ACTIONS } from '../../../core/rbac/actions.js';
import { usePermission } from '../../../core/rbac/usePermission.js';
import { useUiStore } from '../../../core/ui/ui.store.js';
import {
  Alert,
  Button,
  FileUploadField,
  Input,
  SlideOver,
  Toggle
} from '../../../shared/components/index.js';
import { catalogApi } from '../api/catalog.api.js';
import { useCatalogMutations } from '../hooks/useCatalog.js';

const INITIAL_FORM = {
  en: '',
  hi: '',
  slug: '',
  icon: '',
  displayOrder: '0',
  imageUrl: '',
  isActive: true
};

export function CategoryFormDrawer({ isOpen, onClose, initialCategory = null }) {
  const copy = useCopy();
  const catalogCopy = copy.catalog;
  const formCopy = catalogCopy.forms;
  const actionsCopy = catalogCopy.actions;

  const isEdit = Boolean(initialCategory?.id);
  const canCreate = usePermission(ACTIONS.CROP.CREATE);
  const canUpdate = usePermission(ACTIONS.CROP.UPDATE);
  const canMutate = isEdit ? canUpdate : canCreate;

  const addToast = useUiStore((state) => state.addToast);
  const { createCategory, updateCategory } = useCatalogMutations();

  const [form, setForm] = useState(() =>
    initialCategory
      ? {
          en: initialCategory.translations?.en || initialCategory.name || '',
          hi: initialCategory.translations?.hi || '',
          slug: initialCategory.slug || '',
          icon: initialCategory.icon || '',
          displayOrder: String(initialCategory.displayOrder ?? 0),
          imageUrl: initialCategory.imageUrl || '',
          isActive: initialCategory.isActive ?? true
        }
      : INITIAL_FORM
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
      setErrorMsg(err?.message || 'Failed to upload category photo');
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

    setFieldErrors({});
    setErrorMsg('');
    const payload = {
      name: en,
      translations: { en, hi },
      ...(form.slug.trim() ? { slug: form.slug.trim() } : {}),
      icon: form.icon.trim() || null,
      displayOrder: Number(form.displayOrder) || 0,
      imageUrl: form.imageUrl.trim() || null,
      isActive: form.isActive
    };

    try {
      if (isEdit) {
        await updateCategory.mutateAsync({ id: initialCategory.id, payload });
      } else {
        await createCategory.mutateAsync(payload);
      }
      onClose();
    } catch (err) {
      setErrorMsg(err?.message || 'Unable to save category');
    }
  };

  const isSaving = createCategory.isPending || updateCategory.isPending;

  return (
    <SlideOver
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      title={isEdit ? formCopy.categoryEditTitle : formCopy.categoryCreateTitle}
      description={formCopy.categoryDesc}
      footer={
        <>
          <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>
            {actionsCopy.cancel}
          </Button>
          {canMutate && (
            <Button
              type="submit"
              form="category-form"
              loading={isSaving}
              disabled={uploadingPhoto}
            >
              {isEdit ? actionsCopy.saveUpdate : actionsCopy.saveCreate}
            </Button>
          )}
        </>
      }
    >
      <form id="category-form" noValidate onSubmit={handleSubmit} className="space-y-4">
        {errorMsg && <Alert type="error" title={errorMsg} />}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label={formCopy.nameEnLabel}
            required
            disabled={!canMutate}
            value={form.en}
            error={fieldErrors.en}
            placeholder="e.g. Cereals & Grains"
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
            placeholder="e.g. अनाज और खाद्यान्न"
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
            label={formCopy.iconLabel}
            disabled={!canMutate}
            value={form.icon}
            placeholder={formCopy.iconPlaceholder}
            onChange={(e) => setForm((p) => ({ ...p, icon: e.target.value }))}
          />
          <Input
            label={formCopy.displayOrderLabel}
            type="number"
            min="0"
            disabled={!canMutate}
            value={form.displayOrder}
            onChange={(e) => setForm((p) => ({ ...p, displayOrder: e.target.value }))}
          />
        </div>

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
              alt={form.en || 'Category preview'}
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

export default CategoryFormDrawer;
