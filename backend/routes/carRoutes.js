const express = require('express');
const router = express.Router();
const {
  createCar,
  getAllCars,
  getCarById,
  updateCar,
  deleteCar
} = require('../controllers/carController');
const { protect, adminOnly } = require('../middlewares/auth');
const upload = require('../middlewares/multer');

// Standard user list/view routes
router.get('/', protect, getAllCars);
router.get('/:id', protect, getCarById);

// Admin-only car management routes
router.post('/', protect, adminOnly, upload.single('image'), createCar);
router.put('/:id', protect, adminOnly, upload.single('image'), updateCar);
router.delete('/:id', protect, adminOnly, deleteCar);

module.exports = router;
