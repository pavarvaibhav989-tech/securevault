const { generateRSAKeyPair, signData, verifySignature, rsaEncrypt, rsaDecrypt } = require('../utils/crypto/rsaUtils');
const crypto = require('crypto');

// POST /api/rsa/generate-keys
exports.generateKeys = async (req, res) => {
  try {
    const { keySize } = req.body;
    const start = Date.now();
    const { publicKey, privateKey } = generateRSAKeyPair(keySize ? parseInt(keySize) : 2048);
    const genTime = Date.now() - start;
    res.json({
      success: true,
      data: { publicKey, privateKey, keySize: keySize || 2048, algorithm: 'RSA', generationTime: genTime },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/rsa/sign
exports.sign = async (req, res) => {
  try {
    const { privateKey, message, textData } = req.body;
    const data = message || textData;
    if (!privateKey) return res.status(400).json({ success: false, message: 'Private key required.' });
    if (!data) return res.status(400).json({ success: false, message: 'Provide message to sign.' });

    const start = Date.now();
    const signature = signData(data, privateKey);
    const signTime = Date.now() - start;

    res.json({
      success: true,
      data: {
        signature,
        algorithm: 'SHA256withRSA',
        signatureLength: signature.length,
        signingTime: signTime,
        dataHash: crypto.createHash('sha256').update(data).digest('hex'),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/rsa/verify
exports.verify = async (req, res) => {
  try {
    const { publicKey, signature, message, textData } = req.body;
    const data = message || textData;
    if (!publicKey || !signature) {
      return res.status(400).json({ success: false, message: 'Public key and signature required.' });
    }
    if (!data) return res.status(400).json({ success: false, message: 'Provide message to verify.' });

    const start = Date.now();
    const isValid = verifySignature(data, signature, publicKey);
    const verifyTime = Date.now() - start;

    res.json({
      success: true,
      data: {
        isValid,
        valid: isValid,
        verificationTime: verifyTime,
        message: isValid
          ? 'Signature is VALID - document is authentic and untampered.'
          : 'Signature is INVALID - document may have been tampered with.',
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/rsa/encrypt
exports.encrypt = async (req, res) => {
  try {
    const { publicKey, message } = req.body;
    if (!publicKey || !message) return res.status(400).json({ success: false, message: 'Public key and message required.' });
    const ciphertext = rsaEncrypt(message, publicKey);
    res.json({ success: true, data: { ciphertext } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/rsa/decrypt
exports.decrypt = async (req, res) => {
  try {
    const { privateKey, ciphertext } = req.body;
    if (!privateKey || !ciphertext) return res.status(400).json({ success: false, message: 'Private key and ciphertext required.' });
    const plaintext = rsaDecrypt(ciphertext, privateKey);
    res.json({ success: true, data: { plaintext } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/rsa/diffie-hellman
exports.diffiHellmanDemo = (req, res) => {
  const p = 23n;
  const g = 5n;
  const alicePrivate = BigInt(Math.floor(Math.random() * 15) + 3);
  const bobPrivate = BigInt(Math.floor(Math.random() * 15) + 3);
  const alicePublic = (g ** alicePrivate) % p;
  const bobPublic = (g ** bobPrivate) % p;
  const aliceShared = (bobPublic ** alicePrivate) % p;
  const bobShared = (alicePublic ** bobPrivate) % p;

  res.json({
    success: true,
    data: {
      publicParams: { prime_p: p.toString(), generator_g: g.toString() },
      alice: { privateKey: alicePrivate.toString(), publicKey: alicePublic.toString(), sharedSecret: aliceShared.toString() },
      bob: { privateKey: bobPrivate.toString(), publicKey: bobPublic.toString(), sharedSecret: bobShared.toString() },
      sharedSecretMatch: aliceShared === bobShared,
    },
  });
};
