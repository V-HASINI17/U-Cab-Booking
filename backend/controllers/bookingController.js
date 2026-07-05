const Booking = require('../models/MyBookingSchema');
const Car = require('../models/CarSchema');
const User = require('../models/UserSchema');

// Estimate ride fare
exports.estimateFare = async (req, res, next) => {
  try {
    const { distance, carType } = req.body;
    if (!distance || !carType) {
      res.status(400);
      throw new Error('Distance and carType are required');
    }

    let ratePerKm = 10;
    if (carType === 'Sedan') ratePerKm = 15;
    if (carType === 'SUV') ratePerKm = 22;
    if (carType === 'Hatchback') ratePerKm = 10;

    const baseFare = Number(distance) * ratePerKm;
    const tax = baseFare * 0.08; // 8% GST
    const serviceFee = 15; // flat booking service fee
    const totalFare = Math.round(baseFare + tax + serviceFee);

    res.json({
      success: true,
      data: {
        distance: Number(distance),
        carType,
        ratePerKm,
        baseFare,
        tax: Math.round(tax),
        serviceFee,
        totalFare
      }
    });
  } catch (error) {
    next(error);
  }
};

// Create a booking
exports.createBooking = async (req, res, next) => {
  try {
    const { carId, pickup, drop, date, time, distance } = req.body;

    // Atomically find the car AND set status to 'Booked' only if it is still 'Available'.
    // This eliminates the race condition where two concurrent users both pass the check.
    const car = await Car.findOneAndUpdate(
      { _id: carId, status: 'Available' },
      { $set: { status: 'Booked' } },
      { new: true }
    );

    if (!car) {
      // Either car doesn't exist, or it was just booked by another request
      const exists = await Car.exists({ _id: carId });
      res.status(exists ? 400 : 404);
      throw new Error(exists ? 'Selected cab is currently unavailable' : 'The selected cab is not registered');
    }

    // Dynamic fare calculation
    const baseFare = Number(distance) * car.pricePerKm;
    const tax = baseFare * 0.08;
    const serviceFee = 15;
    const totalFare = Math.round(baseFare + tax + serviceFee);

    // Create booking & assign cab driver
    const booking = await Booking.create({
      userId: req.user._id,
      carId: car._id,
      driverId: car.assignedDriverId || null,
      pickup,
      drop,
      pickupCoords: {
        lat: 40.7128 + (Math.random() - 0.5) * 0.05,
        lng: -74.0060 + (Math.random() - 0.5) * 0.05
      },
      dropCoords: {
        lat: 40.7589 + (Math.random() - 0.5) * 0.05,
        lng: -73.9851 + (Math.random() - 0.5) * 0.05
      },
      date,
      time,
      distance: Number(distance),
      fare: totalFare,
      status: 'Pending',
      paymentStatus: 'Unpaid'
    });

    res.status(201).json({
      success: true,
      message: 'Cab booked successfully',
      data: booking
    });
  } catch (error) {
    next(error);
  }
};

// Get personal bookings (User/Driver)
exports.getMyBookings = async (req, res, next) => {
  try {
    let bookings;
    if (req.user.role === 'user') {
      bookings = await Booking.find({ userId: req.user._id })
        .populate('carId')
        .populate('driverId', 'name mobile driverDetails')
        .sort({ createdAt: -1 });
    } else if (req.user.role === 'driver') {
      bookings = await Booking.find({ driverId: req.user._id })
        .populate('carId')
        .populate('userId', 'name email mobile')
        .sort({ createdAt: -1 });
    } else {
      res.status(400);
      throw new Error('Access denied: Role invalid for personal booking lists');
    }

    res.json({ success: true, count: bookings.length, data: bookings });
  } catch (error) {
    next(error);
  }
};

// Admin: Get all bookings
exports.getAllBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find()
      .populate('carId')
      .populate('userId', 'name email mobile')
      .populate('driverId', 'name mobile driverDetails')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: bookings.length, data: bookings });
  } catch (error) {
    next(error);
  }
};

// Update booking status
exports.updateBookingStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      res.status(404);
      throw new Error('Booking not found');
    }

    // Role-based state change authorization
    if (req.user.role === 'user') {
      // Passenger can only cancel their own ride before it starts
      if (booking.userId.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Access denied: You do not own this booking');
      }
      if (status !== 'Cancelled') {
        res.status(400);
        throw new Error('Passengers can only cancel their rides');
      }
      if (!['Pending', 'Confirmed'].includes(booking.status)) {
        res.status(400);
        throw new Error('Active or completed rides cannot be cancelled');
      }
    } else if (req.user.role === 'driver') {
      // Driver workflow
      if (booking.driverId) {
        if (booking.driverId.toString() !== req.user._id.toString()) {
          res.status(403);
          throw new Error('Access denied: You are not assigned to this ride');
        }
      } else {
        // Driver accepts an unassigned booking
        if (status === 'Confirmed') {
          booking.driverId = req.user._id;
        } else {
          res.status(403);
          throw new Error('Access denied: Ride is not assigned to you');
        }
      }

      // Check allowed statuses for drivers
      if (!['Confirmed', 'Arriving', 'In Progress', 'Completed'].includes(status)) {
        res.status(400);
        throw new Error('Invalid status update for driver');
      }
    } else if (req.user.role !== 'admin') {
      res.status(403);
      throw new Error('Access denied: Unauthorized role');
    }

    booking.status = status;
    await booking.save();

    // Release cab to 'Available' if cancelled or completed
    if (['Completed', 'Cancelled'].includes(status)) {
      const car = await Car.findById(booking.carId);
      if (car) {
        car.status = 'Available';
        await car.save();
      }
    }

    res.json({
      success: true,
      message: `Ride status updated to ${status}`,
      data: booking
    });
  } catch (error) {
    next(error);
  }
};

// Process simulated payment checkout
exports.processPayment = async (req, res, next) => {
  try {
    const { paymentMethod, cardDetails } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      res.status(404);
      throw new Error('Booking not found');
    }

    // Owner check: Only the passenger who placed the booking (or admin) can pay
    if (booking.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      res.status(403);
      throw new Error('Access denied: You are not authorized to pay for this booking');
    }

    if (booking.paymentStatus === 'Paid') {
      res.status(400);
      throw new Error('Booking is already paid');
    }

    if (!paymentMethod) {
      res.status(400);
      throw new Error('Payment method is required');
    }

    if (
      paymentMethod === 'Card' &&
      (!cardDetails || !cardDetails.cardNumber || !cardDetails.expiry || !cardDetails.cvv)
    ) {
      res.status(400);
      throw new Error('Credit card details are required for online checkout');
    }

    // Mock successful transaction details
    booking.paymentStatus = 'Paid';
    booking.paymentDetails = {
      transactionId: 'TXN-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
      paymentMethod: paymentMethod,
      paidAt: new Date()
    };

    if (booking.status === 'Pending') {
      booking.status = 'Confirmed';
    }

    await booking.save();

    res.json({
      success: true,
      message: 'Checkout payment processed successfully',
      data: booking
    });
  } catch (error) {
    next(error);
  }
};

// Fetch single ride receipt details
exports.getReceipt = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('carId')
      .populate('userId', 'name email mobile')
      .populate('driverId', 'name mobile driverDetails');

    if (!booking) {
      res.status(404);
      throw new Error('Booking not found');
    }

    // Access control: only owner, assigned driver, or admin can fetch receipt
    const isOwner = booking.userId && booking.userId._id.toString() === req.user._id.toString();
    const isDriver = booking.driverId && booking.driverId._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isDriver && !isAdmin) {
      res.status(403);
      throw new Error('Access denied: You are not authorized to view this receipt');
    }

    res.json({ success: true, data: booking });
  } catch (error) {
    next(error);
  }
};
