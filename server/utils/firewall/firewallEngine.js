/**
 * Firewall Engine – Rule-based packet filtering
 */

/**
 * Evaluate a simulated packet against a list of firewall rules.
 * Rules are sorted by priority (lower = higher priority).
 * Returns the matched rule and decision: ALLOW | BLOCK | DROP
 */
const evaluatePacket = (packet, rules) => {
  const sortedRules = [...rules].sort((a, b) => a.priority - b.priority);
  const logs = [];

  for (const rule of sortedRules) {
    if (!rule.enabled) continue;

    const portMatch =
      !rule.port ||
      rule.port === 'ANY' ||
      rule.port === String(packet.port) ||
      matchPortRange(packet.port, rule.port);

    const ipMatch =
      !rule.ipAddress ||
      rule.ipAddress === 'ANY' ||
      rule.ipAddress === packet.sourceIP;

    const protocolMatch =
      !rule.protocol ||
      rule.protocol === 'ANY' ||
      rule.protocol.toUpperCase() === (packet.protocol || '').toUpperCase();

    if (portMatch && ipMatch && protocolMatch) {
      logs.push({
        ruleId: rule._id || rule.id,
        ruleName: rule.name,
        matched: true,
        action: rule.action,
      });
      return {
        decision: rule.action,
        matchedRule: rule,
        logs,
        evaluated: sortedRules.length,
      };
    } else {
      logs.push({
        ruleId: rule._id || rule.id,
        ruleName: rule.name,
        matched: false,
        action: null,
      });
    }
  }

  // Default policy: DROP unmatched packets
  return {
    decision: 'DROP',
    matchedRule: null,
    logs,
    evaluated: sortedRules.length,
    note: 'No matching rule found – default DROP policy applied',
  };
};

const matchPortRange = (port, rulePort) => {
  if (rulePort.includes('-')) {
    const [min, max] = rulePort.split('-').map(Number);
    return port >= min && port <= max;
  }
  return false;
};

const getDefaultRules = () => [
  { name: 'Allow HTTP', type: 'PORT', protocol: 'TCP', port: '80', action: 'ALLOW', priority: 10, enabled: true },
  { name: 'Allow HTTPS', type: 'PORT', protocol: 'TCP', port: '443', action: 'ALLOW', priority: 20, enabled: true },
  { name: 'Allow DNS', type: 'PORT', protocol: 'UDP', port: '53', action: 'ALLOW', priority: 30, enabled: true },
  { name: 'Block Telnet', type: 'PORT', protocol: 'TCP', port: '23', action: 'BLOCK', priority: 40, enabled: true },
  { name: 'Block FTP', type: 'PORT', protocol: 'TCP', port: '21', action: 'BLOCK', priority: 50, enabled: true },
];

module.exports = { evaluatePacket, getDefaultRules };
