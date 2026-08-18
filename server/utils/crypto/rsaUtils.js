/**
 * RSA Utility – Key generation, signing, and verification using Node.js crypto
 */
const crypto = require('crypto');

/**
 * Generate RSA key pair (2048-bit)
 */
const generateRSAKeyPair = (modulusLength = 2048) => {
  const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength,
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
  });
  return { publicKey, privateKey };
};

/**
 * Sign data with private key using SHA-256
 */
const signData = (data, privateKeyPem) => {
  const sign = crypto.createSign('SHA256');
  sign.update(typeof data === 'string' ? data : data.toString());
  sign.end();
  const signature = sign.sign(privateKeyPem, 'base64');
  return signature;
};

/**
 * Verify signature with public key
 */
const verifySignature = (data, signature, publicKeyPem) => {
  try {
    const verify = crypto.createVerify('SHA256');
    verify.update(typeof data === 'string' ? data : data.toString());
    verify.end();
    return verify.verify(publicKeyPem, signature, 'base64');
  } catch (err) {
    return false;
  }
};

/**
 * RSA Encrypt (public key) – for small data only
 */
const rsaEncrypt = (data, publicKeyPem) => {
  const buffer = Buffer.from(data);
  const encrypted = crypto.publicEncrypt(publicKeyPem, buffer);
  return encrypted.toString('base64');
};

/**
 * RSA Decrypt (private key)
 */
const rsaDecrypt = (encryptedData, privateKeyPem) => {
  const buffer = Buffer.from(encryptedData, 'base64');
  const decrypted = crypto.privateDecrypt(privateKeyPem, buffer);
  return decrypted.toString();
};

module.exports = { generateRSAKeyPair, signData, verifySignature, rsaEncrypt, rsaDecrypt };
