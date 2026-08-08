// models/Settings.js - Global user preferences
const mongoose = require('mongoose');

const SettingsSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  defaultRetentionDays: { type: Number, default: 30 }, // null indicates "Never"
}, { timestamps: true });

module.exports = mongoose.model('Settings', SettingsSchema);
