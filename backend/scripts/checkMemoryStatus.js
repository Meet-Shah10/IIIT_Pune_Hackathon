require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const Memory = require('../models/Memory');

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const stats = await Memory.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]);
  console.log('Status breakdown:', JSON.stringify(stats, null, 2));

  const sample = await Memory.findOne({ userId: 'user_2efb895b-b24d-480c-822b-eaf25a1113c6' });
  console.log('Sample memory:', JSON.stringify(sample, null, 2));

  mongoose.disconnect();
});
