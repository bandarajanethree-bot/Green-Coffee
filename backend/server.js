require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const connectDB = require('../database/db');

const app = express();

// Connect to MongoDB
connectDB();

// Security middleware
app.use(helmet({ crossOriginResourcePolicy: false }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: 'Too many requests. Please try again later.' }
});
app.use('/api/', limiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many auth attempts. Please try again in 15 minutes.' }
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/contact', require('./routes/contact'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: '🌿 Green Coffee Café API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// Menu data endpoint (static for demo)
app.get('/api/menu', (req, res) => {
  const menu = [
    { id: 1, category: 'Hot Coffee', name: 'Signature Espresso', price: 3.50, description: 'Rich, bold, and perfectly extracted single origin espresso', popular: true },
    { id: 2, category: 'Hot Coffee', name: 'Flat White', price: 4.50, description: 'Velvety microfoam with double ristretto shots', popular: true },
    { id: 3, category: 'Hot Coffee', name: 'Pour Over', price: 5.00, description: 'Slow-brewed to perfection, bright and complex flavors', popular: false },
    { id: 4, category: 'Cold Brew', name: 'Classic Cold Brew', price: 5.50, description: '18-hour steeping, smooth and low acidity', popular: true },
    { id: 5, category: 'Cold Brew', name: 'Nitro Cold Brew', price: 6.00, description: 'Nitrogen-infused for creamy, cascading perfection', popular: true },
    { id: 6, category: 'Specialty', name: 'Matcha Latte', price: 5.50, description: 'Ceremonial grade matcha with oat milk', popular: false },
    { id: 7, category: 'Specialty', name: 'Turmeric Golden Latte', price: 5.00, description: 'Anti-inflammatory spiced blend with steamed milk', popular: false },
    { id: 8, category: 'Food', name: 'Avocado Toast', price: 8.50, description: 'Sourdough with smashed avo, microgreens & chili flakes', popular: true },
    { id: 9, category: 'Food', name: 'Acai Bowl', price: 10.00, description: 'Organic acai topped with granola, banana & berries', popular: true },
  ];
  res.json({ success: true, data: menu });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: 'Route not found.' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server Error:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' ? 'Something went wrong.' : err.message
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🌿 Green Coffee Café Server running on port ${PORT}`);
  console.log(`🔗 API URL: http://localhost:${PORT}/api`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}\n`);
});

module.exports = app;
