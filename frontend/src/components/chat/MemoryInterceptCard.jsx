import { useState, useEffect } from 'react'
import { MapPin, PlaneTakeoff } from 'lucide-react'

function FriendlyMascot() {
  return (
    <div className="relative w-12 h-12 flex-shrink-0 animate-bounce mt-2" style={{ animationDuration: '3s', animationTimingFunction: 'ease-in-out' }}>
      {/* Soft background glow */}
      <div className="absolute inset-0.5 rounded-full bg-zinc-400/20 blur-md animate-pulse"></div>
      
      {/* Cute bot SVG */}
      <svg className="w-12 h-12 relative z-10 text-zinc-100" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Antennas */}
        <path d="M24 10V6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
        <circle cx="24" cy="5" r="2.5" fill="#f43f5e" className="animate-pulse" />
        
        {/* Head */}
        <rect x="8" y="10" width="32" height="28" rx="14" fill="#18181b" stroke="#3f3f46" strokeWidth="2"/>
        
        {/* Face Screen */}
        <rect x="12" y="14" width="24" height="20" rx="10" fill="#27272a" stroke="#52525b" strokeWidth="1"/>
        
        {/* Happy Eyes (curved paths for smiles/happiness) */}
        <path d="M16 23C16 22 17 21 18 21C19 21 20 22 20 23" stroke="#a1a1aa" strokeWidth="2.5" strokeLinecap="round"/>
        <path d="M28 23C28 22 29 21 30 21C31 21 32 22 32 23" stroke="#a1a1aa" strokeWidth="2.5" strokeLinecap="round"/>
        
        {/* Rosy Cheeks */}
        <circle cx="15" cy="27" r="1.5" fill="#f43f5e" opacity="0.8"/>
        <circle cx="33" cy="27" r="1.5" fill="#f43f5e" opacity="0.8"/>
        
        {/* Smile */}
        <path d="M21 28C22 29 23.5 29.5 24 29.5C24.5 29.5 26 29 27 28" stroke="#f4f4f5" strokeWidth="2" strokeLinecap="round"/>
        
        {/* Decorative ears */}
        <rect x="5" y="20" width="3" height="8" rx="1.5" fill="#3f3f46"/>
        <rect x="40" y="20" width="3" height="8" rx="1.5" fill="#3f3f46"/>
      </svg>
    </div>
  )
}

export function MemoryInterceptCard({ detail, category, sensitivity }) {
  const [active, setActive] = useState(true)

  // Trigger TTS narration on mount/update
  useEffect(() => {
    if ('speechSynthesis' in window) {
      // Cancel previous speaking utterances to avoid queuing overlap
      window.speechSynthesis.cancel();
      
      const cleanDetail = detail || 'new information';
      const textToSpeak = `I detected a memory event: "${cleanDetail}". Would you like me to remember this?`;
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.rate = 1.0;
      utterance.pitch = 1.1; // Slightly higher pitch for a friendly bot persona
      
      window.speechSynthesis.speak(utterance);
    }
    
    // Clean up/cancel speech if the component unmounts
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [detail]);

  // Determine sensitivity color and label
  const isMedOrHigh = sensitivity === 'medium' || sensitivity === 'high' || sensitivity === 'critical'
  
  return (
    <div className="flex items-start gap-4 w-full mt-2 animate-in fade-in slide-in-from-left-4 duration-300">
      {/* Friendly Animated Mascot */}
      <FriendlyMascot />
      
      <div className="flex-1 bg-zinc-950/80 backdrop-blur-xl border border-zinc-800 rounded-xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.6)] relative">
        {/* Top Accent Line */}
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[var(--color-primary-container)] to-transparent opacity-50"></div>
        
        <div className="p-5 flex flex-col gap-5">
          {/* Header & Privacy Badge */}
          <div className="flex flex-wrap justify-between items-start gap-4 border-b border-white/10 pb-4">
            <div className="flex flex-col gap-1">
              <h3 className="font-headline-md text-lg text-white tracking-tight">Memory Intercepted</h3>
              <p className="font-body-sm text-[var(--color-text-muted)] text-xs">
                {detail || 'Context detected. Determine retention protocol.'}
              </p>
            </div>
            
            {/* Privacy Nutrition Label */}
            <div className="inline-flex items-center gap-1.5 bg-zinc-900 border border-zinc-700 px-3 py-1.5 rounded-full shadow-inner">
              <div className={`w-2 h-2 rounded-full ${isMedOrHigh ? 'bg-[var(--color-primary-container)] animate-pulse' : 'bg-green-500'}`}></div>
              <span className="font-label-caps text-[10px] text-white tracking-wider">
                SENSITIVITY: {sensitivity?.toUpperCase() || 'LOW'}
              </span>
              <span className="text-zinc-600 text-[10px] mx-1">|</span>
              <span className="font-label-caps text-[10px] text-zinc-500">{category?.toUpperCase() || 'GENERAL'}</span>
            </div>
          </div>

          {/* Negotiation Options / Toggles */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-white/5 border border-white/10 flex items-center justify-center">
                  <PlaneTakeoff className="w-4 h-4 text-zinc-400" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm text-white font-body-base">Auto-store context for duration</span>
                  <span className="text-xs text-zinc-500 font-body-sm">Link subsequent notes to this context</span>
                </div>
              </div>
              
              {/* Pill Toggle */}
              <button 
                onClick={() => setActive(!active)}
                className={`relative w-10 h-5 rounded-full transition-colors focus:outline-none ${active ? 'bg-[var(--color-primary-container)]' : 'bg-zinc-700'}`}
              >
                <div className={`absolute top-0.5 w-4 h-4 rounded-full transition-transform shadow-sm ${active ? 'bg-black left-[22px]' : 'bg-zinc-400 left-0.5'}`}></div>
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-white/10 mt-1">
            <button className="bg-[var(--color-primary-container)] text-black font-label-caps text-[10px] px-4 py-2.5 rounded hover:opacity-90 transition-all active:scale-95">
              Remember Permanently
            </button>
            <button className="bg-transparent border border-zinc-700 text-white font-label-caps text-[10px] px-4 py-2.5 rounded hover:bg-white/5 transition-all active:scale-95">
              1 Week
            </button>
            <button className="bg-transparent border border-zinc-700 text-white font-label-caps text-[10px] px-4 py-2.5 rounded hover:bg-white/5 transition-all active:scale-95">
              Session Only
            </button>
            <div className="flex-1"></div>
            <button className="text-zinc-500 hover:text-white font-label-caps text-[10px] px-3 py-2 transition-colors active:scale-95">
              Nevermind
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

