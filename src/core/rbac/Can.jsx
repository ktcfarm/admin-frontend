import { usePermission } from './usePermission.js';

export function Can({ action, fallback = null, children }) {
  const allowed = usePermission(action);

  if (!allowed) {
    return fallback;
  }

  return children;
}

export default Can;
