import API from './api';

export const rsaService = {
  // Pass keySize in body; backend accepts it now
  generateKeys: (keySize) => API.post('/rsa/generate-keys', { keySize }),
  // All endpoints now accept JSON body
  sign: (data) => API.post('/rsa/sign', data),
  verify: (data) => API.post('/rsa/verify', data),
  encrypt: (data) => API.post('/rsa/encrypt', data),
  decrypt: (data) => API.post('/rsa/decrypt', data),
  diffiHellmanDemo: () => API.get('/rsa/diffie-hellman'),
};
