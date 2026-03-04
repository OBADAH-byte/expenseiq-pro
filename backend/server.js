require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Connect to MongoDB
connectDB();

// Security middleware
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20 });
app.use('/api/', limiter);
app.use('/api/auth/', authLimiter);

// Body parser
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

// Serve frontend static files
app.use(express.static(path.join(__dirname, '../frontend')));

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/expenses', require('./routes/expenseRoutes'));
app.use('/api/goals', require('./routes/goalRoutes'));
app.use('/api/badges', require('./routes/badgeRoutes'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'ExpenseIQ Pro API is running 🚀', version: '3.0.0', timestamp: new Date().toISOString() });
});

// Serve frontend for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`
  ╔══════════════════════════════════════╗
  ║       ExpenseIQ Pro v3.0.0          ║
  ║   Understand Your Money.            ║
  ║   Master Your Future.               ║
  ╠══════════════════════════════════════╣
  ║  Server: http://localhost:${PORT}      ║
  ║  API:    http://localhost:${PORT}/api  ║
  ║  Mode:   ${process.env.NODE_ENV || 'development'}               ║
  ╚══════════════════════════════════════╝
  `);
});

module.exports = app;
