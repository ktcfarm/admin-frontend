import { httpClient } from '../../../core/http/http.factory.js';
import { storageUploadService } from '../../../core/storage/storage-upload.service.js';

export const catalogApi = {
  getMetadata: async () => {
    const res = await httpClient.get('/catalog/meta');
    return res?.data ?? res;
  },

  uploadCatalogPhoto: async (file) => {
    const { key, bucketType } = await storageUploadService.uploadFile({
      file,
      purpose: 'CROP_PHOTO'
    });
    const accessRes = await httpClient.get('/storage/access-url', {
      params: { key, bucketType }
    });
    const accessData = accessRes?.data ?? accessRes;
    return {
      key,
      bucketType,
      imageUrl: accessData?.accessUrl || ''
    };
  },

  listCategories: async (params = {}) => {
    const res = await httpClient.get('/catalog/categories', { params });
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

  getCategoryById: async (id) => {
    const res = await httpClient.get(`/catalog/categories/${id}`);
    return res?.data ?? res;
  },

  createCategory: async (payload) => {
    const res = await httpClient.post('/catalog/categories', payload);
    return res?.data ?? res;
  },

  updateCategory: async (id, payload) => {
    const res = await httpClient.patch(`/catalog/categories/${id}`, payload);
    return res?.data ?? res;
  },

  deleteCategory: async (id) => {
    const res = await httpClient.delete(`/catalog/categories/${id}`);
    return res?.data ?? res;
  },

  listCrops: async (params = {}) => {
    const res = await httpClient.get('/catalog/crops', { params });
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

  getCropById: async (id) => {
    const res = await httpClient.get(`/catalog/crops/${id}`);
    return res?.data ?? res;
  },

  createCrop: async (payload) => {
    const res = await httpClient.post('/catalog/crops', payload);
    return res?.data ?? res;
  },

  updateCrop: async (id, payload) => {
    const res = await httpClient.patch(`/catalog/crops/${id}`, payload);
    return res?.data ?? res;
  },

  deleteCrop: async (id) => {
    const res = await httpClient.delete(`/catalog/crops/${id}`);
    return res?.data ?? res;
  },

  listVarieties: async (params = {}) => {
    const res = await httpClient.get('/catalog/varieties', { params });
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

  getVarietyById: async (id) => {
    const res = await httpClient.get(`/catalog/varieties/${id}`);
    return res?.data ?? res;
  },

  createVariety: async (payload) => {
    const res = await httpClient.post('/catalog/varieties', payload);
    return res?.data ?? res;
  },

  updateVariety: async (id, payload) => {
    const res = await httpClient.patch(`/catalog/varieties/${id}`, payload);
    return res?.data ?? res;
  },

  deleteVariety: async (id) => {
    const res = await httpClient.delete(`/catalog/varieties/${id}`);
    return res?.data ?? res;
  }
};

export default catalogApi;
