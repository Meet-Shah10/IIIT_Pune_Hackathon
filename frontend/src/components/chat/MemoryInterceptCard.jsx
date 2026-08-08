import { useState } from 'react'
import { MapPin, BrainCircuit, PlaneTakeoff } from 'lucide-react'

export function MemoryInterceptCard({ detail, category, sensitivity }) {
  const [active, setActive] = useState(true)

  // Determine sensitivity color and label
  const isMedOrHigh = sensitivity === 'medium' || sensitivity === 'high' || sensitivity === 'critical'
  
  return (
    <div className="flex gap-3 w-full mt-2">
      <div className="flex-shrink-0 mt-2 hidden sm:block">
        <div className="w-6 h-6 flex items-center justify-center rounded-sm bg-primary-container/20 border border-[var(--color-primary-container)]/30">
          <BrainCircuit className="text-[var(--color-primary-container)] w-3.5 h-3.5" />
        </div>
      </div>
      
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
              <MapPin className="w-3 h-3 text-zinc-500" />
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
