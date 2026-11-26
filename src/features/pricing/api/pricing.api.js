import { httpClient } from '../../../core/http/http.factory.js';

export const pricingApi = {
  listRates: async (params = {}) => {
    const res = await httpClient.get('/pricing/rates', { params });
    return {
      items: res?.data ?? [],
      meta: res?.meta ?? {
        page: params.page || 1,
        limit: params.limit || 10,
        total: 0,
        totalPages: 1
      }
    };
  },

  getRateById: async (id) => {
    const res = await httpClient.get(`/pricing/rates/${id}`);
    return res?.data ?? res;
  },

  resolveRate: async (params = {}) => {
    const res = await httpClient.get('/pricing/resolve', { params });
    return res?.data ?? res;
  },

  createRate: async (payload) => {
    const res = await httpClient.post('/pricing/rates', payload);
    return res?.data ?? res;
  },

  updateRate: async (id, payload) => {
    const res = await httpClient.patch(`/pricing/rates/${id}`, payload);
    return res?.data ?? res;
  },

  updateRateStatus: async (id, status) => {
    const res = await httpClient.patch(`/pricing/rates/${id}/status`, { status });
    return res?.data ?? res;
  },

  bulkUpsertRates: async (items) => {
    const res = await httpClient.post('/pricing/rates/bulk-upsert', { items });
    return res?.data ?? [];
  },

  listCategoryOptions: async () => {
    const res = await httpClient.get('/catalog/categories', {
      params: { page: 1, limit: 100, isActive: 'true', sortBy: 'displayOrder', sortOrder: 'asc' }
    });
    return res?.data ?? [];
  },

  listCropOptions: async (categoryId = '') => {
    const res = await httpClient.get('/catalog/crops', {
      params: {
        page: 1,
        limit: 100,
        isActive: 'true',
        ...(categoryId ? { categoryId } : {})
      }
    });
    return res?.data ?? [];
  },

  listVarietyOptions: async () => {
    const res = await httpClient.get('/catalog/varieties', {
      params: { page: 1, limit: 100, isActive: 'true', sortBy: 'name', sortOrder: 'asc' }
    });
    return res?.data ?? [];
  },

  listHubOptions: async () => {
    const res = await httpClient.get('/hubs', {
      params: { page: 1, limit: 100, isActive: 'true', sortBy: 'name', sortOrder: 'asc' }
    });
    return res?.data ?? [];
  }
};

export default pricingApi;
