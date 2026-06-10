const mongoose = require('mongoose');

const profileItemSchema = new mongoose.Schema({
  label: { type: String, required: true },
  buttonText: { type: String, required: true },
  buttonUrl: { type: String, default: '' },
  buttonColor: { type: String, default: 'blue' }, // blue, red, green, yellow, purple, gray
  buttonIcon: { type: String, default: '' } // facebook, youtube, zalo, android, ios, link, group, gift
}, { _id: true });

const profileSectionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  items: [profileItemSchema]
}, { _id: true });

const profileSchema = new mongoose.Schema({
  sections: [profileSectionSchema]
}, { timestamps: true });

module.exports = mongoose.model('Profile', profileSchema);
