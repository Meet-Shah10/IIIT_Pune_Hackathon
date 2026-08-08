// routes/settingsRoutes.js
const express = require('express');
const router = express.Router();
const Settings = require('../models/Settings');

// Get settings for a user (creates default if it doesn't exist)
router.get('/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    let settings = await Settings.findOne({ userId });
    if (!settings) {
      settings = await Settings.create({ userId, defaultRetentionDays: 30 });
    }
    res.json(settings);
  } catch (err) {
    console.error('Error fetching settings:', err);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// Update settings for a user
router.patch('/:userId', async (req, res) => {
  const { userId } = req.params;
  const { defaultRetentionDays } = req.body;
  
  try {
    const settings = await Settings.findOneAndUpdate(
      { userId },
      { $set: { defaultRetentionDays } },
      { new: true, upsert: true }
    );
    res.json(settings);
  } catch (err) {
    console.error('Error updating settings:', err);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

module.exports = router;
