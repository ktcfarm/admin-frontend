import React from 'react';
import {
  Archive,
  CheckCircle2,
  Layers,
  Pencil,
  TrendingUp
} from 'lucide-react';
import { useCopy } from '../../../core/constants/index.js';
import { ACTIONS } from '../../../core/rbac/actions.js';
import { usePermission } from '../../../core/rbac/usePermission.js';
import {
  Alert,
  Button,
  SlideOver,
  StatusBadge
} from '../../../shared/components/index.js';
import { formatDateTime, formatINR } from '../../../shared/utils/formatters.js';
import {
  RATE_STATUS_BADGE_VARIANT,
  RATE_TREND_BADGE_VARIANT
} from '../constants/pricing.constants.js';
import { useRateDetail, useUpdateRateStatus } from '../hooks/usePricing.js';

export function RateDetailSlideOver({ rateId, isOpen, onClose, onEdit }) {
  const copy = useCopy();
  const pricingCopy = copy.pricing;
  const detailCopy = pricingCopy.detail;
  const actionsCopy = pricingCopy.actions;

  const canSetGlobal = usePermission(ACTIONS.MANDI_RATE.SET_GLOBAL);
  const canSetHub = usePermission(ACTIONS.MANDI_RATE.SET_HUB);

  const { data: rate, isLoading, isError, error } = useRateDetail(
    isOpen ? rateId : null
  );
  const statusMutation = useUpdateRateStatus();

  const canMutateThisRate = rate
    ? rate.hubId
      ? canSetGlobal || canSetHub
      : canSetGlobal
    : false;

  const tiers = Array.isArray(rate?.bulkTiers) ? rate.bulkTiers : [];
  const marginNum = Number(rate?.marginPercent || 0);

  return (
    <SlideOver
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      title={rate?.cropVariety?.name || detailCopy.titleFallback}
      description={
        rate
          ? `${rate.gradeCode} • ${rate.hub ? `${rate.hub.name} (${rate.hub.code})` : pricingCopy.scopes.GLOBAL}`
          : undefined
      }
      footer={
        <>
          {canMutateThisRate && rate && (
            <>
              {rate.status !== 'PUBLISHED' && (
                <Button
                  variant="primary"
                  leftIcon={CheckCircle2}
                  loading={statusMutation.isPending}
                  onClick={() =>
                    statusMutation.mutate({ id: rate.id, status: 'PUBLISHED' })
                  }
                >
                  {actionsCopy.publish}
                </Button>
              )}
              {rate.status !== 'ARCHIVED' && (
                <Button
                  variant="outline"
                  leftIcon={Archive}
                  loading={statusMutation.isPending}
                  onClick={() =>
                    statusMutation.mutate({ id: rate.id, status: 'ARCHIVED' })
                  }
                >
                  {actionsCopy.archive}
                </Button>
              )}
              <Button
                variant="outline"
                leftIcon={Pencil}
                onClick={() => onEdit?.(rate)}
              >
                {actionsCopy.edit}
              </Button>
            </>
          )}
          <Button variant="primary" onClick={onClose}>
            {actionsCopy.close}
          </Button>
        </>
      }
    >
      {isLoading ? (
        <div className="space-y-4 animate-pulse">
          <div className="h-28 bg-gray-100 rounded-xl" />
          <div className="h-32 bg-gray-100 rounded-xl" />
        </div>
      ) : isError ? (
        <Alert type="error" title={error?.message || 'Unable to load rate details'} />
      ) : rate ? (
        <div className="space-y-5">
          <section className="rounded-xl border border-gray-200 bg-gray-50/70 p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-ktc-green" />
                <h4 className="text-sm font-semibold text-gray-900">
                  {detailCopy.buySellHeading}
                </h4>
              </div>

              <div className="flex items-center gap-2">
                <StatusBadge
                  status={rate.hubId ? 'gold' : 'info'}
                  size="sm"
                  dot={false}
                >
                  {rate.hubId
                    ? rate.hub?.name || pricingCopy.scopes.HUB
                    : pricingCopy.scopes.GLOBAL}
                </StatusBadge>
                <StatusBadge
                  status={RATE_STATUS_BADGE_VARIANT[rate.status] || 'neutral'}
                  size="sm"
                >
                  {pricingCopy.statuses[rate.status] || rate.status}
                </StatusBadge>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="rounded-lg bg-white border border-gray-200 p-3">
                <span className="text-[11px] font-medium text-gray-500 block">
                  {pricingCopy.columns.buyRate}
                </span>
                <span className="text-lg font-bold text-gray-900 mt-0.5 block">
                  {formatINR(rate.farmerBuyRate)}{' '}
                  <span className="text-xs font-normal text-gray-500">
                    / {rate.unit}
                  </span>
                </span>
              </div>

              <div className="rounded-lg bg-white border border-gray-200 p-3">
                <span className="text-[11px] font-medium text-gray-500 block">
                  {pricingCopy.columns.sellRate}
                </span>
                <span className="text-lg font-bold text-gray-900 mt-0.5 block">
                  {formatINR(rate.consumerSellRate)}{' '}
                  <span className="text-xs font-normal text-gray-500">
                    / {rate.unit}
                  </span>
                </span>
              </div>

              <div
                className={`rounded-lg border p-3 ${
                  marginNum < 0
                    ? 'bg-rose-50 border-rose-200 text-rose-900'
                    : 'bg-ktc-green-light border-emerald-200 text-ktc-green'
                }`}
              >
                <span className="text-[11px] font-medium block">
                  {pricingCopy.columns.margin}
                </span>
                <span className="text-lg font-bold mt-0.5 block">
                  {marginNum >= 0 ? '+' : ''}
                  {rate.marginPercent}%
                </span>
                <span className="text-[11px] opacity-80 block">
                  {formatINR(rate.marginAmount)} / {rate.unit}
                </span>
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-gray-200 bg-white p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-ktc-green" />
              <h4 className="text-sm font-semibold text-gray-900">
                {detailCopy.tiersHeading}
              </h4>
            </div>

            {tiers.length === 0 ? (
              <p className="text-xs text-gray-500">{detailCopy.noTiers}</p>
            ) : (
              <div className="divide-y divide-gray-100 border border-gray-100 rounded-lg">
                {tiers.map((tier, idx) => (
                  <div
                    key={`detail-tier-${idx}`}
                    className="flex items-center justify-between gap-3 p-3 text-xs"
                  >
                    <div>
                      <span className="font-semibold text-gray-900">
                        {tier.minQty}+ {rate.unit}
                      </span>
                      {tier.label && (
                        <span className="text-gray-500 ml-2">({tier.label})</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900">
                        {formatINR(tier.unitPrice)} / {rate.unit}
                      </span>
                      {tier.discountPercent !== undefined && (
                        <StatusBadge status="success" size="sm" dot={false}>
                          -{tier.discountPercent}%
                        </StatusBadge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-xl border border-gray-200 bg-white p-4 space-y-3 text-xs">
            <h4 className="text-sm font-semibold text-gray-900">
              {detailCopy.apmcRangeHeading}
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <span className="text-gray-500 block">
                  {pricingCopy.columns.effectiveDate}
                </span>
                <span className="font-semibold text-gray-900">
                  {formatDateTime(rate.effectiveDate || rate.rateDate, 'date')}
                </span>
              </div>

              <div>
                <span className="text-gray-500 block">{detailCopy.minLabel}</span>
                <span className="font-semibold text-gray-900">
                  {formatINR(rate.minRatePerUnit)}
                </span>
              </div>

              <div>
                <span className="text-gray-500 block">{detailCopy.maxLabel}</span>
                <span className="font-semibold text-gray-900">
                  {formatINR(rate.maxRatePerUnit)}
                </span>
              </div>

              <div>
                <span className="text-gray-500 block">{detailCopy.trendLabel}</span>
                <StatusBadge
                  status={RATE_TREND_BADGE_VARIANT[rate.trend] || 'neutral'}
                  size="sm"
                  dot={false}
                >
                  {pricingCopy.trends[rate.trend] || rate.trend}
                </StatusBadge>
              </div>

              <div>
                <span className="text-gray-500 block">{detailCopy.deltaLabel}</span>
                <span className="font-semibold text-gray-900">
                  {rate.apmcDelta !== null && rate.apmcDelta !== undefined
                    ? formatINR(rate.apmcDelta)
                    : '—'}
                </span>
              </div>

              <div>
                <span className="text-gray-500 block">
                  {detailCopy.procurementLabel}
                </span>
                <StatusBadge
                  status={rate.isProcurementActive ? 'success' : 'neutral'}
                  size="sm"
                >
                  {rate.isProcurementActive
                    ? detailCopy.procurementEnabled
                    : detailCopy.procurementPaused}
                </StatusBadge>
              </div>
            </div>

            {rate.notes && (
              <div className="pt-2 border-t border-gray-100">
                <span className="text-gray-500 block mb-0.5">
                  {detailCopy.notesLabel}
                </span>
                <p className="text-gray-800">{rate.notes}</p>
              </div>
            )}
          </section>
        </div>
      ) : null}
    </SlideOver>
  );
}

export default RateDetailSlideOver;
