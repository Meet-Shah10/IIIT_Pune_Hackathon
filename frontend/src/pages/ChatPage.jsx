import { useState, useRef, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api';
import { getUserId, getSessionId, buildSessionId, setSessionId } from '../utils/userSession';
import ChatWindow from '../components/chat/ChatWindow'
import LanguageSelector from '../components/ui/LanguageSelector'
import { useSidebar } from '../context/SidebarContext'
import { Menu, PanelLeftOpen, PanelLeftClose, Plus } from 'lucide-react'

export default function ChatPage() {
  const queryClient = useQueryClient()
  const { isOpen, toggle, registerNewChat, sessionId, selectSession, loadSessions } = useSidebar()

  const [messages, setMessages] = useState([])
  const messagesRef = useRef(messages)
  
  useEffect(() => {
    messagesRef.current = messages
  }, [messages])

  const sessionIdRef = useRef(sessionId)

  const userId = getUserId();
  const [memories, setMemories] = useState([]);

  useEffect(() => {
    sessionIdRef.current = sessionId
    api.getMemories(userId).then(setMemories).catch(console.error);
    api.getChatHistory(sessionId).then(setMessages).catch(console.error);
  }, [userId, sessionId]);

  const { data: events = [] } = useQuery({
    queryKey: ['events'],
    queryFn: async () => [],
  })

  const chatMutation = useMutation({
    mutationFn: async ({ content, memoryEnabled, useContext, language }) => {
      return api.sendChat(content, memoryEnabled, useContext, sessionIdRef.current, language);
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
      const replyContent = data?.reply ?? data?.message;
      if (replyContent) {
        let negotiationPrompt = data?.negotiation_prompt;

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
      queryClient.invalidateQueries({ queryKey: ['memories'] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
      loadSessions(); // refresh titles
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

  const handleNewChat = async () => {
    // Prevent creating a new session if the current one is already completely empty
    if (messagesRef.current.length === 0) {
      return;
    }

    try {
      const data = await api.createChatSession(userId)
      const nextSessionId = data?.sessionId || buildSessionId()
      selectSession(nextSessionId)
      setMessages([])
      loadSessions()
    } catch (error) {
      console.error('Failed to create new chat session:', error)
      const fallbackSessionId = buildSessionId()
      selectSession(fallbackSessionId)
      setMessages([])
      loadSessions()
    }
  }

  // Register handleNewChat into the SidebarContext so Sidebar's "+ New" can call it
  useEffect(() => {
    registerNewChat(handleNewChat)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="flex flex-col h-full w-full relative">
      {/* Top Bar */}
      <header className="fixed top-0 left-0 md:left-0 right-0 z-50 bg-white/80 backdrop-blur-md flex justify-between items-center px-4 md:px-8 py-4 pointer-events-none border-b border-zinc-100/60"
        style={{ left: isOpen ? '16rem' : '3rem' }}
      >
        {/* Left side: mobile hamburger */}
        <div className="flex items-center pointer-events-auto">
          <div className="md:hidden flex items-center gap-2">
            <Menu className="w-5 h-5 text-zinc-700" />
            <h1 className="font-headline-md font-bold text-zinc-900 tracking-tighter">MemoryVault</h1>
          </div>
        </div>

        {/* Right side: New chat + Language + sidebar toggle */}
        <div className="flex items-center gap-3 pointer-events-auto">
          {/* + New chat button */}
          <button
            onClick={handleNewChat}
            className="flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 transition-colors active:scale-95"
            title="Start a new chat"
          >
            <Plus className="w-4 h-4" />
            <span>New chat</span>
          </button>

          <LanguageSelector />

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
