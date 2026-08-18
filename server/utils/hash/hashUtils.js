/**
 * Hash Utility – SHA-256, SHA-512, MD5, HMAC using Node.js crypto
 */
const crypto = require('crypto');

const ALGORITHMS = {
  SHA256: 'sha256',
  SHA512: 'sha512',
  MD5: 'md5',
};

/**
 * Generate hash for text or Buffer
 */
const generateHash = (input, algorithm) => {
  const start = Date.now();
  const alg = ALGORITHMS[algorithm] || algorithm.toLowerCase();
  const hash = crypto.createHash(alg).update(input).digest('hex');
  return {
    algorithm,
    hashValue: hash,
    hashLength: hash.length,
    executionTime: Date.now() - start,
  };
};

/**
 * Generate HMAC
 */
const generateHMAC = (input, secret, algorithm = 'sha256') => {
  const start = Date.now();
  const hmac = crypto.createHmac(algorithm, secret).update(input).digest('hex');
  return {
    algorithm: `HMAC-${algorithm.toUpperCase()}`,
    hashValue: hmac,
    hashLength: hmac.length,
    executionTime: Date.now() - start,
  };
};

/**
 * Tiger Hash – conceptual demo (simulated using SHA-512 with Tiger notation)
 */
const generateTigerHash = (input) => {
  const start = Date.now();
  // Tiger produces 192-bit (48 hex char) output – we simulate by truncating SHA-512
  const sha = crypto.createHash('sha512').update(input).digest('hex');
  const tigerHex = sha.substring(0, 48);
  return {
    algorithm: 'Tiger (Conceptual Demo)',
    hashValue: tigerHex,
    hashLength: tigerHex.length,
    executionTime: Date.now() - start,
    note: 'Simulated via SHA-512 truncation for educational purposes',
  };
};

/**
 * Demonstrate avalanche effect – one-bit difference in input
 */
const demonstrateAvalanche = (input, algorithm = 'SHA256') => {
  const hash1 = generateHash(input, algorithm);
  // Flip the last character
  const alteredInput = input.slice(0, -1) + (input.slice(-1) === 'a' ? 'b' : 'a');
  const hash2 = generateHash(alteredInput, algorithm);

  let diffBits = 0;
  const h1 = hash1.hashValue;
  const h2 = hash2.hashValue;
  for (let i = 0; i < h1.length; i++) {
    const xor = parseInt(h1[i], 16) ^ parseInt(h2[i], 16);
    diffBits += xor.toString(2).split('1').length - 1;
  }
  const totalBits = h1.length * 4;
  const percentage = ((diffBits / totalBits) * 100).toFixed(2);

  return {
    original: { input, hash: h1 },
    altered: { input: alteredInput, hash: h2 },
    diffBits,
    totalBits,
    percentage,
  };
};

/**
 * Verify a hash
 */
const verifyHash = (input, expectedHash, algorithm) => {
  const { hashValue } = generateHash(input, algorithm);
  return hashValue === expectedHash.toLowerCase();
};

module.exports = { generateHash, generateHMAC, generateTigerHash, demonstrateAvalanche, verifyHash };
