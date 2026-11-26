import React, { useCallback, useMemo, useState } from 'react';
import {
  Building2,
  CheckCircle2,
  Eye,
  MapPin,
  Pencil,
  Plus,
  RefreshCw,
  RotateCcw,
  Users
} from 'lucide-react';
import {
  Button,
  DataTable,
  Input,
  PageHeader,
  SearchBar,
  Select,
  StatCard,
  StatusBadge
} from '../../../shared/components/index.js';
import { formatOperatingHours } from '../../../shared/utils/formatters.js';
import { Can } from '../../../core/rbac/Can.jsx';
import { usePermission } from '../../../core/rbac/usePermission.js';
import { ACTIONS } from '../../../core/rbac/actions.js';
import { useCopy } from '../../../core/constants/index.js';
import { useHubsList, useHubsUrlState } from '../hooks/useHubs.js';
import { HubFormDrawer } from '../components/HubFormDrawer.jsx';
import { HubDetailSlideOver } from '../components/HubDetailSlideOver.jsx';
import { AssignStaffModal } from '../components/AssignStaffModal.jsx';
import { ONBOARDING_BADGE_VARIANT } from '../constants/hubs.constants.js';

export function HubsPage() {
  const copy = useCopy();
  const hubsCopy = copy.hubs;

  const { params, setParam, setParams, resetParams, pageSizeOptions } =
    useHubsUrlState();

  const { data, isLoading, isFetching, refetch } = useHubsList(params);
  const hubs = useMemo(() => data?.items ?? [], [data?.items]);
  const meta = data?.meta ?? {
    page: params.page,
    limit: params.limit,
    total: 0,
    totalPages: 1
  };

  const canCreateHub = usePermission(ACTIONS.HUB.CREATE);
  const canUpdateFull = usePermission(ACTIONS.HUB.UPDATE);
  const canUpdateOperational = usePermission(ACTIONS.HUB.UPDATE_OPERATIONAL);
  const canEditHub = canUpdateFull || canUpdateOperational;

  const [formOpen, setFormOpen] = useState(false);
  const [editingHub, setEditingHub] = useState(null);
  const [assignTargetHub, setAssignTargetHub] = useState(null);

  const statusOptions = useMemo(
    () => [
      { value: 'all', label: hubsCopy.statusAll },
      { value: 'true', label: hubsCopy.statusActive },
      { value: 'false', label: hubsCopy.statusInactive }
    ],
    [hubsCopy]
  );

  const onboardingFilterOptions = useMemo(
    () => [
      { value: 'all', label: hubsCopy.onboardingStatuses.ALL },
      { value: 'DRAFT', label: hubsCopy.onboardingStatuses.DRAFT },
      {
        value: 'PENDING_VERIFICATION',
        label: hubsCopy.onboardingStatuses.PENDING_VERIFICATION
      },
      { value: 'VERIFIED', label: hubsCopy.onboardingStatuses.VERIFIED },
      { value: 'SUSPENDED', label: hubsCopy.onboardingStatuses.SUSPENDED }
    ],
    [hubsCopy]
  );

  const activeCountOnPage = useMemo(
    () => hubs.filter((item) => item.isActive).length,
    [hubs]
  );

  const totalStaffOnPage = useMemo(
    () => hubs.reduce((sum, item) => sum + (item.activeStaffCount || 0), 0),
    [hubs]
  );

  const hasActiveFilters = Boolean(
    params.search ||
      params.isActive !== 'all' ||
      params.onboardingStatus !== 'all' ||
      params.state
  );

  const openCreateModal = () => {
    setEditingHub(null);
    setFormOpen(true);
  };

  const openEditModal = (hub) => {
    setEditingHub(hub);
    setFormOpen(true);
  };

  const openDetailDrawer = useCallback(
    (hub) => {
      setParam('hubId', hub.id, { resetPage: false });
    },
    [setParam]
  );

  const closeDetailDrawer = useCallback(() => {
    setParam('hubId', '', { resetPage: false });
  }, [setParam]);

  const columns = useMemo(
    () => [
      {
        key: 'name',
        header: hubsCopy.columns.hubIdentity,
        sortable: true,
        render: (_value, row) => (
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded bg-ktc-green-light text-ktc-green font-mono text-[11px] font-semibold">
                {row.code}
              </span>
              <span className="font-semibold text-gray-900 truncate">
                {row.name}
              </span>
            </div>
            {row.translations?.hi && (
              <p className="text-xs text-gray-500 mt-0.5 truncate">
                {row.translations.hi}
              </p>
            )}
          </div>
        )
      },
      {
        key: 'cityOrTown',
        header: hubsCopy.columns.location,
        sortable: true,
        render: (_value, row) => (
          <div className="flex items-start gap-1.5 text-xs">
            <MapPin className="w-3.5 h-3.5 text-ktc-green mt-0.5 shrink-0" />
            <div>
              <span className="font-medium text-gray-900 block">
                {row.cityOrTown}, {row.district}
              </span>
              <span className="text-gray-500">
                {row.state} • {row.pinCode}
              </span>
            </div>
          </div>
        )
      },
      {
        key: 'contactPhone',
        header: hubsCopy.columns.contactHours,
        render: (_value, row) => (
          <div className="text-xs">
            <span className="font-medium text-gray-900 block">
              {row.contactPhone || hubsCopy.noPhone}
            </span>
            <span className="text-gray-500">
              {formatOperatingHours(row.operatingHours, hubsCopy.noHours)}
            </span>
          </div>
        )
      },
      {
        key: 'activeStaffCount',
        header: hubsCopy.columns.staffCount,
        align: 'center',
        render: (value) => (
          <StatusBadge status="info" size="sm" dot={false} icon={Users}>
            {value ?? 0} {hubsCopy.staffCountSuffix}
          </StatusBadge>
        )
      },
      {
        key: 'onboardingStatus',
        header: hubsCopy.onboarding.onboardingColumn,
        render: (value) => (
          <StatusBadge
            status={ONBOARDING_BADGE_VARIANT[value] || 'neutral'}
            size="sm"
          >
            {hubsCopy.onboardingStatuses[value] || value}
          </StatusBadge>
        )
      },
      {
        key: 'isActive',
        header: hubsCopy.columns.status,
        render: (value) => (
          <StatusBadge status={value ? 'success' : 'neutral'}>
            {value ? hubsCopy.statusActive : hubsCopy.statusInactive}
          </StatusBadge>
        )
      },
      {
        key: 'actions',
        header: hubsCopy.columns.actions,
        align: 'right',
        render: (_value, row) => (
          <div className="inline-flex items-center justify-end gap-1.5">
            <Button
              size="sm"
              variant="ghost"
              leftIcon={Eye}
              onClick={(event) => {
                event.stopPropagation();
                openDetailDrawer(row);
              }}
            >
              {hubsCopy.viewDetails}
            </Button>

            {canEditHub && (
              <Button
                size="sm"
                variant="outline"
                leftIcon={Pencil}
                onClick={(event) => {
                  event.stopPropagation();
                  openEditModal(row);
                }}
              >
                {hubsCopy.editHub}
              </Button>
            )}
          </div>
        )
      }
    ],
    [hubsCopy, canEditHub, openDetailDrawer]
  );

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={hubsCopy.eyebrow}
        title={hubsCopy.title}
        subtitle={hubsCopy.subtitle}
        actions={
          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              leftIcon={RefreshCw}
              loading={isFetching && !isLoading}
              onClick={() => refetch()}
            >
              {hubsCopy.refresh}
            </Button>

            <Can action={ACTIONS.HUB.CREATE}>
              <Button
                variant="primary"
                size="sm"
                leftIcon={Plus}
                onClick={openCreateModal}
              >
                {hubsCopy.createHub}
              </Button>
            </Can>
          </div>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatCard
          title={hubsCopy.stats.totalHubsTitle}
          value={String(meta.total ?? 0)}
          subtitle={hubsCopy.stats.totalHubsSubtitle}
          icon={Building2}
        />
        <StatCard
          title={hubsCopy.stats.activeHubsTitle}
          value={String(activeCountOnPage)}
          subtitle={hubsCopy.stats.activeHubsSubtitle}
          icon={CheckCircle2}
        />
        <StatCard
          title={hubsCopy.stats.staffAssignedTitle}
          value={String(totalStaffOnPage)}
          subtitle={hubsCopy.stats.staffAssignedSubtitle}
          icon={Users}
        />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm flex flex-col lg:flex-row lg:items-center gap-3">
        <div className="flex-1 min-w-0">
          <SearchBar
            value={params.search}
            onChange={(nextSearch) => {
              if (nextSearch !== params.search) {
                setParam('search', nextSearch);
              }
            }}
            placeholder={hubsCopy.searchPlaceholder}
            shortcutHint=""
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex items-center gap-3">
          <div className="w-full lg:w-44">
            <Select
              options={statusOptions}
              value={params.isActive}
              onChange={(event) => setParam('isActive', event.target.value)}
            />
          </div>

          <div className="w-full lg:w-48">
            <Select
              options={onboardingFilterOptions}
              value={params.onboardingStatus}
              onChange={(event) =>
                setParam('onboardingStatus', event.target.value)
              }
            />
          </div>

          <div className="w-full lg:w-48">
            <Input
              value={params.state}
              onChange={(event) => setParam('state', event.target.value)}
              placeholder={hubsCopy.stateFilterPlaceholder}
            />
          </div>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="md"
              leftIcon={RotateCcw}
              onClick={() => resetParams()}
            >
              {hubsCopy.clearFilters}
            </Button>
          )}
        </div>
      </div>

      <DataTable
        columns={columns}
        data={hubs}
        loading={isLoading}
        sortBy={params.sortBy}
        sortOrder={params.sortOrder}
        onSort={(sortBy, sortOrder) => setParams({ sortBy, sortOrder })}
        onRowClick={openDetailDrawer}
        emptyTitle={hubsCopy.emptyTitle}
        emptyDescription={hubsCopy.emptyDescription}
        emptyAction={
          canCreateHub ? (
            <Button
              variant="primary"
              size="sm"
              leftIcon={Plus}
              onClick={openCreateModal}
            >
              {hubsCopy.emptyCreateCta}
            </Button>
          ) : undefined
        }
        pagination={{
          page: meta.page || params.page,
          pageSize: meta.limit || params.limit,
          totalItems: meta.total ?? 0,
          pageSizeOptions,
          onPageChange: (nextPage) => setParam('page', nextPage),
          onPageSizeChange: (nextLimit) =>
            setParams({ limit: nextLimit, page: 1 })
        }}
      />

      <HubFormDrawer
        isOpen={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditingHub(null);
        }}
        hub={editingHub}
      />

      <HubDetailSlideOver
        hubId={params.hubId}
        isOpen={Boolean(params.hubId)}
        onClose={closeDetailDrawer}
        onEditHub={(hub) => openEditModal(hub)}
        onOpenAssignStaff={(hub) => setAssignTargetHub(hub)}
      />

      <AssignStaffModal
        isOpen={Boolean(assignTargetHub)}
        onClose={() => setAssignTargetHub(null)}
        hubId={assignTargetHub?.id}
        hubName={assignTargetHub?.name}
      />
    </div>
  );
}

export default HubsPage;
