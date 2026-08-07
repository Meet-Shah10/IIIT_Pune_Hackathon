import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import { Bell, Settings, Database, Timer, Trash2, PieChart } from 'lucide-react'

export default function DashboardPage() {
  const { data: memories = [], isLoading: memoriesLoading } = useQuery({
    queryKey: ['memories'],
    queryFn: api.getMemories,
  })

  const { data: events = [], isLoading: eventsLoading } = useQuery({
    queryKey: ['events'],
    queryFn: api.getEvents,
  })

  // Simulated expiring list for the UI
  const expiringMemories = memories.slice(0, 4)
  const activeCount = memories.filter(m => m.status !== 'forgotten').length

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* TopAppBar (Mobile & Global Actions) */}
      <header className="fixed top-0 w-full md:w-[calc(100%-16rem)] z-50 bg-[var(--color-glass-surface)] backdrop-blur-md border-b border-[var(--color-border-subtle)] flex justify-between items-center px-8 h-16">
        <div className="md:hidden">
          <h1 className="font-headline-md font-bold text-white tracking-tighter">MemoryVault</h1>
        </div>
        <div className="hidden md:block">
          <h2 className="font-body-base text-zinc-500">Expiration Engine Dashboard</h2>
        </div>
        <div className="flex items-center space-x-4">
          <Bell className="w-5 h-5 text-zinc-500 hover:text-[var(--color-primary)] cursor-pointer transition-colors" />
          <Settings className="w-5 h-5 text-zinc-500 hover:text-[var(--color-primary)] cursor-pointer transition-colors" />
          <div className="w-8 h-8 rounded-full bg-zinc-800 overflow-hidden border border-[var(--color-border-subtle)] cursor-pointer hover:border-[var(--color-primary)] transition-colors">
            {/* Avatar placeholder */}
          </div>
        </div>
      </header>

      <div className="pt-24 px-8 pb-20 flex-1 max-w-7xl mx-auto w-full">
        <div className="mb-8">
          <h1 className="font-display-lg text-3xl md:text-5xl text-white mb-2">Expiration Engine</h1>
          <p className="font-code text-zinc-500 text-xs">SYSTEM STATUS: <span className="text-[var(--color-primary-container)]">ACTIVE PURGE CYCLE</span></p>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Card 1: Active Memories */}
          <div className="bento-card rounded-xl p-6 md:col-span-4 flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute inset-0 bg-[var(--color-primary-container)]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl"></div>
            <div>
              <h3 className="font-label-caps text-zinc-500 mb-4 uppercase tracking-wider flex items-center text-[10px]">
                <Database className="mr-2 w-4 h-4" />
                Active Memories
              </h3>
            </div>
            <div className="mt-8">
              <div className="font-display-lg text-5xl text-[var(--color-primary-container)] drop-shadow-[0_0_15px_rgba(255,92,0,0.3)]">
                {activeCount > 0 ? activeCount : '4,892'}
              </div>
              <div className="font-code text-zinc-500 mt-2 text-xs">
                Total nodes secured
              </div>
            </div>
          </div>

          {/* Card 2: Expiring Soon */}
          <div className="bento-card rounded-xl p-6 md:col-span-8 flex flex-col">
            <h3 className="font-label-caps text-zinc-500 mb-6 uppercase tracking-wider flex items-center border-b border-[var(--color-border-subtle)] pb-4 text-[10px]">
              <Timer className="mr-2 w-4 h-4" />
              Expiring Soon
            </h3>
            <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
              {expiringMemories.length > 0 ? expiringMemories.map((mem, i) => (
                <div key={mem._id || i} className="flex items-center justify-between group">
                  <div className="flex items-center space-x-3 overflow-hidden">
                    <div className="w-2 h-2 rounded-full bg-[var(--color-primary-container)] shrink-0"></div>
                    <span className="font-code text-white group-hover:text-[var(--color-primary-container)] transition-colors text-xs truncate">
                      {mem.content}
                    </span>
                  </div>
                  <span className="font-code text-zinc-500 text-xs shrink-0 pl-4">00:14:59</span>
                </div>
              )) : (
                <>
                  {/* Mock data matching Stitch if no real memories */}
                  <div className="flex items-center justify-between group">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 rounded-full bg-[var(--color-primary-container)]"></div>
                      <span className="font-code text-white group-hover:text-[var(--color-primary-container)] transition-colors text-xs">Project_Apollo_Logs.enc</span>
                    </div>
                    <span className="font-code text-zinc-500 text-xs">00:14:59</span>
                  </div>
                  <div className="flex items-center justify-between group">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 rounded-full bg-[var(--color-primary-container)]/60"></div>
                      <span className="font-code text-white group-hover:text-[var(--color-primary-container)] transition-colors text-xs">Client_Brief_Q3_Temp.pdf</span>
                    </div>
                    <span className="font-code text-zinc-500 text-xs">02:45:12</span>
                  </div>
                  <div className="flex items-center justify-between group">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 rounded-full bg-zinc-600"></div>
                      <span className="font-code text-zinc-500 group-hover:text-white transition-colors text-xs">Draft_Proposals_v2.docx</span>
                    </div>
                    <span className="font-code text-zinc-500 text-xs">23:59:59</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Card 3: System Purge Log */}
          <div className="bento-card rounded-xl p-6 md:col-span-7 flex flex-col min-h-[300px]">
            <h3 className="font-label-caps text-zinc-500 mb-6 uppercase tracking-wider flex items-center border-b border-[var(--color-border-subtle)] pb-4 text-[10px]">
              <Trash2 className="mr-2 w-4 h-4" />
              System Purge Log
            </h3>
            <div className="space-y-3 flex-1 font-code text-zinc-500 text-[11px] overflow-y-auto custom-scrollbar">
              {events.length > 0 ? events.map((ev, idx) => (
                <div key={ev._id || idx} className="flex items-start">
                  <span className={ev.action === 'extracted' ? 'text-green-500 mr-3' : 'text-[var(--color-primary-container)] mr-3'}>[{ev.action.substring(0, 3).toUpperCase()}]</span>
                  <span>{ev.detail}</span>
                  <span className="ml-auto text-zinc-600 text-[9px] shrink-0 pl-2">
                    {new Date(ev.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </span>
                </div>
              )) : (
                <>
                  <div className="flex items-start">
                    <span className="text-[var(--color-primary-container)] mr-3">[SYS]</span>
                    <span>Purged <span className="text-white">14</span> obsolete tokens from Cache_A</span>
                    <span className="ml-auto text-zinc-600 text-[9px]">JUST NOW</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-zinc-400 mr-3">[AUT]</span>
                    <span>Executed hard-delete on <span className="text-white">Archive_09x</span> per policy</span>
                    <span className="ml-auto text-zinc-600 text-[9px]">12m ago</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Card 4: Privacy Distribution (Chart Placeholder) */}
          <div className="bento-card rounded-xl p-6 md:col-span-5 flex flex-col relative overflow-hidden">
            <h3 className="font-label-caps text-zinc-500 mb-6 uppercase tracking-wider flex items-center z-10 text-[10px]">
              <PieChart className="mr-2 w-4 h-4" />
              Privacy Distribution
            </h3>
            <div className="flex-1 flex items-center justify-center relative z-10">
              <div className="relative w-40 h-40">
                {/* Outer Ring */}
                <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" fill="none" r="45" stroke="rgba(255,255,255,0.05)" strokeWidth="10"></circle>
                  <circle className="transition-all duration-1000 ease-out" cx="50" cy="50" fill="none" r="45" stroke="var(--color-primary-container)" strokeDasharray="283" strokeDashoffset="70" strokeWidth="10"></circle>
                </svg>
                {/* Inner Ring */}
                <svg className="absolute inset-0 w-full h-full transform -rotate-90 p-3" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" fill="none" r="45" stroke="rgba(255,255,255,0.05)" strokeWidth="6"></circle>
                  <circle className="transition-all duration-1000 ease-out delay-100" cx="50" cy="50" fill="none" r="45" stroke="#c6c6c7" strokeDasharray="283" strokeDashoffset="150" strokeWidth="6"></circle>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center font-code">
                  <span className="text-[var(--color-primary-container)] text-xl font-bold">75%</span>
                  <span className="text-zinc-500 text-[10px]">Strict</span>
                </div>
              </div>
            </div>
            
            <div className="mt-4 grid grid-cols-2 gap-4 font-code text-[10px] z-10 border-t border-[var(--color-border-subtle)] pt-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-[var(--color-primary-container)]"></div>
                <span className="text-zinc-500">Strict</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-zinc-400"></div>
                <span className="text-zinc-500">Standard</span>
              </div>
            </div>
            
            {/* Decorative subtle glow behind chart */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-[var(--color-primary-container)]/10 rounded-full blur-3xl pointer-events-none"></div>
          </div>

        </div>
      </div>
    </div>
  )
}
