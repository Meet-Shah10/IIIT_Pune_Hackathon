import { NavLink } from 'react-router-dom'
import { Archive, Clock, Shield, BrainCircuit, Box, HelpCircle, LogOut } from 'lucide-react'

export function Sidebar() {
  return (
    <nav className="fixed left-0 top-0 h-full w-64 bg-[var(--color-surface-container-lowest)] border-r border-[var(--color-border-subtle)] flex-col py-6 z-40 hidden md:flex transition-all duration-200 ease-in-out">
      <div className="px-6 mb-8 flex items-center gap-3">
        {/* Placeholder logo similar to Stitch UI */}
        <div className="w-8 h-8 rounded bg-white flex items-center justify-center font-bold text-black font-code">
          MC
        </div>
        <div>
          <h1 className="font-headline-md font-bold text-[var(--color-primary-container)] tracking-tighter text-xl">MemoryVault</h1>
          <p className="font-label-caps text-[var(--color-text-muted)] mt-1 text-[10px] tracking-widest">PRECISION INTEGRITY</p>
        </div>
      </div>
      
      <div className="flex-1 px-4 space-y-2">
        <NavLink 
          to="/dashboard"
          className={({ isActive }) => 
            `flex items-center space-x-3 px-4 py-3 rounded transition-all duration-200 ease-in-out font-label-caps uppercase text-xs ${
              isActive 
                ? 'bg-white/5 text-[var(--color-primary-container)] border-r-2 border-[var(--color-primary-container)]' 
                : 'text-[var(--color-text-muted)] hover:bg-white/5 hover:text-[var(--color-on-surface)]'
            }`
          }
        >
          <Box className="w-5 h-5" />
          <span>Vault</span>
        </NavLink>
        
        <NavLink 
          to="/"
          className={({ isActive }) => 
            `flex items-center space-x-3 px-4 py-3 rounded transition-all duration-200 ease-in-out font-label-caps uppercase text-xs ${
              isActive 
                ? 'bg-white/5 text-[var(--color-primary-container)] border-r-2 border-[var(--color-primary-container)]' 
                : 'text-[var(--color-text-muted)] hover:bg-white/5 hover:text-[var(--color-on-surface)]'
            }`
          }
        >
          <Clock className="w-5 h-5" />
          <span>History (Chat)</span>
        </NavLink>

        <button className="w-full flex items-center space-x-3 px-4 py-3 rounded text-[var(--color-text-muted)] hover:bg-white/5 hover:text-[var(--color-on-surface)] transition-all duration-200 ease-in-out font-label-caps uppercase text-xs">
          <BrainCircuit className="w-5 h-5" />
          <span>Intelligence</span>
        </button>
        
        <button className="w-full flex items-center space-x-3 px-4 py-3 rounded text-[var(--color-text-muted)] hover:bg-white/5 hover:text-[var(--color-on-surface)] transition-all duration-200 ease-in-out font-label-caps uppercase text-xs">
          <Archive className="w-5 h-5" />
          <span>Archive</span>
        </button>

        <button className="w-full flex items-center space-x-3 px-4 py-3 rounded text-[var(--color-text-muted)] hover:bg-white/5 hover:text-[var(--color-on-surface)] transition-all duration-200 ease-in-out font-label-caps uppercase text-xs">
          <Shield className="w-5 h-5" />
          <span>Security</span>
        </button>
      </div>

      <div className="px-4 mt-auto space-y-4">
        <button className="w-full bg-[var(--color-primary-container)] text-black font-label-caps py-3 px-4 rounded hover:opacity-90 transition-opacity flex justify-center items-center gap-2">
          <span className="text-xl leading-none">+</span>
          <span>NEW MEMORY</span>
        </button>
        
        <div className="space-y-2 pt-4 border-t border-[var(--color-border-subtle)]">
          <button className="w-full flex items-center space-x-3 px-4 py-2 text-[var(--color-text-muted)] hover:text-[var(--color-on-surface)] transition-colors font-label-caps uppercase text-[10px]">
            <HelpCircle className="w-4 h-4" />
            <span>Support</span>
          </button>
          <button className="w-full flex items-center space-x-3 px-4 py-2 text-[var(--color-text-muted)] hover:text-[var(--color-on-surface)] transition-colors font-label-caps uppercase text-[10px]">
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </nav>
  )
}
