const cron = require('node-cron');
const Memory = require('../models/Memory');
const MemoryEvent = require('../models/MemoryEvent');

function startMemoryCleanupCron() {
  // Run every hour to check for expired memories
  cron.schedule('0 * * * *', async () => {
    console.log('[Cron] Running memory cleanup check...');
    try {
      const now = new Date();
      // Find memories that have an expiresAt date in the past, are active, and have autoDelete enabled
      const expiredMemories = await Memory.find({
        status: 'active',
        autoDelete: true,
        expiresAt: { $lte: now }
      });

      if (expiredMemories.length === 0) {
        console.log('[Cron] No expired memories found.');
        return;
      }

      for (const mem of expiredMemories) {
        mem.status = 'archived';
        await mem.save();

        await MemoryEvent.create({
          userId: mem.userId,
          memoryId: mem._id,
          action: 'expired',
          detail: `Memory automatically expired on timer: "${mem.content}"`,
          reason: 'Memory reached its scheduled deletion time.',
          memoryContent: mem.content,
          memoryCategory: mem.category || 'general',
          memorySensitivity: mem.sensitivity || 'low',
          savedAt: new Date(),
        });

        console.log(`[Cron] Auto-deleted (archived) memory ID: ${mem._id}`);
      }

      console.log(`[Cron] Successfully processed ${expiredMemories.length} expired memories.`);
    } catch (err) {
      console.error('[Cron] Error during memory cleanup:', err);
    }
  });
}

module.exports = { startMemoryCleanupCron };
