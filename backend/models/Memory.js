// models/Memory.js – Mongoose schema for stored memories
const mongoose = require('mongoose');

const MemorySchema = new mongoose.Schema({
  userId: { type: String, required: true },
  content: { type: String, required: true },
  category: { type: String, default: 'misc' },
  sensitivity: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'low' },
  reasoning: { type: String, default: '' },
  source: { type: String, default: 'chat' },
  status: { type: String, enum: ['active', 'archived'], default: 'active' },
  expiresAt: { type: Date },
  autoDelete: { type: Boolean, default: true },
  sessionId: { type: String, default: null },
  confidenceScore: { type: Number, default: 90 },
}, { timestamps: true });

module.exports = mongoose.model('Memory', MemorySchema);
