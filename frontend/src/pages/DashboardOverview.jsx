import { Database, Timer, Trash2, CheckCircle2, ShieldAlert } from 'lucide-react'

export default function DashboardOverview() {
  return (
    <div className="min-h-screen bg-white p-8 lg:p-12 font-body-base pb-24">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">MemoryVault Overview</h1>
        <p className="text-sm text-zinc-500 mt-1">High-level analytics and system status for your AI memory.</p>
      </div>

      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
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
            <h3 className="text-xs font-semibold text-zinc-500 tracking-wider uppercase">Total Data Purged</h3>
            <Trash2 className="w-4 h-4 text-zinc-400" />
          </div>
          <div className="text-4xl font-bold text-zinc-900 tracking-tight">2.4 GB</div>
          <div className="text-xs font-medium text-zinc-500 mt-2">
            Last purge: 2 hrs ago
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Left Column (2/3) */}
        <div className="lg:col-span-2 space-y-10">
          
          {/* Upcoming Purges Table */}
          <div className="bg-white border border-zinc-200 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] overflow-hidden">
            <div className="px-6 py-5 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50">
              <h2 className="text-sm font-semibold text-zinc-900 flex items-center gap-2">
                <Timer className="w-4 h-4 text-red-500" />
                Upcoming Purges
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

          {/* System Log */}
          <div className="bg-white border border-zinc-200 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] overflow-hidden">
            <div className="px-6 py-5 border-b border-zinc-100 bg-zinc-50/50">
              <h2 className="text-sm font-semibold text-zinc-900 flex items-center gap-2">
                <Database className="w-4 h-4 text-zinc-500" />
                System Log
              </h2>
            </div>
            <div className="p-6 space-y-6">
              
              <div className="flex gap-4">
                <div className="mt-0.5">
                  <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-blue-500" />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="text-sm font-medium text-zinc-900">MEM-3321-Z Purged</h4>
                    <span className="text-xs text-zinc-400">10:45 AM</span>
                  </div>
                  <p className="text-sm text-zinc-600"><strong>System Expired:</strong> Standard 30-day retention policy met.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="mt-0.5">
                  <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-blue-500" />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="text-sm font-medium text-zinc-900">MEM-3320-Y Purged</h4>
                    <span className="text-xs text-zinc-400">09:12 AM</span>
                  </div>
                  <p className="text-sm text-zinc-600"><strong>User Requested:</strong> Manual purge initiated via Privacy settings.</p>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* Right Column (1/3) */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-zinc-200 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] overflow-hidden h-full flex flex-col">
            <div className="p-6 border-b border-zinc-100 bg-zinc-50/50 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                <ShieldAlert className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="text-base font-semibold text-zinc-900 leading-tight">Privacy<br/>Classification</h2>
            </div>

            <div className="p-6 space-y-8 flex-1">
              
              {/* High */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium text-rose-600">High Sensitivity (PII/Financial)</span>
                  <span className="font-semibold text-zinc-900">15%</span>
                </div>
                <div className="w-full bg-zinc-100 h-2 rounded-full overflow-hidden mb-2">
                  <div className="bg-rose-500 h-full rounded-full" style={{ width: '15%' }}></div>
                </div>
                <p className="text-xs text-zinc-500">Strict 7-day retention</p>
              </div>

              {/* Medium */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium text-amber-600">Medium (Preferences/Usage)</span>
                  <span className="font-semibold text-zinc-900">35%</span>
                </div>
                <div className="w-full bg-zinc-100 h-2 rounded-full overflow-hidden mb-2">
                  <div className="bg-amber-500 h-full rounded-full" style={{ width: '35%' }}></div>
                </div>
                <p className="text-xs text-zinc-500">Standard 30-day retention</p>
              </div>

              {/* Low */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium text-blue-600">Low (System Metadata)</span>
                  <span className="font-semibold text-zinc-900">50%</span>
                </div>
                <div className="w-full bg-zinc-100 h-2 rounded-full overflow-hidden mb-2">
                  <div className="bg-blue-500 h-full rounded-full" style={{ width: '50%' }}></div>
                </div>
                <p className="text-xs text-zinc-500">Archived after 90 days</p>
              </div>

            </div>

            <div className="p-6 bg-zinc-50 border-t border-zinc-100 space-y-3">
              <div className="flex justify-between items-center py-2 px-4 bg-white rounded-lg border border-zinc-200">
                <span className="text-sm font-medium text-zinc-600">Global Risk Score</span>
                <span className="px-2.5 py-1 rounded bg-blue-50 text-blue-700 text-xs font-semibold tracking-wide">LOW</span>
              </div>
              <div className="flex justify-between items-center py-2 px-4 bg-white rounded-lg border border-zinc-200">
                <span className="text-sm font-medium text-zinc-600">Compliance Status</span>
                <span className="px-2.5 py-1 rounded bg-emerald-50 text-emerald-700 text-xs font-semibold tracking-wide">PASSING</span>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  )
}
