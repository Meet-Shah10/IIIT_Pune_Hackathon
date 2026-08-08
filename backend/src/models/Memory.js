import mongoose from 'mongoose'

const memorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    enum: ['goal', 'preference', 'fact', 'identity', 'general'],
    default: 'general'
  },
  sensitivity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'low'
  },
  reasoning: {
    type: String,
    default: ''
  },
  source: {
    type: String,
    default: 'chat'
  },
  status: {
    type: String,
    enum: ['active', 'expired', 'forgotten'],
    default: 'active'
  },
  expiresAt: {
    type: Date,
    default: null // null means permanent
  },
  sourceMessageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
    required: false
  }
}, { timestamps: true })

export default mongoose.model('Memory', memorySchema)
