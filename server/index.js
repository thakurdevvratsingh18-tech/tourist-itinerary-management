require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') }); // fallback
require('express-async-errors');

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const path = require('path');
const fs = require('fs');
const connectDB = require('./config/db');
const { getDBStatus } = require('./config/db');
const { errorHandler } = require('./middleware/errorHandler');

// ─── Connect to MongoDB ───────────────────────────────────────────────────────
connectDB();

const app = express();
const isProd = process.env.NODE_ENV === 'production';

// ─── Security middleware ──────────────────────────────────────────────────────
app.use(
  helmet({
    contentSecurityPolicy: false, // Allows Leaflet map tiles & external travel photography
    crossOriginEmbedderPolicy: false,
  })
);

// CORS: allow frontend origin in development
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  })
);

// ─── Rate limiting ────────────────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
});
app.use('/api/', limiter);

// ─── General middleware ───────────────────────────────────────────────────────
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

if (!isProd) {
  app.use(morgan('dev'));
}

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth', require('./routes/auth'));
app.use('/api/destinations', require('./routes/destinations'));
app.use('/api/trips', require('./routes/trips'));
app.use('/api/itineraries', require('./routes/itineraries'));
app.use('/api/budget', require('./routes/budget'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/favorites', require('./routes/favorites'));
app.use('/api/contact', require('./routes/contact'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/composer', require('./routes/composer'));

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) =>
  res.json({
    status: 'ok',
    service: 'TravelCraft API',
    database: getDBStatus(),
    env: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  })
);

// ─── Production: Serve built React frontend ──────────────────────────────────
const clientDist = path.join(__dirname, '../client/dist');
const serverPublic = path.join(__dirname, 'public');
const staticDir = fs.existsSync(clientDist) ? clientDist : serverPublic;

if (fs.existsSync(staticDir)) {
  app.use(express.static(staticDir));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    const indexPath = path.join(staticDir, 'index.html');
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      next();
    }
  });
}

// ─── 404 handler for API routes ──────────────────────────────────────────────
app.use('/api/*', (req, res) => {
  res.status(404).json({ success: false, message: `API route ${req.originalUrl} not found` });
});

// ─── Global error handler ─────────────────────────────────────────────────────
app.use(errorHandler);

// ─── Start server ─────────────────────────────────────────────────────────────
const PORT = parseInt(process.env.PORT || '5000', 10);
const server = app.listen(PORT, () => {
  console.log('');
  console.log('  ✈  TravelCraft Server Started');
  console.log(`  ➜  Mode    : ${process.env.NODE_ENV || 'development'}`);
  console.log(`  ➜  API URL : http://localhost:${PORT}/api`);
  console.log(`  ➜  Health  : http://localhost:${PORT}/api/health`);
  if (fs.existsSync(staticDir)) {
    console.log(`  ➜  Client  : Serving static assets from ${staticDir}`);
  }
  console.log('');
});

// ─── Graceful shutdown ────────────────────────────────────────────────────────
const gracefulShutdown = (signal) => {
  console.log(`\n  ${signal} received – shutting down gracefully…`);
  server.close(async () => {
    console.log('  HTTP server closed');
    try {
      const mongoose = require('mongoose');
      if (mongoose.connection.readyState !== 0) {
        await mongoose.connection.close(false);
        console.log('  MongoDB connection closed');
      }
    } catch (_) {}
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 5000).unref();
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION:', err.message);
});

process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION:', err.message);
  process.exit(1);
});

module.exports = app;
