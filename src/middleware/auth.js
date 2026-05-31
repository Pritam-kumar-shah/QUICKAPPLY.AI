// ============================================
// ApplyFlow.ai — JWT Authentication Middleware
// ============================================

const jwt = require('jsonwebtoken');
const config = require('../config/index');
const User = require('../models/User');

/**
 * Protect routes — verify JWT token
 */
const protect = async (req, res, next) => {
  try {
    let token;

    // Get token from Authorization header or query parameter
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.query.token) {
      token = req.query.token;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized. Please login to access this resource.',
      });
    }

    // Verify token
    const decoded = jwt.verify(token, config.jwtSecret);

    // Try to get user from DB
    try {
      const user = await User.findById(decoded.id);
      if (user) {
        req.user = user;
      } else {
        // User from token but not in DB (in-memory mode)
        req.user = { _id: decoded.id, ...decoded };
      }
    } catch (dbError) {
      // DB not connected, use token data
      req.user = { _id: decoded.id, ...decoded };
    }

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, error: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, error: 'Token expired. Please login again.' });
    }
    return res.status(500).json({ success: false, error: 'Authentication error' });
  }
};

/**
 * Generate JWT token
 */
const generateToken = (userId, additionalData = {}) => {
  return jwt.sign(
    { id: userId, ...additionalData },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn }
  );
};

module.exports = { protect, generateToken };
