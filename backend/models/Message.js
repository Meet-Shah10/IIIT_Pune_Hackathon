// models/Message.js – Mongoose schema for session chat messages
const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, index: true },
  role: { type: String, enum: ['user', 'assistant'], required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  wasFactExtracted: { type: Boolean, default: false },
  expiresAt: { type: Date, default: null },
}, { timestamps: true });

module.exports = mongoose.model('Message', MessageSchema);
