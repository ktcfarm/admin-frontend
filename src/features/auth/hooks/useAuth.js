import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authApi } from '../api/auth.api.js';
import { useAuthStore } from '../../../core/auth/auth.store.js';
import { useUiStore } from '../../../core/ui/ui.store.js';

export function usePinLogin(options = {}) {
  const { onSuccess, onError, ...restOptions } = options;
  const setSession = useAuthStore((state) => state.setSession);
  const addToast = useUiStore((state) => state.addToast);
  const queryClient = useQueryClient();

  return useMutation({
    ...restOptions,
    mutationFn: ({ identifier, pin, targetRole }) =>
      authApi.loginWithPin({ identifier, pin, targetRole }),
    onSuccess: (data, variables, context) => {
      const payload = data?.data ?? data;
      const user = payload?.user ?? payload;
      const accessToken = payload?.accessToken ?? payload?.tokens?.accessToken ?? null;
      const refreshToken = payload?.refreshToken ?? payload?.tokens?.refreshToken ?? null;
      const activeRole = payload?.activeRole ?? variables?.targetRole ?? null;
      const roles = payload?.roles ?? user?.roles ?? [];
      const staffAssignments = payload?.staffAssignments ?? user?.staffAssignments ?? [];

      if (!accessToken) {
        const errorMsg = payload?.message || 'Authentication succeeded but no access token was returned.';
        addToast({
          type: 'error',
          title: 'Login Failed',
          message: errorMsg
        });
        if (onError) {
          onError(new Error(errorMsg), variables, context);
        }
        return;
      }

      setSession({
        user,
        accessToken,
        refreshToken,
        activeRole,
        roles,
        staffAssignments
      });

      queryClient.setQueryData(['auth', 'me'], user);

      addToast({
        type: 'success',
        title: 'Login Successful',
        message: `Welcome back, ${user.name || user.fullName || 'Admin'}!`
      });

      if (onSuccess) {
        onSuccess(payload, variables, context);
      }
    },
    onError: (error, variables, context) => {
      addToast({
        type: 'error',
        title: 'Login Failed',
        message: error.message || 'Invalid credentials or PIN'
      });
      if (onError) {
        onError(error, variables, context);
      }
    }
  });
}

export function useSendOtp(options = {}) {
  const { onSuccess, onError, ...restOptions } = options;
  const addToast = useUiStore((state) => state.addToast);

  return useMutation({
    ...restOptions,
    mutationFn: ({ identifier, channel = 'EMAIL', purpose = 'LOGIN' }) =>
      authApi.sendOtp({ identifier, channel, purpose }),
    onSuccess: (data, variables, context) => {
      addToast({
        type: 'info',
        title: 'OTP Dispatched',
        message: `Verification code sent to ${variables.identifier}`
      });
      if (onSuccess) {
        onSuccess(data, variables, context);
      }
    },
    onError: (error, variables, context) => {
      addToast({
        type: 'error',
        title: 'Failed to Send OTP',
        message: error.message || 'Unable to dispatch OTP'
      });
      if (onError) {
        onError(error, variables, context);
      }
    }
  });
}

export function useOtpLogin(options = {}) {
  const { onSuccess, onError, ...restOptions } = options;
  const setSession = useAuthStore((state) => state.setSession);
  const addToast = useUiStore((state) => state.addToast);
  const queryClient = useQueryClient();

  return useMutation({
    ...restOptions,
    mutationFn: ({ identifier, otp, targetRole }) =>
      authApi.loginWithOtp({ identifier, otp, targetRole }),
    onSuccess: (data, variables, context) => {
      const payload = data?.data ?? data;
      const user = payload?.user ?? payload;
      const accessToken = payload?.accessToken ?? payload?.tokens?.accessToken ?? null;
      const refreshToken = payload?.refreshToken ?? payload?.tokens?.refreshToken ?? null;
      const activeRole = payload?.activeRole ?? variables?.targetRole ?? null;
      const roles = payload?.roles ?? user?.roles ?? [];
      const staffAssignments = payload?.staffAssignments ?? user?.staffAssignments ?? [];

      if (!accessToken) {
        const errorMsg = payload?.message || 'Authentication succeeded but no access token was returned.';
        addToast({
          type: 'error',
          title: 'Login Failed',
          message: errorMsg
        });
        if (onError) {
          onError(new Error(errorMsg), variables, context);
        }
        return;
      }

      setSession({
        user,
        accessToken,
        refreshToken,
        activeRole,
        roles,
        staffAssignments
      });

      queryClient.setQueryData(['auth', 'me'], user);

      addToast({
        type: 'success',
        title: 'Login Successful',
        message: `Welcome back, ${user.name || user.fullName || 'Admin'}!`
      });

      if (onSuccess) {
        onSuccess(payload, variables, context);
      }
    },
    onError: (error, variables, context) => {
      addToast({
        type: 'error',
        title: 'OTP Verification Failed',
        message: error.message || 'Invalid or expired OTP'
      });
      if (onError) {
        onError(error, variables, context);
      }
    }
  });
}

export function useResetPin(options = {}) {
  const { onSuccess, onError, ...restOptions } = options;
  const addToast = useUiStore((state) => state.addToast);

  return useMutation({
    ...restOptions,
    mutationFn: ({ identifier, otp, newPin }) =>
      authApi.resetPin({ identifier, otp, newPin }),
    onSuccess: (data, variables, context) => {
      addToast({
        type: 'success',
        title: 'PIN Reset Successfully',
        message: 'Your security PIN has been updated. You can now login.'
      });
      if (onSuccess) {
        onSuccess(data, variables, context);
      }
    },
    onError: (error, variables, context) => {
      addToast({
        type: 'error',
        title: 'PIN Reset Failed',
        message: error.message || 'Could not reset PIN. Please check the OTP.'
      });
      if (onError) {
        onError(error, variables, context);
      }
    }
  });
}

export function useLogout(options = {}) {
  const { onSettled, ...restOptions } = options;
  const clearSession = useAuthStore((state) => state.clearSession);
  const addToast = useUiStore((state) => state.addToast);
  const queryClient = useQueryClient();

  return useMutation({
    ...restOptions,
    mutationFn: () => authApi.logout(),
    onSettled: (data, error, variables, context) => {
      clearSession();
      queryClient.clear();
      addToast({
        type: 'info',
        title: 'Signed Out',
        message: 'You have been safely logged out.'
      });
      if (onSettled) {
        onSettled(data, error, variables, context);
      }
    }
  });
}

export function useCurrentUser(options = {}) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const setSession = useAuthStore((state) => state.setSession);
  const accessToken = useAuthStore((state) => state.accessToken);
  const refreshToken = useAuthStore((state) => state.refreshToken);
  const activeRole = useAuthStore((state) => state.activeRole);

  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      const response = await authApi.getMe();
      const payload = response?.data ?? response;
      const user = payload?.user ?? payload;
      if (user) {
        setSession({
          user,
          accessToken,
          refreshToken,
          activeRole: payload?.activeRole ?? activeRole ?? user?.activeRole,
          roles: payload?.roles ?? user?.roles ?? [],
          staffAssignments: payload?.staffAssignments ?? user?.staffAssignments ?? []
        });
      }
      return user;
    },
    enabled: Boolean(isAuthenticated) && (options.enabled ?? true),
    ...options
  });
}

export function useSwitchRole(options = {}) {
  const { onSuccess, onError, ...restOptions } = options;
  const setSession = useAuthStore((state) => state.setSession);
  const addToast = useUiStore((state) => state.addToast);
  const queryClient = useQueryClient();

  return useMutation({
    ...restOptions,
    mutationFn: ({ targetRole }) => authApi.switchRole({ targetRole }),
    onSuccess: (data, variables, context) => {
      const payload = data?.data ?? data;
      const user = payload?.user ?? payload;
      const accessToken = payload?.accessToken ?? payload?.tokens?.accessToken ?? null;
      const refreshToken = payload?.refreshToken ?? payload?.tokens?.refreshToken ?? null;
      const activeRole = payload?.activeRole ?? variables?.targetRole ?? null;
      const roles = payload?.roles ?? user?.roles ?? [];
      const staffAssignments = payload?.staffAssignments ?? user?.staffAssignments ?? [];

      setSession({
        user,
        accessToken,
        refreshToken,
        activeRole,
        roles,
        staffAssignments
      });

      queryClient.invalidateQueries();

      if (onSuccess) {
        onSuccess(payload, variables, context);
      }
    },
    onError: (error, variables, context) => {
      addToast({
        type: 'error',
        title: 'Role Switch Failed',
        message: error.message || 'Unable to switch active role.'
      });
      if (onError) {
        onError(error, variables, context);
      }
    }
  });
}
