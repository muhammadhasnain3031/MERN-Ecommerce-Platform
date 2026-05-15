const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name:     { type: String,  required: true  },
  email:    { type: String,  required: true, unique: true, lowercase: true, trim: true },
  password: { type: String,  required: true  },
  isAdmin:  { type: Boolean, default: false  },
}, { timestamps: true });

// ✅ NO pre-save hook — manually hash karenge route mein
userSchema.methods.matchPassword = async function(entered) {
  return await bcrypt.compare(entered, this.password);
};

module.exports = mongoose.models.User || mongoose.model('User', userSchema);