import Memory from '../models/Memory.js'
import MemoryEvent from '../models/MemoryEvent.js'
import Message from '../models/Message.js'

export const getMemories = async (req, res) => {
  try {
    const userId = req.user ? req.user.id : '64f0a2b9e4b0a1a2b3c4d5e6'
    const memories = await Memory.find({ userId }).sort({ createdAt: -1 })
    res.json(memories)
  } catch (error) {
    console.error('Error fetching memories:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const getEvents = async (req, res) => {
  try {
    const userId = req.user ? req.user.id : '64f0a2b9e4b0a1a2b3c4d5e6'
    const events = await MemoryEvent.find({ userId }).sort({ createdAt: -1 }).limit(50)
    res.json(events)
  } catch (error) {
    console.error('Error fetching events:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const forgetMemory = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user ? req.user.id : '64f0a2b9e4b0a1a2b3c4d5e6'
    
    const memory = await Memory.findOne({ _id: id, userId })
    if (!memory) {
      return res.status(404).json({ error: 'Memory not found' })
    }

    memory.status = 'forgotten'
    await memory.save()

    // Create event
    await MemoryEvent.create({
      memoryId: memory._id,
      userId,
      action: 'forgotten',
      detail: 'User explicitly revoked this memory via dashboard.'
    })

    res.json(memory)
  } catch (error) {
    console.error('Error forgetting memory:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const getChatHistory = async (req, res) => {
  try {
    const userId = req.user ? req.user.id : '64f0a2b9e4b0a1a2b3c4d5e6'
    const messages = await Message.find({ userId }).sort({ createdAt: 1 })
    res.json(messages)
  } catch (error) {
    console.error('Error fetching chat history:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}
