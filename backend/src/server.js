import app from './app.js'
import { connectDB } from './services/dbService.js'

const PORT = process.env.PORT || 5000

const start = async () => {
  await connectDB()
  app.listen(PORT, () => {
    console.log(`[INFO] Server running on port ${PORT}`)
  })
}

start()
