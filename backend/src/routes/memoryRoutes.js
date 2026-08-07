import express from 'express'
import { getMemories, getEvents, forgetMemory, getChatHistory } from '../controllers/memoryController.js'

const router = express.Router()

router.get('/', getMemories)
router.get('/events', getEvents)
router.get('/chat-history', getChatHistory)
router.delete('/:id', forgetMemory)

export default router
