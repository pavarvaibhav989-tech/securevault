/**
 * Cryptography Utilities
 * AES, DES, Triple-DES, Blowfish, RC4 using Node.js crypto + CryptoJS
 */
const crypto = require('crypto');
const CryptoJS = require('crypto-js');

// ─────────────────────────────────────────────────────────────────────────────
// AES (Node.js crypto – AES-256-CBC)
// ─────────────────────────────────────────────────────────────────────────────
const aesEncrypt = (data, key) => {
  const iv = crypto.randomBytes(16);
  const keyBuffer = crypto.createHash('sha256').update(key).digest();
  const cipher = crypto.createCipheriv('aes-256-cbc', keyBuffer, iv);
  const encrypted = Buffer.concat([cipher.update(data), cipher.final()]);
  return {
    iv: iv.toString('hex'),
    encryptedData: encrypted.toString('hex'),
    algorithm: 'AES-256-CBC',
    keyLength: 256,
  };
};

const aesDecrypt = (encryptedData, key, iv) => {
  const keyBuffer = crypto.createHash('sha256').update(key).digest();
  const decipher = crypto.createDecipheriv('aes-256-cbc', keyBuffer, Buffer.from(iv, 'hex'));
  const decrypted = Buffer.concat([decipher.update(Buffer.from(encryptedData, 'hex')), decipher.final()]);
  return decrypted;
};

// ─────────────────────────────────────────────────────────────────────────────
// DES (CryptoJS)
// ─────────────────────────────────────────────────────────────────────────────
const desEncrypt = (text, key) => {
  const encrypted = CryptoJS.DES.encrypt(text, key);
  return { encryptedData: encrypted.toString(), algorithm: 'DES', keyLength: 56 };
};

const desDecrypt = (cipherText, key) => {
  const decrypted = CryptoJS.DES.decrypt(cipherText, key);
  return decrypted.toString(CryptoJS.enc.Utf8);
};

// ─────────────────────────────────────────────────────────────────────────────
// Triple DES (CryptoJS)
// ─────────────────────────────────────────────────────────────────────────────
const tripleDESEncrypt = (text, key) => {
  const encrypted = CryptoJS.TripleDES.encrypt(text, key);
  return { encryptedData: encrypted.toString(), algorithm: 'Triple-DES', keyLength: 168 };
};

const tripleDESDecrypt = (cipherText, key) => {
  const decrypted = CryptoJS.TripleDES.decrypt(cipherText, key);
  return decrypted.toString(CryptoJS.enc.Utf8);
};

// ─────────────────────────────────────────────────────────────────────────────
// Blowfish (CryptoJS – mapped via Rabbit as closest symmetric cipher available)
// Note: CryptoJS does not have native Blowfish. We use Rabbit as demonstration.
// ─────────────────────────────────────────────────────────────────────────────
const blowfishEncrypt = (text, key) => {
  const encrypted = CryptoJS.Rabbit.encrypt(text, key);
  return { encryptedData: encrypted.toString(), algorithm: 'Blowfish (Rabbit-demo)', keyLength: 128 };
};

const blowfishDecrypt = (cipherText, key) => {
  const decrypted = CryptoJS.Rabbit.decrypt(cipherText, key);
  return decrypted.toString(CryptoJS.enc.Utf8);
};

// ─────────────────────────────────────────────────────────────────────────────
// RC4 (CryptoJS)
// ─────────────────────────────────────────────────────────────────────────────
const rc4Encrypt = (text, key) => {
  const encrypted = CryptoJS.RC4.encrypt(text, key);
  return { encryptedData: encrypted.toString(), algorithm: 'RC4', keyLength: 128 };
};

const rc4Decrypt = (cipherText, key) => {
  const decrypted = CryptoJS.RC4.decrypt(cipherText, key);
  return decrypted.toString(CryptoJS.enc.Utf8);
};

// ─────────────────────────────────────────────────────────────────────────────
// Dispatcher
// ─────────────────────────────────────────────────────────────────────────────
const encrypt = (data, key, algorithm) => {
  const start = Date.now();
  let result;

  if (algorithm === 'AES') {
    result = aesEncrypt(typeof data === 'string' ? Buffer.from(data) : data, key);
  } else if (algorithm === 'DES') {
    result = desEncrypt(typeof data === 'string' ? data : data.toString('base64'), key);
  } else if (algorithm === 'Triple-DES') {
    result = tripleDESEncrypt(typeof data === 'string' ? data : data.toString('base64'), key);
  } else if (algorithm === 'Blowfish') {
    result = blowfishEncrypt(typeof data === 'string' ? data : data.toString('base64'), key);
  } else if (algorithm === 'RC4') {
    result = rc4Encrypt(typeof data === 'string' ? data : data.toString('base64'), key);
  } else {
    throw new Error(`Unsupported algorithm: ${algorithm}`);
  }

  return { ...result, encryptionTime: Date.now() - start };
};

const decrypt = (encryptedData, key, algorithm, iv = null) => {
  if (algorithm === 'AES') return aesDecrypt(encryptedData, key, iv);
  if (algorithm === 'DES') return desDecrypt(encryptedData, key);
  if (algorithm === 'Triple-DES') return tripleDESDecrypt(encryptedData, key);
  if (algorithm === 'Blowfish') return blowfishDecrypt(encryptedData, key);
  if (algorithm === 'RC4') return rc4Decrypt(encryptedData, key);
  throw new Error(`Unsupported algorithm: ${algorithm}`);
};

module.exports = { encrypt, decrypt, aesEncrypt, aesDecrypt };
