const mongoose = require('mongoose');

const idsLogSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    attackType: {
      type: String,
      enum: ['BRUTE_FORCE', 'SQL_INJECTION', 'XSS', 'DIRECTORY_TRAVERSAL', 'PORT_SCAN', 'RATE_LIMIT', 'UNKNOWN'],
      required: true,
    },
    ipAddress: { type: String, required: true },
    userAgent: { type: String },
    requestUrl: { type: String },
    requestMethod: { type: String },
    payload: { type: String }, // Sanitized snippet of the malicious payload
    severity: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], required: true },
    blocked: { type: Boolean, default: false },
    details: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('IdsLog', idsLogSchema);
