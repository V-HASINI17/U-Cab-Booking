const Admin = require('../models/AdminSchema');
const User = require('../models/UserSchema');
const Car = require('../models/CarSchema');
const Booking = require('../models/MyBookingSchema');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Token helper
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// Admin Register
exports.registerAdmin = async (req, res, next) => {
  try {
    const { name, email, password, mobile } = req.body;

    const adminExists = await Admin.findOne({ email });
    if (adminExists) {
      res.status(400);
      throw new Error('Admin email is already registered');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const admin = await Admin.create({
      name,
      email,
      password: hashedPassword,
      mobile,
      role: 'admin'
    });

    if (admin) {
      res.status(201).json({
        success: true,
        data: {
          _id: admin._id,
          name: admin.name,
          email: admin.email,
          mobile: admin.mobile,
          role: admin.role,
          token: generateToken(admin._id)
        }
      });
    } else {
      res.status(400);
      throw new Error('Failed to register Admin account');
    }
  } catch (error) {
    next(error);
  }
};

// Admin Login
exports.loginAdmin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });
    if (admin && (await bcrypt.compare(password, admin.password))) {
      res.json({
        success: true,
        data: {
          _id: admin._id,
          name: admin.name,
          email: admin.email,
          mobile: admin.mobile,
          role: admin.role,
          token: generateToken(admin._id)
        }
      });
    } else {
      res.status(401);
      throw new Error('Invalid Admin email or password');
    }
  } catch (error) {
    next(error);
  }
};

// Admin Dashboard stats
exports.getDashboardStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalDrivers = await User.countDocuments({ role: 'driver' });
    const totalCars = await Car.countDocuments();
    const totalBookings = await Booking.countDocuments();

    // Aggregate booking totals by status
    const statusAggregation = await Booking.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const bookingsByStatus = {
      Pending: 0,
      Confirmed: 0,
      Arriving: 0,
      'In Progress': 0,
      Completed: 0,
      Cancelled: 0
    };

    statusAggregation.forEach((item) => {
      if (bookingsByStatus.hasOwnProperty(item._id)) {
        bookingsByStatus[item._id] = item.count;
      }
    });

    // Calculate total revenue from completed rides
    const revenueAggregation = await Booking.aggregate([
      { $match: { status: 'Completed', paymentStatus: 'Paid' } },
      { $group: { _id: null, total: { $sum: '$fare' } } }
    ]);
    const totalRevenue = revenueAggregation.length > 0 ? revenueAggregation[0].total : 0;

    res.json({
      success: true,
      data: {
        stats: {
          users: totalUsers,
          drivers: totalDrivers,
          cars: totalCars,
          bookings: totalBookings,
          revenue: totalRevenue
        },
        bookingsByStatus
      }
    });
  } catch (error) {
    next(error);
  }
};

// Admin Driver verification approval/rejection
exports.verifyDriver = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['Verified', 'Rejected'].includes(status)) {
      res.status(400);
      throw new Error('Invalid verification status choice. Use Verified or Rejected');
    }

    const driver = await User.findById(req.params.id);
    if (!driver || driver.role !== 'driver') {
      res.status(404);
      throw new Error('Driver account not found');
    }

    driver.driverDetails.status = status;
    await driver.save();

    res.json({
      success: true,
      message: `Driver status set to ${status}`,
      data: driver
    });
  } catch (error) {
    next(error);
  }
};
