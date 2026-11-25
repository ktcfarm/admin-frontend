import React from 'react';
import {
  Store,
  Sprout,
  TrendingUp,
  UserCheck,
  ShieldCheck,
  RefreshCw,
  FileSpreadsheet,
  CheckCircle,
  XCircle,
  Activity
} from 'lucide-react';
import {
  PageHeader,
  StatCard,
  Button,
  StatusBadge
} from '../../../shared/components/index.js';
import { useAuthStore } from '../../../core/auth/auth.store.js';
import { usePermission } from '../../../core/rbac/usePermission.js';
import { ACTIONS } from '../../../core/rbac/actions.js';
import { ROLES, useCopy } from '../../../core/constants/index.js';

export function CommandCenterPage() {
  const copy = useCopy();
  const user = useAuthStore((state) => state.user);
  const activeRole = useAuthStore((state) => state.activeRole);
  const roles = useAuthStore((state) => state.roles);
  const staffAssignments = useAuthStore((state) => state.staffAssignments);
  const activeHubId = useAuthStore((state) => state.activeHubId);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const canViewRates = usePermission(ACTIONS.MANDI_RATE.VIEW);
  const canSetRates = usePermission(ACTIONS.MANDI_RATE.SET_HUB);
  const canViewCrops = usePermission(ACTIONS.CROP.VIEW);
  const canManageHubs = usePermission(ACTIONS.HUB.READ);
  const canVerifyStaff = usePermission(ACTIONS.STAFF.VIEW);
  const canRouteOrders = usePermission(ACTIONS.ORDER.VIEW);
  const canViewLedgers = usePermission(ACTIONS.CASH_LEDGER.VIEW);

  const capCopy = copy.dashboard.rbacCapabilities;

  const rbacItems = [
    { title: capCopy.mandiRateViewTitle, action: ACTIONS.MANDI_RATE.VIEW, allowed: canViewRates, desc: capCopy.mandiRateViewDesc },
    { title: capCopy.mandiRateSetTitle, action: ACTIONS.MANDI_RATE.SET_HUB, allowed: canSetRates, desc: capCopy.mandiRateSetDesc },
    { title: capCopy.cropViewTitle, action: ACTIONS.CROP.VIEW, allowed: canViewCrops, desc: capCopy.cropViewDesc },
    { title: capCopy.hubReadTitle, action: ACTIONS.HUB.READ, allowed: canManageHubs, desc: capCopy.hubReadDesc },
    { title: capCopy.staffViewTitle, action: ACTIONS.STAFF.VIEW, allowed: canVerifyStaff, desc: capCopy.staffViewDesc },
    { title: capCopy.orderViewTitle, action: ACTIONS.ORDER.VIEW, allowed: canRouteOrders, desc: capCopy.orderViewDesc },
    { title: capCopy.ledgerViewTitle, action: ACTIONS.CASH_LEDGER.VIEW, allowed: canViewLedgers, desc: capCopy.ledgerViewDesc }
  ];

  const stats = copy.dashboard.stats;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={copy.dashboard.eyebrow}
        title={copy.dashboard.title}
        subtitle={copy.dashboard.subtitle}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              leftIcon={RefreshCw}
              onClick={() => window.location.reload()}
            >
              {copy.dashboard.refreshData}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              leftIcon={FileSpreadsheet}
            >
              {copy.dashboard.exportReport}
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title={stats.activeHubsTitle}
          value={stats.activeHubsValue}
          subtitle={stats.activeHubsSubtitle}
          trend={{ value: stats.activeHubsTrendValue, direction: 'up', label: stats.activeHubsTrendLabel }}
          icon={Store}
        />
        <StatCard
          title={stats.intakeTitle}
          value={stats.intakeValue}
          subtitle={stats.intakeSubtitle}
          trend={{ value: stats.intakeTrendValue, direction: 'up', label: stats.intakeTrendLabel }}
          icon={Sprout}
        />
        <StatCard
          title={stats.turnoverTitle}
          value={stats.turnoverValue}
          subtitle={stats.turnoverSubtitle}
          trend={{ value: stats.turnoverTrendValue, direction: 'up', label: stats.turnoverTrendLabel }}
          icon={TrendingUp}
        />
        <StatCard
          title={stats.kycTitle}
          value={stats.kycValue}
          subtitle={stats.kycSubtitle}
          trend={{ value: stats.kycTrendValue, direction: 'down', label: stats.kycTrendLabel }}
          icon={UserCheck}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-white rounded-xl border border-gray-200 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-[#ECFDF5] text-[#0E4B2E]">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900">
                    {copy.dashboard.diagnosticTitle}
                  </h2>
                  <p className="text-xs text-gray-500">
                    {copy.dashboard.diagnosticSubtitle}
                  </p>
                </div>
              </div>

              <StatusBadge
                status={isAuthenticated ? 'success' : 'warning'}
                dot={true}
              >
                {isAuthenticated ? copy.dashboard.sessionActive : copy.dashboard.unauthenticated}
              </StatusBadge>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-lg bg-gray-50 border border-gray-100 text-xs mb-6">
              <div>
                <span className="text-gray-400 block font-medium">{copy.dashboard.loggedInUser}</span>
                <span className="font-semibold text-gray-900 truncate block mt-0.5">
                  {user?.name || user?.fullName || copy.dashboard.defaultUserName}
                </span>
              </div>
              <div>
                <span className="text-gray-400 block font-medium">{copy.dashboard.activeWorkingRole}</span>
                <span className="font-semibold text-[#0E4B2E] truncate block mt-0.5">
                  {activeRole || ROLES.SUPER_ADMIN}
                </span>
              </div>
              <div>
                <span className="text-gray-400 block font-medium">{copy.dashboard.assignedRoles}</span>
                <span className="font-semibold text-gray-700 truncate block mt-0.5">
                  {roles && roles.length > 0 ? roles.join(', ') : ROLES.SUPER_ADMIN}
                </span>
              </div>
              <div>
                <span className="text-gray-400 block font-medium">{copy.dashboard.assignedHub}</span>
                <span className="font-semibold text-gray-700 truncate block mt-0.5">
                  {activeHubId || (staffAssignments?.[0]?.hubName ?? copy.dashboard.defaultHubName)}
                </span>
              </div>
            </div>

            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
              {copy.dashboard.roleCapabilitiesHeading}
            </h3>

            <div className="space-y-2">
              {rbacItems.map((item) => (
                <div
                  key={item.action}
                  className="flex items-center justify-between p-2.5 rounded-lg border border-gray-100 hover:bg-gray-50/80 transition-colors text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    {item.allowed ? (
                      <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-gray-400 shrink-0" />
                    )}
                    <div>
                      <span className="font-semibold text-gray-900 block">
                        {item.title}
                      </span>
                      <span className="text-gray-500 text-[11px]">
                        {item.desc}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-full font-semibold text-[10px] ${
                      item.allowed
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-gray-100 text-gray-500 border border-gray-200'
                    }`}
                  >
                    {item.allowed ? copy.common.granted : copy.common.restricted}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <span>{copy.dashboard.securityModelLabel}</span>
            <span className="font-medium text-[#0E4B2E]">{copy.dashboard.leastPrivilegeLabel}</span>
          </div>
        </div>

        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#0E4B2E]" />
                <h3 className="text-sm font-bold text-gray-900">
                  {copy.dashboard.clustersTitle}
                </h3>
              </div>
              <span className="text-xs font-semibold text-emerald-600">
                {copy.dashboard.allLiveLabel}
              </span>
            </div>

            <div className="space-y-3">
              {copy.dashboard.clusters.map((cluster) => (
                <div
                  key={cluster.name}
                  className="p-3 rounded-lg border border-gray-100 bg-gray-50/60 flex items-center justify-between text-xs"
                >
                  <div>
                    <h4 className="font-semibold text-gray-900">{cluster.name}</h4>
                    <p className="text-gray-500 text-[11px]">{cluster.meta}</p>
                  </div>
                  <StatusBadge status="success">{cluster.status}</StatusBadge>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#0E4B2E] text-white rounded-xl p-6 shadow-xs relative overflow-hidden">
            <div className="absolute right-0 top-0 -mr-10 -mt-10 w-32 h-32 rounded-full bg-[#FACC15]/10 blur-xl pointer-events-none" />
            <h3 className="text-sm font-bold mb-1 text-white">
              {copy.dashboard.settlementTitle}
            </h3>
            <p className="text-xs text-white/70 leading-relaxed mb-4">
              {copy.dashboard.settlementDescription}
            </p>
            <div className="flex items-center justify-between pt-3 border-t border-white/10 text-xs">
              <span className="text-[#FACC15] font-semibold">{copy.dashboard.zeroCashRisk}</span>
              <span className="text-white/60">{copy.dashboard.digitalAuditTrail}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CommandCenterPage;
