const errorHandler = (err, req, res, next) => {
  console.error(`[SYSTEM ERROR] Route: ${req.method} ${req.path} | Error: ${err.message}`);
  if (err.stack) {
    console.error(err.stack);
  }

  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message;
  let errors = null;

  // MongoDB Mongoose duplicate key error
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue)[0];
    message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists.`;
  }

  // MongoDB Mongoose validation error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation failed';
    errors = Object.values(err.errors).map(val => val.message);
  }

  // MongoDB Mongoose CastError (e.g. invalid Hex ID)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ID format for resource matching value: ${err.value}`;
  }

  // JWT error
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Authentication failed: Invalid token';
  }

  // JWT expiration error
  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Authentication failed: Token has expired';
  }

  // Multer File Upload error handler
  if (err.name === 'MulterError') {
    statusCode = 400;
    message = `Upload error: ${err.message}`;
  }

  res.status(statusCode).json({
    success: false,
    message,
    errors,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
};

module.exports = errorHandler;
