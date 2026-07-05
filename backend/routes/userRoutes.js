const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getUserProfile,
  updateDriverLocation,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser
} = require('../controllers/userController');
const { protect, adminOnly, driverOnly } = require('../middlewares/auth');

// Public auth routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Personal profile & telemetry routes
router.get('/me', protect, getUserProfile);
router.put('/telemetry', protect, driverOnly, updateDriverLocation);

// Admin-only user management routes
router.get('/', protect, adminOnly, getAllUsers);
router.get('/:id', protect, adminOnly, getUserById);
router.put('/:id', protect, adminOnly, updateUser);
router.delete('/:id', protect, adminOnly, deleteUser);

module.exports = router;
