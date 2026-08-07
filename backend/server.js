// server.js – main entry point
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const { extractMemoryAndRespond } = require('./services/memoryService');
const { classifySensitivity } = require('./services/privacyClassifier');
const Memory = require('./models/Memory');
const MemoryEvent = require('./models/MemoryEvent');
const memoryRoutes = require('./routes/memoryRoutes');
const userIdMiddleware = require('./middleware/userId');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(userIdMiddleware);

// DB connection
connectDB();

// -------------------------------------------------------------------
// Primary chat endpoint – now respects memoryEnabled toggle
// -------------------------------------------------------------------
app.post('/api/chat', async (req, res) => {
  const { userId, sessionId, message, memoryEnabled, useContext, language } = req.body;
  console.log('Payload received:', req.body);

  if (!userId || !sessionId || !message) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const promptParts = [];

    // Language requirement
    const langName = typeof language === 'object' ? language?.name : language;
    if (langName) {
      promptParts.push(`Language directive: You MUST write the conversational "reply" in ${langName}.`);
    }

    // 1️⃣ Pull active memories only if "Use Memory" toggle is on
    if (useContext) {
      const activeMemories = await Memory.find({ userId, status: 'active' });
      if (activeMemories.length) {
        const facts = activeMemories
          .map(m => `- ${m.content} (category: ${m.category})`)
          .join('\n');
        promptParts.push(`You have the following known facts about the user:\n${facts}\nUse them when replying.`);
      }
    }

    const systemPrompt = promptParts.join('\n\n');

    // 2️⃣ Extract memory & response (systemPrompt passed as second arg)
    const extracted = await extractMemoryAndRespond(message, systemPrompt);

    // 3️⃣ If memory enabled and a negotiation_prompt exists, classify & store
    let memorySaved = false;
    if (memoryEnabled && extracted.negotiation_prompt) {
      const { content, category } = extracted.negotiation_prompt;
      const classification = await classifySensitivity(content, category);

      const newMemory = await Memory.create({
        userId,
        content,
        category: category || 'misc',
        sensitivity: classification.sensitivity,
        reasoning: classification.reasoning,
        source: classification.source,
      });

      await MemoryEvent.create({
        userId,
        memoryId: newMemory._id,
        action: 'CREATED',
      });

      extracted.negotiation_prompt = {
        ...extracted.negotiation_prompt,
        sensitivity: classification.sensitivity,
        source: classification.source,
        reasoning: classification.reasoning,
      };
      memorySaved = true;
    }

    // 4️⃣ Respond
    return res.json({
      reply: extracted.reply,
      negotiation_prompt: extracted.negotiation_prompt || null,
      memorySaved,
    });
  } catch (err) {
    console.error('Memory extraction error:', err);
    return res.status(500).json({ error: 'Failed to process chat', details: err.message });
  }
});

// -------------------------------------------------------------------
// Memory CRUD endpoints (future dashboard)
// -------------------------------------------------------------------
app.use('/api/memories', memoryRoutes);

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});