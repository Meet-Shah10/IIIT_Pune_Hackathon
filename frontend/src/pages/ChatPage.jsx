import { useState, useRef, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api';
import { getUserId, getSessionId, buildSessionId, setSessionId } from '../utils/userSession';
import ChatWindow from '../components/chat/ChatWindow'
import LanguageSelector from '../components/ui/LanguageSelector'
import { Menu, Search, Bell, Settings, Plus } from 'lucide-react'

export default function ChatPage() {
  const queryClient = useQueryClient()
  
  // Hardcode toggles for backend since we removed them from UI
  const allowStorage = true
  const useContext = true

  const [messages, setMessages] = useState([])
  const [sessionId, setSessionIdState] = useState(() => getSessionId())

  const userId = getUserId();
  const [memories, setMemories] = useState([]);

  useEffect(() => {
    api.getMemories(userId).then(setMemories).catch(console.error);
    api.getChatHistory(sessionId).then(setMessages).catch(console.error);
  }, [userId, sessionId]);

  // We need to keep track of events to simulate the "intercept card" inline
  const { data: events = [] } = useQuery({
    queryKey: ['events'],
    queryFn: async () => [], // Dummy empty array to bypass backend
  })

  const chatMutation = useMutation({
    mutationFn: async ({ content, memoryEnabled, useContext, language }) => {
      // Send request with user/session info and both memory toggles + language
      return api.sendChat(content, memoryEnabled, useContext, sessionId, language);
    },
    onError: (err) => {
      console.error('Chat error:', err);
      const errorMsg = {
        _id: `error-${Date.now()}`,
        role: 'assistant',
        content: 'Sorry, there was an error processing your message.',
        createdAt: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMsg]);
    },
    onSuccess: (data, variables) => {
      // Append assistant reply to chat history
      const replyContent = data?.reply ?? data?.message;
      if (replyContent) {
        let negotiationPrompt = data?.negotiation_prompt;
        
        // Mock negotiation_prompt for demonstration words on frontend
        const userMsgLower = variables?.content?.toLowerCase() || '';
        if (!negotiationPrompt && (
          userMsgLower.includes('remember') || 
          userMsgLower.includes('mascot') || 
          userMsgLower.includes('trip') || 
          userMsgLower.includes('pune') || 
          userMsgLower.includes('hello') ||
          userMsgLower.includes('hi') ||
          userMsgLower.includes('robot')
        )) {
          negotiationPrompt = {
            content: `User shared: "${variables.content}"`,
            category: 'personal_details',
            sensitivity: 'low'
          };
        }

        const assistantMsg = {
          _id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: replyContent,
          negotiationPrompt: negotiationPrompt || null,
          createdAt: new Date().toISOString(),
        };
        setMessages(prev => [...prev, assistantMsg]);
      }
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['memories'] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
    }
  })

  const handleSendMessage = ({ content, memoryEnabled, useContext, language }) => {
    const userMsg = {
      _id: `user-${Date.now()}`,
      role: 'user',
      content: content,
      createdAt: new Date().toISOString()
    }
    setMessages(prev => [...prev, userMsg])
    chatMutation.mutate({ content, memoryEnabled, useContext, language })
  }

  const handleNewChat = () => {
    const nextSessionId = setSessionId(buildSessionId())
    setSessionIdState(nextSessionId)
    setMessages([])
  }

  return (
    <div className="flex flex-col h-full w-full relative">
      {/* Top Bar (Perplexity style) */}
      <header className="fixed top-0 left-0 md:left-64 right-0 z-50 bg-white/80 backdrop-blur-md flex justify-between items-center px-4 md:px-8 py-4 pointer-events-none border-b border-zinc-100/60">
        <div className="flex items-center pointer-events-auto">
          
          <div className="md:hidden flex items-center gap-2">
            <Menu className="w-5 h-5 text-zinc-700" />
            <h1 className="font-headline-md font-bold text-zinc-900 tracking-tighter">MemoryVault</h1>
          </div>
        </div>

        <div className="flex items-center gap-3 pointer-events-auto">
          <button
            onClick={handleNewChat}
            className="flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 transition-colors"
            title="Start a new chat"
          >
            <Plus className="w-4 h-4" />
            <span>New chat</span>
          </button>
          <LanguageSelector />
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
            isLoading={chatMutation.isPending} 
            onSendMessage={handleSendMessage} 
          />
        </div>
      </div>
    </div>
  )
}
