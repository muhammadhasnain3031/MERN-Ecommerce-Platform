const router = require('express').Router();
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

// Cart get karo
router.get('/', protect, async (req, res) => {
  const user = await User.findById(req.user.id).populate('cart.product');
  res.json(user.cart);
});

// Cart mein add karo
router.post('/add', protect, async (req, res) => {
  const { productId, quantity } = req.body;
  const user = await User.findById(req.user.id);
  
  const existing = user.cart.find(i => i.product.toString() === productId);
  if (existing) {
    existing.quantity += quantity || 1;
  } else {
    user.cart.push({ product: productId, quantity: quantity || 1 });
  }
  
  await user.save();
  res.json(user.cart);
});

// Cart se remove karo
router.delete('/remove/:productId', protect, async (req, res) => {
  const user = await User.findById(req.user.id);
  user.cart = user.cart.filter(i => i.product.toString() !== req.params.productId);
  await user.save();
  res.json(user.cart);
});

// Cart clear karo (order ke baad)
router.delete('/clear', protect, async (req, res) => {
  await User.findByIdAndUpdate(req.user.id, { cart: [] });
  res.json({ message: 'Cart cleared' });
});

module.exports = router;