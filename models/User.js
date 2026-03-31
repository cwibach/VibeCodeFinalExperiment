const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  username: { type: String, required: true, trim: true, lowercase: true, unique: true },
  email: { type: String, required: true, trim: true, lowercase: true, unique: true },
  passwordHash: { type: String, required: true },
  dob: { type: Date, required: true },
  bio: { type: String, default: '', trim: true, maxlength: 500 },
  avatarUrl: { type: String, default: '', trim: true, maxlength: 1000 },
  createdAt: { type: Date, default: Date.now },
});

userSchema.index({ username: 1 }, { unique: true });
userSchema.index({ email: 1 }, { unique: true });

module.exports = mongoose.model('User', userSchema);
