const jwt = require('jsonwebtoken');

// Normal user check
const protect = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Not authorized' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Admin only check
const adminOnly = (req, res, next) => {
  if (!req.user?.isAdmin) return res.status(403).json({ message: 'Admin only' });
  next();
};

module.exports = { protect, adminOnly };