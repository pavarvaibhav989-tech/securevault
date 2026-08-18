const { generateHash, generateHMAC, generateTigerHash, demonstrateAvalanche, verifyHash } = require('../utils/hash/hashUtils');
const HashHistory = require('../models/HashHistory');
const multer = require('multer');
const path = require('path');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

// POST /api/hash/generate
exports.generateHashEndpoint = [
  upload.single('file'),
  async (req, res) => {
    try {
      const { text, algorithm = 'SHA256', hmacSecret } = req.body;

      let input;
      let inputType = 'text';

      if (req.file) {
        input = req.file.buffer;
        inputType = 'file';
      } else if (text) {
        input = text;
      } else {
        return res.status(400).json({ success: false, message: 'Provide text or file.' });
      }

      let result;
      if (algorithm === 'Tiger') {
        result = generateTigerHash(input);
      } else if (algorithm.startsWith('HMAC')) {
        if (!hmacSecret) return res.status(400).json({ success: false, message: 'HMAC requires a secret key.' });
        result = generateHMAC(input, hmacSecret, algorithm.replace('HMAC-', '').toLowerCase());
      } else {
        result = generateHash(input, algorithm);
      }

      // Save to DB if user is logged in
      if (req.user) {
        await HashHistory.create({
          userId: req.user._id,
          algorithm: result.algorithm,
          inputType,
          originalText: inputType === 'text' ? (typeof text === 'string' ? text.substring(0, 200) : null) : `[File: ${req.file?.originalname}]`,
          hashValue: result.hashValue,
          hashLength: result.hashLength,
          executionTime: result.executionTime,
        });
      }

      res.json({ success: true, data: result });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },
];

// POST /api/hash/verify
exports.verifyHashEndpoint = async (req, res) => {
  try {
    const { text, expectedHash, algorithm } = req.body;
    const isMatch = verifyHash(text, expectedHash, algorithm);
    res.json({ success: true, data: { isMatch, algorithm } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/hash/avalanche
exports.avalancheDemo = async (req, res) => {
  try {
    const { text, algorithm = 'SHA256' } = req.body;
    if (!text) return res.status(400).json({ success: false, message: 'Text is required.' });
    const result = demonstrateAvalanche(text, algorithm);
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/hash/history
exports.getHashHistory = async (req, res) => {
  try {
    const history = await HashHistory.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(50);
    res.json({ success: true, data: history });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/hash/birthday
exports.birthdayAttack = async (req, res) => {
  try {
    const { algorithm = 'MD5', sampleSize = 1000 } = req.body;
    const crypto = require('crypto');

    const limit = Math.min(parseInt(sampleSize) || 1000, 50000);
    const seen = new Map();
    let collisionsFound = 0;
    let collision = null;

    const algoMap = { MD5: 'md5', SHA256: 'sha256', SHA512: 'sha512' };
    const hashAlgo = algoMap[algorithm] || 'md5';

    // Use prefix of hash to artificially increase collision chance for demo
    const prefixLen = algorithm === 'MD5' ? 8 : algorithm === 'SHA256' ? 10 : 12;

    for (let i = 0; i < limit; i++) {
      const msg = `msg_${Math.random().toString(36).slice(2)}_${i}`;
      const fullHash = crypto.createHash(hashAlgo).update(msg).digest('hex');
      const prefix = fullHash.slice(0, prefixLen);

      if (seen.has(prefix) && !collision) {
        collisionsFound++;
        collision = {
          messageA: seen.get(prefix).msg,
          messageB: msg,
          hash: prefix + '... (prefix collision)',
          fullHashA: seen.get(prefix).hash,
          fullHashB: fullHash,
        };
      } else {
        seen.set(prefix, { msg, hash: fullHash });
      }
    }

    res.json({
      success: true,
      data: {
        algorithm,
        hashesComputed: limit,
        collisionsFound,
        collision,
        note: `Using ${prefixLen}-hex-char prefix for demo collision detection. Real birthday attacks target full hash outputs.`,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
