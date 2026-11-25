import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from './auth.store.js';
import { usePermission } from '../rbac/usePermission.js';

export function ProtectedRoute({ children, requiredAction = null, fallback = null, redirectTo = null }) {
  const location = useLocation();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const hasAccess = usePermission(requiredAction);

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredAction && !hasAccess) {
    if (redirectTo) {
      return <Navigate to={redirectTo} replace />;
    }

    if (fallback) {
      return fallback;
    }

    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-4">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">403 - Access Denied</h2>
        <p className="text-gray-600 max-w-md mb-6">
          You do not have the required permissions ({requiredAction}) to view this resource.
        </p>
      </div>
    );
  }

  return children;
}

export default ProtectedRoute;
