import { ACTIONS } from '../rbac/actions.js';
import { ROUTES } from '../constants/routes.constants.js';

export const navConfig = Object.freeze([
  {
    key: 'commandCenter',
    labelKey: 'commandCenter',
    label: 'Command Center',
    path: ROUTES.DASHBOARD,
    iconName: 'LayoutDashboard',
    requiredAction: null
  },
  {
    key: 'pricingEngine',
    labelKey: 'pricingEngine',
    label: 'Pricing Engine',
    path: ROUTES.PRICING,
    iconName: 'TrendingUp',
    requiredAction: ACTIONS.MANDI_RATE.VIEW
  },
  {
    key: 'cropCatalog',
    labelKey: 'cropCatalog',
    label: 'Crop Catalogue',
    path: ROUTES.CATALOG,
    iconName: 'Sprout',
    requiredAction: ACTIONS.CROP.VIEW
  },
  {
    key: 'ktcShops',
    labelKey: 'ktcShops',
    label: 'KTC Shops',
    path: ROUTES.HUBS,
    iconName: 'Store',
    requiredAction: ACTIONS.HUB.READ
  },
  {
    key: 'farmerKyc',
    labelKey: 'farmerKyc',
    label: 'Farmer KYC',
    path: ROUTES.KYC,
    iconName: 'UserCheck',
    requiredAction: ACTIONS.STAFF.VIEW
  },
  {
    key: 'orderRouting',
    labelKey: 'orderRouting',
    label: 'Order Routing',
    path: ROUTES.ORDERS,
    iconName: 'Truck',
    requiredAction: ACTIONS.ORDER.VIEW
  },
  {
    key: 'financeLedgers',
    labelKey: 'financeLedgers',
    label: 'Finance & Ledgers',
    path: ROUTES.FINANCE,
    iconName: 'ReceiptText',
    requiredAction: ACTIONS.CASH_LEDGER.VIEW
  },
  {
    key: 'uiKitDev',
    labelKey: 'uiKitDev',
    label: 'UI Kit (Dev)',
    path: ROUTES.UI_KIT,
    iconName: 'Palette',
    requiredAction: null
  }
]);

export default navConfig;
