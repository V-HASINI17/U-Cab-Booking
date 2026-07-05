const User = require('../models/UserSchema');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Token generation helper
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// Register normal user or driver
exports.registerUser = async (req, res, next) => {
  try {
    const { name, email, password, mobile, role, driverDetails } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400);
      throw new Error('Email is already registered');
    }

    // Hash Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    let userPayload = {
      name,
      email,
      password: hashedPassword,
      mobile,
      role: role || 'user'
    };

    // If driver, parse details
    if (role === 'driver') {
      if (
        !driverDetails ||
        !driverDetails.licenseNumber ||
        !driverDetails.vehicleModel ||
        !driverDetails.vehicleNumber ||
        !driverDetails.vehicleType
      ) {
        res.status(400);
        throw new Error('Driver details (License, Vehicle details, type) are required');
      }

      userPayload.driverDetails = {
        licenseNumber: driverDetails.licenseNumber,
        vehicleModel: driverDetails.vehicleModel,
        vehicleNumber: driverDetails.vehicleNumber,
        vehicleType: driverDetails.vehicleType,
        experienceYears: driverDetails.experienceYears || 0,
        status: 'Pending',
        currentLocation: driverDetails.currentLocation || { city: 'New York', lat: 40.7128, lng: -74.0060 }
      };
    }

    const user = await User.create(userPayload);

    if (user) {
      res.status(201).json({
        success: true,
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          mobile: user.mobile,
          role: user.role,
          driverDetails: user.driverDetails,
          token: generateToken(user._id)
        }
      });
    } else {
      res.status(400);
      throw new Error('Failed to create user account');
    }
  } catch (error) {
    next(error);
  }
};

// User/Driver Login
exports.loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        success: true,
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          mobile: user.mobile,
          role: user.role,
          driverDetails: user.driverDetails,
          token: generateToken(user._id)
        }
      });
    } else {
      res.status(401);
      throw new Error('Invalid email or password credentials');
    }
  } catch (error) {
    next(error);
  }
};

// Get personal user profile
exports.getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (user) {
      res.json({ success: true, data: user });
    } else {
      res.status(404);
      throw new Error('User profile not found');
    }
  } catch (error) {
    next(error);
  }
};

// Update Driver Telemetry Location
exports.updateDriverLocation = async (req, res, next) => {
  try {
    const { city, lat, lng } = req.body;
    const driver = await User.findById(req.user._id);

    if (!driver || driver.role !== 'driver') {
      res.status(400);
      throw new Error('Only drivers can update vehicle coordinates');
    }

    driver.driverDetails.currentLocation = {
      city: city || driver.driverDetails.currentLocation.city,
      lat: lat !== undefined ? lat : driver.driverDetails.currentLocation.lat,
      lng: lng !== undefined ? lng : driver.driverDetails.currentLocation.lng
    };

    await driver.save();
    res.json({
      success: true,
      message: 'Driver location telemetry updated',
      data: driver.driverDetails.currentLocation
    });
  } catch (error) {
    next(error);
  }
};

// ADMIN: Get all users & drivers
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({ role: { $ne: 'admin' } }).select('-password');
    res.json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
};

// ADMIN: Get user by ID
exports.getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (user) {
      res.json({ success: true, data: user });
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  } catch (error) {
    next(error);
  }
};

// ADMIN: Update user
exports.updateUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.mobile = req.body.mobile || user.mobile;
    user.role = req.body.role || user.role;
    if (user.role === 'driver' && req.body.driverDetails) {
      const currentDetails = user.driverDetails ? user.driverDetails.toObject() : {};
      const mergedDetails = {
        ...currentDetails,
        ...req.body.driverDetails
      };
      if (req.body.driverDetails.currentLocation) {
        const currentLoc = (user.driverDetails && user.driverDetails.currentLocation) ? user.driverDetails.currentLocation.toObject() : {};
        mergedDetails.currentLocation = {
          ...currentLoc,
          ...req.body.driverDetails.currentLocation
        };
      }
      user.driverDetails = mergedDetails;
    }

    await user.save();
    res.json({ success: true, message: 'User updated successfully', data: user });
  } catch (error) {
    next(error);
  }
};

// ADMIN: Delete user
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      await User.findByIdAndDelete(req.params.id);
      res.json({ success: true, message: 'User deleted successfully' });
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  } catch (error) {
    next(error);
  }
};
