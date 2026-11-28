import { Activity, Clock, User } from 'lucide-react';
import { EmptyState, StatusBadge } from '../../../shared/components/index.js';
import { useCopy } from '../../../core/constants/index.js';

function getActionBadgeVariant(action = '') {
  const normalized = String(action).toUpperCase();
  if (
    normalized.includes('PUBLISH') ||
    normalized.includes('APPROV') ||
    normalized.includes('VERIFY') ||
    normalized.includes('VERIFIED')
  ) {
    return 'success';
  }
  if (
    normalized.includes('DELETE') ||
    normalized.includes('REJECT') ||
    normalized.includes('DEACTIVATE') ||
    normalized.includes('SUSPEND')
  ) {
    return 'danger';
  }
  if (normalized.includes('CREATE') || normalized.includes('UPLOAD')) {
    return 'info';
  }
  if (normalized.includes('UPDATE') || normalized.includes('BULK')) {
    return 'warning';
  }
  return 'neutral';
}

function formatActionLabel(action = '') {
  return String(action).replaceAll('_', ' ').replaceAll(':', ' • ');
}

function formatTimestamp(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

export function RecentActivityCard({ activities = [], isLoading }) {
  const copy = useCopy();
  const activityCopy = copy.dashboard.activitySection;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-ktc-green-light text-ktc-green shrink-0">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900">
              {activityCopy.title}
            </h2>
            <p className="text-xs text-gray-500">{activityCopy.subtitle}</p>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3 animate-pulse">
          <div className="h-12 rounded-lg bg-gray-100" />
          <div className="h-12 rounded-lg bg-gray-100" />
          <div className="h-12 rounded-lg bg-gray-100" />
        </div>
      ) : activities.length === 0 ? (
        <EmptyState
          icon={Clock}
          title={activityCopy.emptyTitle}
          description={activityCopy.emptyDescription}
          className="py-8"
        />
      ) : (
        <div className="space-y-3">
          {activities.map((entry) => (
            <div
              key={entry.id}
              className="p-3 rounded-lg border border-gray-100 bg-gray-50/70 space-y-1.5"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <StatusBadge
                  status={getActionBadgeVariant(entry.action)}
                  size="sm"
                  dot={false}
                >
                  {formatActionLabel(entry.action)}
                </StatusBadge>
                <span className="text-[11px] text-gray-500">
                  {formatTimestamp(entry.createdAt)}
                </span>
              </div>

              <div className="flex items-center justify-between gap-2 text-xs">
                <span className="font-semibold text-gray-900 truncate">
                  {activityCopy.entityPrefix}: {entry.entityType}
                </span>
                <span className="inline-flex items-center gap-1 text-gray-600 truncate">
                  <User className="w-3 h-3 text-gray-400 shrink-0" />
                  <span className="truncate">
                    {entry.actorName || activityCopy.systemActor}
                  </span>
                  {entry.actorRole ? (
                    <span className="text-gray-400">({entry.actorRole})</span>
                  ) : null}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default RecentActivityCard;
