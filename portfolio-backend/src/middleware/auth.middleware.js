const jwt = require('jsonwebtoken');
const { supabase } = require('../config/database');
const { ApiError } = require('./error.middleware');

/**
 * Protect routes - Verify JWT token
 */
const protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      throw new ApiError(401, 'Not authorized to access this route');
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from database
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, name, role, avatar_url, is_active')
      .eq('id', decoded.id)
      .single();

    if (error || !user) {
      throw new ApiError(401, 'User not found');
    }

    if (!user.is_active) {
      throw new ApiError(401, 'User account is deactivated');
    }

    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Optional auth - Attach user if token present, but don't require it
 */
const optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const { data: user } = await supabase
        .from('users')
        .select('id, email, name, role, avatar_url, is_active')
        .eq('id', decoded.id)
        .single();

      if (user && user.is_active) {
        req.user = user;
      }
    }
    next();
  } catch (error) {
    // Continue without user
    next();
  }
};

/**
 * Authorize specific roles
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, 'Not authorized to access this route'));
    }

    if (!roles.includes(req.user.role)) {
      return next(new ApiError(403, 'Not authorized to perform this action'));
    }
    next();
  };
};

/**
 * Admin only access
 */
const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return next(new ApiError(403, 'Admin access required'));
  }
  next();
};

/**
 * Verify refresh token
 */
const verifyRefreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new ApiError(400, 'Refresh token is required');
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    // Check if user exists and has this refresh token
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, name, role, refresh_token')
      .eq('id', decoded.id)
      .single();

    if (error || !user) {
      throw new ApiError(401, 'Invalid refresh token');
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  protect,
  optionalAuth,
  authorize,
  adminOnly,
  verifyRefreshToken
};