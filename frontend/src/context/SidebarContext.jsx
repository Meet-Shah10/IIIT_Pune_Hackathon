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
      const data = await api.getSessions()
      setSessions(data)
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
      sessionId, selectSession, sessions, loadSessions
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
