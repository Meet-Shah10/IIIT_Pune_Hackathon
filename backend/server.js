// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { extractMemoryAndRespond } = require('./services/memoryService');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Simple in-memory detection for demo – only one feature (memory extraction) implemented
app.post('/api/chat', async (req, res) => {
  const { userId, sessionId, message } = req.body;
  if (!userId || !sessionId || !message) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  try {
    const result = await extractMemoryAndRespond(message);
    // result has { reply, negotiation_prompt }
    return res.json(result);
  } catch (err) {
    console.error('Memory extraction error:', err);
    return res.status(500).json({ error: 'Failed to process chat', details: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});