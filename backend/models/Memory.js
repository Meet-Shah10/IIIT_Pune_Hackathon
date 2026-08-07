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
}, { timestamps: true });

module.exports = mongoose.model('Memory', MemorySchema);
