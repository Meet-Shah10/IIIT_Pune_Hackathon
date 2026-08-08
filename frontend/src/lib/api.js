// src/lib/api.js
import { getUserId } from '../utils/userSession';

const API_BASE = 'http://localhost:3000/api';
const USER_ID = getUserId();

export const api = {
  // Send a chat message with required payload fields
  sendChat: async (message, memoryEnabled, useContext, sessionId, language) => {
    const res = await fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': USER_ID,
      },
      body: JSON.stringify({
        userId: USER_ID,
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

  // Get memories for a specific user (defaults to current USER_ID)
  getMemories: async (userId = USER_ID) => {
    const res = await fetch(`${API_BASE}/memories/${userId}`, {
      headers: { 'x-user-id': USER_ID },
    });
    if (!res.ok) throw new Error('Failed to fetch memories');
    return res.json();
  },

  // Get events (kept for compatibility)
  getEvents: async () => {
    const res = await fetch(`${API_BASE}/memories/events`, {
      headers: { 'x-user-id': USER_ID },
    });
    if (!res.ok) throw new Error('Failed to fetch events');
    return res.json();
  },

  // Delete a memory
  forgetMemory: async (id) => {
    const res = await fetch(`${API_BASE}/memories/${id}`, {
      method: 'DELETE',
      headers: { 'x-user-id': USER_ID },
    });
    if (!res.ok) throw new Error('Failed to forget memory');
    return res.json();
  },

  // Update a memory (e.g. expiresAt, autoDelete)
  updateMemory: async (id, data) => {
    const res = await fetch(`${API_BASE}/memories/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': USER_ID,
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update memory');
    return res.json();
  },

  // Edit a memory's content (saves to DB + logs to timeline)
  editMemory: async (id, content) => {
    const res = await fetch(`${API_BASE}/memories/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': USER_ID,
      },
      body: JSON.stringify({ content }),
    });
    if (!res.ok) throw new Error('Failed to edit memory');
    return res.json();
  },

  // Create a fresh chat session on the backend
  createChatSession: async (userId = USER_ID) => {
    const res = await fetch(`${API_BASE}/chat/sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': USER_ID,
      },
      body: JSON.stringify({ userId }),
    });
    if (!res.ok) throw new Error('Failed to create chat session');
    return res.json();
  },

  // Get chat history for a session
  getChatHistory: async (sessionId) => {
    const res = await fetch(`${API_BASE}/chat/history/${sessionId}`, {
      headers: { 'x-user-id': USER_ID },
    });
    if (!res.ok) throw new Error('Failed to fetch chat history');
    return res.json();
  },

  // Delete a chat session and associated messages/memories
  deleteChatSession: async (sessionId) => {
    const res = await fetch(`${API_BASE}/chat/sessions/${sessionId}`, {
      method: 'DELETE',
      headers: { 'x-user-id': USER_ID },
    });
    if (!res.ok) throw new Error('Failed to delete chat session');
    return res.json();
  },

  // Get aggregated dashboard stats
  getDashboardStats: async () => {
    const res = await fetch(`${API_BASE}/dashboard/stats/${USER_ID}`, {
      headers: { 'x-user-id': USER_ID },
    });
    if (!res.ok) throw new Error('Failed to fetch dashboard stats');
    return res.json();
  },

  // Get all chat sessions for a user
  getSessions: async () => {
    const res = await fetch(`${API_BASE}/chat/sessions/${USER_ID}`, {
      headers: { 'x-user-id': USER_ID },
    });
    if (!res.ok) throw new Error('Failed to fetch chat sessions');
    return res.json();
  },

  // --- Settings APIs ---
  getSettings: async () => {
    const res = await fetch(`${API_BASE}/settings/${USER_ID}`, {
      headers: { 'x-user-id': USER_ID },
    });
    if (!res.ok) throw new Error('Failed to fetch settings');
    return res.json();
  },

  updateSettings: async (data) => {
    const res = await fetch(`${API_BASE}/settings/${USER_ID}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': USER_ID,
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update settings');
    return res.json();
  },
};
