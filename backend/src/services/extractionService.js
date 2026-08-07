import Memory from '../models/Memory.js'
import MemoryEvent from '../models/MemoryEvent.js'
import { extractMemoryFromMessage } from './llmClient.js'

/**
 * Handles the background extraction of memory from a user message.
 */
export const processSilentExtraction = async (userId, messageId, messageText) => {
  try {
    const extractedItems = await extractMemoryFromMessage(messageText)
    
    if (!extractedItems || extractedItems.length === 0) return

    for (const item of extractedItems) {
      // Create memory
      const memory = await Memory.create({
        userId,
        content: item.content,
        category: item.category || 'general',
        sensitivity: item.sensitivity || 'low',
        status: 'active',
        sourceMessageId: messageId,
        // Phase 4: We'll add 7-day expiration logic here later
      })

      // Create audit event
      await MemoryEvent.create({
        memoryId: memory._id,
        userId,
        action: 'extracted',
        detail: `Auto-extracted from chat: "${item.content}"`
      })
    }
    
    console.log(`[Memory Extraction] Stored ${extractedItems.length} new facts for user ${userId}`)
  } catch (error) {
    console.error('[Memory Extraction Error]:', error)
  }
}
