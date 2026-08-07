// routes/dashboardRoutes.js – Aggregates dashboard stats from Memory + MemoryEvent
const express = require('express');
const router = express.Router();
const Memory = require('../models/Memory');
const MemoryEvent = require('../models/MemoryEvent');

// GET /api/dashboard/stats/:userId
router.get('/stats/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // --- Stat 1: Total active memories ---
    const totalActive = await Memory.countDocuments({ userId, status: 'active' });

    // --- Stat 2: New memories this week ---
    const newThisWeek = await Memory.countDocuments({
      userId,
      status: 'active',
      createdAt: { $gte: sevenDaysAgo },
    });

    // --- Stat 3: Total deleted (archived) ---
    const totalDeleted = await Memory.countDocuments({ userId, status: 'archived' });

    // --- Stat 4: Last deletion timestamp ---
    const lastDeleted = await Memory.findOne(
      { userId, status: 'archived' },
      null,
      { sort: { updatedAt: -1 } }
    );
    const lastDeletionAt = lastDeleted ? lastDeleted.updatedAt : null;

    // --- Stat 5: Privacy breakdown by sensitivity ---
    const sensitivityGroups = await Memory.aggregate([
      { $match: { userId, status: 'active' } },
      { $group: { _id: '$sensitivity', count: { $sum: 1 } } },
    ]);

    const sensitivityMap = { low: 0, medium: 0, high: 0, critical: 0 };
    sensitivityGroups.forEach(({ _id, count }) => {
      if (_id && sensitivityMap.hasOwnProperty(_id)) {
        sensitivityMap[_id] = count;
      }
    });

    const total = totalActive || 1; // avoid division by zero
    const privacyBreakdown = {
      high: Math.round(((sensitivityMap.high + sensitivityMap.critical) / total) * 100),
      medium: Math.round((sensitivityMap.medium / total) * 100),
      low: Math.round((sensitivityMap.low / total) * 100),
    };

    // Make sure percentages add to 100 (rounding fix)
    const pSum = privacyBreakdown.high + privacyBreakdown.medium + privacyBreakdown.low;
    if (pSum !== 100 && totalActive > 0) {
      privacyBreakdown.low += 100 - pSum;
    }

    // --- Stat 6: Global Risk Score ---
    let riskScore = 'LOW';
    if (privacyBreakdown.high > 30) riskScore = 'HIGH';
    else if (privacyBreakdown.high > 10) riskScore = 'MEDIUM';

    // --- Auto-archival logic ---
    const expiredMemories = await Memory.find({
      userId,
      status: 'active',
      autoDelete: true,
      expiresAt: { $lt: now }
    });

    for (const mem of expiredMemories) {
      mem.status = 'archived';
      await mem.save();
      await MemoryEvent.create({
        userId,
        memoryId: mem._id,
        action: 'forgotten',
        detail: 'Auto-deleted upon expiration',
        reason: '30-day retention limit reached',
        memoryContent: mem.content,
        memoryCategory: mem.category,
        memorySensitivity: mem.sensitivity,
        savedAt: mem.createdAt
      });
    }

    // --- Stat 7: Upcoming Removals (next 10) ---
    const upcoming = await Memory.find({
      userId,
      status: 'active',
      autoDelete: true,
      expiresAt: { $exists: true }
    })
      .sort({ expiresAt: 1 })
      .limit(10);

    const upcomingRemovals = upcoming.map((m) => ({
      _id: m._id,
      content: m.content,
      category: m.category,
      sensitivity: m.sensitivity,
      expiresAt: m.expiresAt,
      autoDelete: m.autoDelete,
    }));
    
    // --- Stat 8: Expiring in 24h count ---
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const expiring24hCount = await Memory.countDocuments({
      userId,
      status: 'active',
      autoDelete: true,
      expiresAt: { $gte: now, $lte: tomorrow }
    });

    res.json({
      totalActive,
      newThisWeek,
      totalDeleted,
      lastDeletionAt,
      privacyBreakdown,
      riskScore,
      upcomingRemovals,
      expiring24hCount,
    });
  } catch (err) {
    console.error('Dashboard stats error:', err);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

module.exports = router;
