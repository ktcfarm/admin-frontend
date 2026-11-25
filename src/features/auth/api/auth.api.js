import { httpClient } from '../../../core/http/http.factory.js';

export const authApi = {
  loginWithPin: async ({ identifier, pin, targetRole }) => {
    const res = await httpClient.post('/auth/login/pin', { identifier, pin, targetRole });
    return res?.data ?? res;
  },

  sendOtp: async ({ identifier, channel = 'EMAIL', purpose = 'LOGIN' }) => {
    const res = await httpClient.post('/auth/otp/send', { identifier, channel, purpose });
    return res?.data ?? res;
  },

  loginWithOtp: async ({ identifier, otp, targetRole }) => {
    const res = await httpClient.post('/auth/login/otp', { identifier, otp, targetRole });
    return res?.data ?? res;
  },

  resetPin: async ({ identifier, otp, newPin }) => {
    const res = await httpClient.post('/auth/pin/reset', { identifier, otp, newPin });
    return res?.data ?? res;
  },

  getMe: async () => {
    const res = await httpClient.get('/auth/me');
    return res?.data ?? res;
  },

  logout: async () => {
    const res = await httpClient.post('/auth/logout');
    return res?.data ?? res;
  }
};

export default authApi;
