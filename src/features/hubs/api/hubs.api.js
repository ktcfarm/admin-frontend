import { httpClient } from '../../../core/http/http.factory.js';
import { storageUploadService } from '../../../core/storage/storage-upload.service.js';

export const hubsApi = {
  listHubs: async (params = {}) => {
    const res = await httpClient.get('/hubs', { params });
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

  getHubById: async (hubId) => {
    const res = await httpClient.get(`/hubs/${hubId}`);
    return res?.data ?? res;
  },

  createHub: async (payload) => {
    const res = await httpClient.post('/hubs', payload);
    return res?.data ?? res;
  },

  updateHub: async (hubId, payload) => {
    const res = await httpClient.patch(`/hubs/${hubId}`, payload);
    return res?.data ?? res;
  },

  getHubStaff: async (hubId) => {
    const res = await httpClient.get(`/hubs/${hubId}/staff`);
    return res?.data ?? [];
  },

  assignStaff: async (hubId, payload) => {
    const res = await httpClient.post(`/hubs/${hubId}/staff`, payload);
    return res?.data ?? res;
  },

  removeStaff: async (hubId, staffId) => {
    const res = await httpClient.delete(`/hubs/${hubId}/staff/${staffId}`);
    return res?.data ?? res;
  },

  searchStaffCandidates: async ({ search, limit = 10 }) => {
    const res = await httpClient.get('/hubs/staff-candidates', {
      params: { search, limit }
    });
    return res?.data ?? [];
  },

  upsertFranchiseProfile: async (hubId, payload) => {
    const res = await httpClient.put(`/hubs/${hubId}/franchise`, payload);
    return res?.data ?? res;
  },

  uploadDocumentAsset: async ({ file, bucketType = 'PRIVATE' }) => {
    const purpose = bucketType === 'PUBLIC' ? 'HUB_PHOTO' : 'HUB_DOCUMENT';
    return storageUploadService.uploadFile({ file, purpose });
  },

  registerHubDocument: async (hubId, payload) => {
    const res = await httpClient.post(`/hubs/${hubId}/documents`, payload);
    return res?.data ?? res;
  },

  verifyHubDocument: async (hubId, docId, payload) => {
    const res = await httpClient.patch(`/hubs/${hubId}/documents/${docId}/verify`, payload);
    return res?.data ?? res;
  },

  getHubDocumentUrl: async (hubId, docId) => {
    const res = await httpClient.get(`/hubs/${hubId}/documents/${docId}/url`);
    return res?.data ?? res;
  },

  updateOnboardingStatus: async (hubId, payload) => {
    const res = await httpClient.patch(`/hubs/${hubId}/onboarding-status`, payload);
    return res?.data ?? res;
  }
};

export default hubsApi;
