const mongoose = require('mongoose');

const scoreSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  score: {
    type: Number,
    required: [true, 'Score is required'],
    min: [0, 'Score must be >= 0']
  },
  imageUrl: {
    type: String,
    default: ''
  },
  imagePublicId: {
    type: String,
    default: ''
  }
}, { timestamps: true });

module.exports = mongoose.model('Score', scoreSchema);
