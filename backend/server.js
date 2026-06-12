const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

const dns = require('dns');
try {
  // Avoid invalid default that can crash in some hosting environments
  dns.setServers(['8.8.8.8']);
} catch (e) {
  console.warn('⚠️ DNS setServers ignored:', e && e.message);
}

// ── Cached MongoDB connection for Vercel serverless ──
let isConnected = false;

const connectDB = async () => {
  if (isConnected) return;
  if (mongoose.connection.readyState === 1) {
    isConnected = true;
    return;
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 15000,
      socketTimeoutMS: 45000,
      bufferCommands: true,
    });
    isConnected = true;
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('❌ MongoDB error:', err);
    isConnected = false;
    throw err;
  }
};

// Middleware
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'https://guild1882-admin.vercel.app',
    'https://guild1882-frt.vercel.app',
    'https://guild1882.vercel.app',
    process.env.FRONTEND_URL || '',
    process.env.ADMIN_URL || ''
  ],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ensure DB is connected before handling API requests
app.use('/api', async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    res.status(503).json({ message: 'Database connection failed', error: err.message });
  }
});

// Routes
app.use('/api/scores', require('./routes/scores'));
app.use('/api/poster', require('./routes/poster'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/weather', require('./routes/weather'));
app.use('/api/profile', require('./routes/profile'));
app.use('/api/insurance', require('./routes/insurance'));

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'Guild1882 API is running 🚀', status: 'ok' });
});

// Initial connection (for local dev, non-serverless)
connectDB().catch(() => {});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

module.exports = app;
