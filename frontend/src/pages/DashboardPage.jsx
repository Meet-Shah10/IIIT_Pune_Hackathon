import { useState } from 'react'
import { Edit2, Trash2 } from 'lucide-react'

// Dummy Data
const initialMemories = [
  {
    id: 1,
    content: 'Preparing for GATE 2027',
    category: 'goal',
    sensitivity: 'Medium',
  },
  {
    id: 2,
    content: 'Prefers Python for backend development',
    category: 'preference',
    sensitivity: 'Low',
  },
  {
    id: 3,
    content: 'Allergic to peanuts and tree nuts',
    category: 'health',
    sensitivity: 'High',
  },
  {
    id: 4,
    content: 'Loves sci-fi movies and reading classic literature',
    category: 'interest',
    sensitivity: 'Low',
  }
]

const auditEvents = [
  {
    id: 1,
    timestamp: 'Just now',
    description: 'Memory Revoked: Allergic to peanuts',
    type: 'revoked'
  },
  {
    id: 2,
    timestamp: '2 hours ago',
    description: 'Memory Extracted: Loves sci-fi movies',
    type: 'extracted'
  },
  {
    id: 3,
    timestamp: 'Yesterday, 14:30',
    description: 'Settings Updated: Enabled continuous extraction',
    type: 'settings'
  },
  {
    id: 4,
    timestamp: 'Yesterday, 09:15',
    description: 'Memory Extracted: Preparing for GATE 2027',
    type: 'extracted'
  },
  {
    id: 5,
    timestamp: '2 days ago',
    description: 'System Initialized',
    type: 'settings'
  }
]

export default function DashboardPage() {
  const [memories, setMemories] = useState(initialMemories)

  const handleForget = (id) => {
    setMemories(memories.filter(m => m.id !== id))
  }

  const getSensitivityClasses = (sensitivity) => {
    switch (sensitivity) {
      case 'High':
        return 'bg-rose-50 text-rose-700 border border-rose-200'
      case 'Medium':
        return 'bg-amber-50 text-amber-700 border border-amber-200'
      case 'Low':
      default:
        return 'bg-emerald-50 text-emerald-700 border border-emerald-200'
    }
  }

  const getDotColor = (type) => {
    switch (type) {
      case 'extracted':
        return 'bg-blue-500'
      case 'revoked':
        return 'bg-red-500'
      case 'settings':
      default:
        return 'bg-zinc-300'
    }
  }

  return (
    <div className="min-h-screen bg-white p-8 lg:p-12 font-body-base">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Memory Vault</h1>
        <p className="text-sm text-zinc-500 mt-1">Review and manage what the AI remembers about you</p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mt-10">
        
        {/* Left/Center Area (span 2 cols) - "Active Context" */}
        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {memories.map(memory => (
              <div 
                key={memory.id} 
                className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="bg-zinc-100 text-zinc-600 px-2 py-1 rounded text-xs font-medium uppercase tracking-wide">
                      {memory.category}
                    </span>
                    <span className={`px-2 py-1 rounded text-[10px] font-semibold uppercase tracking-wider ${getSensitivityClasses(memory.sensitivity)}`}>
                      {memory.sensitivity}
                    </span>
                  </div>
                  
                  <p className="text-zinc-800 text-[15px] mt-4 mb-6 leading-relaxed">
                    {memory.content}
                  </p>
                </div>
                
                <div className="flex items-center justify-between border-t border-zinc-100 pt-4 mt-auto">
                  <button className="flex items-center gap-1.5 text-zinc-400 hover:text-zinc-900 text-sm transition-colors">
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                  <button 
                    onClick={() => handleForget(memory.id)}
                    className="flex items-center gap-1.5 text-red-500 hover:text-red-600 text-sm font-medium transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Forget</span>
                  </button>
                </div>
              </div>
            ))}
            
            {memories.length === 0 && (
              <div className="col-span-1 sm:col-span-2 py-12 text-center text-zinc-500 text-sm bg-zinc-50 rounded-xl border border-dashed border-zinc-200">
                No active memories found.
              </div>
            )}
          </div>
        </div>

        {/* Right Area (span 1 col) - "Audit Trail" */}
        <div className="lg:col-span-1">
          <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-6 h-fit sticky top-8">
            <h2 className="text-sm font-semibold text-zinc-900 mb-6 uppercase tracking-wide">Activity Log</h2>
            
            <div className="border-l-2 border-zinc-200 ml-2 pl-4 space-y-6">
              {auditEvents.map(event => (
                <div key={event.id} className="relative">
                  {/* The dot is positioned exactly on top of the left border. 
                      Since the container has pl-4 (16px), -left-[21px] brings it back 16px to the border edge, 
                      and another 5px to center the 10px dot over the 2px border. */}
                  <div className={`absolute w-2.5 h-2.5 rounded-full ${getDotColor(event.type)} -left-[21px] top-1.5 border-2 border-zinc-50`} />
                  
                  <div className="text-xs text-zinc-400 mb-1">{event.timestamp}</div>
                  <div className="text-sm text-zinc-800">{event.description}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
