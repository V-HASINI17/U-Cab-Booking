const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./db/config');
const errorHandler = require('./middlewares/errorHandler');

// Load environment configurations
dotenv.config();

// Initialize MongoDB connection
connectDB();

const app = express();

// Set CORS config to enable communication with React client
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true
  })
);

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static car uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API routes mapping
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/cars', require('./routes/carRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/support', require('./routes/supportRoutes'));

// Health check status route
app.get('/', (req, res) => {
  res.json({ status: 'OK', message: 'UCAB Core API running' });
});

// Global Centralized Error Handling Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`UCAB Backend Server listening on port ${PORT}`);
});
