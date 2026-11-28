import { httpClient } from '../../../core/http/http.factory.js';

export const dashboardApi = {
  getSummary: async ({ hubId } = {}) => {
    const params = hubId ? { hubId } : {};
    const res = await httpClient.get('/dashboard/summary', { params });
    return res?.data ?? res;
  }
};

export default dashboardApi;
