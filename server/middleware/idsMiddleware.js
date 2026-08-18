const { analyzeRequest } = require('../utils/ids/idsEngine');
const IdsLog = require('../models/IdsLog');

/**
 * Passive IDS middleware – inspects every request for attack patterns.
 * Logs detections to DB. Does NOT block (alerting only), unless severity is HIGH/CRITICAL.
 */
const idsMiddleware = async (req, res, next) => {
  try {
    const threat = analyzeRequest(req);

    if (threat) {
      const log = await IdsLog.create({
        userId: req.user ? req.user._id : null,
        attackType: threat.type,
        ipAddress: threat.ipAddress,
        userAgent: threat.userAgent,
        requestUrl: threat.requestUrl,
        requestMethod: threat.requestMethod,
        payload: threat.payload,
        severity: threat.severity,
        blocked: threat.severity === 'HIGH' || threat.severity === 'CRITICAL',
      });

      // Emit real-time alert via socket if available
      if (req.app.get('io')) {
        req.app.get('io').to('admin-room').emit('ids-alert', {
          type: threat.type,
          severity: threat.severity,
          ip: threat.ipAddress,
          url: threat.requestUrl,
          timestamp: new Date(),
        });
      }

      // Block HIGH and CRITICAL threats
      if (threat.severity === 'HIGH' || threat.severity === 'CRITICAL') {
        return res.status(403).json({
          success: false,
          message: `Request blocked by IDS: ${threat.type} pattern detected.`,
          logId: log._id,
        });
      }
    }
  } catch (err) {
    console.error('IDS middleware error:', err.message);
  }
  next();
};

module.exports = idsMiddleware;
