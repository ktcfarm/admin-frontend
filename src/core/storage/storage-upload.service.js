import axios from 'axios';
import { httpClient } from '../http/http.factory.js';

export class StorageUploadService {
  constructor(client = httpClient) {
    this.httpClient = client;
  }

  async uploadFile({ file, purpose, expiresInSeconds = 3600 }) {
    if (!file) {
      throw new Error('A file must be provided for upload');
    }

    if (!purpose) {
      throw new Error('A purpose must be specified for file upload');
    }

    const response = await this.httpClient.post('/storage/presign-upload', {
      purpose,
      contentType: file.type,
      fileName: file.name,
      expiresInSeconds
    });

    const target = response?.data || response;
    const { uploadUrl, key, bucketType } = target;

    if (!uploadUrl) {
      throw new Error('Upload URL was not returned by storage presign service');
    }

    await axios.put(uploadUrl, file, {
      headers: {
        'Content-Type': file.type
      }
    });

    return { key, bucketType };
  }
}

export const storageUploadService = new StorageUploadService();
export default storageUploadService;
