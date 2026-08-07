import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { errorHandler } from './middleware/errorHandler.js'

dotenv.config()

const app = express()

// Middleware
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }))
app.use(express.json())

// Health check
app.get('/health', (req, res) => {
  res.json({ success: true, data: { status: 'ok' } })
})

// TODO: Phase 1 — mount routes
// app.use('/api/auth', authRoutes)
// app.use('/api/chat', chatRoutes)
// app.use('/api/memories', memoryRoutes)

// Centralized error handler (must be last)
app.use(errorHandler)

export default app
