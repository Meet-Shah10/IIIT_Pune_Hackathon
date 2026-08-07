import { GoogleGenerativeAI } from '@google/generative-ai'
import dotenv from 'dotenv'

dotenv.config()

// Initialize Gemini Client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
// Prefer gemini-1.5-flash for speed/chat or gemini-2.5-flash
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

/**
 * Generate a standard chat response.
 * If useContext is true, contextString should be injected into the system prompt.
 */
export const generateChatResponse = async (history, contextString = '') => {
  const systemInstruction = `You are MemCommit, an AI Memory Negotiation assistant. 
Your goal is to be helpful, concise, and aware of the user's explicit memory context.
If context is provided, use it to personalize your answers.
DO NOT mention that you are extracting memories unless the user asks.

CONTEXT ABOUT THE USER (Only valid for this session if provided):
${contextString || 'No stored memory context provided.'}
`

  try {
    const chat = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
      systemInstruction
    })

    const formattedHistory = history.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }))

    // We take the last message out to use as the prompt
    const lastMsg = formattedHistory.pop()

    const chatSession = chat.startChat({
      history: formattedHistory,
    })

    const result = await chatSession.sendMessage(lastMsg.parts[0].text)
    return result.response.text()
  } catch (error) {
    console.error('Error generating chat response:', error)
    throw new Error('Failed to generate AI response.')
  }
}

/**
 * Silent extraction prompt: uses Structured Outputs (JSON schema)
 * to extract facts/preferences/identity.
 */
export const extractMemoryFromMessage = async (messageText) => {
  const extractionPrompt = `
You are a highly precise entity extraction system.
Analyze the following user message and extract any NEW personal facts, preferences, identity details, or goals.
Do not extract transient state (e.g., "I am tired right now").
If there is nothing to extract, return an empty array.

Categories: 'goal', 'preference', 'fact', 'identity', 'general'
Sensitivity: 'low', 'medium', 'high', 'critical'
(Determine sensitivity based on standard privacy norms: e.g. names/locations = medium/high, SSN/health = critical, favorite color = low)

Respond STRICTLY in this JSON format:
{
  "memories": [
    {
      "content": "User's extracted fact written in third person",
      "category": "fact",
      "sensitivity": "low"
    }
  ]
}

User Message: "${messageText}"
`

  try {
    const result = await model.generateContent(extractionPrompt)
    const text = result.response.text()
    
    // Clean up markdown formatting if present
    const cleanText = text.replace(/```json\n?|```/g, '').trim()
    
    const parsed = JSON.parse(cleanText)
    return parsed.memories || []
  } catch (error) {
    console.error('Error extracting memory:', error)
    return []
  }
}
