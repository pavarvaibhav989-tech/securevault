const mongoose = require('mongoose');

const loginHistorySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    ipAddress: { type: String },
    userAgent: { type: String },
    browser: { type: String },
    os: { type: String },
    status: { type: String, enum: ['SUCCESS', 'FAILED', 'LOCKED'], required: true },
    failReason: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('LoginHistory', loginHistorySchema);
