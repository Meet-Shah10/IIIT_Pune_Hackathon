// routes/memoryRoutes.js – CRUD endpoints for memories (basic implementation)
const express = require('express');
const router = express.Router();
const Memory = require('../models/Memory');
const MemoryEvent = require('../models/MemoryEvent');

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
    await MemoryEvent.create({ userId: mem.userId, memoryId, action: 'DELETED' });
    res.json({ message: 'Memory archived', memory: mem });
  } catch (err) {
    console.error('Error archiving memory:', err);
    res.status(500).json({ error: 'Failed to archive memory' });
  }
});

module.exports = router;
