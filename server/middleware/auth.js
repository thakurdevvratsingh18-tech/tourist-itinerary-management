const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * protect
 * Middleware to verify JWT and attach the authenticated user to req.user.
 * Accepts token from: Authorization header (Bearer <token>) OR cookie.
 */
const protect = async (req, res, next) => {
  let token;

  // 1. Try Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  // 2. Fall back to cookie
  if (!token && req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized – no token provided',
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user (excluding password)
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized – user not found',
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized – account is deactivated',
      });
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized – token expired',
      });
    }
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized – invalid token',
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Not authorized',
    });
  }
};

/**
 * authorize(...roles)
 * Factory middleware to restrict access to specific roles.
 * Must be used AFTER protect().
 *
 * @param {...string} roles – allowed roles, e.g. authorize('admin', 'agent')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized – authentication required',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role '${req.user.role}' is not permitted to access this resource`,
      });
    }

    next();
  };
};

/**
 * optionalProtect
 * Soft version of protect: attaches req.user if a valid token is present,
 * but does NOT block the request if no token is provided.
 */
const optionalProtect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) return next();

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (user && user.isActive) req.user = user;
  } catch (_) {
    // silently ignore invalid / expired tokens in optional mode
  }

  next();
};

module.exports = { protect, authorize, optionalProtect };
