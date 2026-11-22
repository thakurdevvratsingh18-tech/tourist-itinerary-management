/**
 * Central Express error-handling middleware.
 *
 * Usage: app.use(errorHandler) — place AFTER all routes.
 */

const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errors = null;

  // ── Log in development ──────────────────────────────────────────────────────
  if (process.env.NODE_ENV === 'development') {
    console.error('ERROR ▼');
    console.error(err);
  }

  // ── Mongoose: Bad ObjectId (CastError) ─────────────────────────────────────
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ${err.path}: '${err.value}'`;
  }

  // ── Mongoose: Validation Error ─────────────────────────────────────────────
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation failed';
    errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
  }

  // ── Mongoose: Duplicate Key Error ──────────────────────────────────────────
  if (err.code === 11000 || err.code === 11001) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    const value = err.keyValue ? err.keyValue[field] : '';
    message = `Duplicate value for '${field}': '${value}' already exists`;
  }

  // ── JWT Errors ─────────────────────────────────────────────────────────────
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token – please log in again';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired – please log in again';
  }

  // ── Multer / File Upload Errors ────────────────────────────────────────────
  if (err.code === 'LIMIT_FILE_SIZE') {
    statusCode = 400;
    message = 'File too large – maximum allowed size exceeded';
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    statusCode = 400;
    message = 'Unexpected file field in upload';
  }

  // ── Build response ─────────────────────────────────────────────────────────
  const response = {
    success: false,
    status: statusCode,
    message,
  };

  if (errors) response.errors = errors;

  // Include stack trace only in development
  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

/**
 * Custom AppError class for throwing structured errors anywhere in the app.
 *
 * Usage: throw new AppError('Not found', 404);
 */
class AppError extends Error {
  constructor(message, statusCode = 500, errors = null) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = true; // distinguish from programming errors
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * asyncHandler
 * Wraps an async route handler so that rejected promises are forwarded to
 * Express's next(err) rather than causing unhandled promise rejections.
 *
 * Usage: router.get('/path', asyncHandler(async (req, res) => { ... }));
 */
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

module.exports = { errorHandler, AppError, asyncHandler };
