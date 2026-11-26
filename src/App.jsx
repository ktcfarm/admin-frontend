import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './core/auth/ProtectedRoute.jsx';
import { AdminShell } from './layouts/AdminShell.jsx';
import { LoginPage } from './features/auth/pages/LoginPage.jsx';
import { ResetPinPage } from './features/auth/pages/ResetPinPage.jsx';
import { CommandCenterPage } from './features/dashboard/pages/CommandCenterPage.jsx';
import { CatalogPage } from './features/catalog/pages/CatalogPage.jsx';
import { HubsPage } from './features/hubs/pages/HubsPage.jsx';
import { PricingPage } from './features/pricing/pages/PricingPage.jsx';
import { UiKitShowcasePage } from './features/ui-kit/pages/UiKitShowcasePage.jsx';
import { ACTIONS } from './core/rbac/actions.js';
import { ROUTES, useCopy } from './core/constants/index.js';

function PlaceholderPage({ title, action }) {
  const copy = useCopy();

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
      <h2 className="text-xl font-bold text-gray-900 mb-2">{title}</h2>
      <p className="text-sm text-gray-500 mb-4">
        {copy.common.placeholderSubtitlePrefix} ({action || copy.common.generalLabel}).
      </p>
      <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#ECFDF5] text-[#0E4B2E] border border-emerald-200">
        {copy.common.scaffoldedBadge}
      </div>
    </div>
  );
}

export function App() {
  const copy = useCopy();

  return (
    <Routes>
      <Route path={ROUTES.LOGIN} element={<LoginPage />} />
      <Route path={ROUTES.RESET_PIN} element={<ResetPinPage />} />
      <Route path={ROUTES.AUTH_LOGIN_LEGACY} element={<Navigate to={ROUTES.LOGIN} replace />} />
      <Route path={ROUTES.AUTH_RESET_PIN_LEGACY} element={<Navigate to={ROUTES.RESET_PIN} replace />} />

      <Route
        path={ROUTES.DASHBOARD}
        element={
          <ProtectedRoute>
            <AdminShell />
          </ProtectedRoute>
        }
      >
        <Route index element={<CommandCenterPage />} />
        <Route
          path="pricing"
          element={
            <ProtectedRoute requiredAction={ACTIONS.MANDI_RATE.VIEW}>
              <PricingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="catalog"
          element={
            <ProtectedRoute requiredAction={ACTIONS.CROP.VIEW}>
              <CatalogPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="hubs"
          element={
            <ProtectedRoute requiredAction={ACTIONS.HUB.READ}>
              <HubsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="kyc"
          element={
            <ProtectedRoute requiredAction={ACTIONS.STAFF.VIEW}>
              <PlaceholderPage title={copy.nav.farmerKyc} action={ACTIONS.STAFF.VIEW} />
            </ProtectedRoute>
          }
        />
        <Route
          path="orders"
          element={
            <ProtectedRoute requiredAction={ACTIONS.ORDER.VIEW}>
              <PlaceholderPage title={copy.nav.orderRouting} action={ACTIONS.ORDER.VIEW} />
            </ProtectedRoute>
          }
        />
        <Route
          path="finance"
          element={
            <ProtectedRoute requiredAction={ACTIONS.CASH_LEDGER.VIEW}>
              <PlaceholderPage title={copy.nav.financeLedgers} action={ACTIONS.CASH_LEDGER.VIEW} />
            </ProtectedRoute>
          }
        />
        <Route path="ui-kit" element={<UiKitShowcasePage />} />
      </Route>

      <Route path="*" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
    </Routes>
  );
}

export default App;
