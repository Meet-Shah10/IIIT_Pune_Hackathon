import { Clock, Trash2, ShieldAlert } from 'lucide-react'
import { SensitivityBadge } from './SensitivityBadge'
import { Button } from '../ui/Button'
import { cn } from '../../lib/utils'

export function MemoryCard({ memory, onForget }) {
  const isPermanent = !memory.expiresAt
  const isForgotten = memory.status === 'forgotten'

  return (
    <div className={cn(
      "card p-5 relative overflow-hidden transition-all group",
      isForgotten ? "opacity-60 grayscale" : "hover:border-[var(--border-light)]"
    )}>
      {/* Category Ribbon */}
      <div className="absolute top-0 right-0 px-3 py-1 bg-[var(--surface-raised)] border-b border-l border-[var(--border)] rounded-bl-lg text-[10px] font-mono text-[var(--text-muted)] tracking-wider uppercase">
        {memory.category}
      </div>

      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <p className={cn(
            "text-body font-medium mb-3",
            isForgotten && "line-through decoration-[var(--error)]"
          )}>
            {memory.content}
          </p>
          
          <div className="flex flex-wrap items-center gap-2 mt-auto">
            <SensitivityBadge sensitivity={memory.sensitivity} />
            
            <div className="flex items-center gap-1 text-meta text-[var(--text-muted)] bg-[var(--surface-raised)] border border-[var(--border)] px-2 py-0.5 rounded-md">
              <Clock className="w-3 h-3" />
              {isPermanent ? 'PERMANENT' : `EXPIRES ${new Date(memory.expiresAt).toLocaleDateString()}`}
            </div>
            
            <div className="text-meta text-[var(--text-muted)] ml-2">
              Captured {new Date(memory.createdAt).toLocaleDateString()}
            </div>
          </div>
        </div>

        {!isForgotten && (
          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
            <Button 
              variant="destructive" 
              size="icon" 
              onClick={() => onForget(memory._id)}
              title="Forget this memory"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
