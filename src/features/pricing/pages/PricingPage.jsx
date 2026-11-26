import React, { useCallback, useMemo, useState } from 'react';
import {
  CheckCircle2,
  Eye,
  Layers,
  Pencil,
  Percent,
  Plus,
  RefreshCw,
  RotateCcw,
  TrendingUp
} from 'lucide-react';
import {
  Button,
  DataTable,
  DatePicker,
  PageHeader,
  SearchBar,
  Select,
  StatCard,
  StatusBadge
} from '../../../shared/components/index.js';
import { formatDateTime, formatINR } from '../../../shared/utils/formatters.js';
import { useAuthStore } from '../../../core/auth/auth.store.js';
import { usePermission } from '../../../core/rbac/usePermission.js';
import { ACTIONS } from '../../../core/rbac/actions.js';
import { useCopy } from '../../../core/constants/index.js';
import {
  RATE_STATUS_BADGE_VARIANT
} from '../constants/pricing.constants.js';
import {
  usePricingCropFilterOptions,
  usePricingFilterOptions,
  usePricingRates,
  usePricingUrlState,
  useUpdateRateStatus
} from '../hooks/usePricing.js';
import { RateFormDrawer } from '../components/RateFormDrawer.jsx';
import { BulkRatesDrawer } from '../components/BulkRatesDrawer.jsx';
import { RateDetailSlideOver } from '../components/RateDetailSlideOver.jsx';

export function PricingPage() {
  const copy = useCopy();
  const pricingCopy = copy.pricing;
  const actionsCopy = pricingCopy.actions;

  const activeHubId = useAuthStore((state) => state.activeHubId);
  const canSetGlobal = usePermission(ACTIONS.MANDI_RATE.SET_GLOBAL);
  const canSetHub = usePermission(ACTIONS.MANDI_RATE.SET_HUB);
  const canMutateAny = canSetGlobal || canSetHub;

  const { params, setParam, setParams, resetParams, pageSizeOptions } =
    usePricingUrlState();

  const { data, isLoading, isFetching, refetch } = usePricingRates(params);
  const rates = useMemo(() => data?.items ?? [], [data?.items]);
  const meta = data?.meta ?? {
    page: params.page,
    limit: params.limit,
    total: 0,
    totalPages: 1
  };

  const { categories, varieties } = usePricingFilterOptions();
  const { data: crops = [] } = usePricingCropFilterOptions(params.categoryId);

  const statusMutation = useUpdateRateStatus();

  const [formOpen, setFormOpen] = useState(false);
  const [editingRate, setEditingRate] = useState(null);
  const [bulkOpen, setBulkOpen] = useState(false);

  const scopeFilterOptions = useMemo(
    () => [
      { value: 'all', label: pricingCopy.filters.allScopes },
      { value: 'global', label: pricingCopy.filters.scopeGlobal },
      { value: 'hub', label: pricingCopy.filters.scopeHub }
    ],
    [pricingCopy.filters]
  );

  const categoryFilterOptions = useMemo(
    () => [
      { value: '', label: pricingCopy.filters.allCategories },
      ...categories.map((cat) => ({
        value: cat.id,
        label: cat.translations?.hi ? `${cat.name} (${cat.translations.hi})` : cat.name
      }))
    ],
    [categories, pricingCopy.filters.allCategories]
  );

  const cropFilterOptions = useMemo(
    () => [
      { value: '', label: pricingCopy.filters.allCrops },
      ...crops.map((crop) => ({
        value: crop.id,
        label: crop.translations?.hi ? `${crop.name} (${crop.translations.hi})` : crop.name
      }))
    ],
    [crops, pricingCopy.filters.allCrops]
  );

  const varietyFilterOptions = useMemo(() => {
    const filtered = varieties.filter((v) => {
      if (params.cropId && v.cropId !== params.cropId) return false;
      if (params.categoryId && v.crop?.categoryId !== params.categoryId) return false;
      return true;
    });
    return [
      { value: '', label: pricingCopy.filters.allVarieties },
      ...filtered.map((v) => ({
        value: v.id,
        label: v.translations?.hi ? `${v.name} (${v.translations.hi})` : v.name
      }))
    ];
  }, [varieties, params.cropId, params.categoryId, pricingCopy.filters.allVarieties]);

  const statusFilterOptions = useMemo(
    () => [
      { value: 'all', label: pricingCopy.filters.allStatuses },
      { value: 'PUBLISHED', label: pricingCopy.statuses.PUBLISHED },
      { value: 'DRAFT', label: pricingCopy.statuses.DRAFT },
      { value: 'ARCHIVED', label: pricingCopy.statuses.ARCHIVED }
    ],
    [pricingCopy.filters.allStatuses, pricingCopy.statuses]
  );

  const publishedCountOnPage = useMemo(
    () => rates.filter((r) => r.status === 'PUBLISHED').length,
    [rates]
  );

  const avgMarginOnPage = useMemo(() => {
    if (rates.length === 0) return '0.00%';
    const sum = rates.reduce((acc, r) => acc + Number(r.marginPercent || 0), 0);
    return `${(sum / rates.length).toFixed(2)}%`;
  }, [rates]);

  const hasActiveFilters = Boolean(
    params.search ||
      params.scope !== 'all' ||
      params.categoryId ||
      params.cropId ||
      params.varietyId ||
      params.status !== 'all' ||
      params.effectiveDate
  );

  const openDetail = useCallback(
    (row) => {
      setParam('rateId', row.id, { resetPage: false });
    },
    [setParam]
  );

  const closeDetail = useCallback(() => {
    setParam('rateId', '', { resetPage: false });
  }, [setParam]);

  const openCreateDrawer = () => {
    setEditingRate(null);
    setFormOpen(true);
  };

  const openEditDrawer = useCallback((rate) => {
    setEditingRate(rate);
    setFormOpen(true);
  }, []);

  const columns = useMemo(
    () => [
      {
        key: 'cropVariety',
        header: pricingCopy.columns.varietyGrade,
        render: (_val, row) => (
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-gray-900">
                {row.cropVariety?.name || '—'}
              </span>
              <StatusBadge status="gold" size="sm" dot={false}>
                {row.gradeCode}
              </StatusBadge>
            </div>
            <p className="text-xs text-gray-500 mt-0.5 truncate">
              {row.cropVariety?.crop?.name} • {row.unit}
            </p>
          </div>
        )
      },
      {
        key: 'hubId',
        header: pricingCopy.columns.scope,
        render: (_val, row) =>
          row.hubId ? (
            <div className="text-xs">
              <StatusBadge status="info" size="sm" dot={false}>
                {pricingCopy.scopes.HUB}
              </StatusBadge>
              <p className="text-gray-700 font-medium mt-1">
                {row.hub?.name} ({row.hub?.code})
              </p>
            </div>
          ) : (
            <StatusBadge status="neutral" size="sm" dot={false}>
              {pricingCopy.scopes.GLOBAL}
            </StatusBadge>
          )
      },
      {
        key: 'rateDate',
        header: pricingCopy.columns.effectiveDate,
        sortable: true,
        render: (_val, row) => (
          <span className="text-xs font-medium text-gray-800">
            {formatDateTime(row.effectiveDate || row.rateDate, 'date')}
          </span>
        )
      },
      {
        key: 'farmerBuyRate',
        header: pricingCopy.columns.buyRate,
        sortable: true,
        align: 'right',
        render: (val, row) => (
          <div className="text-xs">
            <span className="font-semibold text-gray-900">
              {formatINR(val)}
            </span>
            <span className="text-gray-400 ml-1">/ {row.unit}</span>
          </div>
        )
      },
      {
        key: 'consumerSellRate',
        header: pricingCopy.columns.sellRate,
        sortable: true,
        align: 'right',
        render: (val, row) => (
          <div className="text-xs">
            <span className="font-semibold text-gray-900">
              {formatINR(val)}
            </span>
            <span className="text-gray-400 ml-1">/ {row.unit}</span>
          </div>
        )
      },
      {
        key: 'marginPercent',
        header: pricingCopy.columns.margin,
        sortable: true,
        align: 'center',
        render: (val) => {
          const num = Number(val || 0);
          return (
            <StatusBadge
              status={num < 0 ? 'danger' : 'success'}
              size="sm"
              dot={false}
            >
              {num >= 0 ? '+' : ''}
              {val}%
            </StatusBadge>
          );
        }
      },
      {
        key: 'bulkTiers',
        header: pricingCopy.columns.tiers,
        align: 'center',
        render: (val) => {
          const count = Array.isArray(val) ? val.length : 0;
          return (
            <span className="text-xs font-medium text-gray-600">
              {count > 0 ? `${count}` : '—'}
            </span>
          );
        }
      },
      {
        key: 'status',
        header: pricingCopy.columns.status,
        render: (val) => (
          <StatusBadge
            status={RATE_STATUS_BADGE_VARIANT[val] || 'neutral'}
            size="sm"
          >
            {pricingCopy.statuses[val] || val}
          </StatusBadge>
        )
      },
      {
        key: 'actions',
        header: pricingCopy.columns.actions,
        align: 'right',
        render: (_val, row) => {
          const canMutateRow = row.hubId ? canSetGlobal || canSetHub : canSetGlobal;

          return (
            <div className="inline-flex items-center justify-end gap-1.5">
              <Button
                size="sm"
                variant="ghost"
                leftIcon={Eye}
                onClick={(event) => {
                  event.stopPropagation();
                  openDetail(row);
                }}
              >
                {actionsCopy.view}
              </Button>

              {canMutateRow && (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    leftIcon={Pencil}
                    onClick={(event) => {
                      event.stopPropagation();
                      openEditDrawer(row);
                    }}
                  >
                    {actionsCopy.edit}
                  </Button>

                  {row.status === 'DRAFT' && (
                    <Button
                      size="sm"
                      variant="primary"
                      leftIcon={CheckCircle2}
                      loading={
                        statusMutation.isPending &&
                        statusMutation.variables?.id === row.id
                      }
                      onClick={(event) => {
                        event.stopPropagation();
                        statusMutation.mutate({
                          id: row.id,
                          status: 'PUBLISHED'
                        });
                      }}
                    >
                      {actionsCopy.publish}
                    </Button>
                  )}
                </>
              )}
            </div>
          );
        }
      }
    ],
    [
      pricingCopy,
      actionsCopy,
      canSetGlobal,
      canSetHub,
      openDetail,
      openEditDrawer,
      statusMutation
    ]
  );

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={pricingCopy.eyebrow}
        title={pricingCopy.title}
        subtitle={pricingCopy.subtitle}
        actions={
          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              leftIcon={RefreshCw}
              loading={isFetching && !isLoading}
              onClick={() => refetch()}
            >
              {pricingCopy.refresh}
            </Button>

            {canMutateAny && (
              <>
                <Button
                  variant="secondary"
                  size="sm"
                  leftIcon={Layers}
                  onClick={() => setBulkOpen(true)}
                >
                  {actionsCopy.bulkRates}
                </Button>

                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={Plus}
                  onClick={openCreateDrawer}
                >
                  {actionsCopy.addRate}
                </Button>
              </>
            )}
          </div>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatCard
          title={pricingCopy.stats.totalRatesTitle}
          value={String(meta.total ?? 0)}
          subtitle={pricingCopy.stats.totalRatesSubtitle}
          icon={TrendingUp}
        />
        <StatCard
          title={pricingCopy.stats.publishedTitle}
          value={String(publishedCountOnPage)}
          subtitle={pricingCopy.stats.publishedSubtitle}
          icon={CheckCircle2}
        />
        <StatCard
          title={pricingCopy.stats.avgMarginTitle}
          value={avgMarginOnPage}
          subtitle={pricingCopy.stats.avgMarginSubtitle}
          icon={Percent}
        />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center gap-3">
          <div className="flex-1 min-w-0">
            <SearchBar
              value={params.search}
              onChange={(nextSearch) => {
                if (nextSearch !== params.search) {
                  setParam('search', nextSearch);
                }
              }}
              placeholder={pricingCopy.filters.searchPlaceholder}
              shortcutHint=""
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 lg:flex items-center gap-3">
            {!activeHubId && (
              <div className="w-full lg:w-44">
                <Select
                  options={scopeFilterOptions}
                  value={params.scope}
                  onChange={(e) => setParam('scope', e?.target?.value ?? 'all')}
                />
              </div>
            )}

            <div className="w-full lg:w-40">
              <Select
                options={statusFilterOptions}
                value={params.status}
                onChange={(e) => setParam('status', e?.target?.value ?? 'all')}
              />
            </div>

            <div className="w-full lg:w-44">
              <DatePicker
                value={params.effectiveDate}
                placeholder={pricingCopy.filters.effectiveDatePlaceholder}
                todayLabel={pricingCopy.filters.todayLabel}
                clearLabel={pricingCopy.filters.clearLabel}
                onChange={(nextDate) => setParam('effectiveDate', nextDate)}
              />
            </div>

            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="md"
                leftIcon={RotateCcw}
                onClick={() => resetParams()}
              >
                {pricingCopy.clearFilters}
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Select
            options={categoryFilterOptions}
            value={params.categoryId}
            onChange={(e) =>
              setParams({
                categoryId: e?.target?.value ?? '',
                cropId: '',
                varietyId: ''
              })
            }
          />

          <Select
            options={cropFilterOptions}
            value={params.cropId}
            onChange={(e) =>
              setParams({ cropId: e?.target?.value ?? '', varietyId: '' })
            }
          />

          <Select
            options={varietyFilterOptions}
            value={params.varietyId}
            onChange={(e) => setParam('varietyId', e?.target?.value ?? '')}
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={rates}
        loading={isLoading}
        sortBy={params.sortBy}
        sortOrder={params.sortOrder}
        onSort={(sortBy, sortOrder) => setParams({ sortBy, sortOrder })}
        onRowClick={openDetail}
        emptyTitle={pricingCopy.empty.title}
        emptyDescription={pricingCopy.empty.description}
        emptyAction={
          canMutateAny ? (
            <Button
              variant="primary"
              size="sm"
              leftIcon={Plus}
              onClick={openCreateDrawer}
            >
              {pricingCopy.empty.createCta}
            </Button>
          ) : undefined
        }
        pagination={{
          page: meta.page || params.page,
          pageSize: meta.limit || params.limit,
          totalItems: meta.total ?? 0,
          pageSizeOptions,
          onPageChange: (nextPage) =>
            setParam('page', nextPage, { resetPage: false }),
          onPageSizeChange: (nextLimit) =>
            setParams({ limit: nextLimit, page: 1 })
        }}
      />

      {formOpen && (
        <RateFormDrawer
          key={editingRate?.id || 'create-rate'}
          isOpen={formOpen}
          onClose={() => {
            setFormOpen(false);
            setEditingRate(null);
          }}
          initialRate={editingRate}
        />
      )}

      {bulkOpen && (
        <BulkRatesDrawer
          key="bulk-rates-drawer"
          isOpen={bulkOpen}
          onClose={() => setBulkOpen(false)}
        />
      )}

      <RateDetailSlideOver
        rateId={params.rateId}
        isOpen={Boolean(params.rateId)}
        onClose={closeDetail}
        onEdit={(rate) => {
          closeDetail();
          openEditDrawer(rate);
        }}
      />
    </div>
  );
}

export default PricingPage;
