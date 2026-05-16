const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');
require('dotenv').config();

const app = express();

const corsOptions = {
  origin: 'https://mern-ecommerce-platform-fui5.vercel.app',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
};

app.use(cors(corsOptions));

// Explicitly handle OPTIONS pre-flight requests at app level
app.options('*', cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── MongoDB Connection (Background Level) ─────────────────────
// Isko hum bina block kiye connect karenge taake Vercel functions instantly route utha sakein
mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS:          60000,
})
.then(() => console.log('✅ MongoDB Connected'))
.catch(err => console.error('❌ MongoDB failed:', err.message));

// ── Routes ────────────────────────────────────────────────────
app.use('/api/auth',     require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders',   require('./routes/orders'));
app.use('/api/cart',     require('./routes/cart'));

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    db: mongoose.connection.readyState,
    environment: 'production'
  });
});

// ── Vercel Compatibility / Local Fallback ─────────────────────
// Agar code local computer par chal raha ho toh listen chalega, Vercel par listen bypass ho jayega
if (process.env.NODE_ENV !== 'production') {
  app.listen(process.env.PORT || 5000, () => {
    console.log('✅ Local Server running on port', process.env.PORT || 5000);
  });
}

// Yeh Vercel ke liye sabse important line hai!
module.exports = app;