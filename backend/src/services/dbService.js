import mongoose from 'mongoose'
import { logger } from '../utils/logger.js'

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    logger.info('MongoDB connected')
  } catch (err) {
    logger.error('MongoDB connection failed:', err.message)
    process.exit(1)
  }
}
