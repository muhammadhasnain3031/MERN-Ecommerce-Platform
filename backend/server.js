const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');
require('dotenv').config();

const app = express();

// ── CORS Configuration ────────────────────────────────────────
const corsOptions = {
  origin: (origin, callback) => {
    // Allow localhost (any port) for development
    if (!origin || origin.startsWith('http://localhost')) {
      return callback(null, true);
    }
    // Allow ANY *.vercel.app deployment (future-proof — URLs change each deploy)
    if (origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }
    // Add your custom production domains here if needed
    const allowed = [
      'https://mern-ecommerce-platform-fui5.vercel.app',
      'https://mern-ecommerce-platform-olhz.vercel.app',
    ];
    if (allowed.includes(origin)) return callback(null, true);
    callback(new Error('CORS blocked: ' + origin));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
};

app.use(cors(corsOptions));
app.options(/(.*)/, cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── MongoDB Connection ────────────────────────────────────────
let isConnected = false;
const connectDB = async () => {
  if (isConnected) return;
  try {
    const db = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 15000,
      socketTimeoutMS:          30000,
    });
    isConnected = db.connections[0].readyState === 1;
    console.log('✅ MongoDB Connected Successfully');
  } catch (err) {
    console.error('❌ MongoDB Connection Failed:', err.message);
  }
};

app.use(async (req, res, next) => {
  await connectDB();
  next();
});

// ── Routes ────────────────────────────────────────────────────
app.use('/api/auth',     require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders',   require('./routes/orders'));
app.use('/api/cart',     require('./routes/cart'));

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    db: mongoose.connection.readyState,
    environment: 'production_serverless',
  });
});

app.get('/', (req, res) => {
  res.json({ message: '🛒 Sultan Elite E-Commerce API', status: 'running' });
});

// ── Local Server ──────────────────────────────────────────────
if (process.env.NODE_ENV !== 'production') {
  app.listen(process.env.PORT || 5000, () => {
    console.log('✅ Local Server active on port', process.env.PORT || 5000);
  });
}

// ── Global Error Handler ──────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong on the serverless runtime!' });
});

module.exports = app;