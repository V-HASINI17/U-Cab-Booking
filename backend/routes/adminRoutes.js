const express = require('express');
const router = express.Router();
const {
  registerAdmin,
  loginAdmin,
  getDashboardStats,
  verifyDriver
} = require('../controllers/adminController');
const { protect, adminOnly } = require('../middlewares/auth');

// Admin auth routes — register is restricted to existing admins only
router.post('/register', protect, adminOnly, registerAdmin);
router.post('/login', loginAdmin);

// Protected admin dashboard routes
router.get('/dashboard-stats', protect, adminOnly, getDashboardStats);
router.put('/drivers/:id/verify', protect, adminOnly, verifyDriver);

module.exports = router;
