// routes/memoryRoutes.js – CRUD endpoints for memories (basic implementation)
const express = require('express');
const router = express.Router();
const Memory = require('../models/Memory');
const MemoryEvent = require('../models/MemoryEvent');
const { buildTimelineEvent } = require('../services/timelineService');

router.get('/events', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] || req.query.userId || req.params.userId;
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const events = await MemoryEvent.find({ userId }).sort({ createdAt: -1 }).limit(100);
    const memoryIds = events
      .map((event) => event.memoryId)
      .filter(Boolean);

    const memories = await Memory.find({ _id: { $in: memoryIds } });
    const memoryMap = new Map(memories.map((memory) => [String(memory._id), memory]));

    const timelineEvents = events.map((event) => {
      const memory = memoryMap.get(String(event.memoryId)) || null;
      return buildTimelineEvent(event.toObject(), memory ? memory.toObject() : null);
    });

    res.json(timelineEvents);
  } catch (err) {
    console.error('Error fetching timeline events:', err);
    res.status(500).json({ error: 'Failed to fetch timeline events' });
  }
});

// Get all memories for a user (optional filter by status)
router.get('/:userId', async (req, res) => {
  const { userId } = req.params;
  const { status } = req.query; // e.g., ?status=active
  try {
    const filter = { userId };
    if (status) filter.status = status;
    const memories = await Memory.find(filter).sort({ createdAt: -1 });
    res.json(memories);
  } catch (err) {
    console.error('Error fetching memories:', err);
    res.status(500).json({ error: 'Failed to fetch memories' });
  }
});

// Delete a memory (soft-archive)
router.delete('/:memoryId', async (req, res) => {
  const { memoryId } = req.params;
  try {
    const mem = await Memory.findByIdAndUpdate(memoryId, { status: 'archived' }, { new: true });
    if (!mem) return res.status(404).json({ error: 'Memory not found' });

    await MemoryEvent.create({
      userId: mem.userId,
      memoryId,
      action: 'forgotten',
      detail: `User revoked memory: "${mem.content}"`,
      reason: mem.reasoning || 'User explicitly removed this memory',
      memoryContent: mem.content,
      memoryCategory: mem.category || 'general',
      memorySensitivity: mem.sensitivity || 'low',
      savedAt: mem.createdAt,
    });

    res.json({ message: 'Memory archived', memory: mem });
  } catch (err) {
    console.error('Error archiving memory:', err);
    res.status(500).json({ error: 'Failed to archive memory' });
  }
});

module.exports = router;
