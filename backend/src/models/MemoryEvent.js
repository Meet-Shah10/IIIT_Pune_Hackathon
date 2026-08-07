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
  }
}, { timestamps: true })

// Index for fast timeline fetching
memoryEventSchema.index({ memoryId: 1, createdAt: -1 })
memoryEventSchema.index({ userId: 1, createdAt: -1 })

export default mongoose.model('MemoryEvent', memoryEventSchema)
