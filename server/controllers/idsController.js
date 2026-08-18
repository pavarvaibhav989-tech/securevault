const IdsLog = require('../models/IdsLog');
const { detectAttackType } = require('../utils/ids/idsEngine');

// GET /api/ids/logs
exports.getLogs = async (req, res) => {
  try {
    const { severity, attackType, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (severity) filter.severity = severity;
    if (attackType) filter.attackType = attackType;

    const logs = await IdsLog.find(filter)
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await IdsLog.countDocuments(filter);
    res.json({ success: true, data: logs, total, page: parseInt(page) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/ids/detect – Manual attack simulation
exports.detectAttack = async (req, res) => {
  try {
    const { payload, attackType, ipAddress } = req.body;

    let detected;
    if (attackType) {
      // Manual entry (admin simulation)
      detected = { type: attackType, severity: 'HIGH' };
    } else if (payload) {
      detected = detectAttackType(payload);
    }

    if (!detected) {
      return res.json({ success: true, data: { detected: false, message: 'No threat detected in payload.' } });
    }

    const log = await IdsLog.create({
      userId: req.user._id,
      attackType: detected.type,
      ipAddress: ipAddress || req.ip,
      severity: detected.severity,
      payload: typeof payload === 'string' ? payload.substring(0, 200) : JSON.stringify(payload).substring(0, 200),
      blocked: true,
      requestUrl: req.originalUrl,
      requestMethod: 'SIMULATION',
    });

    // Real-time alert
    if (req.app.get('io')) {
      req.app.get('io').to('admin-room').emit('ids-alert', {
        type: detected.type,
        severity: detected.severity,
        ip: ipAddress || req.ip,
        timestamp: new Date(),
      });
    }

    res.json({ success: true, data: { detected: true, ...detected, logId: log._id } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/ids/stats
exports.getStats = async (req, res) => {
  try {
    const total = await IdsLog.countDocuments();
    const blocked = await IdsLog.countDocuments({ blocked: true });
    const bySeverity = await IdsLog.aggregate([
      { $group: { _id: '$severity', count: { $sum: 1 } } },
    ]);
    const byType = await IdsLog.aggregate([
      { $group: { _id: '$attackType', count: { $sum: 1 } } },
    ]);
    const recent = await IdsLog.find().sort({ createdAt: -1 }).limit(5);

    res.json({
      success: true,
      data: { total, blocked, bySeverity, byType, recent },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/ids/logs/:id
exports.deleteLog = async (req, res) => {
  try {
    await IdsLog.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Log deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
