const mongoose = require('mongoose');

const encryptedFileSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    originalName: { type: String, required: true },
    encryptedFilename: { type: String, required: true },
    algorithm: { type: String, required: true, enum: ['AES', 'DES', 'Triple-DES', 'Blowfish', 'RC4'] },
    keyHash: { type: String }, // SHA256 of the key (never store raw key)
    iv: { type: String },      // Initialization Vector (hex)
    fileSize: { type: Number },
    encryptionTime: { type: Number }, // milliseconds
    mimeType: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('EncryptedFile', encryptedFileSchema);
