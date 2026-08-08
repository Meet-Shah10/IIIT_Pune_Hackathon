// server.js – main entry point
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const { extractMemoryAndRespond } = require('./services/memoryService');
const { classifySensitivity } = require('./services/privacyClassifier');
const Memory = require('./models/Memory');
const MemoryEvent = require('./models/MemoryEvent');
const Message = require('./models/Message');
const Settings = require('./models/Settings');
const ChatSession = require('./models/ChatSession');
const memoryRoutes = require('./routes/memoryRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const userIdMiddleware = require('./middleware/userId');
const { startMemoryCleanupCron } = require('./services/memoryCleanup');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(userIdMiddleware);

// DB connection
connectDB();

function buildChatSessionId() {
  return `session_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

// -------------------------------------------------------------------
// Session creation endpoint for the new-chat flow
// -------------------------------------------------------------------
app.post('/api/chat/sessions', async (req, res) => {
  const { userId } = req.body;
  const resolvedUserId = userId || req.headers['x-user-id'];

  if (!resolvedUserId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  const sessionId = buildChatSessionId();
  try {
    await ChatSession.create({
      sessionId,
      userId: resolvedUserId,
      title: 'New Chat'
    });
    return res.json({ sessionId, userId: resolvedUserId });
  } catch (err) {
    console.error('Error creating chat session:', err);
    return res.status(500).json({ error: 'Failed to create chat session' });
  }
});

// GET /api/chat/sessions/:userId
app.get('/api/chat/sessions/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const sessions = await ChatSession.find({ userId }).sort({ createdAt: -1 });
    return res.json(sessions);
  } catch (err) {
    console.error('Error fetching sessions:', err);
    return res.status(500).json({ error: 'Failed to fetch sessions' });
  }
});

// -------------------------------------------------------------------
// Primary chat endpoint – now respects memory & session history
// -------------------------------------------------------------------
app.post('/api/chat', async (req, res) => {
  const { userId, sessionId, message, memoryEnabled, useContext, language } = req.body;
  console.log('Payload received:', req.body);

  if (!userId || !sessionId || !message) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // 1️⃣ Fetch recent chat history (last 15 messages for this session)
    const rawHistory = await Message.find({ sessionId })
      .sort({ createdAt: -1 })
      .limit(15);
    const recentHistory = rawHistory.reverse();

    // 2️⃣ Pull active memories (negotiated facts) if "Use Memory" toggle is on
    let injectedRelevantMemories = 'None';
    if (useContext) {
      const activeMemories = await Memory.find({ userId, status: 'active' });
      if (activeMemories.length) {
        injectedRelevantMemories = activeMemories
          .map(m => `- ${m.content} (category: ${m.category})`)
          .join('\n');
      }
    }

    const promptParts = [];
    promptParts.push(`You are a helpful AI assistant.

<truth_hierarchy>
1. Current User Input (highest priority)
2. Conversation History
3. Long-Term Memory Facts (lowest priority - if a long-term memory contradicts recent conversation history, prioritize the recent conversation)
</truth_hierarchy>

<long_term_memories>
${injectedRelevantMemories}
</long_term_memories>

Instruction: Rely ONLY on the provided memories for personal user facts. Do not invent or assume facts not present in <long_term_memories> or <conversation_history>.`);

    // Language requirement
    const langName = typeof language === 'object' ? language?.name : language;
    if (langName) {
      promptParts.push(`Language directive: You MUST write the conversational "reply" in ${langName}.`);
    }

    const systemPrompt = promptParts.join('\n\n');

    // 3️⃣ Feed both Recent Chat History & Negotiated Facts into LLM call
    const extracted = await extractMemoryAndRespond(message, systemPrompt, recentHistory);
    const replyContent = extracted?.reply || extracted?.message || extracted?.response || 'I am processing your request.';

    // 4️⃣ Save User's new message and AI's response back to MongoDB
    await Message.create({
      sessionId,
      role: 'user',
      content: message,
      createdAt: new Date(),
      wasFactExtracted: Boolean(extracted?.negotiation_prompt),
    });

    // Update Session Title to first message if it's currently default
    try {
      const session = await ChatSession.findOne({ sessionId });
      if (session && session.title === 'New Chat') {
        const cleanTitle = message.split(' ').slice(0, 5).join(' ') + (message.split(' ').length > 5 ? '...' : '');
        session.title = cleanTitle || 'New Chat';
        await session.save();
      }
    } catch (err) {
      console.error('Error updating session title:', err);
    }

    await Message.create({
      sessionId,
      role: 'assistant',
      content: replyContent,
      createdAt: new Date(),
      wasFactExtracted: false,
    });

    // 5️⃣ If memory enabled and a negotiation_prompt exists, classify & store
    let memorySaved = false;
    if (memoryEnabled && extracted?.negotiation_prompt) {
      const { content, category, reason } = extracted.negotiation_prompt;
      const classification = await classifySensitivity(content, category);
      const memoryReason = reason || classification.reasoning || 'User shared a durable personal detail';

      let expiresAt = null;
      let autoDelete = false;

      // Fetch user settings to determine default retention
      let userSettings = await Settings.findOne({ userId });
      let retentionDays = userSettings ? userSettings.defaultRetentionDays : 30;

      if (retentionDays !== null) {
        expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + retentionDays);
        autoDelete = true;
      }

      const newMemory = await Memory.create({
        userId,
        content,
        category: category || 'misc',
        sensitivity: classification.sensitivity,
        reasoning: memoryReason,
        source: classification.source || 'chat',
        expiresAt,
        autoDelete: true,
      });

      await MemoryEvent.create({
        userId,
        memoryId: newMemory._id,
        action: 'extracted',
        detail: `Saved memory: "${content}"`,
        reason: memoryReason,
        memoryContent: content,
        memoryCategory: category || 'general',
        memorySensitivity: classification.sensitivity,
        savedAt: newMemory.createdAt,
      });

      extracted.negotiation_prompt = {
        ...extracted.negotiation_prompt,
        sensitivity: classification.sensitivity,
        source: classification.source || 'chat',
        reasoning: memoryReason,
      };
      memorySaved = true;
    }

    // 6️⃣ Respond
    return res.json({
      reply: replyContent,
      negotiation_prompt: extracted?.negotiation_prompt || null,
      memorySaved,
    });
  } catch (err) {
    console.error('Memory extraction error:', err);
    return res.status(500).json({ error: 'Failed to process chat', details: err.message });
  }
});

// GET endpoint to retrieve session chat history
app.get('/api/chat/history/:sessionId', async (req, res) => {
  const { sessionId } = req.params;
  try {
    const history = await Message.find({ sessionId }).sort({ createdAt: 1 });
    return res.json(history);
  } catch (err) {
    console.error('Fetch history error:', err);
    return res.status(500).json({ error: 'Failed to fetch history' });
  }
});

// -------------------------------------------------------------------
// Memory CRUD endpoints (future dashboard)
// -------------------------------------------------------------------
app.use('/api/memories', memoryRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/settings', settingsRoutes);

// Start cron jobs
startMemoryCleanupCron();

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});