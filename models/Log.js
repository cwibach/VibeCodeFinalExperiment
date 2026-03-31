const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
  action: { type: String, required: true },
  username: { type: String, trim: true, lowercase: true },
  success: { type: Boolean, required: true },
  level: { type: String, enum: ['INFO', 'DEBUG', 'ERROR'], required: true },
  message: { type: String, trim: true },
  metadata: { type: Object, default: {} },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Log', logSchema);
