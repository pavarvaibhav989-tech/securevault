/**
 * IDS Engine – Pattern-based Intrusion Detection
 * Detects: SQL Injection, XSS, Directory Traversal, Brute Force, Rate Abuse
 */

const SQL_INJECTION_PATTERNS = [
  /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|CREATE|EXEC|EXECUTE)\b)/i,
  /(--|;|'|"|\bOR\b|\bAND\b).*?(=|\bLIKE\b\s+')/i,
  /(\bUNION\b.*\bSELECT\b)/i,
  /(1=1|'1'='1'|"1"="1")/i,
  /(\bSLEEP\b|\bBENCHMARK\b|\bWAITFOR\b)/i,
];

const XSS_PATTERNS = [
  /<script\b[^>]*>(.*?)<\/script>/i,
  /on\w+\s*=\s*["'][^"']*["']/i,
  /javascript\s*:/i,
  /<iframe\b/i,
  /eval\s*\(/i,
];

const DIR_TRAVERSAL_PATTERNS = [
  /\.\.[\/\\]/,
  /%2e%2e[\/\\]/i,
  /\.\.%2f/i,
  /%252e%252e/i,
];

const detectAttackType = (payload) => {
  const str = typeof payload === 'object' ? JSON.stringify(payload) : String(payload);

  for (const pattern of SQL_INJECTION_PATTERNS) {
    if (pattern.test(str)) return { type: 'SQL_INJECTION', severity: 'HIGH' };
  }
  for (const pattern of XSS_PATTERNS) {
    if (pattern.test(str)) return { type: 'XSS', severity: 'HIGH' };
  }
  for (const pattern of DIR_TRAVERSAL_PATTERNS) {
    if (pattern.test(str)) return { type: 'DIRECTORY_TRAVERSAL', severity: 'MEDIUM' };
  }

  return null;
};

const analyzeRequest = (req) => {
  // NOTE: user-agent is intentionally excluded — browser UAs contain
  // words like 'like' (KHTML, like Gecko) that falsely trigger SQL patterns.
  // Only scan actual user-supplied input: query, body, params.
  const targets = [
    req.query,
    req.body,
    req.params,
  ];

  for (const target of targets) {
    const result = detectAttackType(target);
    if (result) {
      return {
        ...result,
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.headers['user-agent'],
        requestUrl: req.originalUrl,
        requestMethod: req.method,
        payload: JSON.stringify(target).substring(0, 200),
      };
    }
  }
  return null;
};

module.exports = { analyzeRequest, detectAttackType };
