require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const Memory = require('../models/Memory');
const connectDB = require('../config/db');

async function migrate() {
  try {
    await connectDB();

    const memories = await Memory.find({ expiresAt: { $exists: false } });
    console.log(`Found ${memories.length} memories to migrate.`);

    let updated = 0;
    for (const mem of memories) {
      // Set to createdAt + 30 days
      const expires = new Date(mem.createdAt);
      expires.setDate(expires.getDate() + 30);
      
      mem.expiresAt = expires;
      mem.autoDelete = true;
      await mem.save();
      updated++;
    }

    console.log(`Successfully migrated ${updated} memories.`);
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    mongoose.disconnect();
  }
}

migrate();
