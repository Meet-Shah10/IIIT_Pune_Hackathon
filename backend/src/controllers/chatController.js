import Message from '../models/Message.js'
import Memory from '../models/Memory.js'
import { generateChatResponse } from '../services/llmClient.js'
import { processSilentExtraction } from '../services/extractionService.js'

export const handleChat = async (req, res) => {
  try {
    // We expect { message, allowStorage, useContext, sessionId }
    const { message, allowStorage, useContext, sessionId } = req.body

    // Auth stub: we'll use a hardcoded user ID for the hackathon demo if req.user is missing
    const userId = req.user ? req.user.id : '64f0a2b9e4b0a1a2b3c4d5e6'

    if (!message || !sessionId) {
      return res.status(400).json({ error: 'Message and sessionId are required' })
    }

    // 1. Save User Message
    const userMessage = await Message.create({
      sessionId,
      role: 'user',
      content: message,
      createdAt: new Date(),
      wasFactExtracted: false,
    })

    // 2. Fetch context if useContext is true
    let contextString = ''
    if (useContext) {
      const activeMemories = await Memory.find({ 
        userId, 
        status: 'active' 
      }).select('content category -_id')
      
      if (activeMemories.length > 0) {
        contextString = activeMemories.map(m => `- [${m.category.toUpperCase()}] ${m.content}`).join('\n')
      }
    }

    // 3. Fetch recent history (last 10 messages)
    const recentMessages = await Message.find({ sessionId })
      .sort({ createdAt: -1 })
      .limit(10)

    const history = recentMessages.reverse().map(m => ({
      role: m.role,
      content: m.content
    }))
    
    // Make sure we include the message we just saved
    // Actually, if we just saved it, it should be in recentMessages.

    // 4. Generate AI Response
    const aiResponseContent = await generateChatResponse(history, contextString)

    // 5. Save AI Message
    const aiMessage = await Message.create({
      sessionId,
      role: 'assistant',
      content: aiResponseContent,
      createdAt: new Date(),
      wasFactExtracted: false,
    })

    // 6. Silent Extraction (Async, non-blocking)
    if (allowStorage) {
      // Fire and forget
      processSilentExtraction(userId, userMessage._id, message).catch(console.error)
    }

    res.json({
      message: aiMessage
    })

  } catch (error) {
    console.error('Chat error:', error)
    res.status(500).json({ error: 'Internal server error processing chat' })
  }
}
