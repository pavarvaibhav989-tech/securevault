const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const multer = require('multer');
const { encrypt, decrypt } = require('../utils/crypto/cryptoUtils');
const EncryptedFile = require('../models/EncryptedFile');

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../uploads')),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB

// POST /api/encryption/encrypt
exports.encryptFile = [
  upload.single('file'),
  async (req, res) => {
    try {
      const { algorithm, key } = req.body;
      if (!req.file || !algorithm || !key) {
        return res.status(400).json({ success: false, message: 'File, algorithm, and key are required.' });
      }

      const fileData = fs.readFileSync(req.file.path);
      const start = Date.now();
      const result = encrypt(fileData, key, algorithm);
      const encTime = Date.now() - start;

      // Save encrypted file
      const encFileName = `enc_${Date.now()}_${req.file.originalname}.enc`;
      const encFilePath = path.join(__dirname, '../uploads', encFileName);
      fs.writeFileSync(encFilePath, JSON.stringify({ iv: result.iv, data: result.encryptedData }));

      // Remove original
      fs.unlinkSync(req.file.path);

      const keyHash = crypto.createHash('sha256').update(key).digest('hex');

      const record = await EncryptedFile.create({
        userId: req.user._id,
        originalName: req.file.originalname,
        encryptedFilename: encFileName,
        algorithm,
        keyHash,
        iv: result.iv || '',
        fileSize: req.file.size,
        encryptionTime: encTime,
        mimeType: req.file.mimetype,
      });

      res.json({
        success: true,
        message: 'File encrypted successfully.',
        data: {
          fileId: record._id,
          encryptedFilename: encFileName,
          algorithm,
          keyLength: result.keyLength,
          encryptionTime: encTime,
          fileSize: req.file.size,
          iv: result.iv,
        },
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },
];

// POST /api/encryption/decrypt
exports.decryptFile = async (req, res) => {
  try {
    const { fileId, key } = req.body;
    const record = await EncryptedFile.findById(fileId);
    if (!record) return res.status(404).json({ success: false, message: 'File not found.' });
    if (record.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    const keyHash = crypto.createHash('sha256').update(key).digest('hex');
    if (keyHash !== record.keyHash) {
      return res.status(400).json({ success: false, message: 'Incorrect decryption key.' });
    }

    const encFilePath = path.join(__dirname, '../uploads', record.encryptedFilename);
    const { iv, data } = JSON.parse(fs.readFileSync(encFilePath, 'utf8'));
    const decrypted = decrypt(data, key, record.algorithm, iv);

    res.setHeader('Content-Disposition', `attachment; filename="${record.originalName}"`);
    res.setHeader('Content-Type', record.mimeType || 'application/octet-stream');
    res.send(decrypted);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/encryption/files
exports.listFiles = async (req, res) => {
  try {
    const files = await EncryptedFile.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, data: files });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/encryption/files/:id
exports.deleteFile = async (req, res) => {
  try {
    const record = await EncryptedFile.findById(req.params.id);
    if (!record) return res.status(404).json({ success: false, message: 'File not found.' });
    if (record.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    const encFilePath = path.join(__dirname, '../uploads', record.encryptedFilename);
    if (fs.existsSync(encFilePath)) fs.unlinkSync(encFilePath);

    await record.deleteOne();
    res.json({ success: true, message: 'File deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.upload = upload;
