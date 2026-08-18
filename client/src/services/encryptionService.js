import API from './api';

export const encryptionService = {
  // canonical names
  encryptFile: (formData) => API.post('/encryption/encrypt', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  decryptFile: (data) => API.post('/encryption/decrypt', data),
  listFiles: () => API.get('/encryption/files'),
  deleteFile: (id) => API.delete(`/encryption/files/${id}`),
  // aliases used by EncryptionPage
  encrypt: (formData) => API.post('/encryption/encrypt', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  decrypt: (data) => API.post('/encryption/decrypt', data),
};
