export const ROLES = Object.freeze({
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  HUB_MANAGER: 'HUB_MANAGER',
  STORE_OPERATOR: 'STORE_OPERATOR',
  FARMER: 'FARMER',
  BUYER: 'BUYER'
});

export const ROLE_METADATA = Object.freeze({
  [ROLES.SUPER_ADMIN]: Object.freeze({
    value: ROLES.SUPER_ADMIN,
    label: 'Super Admin',
    description: 'Global Head & System Owner'
  }),
  [ROLES.ADMIN]: Object.freeze({
    value: ROLES.ADMIN,
    label: 'Admin',
    description: 'Regional Operations & Pricing'
  }),
  [ROLES.HUB_MANAGER]: Object.freeze({
    value: ROLES.HUB_MANAGER,
    label: 'Hub Manager',
    description: 'Mandi Hub In-charge & Staff Lead'
  }),
  [ROLES.STORE_OPERATOR]: Object.freeze({
    value: ROLES.STORE_OPERATOR,
    label: 'Store Operator',
    description: 'Field Weighbridge & Intake Staff'
  })
});

export const STAFF_ROLE_OPTIONS = Object.freeze([
  {
    value: ROLES.SUPER_ADMIN,
    label: `${ROLE_METADATA[ROLES.SUPER_ADMIN].label} (${ROLE_METADATA[ROLES.SUPER_ADMIN].description})`,
    subtitle: ROLE_METADATA[ROLES.SUPER_ADMIN].description
  },
  {
    value: ROLES.ADMIN,
    label: `${ROLE_METADATA[ROLES.ADMIN].label} (${ROLE_METADATA[ROLES.ADMIN].description})`,
    subtitle: ROLE_METADATA[ROLES.ADMIN].description
  },
  {
    value: ROLES.HUB_MANAGER,
    label: `${ROLE_METADATA[ROLES.HUB_MANAGER].label} (${ROLE_METADATA[ROLES.HUB_MANAGER].description})`,
    subtitle: ROLE_METADATA[ROLES.HUB_MANAGER].description
  },
  {
    value: ROLES.STORE_OPERATOR,
    label: `${ROLE_METADATA[ROLES.STORE_OPERATOR].label} (${ROLE_METADATA[ROLES.STORE_OPERATOR].description})`,
    subtitle: ROLE_METADATA[ROLES.STORE_OPERATOR].description
  }
]);

export default ROLES;
