// routes/memoryRoutes.js – CRUD endpoints for memories (basic implementation)
const express = require('express');
const router = express.Router();
const Memory = require('../models/Memory');
const MemoryEvent = require('../models/MemoryEvent');
const { buildTimelineEvent } = require('../services/timelineService');

router.get('/events', async (req, res) => {
  try {
    const userId = req.user._id.toString();

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
router.get('/', async (req, res) => {
  const userId = req.user._id.toString();
  const { status } = req.query; // e.g., ?status=active
  try {
    const filter = { userId };
    if (status) {
      filter.status = status;
    } else {
      filter.status = { $ne: 'archived' };
    }

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
  const userId = req.user._id.toString();
  try {
    const mem = await Memory.findOne({ _id: memoryId, userId });
    if (!mem) return res.status(404).json({ error: 'Memory not found or unauthorized' });

    mem.status = 'archived';
    await mem.save();

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

// Update memory (e.g. change expiresAt, autoDelete, or content)
router.patch('/:memoryId', async (req, res) => {
  const { memoryId } = req.params;
  const userId = req.user._id.toString();
  const { expiresAt, expiresInMonths, expiresInDays, autoDelete, content } = req.body;
  try {
    const mem = await Memory.findOne({ _id: memoryId, userId });
    if (!mem) return res.status(404).json({ error: 'Memory not found or unauthorized' });

    let eventDetail = '';
    let eventAction = 'updated';

    // Handle content edit — log before/after diff
    if (content !== undefined && content.trim() && content.trim() !== mem.content) {
      const oldContent = mem.content;
      mem.content = content.trim();
      eventDetail = `User edited memory content: "${oldContent}" → "${mem.content}"`;
      eventAction = 'updated';
    }

    if (expiresAt !== undefined) {
      mem.expiresAt = expiresAt;
    } else if (expiresInMonths !== undefined || expiresInDays !== undefined) {
      const now = new Date();
      if (expiresInMonths) {
        now.setMonth(now.getMonth() + parseInt(expiresInMonths, 10));
      }
      if (expiresInDays) {
        now.setDate(now.getDate() + parseInt(expiresInDays, 10));
      }
      mem.expiresAt = now;
      eventDetail = `User set memory timer to ${expiresInMonths || 0} months, ${expiresInDays || 0} days`;
    }

    if (autoDelete !== undefined) mem.autoDelete = autoDelete;

    if (!eventDetail) {
      eventDetail = 'User updated retention settings';
    }

    await mem.save();

    await MemoryEvent.create({
      userId: mem.userId,
      memoryId,
      action: eventAction,
      detail: eventDetail,
      reason: content !== undefined ? 'User manually edited this memory from the dashboard' : 'Manual retention policy change',
      memoryContent: mem.content,
      memoryCategory: mem.category || 'general',
      memorySensitivity: mem.sensitivity || 'low',
      savedAt: new Date(),
    });

    res.json({ message: 'Memory updated', memory: mem });
  } catch (err) {
    console.error('Error updating memory:', err);
    res.status(500).json({ error: 'Failed to update memory' });
  }
});

module.exports = router;
