const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');
require('dotenv').config();

const app = express();

app.use(cors({
  origin: 'https://mern-ecommerce-platform-fui5.vercel.app',
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"]
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Routes ────────────────────────────────────────────────────
app.use('/api/auth',     require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders',   require('./routes/orders'));
app.use('/api/cart',     require('./routes/cart'));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', db: mongoose.connection.readyState });
});

// ── MongoDB ───────────────────────────────────────────────────
mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS:          60000,
})
.then(() => {
  console.log('✅ MongoDB Connected');
  app.listen(process.env.PORT || 5000, () => {
    console.log('✅ Server on port', process.env.PORT || 5000);
  });
})
.catch(err => {
  console.error('❌ MongoDB failed:', err.message);
});