// backend/middleware/auth.js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

/**
 * JWT Token verification middleware
 */
const authenticateToken = (req, res, next) => {
  // Get token from header
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Erişim token\'ı gerekli'
    });
  }

  // Verify token
  jwt.verify(token, process.env.JWT_SECRET || 'default-secret', (err, user) => {
    if (err) {
      let message = 'Geçersiz token';
      
      if (err.name === 'TokenExpiredError') {
        message = 'Token süresi dolmuş';
      } else if (err.name === 'JsonWebTokenError') {
        message = 'Geçersiz token formatı';
      }
      
      return res.status(403).json({
        success: false,
        message
      });
    }

    req.user = user;
    next();
  });
};

/**
 * Optional authentication - doesn't fail if no token
 */
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    req.user = null;
    return next();
  }

  jwt.verify(token, process.env.JWT_SECRET || 'default-secret', (err, user) => {
    if (err) {
      req.user = null;
    } else {
      req.user = user;
    }
    next();
  });
};

/**
 * Role-based authorization middleware
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Kimlik doğrulaması gerekli'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Bu işlem için yetkiniz yok'
      });
    }

    next();
  };
};

/**
 * Permission-based authorization middleware
 */
const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Kimlik doğrulaması gerekli'
      });
    }

    if (!req.user.permissions || !req.user.permissions.includes(permission)) {
      return res.status(403).json({
        success: false,
        message: `'${permission}' yetkisi gerekli`
      });
    }

    next();
  };
};

/**
 * Admin only middleware
 */
const requireAdmin = requireRole('admin');

/**
 * User or admin middleware
 */
const requireUser = requireRole('user', 'admin');

/**
 * Check if user owns resource or is admin
 */
const requireOwnershipOrAdmin = (userIdField = 'userId') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Kimlik doğrulaması gerekli'
      });
    }

    // Admin can access everything
    if (req.user.role === 'admin') {
      return next();
    }

    // Check ownership
    const resourceUserId = req.body[userIdField] || req.params[userIdField];
    if (resourceUserId && resourceUserId.toString() === req.user.id.toString()) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: 'Bu kaynağa erişim yetkiniz yok'
    });
  };
};

/**
 * Generate JWT token
 */
const generateToken = (payload, options = {}) => {
  const defaultOptions = {
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    issuer: process.env.JWT_ISSUER || 'stok-takip-app'
  };

  return jwt.sign(
    payload, 
    process.env.JWT_SECRET || 'default-secret',
    { ...defaultOptions, ...options }
  );
};

/**
 * Generate refresh token
 */
const generateRefreshToken = (payload) => {
  return generateToken(payload, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d'
  });
};

/**
 * Verify refresh token
 */
const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'default-secret');
  } catch (error) {
    throw new Error('Geçersiz refresh token');
  }
};

/**
 * Hash password
 */
const hashPassword = async (password) => {
  const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;
  return await bcrypt.hash(password, saltRounds);
};

/**
 * Compare password
 */
const comparePassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

/**
 * Rate limiting for login attempts
 */
const loginAttempts = new Map();

const checkLoginAttempts = (req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress;
  const maxAttempts = 5;
  const windowMs = 15 * 60 * 1000; // 15 minutes

  const now = Date.now();
  const attempts = loginAttempts.get(ip) || { count: 0, resetTime: now + windowMs };

  // Reset if window expired
  if (now > attempts.resetTime) {
    attempts.count = 0;
    attempts.resetTime = now + windowMs;
  }

  // Check if exceeded limit
  if (attempts.count >= maxAttempts) {
    const remainingTime = Math.ceil((attempts.resetTime - now) / 1000 / 60);
    return res.status(429).json({
      success: false,
      message: `Çok fazla giriş denemesi. ${remainingTime} dakika sonra tekrar deneyin.`
    });
  }

  // Store attempts count
  loginAttempts.set(ip, attempts);
  
  // Add increment function to req for failed attempts
  req.incrementLoginAttempts = () => {
    attempts.count++;
    loginAttempts.set(ip, attempts);
  };

  // Add reset function for successful login
  req.resetLoginAttempts = () => {
    loginAttempts.delete(ip);
  };

  next();
};

/**
 * Extract user info from token without verification (for logging)
 */
const extractUserInfo = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    try {
      // Decode without verification (just for user info)
      const decoded = jwt.decode(token);
      req.tokenInfo = decoded;
    } catch (error) {
      // Ignore errors in extraction
      req.tokenInfo = null;
    }
  }

  next();
};

/**
 * CORS with credentials helper
 */
const corsWithAuth = (req, res, next) => {
  const origin = req.headers.origin;
  const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173').split(',');

  if (allowedOrigins.includes(origin) || !origin) {
    res.header('Access-Control-Allow-Origin', origin || '*');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  }

  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }

  next();
};

module.exports = {
  // Main auth middleware
  authenticateToken,
  optionalAuth,
  
  // Authorization
  requireRole,
  requirePermission,
  requireAdmin,
  requireUser,
  requireOwnershipOrAdmin,
  
  // Token management
  generateToken,
  generateRefreshToken,
  verifyRefreshToken,
  
  // Password management
  hashPassword,
  comparePassword,
  
  // Security
  checkLoginAttempts,
  extractUserInfo,
  corsWithAuth
};