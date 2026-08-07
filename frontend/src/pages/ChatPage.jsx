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
    queryFn: async () => [], // Dummy empty array to bypass backend
  })

  // We need to keep track of events to simulate the "intercept card" inline
  const { data: events = [] } = useQuery({
    queryKey: ['events'],
    queryFn: async () => [], // Dummy empty array to bypass backend
  })

  const chatMutation = useMutation({
    mutationFn: async (content) => {
      // Dummy hardcoded response for frontend UI testing
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            message: {
              _id: `msg-dummy-${Date.now()}`,
              role: 'assistant',
              content: "Acknowledged. I've logged a high-priority reminder for the quarterly AI architecture review for this Friday. (Dummy Response)",
              createdAt: new Date().toISOString()
            }
          })
        }, 1500)
      })
    },
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
    onSettled: (data) => {
      // Append the dummy response to the chat history locally
      if (data && data.message) {
        queryClient.setQueryData(['chatHistory'], old => [...(old || []), data.message])
      }
      // queryClient.invalidateQueries({ queryKey: ['chatHistory'] })
      queryClient.invalidateQueries({ queryKey: ['memories'] })
      queryClient.invalidateQueries({ queryKey: ['events'] })
    }
  })

  const handleSendMessage = (content) => {
    chatMutation.mutate(content)
  }

  return (
    <div className="flex flex-col h-full w-full relative">
      {/* Top Bar (Perplexity style) */}
      <header className="absolute top-0 w-full z-50 bg-transparent flex justify-between items-center px-4 md:px-8 py-4 pointer-events-none">
        <div className="flex items-center pointer-events-auto">
          
          <div className="md:hidden flex items-center gap-2">
            <Menu className="w-5 h-5 text-zinc-700" />
            <h1 className="font-headline-md font-bold text-zinc-900 tracking-tighter">MemoryVault</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="w-8 h-8 rounded-full border border-zinc-200 flex items-center justify-center text-zinc-600 hover:bg-zinc-100 transition-colors">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
            </svg>
          </button>
          <button className="w-8 h-8 rounded-full border border-zinc-200 flex items-center justify-center text-zinc-600 hover:bg-zinc-100 transition-colors">
            <Menu className="w-4 h-4" />
          </button>
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
