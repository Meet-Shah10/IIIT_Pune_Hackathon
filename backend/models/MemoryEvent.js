// models/MemoryEvent.js – Mongoose schema for memory events (creation, update, deletion)
const mongoose = require('mongoose');

const MemoryEventSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  memoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Memory', required: true },
  action: { type: String, enum: ['CREATED', 'UPDATED', 'DELETED'], required: true },
}, { timestamps: true });

module.exports = mongoose.model('MemoryEvent', MemoryEventSchema);
