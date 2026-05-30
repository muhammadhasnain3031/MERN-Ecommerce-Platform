// seedProducts.js
// Demo products add karne ke liye
// Run: node seedProducts.js
// Delete all + add fresh: node seedProducts.js --fresh

const mongoose = require('mongoose');
require('dotenv').config();

// Product Schema (flexible - matches your model)
const productSchema = new mongoose.Schema({
  name: String,
  description: String,
  price: Number,
  oldPrice: Number,
  category: String,
  brand: String,
  stock: Number,
  image: String,
  images: [String],
  featured: Boolean,
  rating: Number,
  numReviews: Number,
}, { timestamps: true, strict: false });

const Product = mongoose.model('Product', productSchema);

// Free working images from Unsplash (these will load!)
const DEMO_PRODUCTS = [
  {
    name: 'Wireless Bluetooth Headphones',
    description: 'Premium noise-cancelling headphones with 40-hour battery life, crystal clear sound, and comfortable over-ear design. Perfect for music lovers and professionals.',
    price: 8500, oldPrice: 12000, category: 'Electronics', brand: 'SoundMax',
    stock: 45, featured: true, rating: 4.5, numReviews: 128,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80',
  },
  {
    name: 'Smart Watch Series 7',
    description: 'Advanced fitness tracking, heart rate monitor, GPS, and a stunning always-on display. Water resistant up to 50m with 18-hour battery.',
    price: 15999, oldPrice: 19999, category: 'Electronics', brand: 'TechPro',
    stock: 30, featured: true, rating: 4.7, numReviews: 256,
    image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&q=80',
  },
  {
    name: 'Premium Cotton T-Shirt',
    description: '100% organic cotton, breathable fabric, available in multiple colors. Soft, durable, and perfect for everyday wear.',
    price: 1499, oldPrice: 2000, category: 'Clothing', brand: 'UrbanStyle',
    stock: 100, featured: true, rating: 4.3, numReviews: 89,
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80',
  },
  {
    name: 'Running Shoes Pro',
    description: 'Lightweight athletic shoes with responsive cushioning and breathable mesh. Designed for runners who demand performance and comfort.',
    price: 6999, oldPrice: 9000, category: 'Sports', brand: 'FastFeet',
    stock: 60, featured: true, rating: 4.6, numReviews: 174,
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80',
  },
  {
    name: 'Leather Laptop Backpack',
    description: 'Spacious genuine leather backpack with padded laptop compartment, multiple pockets, and water-resistant finish. Stylish and functional.',
    price: 4500, oldPrice: 6500, category: 'Home', brand: 'CarryAll',
    stock: 40, featured: true, rating: 4.4, numReviews: 67,
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80',
  },
  {
    name: 'Mechanical Gaming Keyboard',
    description: 'RGB backlit mechanical keyboard with tactile switches, anti-ghosting, and durable construction. Built for gamers and typists.',
    price: 7200, oldPrice: 9500, category: 'Electronics', brand: 'GameTech',
    stock: 25, featured: true, rating: 4.8, numReviews: 203,
    image: 'https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=600&q=80',
  },
  {
    name: 'Sunglasses Aviator Classic',
    description: 'Timeless aviator sunglasses with UV400 protection, polarized lenses, and a lightweight metal frame. A must-have accessory.',
    price: 2999, oldPrice: 4000, category: 'Beauty', brand: 'SunShade',
    stock: 80, featured: false, rating: 4.2, numReviews: 45,
    image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&q=80',
  },
  {
    name: 'Stainless Steel Water Bottle',
    description: 'Insulated water bottle that keeps drinks cold for 24h or hot for 12h. BPA-free, leak-proof, and eco-friendly.',
    price: 1299, oldPrice: 1800, category: 'Sports', brand: 'HydroFlask',
    stock: 150, featured: false, rating: 4.5, numReviews: 312,
    image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&q=80',
  },
  {
    name: 'Wireless Charging Pad',
    description: 'Fast 15W wireless charger compatible with all Qi-enabled devices. Sleek design with LED indicator and overcharge protection.',
    price: 2499, oldPrice: 3500, category: 'Electronics', brand: 'ChargeFast',
    stock: 55, featured: false, rating: 4.1, numReviews: 78,
    image: 'https://images.unsplash.com/photo-1591290619762-c8ed45d56e74?w=600&q=80',
  },
  {
    name: 'Denim Jacket Vintage',
    description: 'Classic denim jacket with a vintage wash, comfortable fit, and timeless style. Perfect layering piece for any season.',
    price: 3999, oldPrice: 5500, category: 'Clothing', brand: 'DenimCo',
    stock: 35, featured: false, rating: 4.4, numReviews: 56,
    image: 'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=600&q=80',
  },
  {
    name: 'Desk Lamp LED Modern',
    description: 'Adjustable LED desk lamp with touch control, multiple brightness levels, and USB charging port. Eye-care technology included.',
    price: 2799, oldPrice: 3800, category: 'Home', brand: 'BrightLite',
    stock: 70, featured: false, rating: 4.3, numReviews: 91,
    image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&q=80',
  },
  {
    name: 'Yoga Mat Premium',
    description: 'Extra thick non-slip yoga mat made from eco-friendly TPE material. Lightweight, durable, and includes a carrying strap.',
    price: 1999, oldPrice: 2800, category: 'Sports', brand: 'ZenFit',
    stock: 90, featured: false, rating: 4.6, numReviews: 145,
    image: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=600&q=80',
  },
];

async function seed() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected!\n');

    const fresh = process.argv[2] === '--fresh';

    if (fresh) {
      const deleted = await Product.deleteMany({});
      console.log(`🗑️  Deleted ${deleted.deletedCount} old products (with broken images)\n`);
    }

    console.log('📦 Adding demo products...\n');
    let added = 0;
    for (const p of DEMO_PRODUCTS) {
      // Skip if same name already exists (avoid duplicates)
      const exists = await Product.findOne({ name: p.name });
      if (exists && !fresh) {
        console.log(`   ⏭️  Skipped (exists): ${p.name}`);
        continue;
      }
      await Product.create({ ...p, images: [p.image] });
      added++;
      console.log(`   ✅ Added: ${p.name} - PKR ${p.price.toLocaleString()}`);
    }

    const total = await Product.countDocuments();
    console.log('\n═══════════════════════════════════════════════');
    console.log(`✅ Done! Added ${added} new products`);
    console.log(`📊 Total products in database: ${total}`);
    console.log('═══════════════════════════════════════════════');
    console.log('🎉 Refresh your website to see them!\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

seed();
