const API_BASE = 'http://localhost:5000/api'

export const api = {
  chat: async (message, allowStorage, useContext) => {
    const res = await fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, allowStorage, useContext })
    })
    if (!res.ok) throw new Error('Chat request failed')
    return res.json()
  },
  
  getMemories: async () => {
    const res = await fetch(`${API_BASE}/memories`)
    if (!res.ok) throw new Error('Failed to fetch memories')
    return res.json()
  },

  getEvents: async () => {
    const res = await fetch(`${API_BASE}/memories/events`)
    if (!res.ok) throw new Error('Failed to fetch events')
    return res.json()
  },

  forgetMemory: async (id) => {
    const res = await fetch(`${API_BASE}/memories/${id}`, { method: 'DELETE' })
    if (!res.ok) throw new Error('Failed to forget memory')
    return res.json()
  },

  getChatHistory: async () => {
    const res = await fetch(`${API_BASE}/memories/chat-history`)
    if (!res.ok) throw new Error('Failed to fetch chat history')
    return res.json()
  }
}
