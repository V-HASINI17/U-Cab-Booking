const express = require('express');
const router = express.Router();
const {
  estimateFare,
  createBooking,
  getMyBookings,
  getAllBookings,
  updateBookingStatus,
  processPayment,
  getReceipt
} = require('../controllers/bookingController');
const { protect, adminOnly } = require('../middlewares/auth');

// Fare estimation
router.post('/estimate', protect, estimateFare);

// Booking creation & retrieval
router.post('/', protect, createBooking);
router.get('/my-bookings', protect, getMyBookings);

// Admin-only global bookings lookup
router.get('/', protect, adminOnly, getAllBookings);

// Booking updates & payments
router.put('/:id/status', protect, updateBookingStatus);
router.post('/:id/pay', protect, processPayment);
router.get('/:id/receipt', protect, getReceipt);

module.exports = router;
