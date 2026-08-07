import { useState, useRef, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import ChatWindow from '../components/chat/ChatWindow'
import { Menu, Search, Bell, Settings } from 'lucide-react'

export default function ChatPage() {
  const queryClient = useQueryClient()
  
  // Hardcode toggles for backend since we removed them from UI
  const allowStorage = true
  const useContext = true

  const { data: messages = [], isLoading: isHistoryLoading } = useQuery({
    queryKey: ['chatHistory'],
    queryFn: api.getChatHistory,
  })

  // We need to keep track of events to simulate the "intercept card" inline
  const { data: events = [] } = useQuery({
    queryKey: ['events'],
    queryFn: api.getEvents,
  })

  const chatMutation = useMutation({
    mutationFn: (content) => api.chat(content, allowStorage, useContext),
    onMutate: async (newContent) => {
      await queryClient.cancelQueries({ queryKey: ['chatHistory'] })
      const previousMessages = queryClient.getQueryData(['chatHistory'])
      
      const optimisticUserMsg = {
        _id: `temp-${Date.now()}`,
        role: 'user',
        content: newContent,
        createdAt: new Date().toISOString()
      }
      
      queryClient.setQueryData(['chatHistory'], old => [...(old || []), optimisticUserMsg])
      return { previousMessages }
    },
    onError: (err, newContent, context) => {
      queryClient.setQueryData(['chatHistory'], context.previousMessages)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['chatHistory'] })
      queryClient.invalidateQueries({ queryKey: ['memories'] })
      queryClient.invalidateQueries({ queryKey: ['events'] })
    }
  })

  const handleSendMessage = (content) => {
    chatMutation.mutate(content)
  }

  return (
    <div className="flex flex-col h-full w-full relative">
      {/* TopAppBar (Mobile & Global Actions) */}
      <header className="fixed top-0 w-full md:w-[calc(100%-16rem)] z-50 bg-[var(--color-glass-surface)] backdrop-blur-md border-b border-[var(--color-border-subtle)] flex justify-between items-center px-4 md:px-8 h-16">
        <div className="md:hidden flex items-center gap-2">
          <Menu className="w-5 h-5 text-[var(--color-text-muted)]" />
          <h1 className="font-headline-md font-bold text-[var(--color-on-surface)] tracking-tighter">MemoryVault</h1>
        </div>
        
        {/* Spacer for desktop */}
        <div className="hidden md:block w-1/3"></div>

        {/* Search Bar */}
        <div className="flex-1 max-w-md mx-4 relative hidden sm:block">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
          <input 
            type="text"
            className="w-full bg-[#09090b] border border-zinc-800 rounded py-1.5 pl-9 pr-3 text-sm text-[var(--color-on-surface)] placeholder-zinc-600 focus:outline-none focus:border-white focus:ring-1 focus:ring-white/20 transition-all shadow-[inset_0_0_10px_rgba(255,255,255,0.02)]"
            placeholder="Search memories..."
          />
        </div>

        <div className="flex items-center gap-4">
          <Bell className="w-5 h-5 text-[var(--color-on-surface-variant)] hover:text-[var(--color-primary)] cursor-pointer" />
          <Settings className="w-5 h-5 text-[var(--color-on-surface-variant)] hover:text-[var(--color-primary)] cursor-pointer" />
        </div>
      </header>

      {/* Main scrollable chat area */}
      <div className="flex-1 overflow-y-auto no-scrollbar pt-20 pb-32">
        <div className="max-w-4xl mx-auto w-full px-4 sm:px-8 h-full flex flex-col">
          <ChatWindow 
            messages={messages} 
            events={events}
            isLoading={isHistoryLoading || chatMutation.isPending} 
            onSendMessage={handleSendMessage} 
          />
        </div>
      </div>
    </div>
  )
}
