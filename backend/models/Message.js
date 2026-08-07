// models/Message.js – Mongoose schema for session chat messages
const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  sessionId: { type: String, required: true, index: true },
  role: { type: String, enum: ['user', 'assistant'], required: true },
  content: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Message', MessageSchema);
