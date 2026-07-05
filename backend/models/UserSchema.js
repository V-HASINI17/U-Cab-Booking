const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    index: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  mobile: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    enum: ['user', 'driver', 'admin'],
    default: 'user',
    index: true
  },
  driverDetails: {
    licenseNumber: {
      type: String,
      trim: true
    },
    vehicleModel: {
      type: String,
      trim: true
    },
    vehicleNumber: {
      type: String,
      trim: true
    },
    vehicleType: {
      type: String,
      enum: ['Sedan', 'SUV', 'Hatchback']
    },
    experienceYears: {
      type: Number
    },
    status: {
      type: String,
      enum: ['Pending', 'Verified', 'Rejected'],
      default: 'Pending',
      index: true
    },
    currentLocation: {
      city: { type: String, default: 'New York', index: true },
      lat: { type: Number, default: 40.7128 },
      lng: { type: Number, default: -74.0060 }
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Pre-save hook: remove driverDetails completely for non-drivers to prevent index collisions
UserSchema.pre('save', function (next) {
  if (this.role !== 'driver') {
    this.driverDetails = undefined;
  }
  next();
});

// Compound indexing for locating drivers of specific vehicle types in specific cities
UserSchema.index({ role: 1, 'driverDetails.status': 1, 'driverDetails.currentLocation.city': 1 });

// Explicit schema-level unique sparse indexes for driver-specific fields
UserSchema.index({ 'driverDetails.licenseNumber': 1 }, { unique: true, sparse: true });
UserSchema.index({ 'driverDetails.vehicleNumber': 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('User', UserSchema);
