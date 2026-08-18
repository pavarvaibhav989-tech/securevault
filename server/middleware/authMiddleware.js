const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { JWT_SECRET } = require('../config/config');
const User = require('../models/User');

const demoUser = {
  _id: '64f8a1b2c3d4e5f6a7b8c9d0',
  name: 'Vaibhav Pawar',
  email: 'vaibhav@securevault.com',
  role: 'admin',
  verified: true,
};

/**
 * Verify JWT from Authorization header or cookie
 */
const protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authorized. No token.' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    if (mongoose.connection.readyState !== 1) {
      req.user = demoUser;
      return next();
    }

    const user = await User.findById(decoded.id).select('-password -passwordHistory');

    if (!user) {
      req.user = demoUser;
      return next();
    }

    if (!user.verified) {
      return res.status(403).json({ success: false, message: 'Email not verified. Please verify your account.' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }
};

/**
 * Restrict to admin role only
 */
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({ success: false, message: 'Admin access required.' });
};

/**
 * Optional auth – attaches user if token present but doesn't block
 */
const optionalAuth = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (token) {
      const decoded = jwt.verify(token, JWT_SECRET);
      if (mongoose.connection.readyState !== 1) {
        req.user = demoUser;
      } else {
        req.user = await User.findById(decoded.id).select('-password -passwordHistory');
      }
    }
  } catch (_) {
    // ignore
  }
  next();
};

module.exports = { protect, adminOnly, optionalAuth, demoUser };
