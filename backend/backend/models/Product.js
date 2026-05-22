const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name:    String,
  rating:  { type: Number, required: true },
  comment: String,
}, { timestamps: true });

const productSchema = new mongoose.Schema({
  name:        { type: String, required: true },
  description: { type: String, default: '' },
  price:       { type: Number, required: true },
  image:       { type: String, default: '' },
  images:      [{ type: String }],
  category:    { type: String, default: 'General' },
  brand:       { type: String, default: '' },
  stock:       { type: Number, default: 0 },
  rating:      { type: Number, default: 0 },
  numReviews:  { type: Number, default: 0 },
  reviews:     [reviewSchema],
  featured:    { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.models.Product ||
  mongoose.model('Product', productSchema);