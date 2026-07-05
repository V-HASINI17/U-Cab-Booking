const jwt = require('jsonwebtoken');
const User = require('../models/UserSchema');
const Admin = require('../models/AdminSchema');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      // Decode the JWT token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Check User collection first
      let user = await User.findById(decoded.id).select('-password');
      if (!user) {
        // If user not found, check Admin collection
        user = await Admin.findById(decoded.id).select('-password');
      }

      if (!user) {
        return res.status(401).json({ success: false, message: 'Not authorized, user not found' });
      }

      // Attach user object to request
      req.user = user;
      next();
    } catch (error) {
      console.error(`Auth Error: ${error.message}`);
      return res.status(401).json({ success: false, message: 'Not authorized, token validation failed' });
    }
  } else {
    return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({ success: false, message: 'Access denied: Admin authorization required' });
  }
};

const driverOnly = (req, res, next) => {
  if (req.user && req.user.role === 'driver') {
    next();
  } else {
    return res.status(403).json({ success: false, message: 'Access denied: Driver authorization required' });
  }
};

module.exports = { protect, adminOnly, driverOnly };
