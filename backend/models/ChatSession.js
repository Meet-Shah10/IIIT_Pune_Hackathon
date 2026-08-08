// models/ChatSession.js
const mongoose = require('mongoose');

const ChatSessionSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, unique: true },
  userId: { type: String, required: true, index: true },
  title: { type: String, default: 'New Chat' },
  deleteAt: { type: Date, default: null }, // for auto-deletion timer
}, { timestamps: true });

module.exports = mongoose.model('ChatSession', ChatSessionSchema);
