import { useState, useRef, useEffect } from 'react'
import { PlusCircle, Mic, Send, Cpu, CheckCheck } from 'lucide-react'
import { MemoryInterceptCard } from './MemoryInterceptCard'

export default function ChatWindow({ messages, events, isLoading, onSendMessage }) {
  const [inputValue, setInputValue] = useState('')
  const endRef = useRef(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, events, isLoading])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!inputValue.trim() || isLoading) return
    onSendMessage(inputValue)
    setInputValue('')
  }

  // To simulate the "inline" card, we check if an extraction event happened shortly after a message
  // In a real app, the API would return a combined transcript or nested events.
  const renderMessageWithEvents = (msg, index) => {
    // Check if there's an extraction event related to this message
    const relatedEvents = events.filter(e => e.action === 'extracted' && e.detail.includes(msg.content))
    
    // For assistant messages, we use the MemoryVault styling
    if (msg.role === 'assistant') {
      return (
        <div key={msg._id || index} className="flex flex-col gap-2 w-full mt-4">
          <div className="flex gap-3 max-w-[90%] sm:max-w-[80%]">
            <div className="flex-shrink-0 mt-1">
              {/* MV Avatar Placeholder */}
              <div className="w-6 h-6 rounded bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[10px] font-bold text-white">
                MV
              </div>
            </div>
            <div className="flex flex-col gap-2 pt-1 text-white font-body-sm text-[13px] leading-relaxed">
              <p>{msg.content}</p>
            </div>
          </div>
          {/* If there was an extraction event, render the card below the assistant message */}
          {relatedEvents.map(ev => (
            <MemoryInterceptCard key={ev._id} detail={ev.detail} category="fact" sensitivity="medium" />
          ))}
        </div>
      )
    }

    // User message styling
    return (
      <div key={msg._id || index} className="flex flex-col gap-1 self-end max-w-[85%] sm:max-w-[70%] mt-6">
        <div className="bg-zinc-900/80 backdrop-blur-md border border-zinc-700 rounded-xl rounded-tr-sm px-4 py-3 text-white shadow-[0_4px_12px_rgba(0,0,0,0.5)] font-body-base text-[14px]">
          <p>{msg.content}</p>
        </div>
        <div className="flex items-center gap-1 self-end text-zinc-500 font-body-sm text-[10px] mt-1">
          <span>{new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
          <CheckCheck className="w-3 h-3" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full relative">
      
      {/* Intro section */}
      {messages.length === 0 && (
        <div className="flex flex-col gap-2 items-center justify-center pt-12 pb-8 text-center opacity-80">
          <Cpu className="w-10 h-10 text-zinc-500 mb-2" />
          <h2 className="font-headline-md text-2xl text-white tracking-tight">Active Session</h2>
          <p className="font-body-sm text-[13px] text-zinc-500">Intelligence core online. Ready to secure new memories.</p>
        </div>
      )}

      {/* Message List */}
      <div className="flex flex-col gap-2 w-full pb-8">
        {messages.map((msg, idx) => renderMessageWithEvents(msg, idx))}
        
        {isLoading && (
          <div className="flex gap-3 max-w-[90%] sm:max-w-[80%] mt-4 opacity-50">
            <div className="flex-shrink-0 mt-1">
              <div className="w-6 h-6 rounded bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[10px] font-bold text-white animate-pulse">
                MV
              </div>
            </div>
            <div className="pt-2 flex gap-1">
              <div className="w-2 h-2 bg-zinc-600 rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-zinc-600 rounded-full animate-bounce" style={{animationDelay: '0.2s'}} />
              <div className="w-2 h-2 bg-zinc-600 rounded-full animate-bounce" style={{animationDelay: '0.4s'}} />
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Floating Input Area */}
      <div className="fixed bottom-0 left-0 md:left-64 right-0 p-4 md:p-6 bg-gradient-to-t from-black via-black/90 to-transparent z-40">
        <div className="max-w-4xl mx-auto relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-zinc-800 to-zinc-700 rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
          
          <form onSubmit={handleSubmit} className="relative flex items-end bg-[#09090b] border border-zinc-800 rounded-xl overflow-hidden focus-within:border-white focus-within:ring-1 focus-within:ring-white/20 transition-all">
            <button type="button" className="p-3.5 text-zinc-500 hover:text-white transition-colors">
              <PlusCircle className="w-5 h-5" />
            </button>
            
            <textarea 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSubmit(e)
                }
              }}
              className="w-full bg-transparent border-0 py-3.5 px-2 text-sm text-white placeholder-zinc-600 focus:ring-0 resize-none max-h-32 no-scrollbar" 
              placeholder="Communicate with MemoryVault..." 
              rows={1}
            />
            
            <button type="button" className="p-3.5 text-zinc-500 hover:text-[var(--color-primary-container)] transition-colors">
              <Mic className="w-5 h-5" />
            </button>
            
            <button type="submit" disabled={!inputValue.trim() || isLoading} className="p-3.5 mr-1 text-[var(--color-primary-container)] hover:text-orange-400 transition-colors disabled:opacity-50">
              <Send className="w-5 h-5" />
            </button>
          </form>
          
          <div className="text-center mt-2">
            <span className="font-code text-[10px] text-zinc-600 tracking-wide">End-to-end encrypted • Quantum resistant storage</span>
          </div>
        </div>
      </div>
    </div>
  )
}
