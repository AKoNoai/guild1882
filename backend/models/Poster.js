const mongoose = require('mongoose');

const posterSchema = new mongoose.Schema({
  imageUrl: {
    type: String,
    required: true
  },
  imagePublicId: {
    type: String,
    default: ''
  }
}, { timestamps: true });

module.exports = mongoose.model('Poster', posterSchema);
