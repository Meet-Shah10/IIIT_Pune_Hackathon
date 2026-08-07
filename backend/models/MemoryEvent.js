// models/MemoryEvent.js – Mongoose schema for memory events (creation, update, deletion)
const mongoose = require('mongoose');

const MemoryEventSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  memoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Memory', required: true },
  action: { type: String, required: true },
  detail: { type: String, default: '' },
  reason: { type: String, default: '' },
  memoryContent: { type: String, default: '' },
  memoryCategory: { type: String, default: 'general' },
  memorySensitivity: { type: String, default: 'low' },
  savedAt: { type: Date, default: null },
}, { timestamps: true });

module.exports = mongoose.model('MemoryEvent', MemoryEventSchema);
