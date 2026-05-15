const express = require('express');
const router  = express.Router();
const jwt     = require('jsonwebtoken');
const bcrypt  = require('bcryptjs');
const User    = require('../models/User');

const SECRET = process.env.JWT_SECRET || 'sultan_elite_secret_2024';
const makeToken = (user) => jwt.sign(
  { id: user._id, isAdmin: user.isAdmin },
  SECRET,
  { expiresIn: '30d' }
);

// ── REGISTER ──────────────────────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ message: 'All fields required' });
    if (password.length < 6)
      return res.status(400).json({ message: 'Password min 6 characters' });

    const exists = await User.findOne({ email: email.toLowerCase().trim() });
    if (exists)
      return res.status(400).json({ message: 'Email already registered' });

    // ✅ Hash manually — no pre-save hook
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name:     name.trim(),
      email:    email.toLowerCase().trim(),
      password: hashedPassword,
      isAdmin:  false,
    });

    return res.status(201).json({
      token: makeToken(user),
      user: {
        _id:     user._id,
        name:    user.name,
        email:   user.email,
        isAdmin: user.isAdmin,
      },
    });
  } catch (err) {
    console.error('Register ERROR:', err.message);
    return res.status(500).json({ message: err.message });
  }
});

// ── LOGIN ─────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: 'Email and password required' });

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user)
      return res.status(400).json({ message: 'Invalid email or password' });

    // ✅ Compare manually
    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(400).json({ message: 'Invalid email or password' });

    return res.json({
      token: makeToken(user),
      user: {
        _id:     user._id,
        name:    user.name,
        email:   user.email,
        isAdmin: user.isAdmin,
      },
    });
  } catch (err) {
    console.error('Login ERROR:', err.message);
    return res.status(500).json({ message: err.message });
  }
});

// ── PROFILE ───────────────────────────────────────────────────
router.get('/profile', require('../middleware/auth'), (req, res) => {
  res.json({
    _id:     req.user._id,
    name:    req.user.name,
    email:   req.user.email,
    isAdmin: req.user.isAdmin,
  });
});

// ── CREATE ADMIN ──────────────────────────────────────────────
router.post('/create-admin', async (req, res) => {
  try {
    const { name, email, password, secret } = req.body;
    if (secret !== (process.env.ADMIN_SECRET || 'admin2024'))
      return res.status(403).json({ message: 'Wrong secret' });

    const exists = await User.findOne({ email });
    if (exists) {
      await User.findByIdAndUpdate(exists._id, { isAdmin: true });
      return res.json({ message: 'Made admin', email });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user   = await User.create({ name, email, password: hashed, isAdmin: true });
    return res.json({ message: 'Admin created', email: user.email });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

module.exports = router;