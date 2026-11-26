import React, { useCallback, useMemo, useState } from 'react';
import {
  CheckCircle2,
  Eye,
  FolderTree,
  Layers,
  Leaf,
  Pencil,
  Plus,
  RefreshCw,
  RotateCcw,
  Sprout,
  Trash2
} from 'lucide-react';
import { useCopy } from '../../../core/constants/index.js';
import { ACTIONS } from '../../../core/rbac/actions.js';
import { Can } from '../../../core/rbac/Can.jsx';
import {
  Button,
  DataTable,
  Input,
  Modal,
  PageHeader,
  SearchBar,
  Select,
  StatCard,
  StatusBadge
} from '../../../shared/components/index.js';
import { cn } from '../../../shared/utils/cn.js';
import { CatalogDetailSlideOver } from '../components/CatalogDetailSlideOver.jsx';
import { CategoryFormDrawer } from '../components/CategoryFormDrawer.jsx';
import { CropFormDrawer } from '../components/CropFormDrawer.jsx';
import { VarietyFormDrawer } from '../components/VarietyFormDrawer.jsx';
import {
  BASE_UNITS,
  PERISHABILITY_BADGE_VARIANT,
  PERISHABILITY_TYPES
} from '../constants/catalog.constants.js';
import {
  useCatalogMutations,
  useCatalogUrlState,
  useCategoriesList,
  useCategoryOptions,
  useCropOptions,
  useCropsList,
  useVarietiesList
} from '../hooks/useCatalog.js';

export function CatalogPage() {
  const copy = useCopy();
  const catalogCopy = copy.catalog;
  const actionsCopy = catalogCopy.actions;

  const { params, setParam, setParams, resetParams, pageSizeOptions } =
    useCatalogUrlState();

  const activeTab = ['varieties', 'crops', 'categories'].includes(params.tab)
    ? params.tab
    : 'varieties';

  const varietiesQuery = useVarietiesList(params, activeTab === 'varieties');
  const cropsQuery = useCropsList(params, activeTab === 'crops');
  const categoriesQuery = useCategoriesList(params, activeTab === 'categories');

  const categoryOptionsQuery = useCategoryOptions(activeTab !== 'categories');
  const cropOptionsQuery = useCropOptions(activeTab === 'varieties');

  const { deleteCategory, deleteCrop, deleteVariety } = useCatalogMutations();

  const [categoryDrawerOpen, setCategoryDrawerOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [cropDrawerOpen, setCropDrawerOpen] = useState(false);
  const [editingCrop, setEditingCrop] = useState(null);
  const [varietyDrawerOpen, setVarietyDrawerOpen] = useState(false);
  const [editingVariety, setEditingVariety] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const activeQuery =
    activeTab === 'varieties'
      ? varietiesQuery
      : activeTab === 'crops'
        ? cropsQuery
        : categoriesQuery;

  const items = useMemo(
    () => activeQuery.data?.items ?? [],
    [activeQuery.data?.items]
  );

  const meta = activeQuery.data?.meta ?? {
    page: params.page,
    limit: params.limit,
    total: 0,
    totalPages: 1
  };

  const categoryFilterOptions = useMemo(
    () => [
      { value: '', label: catalogCopy.filters.allCategories },
      ...(categoryOptionsQuery.data?.items || []).map((cat) => ({
        value: cat.id,
        label: cat.name
      }))
    ],
    [categoryOptionsQuery.data?.items, catalogCopy.filters.allCategories]
  );

  const cropFilterOptions = useMemo(
    () => [
      { value: '', label: catalogCopy.filters.allCrops },
      ...(cropOptionsQuery.data?.items || [])
        .filter((crop) => !params.categoryId || crop.categoryId === params.categoryId)
        .map((crop) => ({
          value: crop.id,
          label: crop.name
        }))
    ],
    [cropOptionsQuery.data?.items, params.categoryId, catalogCopy.filters.allCrops]
  );

  const baseUnitFilterOptions = useMemo(
    () => [
      { value: 'all', label: catalogCopy.filters.allBaseUnits },
      ...BASE_UNITS.map((unit) => ({
        value: unit,
        label: catalogCopy.baseUnits[unit] || unit
      }))
    ],
    [catalogCopy.filters.allBaseUnits, catalogCopy.baseUnits]
  );

  const perishabilityFilterOptions = useMemo(
    () => [
      { value: 'all', label: catalogCopy.filters.allPerishability },
      ...PERISHABILITY_TYPES.map((type) => ({
        value: type,
        label: catalogCopy.perishability[type] || type
      }))
    ],
    [catalogCopy.filters.allPerishability, catalogCopy.perishability]
  );

  const statusFilterOptions = useMemo(
    () => [
      { value: 'all', label: catalogCopy.filters.allStatuses },
      { value: 'true', label: catalogCopy.filters.statusActive },
      { value: 'false', label: catalogCopy.filters.statusInactive }
    ],
    [catalogCopy.filters]
  );

  const activeCountOnPage = useMemo(
    () => items.filter((item) => item.isActive).length,
    [items]
  );

  const thirdStatCount = useMemo(() => {
    if (activeTab === 'varieties') {
      return items.filter((v) => Array.isArray(v.gradeSpecs) && v.gradeSpecs.length > 0).length;
    }
    if (activeTab === 'crops') {
      return items.filter((c) => c.perishabilityType === 'PERISHABLE').length;
    }
    return items.reduce((sum, c) => sum + (c._count?.crops || 0), 0);
  }, [activeTab, items]);

  const hasActiveFilters = Boolean(
    params.search ||
      params.categoryId ||
      params.cropId ||
      params.baseUnit !== 'all' ||
      params.perishability !== 'all' ||
      params.grade ||
      params.isActive !== 'all'
  );

  const handleOpenCreate = () => {
    if (activeTab === 'categories') {
      setEditingCategory(null);
      setCategoryDrawerOpen(true);
    } else if (activeTab === 'crops') {
      setEditingCrop(null);
      setCropDrawerOpen(true);
    } else {
      setEditingVariety(null);
      setVarietyDrawerOpen(true);
    }
  };

  const handleOpenEdit = useCallback(
    (row) => {
      if (activeTab === 'categories') {
        setEditingCategory(row);
        setCategoryDrawerOpen(true);
      } else if (activeTab === 'crops') {
        setEditingCrop(row);
        setCropDrawerOpen(true);
      } else {
        setEditingVariety(row);
        setVarietyDrawerOpen(true);
      }
    },
    [activeTab]
  );

  const handleOpenDetail = useCallback(
    (row) => {
      setParam('detailId', row.id, { resetPage: false });
    },
    [setParam]
  );

  const handleCloseDetail = useCallback(() => {
    setParam('detailId', '', { resetPage: false });
  }, [setParam]);

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      if (activeTab === 'categories') {
        await deleteCategory.mutateAsync(deleteTarget.id);
      } else if (activeTab === 'crops') {
        await deleteCrop.mutateAsync(deleteTarget.id);
      } else {
        await deleteVariety.mutateAsync(deleteTarget.id);
      }
      if (params.detailId === deleteTarget.id) {
        handleCloseDetail();
      }
      setDeleteTarget(null);
    } catch {
      setDeleteTarget(null);
    }
  };

  const handleTabSwitch = (nextTab) => {
    setParams({
      tab: nextTab,
      page: 1,
      detailId: '',
      categoryId: '',
      cropId: '',
      grade: '',
      sortBy: nextTab === 'categories' ? 'displayOrder' : 'name',
      sortOrder: 'asc'
    });
  };

  const varietyColumns = useMemo(
    () => [
      {
        key: 'name',
        header: catalogCopy.columns.varietyIdentity,
        sortable: true,
        render: (_v, row) => (
          <div className="flex items-center gap-3 min-w-0">
            {row.imageUrl ? (
              <img
                src={row.imageUrl}
                alt={row.name}
                className="h-9 w-9 rounded-lg object-cover border border-gray-200 shrink-0"
              />
            ) : (
              <div className="h-9 w-9 rounded-lg bg-ktc-green-light flex items-center justify-center shrink-0">
                <Sprout className="w-4 h-4 text-ktc-green" />
              </div>
            )}
            <div className="min-w-0">
              <p className="font-semibold text-gray-900 truncate">{row.name}</p>
              {row.translations?.hi && (
                <p className="text-xs text-gray-500 truncate">{row.translations.hi}</p>
              )}
            </div>
          </div>
        )
      },
      {
        key: 'crop',
        header: catalogCopy.columns.parentCrop,
        render: (_v, row) => (
          <div className="text-xs">
            <p className="font-medium text-gray-900">{row.crop?.name || '—'}</p>
            <p className="text-gray-500">{row.crop?.category?.name || '—'}</p>
          </div>
        )
      },
      {
        key: 'perishability',
        header: catalogCopy.columns.perishability,
        render: (_v, row) => {
          const pType = row.crop?.perishabilityType || 'NON_PERISHABLE';
          return (
            <div className="flex flex-col items-start gap-1">
              <StatusBadge
                status={PERISHABILITY_BADGE_VARIANT[pType] || 'neutral'}
                size="sm"
              >
                {catalogCopy.perishability[pType] || pType}
              </StatusBadge>
              <span className="text-[11px] text-gray-500">
                {catalogCopy.columns.baseUnit}: {row.crop?.baseUnit || 'KG'}
              </span>
            </div>
          );
        }
      },
      {
        key: 'conversions',
        header: catalogCopy.columns.conversions,
        render: (_v, row) => {
          const baseUnit = row.crop?.baseUnit || 'KG';
          const entries = Object.entries(row.effectiveUnitConversions || {}).filter(
            ([u]) => u !== baseUnit
          );
          return (
            <div className="flex flex-wrap gap-1">
              {entries.length === 0 ? (
                <span className="text-xs text-gray-400">1:1 {baseUnit}</span>
              ) : (
                entries.slice(0, 3).map(([unit, factor]) => (
                  <StatusBadge key={unit} status="neutral" size="sm" dot={false}>
                    {unit}={factor} {baseUnit}
                  </StatusBadge>
                ))
              )}
            </div>
          );
        }
      },
      {
        key: 'grades',
        header: catalogCopy.columns.grades,
        render: (_v, row) => {
          const grades = Array.isArray(row.gradeSpecs) ? row.gradeSpecs : [];
          return (
            <div className="flex flex-wrap gap-1">
              {grades.length === 0 ? (
                <span className="text-xs text-gray-400">—</span>
              ) : (
                grades.slice(0, 3).map((g) => (
                  <StatusBadge key={g.code} status="gold" size="sm" dot={false}>
                    {g.code}
                  </StatusBadge>
                ))
              )}
              {grades.length > 3 && (
                <StatusBadge status="neutral" size="sm" dot={false}>
                  +{grades.length - 3}
                </StatusBadge>
              )}
            </div>
          );
        }
      },
      {
        key: 'isActive',
        header: catalogCopy.columns.status,
        render: (_v, row) => (
          <StatusBadge status={row.isActive ? 'success' : 'neutral'} size="sm">
            {row.isActive
              ? catalogCopy.filters.statusActive
              : catalogCopy.filters.statusInactive}
          </StatusBadge>
        )
      },
      {
        key: 'actions',
        header: catalogCopy.columns.actions,
        align: 'right',
        render: (_v, row) => (
          <div
            className="flex items-center justify-end gap-1"
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              variant="ghost"
              size="sm"
              leftIcon={Eye}
              onClick={() => handleOpenDetail(row)}
            >
              {actionsCopy.view}
            </Button>
            <Can action={ACTIONS.CROP.UPDATE}>
              <Button
                variant="ghost"
                size="sm"
                leftIcon={Pencil}
                onClick={() => handleOpenEdit(row)}
              >
                {actionsCopy.edit}
              </Button>
            </Can>
            <Can action={ACTIONS.CROP.DELETE}>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDeleteTarget(row)}
                className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2"
                aria-label={actionsCopy.delete}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </Can>
          </div>
        )
      }
    ],
    [catalogCopy, actionsCopy, handleOpenDetail, handleOpenEdit]
  );

  const cropColumns = useMemo(
    () => [
      {
        key: 'name',
        header: catalogCopy.columns.cropIdentity,
        sortable: true,
        render: (_v, row) => (
          <div className="flex items-center gap-3 min-w-0">
            {row.imageUrl ? (
              <img
                src={row.imageUrl}
                alt={row.name}
                className="h-9 w-9 rounded-lg object-cover border border-gray-200 shrink-0"
              />
            ) : (
              <div className="h-9 w-9 rounded-lg bg-ktc-green-light flex items-center justify-center shrink-0">
                <Leaf className="w-4 h-4 text-ktc-green" />
              </div>
            )}
            <div className="min-w-0">
              <p className="font-semibold text-gray-900 truncate">{row.name}</p>
              <p className="text-xs text-gray-500 truncate">
                {row.translations?.hi}
                {row.botanicalName ? ` • ${row.botanicalName}` : ''}
              </p>
            </div>
          </div>
        )
      },
      {
        key: 'category',
        header: catalogCopy.columns.categoryName,
        render: (_v, row) => (
          <span className="text-sm text-gray-700">{row.category?.name || '—'}</span>
        )
      },
      {
        key: 'perishabilityType',
        header: catalogCopy.columns.perishability,
        sortable: true,
        render: (_v, row) => (
          <div className="space-y-1">
            <StatusBadge
              status={PERISHABILITY_BADGE_VARIANT[row.perishabilityType] || 'neutral'}
              size="sm"
            >
              {catalogCopy.perishability[row.perishabilityType] ||
                row.perishabilityType}
            </StatusBadge>
            {row.shelfLifeDays && (
              <p className="text-[11px] text-gray-500">
                {row.shelfLifeDays} {catalogCopy.detail.shelfLifeSuffix}
              </p>
            )}
          </div>
        )
      },
      {
        key: 'baseUnit',
        header: catalogCopy.columns.baseUnit,
        sortable: true,
        render: (_v, row) => {
          const entries = Object.entries(row.unitConversions || {});
          return (
            <div className="space-y-1">
              <StatusBadge status="neutral" size="sm" dot={false}>
                {row.baseUnit}
              </StatusBadge>
              {entries.length > 0 && (
                <p className="text-[11px] text-gray-500">
                  {entries.map(([u, f]) => `${u}=${f}`).join(', ')}
                </p>
              )}
            </div>
          );
        }
      },
      {
        key: 'varieties',
        header: catalogCopy.columns.varietiesCount,
        render: (_v, row) => (
          <span className="text-sm font-medium text-gray-800">
            {row._count?.varieties || 0}
          </span>
        )
      },
      {
        key: 'isActive',
        header: catalogCopy.columns.status,
        render: (_v, row) => (
          <StatusBadge status={row.isActive ? 'success' : 'neutral'} size="sm">
            {row.isActive
              ? catalogCopy.filters.statusActive
              : catalogCopy.filters.statusInactive}
          </StatusBadge>
        )
      },
      {
        key: 'actions',
        header: catalogCopy.columns.actions,
        align: 'right',
        render: (_v, row) => (
          <div
            className="flex items-center justify-end gap-1"
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              variant="ghost"
              size="sm"
              leftIcon={Eye}
              onClick={() => handleOpenDetail(row)}
            >
              {actionsCopy.view}
            </Button>
            <Can action={ACTIONS.CROP.UPDATE}>
              <Button
                variant="ghost"
                size="sm"
                leftIcon={Pencil}
                onClick={() => handleOpenEdit(row)}
              >
                {actionsCopy.edit}
              </Button>
            </Can>
            <Can action={ACTIONS.CROP.DELETE}>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDeleteTarget(row)}
                className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2"
                aria-label={actionsCopy.delete}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </Can>
          </div>
        )
      }
    ],
    [catalogCopy, actionsCopy, handleOpenDetail, handleOpenEdit]
  );

  const categoryColumns = useMemo(
    () => [
      {
        key: 'name',
        header: catalogCopy.columns.categoryIdentity,
        sortable: true,
        render: (_v, row) => (
          <div className="flex items-center gap-3 min-w-0">
            {row.imageUrl ? (
              <img
                src={row.imageUrl}
                alt={row.name}
                className="h-9 w-9 rounded-lg object-cover border border-gray-200 shrink-0"
              />
            ) : (
              <div className="h-9 w-9 rounded-lg bg-ktc-green-light flex items-center justify-center shrink-0">
                <FolderTree className="w-4 h-4 text-ktc-green" />
              </div>
            )}
            <div className="min-w-0">
              <p className="font-semibold text-gray-900 truncate">{row.name}</p>
              <p className="text-xs text-gray-500 truncate">
                {row.translations?.hi} • <span className="font-mono">{row.slug}</span>
              </p>
            </div>
          </div>
        )
      },
      {
        key: 'displayOrder',
        header: catalogCopy.columns.displayOrder,
        sortable: true,
        render: (_v, row) => (
          <span className="text-sm font-mono text-gray-700">{row.displayOrder}</span>
        )
      },
      {
        key: 'cropsCount',
        header: catalogCopy.columns.cropsCount,
        render: (_v, row) => (
          <span className="text-sm font-medium text-gray-800">
            {row._count?.crops || 0}
          </span>
        )
      },
      {
        key: 'isActive',
        header: catalogCopy.columns.status,
        render: (_v, row) => (
          <StatusBadge status={row.isActive ? 'success' : 'neutral'} size="sm">
            {row.isActive
              ? catalogCopy.filters.statusActive
              : catalogCopy.filters.statusInactive}
          </StatusBadge>
        )
      },
      {
        key: 'actions',
        header: catalogCopy.columns.actions,
        align: 'right',
        render: (_v, row) => (
          <div
            className="flex items-center justify-end gap-1"
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              variant="ghost"
              size="sm"
              leftIcon={Eye}
              onClick={() => handleOpenDetail(row)}
            >
              {actionsCopy.view}
            </Button>
            <Can action={ACTIONS.CROP.UPDATE}>
              <Button
                variant="ghost"
                size="sm"
                leftIcon={Pencil}
                onClick={() => handleOpenEdit(row)}
              >
                {actionsCopy.edit}
              </Button>
            </Can>
            <Can action={ACTIONS.CROP.DELETE}>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDeleteTarget(row)}
                className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2"
                aria-label={actionsCopy.delete}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </Can>
          </div>
        )
      }
    ],
    [catalogCopy, actionsCopy, handleOpenDetail, handleOpenEdit]
  );

  const activeColumns =
    activeTab === 'varieties'
      ? varietyColumns
      : activeTab === 'crops'
        ? cropColumns
        : categoryColumns;

  const createLabel =
    activeTab === 'categories'
      ? actionsCopy.createCategory
      : activeTab === 'crops'
        ? actionsCopy.createCrop
        : actionsCopy.createVariety;

  const searchPlaceholder =
    activeTab === 'categories'
      ? catalogCopy.filters.searchCategories
      : activeTab === 'crops'
        ? catalogCopy.filters.searchCrops
        : catalogCopy.filters.searchVarieties;

  const emptyTitle =
    activeTab === 'categories'
      ? catalogCopy.empty.categoriesTitle
      : activeTab === 'crops'
        ? catalogCopy.empty.cropsTitle
        : catalogCopy.empty.varietiesTitle;

  const emptyDescription =
    activeTab === 'categories'
      ? catalogCopy.empty.categoriesDesc
      : activeTab === 'crops'
        ? catalogCopy.empty.cropsDesc
        : catalogCopy.empty.varietiesDesc;

  const isDeleting =
    deleteCategory.isPending || deleteCrop.isPending || deleteVariety.isPending;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={catalogCopy.eyebrow}
        title={catalogCopy.title}
        subtitle={catalogCopy.subtitle}
        actions={
          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="md"
              leftIcon={RefreshCw}
              loading={activeQuery.isFetching}
              onClick={() => activeQuery.refetch()}
            >
              {catalogCopy.refresh}
            </Button>
            <Can action={ACTIONS.CROP.CREATE}>
              <Button size="md" leftIcon={Plus} onClick={handleOpenCreate}>
                {createLabel}
              </Button>
            </Can>
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title={catalogCopy.stats.totalItemsTitle}
          value={String(meta.total || 0)}
          subtitle={catalogCopy.stats.totalItemsSubtitle}
          icon={Layers}
        />
        <StatCard
          title={catalogCopy.stats.activeItemsTitle}
          value={String(activeCountOnPage)}
          subtitle={catalogCopy.stats.activeItemsSubtitle}
          icon={CheckCircle2}
        />
        <StatCard
          title={catalogCopy.stats.perishableTitle}
          value={String(thirdStatCount)}
          subtitle={catalogCopy.stats.perishableSubtitle}
          icon={Sprout}
        />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-3">
          <div className="inline-flex rounded-lg bg-gray-100 p-1 gap-1">
            {[
              { key: 'varieties', label: catalogCopy.tabs.varieties },
              { key: 'crops', label: catalogCopy.tabs.crops },
              { key: 'categories', label: catalogCopy.tabs.categories }
            ].map((tabItem) => (
              <Button
                key={tabItem.key}
                type="button"
                variant={activeTab === tabItem.key ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => handleTabSwitch(tabItem.key)}
                className={cn(
                  activeTab !== tabItem.key && 'text-gray-600 hover:text-gray-900'
                )}
              >
                {tabItem.label}
              </Button>
            ))}
          </div>

          {hasActiveFilters && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              leftIcon={RotateCcw}
              onClick={() => resetParams()}
            >
              {catalogCopy.clearFilters}
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          <div className="sm:col-span-2">
            <SearchBar
              value={params.search}
              onChange={(val) => setParam('search', val)}
              placeholder={searchPlaceholder}
            />
          </div>

          {activeTab !== 'categories' && (
            <Select
              options={categoryFilterOptions}
              value={params.categoryId}
              onChange={(e) =>
                setParams({ categoryId: e?.target?.value ?? '', cropId: '' })
              }
            />
          )}

          {activeTab === 'varieties' && (
            <Select
              options={cropFilterOptions}
              value={params.cropId}
              onChange={(e) => setParam('cropId', e?.target?.value ?? '')}
            />
          )}

          {activeTab !== 'categories' && (
            <Select
              options={perishabilityFilterOptions}
              value={params.perishability}
              onChange={(e) => setParam('perishability', e?.target?.value ?? '')}
            />
          )}

          {activeTab !== 'categories' && (
            <Select
              options={baseUnitFilterOptions}
              value={params.baseUnit}
              onChange={(e) => setParam('baseUnit', e?.target?.value ?? '')}
            />
          )}

          {activeTab === 'varieties' && (
            <Input
              value={params.grade}
              placeholder={catalogCopy.filters.gradePlaceholder}
              onChange={(e) => setParam('grade', e.target.value.toUpperCase())}
            />
          )}

          <Select
            options={statusFilterOptions}
            value={params.isActive}
            onChange={(e) => setParam('isActive', e?.target?.value ?? '')}
          />
        </div>
      </div>

      <DataTable
        columns={activeColumns}
        data={items}
        loading={activeQuery.isLoading}
        emptyTitle={emptyTitle}
        emptyDescription={emptyDescription}
        sortBy={params.sortBy}
        sortOrder={params.sortOrder}
        onSort={(colKey, nextOrder) =>
          setParams({ sortBy: colKey, sortOrder: nextOrder })
        }
        onRowClick={handleOpenDetail}
        pagination={{
          page: meta.page || params.page,
          pageSize: meta.limit || params.limit,
          totalItems: meta.total ?? 0,
          pageSizeOptions,
          onPageChange: (nextPage) =>
            setParam('page', nextPage, { resetPage: false }),
          onPageSizeChange: (nextLimit) => setParam('limit', nextLimit)
        }}
      />

      {categoryDrawerOpen && (
        <CategoryFormDrawer
          key={editingCategory?.id || 'create-category'}
          isOpen={categoryDrawerOpen}
          onClose={() => setCategoryDrawerOpen(false)}
          initialCategory={editingCategory}
        />
      )}

      {cropDrawerOpen && (
        <CropFormDrawer
          key={editingCrop?.id || 'create-crop'}
          isOpen={cropDrawerOpen}
          onClose={() => setCropDrawerOpen(false)}
          initialCrop={editingCrop}
        />
      )}

      {varietyDrawerOpen && (
        <VarietyFormDrawer
          key={editingVariety?.id || 'create-variety'}
          isOpen={varietyDrawerOpen}
          onClose={() => setVarietyDrawerOpen(false)}
          initialVariety={editingVariety}
        />
      )}

      <CatalogDetailSlideOver
        tab={activeTab}
        detailId={params.detailId}
        onClose={handleCloseDetail}
        onEdit={(item) => {
          handleCloseDetail();
          handleOpenEdit(item);
        }}
        onDelete={(item) => setDeleteTarget(item)}
      />

      <Modal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        size="sm"
        title={catalogCopy.deleteModal.title}
        footer={
          <>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              disabled={isDeleting}
            >
              {actionsCopy.cancel}
            </Button>
            <Button
              type="button"
              variant="danger"
              loading={isDeleting}
              onClick={handleConfirmDelete}
            >
              {catalogCopy.deleteModal.confirmBtn}
            </Button>
          </>
        }
      >
        <div className="space-y-3 text-sm text-gray-600">
          <p>
            {catalogCopy.deleteModal.messagePrefix}{' '}
            <strong className="text-gray-900">{deleteTarget?.name}</strong>?
          </p>
          <p className="text-xs text-gray-500">{catalogCopy.deleteModal.warningText}</p>
        </div>
      </Modal>
    </div>
  );
}

export default CatalogPage;
