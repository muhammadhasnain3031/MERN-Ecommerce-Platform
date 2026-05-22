const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  name:     { type: String,  required: true },
  quantity: { type: Number,  required: true, default: 1 },
  image:    { type: String,  default: '' },
  price:    { type: Number,  required: true },
  product:  { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
});

const orderSchema = new mongoose.Schema({
  user: {
    type:     mongoose.Schema.Types.ObjectId,
    ref:      'User',
    required: true,
  },
  orderItems:      [orderItemSchema],
  shippingAddress: {
    address: { type: String, default: '' },
    city:    { type: String, default: '' },
    phone:   { type: String, default: '' },
    country: { type: String, default: 'Pakistan' },
  },
  paymentMethod:  { type: String,  default: 'Cash on Delivery' },
  itemsPrice:     { type: Number,  default: 0 },
  shippingPrice:  { type: Number,  default: 0 },
  taxPrice:       { type: Number,  default: 0 },
  totalPrice:     { type: Number,  required: true },
  isPaid:         { type: Boolean, default: false },
  paidAt:         { type: Date },
  isDelivered:    { type: Boolean, default: false },
  deliveredAt:    { type: Date },
  status:         { type: String,  default: 'pending',
    enum: ['pending','processing','shipped','delivered','cancelled'] },
}, { timestamps: true });

module.exports = mongoose.models.Order ||
  mongoose.model('Order', orderSchema);