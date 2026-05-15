const express = require('express');
const router  = express.Router();
const mongoose = require('mongoose');
const auth    = require('../middleware/auth');

// ✅ Safe Model Loading (Model overlap se bachne ke liye)
const getOrderModel = () => {
  return mongoose.models.Order || require('../models/Order');
};

// ── CREATE ORDER ──────────────────────────────────────────────
router.post('/', auth, async (req, res) => {
  try {
    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      shippingPrice,
      taxPrice,
      totalPrice,
    } = req.body;

    if (!orderItems || orderItems.length === 0)
      return res.status(400).json({ message: 'No items in order' });

    const Order = getOrderModel();
    const order = await Order.create({
      user: req.user._id,
      orderItems: orderItems.map(i => ({
        name:     i.name     || '',
        quantity: Number(i.quantity) || 1,
        image:    i.image    || '',
        price:    Number(i.price) || 0,
        product:  i.product  || i._id || null,
      })),
      shippingAddress: {
        address: shippingAddress?.address || '',
        city:    shippingAddress?.city    || '',
        phone:   shippingAddress?.phone   || '',
        country: 'Pakistan',
      },
      paymentMethod:  paymentMethod  || 'Cash on Delivery',
      itemsPrice:     Number(itemsPrice)    || 0,
      shippingPrice:  Number(shippingPrice) || 0,
      taxPrice:       Number(taxPrice)      || 0,
      totalPrice:     Number(totalPrice),
      isPaid:         false,
      isDelivered:    false,
      status:         'pending',
    });

    res.status(201).json(order);
  } catch (err) {
    console.error('Order create error:', err);
    res.status(500).json({ message: err.message });
  }
});

// ── MY ORDERS (User only) ─────────────────────────────────────
router.get('/myorders', auth, async (req, res) => {
  try {
    const Order = getOrderModel();
    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .lean();
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── ALL ORDERS (Admin Only) ───────────────────────────────────
router.get('/', auth, async (req, res) => {
  try {
    if (!req.user.isAdmin)
      return res.status(403).json({ message: 'Admin only access' });

    const Order = getOrderModel();
    const orders = await Order.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .lean();
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── SINGLE ORDER ──────────────────────────────────────────────
router.get('/:id', auth, async (req, res) => {
  try {
    const Order = getOrderModel();
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email')
      .lean();
    if (!order)
      return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── UPDATE STATUS (Admin Only) ────────────────────────────────
router.put('/:id/status', auth, async (req, res) => {
  try {
    if (!req.user.isAdmin)
      return res.status(403).json({ message: 'Admin only access' });

    const { status } = req.body;
    const Order = getOrderModel();
    const order = await Order.findById(req.params.id);

    if (!order) return res.status(404).json({ message: 'Order not found' });

    // Status update logic
    order.status = status;

    // Agar status delivered ho toh baaki fields bhi update hon
    if (status === 'delivered') {
      order.isDelivered = true;
      order.deliveredAt = new Date();
    }
    
    // Agar status processing ya shuru ho jaye toh pay status bhi change ho sakta hai depending on method
    if (status === 'processing' && order.paymentMethod === 'Cash on Delivery') {
        // COD mein processing ka matlab hai order confirm ho gaya
    }

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── MARK PAID ─────────────────────────────────────────────────
router.put('/:id/pay', auth, async (req, res) => {
  try {
    const Order = getOrderModel();
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.isPaid  = true;
    order.paidAt  = new Date();
    order.status  = 'processing';
    
    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;