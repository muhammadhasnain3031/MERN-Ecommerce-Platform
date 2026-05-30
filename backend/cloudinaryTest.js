// cloudinaryTest.js
// Cloudinary connection test karta hai
// backend folder mein rakho, phir: node cloudinaryTest.js

require('dotenv').config();
const cloudinary = require('cloudinary').v2;

console.log('\n🔍 Testing Cloudinary Configuration...\n');

const name = process.env.CLOUDINARY_CLOUD_NAME;
const key = process.env.CLOUDINARY_API_KEY;
const secret = process.env.CLOUDINARY_API_SECRET;

console.log('CLOUD_NAME:', name || '❌ MISSING');
console.log('API_KEY:   ', key ? key.slice(0, 6) + '...' : '❌ MISSING');
console.log('API_SECRET:', secret ? '***' + ' (length ' + secret.length + ')' : '❌ MISSING');

if (!name || !key || !secret) {
  console.log('\n❌ Cloudinary keys missing in .env!\n');
  process.exit(1);
}

cloudinary.config({ cloud_name: name, api_key: key, api_secret: secret });

// Test the connection by pinging Cloudinary
cloudinary.api.ping()
  .then((result) => {
    console.log('\n✅ SUCCESS! Cloudinary connected:', result.status);
    console.log('🎉 Your credentials are VALID. Image upload should work.\n');
    process.exit(0);
  })
  .catch((err) => {
    console.log('\n❌ CLOUDINARY CONNECTION FAILED!');
    console.log('Error:', err.message || err.error?.message || JSON.stringify(err));
    console.log('\n🔧 SOLUTIONS:');
    console.log('   1. Check your API Secret is correct (copy fresh from Cloudinary dashboard)');
    console.log('   2. Go to: https://console.cloudinary.com/settings/api-keys');
    console.log('   3. Make sure CLOUD_NAME, API_KEY, API_SECRET all match exactly');
    console.log('   4. No extra spaces or quotes in .env file\n');
    process.exit(1);
  });
