const mongoose = require('mongoose');

const hashHistorySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    algorithm: { type: String, required: true },
    inputType: { type: String, enum: ['text', 'file'], default: 'text' },
    originalText: { type: String },
    hashValue: { type: String, required: true },
    hashLength: { type: Number },
    executionTime: { type: Number }, // milliseconds
  },
  { timestamps: true }
);

module.exports = mongoose.model('HashHistory', hashHistorySchema);
