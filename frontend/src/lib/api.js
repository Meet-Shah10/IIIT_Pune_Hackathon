// src/lib/api.js
const API_BASE = 'http://localhost:3000/api';

let authToken = null;

const getHeaders = () => {
  const headers = {
    'Content-Type': 'application/json',
  };
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }
  return headers;
};

export const api = {
  setToken: (token) => {
    authToken = token;
  },

  // Auth Endpoints
  register: async (name, email, password) => {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to register');
    }
    return res.json();
  },

  login: async (email, password) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to login');
    }
    return res.json();
  },

  getMe: async () => {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch user');
    return res.json();
  },

  // Send a chat message
  sendChat: async (message, memoryEnabled, useContext, sessionId, language) => {
    const res = await fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        sessionId,
        message,
        memoryEnabled,
        useContext,
        language,
      }),
    });
    if (!res.ok) throw new Error('Chat request failed');
    return res.json();
  },

  // Get memories
  getMemories: async () => {
    const res = await fetch(`${API_BASE}/memories`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch memories');
    return res.json();
  },

  // Get events (timeline)
  getEvents: async () => {
    const res = await fetch(`${API_BASE}/memories/events`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch events');
    return res.json();
  },

  // Delete a memory
  forgetMemory: async (id) => {
    const res = await fetch(`${API_BASE}/memories/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to forget memory');
    return res.json();
  },

  // Update a memory (e.g. expiresAt, autoDelete)
  updateMemory: async (id, data) => {
    const res = await fetch(`${API_BASE}/memories/${id}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update memory');
    return res.json();
  },

  // Edit a memory's content (saves to DB + logs to timeline)
  editMemory: async (id, content) => {
    const res = await fetch(`${API_BASE}/memories/${id}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ content }),
    });
    if (!res.ok) throw new Error('Failed to edit memory');
    return res.json();
  },

  // Create a fresh chat session
  createChatSession: async () => {
    const res = await fetch(`${API_BASE}/chat/sessions`, {
      method: 'POST',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to create chat session');
    return res.json();
  },

  // Get chat history for a session
  getChatHistory: async (sessionId) => {
    const res = await fetch(`${API_BASE}/chat/history/${sessionId}`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch chat history');
    return res.json();
  },

  // Get all chat sessions
  getChatSessions: async () => {
    const res = await fetch(`${API_BASE}/chat/sessions`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch chat sessions');
    return res.json();
  },

  // Delete a chat session
  deleteChatSession: async (sessionId) => {
    const res = await fetch(`${API_BASE}/chat/sessions/${sessionId}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete chat session');
    return res.json();
  },

  // Get Dashboard stats
  getDashboardStats: async () => {
    const res = await fetch(`${API_BASE}/dashboard/stats`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch dashboard stats');
    return res.json();
  },

  // Get Settings
  getSettings: async () => {
    const res = await fetch(`${API_BASE}/settings`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch settings');
    return res.json();
  },

  // Update Settings
  updateSettings: async (settingsData) => {
    const res = await fetch(`${API_BASE}/settings`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(settingsData),
    });
    if (!res.ok) throw new Error('Failed to update settings');
    return res.json();
  },

  // Get confidence score series for a session
  getConfidenceSeries: async (sessionId) => {
    const res = await fetch(`${API_BASE}/chat/confidence/${sessionId}`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch confidence series');
    return res.json();
  },
};
