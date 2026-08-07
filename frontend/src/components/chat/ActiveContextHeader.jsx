import { Settings2, Database } from 'lucide-react'
import { cn } from '../../lib/utils'

export default function ActiveContextHeader({ allowStorage, setAllowStorage, useContext, setUseContext }) {
  return (
    <div className="sticky top-0 z-50 glass border-b border-[var(--border)] py-3 px-4 flex items-center justify-between sm:justify-end gap-4 shadow-sm">
      <div className="flex items-center gap-4 sm:gap-6 w-full sm:w-auto">
        
        {/* Toggle 1: Use Saved Profile */}
        <label className="flex items-center gap-3 cursor-pointer group flex-1 sm:flex-initial justify-between">
          <div className="flex items-center gap-2 text-sm">
            <Settings2 className="w-4 h-4 text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors" />
            <span className={cn("transition-colors", useContext ? "text-[var(--text-primary)]" : "text-[var(--text-muted)] group-hover:text-[var(--text-secondary)]")}>
              Use Saved Profile
            </span>
          </div>
          <button 
            type="button"
            onClick={() => setUseContext(!useContext)}
            className={cn("toggle-pill", useContext ? "active" : "inactive")}
          >
            {useContext ? 'ON' : 'OFF'}
          </button>
        </label>

        {/* Toggle 2: Extract & Store */}
        <label className="flex items-center gap-3 cursor-pointer group flex-1 sm:flex-initial justify-between border-l border-[var(--border)] pl-4 sm:pl-6">
          <div className="flex items-center gap-2 text-sm">
            <Database className="w-4 h-4 text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors" />
            <span className={cn("transition-colors", allowStorage ? "text-[var(--text-primary)]" : "text-[var(--text-muted)] group-hover:text-[var(--text-secondary)]")}>
              Extract & Store
            </span>
          </div>
          <button 
            type="button"
            onClick={() => setAllowStorage(!allowStorage)}
            className={cn("toggle-pill", allowStorage ? "active" : "inactive")}
          >
            {allowStorage ? 'ON' : 'OFF'}
          </button>
        </label>
      </div>
    </div>
  )
}
