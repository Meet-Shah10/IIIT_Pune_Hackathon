import { useEffect, useState } from 'react'
import { Database, Timer, Trash2, Shield, ShieldAlert } from 'lucide-react'
import MemoryRelationshipMap from '../components/dashboard/MemoryRelationshipMap'
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
  recentActivity: [],
}

export default function DashboardOverview() {
  const [memories, setMemories] = useState([])
  const [stats, setStats] = useState(defaultStats)
  const [loading, setLoading] = useState(true)

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
    } catch (error) {
      console.error('Failed to delete memory:', error)
    }
  }

  const { totalActive, newThisWeek, totalDeleted, lastDeletionAt, privacyBreakdown, riskScore, recentActivity } = stats

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

        {/* Pending Expirations — no expiresAt field, show N/A */}
        <div className="bg-zinc-50/50 border border-zinc-200 rounded-xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xs font-semibold text-zinc-400 tracking-wider uppercase">Pending Expirations</h3>
            <Timer className="w-4 h-4 text-zinc-300" />
          </div>
          <div className="text-4xl font-bold text-zinc-300 tracking-tight">N/A</div>
          <div className="text-xs font-medium text-zinc-400 mt-2">
            Expiry tracking not enabled
          </div>
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

        {/* Recent Activity (2 cols) — replaces fake "Upcoming Removals" table */}
        <div className="lg:col-span-2 bg-white border border-zinc-200 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] overflow-hidden">
          <div className="px-6 py-5 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50">
            <h2 className="text-sm font-semibold text-zinc-900">Recent Activity</h2>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="space-y-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex gap-3 items-start">
                    <div className="w-2.5 h-2.5 mt-1.5 rounded-full bg-zinc-100 animate-pulse flex-shrink-0" />
                    <div className="flex-1 space-y-1">
                      <div className="h-3 bg-zinc-100 animate-pulse rounded w-3/4" />
                      <div className="h-3 bg-zinc-100 animate-pulse rounded w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : recentActivity.length === 0 ? (
              <p className="text-sm text-zinc-400 text-center py-8">No activity yet.</p>
            ) : (
              <div className="border-l-2 border-zinc-200 ml-1 pl-4 space-y-5">
                {recentActivity.map((event) => (
                  <div key={event._id} className="relative">
                    <div className={`absolute w-2.5 h-2.5 rounded-full ${getDotColor(event.action)} -left-[21px] top-1.5 border-2 border-white`} />
                    <div className="text-xs text-zinc-400 mb-0.5">{formatTimeAgo(event.createdAt)}</div>
                    <div className="text-sm text-zinc-800 font-medium">
                      {event.action === 'forgotten' ? 'Removed' : 'Saved'}: {event.memoryContent}
                    </div>
                    {event.memoryCategory && (
                      <span className="text-[10px] uppercase tracking-wide text-zinc-400">{event.memoryCategory}</span>
                    )}
                  </div>
                ))}
              </div>
            )}
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
      />

    </div>
  )
}
