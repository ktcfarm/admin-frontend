import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

export const DEFAULT_PAGE = 1;
export const DEFAULT_PAGE_SIZE = 10;
export const STANDARD_PAGE_SIZES = Object.freeze([10, 25, 50]);

function coerceParamValue(rawValue, defaultValue) {
  if (rawValue === null || rawValue === undefined) {
    return defaultValue;
  }

  if (typeof defaultValue === 'number') {
    const parsed = Number.parseInt(rawValue, 10);
    if (Number.isNaN(parsed)) {
      return defaultValue;
    }
    return parsed;
  }

  if (typeof defaultValue === 'boolean') {
    if (rawValue === 'true') return true;
    if (rawValue === 'false') return false;
    return defaultValue;
  }

  return rawValue;
}

function shouldStripParam(value, defaultValue) {
  if (value === '' || value === null || value === undefined) {
    return true;
  }
  return value === defaultValue;
}

export function useUrlQueryState(defaults = {}) {
  const [searchParams, setSearchParams] = useSearchParams();
  const defaultsSignature = JSON.stringify(defaults);

  const mergedDefaults = useMemo(
    () => ({
      page: DEFAULT_PAGE,
      limit: DEFAULT_PAGE_SIZE,
      ...JSON.parse(defaultsSignature)
    }),
    [defaultsSignature]
  );

  const params = useMemo(() => {
    const parsed = {};
    for (const [key, defaultValue] of Object.entries(mergedDefaults)) {
      const rawValue = searchParams.get(key);
      const coerced = coerceParamValue(rawValue, defaultValue);
      if ((key === 'page' || key === 'limit') && typeof coerced === 'number' && coerced < 1) {
        parsed[key] = defaultValue;
      } else {
        parsed[key] = coerced;
      }
    }
    return parsed;
  }, [searchParams, mergedDefaults]);

  const setParams = useCallback(
    (updates = {}, options = {}) => {
      const { resetPage = true, replace = true } = options;

      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          const nextUpdates = { ...updates };

          if (
            resetPage &&
            !Object.prototype.hasOwnProperty.call(nextUpdates, 'page') &&
            Object.keys(nextUpdates).some((k) => k !== 'page')
          ) {
            nextUpdates.page = mergedDefaults.page;
          }

          for (const [key, rawNextValue] of Object.entries(nextUpdates)) {
            const defaultValue = mergedDefaults[key];
            const coercedValue = coerceParamValue(
              rawNextValue === null || rawNextValue === undefined ? null : String(rawNextValue),
              defaultValue
            );

            if (shouldStripParam(coercedValue, defaultValue)) {
              next.delete(key);
            } else {
              next.set(key, String(coercedValue));
            }
          }

          return next;
        },
        { replace }
      );
    },
    [mergedDefaults, setSearchParams]
  );

  const setParam = useCallback(
    (key, value, options = {}) => {
      const { resetPage = true, replace = true } = options;
      setParams(
        { [key]: value },
        { resetPage: resetPage && key !== 'page', replace }
      );
    },
    [setParams]
  );

  const resetParams = useCallback(
    (options = {}) => {
      const { replace = true } = options;
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          for (const key of Object.keys(mergedDefaults)) {
            next.delete(key);
          }
          return next;
        },
        { replace }
      );
    },
    [mergedDefaults, setSearchParams]
  );

  return {
    params,
    setParam,
    setParams,
    resetParams,
    pageSizeOptions: STANDARD_PAGE_SIZES
  };
}

export default useUrlQueryState;
