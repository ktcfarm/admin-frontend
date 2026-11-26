import React, { useMemo, useState } from 'react';
import {
  Building2,
  CheckCircle2,
  FileCheck2,
  Landmark,
  MapPin,
  ShieldCheck
} from 'lucide-react';
import {
  Alert,
  Button,
  FileUploadField,
  Input,
  LocationPickerModal,
  OperatingHoursInput,
  Select,
  SlideOver,
  StatusBadge,
  Toggle
} from '../../../shared/components/index.js';
import { parseOperatingHours } from '../../../shared/utils/formatters.js';
import { ROLES, useCopy } from '../../../core/constants/index.js';
import { useAuthStore } from '../../../core/auth/auth.store.js';
import { Can } from '../../../core/rbac/Can.jsx';
import { usePermission } from '../../../core/rbac/usePermission.js';
import { ACTIONS } from '../../../core/rbac/actions.js';
import {
  useCreateHub,
  useHubDetail,
  useOpenDocumentPreview,
  useUpdateHub,
  useUpdateOnboardingStatus,
  useUploadAndRegisterDocument,
  useUpsertFranchiseProfile
} from '../hooks/useHubs.js';
import {
  COMPULSORY_DOCUMENT_SPECS,
  ONBOARDING_BADGE_VARIANT,
  OPTIONAL_DOCUMENT_SPECS
} from '../constants/hubs.constants.js';

const DEFAULT_OPERATING_HOURS = Object.freeze({
  openTime: '07:00',
  closeTime: '19:00',
  days: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
});

const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
const IFSC_REGEX = /^[A-Z]{4}0[A-Z0-9]{6}$/;

function buildShopState(hub) {
  const parsedHours =
    parseOperatingHours(hub?.operatingHours) ||
    parseOperatingHours(hub?.metadata?.operatingHours);

  return {
    code: hub?.code || '',
    name: hub?.name || '',
    hindiName: hub?.translations?.hi || '',
    addressLine: hub?.addressLine || '',
    cityOrTown: hub?.cityOrTown || '',
    district: hub?.district || '',
    state: hub?.state || '',
    pinCode: hub?.pinCode || '',
    contactPhone: hub?.contactPhone || '',
    operatingHours: parsedHours || {
      openTime: DEFAULT_OPERATING_HOURS.openTime,
      closeTime: DEFAULT_OPERATING_HOURS.closeTime,
      days: [...DEFAULT_OPERATING_HOURS.days]
    },
    latitude:
      hub?.latitude !== undefined && hub?.latitude !== null
        ? String(hub.latitude)
        : '',
    longitude:
      hub?.longitude !== undefined && hub?.longitude !== null
        ? String(hub.longitude)
        : ''
  };
}

function buildFranchiseState(profile) {
  return {
    entityType: profile?.entityType || 'PROPRIETORSHIP',
    ownerName: profile?.ownerName || '',
    ownerPhone: profile?.ownerPhone || '',
    ownerEmail: profile?.ownerEmail || '',
    panNumber: profile?.panNumber || '',
    gstin: profile?.gstin || '',
    fssaiNumber: profile?.fssaiNumber || '',
    bankAccountHolder: profile?.bankAccountHolder || '',
    bankAccountNumber: profile?.bankAccountNumber || '',
    bankIfsc: profile?.bankIfsc || '',
    bankName: profile?.bankName || '',
    franchiseModel: profile?.franchiseModel || 'FOFO',
    commissionPercent:
      profile?.commissionPercent !== undefined && profile?.commissionPercent !== null
        ? String(profile.commissionPercent)
        : '',
    securityDepositAmount:
      profile?.securityDepositAmount !== undefined &&
      profile?.securityDepositAmount !== null
        ? String(profile.securityDepositAmount)
        : '',
    maxCashLimit:
      profile?.maxCashLimit !== undefined && profile?.maxCashLimit !== null
        ? String(profile.maxCashLimit)
        : ''
  };
}

export function HubFormSlideOver({ isOpen, onClose, hub = null }) {
  const copy = useCopy();
  const formCopy = copy.hubs.form;
  const onboardingCopy = copy.hubs.onboarding;

  const activeRole = useAuthStore((state) => state.activeRole);
  const canUpdateFull = usePermission(ACTIONS.HUB.UPDATE);
  const canUpdateOperational = usePermission(ACTIONS.HUB.UPDATE_OPERATIONAL);
  const canDeactivate = usePermission(ACTIONS.HUB.DEACTIVATE);

  const [createdHub, setCreatedHub] = useState(null);
  const effectiveHubId = hub?.id || createdHub?.id || null;
  const isEdit = Boolean(effectiveHubId);
  const isOperationalOnly = isEdit && !canUpdateFull && canUpdateOperational;

  const { data: liveHub } = useHubDetail(isOpen ? effectiveHubId : null);
  const resolvedHub = liveHub || hub || createdHub;

  const resetKey = isOpen ? hub?.id || 'create' : 'closed';
  const [prevResetKey, setPrevResetKey] = useState(resetKey);
  const [activeTab, setActiveTab] = useState('shop');
  const [shopData, setShopData] = useState(() => buildShopState(resolvedHub));
  const [isActive, setIsActive] = useState(() => resolvedHub?.isActive ?? true);
  const [franchiseData, setFranchiseData] = useState(() =>
    buildFranchiseState(resolvedHub?.franchiseProfile)
  );
  const [prevFranchiseId, setPrevFranchiseId] = useState(
    resolvedHub?.franchiseProfile?.id || null
  );
  const [onboardingStatus, setOnboardingStatus] = useState(
    () => resolvedHub?.onboardingStatus || 'PENDING_VERIFICATION'
  );
  const [prevOnboardingStatus, setPrevOnboardingStatus] = useState(
    resolvedHub?.onboardingStatus || null
  );
  const [forceVerify, setForceVerify] = useState(false);
  const [formError, setFormError] = useState('');
  const [mapOpen, setMapOpen] = useState(false);
  const [showManualCoords, setShowManualCoords] = useState(false);
  const [docMetaByType, setDocMetaByType] = useState({});
  const [uploadingDocType, setUploadingDocType] = useState(null);

  if (resetKey !== prevResetKey) {
    setPrevResetKey(resetKey);
    if (isOpen) {
      setCreatedHub(null);
      setActiveTab('shop');
      setShopData(buildShopState(hub));
      setIsActive(hub?.isActive ?? true);
      setFranchiseData(buildFranchiseState(hub?.franchiseProfile));
      setPrevFranchiseId(hub?.franchiseProfile?.id || null);
      setOnboardingStatus(hub?.onboardingStatus || 'PENDING_VERIFICATION');
      setPrevOnboardingStatus(hub?.onboardingStatus || null);
      setForceVerify(false);
      setFormError('');
      setMapOpen(false);
      setShowManualCoords(false);
      setDocMetaByType({});
      setUploadingDocType(null);
    }
  }

  if (
    isOpen &&
    resolvedHub?.franchiseProfile?.id &&
    resolvedHub.franchiseProfile.id !== prevFranchiseId
  ) {
    setPrevFranchiseId(resolvedHub.franchiseProfile.id);
    setFranchiseData(buildFranchiseState(resolvedHub.franchiseProfile));
  }

  if (
    isOpen &&
    resolvedHub?.onboardingStatus &&
    resolvedHub.onboardingStatus !== prevOnboardingStatus
  ) {
    setPrevOnboardingStatus(resolvedHub.onboardingStatus);
    setOnboardingStatus(resolvedHub.onboardingStatus);
  }

  const createMutation = useCreateHub({
    onSuccess: (newHub) => {
      setCreatedHub(newHub);
      if (canUpdateFull) {
        setActiveTab('franchise');
      } else {
        onClose?.();
      }
    }
  });

  const updateMutation = useUpdateHub({
    onSuccess: () => {
      if (isOperationalOnly) {
        onClose?.();
      }
    }
  });

  const franchiseMutation = useUpsertFranchiseProfile();
  const uploadDocumentMutation = useUploadAndRegisterDocument();
  const statusMutation = useUpdateOnboardingStatus();
  const previewMutation = useOpenDocumentPreview();

  const isSubmitting =
    createMutation.isPending ||
    updateMutation.isPending ||
    franchiseMutation.isPending ||
    statusMutation.isPending;

  const presets = useMemo(
    () => [
      {
        id: 'mon-sat',
        label: formCopy.presetMonSat,
        days: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
      },
      {
        id: 'all-days',
        label: formCopy.presetAllDays,
        days: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']
      }
    ],
    [formCopy]
  );

  const entityTypeOptions = useMemo(
    () =>
      Object.entries(copy.hubs.entityTypes).map(([value, label]) => ({
        value,
        label
      })),
    [copy.hubs.entityTypes]
  );

  const franchiseModelOptions = useMemo(
    () =>
      Object.entries(copy.hubs.franchiseModels).map(([value, label]) => ({
        value,
        label
      })),
    [copy.hubs.franchiseModels]
  );

  const onboardingStatusOptions = useMemo(
    () =>
      ['DRAFT', 'PENDING_VERIFICATION', 'VERIFIED', 'SUSPENDED'].map(
        (value) => ({
          value,
          label: copy.hubs.onboardingStatuses[value] || value
        })
      ),
    [copy.hubs.onboardingStatuses]
  );

  const uploadedDocsByType = useMemo(() => {
    const map = new Map();
    for (const doc of resolvedHub?.documents || []) {
      map.set(doc.documentType, doc);
    }
    return map;
  }, [resolvedHub?.documents]);

  const compulsoryUploadedCount = useMemo(
    () =>
      COMPULSORY_DOCUMENT_SPECS.filter((spec) =>
        uploadedDocsByType.has(spec.type)
      ).length,
    [uploadedDocsByType]
  );

  const hasPinnedCoords =
    shopData.latitude !== '' &&
    shopData.longitude !== '' &&
    !Number.isNaN(Number(shopData.latitude)) &&
    !Number.isNaN(Number(shopData.longitude));

  const handleShopChange = (field) => (event) => {
    const value = event.target.value;
    setShopData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFranchiseChange = (field) => (event) => {
    const value = event.target.value;
    setFranchiseData((prev) => ({ ...prev, [field]: value }));
  };

  const handleMapConfirm = ({ lat, lng, address }) => {
    setShopData((prev) => ({
      ...prev,
      latitude: String(lat),
      longitude: String(lng),
      cityOrTown: prev.cityOrTown || address?.cityOrTown || '',
      district: prev.district || address?.district || '',
      state: prev.state || address?.state || '',
      pinCode: prev.pinCode || address?.pinCode || ''
    }));
  };

  const handleSaveShop = () => {
    setFormError('');

    if (isOperationalOnly) {
      updateMutation.mutate({
        hubId: effectiveHubId,
        payload: {
          ...(shopData.contactPhone.trim()
            ? { contactPhone: shopData.contactPhone.trim() }
            : {}),
          operatingHours: shopData.operatingHours
        }
      });
      return;
    }

    const requiredFields = [
      shopData.code,
      shopData.name,
      shopData.addressLine,
      shopData.cityOrTown,
      shopData.district,
      shopData.state,
      shopData.pinCode
    ];

    if (requiredFields.some((val) => !String(val || '').trim())) {
      setFormError(formCopy.validationRequired);
      return;
    }

    const lat = Number(shopData.latitude);
    const lng = Number(shopData.longitude);

    if (
      shopData.latitude === '' ||
      shopData.longitude === '' ||
      Number.isNaN(lat) ||
      Number.isNaN(lng) ||
      lat < -90 ||
      lat > 90 ||
      lng < -180 ||
      lng > 180
    ) {
      setFormError(formCopy.validationCoordinates);
      return;
    }

    const translations = {
      en: shopData.name.trim(),
      ...(shopData.hindiName.trim() ? { hi: shopData.hindiName.trim() } : {})
    };

    if (!isEdit) {
      createMutation.mutate({
        code: shopData.code.trim().toUpperCase(),
        name: shopData.name.trim(),
        translations,
        addressLine: shopData.addressLine.trim(),
        cityOrTown: shopData.cityOrTown.trim(),
        district: shopData.district.trim(),
        state: shopData.state.trim(),
        pinCode: shopData.pinCode.trim(),
        ...(shopData.contactPhone.trim()
          ? { contactPhone: shopData.contactPhone.trim() }
          : {}),
        operatingHours: shopData.operatingHours,
        latitude: lat,
        longitude: lng
      });
      return;
    }

    updateMutation.mutate({
      hubId: effectiveHubId,
      payload: {
        name: shopData.name.trim(),
        translations,
        addressLine: shopData.addressLine.trim(),
        cityOrTown: shopData.cityOrTown.trim(),
        district: shopData.district.trim(),
        state: shopData.state.trim(),
        pinCode: shopData.pinCode.trim(),
        ...(shopData.contactPhone.trim()
          ? { contactPhone: shopData.contactPhone.trim() }
          : {}),
        operatingHours: shopData.operatingHours,
        latitude: lat,
        longitude: lng,
        ...(canDeactivate ? { isActive: Boolean(isActive) } : {})
      }
    });
  };

  const handleSaveFranchise = (advanceToDocs = false) => {
    setFormError('');
    if (!effectiveHubId) return;

    if (!franchiseData.ownerName.trim() || !franchiseData.ownerPhone.trim()) {
      setFormError(onboardingCopy.validationFranchiseRequired);
      return;
    }

    const pan = franchiseData.panNumber.trim().toUpperCase();
    if (pan && !PAN_REGEX.test(pan)) {
      setFormError(onboardingCopy.validationPan);
      return;
    }

    const gstin = franchiseData.gstin.trim().toUpperCase();
    if (gstin && !GSTIN_REGEX.test(gstin)) {
      setFormError(onboardingCopy.validationGstin);
      return;
    }

    const fssai = franchiseData.fssaiNumber.trim();
    if (fssai && !/^\d{14}$/.test(fssai)) {
      setFormError(onboardingCopy.validationFssai);
      return;
    }

    const ifsc = franchiseData.bankIfsc.trim().toUpperCase();
    if (ifsc && !IFSC_REGEX.test(ifsc)) {
      setFormError(onboardingCopy.validationIfsc);
      return;
    }

    franchiseMutation.mutate(
      {
        hubId: effectiveHubId,
        payload: {
          entityType: franchiseData.entityType,
          ownerName: franchiseData.ownerName.trim(),
          ownerPhone: franchiseData.ownerPhone.trim(),
          ownerEmail: franchiseData.ownerEmail.trim() || null,
          panNumber: pan || null,
          gstin: gstin || null,
          fssaiNumber: fssai || null,
          bankAccountHolder: franchiseData.bankAccountHolder.trim() || null,
          bankAccountNumber: franchiseData.bankAccountNumber.trim() || null,
          bankIfsc: ifsc || null,
          bankName: franchiseData.bankName.trim() || null,
          franchiseModel: franchiseData.franchiseModel,
          commissionPercent:
            franchiseData.commissionPercent === ''
              ? null
              : Number(franchiseData.commissionPercent),
          securityDepositAmount:
            franchiseData.securityDepositAmount === ''
              ? null
              : Number(franchiseData.securityDepositAmount),
          maxCashLimit:
            franchiseData.maxCashLimit === ''
              ? null
              : Number(franchiseData.maxCashLimit)
        }
      },
      {
        onSuccess: () => {
          if (advanceToDocs) {
            setActiveTab('documents');
          }
        }
      }
    );
  };

  const handleDocUpload = (spec, file) => {
    if (!effectiveHubId || !file) return;
    const localMeta = docMetaByType[spec.type] || {};
    const existingDoc = uploadedDocsByType.get(spec.type);
    const documentNumber =
      localMeta.documentNumber !== undefined
        ? localMeta.documentNumber
        : existingDoc?.documentNumber || '';
    const expiryDate =
      localMeta.expiryDate !== undefined
        ? localMeta.expiryDate
        : existingDoc?.expiryDate
          ? String(existingDoc.expiryDate).slice(0, 10)
          : '';

    setUploadingDocType(spec.type);
    uploadDocumentMutation.mutate(
      {
        hubId: effectiveHubId,
        file,
        documentType: spec.type,
        bucketType: spec.bucketType,
        documentNumber: documentNumber.trim() || null,
        expiryDate: expiryDate || null
      },
      {
        onSettled: () => setUploadingDocType(null)
      }
    );
  };

  const renderDocumentGroup = (heading, specs) => (
    <div className="space-y-3">
      <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">
        {heading}
      </h4>

      <div className="space-y-3">
        {specs.map((spec) => {
          const existing = uploadedDocsByType.get(spec.type);
          const localMeta = docMetaByType[spec.type] || {};
          const docNumberVal =
            localMeta.documentNumber !== undefined
              ? localMeta.documentNumber
              : existing?.documentNumber || '';
          const expiryVal =
            localMeta.expiryDate !== undefined
              ? localMeta.expiryDate
              : existing?.expiryDate
                ? String(existing.expiryDate).slice(0, 10)
                : '';

          return (
            <div
              key={spec.type}
              className="rounded-xl border border-gray-200 bg-gray-50/50 p-3 space-y-2.5"
            >
              <FileUploadField
                label={copy.hubs.documentTypes[spec.type] || spec.type}
                required={spec.required}
                requiredLabel={onboardingCopy.compulsoryBadge}
                optionalLabel={onboardingCopy.optionalBadge}
                acceptedFormatsLabel={onboardingCopy.acceptedFormats}
                fileName={existing?.fileName || ''}
                status={existing?.verificationStatus}
                statusLabel={
                  existing?.verificationStatus
                    ? copy.hubs.documentStatuses[existing.verificationStatus]
                    : undefined
                }
                rejectionReason={existing?.rejectionReason || ''}
                uploading={uploadingDocType === spec.type}
                uploadLabel={onboardingCopy.uploadBtn}
                replaceLabel={onboardingCopy.replaceBtn}
                previewLabel={onboardingCopy.previewBtn}
                uploadingLabel={onboardingCopy.uploadingBtn}
                onFileSelect={(file) => handleDocUpload(spec, file)}
                onPreview={
                  existing
                    ? () =>
                        previewMutation.mutate({
                          hubId: effectiveHubId,
                          docId: existing.id
                        })
                    : undefined
                }
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 px-1">
                <Input
                  label={onboardingCopy.docNumberLabel}
                  placeholder={onboardingCopy.docNumberPlaceholder}
                  value={docNumberVal}
                  onChange={(event) =>
                    setDocMetaByType((prev) => ({
                      ...prev,
                      [spec.type]: {
                        ...prev[spec.type],
                        documentNumber: event.target.value
                      }
                    }))
                  }
                />

                <Input
                  label={onboardingCopy.expiryDateLabel}
                  type="date"
                  value={expiryVal}
                  onChange={(event) =>
                    setDocMetaByType((prev) => ({
                      ...prev,
                      [spec.type]: {
                        ...prev[spec.type],
                        expiryDate: event.target.value
                      }
                    }))
                  }
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderFooter = () => {
    if (activeTab === 'shop') {
      return (
        <>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            {formCopy.cancel}
          </Button>
          <Button
            variant="primary"
            loading={createMutation.isPending || updateMutation.isPending}
            onClick={handleSaveShop}
          >
            {isEdit
              ? formCopy.saveUpdate
              : canUpdateFull
                ? onboardingCopy.saveShopAndContinue
                : formCopy.saveCreate}
          </Button>
        </>
      );
    }

    if (activeTab === 'franchise') {
      return (
        <>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            {formCopy.cancel}
          </Button>
          <Button
            variant="outline"
            loading={franchiseMutation.isPending}
            onClick={() => handleSaveFranchise(false)}
          >
            {onboardingCopy.saveFranchise}
          </Button>
          <Button
            variant="primary"
            loading={franchiseMutation.isPending}
            onClick={() => handleSaveFranchise(true)}
          >
            {onboardingCopy.saveFranchiseAndContinue}
          </Button>
        </>
      );
    }

    return (
      <Button variant="primary" onClick={onClose}>
        {onboardingCopy.finishOnboarding}
      </Button>
    );
  };

  return (
    <>
      <SlideOver
        isOpen={isOpen}
        onClose={onClose}
        title={isEdit ? formCopy.editTitle : formCopy.createTitle}
        description={
          isEdit ? formCopy.editDescription : formCopy.createDescription
        }
        size="xl"
        footer={renderFooter()}
      >
        <div className="space-y-5">
          {canUpdateFull && (
            <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-xl bg-gray-100 border border-gray-200">
              <Button
                size="sm"
                variant={activeTab === 'shop' ? 'primary' : 'ghost'}
                leftIcon={Building2}
                onClick={() => {
                  setFormError('');
                  setActiveTab('shop');
                }}
              >
                {onboardingCopy.tabShopLocation}
              </Button>

              <Button
                size="sm"
                variant={activeTab === 'franchise' ? 'primary' : 'ghost'}
                leftIcon={Landmark}
                disabled={!isEdit}
                onClick={() => {
                  setFormError('');
                  setActiveTab('franchise');
                }}
              >
                {onboardingCopy.tabFranchiseBanking}
              </Button>

              <Button
                size="sm"
                variant={activeTab === 'documents' ? 'primary' : 'ghost'}
                leftIcon={FileCheck2}
                disabled={!isEdit}
                onClick={() => {
                  setFormError('');
                  setActiveTab('documents');
                }}
              >
                {onboardingCopy.tabComplianceDocs}
              </Button>
            </div>
          )}

          {!isEdit && canUpdateFull && (
            <Alert type="info">{onboardingCopy.createShopFirstNotice}</Alert>
          )}

          {isOperationalOnly && (
            <Alert type="info">{formCopy.operationalNotice}</Alert>
          )}

          {formError && <Alert type="error">{formError}</Alert>}

          {activeTab === 'shop' && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label={formCopy.codeLabel}
                  placeholder={formCopy.codePlaceholder}
                  helperText={!isEdit ? formCopy.codeHelper : undefined}
                  value={shopData.code}
                  onChange={handleShopChange('code')}
                  disabled={isEdit || isOperationalOnly}
                  required
                />

                <Input
                  label={formCopy.nameLabel}
                  placeholder={formCopy.namePlaceholder}
                  value={shopData.name}
                  onChange={handleShopChange('name')}
                  disabled={isOperationalOnly}
                  required
                />

                <Input
                  label={formCopy.hindiNameLabel}
                  placeholder={formCopy.hindiNamePlaceholder}
                  value={shopData.hindiName}
                  onChange={handleShopChange('hindiName')}
                  disabled={isOperationalOnly}
                />

                <Input
                  label={formCopy.contactPhoneLabel}
                  placeholder={formCopy.contactPhonePlaceholder}
                  value={shopData.contactPhone}
                  onChange={handleShopChange('contactPhone')}
                />
              </div>

              <Input
                label={formCopy.addressLineLabel}
                placeholder={formCopy.addressLinePlaceholder}
                value={shopData.addressLine}
                onChange={handleShopChange('addressLine')}
                disabled={isOperationalOnly}
                required
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Input
                  label={formCopy.cityOrTownLabel}
                  placeholder={formCopy.cityOrTownPlaceholder}
                  value={shopData.cityOrTown}
                  onChange={handleShopChange('cityOrTown')}
                  disabled={isOperationalOnly}
                  required
                />

                <Input
                  label={formCopy.districtLabel}
                  placeholder={formCopy.districtPlaceholder}
                  value={shopData.district}
                  onChange={handleShopChange('district')}
                  disabled={isOperationalOnly}
                  required
                />

                <Input
                  label={formCopy.stateLabel}
                  placeholder={formCopy.statePlaceholder}
                  value={shopData.state}
                  onChange={handleShopChange('state')}
                  disabled={isOperationalOnly}
                  required
                />

                <Input
                  label={formCopy.pinCodeLabel}
                  placeholder={formCopy.pinCodePlaceholder}
                  value={shopData.pinCode}
                  onChange={handleShopChange('pinCode')}
                  disabled={isOperationalOnly}
                  required
                />
              </div>

              <OperatingHoursInput
                label={formCopy.operatingHoursLabel}
                openLabel={formCopy.operatingHoursOpenLabel}
                closeLabel={formCopy.operatingHoursCloseLabel}
                daysLabel={formCopy.operatingHoursDaysLabel}
                presets={presets}
                dayLabels={formCopy.dayShort}
                value={shopData.operatingHours}
                onChange={(nextHours) =>
                  setShopData((prev) => ({
                    ...prev,
                    operatingHours: nextHours
                  }))
                }
              />

              <div className="space-y-3">
                <span className="block text-sm font-medium text-gray-700">
                  {formCopy.locationSectionLabel}
                  {!isOperationalOnly && (
                    <span className="text-red-500 ml-1">*</span>
                  )}
                </span>

                <div className="rounded-xl border border-gray-200 bg-gray-50/70 p-4 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 text-xs">
                      <div className="p-2 rounded-lg bg-ktc-green-light text-ktc-green shrink-0">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-gray-500 block">
                          {formCopy.locationPinnedPrefix}
                        </span>
                        <span className="font-mono font-semibold text-gray-900">
                          {hasPinnedCoords
                            ? `${Number(shopData.latitude).toFixed(6)}, ${Number(shopData.longitude).toFixed(6)}`
                            : formCopy.locationNotPinned}
                        </span>
                      </div>
                    </div>

                    {!isOperationalOnly && (
                      <Button
                        variant="secondary"
                        size="sm"
                        leftIcon={MapPin}
                        onClick={() => setMapOpen(true)}
                      >
                        {formCopy.pickOnMap}
                      </Button>
                    )}
                  </div>

                  {!isOperationalOnly && (
                    <div className="pt-2 border-t border-gray-200/70">
                      <Toggle
                        checked={showManualCoords}
                        onChange={setShowManualCoords}
                        label={formCopy.manualCoordsToggle}
                      />
                    </div>
                  )}

                  {(showManualCoords || isOperationalOnly) && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                      <Input
                        label={formCopy.latitudeLabel}
                        placeholder={formCopy.latitudePlaceholder}
                        type="number"
                        step="any"
                        value={shopData.latitude}
                        onChange={handleShopChange('latitude')}
                        disabled={isOperationalOnly}
                        required={!isOperationalOnly}
                      />

                      <Input
                        label={formCopy.longitudeLabel}
                        placeholder={formCopy.longitudePlaceholder}
                        type="number"
                        step="any"
                        value={shopData.longitude}
                        onChange={handleShopChange('longitude')}
                        disabled={isOperationalOnly}
                        required={!isOperationalOnly}
                      />
                    </div>
                  )}
                </div>
              </div>

              {isEdit && canDeactivate && (
                <div className="pt-3 border-t border-gray-100">
                  <Toggle
                    checked={Boolean(isActive)}
                    onChange={(checked) => setIsActive(checked)}
                    label={formCopy.activeToggleLabel}
                    description={formCopy.activeToggleDesc}
                  />
                </div>
              )}
            </div>
          )}

          {activeTab === 'franchise' && isEdit && (
            <Can action={ACTIONS.HUB.UPDATE}>
              <div className="space-y-6">
                <section className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                    {onboardingCopy.franchiseSectionIdentity}
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Select
                      label={onboardingCopy.entityTypeLabel}
                      options={entityTypeOptions}
                      value={franchiseData.entityType}
                      onChange={handleFranchiseChange('entityType')}
                      required
                    />

                    <Input
                      label={onboardingCopy.ownerNameLabel}
                      placeholder={onboardingCopy.ownerNamePlaceholder}
                      value={franchiseData.ownerName}
                      onChange={handleFranchiseChange('ownerName')}
                      required
                    />

                    <Input
                      label={onboardingCopy.ownerPhoneLabel}
                      placeholder={onboardingCopy.ownerPhonePlaceholder}
                      value={franchiseData.ownerPhone}
                      onChange={handleFranchiseChange('ownerPhone')}
                      required
                    />

                    <Input
                      label={onboardingCopy.ownerEmailLabel}
                      placeholder={onboardingCopy.ownerEmailPlaceholder}
                      type="email"
                      value={franchiseData.ownerEmail}
                      onChange={handleFranchiseChange('ownerEmail')}
                    />

                    <Input
                      label={onboardingCopy.panLabel}
                      placeholder={onboardingCopy.panPlaceholder}
                      value={franchiseData.panNumber}
                      onChange={handleFranchiseChange('panNumber')}
                    />

                    <Input
                      label={onboardingCopy.gstinLabel}
                      placeholder={onboardingCopy.gstinPlaceholder}
                      value={franchiseData.gstin}
                      onChange={handleFranchiseChange('gstin')}
                    />

                    <Input
                      label={onboardingCopy.fssaiLabel}
                      placeholder={onboardingCopy.fssaiPlaceholder}
                      value={franchiseData.fssaiNumber}
                      onChange={handleFranchiseChange('fssaiNumber')}
                    />
                  </div>
                </section>

                <section className="space-y-4 pt-4 border-t border-gray-100">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                    {onboardingCopy.franchiseSectionBanking}
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label={onboardingCopy.bankHolderLabel}
                      placeholder={onboardingCopy.bankHolderPlaceholder}
                      value={franchiseData.bankAccountHolder}
                      onChange={handleFranchiseChange('bankAccountHolder')}
                    />

                    <Input
                      label={onboardingCopy.bankNumberLabel}
                      placeholder={onboardingCopy.bankNumberPlaceholder}
                      value={franchiseData.bankAccountNumber}
                      onChange={handleFranchiseChange('bankAccountNumber')}
                    />

                    <Input
                      label={onboardingCopy.bankIfscLabel}
                      placeholder={onboardingCopy.bankIfscPlaceholder}
                      value={franchiseData.bankIfsc}
                      onChange={handleFranchiseChange('bankIfsc')}
                    />

                    <Input
                      label={onboardingCopy.bankNameLabel}
                      placeholder={onboardingCopy.bankNamePlaceholder}
                      value={franchiseData.bankName}
                      onChange={handleFranchiseChange('bankName')}
                    />
                  </div>
                </section>

                <section className="space-y-4 pt-4 border-t border-gray-100">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                    {onboardingCopy.franchiseSectionCommercial}
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Select
                      label={onboardingCopy.franchiseModelLabel}
                      options={franchiseModelOptions}
                      value={franchiseData.franchiseModel}
                      onChange={handleFranchiseChange('franchiseModel')}
                    />

                    <Input
                      label={onboardingCopy.commissionPercentLabel}
                      placeholder={onboardingCopy.commissionPercentPlaceholder}
                      type="number"
                      step="0.01"
                      value={franchiseData.commissionPercent}
                      onChange={handleFranchiseChange('commissionPercent')}
                    />

                    <Input
                      label={onboardingCopy.securityDepositLabel}
                      placeholder={onboardingCopy.securityDepositPlaceholder}
                      type="number"
                      step="0.01"
                      value={franchiseData.securityDepositAmount}
                      onChange={handleFranchiseChange('securityDepositAmount')}
                    />

                    <Input
                      label={onboardingCopy.maxCashLimitLabel}
                      placeholder={onboardingCopy.maxCashLimitPlaceholder}
                      type="number"
                      step="0.01"
                      value={franchiseData.maxCashLimit}
                      onChange={handleFranchiseChange('maxCashLimit')}
                    />
                  </div>
                </section>
              </div>
            </Can>
          )}

          {activeTab === 'documents' && isEdit && (
            <Can action={ACTIONS.HUB.UPDATE}>
              <div className="space-y-6">
                <div className="rounded-xl border border-gray-200 bg-ktc-green-light/50 p-4 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-ktc-green" />
                      <span className="text-sm font-semibold text-gray-900">
                        {onboardingCopy.onboardingStatusBarTitle}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <StatusBadge status="info" size="sm" dot={false}>
                        {compulsoryUploadedCount} / {COMPULSORY_DOCUMENT_SPECS.length}{' '}
                        {onboardingCopy.vaultProgressSuffix}
                      </StatusBadge>
                      <StatusBadge
                        status={
                          ONBOARDING_BADGE_VARIANT[
                            resolvedHub?.onboardingStatus
                          ] || 'neutral'
                        }
                        size="sm"
                      >
                        {copy.hubs.onboardingStatuses[
                          resolvedHub?.onboardingStatus
                        ] || resolvedHub?.onboardingStatus}
                      </StatusBadge>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-end gap-3">
                    <div className="flex-1">
                      <Select
                        label={onboardingCopy.onboardingStatusLabel}
                        options={onboardingStatusOptions}
                        value={onboardingStatus}
                        onChange={(event) =>
                          setOnboardingStatus(event.target.value)
                        }
                      />
                    </div>

                    <Button
                      variant="primary"
                      leftIcon={CheckCircle2}
                      loading={statusMutation.isPending}
                      onClick={() =>
                        statusMutation.mutate({
                          hubId: effectiveHubId,
                          payload: {
                            onboardingStatus,
                            force:
                              activeRole === ROLES.SUPER_ADMIN &&
                              onboardingStatus === 'VERIFIED' &&
                              forceVerify
                          }
                        })
                      }
                    >
                      {onboardingCopy.updateStatusBtn}
                    </Button>
                  </div>

                  {activeRole === ROLES.SUPER_ADMIN &&
                    onboardingStatus === 'VERIFIED' && (
                      <Toggle
                        checked={forceVerify}
                        onChange={setForceVerify}
                        label={onboardingCopy.forceVerifyLabel}
                      />
                    )}
                </div>

                {renderDocumentGroup(
                  onboardingCopy.compulsoryHeading,
                  COMPULSORY_DOCUMENT_SPECS
                )}

                {renderDocumentGroup(
                  onboardingCopy.optionalHeading,
                  OPTIONAL_DOCUMENT_SPECS
                )}
              </div>
            </Can>
          )}
        </div>
      </SlideOver>

      <LocationPickerModal
        isOpen={mapOpen}
        onClose={() => setMapOpen(false)}
        initialPosition={
          hasPinnedCoords
            ? {
                lat: Number(shopData.latitude),
                lng: Number(shopData.longitude)
              }
            : undefined
        }
        onConfirm={handleMapConfirm}
        title={formCopy.mapModalTitle}
        description={formCopy.mapModalDescription}
        searchPlaceholder={formCopy.mapSearchPlaceholder}
        confirmLabel={formCopy.mapConfirmLabel}
        cancelLabel={formCopy.mapCancelLabel}
        coordinatesLabel={formCopy.mapCoordinatesLabel}
        noResultsLabel={formCopy.mapNoResults}
        searchingLabel={formCopy.mapSearching}
      />
    </>
  );
}

export const HubFormDrawer = HubFormSlideOver;
export default HubFormSlideOver;
