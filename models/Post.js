const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 100 },
  body: { type: String, required: true, trim: true, maxlength: 1000 },
  authorUsername: { type: String, required: true, trim: true, lowercase: true },
  authorName: { type: String, required: true, trim: true },
  likes: { type: Number, default: 0 },
  likedBy: { type: [String], default: [] },
  replies: {
    type: [
      {
        authorUsername: { type: String, required: true, trim: true, lowercase: true },
        authorName: { type: String, required: true, trim: true },
        body: { type: String, required: true, trim: true, maxlength: 280 },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    default: [],
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Post', postSchema);
