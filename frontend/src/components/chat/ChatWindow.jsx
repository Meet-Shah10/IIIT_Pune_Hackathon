import { useState, useRef, useEffect } from 'react'
import { Plus, Mic, ArrowUp, Cpu, Copy, Edit3, Trash2, RefreshCw, Database, UserCheck } from 'lucide-react'
import { MemoryInterceptCard } from './MemoryInterceptCard'

export default function ChatWindow({ messages, events, isLoading, onSendMessage }) {
  const [inputValue, setInputValue] = useState('')
  const [storeMemories, setStoreMemories] = useState(true)
  const [useProfile, setUseProfile] = useState(true)
  const endRef = useRef(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, events, isLoading])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!inputValue.trim() || isLoading) return
    onSendMessage({ content: inputValue, memoryEnabled: storeMemories, useContext: useProfile })
    setInputValue('')
  }

  const renderMessageWithEvents = (msg, index) => {
    const relatedEvents = events.filter(e => e.action === 'extracted' && e.detail.includes(msg.content))
    
    if (msg.role === 'assistant') {
      return (
        <div key={msg._id || index} className="flex flex-col gap-2 w-full mt-4 group">
          <div className="flex gap-4">
            <div className="flex-shrink-0 mt-1">
              <div className="w-8 h-8 rounded-full border border-zinc-200 flex items-center justify-center bg-white text-zinc-800">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
              </div>
            </div>
            <div className="flex flex-col gap-2 pt-1.5 text-zinc-800 text-[15px] leading-relaxed max-w-[85%]">
              <p>{msg.content}</p>
              
              {/* Assistant Hover Actions */}
              <div className="flex items-center gap-2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="text-zinc-400 hover:text-zinc-600 transition-colors" title="Copy">
                  <Copy className="w-4 h-4" />
                </button>
                <button className="text-zinc-400 hover:text-zinc-600 transition-colors" title="Regenerate">
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
          {relatedEvents.map(ev => (
            <div key={ev._id} className="pl-12">
              <MemoryInterceptCard detail={ev.detail} category="fact" sensitivity="medium" />
            </div>
          ))}
        </div>
      )
    }

    return (
      <div key={msg._id || index} className="flex flex-col gap-1 self-end max-w-[80%] mt-6 group">
        <div className="bg-zinc-100/80 border border-zinc-200/50 rounded-2xl rounded-tr-sm px-4 py-3 text-zinc-800 text-[15px] shadow-sm">
          <p>{msg.content}</p>
        </div>
        
        {/* User Hover Actions */}
        <div className="flex items-center justify-end gap-2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button className="text-zinc-400 hover:text-zinc-600 transition-colors" title="Edit">
            <Edit3 className="w-4 h-4" />
          </button>
          <button className="text-zinc-400 hover:text-zinc-600 transition-colors" title="Copy">
            <Copy className="w-4 h-4" />
          </button>
          <button className="text-zinc-400 hover:text-red-500 transition-colors" title="Delete">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full relative w-full pt-16">
      
      {/* Active Context Header (Pinned Toggles) */}
      <div className="absolute top-4 left-0 right-0 flex justify-center z-40 pointer-events-none">
        <div className="pointer-events-auto bg-white/80 backdrop-blur-md border border-zinc-200 shadow-sm rounded-full px-5 py-2.5 flex items-center gap-6">
          
          <label className="flex items-center gap-2 cursor-pointer group">
            <div className="relative">
              <input type="checkbox" className="sr-only" checked={storeMemories} onChange={() => setStoreMemories(!storeMemories)} />
              <div className={`block w-8 h-4.5 rounded-full transition-colors duration-300 ease-in-out ${storeMemories ? 'bg-zinc-900' : 'bg-zinc-200'}`}></div>
              <div className={`absolute left-0.5 top-0.5 bg-white w-3.5 h-3.5 rounded-full transform transition-transform duration-300 ease-in-out ${storeMemories ? 'translate-x-3.5' : 'translate-x-0'}`}></div>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-medium text-zinc-600 group-hover:text-zinc-900 transition-colors">
              <Database className="w-3.5 h-3.5" />
              <span>Save Memory</span>
            </div>
          </label>

          <div className="w-px h-4 bg-zinc-200"></div>

          <label className="flex items-center gap-2 cursor-pointer group">
            <div className="relative">
              <input type="checkbox" className="sr-only" checked={useProfile} onChange={() => setUseProfile(!useProfile)} />
              <div className={`block w-8 h-4.5 rounded-full transition-colors duration-300 ease-in-out ${useProfile ? 'bg-zinc-900' : 'bg-zinc-200'}`}></div>
              <div className={`absolute left-0.5 top-0.5 bg-white w-3.5 h-3.5 rounded-full transform transition-transform duration-300 ease-in-out ${useProfile ? 'translate-x-3.5' : 'translate-x-0'}`}></div>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-medium text-zinc-600 group-hover:text-zinc-900 transition-colors">
              <UserCheck className="w-3.5 h-3.5" />
              <span>Use Memory</span>
            </div>
          </label>

        </div>
      </div>

      {/* Intro section */}
      {messages.length === 0 && (
        <div className="flex flex-col gap-3 items-center justify-center pt-24 pb-8 text-center">
          <h2 className="font-headline-md text-3xl font-medium text-zinc-800 tracking-tight">What do you want to know?</h2>
        </div>
      )}

      {/* Message List */}
      <div className="flex flex-col gap-2 w-full pb-36 pt-4">
        {messages.map((msg, idx) => renderMessageWithEvents(msg, idx))}
        
        {isLoading && (
          <div className="flex gap-4 mt-4 opacity-50">
            <div className="flex-shrink-0 mt-1">
              <div className="w-8 h-8 rounded-full border border-zinc-200 flex items-center justify-center bg-white text-zinc-800 animate-pulse">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
              </div>
            </div>
            <div className="pt-3 flex gap-1.5">
              <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce" />
              <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}} />
              <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce" style={{animationDelay: '0.4s'}} />
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Floating Input Area (Perplexity Style) */}
      <div className="fixed bottom-6 left-0 md:left-64 right-0 px-4 md:px-8 z-40 flex justify-center pointer-events-none">
        <div className="w-full max-w-3xl pointer-events-auto">
          <form onSubmit={handleSubmit} className="relative flex flex-col bg-white border border-zinc-200 rounded-[2rem] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.08)] focus-within:border-zinc-300 focus-within:shadow-[0_12px_40px_rgb(0,0,0,0.12)] transition-all duration-200">
            
            <textarea 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSubmit(e)
                }
              }}
              className="w-full bg-transparent border-0 pt-4 pb-2 px-4 text-base text-zinc-900 placeholder-zinc-400 focus:ring-0 resize-none max-h-40 no-scrollbar" 
              placeholder="Ask anything..." 
              rows={1}
            />
            
            <div className="flex items-center justify-between px-3 pb-3 pt-1">
              <div className="flex items-center gap-2">
                <button type="button" className="p-2 text-zinc-400 hover:text-zinc-700 bg-zinc-50 hover:bg-zinc-100 rounded-full transition-colors flex items-center gap-1.5">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              
              <div className="flex items-center gap-2">
                <button type="button" className="p-2 text-zinc-400 hover:text-zinc-700 transition-colors">
                  <Mic className="w-4 h-4" />
                </button>
                <button type="submit" disabled={!inputValue.trim() || isLoading} className="w-8 h-8 flex items-center justify-center bg-zinc-900 text-white hover:bg-zinc-800 rounded-full transition-colors disabled:opacity-50 disabled:bg-zinc-200 disabled:text-zinc-400">
                  <ArrowUp className="w-4 h-4" />
                </button>
              </div>
            </div>

          </form>
        </div>
      </div>
    </div>
  )
}
