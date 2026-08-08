// server.js – main entry point
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const { extractMemoryAndRespond, generateSessionTitle } = require('./services/memoryService');
const { classifySensitivity } = require('./services/privacyClassifier');
const Memory = require('./models/Memory');
const MemoryEvent = require('./models/MemoryEvent');
const Message = require('./models/Message');
const Settings = require('./models/Settings');
const ChatSession = require('./models/ChatSession');
const memoryRoutes = require('./routes/memoryRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const authRoutes = require('./routes/authRoutes');
const authMiddleware = require('./middleware/authMiddleware');
const { startMemoryCleanupCron } = require('./services/memoryCleanup');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// DB connection
connectDB();

function buildChatSessionId() {
  return `session_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

// -------------------------------------------------------------------
// Session creation endpoint for the new-chat flow
// -------------------------------------------------------------------
app.post('/api/chat/sessions', authMiddleware, async (req, res) => {
  const resolvedUserId = req.user._id.toString();

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

// GET /api/chat/sessions (gets sessions for the logged in user)
app.get('/api/chat/sessions', authMiddleware, async (req, res) => {
  const userId = req.user._id.toString();
  try {
    const sessions = await ChatSession.find({ userId }).sort({ createdAt: -1 });
    return res.json(sessions);
  } catch (err) {
    console.error('Error fetching sessions:', err);
    return res.status(500).json({ error: 'Failed to fetch sessions' });
  }
});

// DELETE /api/chat/sessions/:sessionId
app.delete('/api/chat/sessions/:sessionId', authMiddleware, async (req, res) => {
  const { sessionId } = req.params;
  const userId = req.user._id.toString();
  try {
    // 1. Delete the chat session record, ensuring it belongs to the user
    const deletedSession = await ChatSession.findOneAndDelete({ sessionId, userId });
    if (!deletedSession) {
      return res.status(404).json({ error: 'Session not found or not authorized' });
    }

    // 2. Delete all messages associated with the session
    await Message.deleteMany({ sessionId });

    // 3. Find and delete memories extracted from this session, and delete their events
    const memories = await Memory.find({ sessionId });
    const memoryIds = memories.map(m => m._id);

    if (memoryIds.length > 0) {
      await Memory.deleteMany({ _id: { $in: memoryIds } });
      await MemoryEvent.deleteMany({ memoryId: { $in: memoryIds } });
    }

    return res.json({ success: true, message: 'Session and associated messages/memories deleted successfully' });
  } catch (err) {
    console.error('Error deleting session:', err);
    return res.status(500).json({ error: 'Failed to delete session' });
  }
});

// -------------------------------------------------------------------
// Primary chat endpoint – now respects memory & session history
// -------------------------------------------------------------------
app.post('/api/chat', authMiddleware, async (req, res) => {
  const { sessionId, message, memoryEnabled, useContext, language } = req.body;
  const userId = req.user._id.toString();
  console.log('Payload received:', req.body);

  if (!sessionId || !message) {
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
    promptParts.push(`You are a precise AI assistant. You have access to user-specific facts in <user_facts> and conversation history in <chat_history>.

STRICT ATTENTION RULES:
1. Grounding: You must NEVER state facts about the user that are not explicitly present in <user_facts> or <chat_history>.
2. Resolution of Conflicts: Information in <chat_history> represents current state. If <chat_history> contradicts <user_facts>, treat the fact in <user_facts> as revoked and rely exclusively on <chat_history>.
3. Absence of Information: If the answer cannot be derived from <user_facts>, <chat_history>, or current input, state that you do not know or ask for clarification rather than assuming.

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
    const responseConfidenceScore = typeof extracted?.confidence_score === 'number'
      ? Math.min(100, Math.max(0, Math.round(extracted.confidence_score)))
      : 90;

    await Message.create({
      sessionId,
      role: 'user',
      content: message,
      createdAt: new Date(),
      wasFactExtracted: Boolean(extracted?.negotiation_prompt),
      confidenceScore: responseConfidenceScore,
    });

    // Update Session Title to a generated summary if it's currently default
    try {
      const session = await ChatSession.findOne({ sessionId });
      if (session && session.title === 'New Chat') {
        const aiTitle = await generateSessionTitle(message);
        session.title = aiTitle || 'New Chat';
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
      confidenceScore: responseConfidenceScore,
    });

    // 5️⃣ If memory enabled and a negotiation_prompt exists, classify & store
    let memorySaved = false;
    if (memoryEnabled && extracted?.negotiation_prompt) {
      const { content, category, reason, confidence_score } = extracted.negotiation_prompt;
      const confidenceScore = typeof confidence_score === 'number' 
        ? Math.min(100, Math.max(0, Math.round(confidence_score))) 
        : 90;

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
        sessionId,
        confidenceScore,
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
        confidenceScore,
        savedAt: newMemory.createdAt,
      });

      extracted.negotiation_prompt = {
        ...extracted.negotiation_prompt,
        sensitivity: classification.sensitivity,
        source: classification.source || 'chat',
        reasoning: memoryReason,
        confidenceScore,
      };
      memorySaved = true;
    }

    // 6️⃣ Respond
    return res.json({
      reply: replyContent,
      confidence_score: responseConfidenceScore,
      negotiation_prompt: extracted?.negotiation_prompt || null,
      memorySaved,
    });
  } catch (err) {
    console.error('Memory extraction error:', err);
    return res.status(500).json({ error: 'Failed to process chat', details: err.message });
  }
});

// GET endpoint to retrieve session chat history
app.get('/api/chat/history/:sessionId', authMiddleware, async (req, res) => {
  const { sessionId } = req.params;
  try {
    const history = await Message.find({ sessionId }).sort({ createdAt: 1 });
    return res.json(history);
  } catch (err) {
    console.error('Fetch history error:', err);
    return res.status(500).json({ error: 'Failed to fetch history' });
  }
});

// GET endpoint to retrieve confidence score series for a session
app.get('/api/chat/confidence/:sessionId', authMiddleware, async (req, res) => {
  const { sessionId } = req.params;
  try {
    const messages = await Message.find({ sessionId }).sort({ createdAt: 1 }).select('role content confidenceScore createdAt');
    const series = messages
      .filter(m => m.role === 'assistant')
      .map((m, idx) => ({
        index: idx + 1,
        confidenceScore: typeof m.confidenceScore === 'number' ? m.confidenceScore : 90,
        preview: m.content?.slice(0, 60) || '',
        createdAt: m.createdAt,
      }));
    return res.json(series);
  } catch (err) {
    console.error('Fetch confidence error:', err);
    return res.status(500).json({ error: 'Failed to fetch history' });
  }
});

// -------------------------------------------------------------------
// Memory CRUD endpoints (future dashboard)
// -------------------------------------------------------------------
app.use('/api/auth', authRoutes);
app.use('/api/memories', authMiddleware, memoryRoutes);
app.use('/api/dashboard', authMiddleware, dashboardRoutes);
app.use('/api/settings', authMiddleware, settingsRoutes);

// Start cron jobs
startMemoryCleanupCron();

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});