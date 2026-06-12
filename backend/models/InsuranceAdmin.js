const mongoose = require('mongoose');

const insuranceAdminSchema = new mongoose.Schema({
  name: { type: String, required: true },
  title: { type: String, required: true },
  facebook: { type: String, required: true },
  zalo: { type: String, required: true },
  tradeTag: { type: String, required: true },
  avatarUrl: { type: String },
  avatarPublicId: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('InsuranceAdmin', insuranceAdminSchema);
