import { useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Building2,
  CheckCircle2,
  FileWarning,
  Sprout
} from 'lucide-react';
import {
  Button,
  EmptyState,
  StatusBadge
} from '../../../shared/components/index.js';
import { ACTIONS } from '../../../core/rbac/actions.js';
import { Can } from '../../../core/rbac/Can.jsx';
import { ROUTES, useCopy } from '../../../core/constants/index.js';

function getDocVerificationStatusVariant(status) {
  if (status === 'APPROVED') return 'success';
  if (status === 'REJECTED') return 'danger';
  return 'warning';
}

function formatExpiryDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(date);
}

export function AlertsPanel({ alerts, isLoading, onNavigate }) {
  const copy = useCopy();
  const [nowMs] = useState(() => Date.now());
  const alertsCopy = copy.dashboard.alertsSection;

  const pendingHubs = alerts?.pendingVerificationHubs ?? [];
  const unratedCount = alerts?.varietiesWithoutPublishedRate?.count ?? 0;
  const unratedSamples = alerts?.varietiesWithoutPublishedRate?.samples ?? [];
  const expiringDocs = alerts?.expiringDocuments ?? [];
  const totalCount = alerts?.totalCount ?? 0;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex flex-col gap-5">
      <div className="flex items-start justify-between gap-3 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-amber-50 text-amber-700 shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900">
              {alertsCopy.title}
            </h2>
            <p className="text-xs text-gray-500">{alertsCopy.subtitle}</p>
          </div>
        </div>

        <StatusBadge
          status={totalCount > 0 ? 'warning' : 'success'}
          size="sm"
        >
          {totalCount}
        </StatusBadge>
      </div>

      {isLoading ? (
        <div className="space-y-3 animate-pulse">
          <div className="h-14 rounded-lg bg-gray-100" />
          <div className="h-14 rounded-lg bg-gray-100" />
          <div className="h-14 rounded-lg bg-gray-100" />
        </div>
      ) : totalCount === 0 ? (
        <EmptyState
          icon={CheckCircle2}
          title={alertsCopy.clearTitle}
          description={alertsCopy.clearDescription}
          className="py-8"
        />
      ) : (
        <div className="space-y-5">
          {pendingHubs.length > 0 && (
            <div className="space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                <Building2 className="w-3.5 h-3.5 text-amber-600" />
                <span>{alertsCopy.pendingHubsHeading}</span>
              </div>

              <div className="space-y-2">
                {pendingHubs.map((hub) => (
                  <div
                    key={hub.id}
                    className="flex items-center justify-between gap-3 p-3 rounded-lg border border-amber-200/70 bg-amber-50/40"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {hub.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {hub.code} • {hub.cityOrTown}, {hub.state}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      rightIcon={ArrowRight}
                      onClick={() => onNavigate(ROUTES.HUBS)}
                    >
                      {alertsCopy.reviewHubCta}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {unratedCount > 0 && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                  <Sprout className="w-3.5 h-3.5 text-ktc-green" />
                  <span>{alertsCopy.unratedVarietiesHeading}</span>
                </div>
                <StatusBadge status="warning" size="sm" dot={false}>
                  {unratedCount}
                </StatusBadge>
              </div>

              <div className="space-y-2">
                {unratedSamples.map((variety) => (
                  <div
                    key={variety.id}
                    className="flex items-center justify-between gap-3 p-3 rounded-lg border border-gray-200 bg-gray-50/60"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {variety.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {variety.cropName}
                      </p>
                    </div>

                    <Can action={ACTIONS.MANDI_RATE.SET_HUB}>
                      <Button
                        variant="outline"
                        size="sm"
                        rightIcon={ArrowRight}
                        onClick={() => onNavigate(ROUTES.PRICING)}
                      >
                        {alertsCopy.publishRateCta}
                      </Button>
                    </Can>
                  </div>
                ))}

                {unratedCount > unratedSamples.length && (
                  <p className="text-xs text-gray-500 pl-1">
                    {alertsCopy.moreCountPrefix}
                    {unratedCount - unratedSamples.length}{' '}
                    {alertsCopy.moreCountSuffix}
                  </p>
                )}
              </div>
            </div>
          )}

          {expiringDocs.length > 0 && (
            <div className="space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                <FileWarning className="w-3.5 h-3.5 text-rose-600" />
                <span>{alertsCopy.expiringDocsHeading}</span>
              </div>

              <div className="space-y-2">
                {expiringDocs.map((doc) => {
                  const isExpired =
                    doc.expiryDate &&
                    new Date(doc.expiryDate).getTime() < nowMs;
                  const docTypeLabel =
                    alertsCopy.docTypes?.[doc.documentType] || doc.documentType;
                  const statusLabel =
                    alertsCopy.docStatuses?.[doc.verificationStatus] ||
                    doc.verificationStatus;

                  return (
                    <div
                      key={doc.id}
                      className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-lg border border-rose-200/70 bg-rose-50/30"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {docTypeLabel}
                          </p>
                          <StatusBadge
                            status={getDocVerificationStatusVariant(
                              doc.verificationStatus
                            )}
                            size="sm"
                          >
                            {statusLabel}
                          </StatusBadge>
                          {isExpired && (
                            <StatusBadge status="danger" size="sm" dot={false}>
                              {alertsCopy.expiredBadge}
                            </StatusBadge>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5 truncate">
                          {doc.hubName} ({doc.hubCode}) •{' '}
                          {alertsCopy.expiresOnPrefix}{' '}
                          {formatExpiryDate(doc.expiryDate)}
                        </p>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        rightIcon={ArrowRight}
                        onClick={() => onNavigate(ROUTES.HUBS)}
                      >
                        {alertsCopy.inspectDocCta}
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AlertsPanel;
