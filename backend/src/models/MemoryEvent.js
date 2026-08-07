import mongoose from 'mongoose'

const memoryEventSchema = new mongoose.Schema({
  memoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Memory',
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  action: {
    type: String,
    enum: ['extracted', 'forgotten', 'updated'],
    required: true,
  },
  detail: {
    type: String,
    required: true,
  },
  reason: {
    type: String,
    default: ''
  },
  memoryContent: {
    type: String,
    default: ''
  },
  memoryCategory: {
    type: String,
    default: 'general'
  },
  memorySensitivity: {
    type: String,
    default: 'low'
  },
  savedAt: {
    type: Date,
    default: null
  }
}, { timestamps: true })

// Index for fast timeline fetching
memoryEventSchema.index({ memoryId: 1, createdAt: -1 })
memoryEventSchema.index({ userId: 1, createdAt: -1 })

export default mongoose.model('MemoryEvent', memoryEventSchema)
