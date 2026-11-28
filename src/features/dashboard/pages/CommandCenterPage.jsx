import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  Building2,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  IndianRupee,
  Plus,
  RefreshCw,
  ShieldCheck,
  Sprout,
  Store,
  XCircle
} from 'lucide-react';
import {
  Alert,
  Button,
  PageHeader,
  StatCard,
  StatusBadge
} from '../../../shared/components/index.js';
import { useAuthStore } from '../../../core/auth/auth.store.js';
import { usePermission } from '../../../core/rbac/usePermission.js';
import { ACTIONS } from '../../../core/rbac/actions.js';
import { Can } from '../../../core/rbac/Can.jsx';
import { ROLES, ROUTES, useCopy } from '../../../core/constants/index.js';
import { useDashboardSummary } from '../hooks/useDashboard.js';
import { AlertsPanel } from '../components/AlertsPanel.jsx';
import { RecentActivityCard } from '../components/RecentActivityCard.jsx';

export function CommandCenterPage() {
  const copy = useCopy();
  const navigate = useNavigate();
  const [diagnosticOpen, setDiagnosticOpen] = useState(false);

  const user = useAuthStore((state) => state.user);
  const activeRole = useAuthStore((state) => state.activeRole);
  const roles = useAuthStore((state) => state.roles);
  const staffAssignments = useAuthStore((state) => state.staffAssignments);
  const activeHubId = useAuthStore((state) => state.activeHubId);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const {
    data: summary,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
    dataUpdatedAt
  } = useDashboardSummary();

  const canViewRates = usePermission(ACTIONS.MANDI_RATE.VIEW);
  const canSetRates = usePermission(ACTIONS.MANDI_RATE.SET_HUB);
  const canViewCrops = usePermission(ACTIONS.CROP.VIEW);
  const canManageHubs = usePermission(ACTIONS.HUB.READ);
  const canVerifyStaff = usePermission(ACTIONS.STAFF.VIEW);
  const canRouteOrders = usePermission(ACTIONS.ORDER.VIEW);
  const canViewLedgers = usePermission(ACTIONS.CASH_LEDGER.VIEW);

  const dashCopy = copy.dashboard;
  const statsCopy = dashCopy.stats;
  const capCopy = dashCopy.rbacCapabilities;

  const rbacItems = [
    {
      title: capCopy.mandiRateViewTitle,
      action: ACTIONS.MANDI_RATE.VIEW,
      allowed: canViewRates,
      desc: capCopy.mandiRateViewDesc
    },
    {
      title: capCopy.mandiRateSetTitle,
      action: ACTIONS.MANDI_RATE.SET_HUB,
      allowed: canSetRates,
      desc: capCopy.mandiRateSetDesc
    },
    {
      title: capCopy.cropViewTitle,
      action: ACTIONS.CROP.VIEW,
      allowed: canViewCrops,
      desc: capCopy.cropViewDesc
    },
    {
      title: capCopy.hubReadTitle,
      action: ACTIONS.HUB.READ,
      allowed: canManageHubs,
      desc: capCopy.hubReadDesc
    },
    {
      title: capCopy.staffViewTitle,
      action: ACTIONS.STAFF.VIEW,
      allowed: canVerifyStaff,
      desc: capCopy.staffViewDesc
    },
    {
      title: capCopy.orderViewTitle,
      action: ACTIONS.ORDER.VIEW,
      allowed: canRouteOrders,
      desc: capCopy.orderViewDesc
    },
    {
      title: capCopy.ledgerViewTitle,
      action: ACTIONS.CASH_LEDGER.VIEW,
      allowed: canViewLedgers,
      desc: capCopy.ledgerViewDesc
    }
  ];

  const isStoreOperator = activeRole === ROLES.STORE_OPERATOR;
  const hubsData = summary?.hubs;
  const catalogData = summary?.catalog;
  const pricingData = summary?.pricing;
  const alertsData = summary?.alerts;

  const syncedTimeLabel = dataUpdatedAt
    ? new Intl.DateTimeFormat('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }).format(new Date(dataUpdatedAt))
    : null;

  const scopeBadgeLabel = summary?.scopedHub
    ? `${dashCopy.scopeHubBadgePrefix}: ${summary.scopedHub.name} (${summary.scopedHub.code})`
    : dashCopy.scopeNetworkBadge;

  const hubsSubtitle = hubsData
    ? `${hubsData.total} ${statsCopy.hubsTotalSuffix} • ${hubsData.pendingVerification} ${statsCopy.hubsPendingLabel} • ${hubsData.assignedStaff} ${statsCopy.hubsStaffLabel}`
    : '—';

  const catalogSubtitle = catalogData
    ? `${catalogData.activeCategories} ${statsCopy.catalogCategoriesSuffix} • ${catalogData.perishableCrops} ${statsCopy.catalogPerishableLabel} / ${catalogData.nonPerishableCrops} ${statsCopy.catalogNonPerishableLabel}`
    : '—';

  const pricingSubtitle = pricingData
    ? isStoreOperator || pricingData.avgMarginPercent === null
      ? `${pricingData.publishedTodayRates} ${statsCopy.pricingTodaySuffix} • ${pricingData.activeHubOverrides} ${statsCopy.pricingOverridesLabel} • ${statsCopy.pricingRestrictedMarginLabel}`
      : `${pricingData.publishedTodayRates} ${statsCopy.pricingTodaySuffix} • ${pricingData.avgMarginPercent}% ${statsCopy.pricingMarginLabel} • ${pricingData.draftRates} ${statsCopy.pricingDraftsLabel}`
    : '—';

  const alertsCount = alertsData?.totalCount ?? 0;
  const alertsSubtitle = alertsData
    ? alertsCount === 0
      ? statsCopy.alertsClearSubtitle
      : `${alertsData.pendingVerificationHubs?.length ?? 0} ${statsCopy.alertsPendingHubsTag} • ${alertsData.varietiesWithoutPublishedRate?.count ?? 0} ${statsCopy.alertsUnratedTag} • ${alertsData.expiringDocuments?.length ?? 0} ${statsCopy.alertsExpiringDocsTag}`
    : '—';

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={dashCopy.eyebrow}
        title={dashCopy.title}
        subtitle={dashCopy.subtitle}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              leftIcon={RefreshCw}
              loading={isFetching && !isLoading}
              onClick={() => refetch()}
            >
              {dashCopy.refreshData}
            </Button>

            <Can action={ACTIONS.HUB.CREATE}>
              <Button
                variant="outline"
                size="sm"
                leftIcon={Building2}
                onClick={() => navigate(ROUTES.HUBS)}
              >
                {dashCopy.quickActions.onboardHub}
              </Button>
            </Can>

            <Can action={ACTIONS.CROP.CREATE}>
              <Button
                variant="outline"
                size="sm"
                leftIcon={Plus}
                onClick={() => navigate(ROUTES.CATALOG)}
              >
                {dashCopy.quickActions.addVariety}
              </Button>
            </Can>

            <Can action={ACTIONS.MANDI_RATE.SET_HUB}>
              <Button
                variant="primary"
                size="sm"
                leftIcon={IndianRupee}
                onClick={() => navigate(ROUTES.PRICING)}
              >
                {dashCopy.quickActions.publishRates}
              </Button>
            </Can>
          </div>
        }
      />

      <div className="flex flex-wrap items-center justify-between gap-2">
        <StatusBadge
          status={summary?.scope === 'HUB' ? 'gold' : 'success'}
          size="md"
        >
          {scopeBadgeLabel}
        </StatusBadge>

        {syncedTimeLabel && (
          <span className="text-xs text-gray-500">
            {dashCopy.lastUpdatedPrefix}: {syncedTimeLabel}
          </span>
        )}
      </div>

      {isError && (
        <Alert
          type="error"
          title={dashCopy.errorTitle}
          message={error?.message || dashCopy.errorFallback}
          action={
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              {dashCopy.retryBtn}
            </Button>
          }
        />
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title={statsCopy.hubsTitle}
          value={isLoading ? '...' : String(hubsData?.active ?? 0)}
          subtitle={hubsSubtitle}
          icon={Store}
          onClick={canManageHubs ? () => navigate(ROUTES.HUBS) : undefined}
        />

        <StatCard
          title={statsCopy.catalogTitle}
          value={isLoading ? '...' : String(catalogData?.activeVarieties ?? 0)}
          subtitle={catalogSubtitle}
          icon={Sprout}
          onClick={canViewCrops ? () => navigate(ROUTES.CATALOG) : undefined}
        />

        <StatCard
          title={statsCopy.pricingTitle}
          value={isLoading ? '...' : String(pricingData?.publishedRates ?? 0)}
          subtitle={pricingSubtitle}
          icon={IndianRupee}
          onClick={canViewRates ? () => navigate(ROUTES.PRICING) : undefined}
        />

        <StatCard
          title={statsCopy.alertsTitle}
          value={isLoading ? '...' : String(alertsCount)}
          subtitle={alertsSubtitle}
          icon={AlertTriangle}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7">
          <AlertsPanel
            alerts={alertsData}
            isLoading={isLoading}
            onNavigate={navigate}
          />
        </div>

        <div className="lg:col-span-5">
          <RecentActivityCard
            activities={summary?.recentActivity ?? []}
            isLoading={isLoading}
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-ktc-green-light text-ktc-green">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900">
                {dashCopy.diagnosticTitle}
              </h2>
              <p className="text-xs text-gray-500">
                {dashCopy.diagnosticSubtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <StatusBadge
              status={isAuthenticated ? 'success' : 'warning'}
              dot={true}
              size="sm"
            >
              {isAuthenticated
                ? dashCopy.sessionActive
                : dashCopy.unauthenticated}
            </StatusBadge>

            <Button
              variant="outline"
              size="sm"
              rightIcon={diagnosticOpen ? ChevronUp : ChevronDown}
              aria-expanded={diagnosticOpen}
              onClick={() => setDiagnosticOpen((prev) => !prev)}
            >
              {diagnosticOpen
                ? dashCopy.diagnosticToggleHide
                : dashCopy.diagnosticToggleShow}
            </Button>
          </div>
        </div>

        {diagnosticOpen && (
          <div className="mt-5 pt-5 border-t border-gray-100 space-y-5">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-lg bg-gray-50 border border-gray-100 text-xs">
              <div>
                <span className="text-gray-400 block font-medium">
                  {dashCopy.loggedInUser}
                </span>
                <span className="font-semibold text-gray-900 truncate block mt-0.5">
                  {user?.name || user?.fullName || dashCopy.defaultUserName}
                </span>
              </div>
              <div>
                <span className="text-gray-400 block font-medium">
                  {dashCopy.activeWorkingRole}
                </span>
                <span className="font-semibold text-ktc-green truncate block mt-0.5">
                  {activeRole || ROLES.SUPER_ADMIN}
                </span>
              </div>
              <div>
                <span className="text-gray-400 block font-medium">
                  {dashCopy.assignedRoles}
                </span>
                <span className="font-semibold text-gray-700 truncate block mt-0.5">
                  {roles && roles.length > 0
                    ? roles.join(', ')
                    : ROLES.SUPER_ADMIN}
                </span>
              </div>
              <div>
                <span className="text-gray-400 block font-medium">
                  {dashCopy.assignedHub}
                </span>
                <span className="font-semibold text-gray-700 truncate block mt-0.5">
                  {summary?.scopedHub?.name ||
                    activeHubId ||
                    staffAssignments?.[0]?.hubName ||
                    dashCopy.defaultHubName}
                </span>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
                {dashCopy.roleCapabilitiesHeading}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {rbacItems.map((item) => (
                  <div
                    key={item.action}
                    className="flex items-center justify-between p-2.5 rounded-lg border border-gray-100 hover:bg-gray-50/80 transition-colors text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {item.allowed ? (
                        <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 text-gray-400 shrink-0" />
                      )}
                      <div className="min-w-0">
                        <span className="font-semibold text-gray-900 block truncate">
                          {item.title}
                        </span>
                        <span className="text-gray-500 text-[11px] block truncate">
                          {item.desc}
                        </span>
                      </div>
                    </div>

                    <StatusBadge
                      status={item.allowed ? 'success' : 'neutral'}
                      size="sm"
                      dot={false}
                    >
                      {item.allowed
                        ? copy.common.granted
                        : copy.common.restricted}
                    </StatusBadge>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
              <span>{dashCopy.securityModelLabel}</span>
              <span className="font-medium text-ktc-green">
                {dashCopy.leastPrivilegeLabel}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CommandCenterPage;
