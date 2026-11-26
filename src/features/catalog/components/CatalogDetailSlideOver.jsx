import React from 'react';
import { Pencil, Sprout, Trash2 } from 'lucide-react';
import { useCopy } from '../../../core/constants/index.js';
import { ACTIONS } from '../../../core/rbac/actions.js';
import { Can } from '../../../core/rbac/Can.jsx';
import {
  Alert,
  Button,
  SlideOver,
  StatusBadge
} from '../../../shared/components/index.js';
import { PERISHABILITY_BADGE_VARIANT } from '../constants/catalog.constants.js';
import {
  useCategoryDetail,
  useCropDetail,
  useVarietyDetail
} from '../hooks/useCatalog.js';

export function CatalogDetailSlideOver({
  tab,
  detailId,
  onClose,
  onEdit,
  onDelete
}) {
  const copy = useCopy();
  const catalogCopy = copy.catalog;
  const detailCopy = catalogCopy.detail;
  const actionsCopy = catalogCopy.actions;

  const isVariety = tab === 'varieties';
  const isCrop = tab === 'crops';
  const isCategory = tab === 'categories';

  const varietyQuery = useVarietyDetail(detailId, Boolean(detailId) && isVariety);
  const cropQuery = useCropDetail(detailId, Boolean(detailId) && isCrop);
  const categoryQuery = useCategoryDetail(detailId, Boolean(detailId) && isCategory);

  const activeQuery = isVariety
    ? varietyQuery
    : isCrop
      ? cropQuery
      : categoryQuery;
  const item = activeQuery.data;

  const fallbackTitle = isVariety
    ? detailCopy.varietyTitleFallback
    : isCrop
      ? detailCopy.cropTitleFallback
      : detailCopy.categoryTitleFallback;

  const parentCrop = isVariety ? item?.crop : isCrop ? item : null;
  const baseUnit = parentCrop?.baseUnit || 'KG';
  const effectiveConversions = item?.effectiveUnitConversions || {};
  const cropConversions = isVariety ? parentCrop?.unitConversions || {} : item?.unitConversions || {};
  const varietyOverrides = isVariety ? item?.unitConversions || {} : {};
  const gradeSpecs = Array.isArray(item?.gradeSpecs) ? item.gradeSpecs : [];

  return (
    <SlideOver
      isOpen={Boolean(detailId)}
      onClose={onClose}
      size="lg"
      title={item?.name || fallbackTitle}
      description={item?.translations?.hi || item?.slug || ''}
      footer={
        <>
          <Button type="button" variant="outline" onClick={onClose}>
            {actionsCopy.close}
          </Button>
          {item && (
            <>
              <Can action={ACTIONS.CROP.DELETE}>
                <Button
                  type="button"
                  variant="danger"
                  leftIcon={Trash2}
                  onClick={() => onDelete(item)}
                >
                  {actionsCopy.delete}
                </Button>
              </Can>
              <Can action={ACTIONS.CROP.UPDATE}>
                <Button
                  type="button"
                  leftIcon={Pencil}
                  onClick={() => onEdit(item)}
                >
                  {actionsCopy.edit}
                </Button>
              </Can>
            </>
          )}
        </>
      }
    >
      {activeQuery.isLoading ? (
        <div className="space-y-4 animate-pulse">
          <div className="h-24 rounded-xl bg-gray-100" />
          <div className="h-32 rounded-xl bg-gray-100" />
          <div className="h-32 rounded-xl bg-gray-100" />
        </div>
      ) : activeQuery.isError ? (
        <Alert
          type="error"
          title={activeQuery.error?.message || 'Failed to load catalog details'}
        />
      ) : !item ? null : (
        <div className="space-y-6">
          <div className="flex items-start gap-4 rounded-xl border border-gray-200 bg-gray-50/70 p-4">
            {item.imageUrl ? (
              <img
                src={item.imageUrl}
                alt={item.name}
                className="h-20 w-20 rounded-xl object-cover border border-gray-200 bg-white shrink-0"
              />
            ) : (
              <div className="h-20 w-20 rounded-xl border border-gray-200 bg-ktc-green-light flex items-center justify-center shrink-0">
                <Sprout className="w-8 h-8 text-ktc-green" />
              </div>
            )}

            <div className="min-w-0 flex-1 space-y-2">
              <div>
                <h4 className="text-base font-bold text-gray-900">{item.translations?.en || item.name}</h4>
                <p className="text-sm text-gray-600">{item.translations?.hi}</p>
                <p className="text-xs font-mono text-gray-500 mt-0.5">{item.slug}</p>
              </div>

              <div className="flex flex-wrap gap-2">
                <StatusBadge status={item.isActive ? 'success' : 'neutral'} size="sm">
                  {item.isActive
                    ? catalogCopy.filters.statusActive
                    : catalogCopy.filters.statusInactive}
                </StatusBadge>

                {parentCrop?.perishabilityType && (
                  <StatusBadge
                    status={
                      PERISHABILITY_BADGE_VARIANT[parentCrop.perishabilityType] ||
                      'neutral'
                    }
                    size="sm"
                  >
                    {catalogCopy.perishability[parentCrop.perishabilityType] ||
                      parentCrop.perishabilityType}
                  </StatusBadge>
                )}

                {parentCrop?.baseUnit && (
                  <StatusBadge status="neutral" size="sm" dot={false}>
                    {catalogCopy.columns.baseUnit}: {parentCrop.baseUnit}
                  </StatusBadge>
                )}

                {parentCrop?.shelfLifeDays && (
                  <StatusBadge status="info" size="sm" dot={false}>
                    {parentCrop.shelfLifeDays} {detailCopy.shelfLifeSuffix}
                  </StatusBadge>
                )}

                {parentCrop?.standardMoistureThreshold !== null &&
                  parentCrop?.standardMoistureThreshold !== undefined && (
                    <StatusBadge status="gold" size="sm" dot={false}>
                      {parentCrop.standardMoistureThreshold}
                      {detailCopy.moistureSuffix}
                    </StatusBadge>
                  )}
              </div>
            </div>
          </div>

          {(isVariety || isCrop) && (
            <div className="space-y-3">
              <h5 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                {detailCopy.unitMatrixTitle}
              </h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {Object.entries(effectiveConversions).map(([unit, factor]) => {
                  const isBase = unit === baseUnit;
                  const isOverridden =
                    !isBase &&
                    varietyOverrides &&
                    Object.prototype.hasOwnProperty.call(varietyOverrides, unit);
                  const badgeStatus = isBase
                    ? 'success'
                    : isOverridden
                      ? 'gold'
                      : 'neutral';
                  const badgeLabel = isBase
                    ? detailCopy.baseBadge
                    : isOverridden
                      ? detailCopy.overrideBadge
                      : detailCopy.inheritedBadge;

                  return (
                    <div
                      key={unit}
                      className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-3 py-2.5"
                    >
                      <span className="text-sm font-semibold text-gray-900">
                        1 {unit} = {factor} {baseUnit}
                      </span>
                      <StatusBadge status={badgeStatus} size="sm" dot={false}>
                        {badgeLabel}
                      </StatusBadge>
                    </div>
                  );
                })}
                {Object.keys(effectiveConversions).length === 0 &&
                  cropConversions &&
                  Object.keys(cropConversions).length === 0 && (
                    <p className="text-xs text-gray-500">1 {baseUnit} = 1 {baseUnit}</p>
                  )}
              </div>
            </div>
          )}

          {isVariety && (
            <div className="space-y-3">
              <h5 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                {detailCopy.gradeSpecsTitle}
              </h5>
              {gradeSpecs.length === 0 ? (
                <p className="text-sm text-gray-500 italic">{detailCopy.noGradesConfigured}</p>
              ) : (
                <div className="space-y-2.5">
                  {gradeSpecs.map((grade) => (
                    <div
                      key={grade.code}
                      className="rounded-xl border border-gray-200 bg-white p-3.5 space-y-1.5"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <StatusBadge status="gold" size="sm" dot={false}>
                            {grade.code}
                          </StatusBadge>
                          <span className="text-sm font-semibold text-gray-900">
                            {grade.label}
                          </span>
                        </div>
                        {grade.labelHi && (
                          <span className="text-xs text-gray-500">{grade.labelHi}</span>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-3 text-xs text-gray-600">
                        {grade.maxMoisturePercent !== null &&
                          grade.maxMoisturePercent !== undefined && (
                            <span>
                              {catalogCopy.gradeEditor.maxMoistureLabel}:{' '}
                              <strong className="text-gray-900">
                                {grade.maxMoisturePercent}%
                              </strong>
                            </span>
                          )}
                        {grade.maxForeignMatterPercent !== null &&
                          grade.maxForeignMatterPercent !== undefined && (
                            <span>
                              {catalogCopy.gradeEditor.maxForeignLabel}:{' '}
                              <strong className="text-gray-900">
                                {grade.maxForeignMatterPercent}%
                              </strong>
                            </span>
                          )}
                      </div>

                      {grade.notes && (
                        <p className="text-xs text-gray-500">{grade.notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {isVariety && item._count && (
            <div className="space-y-3">
              <h5 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                {detailCopy.downstreamTitle}
              </h5>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { label: 'Mandi Rates', value: item._count.mandiRates || 0 },
                  { label: 'Hub Stock', value: item._count.hubInventories || 0 },
                  { label: 'GRNs', value: item._count.goodsReceiptNotes || 0 },
                  { label: 'Order Items', value: item._count.orderItems || 0 }
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-center"
                  >
                    <p className="text-lg font-bold text-gray-900">{stat.value}</p>
                    <p className="text-[11px] text-gray-500">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {isCrop && Array.isArray(item.varieties) && (
            <div className="space-y-2.5">
              <h5 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                {detailCopy.childVarietiesTitle} ({item.varieties.length})
              </h5>
              <div className="divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white">
                {item.varieties.map((v) => (
                  <div
                    key={v.id}
                    className="flex items-center justify-between px-3.5 py-2.5 text-sm"
                  >
                    <div>
                      <span className="font-medium text-gray-900">{v.name}</span>
                      {v.translations?.hi && (
                        <span className="ml-2 text-xs text-gray-500">
                          ({v.translations.hi})
                        </span>
                      )}
                    </div>
                    <StatusBadge status={v.isActive ? 'success' : 'neutral'} size="sm">
                      {v.isActive
                        ? catalogCopy.filters.statusActive
                        : catalogCopy.filters.statusInactive}
                    </StatusBadge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {isCategory && Array.isArray(item.crops) && (
            <div className="space-y-2.5">
              <h5 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                {detailCopy.childCropsTitle} ({item.crops.length})
              </h5>
              <div className="divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white">
                {item.crops.map((crop) => (
                  <div
                    key={crop.id}
                    className="flex items-center justify-between px-3.5 py-2.5 text-sm"
                  >
                    <div>
                      <span className="font-medium text-gray-900">{crop.name}</span>
                      {crop.translations?.hi && (
                        <span className="ml-2 text-xs text-gray-500">
                          ({crop.translations.hi})
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge
                        status={
                          PERISHABILITY_BADGE_VARIANT[crop.perishabilityType] ||
                          'neutral'
                        }
                        size="sm"
                      >
                        {catalogCopy.perishability[crop.perishabilityType] ||
                          crop.perishabilityType}
                      </StatusBadge>
                      <StatusBadge status="neutral" size="sm" dot={false}>
                        {crop.baseUnit}
                      </StatusBadge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </SlideOver>
  );
}

export default CatalogDetailSlideOver;
