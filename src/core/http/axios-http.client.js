import axios from 'axios';
import { BaseHttpClient } from './http-client.interface.js';
import { ApiError } from './api-error.js';
import { env } from '../config/env.js';
import { useAuthStore } from '../auth/auth.store.js';
import { useUiStore } from '../ui/ui.store.js';

export class AxiosHttpClient extends BaseHttpClient {
  constructor(baseURL = env.VITE_API_BASE_URL, timeout = 15000) {
    super();
    this.client = axios.create({
      baseURL,
      timeout
    });
    this.isRefreshing = false;
    this.failedQueue = [];
    this.setupInterceptors();
  }

  processQueue(error, token = null) {
    this.failedQueue.forEach((prom) => {
      if (error) {
        prom.reject(error);
      } else {
        prom.resolve(token);
      }
    });
    this.failedQueue = [];
  }

  normalizeError(error) {
    if (error instanceof ApiError) {
      return error;
    }
    return ApiError.fromAxiosError(error);
  }

  setupInterceptors() {
    this.client.interceptors.request.use(
      (config) => {
        const { accessToken } = useAuthStore.getState();
        if (accessToken) {
          if (config.headers?.set) {
            config.headers.set('Authorization', `Bearer ${accessToken}`);
          } else {
            config.headers = config.headers || {};
            config.headers.Authorization = `Bearer ${accessToken}`;
          }
        }

        const requestId = typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : Math.random().toString(36).substring(2, 15);

        if (config.headers?.set) {
          config.headers.set('X-Request-Id', requestId);
        } else {
          config.headers = config.headers || {};
          config.headers['X-Request-Id'] = requestId;
        }

        const language = useUiStore.getState()?.language;
        if (language) {
          if (config.headers?.set) {
            config.headers.set('Accept-Language', language);
          } else {
            config.headers = config.headers || {};
            config.headers['Accept-Language'] = language;
          }
        }

        return config;
      },
      (error) => Promise.reject(this.normalizeError(error))
    );

    this.client.interceptors.response.use(
      (response) => response.data,
      async (error) => {
        const originalRequest = error.config;

        if (!error.response || error.response.status !== 401 || originalRequest?._retry) {
          return Promise.reject(this.normalizeError(error));
        }

        if (originalRequest.url?.includes('/auth/token/refresh')) {
          useAuthStore.getState().clearSession();
          return Promise.reject(this.normalizeError(error));
        }

        if (this.isRefreshing) {
          return new Promise((resolve, reject) => {
            this.failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              if (originalRequest.headers?.set) {
                originalRequest.headers.set('Authorization', `Bearer ${token}`);
              } else {
                originalRequest.headers = originalRequest.headers || {};
                originalRequest.headers.Authorization = `Bearer ${token}`;
              }
              return this.client(originalRequest);
            })
            .catch((err) => Promise.reject(this.normalizeError(err)));
        }

        originalRequest._retry = true;
        this.isRefreshing = true;

        const { refreshToken } = useAuthStore.getState();

        if (!refreshToken) {
          const apiError = this.normalizeError(error);
          this.processQueue(apiError, null);
          useAuthStore.getState().clearSession();
          this.isRefreshing = false;
          return Promise.reject(apiError);
        }

        try {
          const refreshResponse = await axios.post(
            `${env.VITE_API_BASE_URL}/auth/token/refresh`,
            { refreshToken },
            { headers: { 'Content-Type': 'application/json' } }
          );

          const payload = refreshResponse.data?.data || refreshResponse.data;
          const newAccessToken = payload?.accessToken;
          const newRefreshToken = payload?.refreshToken || refreshToken;

          if (!newAccessToken) {
            throw new Error('Refresh token rotation failed to return a new access token.');
          }

          useAuthStore.getState().updateTokens({
            accessToken: newAccessToken,
            refreshToken: newRefreshToken
          });

          this.processQueue(null, newAccessToken);

          if (originalRequest.headers?.set) {
            originalRequest.headers.set('Authorization', `Bearer ${newAccessToken}`);
          } else {
            originalRequest.headers = originalRequest.headers || {};
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          }

          return this.client(originalRequest);
        } catch (refreshError) {
          const normalizedRefreshError = this.normalizeError(refreshError);
          this.processQueue(normalizedRefreshError, null);
          useAuthStore.getState().clearSession();
          return Promise.reject(normalizedRefreshError);
        } finally {
          this.isRefreshing = false;
        }
      }
    );
  }

  async get(url, config = {}) {
    return this.client.get(url, config);
  }

  async post(url, data = {}, config = {}) {
    return this.client.post(url, data, config);
  }

  async put(url, data = {}, config = {}) {
    return this.client.put(url, data, config);
  }

  async patch(url, data = {}, config = {}) {
    return this.client.patch(url, data, config);
  }

  async delete(url, config = {}) {
    return this.client.delete(url, config);
  }
}

export default AxiosHttpClient;
