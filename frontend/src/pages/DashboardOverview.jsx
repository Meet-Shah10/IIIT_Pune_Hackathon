import { useEffect, useState } from 'react'
import { Database, Timer, Trash2, Shield, ShieldAlert } from 'lucide-react'
import MemoryRelationshipMap from '../components/dashboard/MemoryRelationshipMap'
import { api } from '../lib/api'

const initialMemories = [
  {
    id: 'MEM-101',
    content: 'Preparing for GATE 2027 and DBMS exam',
    category: 'education',
    sensitivity: 'Medium',
  },
  {
    id: 'MEM-102',
    content: 'Prefers Python for backend development and React for UI',
    category: 'preference',
    sensitivity: 'Low',
  },
  {
    id: 'MEM-103',
    content: 'Allergic to peanuts and tree nuts',
    category: 'health',
    sensitivity: 'High',
  },
  {
    id: 'MEM-104',
    content: 'Drinks 2 cups of black coffee every morning at 8 AM',
    category: 'habit',
    sensitivity: 'Low',
  },
  {
    id: 'MEM-105',
    content: 'Living in Pune, Maharashtra for engineering studies',
    category: 'personal',
    sensitivity: 'Medium',
  },
  {
    id: 'MEM-106',
    content: 'Interested in sci-fi novels and classic literature',
    category: 'miscellaneous',
    sensitivity: 'Low',
  }
]

export default function DashboardOverview() {
  const [memories, setMemories] = useState(initialMemories)

  useEffect(() => {
    const loadMemories = async () => {
      try {
        const data = await api.getMemories()
        if (Array.isArray(data)) {
          setMemories(data.map((memory) => ({
            id: memory._id,
            content: memory.content,
            category: memory.category,
            sensitivity: memory.sensitivity,
            status: memory.status,
            createdAt: memory.createdAt,
          })))
        }
      } catch (error) {
        console.error('Failed to load memories:', error)
      }
    }

    loadMemories()
  }, [])

  const handleForget = async (id) => {
    try {
      await api.forgetMemory(id)
      setMemories((prev) => prev.filter((memory) => memory.id !== id))
    } catch (error) {
      console.error('Failed to delete memory:', error)
    }
  }

  return (
    <div className="min-h-screen bg-white p-8 lg:p-12 font-body-base pb-24">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">MemoryVault Overview</h1>
        <p className="text-sm text-zinc-500 mt-1">High-level analytics, interactive relationship graph, and system status for your AI memory.</p>
      </div>

      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

        <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xs font-semibold text-zinc-500 tracking-wider uppercase">Total Memories Saved</h3>
            <Database className="w-4 h-4 text-zinc-400" />
          </div>
          <div className="text-4xl font-bold text-zinc-900 tracking-tight">14,208</div>
          <div className="text-xs font-medium text-emerald-600 mt-2 flex items-center gap-1">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
            +124 this week
          </div>
        </div>

        <div className="bg-red-50/30 border border-red-100 rounded-xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xs font-semibold text-red-500 tracking-wider uppercase">Pending Expirations (24h)</h3>
            <Timer className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-4xl font-bold text-red-600 tracking-tight">342</div>
          <div className="text-xs font-medium text-red-500 mt-2 flex items-center gap-1">
            <ShieldAlert className="w-3 h-3" />
            Requires review
          </div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xs font-semibold text-zinc-500 tracking-wider uppercase">Total Data Deleted</h3>
            <Trash2 className="w-4 h-4 text-zinc-400" />
          </div>
          <div className="text-4xl font-bold text-zinc-900 tracking-tight">2.4 GB</div>
          <div className="text-xs font-medium text-zinc-500 mt-2">
            Last deletion: 2 hrs ago
          </div>
        </div>
      </div>

      {/* Middle Row: Upcoming Removals + Privacy Level — side by side, no height stretching */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">

        {/* Upcoming Removals (2 cols) */}
        <div className="lg:col-span-2 bg-white border border-zinc-200 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] overflow-hidden">
          <div className="px-6 py-5 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50">
            <h2 className="text-sm font-semibold text-zinc-900 flex items-center gap-2">
              <Timer className="w-4 h-4 text-red-500" />
              Upcoming Removals
            </h2>
            <button className="text-xs font-medium text-zinc-500 hover:text-zinc-800 transition-colors">View All</button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-100 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                  <th className="px-6 py-4 font-medium">Memory ID</th>
                  <th className="px-6 py-4 font-medium text-center">Classification</th>
                  <th className="px-6 py-4 font-medium">Time Remaining</th>
                  <th className="px-6 py-4 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                <tr className="border-b border-zinc-50 hover:bg-zinc-50/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-zinc-800">MEM-8821-A</td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-100">PII-Low</span>
                  </td>
                  <td className="px-6 py-4 text-red-500 font-medium">01:24:05</td>
                  <td className="px-6 py-4 text-right">
                    <button className="px-3 py-1.5 text-xs font-medium text-zinc-600 bg-white border border-zinc-200 rounded-md hover:bg-zinc-50 hover:text-zinc-900 transition-colors">Review</button>
                  </td>
                </tr>
                <tr className="border-b border-zinc-50 hover:bg-zinc-50/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-zinc-800">MEM-9104-C</td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-semibold bg-zinc-100 text-zinc-700 border border-zinc-200">Financial-Med</span>
                  </td>
                  <td className="px-6 py-4 text-zinc-600 font-medium">04:12:30</td>
                  <td className="px-6 py-4 text-right">
                    <button className="px-3 py-1.5 text-xs font-medium text-zinc-600 bg-white border border-zinc-200 rounded-md hover:bg-zinc-50 hover:text-zinc-900 transition-colors">Review</button>
                  </td>
                </tr>
                <tr className="hover:bg-zinc-50/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-zinc-800">MEM-7732-X</td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-semibold bg-zinc-100 text-zinc-600 border border-zinc-200">General-Low</span>
                  </td>
                  <td className="px-6 py-4 text-zinc-600 font-medium">12:00:00</td>
                  <td className="px-6 py-4 text-right">
                    <button className="px-3 py-1.5 text-xs font-medium text-zinc-600 bg-white border border-zinc-200 rounded-md hover:bg-zinc-50 hover:text-zinc-900 transition-colors">Review</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Privacy Level (1 col) — self-contained, no height stretching */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-zinc-200 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] overflow-hidden">
            <div className="p-6 border-b border-zinc-100 bg-zinc-50/50 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-zinc-200/50 flex items-center justify-center flex-shrink-0">
                <Shield className="w-5 h-5 text-zinc-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold tracking-tight text-zinc-800">Privacy Level</h3>
              </div>
            </div>

            <div className="p-6 flex flex-col items-center">
              {/* Donut Chart using CSS conic-gradient */}
              <div 
                className="w-32 h-32 rounded-full relative mb-6 shadow-inner cursor-pointer"
                title="Hover Info: High (15%), Medium (35%), Low (50%)"
                style={{
                  background: 'conic-gradient(#FF6F61 0% 15%, #008080 15% 50%, #1B365D 50% 100%)'
                }}
              >
                {/* Inner circle for Donut look */}
                <div className="absolute inset-3 bg-white rounded-full flex flex-col items-center justify-center shadow-sm hover:bg-zinc-50 transition-colors">
                  <span className="text-xl font-bold text-zinc-800">100%</span>
                  <span className="text-[9px] text-zinc-400 font-medium uppercase tracking-wider">Analyzed</span>
                </div>
              </div>

              {/* Legend */}
              <div className="w-full space-y-3">
                {/* High */}
                <div className="flex justify-between items-center text-sm" title="High Risk: 15%">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: '#FF6F61' }}></div>
                    <span className="font-medium text-zinc-700">High Risk</span>
                  </div>
                  <span className="font-semibold text-zinc-900">15%</span>
                </div>
                {/* Medium */}
                <div className="flex justify-between items-center text-sm" title="Medium Risk: 35%">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: '#008080' }}></div>
                    <span className="font-medium text-zinc-700">Medium Risk</span>
                  </div>
                  <span className="font-semibold text-zinc-900">35%</span>
                </div>
                {/* Low */}
                <div className="flex justify-between items-center text-sm" title="Low Risk: 50%">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: '#1B365D' }}></div>
                    <span className="font-medium text-zinc-700">Low Risk</span>
                  </div>
                  <span className="font-semibold text-zinc-900">50%</span>
                </div>
              </div>
            </div>

            <div className="px-6 pb-6 space-y-3">
              <div className="flex justify-between items-center py-2 px-4 bg-zinc-50 rounded-lg border border-zinc-200">
                <span className="text-sm font-medium text-zinc-600">Global Risk Score</span>
                <span className="px-2.5 py-1 rounded bg-blue-50 text-blue-700 text-xs font-semibold tracking-wide">LOW</span>
              </div>
              <div className="flex justify-between items-center py-2 px-4 bg-zinc-50 rounded-lg border border-zinc-200">
                <span className="text-sm font-medium text-zinc-600">Compliance Status</span>
                <span className="px-2.5 py-1 rounded bg-emerald-50 text-emerald-700 text-xs font-semibold tracking-wide">PASSING</span>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Memory Relationship Map — full width, no gaps */}
      <MemoryRelationshipMap
        memories={memories}
        onForgetMemory={handleForget}
      />

    </div>
  )
}
