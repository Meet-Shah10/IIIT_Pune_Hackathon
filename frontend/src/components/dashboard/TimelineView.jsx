import { CheckCircle2, XCircle, RefreshCw } from 'lucide-react'
import { cn } from '../../lib/utils'

export function TimelineView({ events }) {
  if (!events || events.length === 0) {
    return (
      <div className="text-sm text-[var(--text-muted)] p-4 text-center border border-dashed border-[var(--border)] rounded-lg">
        No events recorded yet.
      </div>
    )
  }

  const getIcon = (action) => {
    switch (action) {
      case 'extracted':
        return <CheckCircle2 className="w-4 h-4 text-[var(--status-extracted)]" />
      case 'forgotten':
        return <XCircle className="w-4 h-4 text-[var(--status-forgotten)]" />
      case 'updated':
        return <RefreshCw className="w-4 h-4 text-[var(--status-active)]" />
      default:
        return <CheckCircle2 className="w-4 h-4 text-[var(--text-muted)]" />
    }
  }

  return (
    <div className="timeline-track">
      {events.map((event, idx) => (
        <div key={event._id || idx} className="relative pb-8 last:pb-0">
          <div className="absolute -left-[2.1rem] top-1 bg-[var(--bg)] p-1 rounded-full border border-[var(--border)] z-10 shadow-sm">
            {getIcon(event.action)}
          </div>
          
          <div className="card bg-transparent border-none p-0">
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-sm font-semibold text-[var(--text-primary)] capitalize">
                {event.action}
              </span>
              <span className="text-meta text-[var(--text-muted)]">
                {new Date(event.createdAt).toLocaleString()}
              </span>
            </div>
            
            <p className="text-sm text-[var(--text-secondary)]">
              {event.detail}
            </p>
            
            {event.memoryId && (
              <div className="mt-2 text-xs font-mono text-[var(--text-muted)] bg-[var(--surface-raised)] px-2 py-1 rounded inline-block">
                REF: {event.memoryId.slice(-6)}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
