const mongoose = require('mongoose');

const CarSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: ['Sedan', 'SUV', 'Hatchback'],
    index: true
  },
  number: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  seats: {
    type: Number,
    required: true
  },
  pricePerKm: {
    type: Number,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Available', 'Booked', 'Maintenance'],
    default: 'Available',
    index: true
  },
  assignedDriverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true,
    default: null
  },
  city: {
    type: String,
    default: 'New York',
    trim: true,
    index: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Compound indexing for searching available cars by type and city
CarSchema.index({ city: 1, status: 1, type: 1 });

module.exports = mongoose.model('Car', CarSchema);
