// backend/createAdmin.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function main() {
  await mongoose.connect(process.env.MONGO_URI);
  const User = require('./models/User');
  
  // Pehle check karo admin already exist karta hai ya nahi
  const exists = await User.findOne({ email: 'admin@shop.com' });
  if (exists) {
    console.log('Admin already exists!');
    process.exit();
  }

  const hash = await bcrypt.hash('admin123', 10);
  await User.create({
    name: 'Admin',
    email: 'admin@shop.com',
    password: hash,
    isAdmin: true
  });
  console.log('✅ Admin created!');
  console.log('Email: admin@shop.com');
  console.log('Password: admin123');
  process.exit();
}

main().catch(err => { console.log(err); process.exit(); });