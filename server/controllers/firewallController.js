const FirewallRule = require('../models/FirewallRule');
const { evaluatePacket, getDefaultRules } = require('../utils/firewall/firewallEngine');
const IdsLog = require('../models/IdsLog');

// GET /api/firewall/rules
exports.getRules = async (req, res) => {
  try {
    const rules = await FirewallRule.find().sort({ priority: 1 });
    res.json({ success: true, data: rules, count: rules.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/firewall/rules
exports.addRule = async (req, res) => {
  try {
    const rule = await FirewallRule.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json({ success: true, message: 'Rule created.', data: rule });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/firewall/rules/:id
exports.updateRule = async (req, res) => {
  try {
    const rule = await FirewallRule.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!rule) return res.status(404).json({ success: false, message: 'Rule not found.' });
    res.json({ success: true, data: rule });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/firewall/rules/:id
exports.deleteRule = async (req, res) => {
  try {
    await FirewallRule.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Rule deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/firewall/simulate
exports.simulatePacket = async (req, res) => {
  try {
    const { sourceIP, destinationIP, port, protocol } = req.body;
    if (!sourceIP || !port || !protocol) {
      return res.status(400).json({ success: false, message: 'sourceIP, port, protocol required.' });
    }

    const rules = await FirewallRule.find({ enabled: true }).sort({ priority: 1 });
    const ruleDocs = rules.length > 0 ? rules : getDefaultRules();

    const result = evaluatePacket({ sourceIP, destinationIP, port: parseInt(port), protocol }, ruleDocs);

    // Log BLOCK/DROP to IDS
    if (result.decision !== 'ALLOW') {
      await IdsLog.create({
        userId: req.user._id,
        attackType: 'UNKNOWN',
        ipAddress: sourceIP,
        requestUrl: `${protocol}:${destinationIP}:${port}`,
        severity: 'LOW',
        blocked: true,
        details: `Firewall ${result.decision}: ${result.note || result.matchedRule?.name}`,
      });
    }

    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/firewall/seed-defaults
exports.seedDefaults = async (req, res) => {
  try {
    const existing = await FirewallRule.countDocuments();
    if (existing > 0) return res.json({ success: false, message: 'Rules already exist.' });
    const defaults = getDefaultRules().map((r) => ({ ...r, createdBy: req.user._id }));
    await FirewallRule.insertMany(defaults);
    res.json({ success: true, message: 'Default rules seeded.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
