const express  = require('express');
const router   = express.Router();
const Product  = require('../models/Product');
const auth     = require('../middleware/auth');

// Upload middleware — Cloudinary ya local
let upload;
try {
  upload = require('../middleware/upload');
} catch {
  const multer = require('multer');
  upload = multer({ storage: multer.memoryStorage() });
}

// ── GET all products ──────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const {
      category, search, sort,
      page  = 1,
      limit = 12,
      minPrice, maxPrice,
      featured,
    } = req.query;

    const query = {};
    if (category && category !== 'all' && category !== 'All')
      query.category = category;
    if (featured === 'true')
      query.featured = true;
    if (search)
      query.$or = [
        { name:        { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { brand:       { $regex: search, $options: 'i' } },
      ];
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    const sortMap = {
      'newest':     { createdAt: -1 },
      'price-low':  { price:  1     },
      'price-high': { price: -1     },
      'rating':     { rating: -1    },
      'popular':    { numReviews:-1  },
    };
    const sortObj  = sortMap[sort] || { createdAt: -1 };
    const skip     = (Number(page) - 1) * Number(limit);
    const total    = await Product.countDocuments(query);
    const products = await Product.find(query)
      .sort(sortObj)
      .skip(skip)
      .limit(Number(limit))
      .lean();

    res.json({
      products,
      total,
      pages:   Math.ceil(total / Number(limit)),
      page:    Number(page),
      hasMore: skip + products.length < total,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── GET featured products ─────────────────────────────────────
router.get('/featured', async (req, res) => {
  try {
    const products = await Product.find({ featured: true, stock: { $gt: 0 } })
      .sort({ createdAt: -1 }).limit(8).lean();
    res.json({ products });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── GET single product ────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).lean();
    if (!product)
      return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── CREATE product ────────────────────────────────────────────
router.post('/', auth, async (req, res) => {
  try {
    upload.array('images', 5)(req, res, async (err) => {
      if (err) console.log('Upload warning:', err.message);

      const {
        name, description, price,
        category, stock, brand,
        featured, imageUrl,
      } = req.body;

      if (!name || !price)
        return res.status(400).json({ message: 'Name and price required' });

      const images = [];
      if (req.files?.length > 0) {
        req.files.forEach(f => images.push(f.path || f.location || ''));
      }
      if (imageUrl) images.push(imageUrl);

      const product = await Product.create({
        name,
        description: description || '',
        price:       Number(price),
        category:    category    || 'General',
        stock:       Number(stock) || 0,
        brand:       brand       || '',
        featured:    featured === 'true' || featured === true,
        images,
        image:       images[0]   || '',
      });

      res.status(201).json(product);
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── UPDATE product ────────────────────────────────────────────
router.put('/:id', auth, async (req, res) => {
  try {
    upload.array('images', 5)(req, res, async (err) => {
      if (err) console.log('Upload warning:', err.message);

      const product = await Product.findById(req.params.id);
      if (!product)
        return res.status(404).json({ message: 'Not found' });

      const updateData = { ...req.body };
      if (updateData.price)    updateData.price    = Number(updateData.price);
      if (updateData.stock)    updateData.stock    = Number(updateData.stock);
      if (updateData.featured) updateData.featured = updateData.featured === 'true';

      if (req.files?.length > 0) {
        const newImgs = req.files.map(f => f.path || f.location || '');
        updateData.images = newImgs;
        updateData.image  = newImgs[0];
      } else if (updateData.imageUrl) {
        updateData.images = [updateData.imageUrl];
        updateData.image  = updateData.imageUrl;
      }

      const updated = await Product.findByIdAndUpdate(
        req.params.id,
        { $set: updateData },
        { new: true }
      );
      res.json(updated);
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── DELETE product ────────────────────────────────────────────
router.delete('/:id', auth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product)
      return res.status(404).json({ message: 'Not found' });
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── ADD review ────────────────────────────────────────────────
router.post('/:id/reviews', auth, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product)
      return res.status(404).json({ message: 'Not found' });

    const alreadyReviewed = product.reviews?.find(
      r => r.user?.toString() === req.user._id.toString()
    );
    if (alreadyReviewed)
      return res.status(400).json({ message: 'Already reviewed' });

    product.reviews = product.reviews || [];
    product.reviews.push({
      user:    req.user._id,
      name:    req.user.name,
      rating:  Number(rating),
      comment: comment || '',
    });
    product.numReviews = product.reviews.length;
    product.rating     = product.reviews.reduce((a,r) => a + r.rating, 0) / product.reviews.length;
    await product.save();
    res.status(201).json({ message: 'Review added' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;