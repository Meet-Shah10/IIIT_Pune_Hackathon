import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { getSessionId, setSessionId as persistSessionId } from '../utils/userSession'
import { api } from '../lib/api'

const SidebarContext = createContext(null)

export function SidebarProvider({ children }) {
  const [isOpen, setIsOpen] = useState(true)
  const [onNewChat, setOnNewChat] = useState(null)
  
  const [sessionId, setSessionIdState] = useState(() => getSessionId())
  const [sessions, setSessions] = useState([])

  const loadSessions = useCallback(async () => {
    try {
      const data = await api.getChatSessions()
      
      const current = getSessionId();
      const exists = data.some(s => s.sessionId === current);
      
      if (!exists && data.length > 0) {
        // Local session is invalid, select the most recent valid one
        persistSessionId(data[0].sessionId);
        setSessionIdState(data[0].sessionId);
        setSessions(data);
      } else if (!exists && data.length === 0) {
        // User has absolutely no sessions, auto-create one
        const newData = await api.createChatSession();
        const nextSessionId = newData?.sessionId || current;
        persistSessionId(nextSessionId);
        setSessionIdState(nextSessionId);
        setSessions([{ sessionId: nextSessionId, title: 'New Chat' }]);
      } else {
        setSessions(data);
      }
    } catch (err) {
      console.error('Failed to load sessions:', err)
    }
  }, [])

  useEffect(() => {
    loadSessions()
  }, [loadSessions])

  const selectSession = useCallback((id) => {
    persistSessionId(id)
    setSessionIdState(id)
  }, [])

  const deleteSession = useCallback(async (id) => {
    try {
      await api.deleteChatSession(id)
      await loadSessions()
      if (sessionId === id) {
        // If we deleted the active session, start a new one
        if (typeof onNewChat === 'function') {
          onNewChat()
        } else {
          // fallback
          persistSessionId('')
          setSessionIdState('')
        }
      }
    } catch (err) {
      console.error('Failed to delete session:', err)
    }
  }, [sessionId, onNewChat, loadSessions])

  const toggle = useCallback(() => setIsOpen(prev => !prev), [])
  const open   = useCallback(() => setIsOpen(true), [])
  const close  = useCallback(() => setIsOpen(false), [])

  const registerNewChat = useCallback((fn) => {
    setOnNewChat(() => fn)
  }, [])

  const triggerNewChat = useCallback(() => {
    if (typeof onNewChat === 'function') onNewChat()
  }, [onNewChat])

  return (
    <SidebarContext.Provider value={{ 
      isOpen, toggle, open, close, 
      registerNewChat, triggerNewChat,
      sessionId, selectSession, sessions, loadSessions, deleteSession
    }}>
      {children}
    </SidebarContext.Provider>
  )
}

export function useSidebar() {
  const ctx = useContext(SidebarContext)
  if (!ctx) throw new Error('useSidebar must be used inside SidebarProvider')
  return ctx
}
