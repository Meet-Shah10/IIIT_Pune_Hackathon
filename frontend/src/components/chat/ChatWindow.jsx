import { useState, useRef, useEffect, useCallback } from 'react'
import { Plus, Mic, ArrowUp, Cpu, Copy, Edit3, Trash2, RefreshCw, Database, UserCheck, X } from 'lucide-react'
import { useSidebar } from '../../context/SidebarContext'
import ConfidenceChart from './ConfidenceChart'
import LanguageSelector from '../ui/LanguageSelector'

function MiniMascot() {
  return (
    <div className="relative w-10 h-10 flex-shrink-0 animate-bounce" style={{ animationDuration: '3s', animationTimingFunction: 'ease-in-out' }}>
      {/* Soft background glow */}
      <div className="absolute inset-0.5 rounded-full bg-zinc-200/50 blur-sm animate-pulse"></div>

      {/* Cute bot SVG */}
      <svg className="w-10 h-10 relative z-10 text-zinc-100" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Antennas */}
        <path d="M24 10V6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="24" cy="5" r="2.5" fill="#f43f5e" className="animate-pulse" />

        {/* Head */}
        <rect x="8" y="10" width="32" height="28" rx="14" fill="#18181b" stroke="#3f3f46" strokeWidth="2" />

        {/* Face Screen */}
        <rect x="12" y="14" width="24" height="20" rx="10" fill="#27272a" stroke="#52525b" strokeWidth="1" />

        {/* Happy Eyes */}
        <path d="M16 23C16 22 17 21 18 21C19 21 20 22 20 23" stroke="#a1a1aa" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M28 23C28 22 29 21 30 21C31 21 32 22 32 23" stroke="#a1a1aa" strokeWidth="2.5" strokeLinecap="round" />

        {/* Rosy Cheeks */}
        <circle cx="15" cy="27" r="1.5" fill="#f43f5e" opacity="0.8" />
        <circle cx="33" cy="27" r="1.5" fill="#f43f5e" opacity="0.8" />

        {/* Smile */}
        <path d="M21 28C22 29 23.5 29.5 24 29.5C24.5 29.5 26 29 27 28" stroke="#f4f4f5" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </div>
  )
}

export default function ChatWindow({ messages, events, isLoading, onSendMessage, sessionId }) {
  const { isOpen: sidebarOpen } = useSidebar()
  const [inputValue, setInputValue] = useState('')
  const [storeMemories, setStoreMemories] = useState(true)
  const [useProfile, setUseProfile] = useState(true)
  const [showSensitivityShield, setShowSensitivityShield] = useState(false)
  const [pendingMessage, setPendingMessage] = useState('')
  const [isListening, setIsListening] = useState(false)
  const endRef = useRef(null)
  const textareaRef = useRef(null)
  const recognitionRef = useRef(null)
  const rememberButtonRef = useRef(null)
  const turnOffButtonRef = useRef(null)
  const [showMascotReminder, setShowMascotReminder] = useState(true)
  const isFirstRender = useRef(true)

  const SENSITIVE_PATTERNS = [
    /\bstress(ed|ful)?\b/i,
    /\banxious|anxiety|panic\b/i,
    /\boverwhelm(ed|ing)?\b/i,
    /\bgrief|grieving|loss|bereave(d|ment)?\b/i,
    /\bdepress(ed|ion)?\b/i,
    /\bburn(ed)?\s*out|burnout\b/i,
    /\btrauma|traumatic\b/i,
    /\blonely|alone\b/i,
    /\bstruggling|struggle\b/i,
    /\bmental\s+health\b/i,
    /\bnot\s+okay\b/i,
    /\bfeeling\s+low\b/i
  ]

  const isSensitiveMoment = (text) => {
    const value = text?.trim()
    if (!value) return false
    return SENSITIVE_PATTERNS.some((pattern) => pattern.test(value))
  }

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance("Memory toggle is on. I will save your important facts.");
        utterance.rate = 1.05;
        utterance.pitch = 1.1;
        window.speechSynthesis.speak(utterance);
      }
      return;
    }

    setShowMascotReminder(true);

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const text = storeMemories
        ? "Memory toggle is back on."
        : "Memory toggle is off. No memory is being recorded.";
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.05;
      utterance.pitch = 1.1;
      window.speechSynthesis.speak(utterance);
    }
  }, [storeMemories]);

  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  useEffect(() => {
    if (showSensitivityShield) {
      rememberButtonRef.current?.focus()
    }
  }, [showSensitivityShield])

  useEffect(() => {
    if (!showSensitivityShield) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [showSensitivityShield])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, events, isLoading])

  // Auto-resize textarea
  const autoResize = useCallback(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 200) + 'px'
  }, [])

  useEffect(() => {
    autoResize()
  }, [inputValue, autoResize])

  const toggleSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please use Chrome or Edge.')
      return
    }

    if (isListening) {
      recognitionRef.current?.stop()
      setIsListening(false)
      return
    }

    const recognition = new SpeechRecognition()
    recognitionRef.current = recognition
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = (() => {
      try {
        const saved = localStorage.getItem('selectedLanguage')
        return saved ? JSON.parse(saved).code || 'en-US' : 'en-US'
      } catch { return 'en-US' }
    })()

    const initialText = inputValue.trim()
    const prefix = initialText ? initialText + ' ' : ''

    recognition.onresult = (event) => {
      let finalTranscript = ''
      let interimTranscript = ''

      for (let i = 0; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          finalTranscript += transcript
        } else {
          interimTranscript += transcript
        }
      }

      setInputValue(prefix + (finalTranscript + interimTranscript).trimStart())
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognition.onerror = (e) => {
      console.error('Speech recognition error:', e.error)
      setIsListening(false)
    }

    recognition.start()
    setIsListening(true)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!inputValue.trim() || isLoading) return
    // Stop listening before sending
    if (isListening) {
      recognitionRef.current?.stop()
      setIsListening(false)
    }
    const content = inputValue.trim()
    if (storeMemories && isSensitiveMoment(content)) {
      setPendingMessage(content)
      setShowSensitivityShield(true)
      return
    }

    // Read the persisted language selection at submit time
    const savedLang = localStorage.getItem('selectedLanguage')
    const language = savedLang ? JSON.parse(savedLang) : { name: 'English', code: 'en' }
    onSendMessage({ content, memoryEnabled: storeMemories, useContext: useProfile, language })
    setInputValue('')
    // Reset height after send
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
  }

  const sendPendingMessage = (memoryEnabled) => {
    if (!pendingMessage || isLoading) return
    const savedLang = localStorage.getItem('selectedLanguage')
    const language = savedLang ? JSON.parse(savedLang) : { name: 'English', code: 'en' }
    onSendMessage({
      content: pendingMessage,
      memoryEnabled,
      useContext: useProfile,
      language
    })
    setShowSensitivityShield(false)
    setPendingMessage('')
    setInputValue('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
  }

  const handleRememberWithShield = () => {
    sendPendingMessage(true)
  }

  const handleTurnOffMemory = () => {
    setStoreMemories(false)
    sendPendingMessage(false)
  }

  const handleShieldKeyDown = (event) => {
    if (event.key !== 'Tab') return

    if (event.shiftKey) {
      if (document.activeElement === rememberButtonRef.current) {
        event.preventDefault()
        turnOffButtonRef.current?.focus()
      }
      return
    }

    if (document.activeElement === turnOffButtonRef.current) {
      event.preventDefault()
      rememberButtonRef.current?.focus()
    }
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
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
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



      {/* Intro section */}
      {messages.length === 0 && (
        <div className="flex flex-col gap-3 items-center justify-center pt-24 pb-8 text-center">
          <h2 className="font-headline-md text-3xl font-medium text-zinc-800 tracking-tight">What do you want to know?</h2>
        </div>
      )}

      {/* Message List */}
      <div className="flex flex-col gap-2 w-full pb-64 pt-4">
        {messages.map((msg, idx) => renderMessageWithEvents(msg, idx))}

        {isLoading && (
          <div className="flex gap-4 mt-4 opacity-50">
            <div className="flex-shrink-0 mt-1">
              <div className="w-8 h-8 rounded-full border border-zinc-200 flex items-center justify-center bg-white text-zinc-800 animate-pulse">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </div>
            </div>
            <div className="pt-3 flex gap-1.5">
              <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce" />
              <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Floating Input Area (Perplexity Style) */}
      <div
        className="fixed bottom-6 right-0 px-4 md:px-8 z-40 flex justify-center pointer-events-none transition-all duration-300 ease-in-out"
        style={{ left: typeof window !== 'undefined' && window.innerWidth >= 768 ? (sidebarOpen ? '16rem' : '3rem') : '0' }}
      >
        <div className="w-full max-w-3xl pointer-events-auto">

          {/* Confidence Chart Panel */}
          <div className="mb-2 bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-[0_4px_16px_rgb(0,0,0,0.05)]">
            <ConfidenceChart sessionId={sessionId} messages={messages} />
          </div>

          <form onSubmit={handleSubmit} className="relative flex flex-col w-full bg-white border border-zinc-200 rounded-[2rem] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.08)] focus-within:border-zinc-300 focus-within:shadow-[0_12px_40px_rgb(0,0,0,0.12)] transition-all duration-200">

            {showSensitivityShield && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center bg-zinc-950/30 backdrop-blur-[2px] px-4">
                <div
                  className="w-[min(92vw,23rem)] aspect-square rounded-3xl border border-zinc-200 bg-white p-6 shadow-[0_24px_80px_rgba(0,0,0,0.22)] flex flex-col justify-center text-center"
                  role="alertdialog"
                  aria-modal="true"
                  aria-labelledby="sensitivity-shield-title"
                  aria-describedby="sensitivity-shield-description"
                  onKeyDown={handleShieldKeyDown}
                >
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-amber-700 border border-amber-100">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
                      <path d="M12 9v4" />
                      <path d="M12 17h.01" />
                      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
                    </svg>
                  </div>

                  <h3 id="sensitivity-shield-title" className="text-sm font-semibold tracking-[0.18em] text-zinc-900 uppercase">
                    SENSITIVE MOMENT DETECTED
                  </h3>
                  <p id="sensitivity-shield-description" className="mt-3 text-sm leading-relaxed text-zinc-600">
                    Memory is currently ON. This information may be saved as a memory. Are you comfortable with remembering it?
                  </p>

                  <div className="mt-6 flex flex-col gap-3">
                    <button
                      ref={rememberButtonRef}
                      type="button"
                      onClick={handleRememberWithShield}
                      className="w-full rounded-full bg-zinc-900 px-4 py-3 text-sm font-medium text-white hover:bg-zinc-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
                    >
                      Yes, Remember
                    </button>
                    <button
                      ref={turnOffButtonRef}
                      type="button"
                      onClick={handleTurnOffMemory}
                      className="w-full rounded-full bg-zinc-900 px-4 py-3 text-sm font-medium text-white hover:bg-zinc-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
                    >
                      Turn Memory OFF
                    </button>
                  </div>
                </div>
              </div>
            )}
            {/* Mascot Reminder Bubble (Integrated Incognito Header) */}
            {showMascotReminder && (
              <div className="bg-zinc-50/80 border-b border-zinc-100 px-5 py-3 flex items-center gap-3 w-full animate-in fade-in duration-200">
                <MiniMascot />
                <div className="flex-1 text-sm text-zinc-600 font-medium leading-tight">
                  {storeMemories ? (
                    <span>Memory is On. I am active and saving your important facts.</span>
                  ) : (
                    <span>Memory is Off. No memory is being recorded.</span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setShowMascotReminder(false)}
                  className="text-zinc-500 hover:text-zinc-800 text-xs font-medium transition-colors px-2 py-1 rounded-md hover:bg-zinc-200 cursor-pointer"
                  title="Dismiss"
                >
                  Dismiss
                </button>
              </div>
            )}

            <textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSubmit(e)
                }
              }}
              className="w-full bg-transparent border-0 pt-4 pb-2 px-4 text-base text-zinc-900 placeholder-zinc-400 focus:ring-0 focus:outline-none resize-none overflow-y-auto no-scrollbar"
              style={{ minHeight: '52px', maxHeight: '200px' }}
              placeholder="Ask anything..."
              rows={2}
            />

            <div className="flex items-center justify-between px-3 pb-3 pt-1">
              <div className="flex items-center gap-2">
                <button type="button" className="p-2 text-zinc-400 hover:text-zinc-700 bg-zinc-50 hover:bg-zinc-100 rounded-full transition-colors flex items-center gap-1.5">
                  <Plus className="w-4 h-4" />
                </button>
                
                {/* Toggles Moved Here */}
                <div className="flex items-center gap-4 px-2">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <div className="relative">
                      <input type="checkbox" className="sr-only" checked={storeMemories} onChange={() => setStoreMemories(!storeMemories)} />
                      <div className={`block w-7 h-4 rounded-full transition-colors duration-300 ease-in-out ${storeMemories ? 'bg-zinc-900' : 'bg-zinc-200'}`}></div>
                      <div className={`absolute left-0.5 top-0.5 bg-white w-3 h-3 rounded-full transform transition-transform duration-300 ease-in-out ${storeMemories ? 'translate-x-3' : 'translate-x-0'}`}></div>
                    </div>
                    <div className="flex items-center gap-1 text-xs font-medium text-zinc-600 group-hover:text-zinc-900 transition-colors">
                      <Database className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Save Memory</span>
                    </div>
                  </label>

                  <div className="w-px h-3 bg-zinc-200"></div>

                  <label className="flex items-center gap-2 cursor-pointer group">
                    <div className="relative">
                      <input type="checkbox" className="sr-only" checked={useProfile} onChange={() => setUseProfile(!useProfile)} />
                      <div className={`block w-7 h-4 rounded-full transition-colors duration-300 ease-in-out ${useProfile ? 'bg-zinc-900' : 'bg-zinc-200'}`}></div>
                      <div className={`absolute left-0.5 top-0.5 bg-white w-3 h-3 rounded-full transform transition-transform duration-300 ease-in-out ${useProfile ? 'translate-x-3' : 'translate-x-0'}`}></div>
                    </div>
                    <div className="flex items-center gap-1 text-xs font-medium text-zinc-600 group-hover:text-zinc-900 transition-colors">
                      <UserCheck className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Use Memory</span>
                    </div>
                  </label>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={toggleSpeechRecognition}
                  title={isListening ? 'Stop recording' : 'Start voice input'}
                  className={`p-2 rounded-full transition-all duration-200 relative ${
                    isListening
                      ? 'text-white bg-red-500 hover:bg-red-600 shadow-md'
                      : 'text-zinc-400 hover:text-zinc-700'
                  }`}
                >
                  {isListening && (
                    <span className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-60" />
                  )}
                  <Mic className="w-4 h-4 relative z-10" />
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
