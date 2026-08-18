const mongoose = require('mongoose');

const firewallRuleSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    type: { type: String, enum: ['IP', 'PORT', 'PROTOCOL', 'CUSTOM'], required: true },
    protocol: { type: String, enum: ['TCP', 'UDP', 'ICMP', 'ANY'], default: 'ANY' },
    port: { type: String }, // e.g. "80", "443", "1-1024"
    ipAddress: { type: String },
    direction: { type: String, enum: ['INBOUND', 'OUTBOUND', 'BOTH'], default: 'INBOUND' },
    action: { type: String, enum: ['ALLOW', 'BLOCK', 'DROP'], required: true },
    priority: { type: Number, default: 100 },
    enabled: { type: Boolean, default: true },
    description: { type: String },
    hitCount: { type: Number, default: 0 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('FirewallRule', firewallRuleSchema);
