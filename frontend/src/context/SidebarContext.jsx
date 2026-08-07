import { createContext, useContext, useState, useCallback } from 'react'

const SidebarContext = createContext(null)

export function SidebarProvider({ children }) {
  const [isOpen, setIsOpen] = useState(true)
  // onNewChat is a ref to whatever the active page registers
  const [onNewChat, setOnNewChat] = useState(null)

  const toggle = useCallback(() => setIsOpen(prev => !prev), [])
  const open   = useCallback(() => setIsOpen(true), [])
  const close  = useCallback(() => setIsOpen(false), [])

  const registerNewChat = useCallback((fn) => {
    // Store as a function-in-state: wrap in an arrow so React doesn't call it immediately
    setOnNewChat(() => fn)
  }, [])

  const triggerNewChat = useCallback(() => {
    if (typeof onNewChat === 'function') onNewChat()
  }, [onNewChat])

  return (
    <SidebarContext.Provider value={{ isOpen, toggle, open, close, registerNewChat, triggerNewChat }}>
      {children}
    </SidebarContext.Provider>
  )
}

export function useSidebar() {
  const ctx = useContext(SidebarContext)
  if (!ctx) throw new Error('useSidebar must be used inside SidebarProvider')
  return ctx
}
