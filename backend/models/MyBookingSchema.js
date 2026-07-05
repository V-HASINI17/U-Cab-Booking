const mongoose = require('mongoose');

const MyBookingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  carId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Car',
    required: true,
    index: true
  },
  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true,
    default: null
  },
  pickup: {
    type: String,
    required: true
  },
  drop: {
    type: String,
    required: true
  },
  pickupCoords: {
    lat: { type: Number, default: 40.7128 },
    lng: { type: Number, default: -74.0060 }
  },
  dropCoords: {
    lat: { type: Number, default: 40.7589 },
    lng: { type: Number, default: -73.9851 }
  },
  date: {
    type: String,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  distance: {
    type: Number,
    required: true
  },
  fare: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Arriving', 'In Progress', 'Completed', 'Cancelled'],
    default: 'Pending',
    index: true
  },
  paymentStatus: {
    type: String,
    enum: ['Unpaid', 'Paid'],
    default: 'Unpaid',
    index: true
  },
  paymentDetails: {
    transactionId: { type: String, default: null },
    paymentMethod: { type: String, default: null },
    paidAt: { type: Date, default: null }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Compound indexing to quickly fetch active bookings for users or drivers
MyBookingSchema.index({ userId: 1, status: 1 });
MyBookingSchema.index({ driverId: 1, status: 1 });

module.exports = mongoose.model('Booking', MyBookingSchema);
