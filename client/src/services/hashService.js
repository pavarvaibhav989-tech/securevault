import API from './api';

export const hashService = {
  generateHash: (formData) => API.post('/hash/generate', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  // Backend expects: { text, expectedHash, algorithm }
  verifyHash: (data) => API.post('/hash/verify', {
    text: data.text,
    expectedHash: data.hash || data.expectedHash,
    algorithm: data.algo || data.algorithm || 'SHA256',
  }),
  avalancheDemo: (data) => API.post('/hash/avalanche', data),
  birthdayAttack: (data) => API.post('/hash/birthday', data),
  getHistory: () => API.get('/hash/history'),
  // aliases
  generate: (formData) => API.post('/hash/generate', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  verify: (data) => API.post('/hash/verify', {
    text: data.text,
    expectedHash: data.hash || data.expectedHash,
    algorithm: data.algo || data.algorithm || 'SHA256',
  }),
  avalanche: (data) => API.post('/hash/avalanche', data),
};
