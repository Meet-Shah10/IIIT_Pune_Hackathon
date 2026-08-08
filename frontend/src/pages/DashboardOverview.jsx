import { useEffect, useState } from 'react'
import { Database, Timer, Trash2, Shield, ShieldAlert } from 'lucide-react'
import MemoryRelationshipMap from '../components/dashboard/MemoryRelationshipMap'
import ReviewModal from '../components/dashboard/ReviewModal'
import { api } from '../lib/api'

function formatTimeAgo(dateStr) {
  if (!dateStr) return 'Never'
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins} min ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs} hr${hrs !== 1 ? 's' : ''} ago`
  const days = Math.floor(hrs / 24)
  return `${days} day${days !== 1 ? 's' : ''} ago`
}

const defaultStats = {
  totalActive: 0,
  newThisWeek: 0,
  totalDeleted: 0,
  lastDeletionAt: null,
  privacyBreakdown: { high: 0, medium: 0, low: 100 },
  riskScore: 'LOW',
  upcomingRemovals: [],
  expiring24hCount: 0,
}

export default function DashboardOverview() {
  const [memories, setMemories] = useState([])
  const [stats, setStats] = useState(defaultStats)
  const [loading, setLoading] = useState(true)
  const [reviewingMemory, setReviewingMemory] = useState(null)

  useEffect(() => {
    const load = async () => {
      try {
        const [memoriesData, statsData] = await Promise.all([
          api.getMemories(),
          api.getDashboardStats(),
        ])
        if (Array.isArray(memoriesData)) {
          setMemories(memoriesData.map((m) => ({
            id: m._id,
            content: m.content,
            category: m.category,
            sensitivity: m.sensitivity,
            status: m.status,
            createdAt: m.createdAt,
          })))
        }
        if (statsData) setStats(statsData)
      } catch (error) {
        console.error('Failed to load dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleForget = async (id) => {
    try {
      await api.forgetMemory(id)
      setMemories((prev) => prev.filter((m) => m.id !== id))
      // Refresh stats after deletion
      const updated = await api.getDashboardStats()
      if (updated) setStats(updated)
      setReviewingMemory(null)
    } catch (error) {
      console.error('Failed to delete memory:', error)
    }
  }

  const handleEdit = async (id, newContent) => {
    try {
      await api.editMemory(id, newContent)
      // Instantly reflect in UI
      setMemories((prev) =>
        prev.map((m) => (m.id === id ? { ...m, content: newContent } : m))
      )
    } catch (error) {
      console.error('Failed to edit memory:', error)
      throw error // re-throw so the modal's isSaving state resets
    }
  }

  const handleUpdateRetention = async (id, data) => {
    try {
      await api.updateMemory(id, data)
      const updated = await api.getDashboardStats()
      if (updated) setStats(updated)
      setReviewingMemory(null)
    } catch (error) {
      console.error('Failed to update retention:', error)
    }
  }

  const { totalActive, newThisWeek, totalDeleted, lastDeletionAt, privacyBreakdown, riskScore, upcomingRemovals, expiring24hCount } = stats

  const riskBadge = riskScore === 'HIGH'
    ? 'bg-rose-50 text-rose-700'
    : riskScore === 'MEDIUM'
      ? 'bg-amber-50 text-amber-700'
      : 'bg-blue-50 text-blue-700'

  const getDotColor = (action) => {
    if (action === 'extracted') return 'bg-blue-500'
    if (action === 'forgotten') return 'bg-red-500'
    return 'bg-zinc-300'
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

        {/* Total Memories */}
        <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xs font-semibold text-zinc-500 tracking-wider uppercase">Total Memories Saved</h3>
            <Database className="w-4 h-4 text-zinc-400" />
          </div>
          {loading ? (
            <div className="h-10 w-24 bg-zinc-100 animate-pulse rounded" />
          ) : (
            <>
              <div className="text-4xl font-bold text-zinc-900 tracking-tight">{totalActive.toLocaleString()}</div>
              <div className="text-xs font-medium text-emerald-600 mt-2 flex items-center gap-1">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
                +{newThisWeek} this week
              </div>
            </>
          )}
        </div>

        {/* Pending Expirations */}
        <div className="bg-red-50/30 border border-red-100 rounded-xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xs font-semibold text-red-500 tracking-wider uppercase">Pending Expirations (24h)</h3>
            <Timer className="w-4 h-4 text-red-400" />
          </div>
          {loading ? (
            <div className="h-10 w-24 bg-red-100/50 animate-pulse rounded" />
          ) : (
            <>
              <div className="text-4xl font-bold text-red-600 tracking-tight">{expiring24hCount}</div>
              <div className="text-xs font-medium text-red-500 mt-2 flex items-center gap-1">
                <ShieldAlert className="w-3 h-3" />
                Requires review
              </div>
            </>
          )}
        </div>

        {/* Total Deleted */}
        <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xs font-semibold text-zinc-500 tracking-wider uppercase">Total Memories Deleted</h3>
            <Trash2 className="w-4 h-4 text-zinc-400" />
          </div>
          {loading ? (
            <div className="h-10 w-24 bg-zinc-100 animate-pulse rounded" />
          ) : (
            <>
              <div className="text-4xl font-bold text-zinc-900 tracking-tight">{totalDeleted.toLocaleString()}</div>
              <div className="text-xs font-medium text-zinc-500 mt-2">
                Last deletion: {formatTimeAgo(lastDeletionAt)}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Middle Row: Recent Activity + Privacy Level */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">

        {/* Upcoming Removals (2 cols) */}
        <div className="lg:col-span-2 bg-white border border-zinc-200 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] overflow-hidden flex flex-col">
          <div className="px-6 py-5 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50">
            <h2 className="text-sm font-semibold text-zinc-900 flex items-center gap-2">
              <Timer className="w-4 h-4 text-red-500" />
              Upcoming Removals
            </h2>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse min-w-[500px]">
              <thead>
                <tr className="border-b border-zinc-100 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                  <th className="px-6 py-4 font-medium">Memory</th>
                  <th className="px-6 py-4 font-medium text-center">Sensitivity</th>
                  <th className="px-6 py-4 font-medium">Time Remaining</th>
                  <th className="px-6 py-4 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {loading ? (
                  [...Array(3)].map((_, i) => (
                    <tr key={i} className="border-b border-zinc-50">
                      <td className="px-6 py-4"><div className="h-4 bg-zinc-100 animate-pulse rounded w-3/4" /></td>
                      <td className="px-6 py-4"><div className="h-5 bg-zinc-100 animate-pulse rounded-full w-16 mx-auto" /></td>
                      <td className="px-6 py-4"><div className="h-4 bg-zinc-100 animate-pulse rounded w-16" /></td>
                      <td className="px-6 py-4"><div className="h-6 bg-zinc-100 animate-pulse rounded w-16 ml-auto" /></td>
                    </tr>
                  ))
                ) : upcomingRemovals.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-zinc-400">
                      No memories scheduled for deletion.
                    </td>
                  </tr>
                ) : (
                  upcomingRemovals.map((m) => {
                    const daysLeft = Math.ceil((new Date(m.expiresAt) - new Date()) / (1000 * 60 * 60 * 24))
                    const isUrgent = daysLeft <= 1
                    
                    return (
                      <tr key={m._id} className="border-b border-zinc-50 hover:bg-zinc-50/50 transition-colors">
                        <td className="px-6 py-4 font-medium text-zinc-800 truncate max-w-[200px]" title={m.content}>
                          {m.content}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            m.sensitivity === 'high' || m.sensitivity === 'critical' ? 'bg-rose-50 text-rose-700 border border-rose-100' :
                            m.sensitivity === 'medium' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                            'bg-emerald-50 text-emerald-700 border border-emerald-100'
                          }`}>
                            {m.sensitivity}
                          </span>
                        </td>
                        <td className={`px-6 py-4 font-medium ${isUrgent ? 'text-red-600' : 'text-zinc-600'}`}>
                          {daysLeft < 1 ? 'Today' : `${daysLeft} day${daysLeft > 1 ? 's' : ''}`}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button 
                            onClick={() => setReviewingMemory(m)}
                            className="px-3 py-1.5 text-xs font-medium text-zinc-600 bg-white border border-zinc-200 rounded-md hover:bg-zinc-50 hover:text-zinc-900 transition-colors"
                          >
                            Review
                          </button>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Privacy Level (1 col) */}
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
              {loading ? (
                <div className="w-32 h-32 rounded-full bg-zinc-100 animate-pulse mb-6" />
              ) : (
                <div 
                  className="w-32 h-32 rounded-full relative mb-6 shadow-inner cursor-pointer"
                  title={`Hover Info: High (${privacyBreakdown.high}%), Medium (${privacyBreakdown.medium}%), Low (${privacyBreakdown.low}%)`}
                  style={{
                    background: `conic-gradient(#FF6F61 0% ${privacyBreakdown.high}%, #008080 ${privacyBreakdown.high}% ${privacyBreakdown.high + privacyBreakdown.medium}%, #1B365D ${privacyBreakdown.high + privacyBreakdown.medium}% 100%)`
                  }}
                >
                  {/* Inner circle for Donut look */}
                  <div className="absolute inset-3 bg-white rounded-full flex flex-col items-center justify-center shadow-sm hover:bg-zinc-50 transition-colors">
                    <span className="text-xl font-bold text-zinc-800">100%</span>
                    <span className="text-[9px] text-zinc-400 font-medium uppercase tracking-wider">Analyzed</span>
                  </div>
                </div>
              )}

              {/* Legend */}
              <div className="w-full space-y-3">
                {/* High */}
                <div className="flex justify-between items-center text-sm" title={`High Risk: ${privacyBreakdown.high}%`}>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: '#FF6F61' }}></div>
                    <span className="font-medium text-zinc-700">High Risk</span>
                  </div>
                  {loading ? <div className="h-4 w-8 bg-zinc-100 animate-pulse rounded" /> : <span className="font-semibold text-zinc-900">{privacyBreakdown.high}%</span>}
                </div>
                {/* Medium */}
                <div className="flex justify-between items-center text-sm" title={`Medium Risk: ${privacyBreakdown.medium}%`}>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: '#008080' }}></div>
                    <span className="font-medium text-zinc-700">Medium Risk</span>
                  </div>
                  {loading ? <div className="h-4 w-8 bg-zinc-100 animate-pulse rounded" /> : <span className="font-semibold text-zinc-900">{privacyBreakdown.medium}%</span>}
                </div>
                {/* Low */}
                <div className="flex justify-between items-center text-sm" title={`Low Risk: ${privacyBreakdown.low}%`}>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: '#1B365D' }}></div>
                    <span className="font-medium text-zinc-700">Low Risk</span>
                  </div>
                  {loading ? <div className="h-4 w-8 bg-zinc-100 animate-pulse rounded" /> : <span className="font-semibold text-zinc-900">{privacyBreakdown.low}%</span>}
                </div>
              </div>
            </div>

            <div className="px-6 pb-6 space-y-3">
              <div className="flex justify-between items-center py-2 px-4 bg-zinc-50 rounded-lg border border-zinc-200">
                <span className="text-sm font-medium text-zinc-600">Global Risk Score</span>
                {loading
                  ? <div className="h-5 w-12 bg-zinc-100 animate-pulse rounded" />
                  : <span className={`px-2.5 py-1 rounded text-xs font-semibold tracking-wide ${riskBadge}`}>{riskScore}</span>
                }
              </div>
              <div className="flex justify-between items-center py-2 px-4 bg-zinc-50 rounded-lg border border-zinc-200">
                <span className="text-sm font-medium text-zinc-600">Compliance Status</span>
                <span className="px-2.5 py-1 rounded bg-emerald-50 text-emerald-700 text-xs font-semibold tracking-wide">PASSING</span>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Memory Relationship Map — full width */}
      <MemoryRelationshipMap
        memories={memories}
        onForgetMemory={handleForget}
        onEditMemory={handleEdit}
        onUpdateRetention={handleUpdateRetention}
      />

      {/* Review Modal */}
      {reviewingMemory && (
        <ReviewModal
          memory={reviewingMemory}
          onClose={() => setReviewingMemory(null)}
          onSave={handleUpdateRetention}
          onDelete={handleForget}
        />
      )}
    </div>
  )
}
