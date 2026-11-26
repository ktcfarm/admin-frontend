export const COMPULSORY_DOCUMENT_SPECS = Object.freeze([
  { type: 'PAN_CARD', bucketType: 'PRIVATE', required: true },
  { type: 'AADHAAR_CARD', bucketType: 'PRIVATE', required: true },
  { type: 'OWNER_PHOTO', bucketType: 'PRIVATE', required: true },
  { type: 'FSSAI_LICENSE', bucketType: 'PRIVATE', required: true },
  { type: 'SHOP_ESTABLISHMENT', bucketType: 'PRIVATE', required: true },
  { type: 'PREMISES_PROOF', bucketType: 'PRIVATE', required: true },
  { type: 'SHOP_EXTERIOR_PHOTO', bucketType: 'PUBLIC', required: true },
  { type: 'SHOP_INTERIOR_PHOTO', bucketType: 'PUBLIC', required: true },
  { type: 'CANCELLED_CHEQUE', bucketType: 'PRIVATE', required: true },
  { type: 'FRANCHISE_AGREEMENT', bucketType: 'PRIVATE', required: true }
]);

export const OPTIONAL_DOCUMENT_SPECS = Object.freeze([
  { type: 'GST_CERTIFICATE', bucketType: 'PRIVATE', required: false },
  { type: 'WEIGHING_SCALE_CERT', bucketType: 'PRIVATE', required: false },
  { type: 'APMC_LICENSE', bucketType: 'PRIVATE', required: false },
  { type: 'SECURITY_DEPOSIT_RECEIPT', bucketType: 'PRIVATE', required: false }
]);

export const ALL_DOCUMENT_SPECS = Object.freeze([
  ...COMPULSORY_DOCUMENT_SPECS,
  ...OPTIONAL_DOCUMENT_SPECS
]);

export const ONBOARDING_BADGE_VARIANT = Object.freeze({
  DRAFT: 'neutral',
  PENDING_VERIFICATION: 'warning',
  VERIFIED: 'success',
  SUSPENDED: 'danger'
});

export const DOCUMENT_BADGE_VARIANT = Object.freeze({
  PENDING: 'warning',
  APPROVED: 'success',
  REJECTED: 'danger'
});
