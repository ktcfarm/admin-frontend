import React, { useMemo, useState } from 'react';
import {
  CheckCircle2,
  Clock,
  Eye,
  FileCheck2,
  Landmark,
  MapPin,
  Pencil,
  Phone,
  Trash2,
  UserPlus,
  Users,
  Wallet,
  XCircle
} from 'lucide-react';
import {
  Alert,
  Button,
  EmptyState,
  Input,
  Modal,
  SlideOver,
  StatusBadge
} from '../../../shared/components/index.js';
import {
  formatDateTime,
  formatINR,
  formatOperatingHours
} from '../../../shared/utils/formatters.js';
import { ROLE_METADATA, useCopy } from '../../../core/constants/index.js';
import { Can } from '../../../core/rbac/Can.jsx';
import { usePermission } from '../../../core/rbac/usePermission.js';
import { ACTIONS } from '../../../core/rbac/actions.js';
import {
  useHubDetail,
  useHubStaff,
  useOpenDocumentPreview,
  useRemoveStaff,
  useVerifyHubDocument
} from '../hooks/useHubs.js';
import {
  COMPULSORY_DOCUMENT_SPECS,
  DOCUMENT_BADGE_VARIANT,
  ONBOARDING_BADGE_VARIANT
} from '../constants/hubs.constants.js';

export function HubDetailSlideOver({
  hubId,
  isOpen,
  onClose,
  onEditHub,
  onOpenAssignStaff
}) {
  const copy = useCopy();
  const detailCopy = copy.hubs.detail;
  const onboardingCopy = copy.hubs.onboarding;

  const canUpdateFull = usePermission(ACTIONS.HUB.UPDATE);
  const canUpdateOperational = usePermission(ACTIONS.HUB.UPDATE_OPERATIONAL);
  const canEdit = canUpdateFull || canUpdateOperational;

  const canViewStaff = usePermission(ACTIONS.STAFF.VIEW);
  const canViewCashLedger = usePermission(ACTIONS.CASH_LEDGER.VIEW);

  const { data: hub, isLoading: hubLoading } = useHubDetail(isOpen ? hubId : null);
  const { data: staffList = [], isLoading: staffLoading } = useHubStaff(
    isOpen ? hubId : null
  );

  const [staffToRemove, setStaffToRemove] = useState(null);
  const [rejectDoc, setRejectDoc] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectError, setRejectError] = useState('');

  const removeStaffMutation = useRemoveStaff({
    onSuccess: () => setStaffToRemove(null)
  });

  const verifyDocMutation = useVerifyHubDocument({
    onSuccess: () => {
      setRejectDoc(null);
      setRejectReason('');
      setRejectError('');
    }
  });

  const previewMutation = useOpenDocumentPreview();

  const documents = useMemo(() => hub?.documents || [], [hub?.documents]);

  const compulsoryUploadedCount = useMemo(() => {
    const present = new Set(documents.map((doc) => doc.documentType));
    return COMPULSORY_DOCUMENT_SPECS.filter((spec) => present.has(spec.type))
      .length;
  }, [documents]);

  const handleConfirmRemove = () => {
    if (!hubId || !staffToRemove?.id) return;
    removeStaffMutation.mutate({
      hubId,
      staffId: staffToRemove.id
    });
  };

  const handleApproveDoc = (doc) => {
    if (!hubId || !doc?.id) return;
    verifyDocMutation.mutate({
      hubId,
      docId: doc.id,
      payload: { status: 'APPROVED' }
    });
  };

  const handleConfirmReject = () => {
    const trimmed = rejectReason.trim();
    if (trimmed.length < 3) {
      setRejectError(onboardingCopy.rejectReasonRequired);
      return;
    }
    setRejectError('');
    verifyDocMutation.mutate({
      hubId,
      docId: rejectDoc.id,
      payload: { status: 'REJECTED', rejectionReason: trimmed }
    });
  };

  const profile = hub?.franchiseProfile;

  return (
    <>
      <SlideOver
        isOpen={isOpen}
        onClose={onClose}
        title={hub?.name || detailCopy.titleFallback}
        description={
          hub ? `${hub.code} • ${hub.cityOrTown}, ${hub.state}` : undefined
        }
        size="lg"
        footer={
          <>
            {canEdit && hub && (
              <Button
                variant="outline"
                leftIcon={Pencil}
                onClick={() => onEditHub?.(hub)}
              >
                {detailCopy.editAction}
              </Button>
            )}
            <Button variant="primary" onClick={onClose}>
              {detailCopy.closeAction}
            </Button>
          </>
        }
      >
        {hubLoading ? (
          <div className="space-y-4 animate-pulse">
            <div className="h-24 bg-gray-100 rounded-xl" />
            <div className="h-28 bg-gray-100 rounded-xl" />
            <div className="h-40 bg-gray-100 rounded-xl" />
          </div>
        ) : hub ? (
          <div className="space-y-6">
            <section className="rounded-xl border border-gray-200 bg-gray-50/70 p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  {detailCopy.sectionIdentity}
                </h4>
                <div className="flex items-center gap-2">
                  <StatusBadge
                    status={
                      ONBOARDING_BADGE_VARIANT[hub.onboardingStatus] || 'neutral'
                    }
                    size="sm"
                  >
                    {copy.hubs.onboardingStatuses[hub.onboardingStatus] ||
                      hub.onboardingStatus}
                  </StatusBadge>
                  <StatusBadge
                    status={hub.isActive ? 'success' : 'neutral'}
                    size="sm"
                  >
                    {hub.isActive
                      ? copy.hubs.statusActive
                      : copy.hubs.statusInactive}
                  </StatusBadge>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-gray-500 block">
                    {detailCopy.codeLabel}
                  </span>
                  <span className="font-semibold text-gray-900">{hub.code}</span>
                </div>

                <div>
                  <span className="text-gray-500 block">
                    {detailCopy.hindiNameLabel}
                  </span>
                  <span className="font-semibold text-gray-900">
                    {hub.translations?.hi || '—'}
                  </span>
                </div>

                <div className="sm:col-span-2 flex items-start gap-2">
                  <MapPin className="w-3.5 h-3.5 text-ktc-green mt-0.5 shrink-0" />
                  <div>
                    <span className="text-gray-500 block">
                      {detailCopy.addressLabel}
                    </span>
                    <span className="font-medium text-gray-900">
                      {hub.addressLine}, {hub.cityOrTown}, {hub.district},{' '}
                      {hub.state} - {hub.pinCode}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Phone className="w-3.5 h-3.5 text-ktc-green mt-0.5 shrink-0" />
                  <div>
                    <span className="text-gray-500 block">
                      {detailCopy.contactLabel}
                    </span>
                    <span className="font-medium text-gray-900">
                      {hub.contactPhone || copy.hubs.noPhone}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Clock className="w-3.5 h-3.5 text-ktc-green mt-0.5 shrink-0" />
                  <div>
                    <span className="text-gray-500 block">
                      {detailCopy.hoursLabel}
                    </span>
                    <span className="font-medium text-gray-900">
                      {formatOperatingHours(
                        hub.operatingHours,
                        copy.hubs.noHours
                      )}
                    </span>
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <span className="text-gray-500 block">
                    {detailCopy.coordinatesLabel}
                  </span>
                  <span className="font-mono text-gray-800">
                    {hub.latitude}, {hub.longitude}
                  </span>
                </div>
              </div>
            </section>

            <Can action={ACTIONS.HUB.UPDATE}>
              <section className="rounded-xl border border-gray-200 bg-white p-4 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Landmark className="w-4 h-4 text-ktc-green" />
                    <h4 className="text-sm font-semibold text-gray-900">
                      {onboardingCopy.franchiseSummaryTitle}
                    </h4>
                  </div>

                  {profile?.franchiseModel && (
                    <StatusBadge status="gold" size="sm" dot={false}>
                      {profile.franchiseModel}
                    </StatusBadge>
                  )}
                </div>

                {profile ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-gray-500 block">
                        {onboardingCopy.entityTypeLabel}
                      </span>
                      <span className="font-semibold text-gray-900">
                        {copy.hubs.entityTypes[profile.entityType] ||
                          profile.entityType}
                      </span>
                    </div>

                    <div>
                      <span className="text-gray-500 block">
                        {onboardingCopy.ownerNameLabel}
                      </span>
                      <span className="font-semibold text-gray-900">
                        {profile.ownerName}
                      </span>
                    </div>

                    <div>
                      <span className="text-gray-500 block">
                        {onboardingCopy.ownerPhoneLabel}
                      </span>
                      <span className="font-medium text-gray-900">
                        {profile.ownerPhone}
                      </span>
                    </div>

                    <div>
                      <span className="text-gray-500 block">
                        {onboardingCopy.ownerEmailLabel}
                      </span>
                      <span className="font-medium text-gray-900">
                        {profile.ownerEmail || '—'}
                      </span>
                    </div>

                    <div>
                      <span className="text-gray-500 block">
                        {onboardingCopy.panLabel}
                      </span>
                      <span className="font-mono font-semibold text-gray-900">
                        {profile.panNumber || '—'}
                      </span>
                    </div>

                    <div>
                      <span className="text-gray-500 block">
                        {onboardingCopy.gstinLabel}
                      </span>
                      <span className="font-mono text-gray-900">
                        {profile.gstin || '—'}
                      </span>
                    </div>

                    <div>
                      <span className="text-gray-500 block">
                        {onboardingCopy.fssaiLabel}
                      </span>
                      <span className="font-mono text-gray-900">
                        {profile.fssaiNumber || '—'}
                      </span>
                    </div>

                    <div>
                      <span className="text-gray-500 block">
                        {onboardingCopy.commissionPercentLabel}
                      </span>
                      <span className="font-semibold text-gray-900">
                        {profile.commissionPercent !== null &&
                        profile.commissionPercent !== undefined
                          ? `${profile.commissionPercent}%`
                          : '—'}
                      </span>
                    </div>

                    <div>
                      <span className="text-gray-500 block">
                        {onboardingCopy.bankNameLabel}
                      </span>
                      <span className="font-medium text-gray-900">
                        {profile.bankName || '—'}
                      </span>
                    </div>

                    <div>
                      <span className="text-gray-500 block">
                        {onboardingCopy.bankIfscLabel}
                      </span>
                      <span className="font-mono text-gray-900">
                        {profile.bankIfsc || '—'}
                      </span>
                    </div>

                    <div>
                      <span className="text-gray-500 block">
                        {onboardingCopy.bankNumberLabel}
                      </span>
                      <span className="font-mono text-gray-900">
                        {profile.bankAccountNumber || '—'}
                      </span>
                    </div>

                    <div>
                      <span className="text-gray-500 block">
                        {onboardingCopy.securityDepositLabel}
                      </span>
                      <span className="font-semibold text-gray-900">
                        {profile.securityDepositAmount !== null &&
                        profile.securityDepositAmount !== undefined
                          ? formatINR(profile.securityDepositAmount)
                          : '—'}
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-gray-500">
                    {onboardingCopy.franchiseNotConfigured}
                  </p>
                )}
              </section>
            </Can>

            <section className="rounded-xl border border-gray-200 bg-white p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <FileCheck2 className="w-4 h-4 text-ktc-green" />
                  <h4 className="text-sm font-semibold text-gray-900">
                    {onboardingCopy.vaultTitle}
                  </h4>
                </div>

                <StatusBadge status="info" size="sm" dot={false}>
                  {compulsoryUploadedCount} / {COMPULSORY_DOCUMENT_SPECS.length}{' '}
                  {onboardingCopy.vaultProgressSuffix}
                </StatusBadge>
              </div>

              {documents.length === 0 ? (
                <p className="text-xs text-gray-500">
                  {onboardingCopy.vaultEmpty}
                </p>
              ) : (
                <div className="divide-y divide-gray-100 border border-gray-100 rounded-lg">
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="p-3 text-xs space-y-2"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-gray-900">
                              {copy.hubs.documentTypes[doc.documentType] ||
                                doc.documentType}
                            </span>
                            <StatusBadge
                              status={
                                DOCUMENT_BADGE_VARIANT[
                                  doc.verificationStatus
                                ] || 'neutral'
                              }
                              size="sm"
                            >
                              {copy.hubs.documentStatuses[
                                doc.verificationStatus
                              ] || doc.verificationStatus}
                            </StatusBadge>
                          </div>

                          <p className="text-gray-500 mt-0.5 truncate">
                            {doc.fileName}
                            {doc.documentNumber ? ` • ${doc.documentNumber}` : ''}
                            {doc.expiryDate
                              ? ` • Exp: ${formatDateTime(doc.expiryDate, 'date')}`
                              : ''}
                          </p>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <Button
                            size="sm"
                            variant="outline"
                            leftIcon={Eye}
                            loading={
                              previewMutation.isPending &&
                              previewMutation.variables?.docId === doc.id
                            }
                            onClick={() =>
                              previewMutation.mutate({
                                hubId,
                                docId: doc.id
                              })
                            }
                          >
                            {onboardingCopy.previewBtn}
                          </Button>

                          <Can action={ACTIONS.HUB.UPDATE}>
                            {doc.verificationStatus !== 'APPROVED' && (
                              <Button
                                size="sm"
                                variant="primary"
                                leftIcon={CheckCircle2}
                                loading={
                                  verifyDocMutation.isPending &&
                                  verifyDocMutation.variables?.docId === doc.id &&
                                  verifyDocMutation.variables?.payload?.status ===
                                    'APPROVED'
                                }
                                onClick={() => handleApproveDoc(doc)}
                              >
                                {onboardingCopy.approveBtn}
                              </Button>
                            )}

                            {doc.verificationStatus !== 'REJECTED' && (
                              <Button
                                size="sm"
                                variant="ghost"
                                leftIcon={XCircle}
                                onClick={() => {
                                  setRejectDoc(doc);
                                  setRejectReason(doc.rejectionReason || '');
                                  setRejectError('');
                                }}
                                className="text-red-600 hover:bg-red-50 hover:text-red-700"
                              >
                                {onboardingCopy.rejectBtn}
                              </Button>
                            )}
                          </Can>
                        </div>
                      </div>

                      {doc.rejectionReason && (
                        <Alert type="error">{doc.rejectionReason}</Alert>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="rounded-xl border border-gray-200 bg-white p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Wallet className="w-4 h-4 text-ktc-green" />
                <h4 className="text-sm font-semibold text-gray-900">
                  {detailCopy.safeTitle}
                </h4>
              </div>

              {!canViewCashLedger ? (
                <Alert type="warning">{detailCopy.safeRestricted}</Alert>
              ) : Array.isArray(hub.cashAccounts) &&
                hub.cashAccounts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {hub.cashAccounts.map((account) => (
                    <div
                      key={account.id}
                      className="rounded-lg border border-gray-200 bg-ktc-green-light/60 p-3"
                    >
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-ktc-green block">
                        {account.type.replace(/_/g, ' ')}
                      </span>
                      <span className="text-lg font-bold text-gray-900 mt-1 block">
                        {formatINR(account.balance)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-500">{detailCopy.safeEmpty}</p>
              )}
            </section>

            <section className="rounded-xl border border-gray-200 bg-white p-4 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-ktc-green" />
                  <h4 className="text-sm font-semibold text-gray-900">
                    {detailCopy.staffTitle}
                  </h4>
                </div>

                <Can action={ACTIONS.STAFF.ASSIGN}>
                  <Button
                    size="sm"
                    variant="secondary"
                    leftIcon={UserPlus}
                    onClick={() => onOpenAssignStaff?.(hub)}
                  >
                    {detailCopy.assignStaffBtn}
                  </Button>
                </Can>
              </div>

              {!canViewStaff ? (
                <Alert type="warning">{detailCopy.staffRestricted}</Alert>
              ) : staffLoading ? (
                <div className="space-y-2 animate-pulse">
                  <div className="h-12 bg-gray-100 rounded-lg" />
                  <div className="h-12 bg-gray-100 rounded-lg" />
                </div>
              ) : staffList.length === 0 ? (
                <EmptyState
                  title={detailCopy.staffEmptyTitle}
                  description={detailCopy.staffEmptyDesc}
                />
              ) : (
                <div className="divide-y divide-gray-100 border border-gray-100 rounded-lg">
                  {staffList.map((assignment) => {
                    const roleLabel =
                      ROLE_METADATA[assignment.role]?.label || assignment.role;
                    const staffUser = assignment.user || {};

                    return (
                      <div
                        key={assignment.id}
                        className="flex items-center justify-between gap-3 p-3 text-xs"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-gray-900 truncate">
                              {staffUser.name ||
                                staffUser.email ||
                                staffUser.phone}
                            </span>
                            <StatusBadge status="info" size="sm" dot={false}>
                              {roleLabel}
                            </StatusBadge>
                          </div>
                          <p className="text-gray-500 mt-0.5 truncate">
                            {[staffUser.phone, staffUser.email]
                              .filter(Boolean)
                              .join(' • ')}
                          </p>
                          <p className="text-[11px] text-gray-400 mt-0.5">
                            {formatDateTime(assignment.createdAt, 'date')}
                          </p>
                        </div>

                        <Can action={ACTIONS.STAFF.REMOVE}>
                          <Button
                            size="sm"
                            variant="ghost"
                            leftIcon={Trash2}
                            onClick={() => setStaffToRemove(assignment)}
                            className="text-red-600 hover:bg-red-50 hover:text-red-700 shrink-0"
                          >
                            {detailCopy.removeStaffBtn}
                          </Button>
                        </Can>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </div>
        ) : null}
      </SlideOver>

      <Modal
        isOpen={Boolean(staffToRemove)}
        onClose={() => setStaffToRemove(null)}
        title={detailCopy.confirmRemoveTitle}
        size="sm"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setStaffToRemove(null)}
              disabled={removeStaffMutation.isPending}
            >
              {detailCopy.cancelAction}
            </Button>
            <Button
              variant="danger"
              loading={removeStaffMutation.isPending}
              onClick={handleConfirmRemove}
            >
              {detailCopy.confirmRemoveAction}
            </Button>
          </>
        }
      >
        <p className="text-sm text-gray-600">
          {detailCopy.confirmRemoveMessage}
        </p>
      </Modal>

      <Modal
        isOpen={Boolean(rejectDoc)}
        onClose={() => setRejectDoc(null)}
        title={onboardingCopy.rejectModalTitle}
        description={onboardingCopy.rejectModalDescription}
        size="sm"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setRejectDoc(null)}
              disabled={verifyDocMutation.isPending}
            >
              {detailCopy.cancelAction}
            </Button>
            <Button
              variant="danger"
              loading={verifyDocMutation.isPending}
              onClick={handleConfirmReject}
            >
              {onboardingCopy.rejectConfirmBtn}
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          {rejectError && <Alert type="error">{rejectError}</Alert>}
          <Input
            label={onboardingCopy.rejectReasonLabel}
            placeholder={onboardingCopy.rejectReasonPlaceholder}
            value={rejectReason}
            onChange={(event) => setRejectReason(event.target.value)}
            required
          />
        </div>
      </Modal>
    </>
  );
}

export default HubDetailSlideOver;
