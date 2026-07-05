const Car = require('../models/CarSchema');
const User = require('../models/UserSchema');
const fs = require('fs');
const path = require('path');

// Helper to safely delete file
const cleanFile = (filePath) => {
  if (filePath && fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
    } catch (err) {
      console.error(`Failed to clean file ${filePath}: ${err.message}`);
    }
  }
};

// Helper to escape regex characters
const escapeRegex = (string) => {
  return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
};

// Add a new cab (Admin only)
exports.createCar = async (req, res, next) => {
  try {
    const { name, type, number, seats, pricePerKm, city, assignedDriverId } = req.body;

    if (!req.file) {
      res.status(400);
      throw new Error('Cab image upload is required');
    }

    const carExists = await Car.findOne({ number });
    if (carExists) {
      cleanFile(req.file.path);
      res.status(400);
      throw new Error('A car with this registration plate number already exists');
    }

    const carData = {
      name,
      type,
      number,
      seats: Number(seats),
      pricePerKm: Number(pricePerKm),
      city: city || 'New York',
      image: req.file.filename
    };

    if (assignedDriverId) {
      const driver = await User.findById(assignedDriverId);
      if (!driver || driver.role !== 'driver') {
        cleanFile(req.file.path);
        res.status(400);
        throw new Error('Assigned driver ID is invalid or role is not driver');
      }
      carData.assignedDriverId = assignedDriverId;
    }

    const car = await Car.create(carData);
    res.status(201).json({
      success: true,
      message: 'Cab added successfully',
      data: car
    });
  } catch (error) {
    if (req.file) cleanFile(req.file.path);
    next(error);
  }
};

// Retrieve all cabs (With filtering by city/type/status for nearby search)
exports.getAllCars = async (req, res, next) => {
  try {
    const { city, status, type } = req.query;
    const filter = {};

    if (city) {
      filter.city = new RegExp(escapeRegex(city), 'i'); // Safe case insensitive search
    }
    if (status) {
      filter.status = status;
    }
    if (type) {
      filter.type = type;
    }

    const cars = await Car.find(filter).populate('assignedDriverId', 'name email mobile driverDetails');
    res.json({ success: true, count: cars.length, data: cars });
  } catch (error) {
    next(error);
  }
};

// Get single cab by ID
exports.getCarById = async (req, res, next) => {
  try {
    const car = await Car.findById(req.params.id).populate('assignedDriverId', 'name email mobile driverDetails');
    if (car) {
      res.json({ success: true, data: car });
    } else {
      res.status(404);
      throw new Error('Cab not found');
    }
  } catch (error) {
    next(error);
  }
};

// Update cab details (Admin only)
exports.updateCar = async (req, res, next) => {
  try {
    const car = await Car.findById(req.params.id);
    if (!car) {
      res.status(404);
      throw new Error('Cab not found');
    }

    const { name, type, number, seats, pricePerKm, city, status, assignedDriverId } = req.body;

    car.name = name || car.name;
    car.type = type || car.type;
    car.number = number || car.number;
    car.seats = seats ? Number(seats) : car.seats;
    car.pricePerKm = pricePerKm ? Number(pricePerKm) : car.pricePerKm;
    car.city = city || car.city;
    car.status = status || car.status;

    if (assignedDriverId !== undefined) {
      if (assignedDriverId) {
        const driver = await User.findById(assignedDriverId);
        if (!driver || driver.role !== 'driver') {
          res.status(400);
          throw new Error('Assigned driver ID is invalid or role is not driver');
        }
        car.assignedDriverId = assignedDriverId;
      } else {
        car.assignedDriverId = null;
      }
    }

    // If new image is uploaded
    if (req.file) {
      const oldImagePath = path.join(__dirname, '../uploads/', car.image);
      cleanFile(oldImagePath);
      car.image = req.file.filename;
    }

    await car.save();
    res.json({ success: true, message: 'Cab updated successfully', data: car });
  } catch (error) {
    if (req.file) cleanFile(req.file.path);
    next(error);
  }
};

// Delete cab (Admin only)
exports.deleteCar = async (req, res, next) => {
  try {
    const car = await Car.findById(req.params.id);
    if (!car) {
      res.status(404);
      throw new Error('Cab not found');
    }

    // Remove car image from uploads
    const imagePath = path.join(__dirname, '../uploads/', car.image);
    if (fs.existsSync(imagePath)) {
      try {
        fs.unlinkSync(imagePath);
      } catch (e) {
        console.error(`Failed to remove file: ${e.message}`);
      }
    }

    await Car.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Cab deleted successfully from database' });
  } catch (error) {
    next(error);
  }
};
