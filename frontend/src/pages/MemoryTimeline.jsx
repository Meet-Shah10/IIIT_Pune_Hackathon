import { useEffect, useState } from 'react'
import { Plus, Edit2, Trash2, LoaderCircle } from 'lucide-react'
import { PrivacyAssessmentModal } from '../components/dashboard/PrivacyAssessmentModal'
import { api } from '../lib/api'

export default function MemoryTimeline() {
  const [selectedMemory, setSelectedMemory] = useState(null)
  const [timelineEvents, setTimelineEvents] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    const loadTimeline = async () => {
      try {
        const data = await api.getEvents()
        if (isMounted) {
          setTimelineEvents(Array.isArray(data) ? data : [])
        }
      } catch (error) {
        console.error('Failed to load memory timeline:', error)
        if (isMounted) {
          setTimelineEvents([])
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadTimeline()

    return () => {
      isMounted = false
    }
  }, [])

  const groupedTimeline = (() => {
    const groups = timelineEvents.reduce((acc, event) => {
      const createdAt = new Date(event.savedAt || event.createdAt || Date.now())
      const dateKey = createdAt.toDateString()
      const groupLabel = createdAt.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })

      if (!acc[dateKey]) {
        acc[dateKey] = { dateGroup: groupLabel, commits: [] }
      }

      acc[dateKey].commits.push({
        id: event._id || event.memoryId,
        timeAgo: createdAt.toLocaleString(),
        action: (event.action || 'updated').toUpperCase(),
        icon: event.action === 'forgotten' ? 'trash' : event.action === 'updated' ? 'edit' : 'plus',
        title: event.memoryContent || event.detail || 'Memory event',
        diffs: [
          {
            type: 'add',
            text: `+ ${event.detail || event.reason || 'No detail available'}`,
          },
        ],
        sensitivity: (event.memorySensitivity || event.memory?.sensitivity || 'low').toLowerCase(),
        ttl: event.memory?.status || 'active',
        reason: event.reason || '',
        detail: event.detail || '',
        memory: event.memory || null,
        createdAt: createdAt.toISOString(),
      })

      return acc
    }, {})

    return Object.values(groups).sort((a, b) => new Date(b.commits[0]?.createdAt || 0) - new Date(a.commits[0]?.createdAt || 0))
  })()

  const getActionBadge = (action) => {
    switch (action) {
      case 'CREATED': 
      case 'EXTRACTED': return 'bg-green-100 text-green-700'
      case 'UPDATED': return 'bg-blue-100 text-blue-700'
      case 'EXPIRED': 
      case 'FORGOTTEN': return 'bg-red-100 text-red-700'
      default: return 'bg-zinc-100 text-zinc-700'
    }
  }

  const getPathColor = (action) => {
    switch (action) {
      case 'CREATED': 
      case 'EXTRACTED': return 'bg-green-500'
      case 'UPDATED': return 'bg-blue-500'
      case 'EXPIRED': 
      case 'FORGOTTEN': return 'bg-red-500'
      default: return 'bg-zinc-300'
    }
  }

  const getIcon = (type) => {
    switch (type) {
      case 'plus': return <Plus className="w-3.5 h-3.5 text-blue-600" />
      case 'edit': return <Edit2 className="w-3.5 h-3.5 text-purple-600" />
      case 'trash': return <Trash2 className="w-3.5 h-3.5 text-red-600" />
      default: return null
    }
  }

  const getSensitivityButton = (sensitivity) => {
    switch ((sensitivity || '').toLowerCase()) {
      case 'high':
      case 'critical':
        return 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
      case 'medium':
        return 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'
      case 'low':
      default:
        return 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
    }
  }

  return (
    <div className="min-h-screen bg-white p-8 lg:p-12 font-body-base pb-24">
      {/* Header */}
      <div className="mb-12 max-w-4xl mx-auto">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">Activity Log</h1>
        <p className="text-base text-zinc-500 mt-2">A history of all memory saved and updated.</p>
      </div>

      {/* Timeline Container */}
      <div className="max-w-4xl mx-auto relative pl-4">
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-zinc-200/80"></div>

        {isLoading ? (
          <div className="flex items-center gap-2 text-sm text-zinc-500">
            <LoaderCircle className="w-4 h-4 animate-spin" />
            Loading timeline events...
          </div>
        ) : groupedTimeline.length === 0 ? (
          <div className="text-sm text-zinc-500">No real memory timeline events are available yet.</div>
        ) : (
          <div className="space-y-12 relative">
            {groupedTimeline.map((group, gIdx) => (
              <div key={`${group.dateGroup}-${gIdx}`}>
              
              {/* Date Header */}
              <div className="flex items-center gap-4 mb-8">
                <div className="w-5 h-5 rounded-full bg-zinc-100 border-4 border-white shadow-sm flex items-center justify-center z-10 relative -ml-[2px]">
                  <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full"></div>
                </div>
                <h3 className="text-xs font-bold tracking-widest text-zinc-500 uppercase">{group.dateGroup}</h3>
              </div>

              {/* Commits */}
              <div className="space-y-10 pl-10">
                {group.commits.map((commit, cIdx) => (
                  <div key={cIdx} className="relative group">
                    
                    {/* Colored Path Strip Overlay */}
                    <div className={`absolute -left-[33px] top-2 bottom-[-40px] w-[3px] rounded-full z-0 ${getPathColor(commit.action)}`}></div>

                    {/* Node on line */}
                    <div className="absolute -left-[46px] top-2 w-7 h-7 bg-white border border-zinc-200 rounded-full shadow-sm flex items-center justify-center z-10 transition-transform group-hover:scale-110">
                      {getIcon(commit.icon)}
                    </div>

                    {/* Commit Card */}
                    <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-md transition-all">
                      
                      {/* Header Row */}
                      <div className="px-5 py-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-zinc-900">{commit.title}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${getActionBadge(commit.action)}`}>
                            {commit.action}
                          </span>
                        </div>
                        <span className="text-sm text-zinc-400 font-medium">{commit.timeAgo}</span>
                      </div>

                      {/* Body */}
                      <div className="p-5">
                        <h4 className="text-xl font-medium text-zinc-900 mb-4">{commit.title}</h4>
                        
                        <div className="space-y-1 font-mono text-sm">
                          {commit.diffs.map((diff, dIdx) => (
                            <div 
                              key={dIdx} 
                              className={`px-3 py-2 rounded-md ${
                                diff.type === 'add' 
                                  ? 'bg-blue-50/70 text-blue-900 border border-blue-100/50' 
                                  : 'bg-red-50/70 text-red-900 border border-red-100/50 line-through opacity-80'
                              }`}
                            >
                              {diff.text}
                            </div>
                          ))}
                        </div>
                        {commit.reason && (
                          <div className="mt-4 text-sm text-zinc-500">
                            Reason: {commit.reason}
                          </div>
                        )}
                      </div>

                      {/* Footer / Injection Requirement */}
                      <div className="px-5 py-4 border-t border-zinc-100 bg-white flex items-center gap-4">
                        <span className="text-xs text-zinc-500 font-medium flex items-center gap-1.5">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                          Expires in 6 days
                        </span>
                        
                        {/* Clickable Sensitivity Tag to trigger modal */}
                        <button 
                          onClick={() => setSelectedMemory({
                            id: commit.id,
                            content: commit.title,
                            sensitivity: commit.sensitivity,
                            timestamp: commit.timeAgo,
                            category: commit.memory?.category || 'general',
                            reason: commit.reason,
                            status: commit.memory?.status || commit.ttl || 'active',
                            createdAt: commit.createdAt,
                            detail: commit.detail,
                          })}
                          className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider cursor-pointer transition-colors ${getSensitivityButton(commit.sensitivity)} flex items-center gap-1.5`}
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                          {commit.sensitivity} sensitivity
                        </button>
                      </div>

                    </div>
                  </div>
                ))}
              </div>
              
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Render */}
      {selectedMemory && (
        <PrivacyAssessmentModal 
          memory={selectedMemory} 
          onClose={() => setSelectedMemory(null)} 
        />
      )}
      
    </div>
  )
}
