import { NavLink } from 'react-router-dom'
import { Plus, Monitor, LayoutDashboard, GitCommit, Settings, ChevronDown, Bell, PanelLeftClose, ArrowUpCircle } from 'lucide-react'

export function Sidebar() {
  return (
    <nav className="fixed left-0 top-0 h-full w-64 bg-[#f9f9f9] border-r border-zinc-200 flex-col z-40 hidden md:flex transition-all duration-200 ease-in-out">
      
      {/* Top Header */}
      <div className="px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Minimalist Logo Icon */}
          <div className="w-6 h-6 flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-zinc-800">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
        </div>
        <button className="text-zinc-500 hover:text-zinc-800 transition-colors">
          <PanelLeftClose className="w-4 h-4" />
        </button>
      </div>

      {/* New Session Button */}
      <div className="px-4 mt-2">
        <button className="flex items-center gap-2 px-3 py-2 w-full rounded-md hover:bg-zinc-200/50 text-zinc-700 font-medium text-sm transition-colors">
          <Plus className="w-4 h-4" />
          <span>New</span>
        </button>
      </div>
      
      {/* Primary Links */}
      <div className="px-4 mt-4 space-y-0.5">
        <NavLink 
          to="/"
          className={({ isActive }) => 
            `flex items-center space-x-3 px-3 py-2 rounded-md transition-all duration-200 text-sm font-medium ${
              isActive 
                ? 'bg-zinc-200/50 text-zinc-900' 
                : 'text-zinc-600 hover:bg-zinc-200/30 hover:text-zinc-900'
            }`
          }
        >
          <Monitor className="w-4 h-4" />
          <span>Chat</span>
        </NavLink>
        
        <NavLink 
          to="/timeline"
          className={({ isActive }) => 
            `flex items-center space-x-3 px-3 py-2 rounded-md transition-all duration-200 text-sm font-medium ${
              isActive 
                ? 'bg-zinc-200/50 text-zinc-900' 
                : 'text-zinc-600 hover:bg-zinc-200/30 hover:text-zinc-900'
            }`
          }
        >
          <GitCommit className="w-4 h-4" />
          <span>Timeline</span>
        </NavLink>

        <NavLink 
          to="/dashboard"
          className={({ isActive }) => 
            `flex items-center space-x-3 px-3 py-2 rounded-md transition-all duration-200 text-sm font-medium ${
              isActive 
                ? 'bg-zinc-200/50 text-zinc-900' 
                : 'text-zinc-600 hover:bg-zinc-200/30 hover:text-zinc-900'
            }`
          }
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Dashboard</span>
        </NavLink>

        <button className="w-full flex items-center space-x-3 px-3 py-2 rounded-md text-zinc-600 hover:bg-zinc-200/30 hover:text-zinc-900 transition-all duration-200 text-sm font-medium">
          <Settings className="w-4 h-4" />
          <span>Customize</span>
        </button>
      </div>



      {/* Sessions Section */}
      <div className="px-4 mt-8 flex-1 overflow-y-auto no-scrollbar">
        <div className="flex items-center justify-between text-xs font-semibold text-zinc-500 px-3 mb-2">
          <span>Sessions</span>
          <ChevronDown className="w-3.5 h-3.5" />
        </div>
        <div className="space-y-0.5">
          <button className="w-full text-left px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-200/50 rounded-md transition-colors truncate">
            hello
          </button>
        </div>
      </div>

      {/* Bottom Profile */}
      <div className="mt-auto">
        <div className="px-4 py-3 border-t border-zinc-200 flex items-center justify-between hover:bg-zinc-200/30 cursor-pointer transition-colors">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-zinc-300 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 text-zinc-600">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
            </div>
            <span className="text-xs font-medium text-zinc-700 truncate max-w-[120px]">harshlal0155935</span>
          </div>
          <Bell className="w-3.5 h-3.5 text-zinc-500" />
        </div>
      </div>

    </nav>
  )
}
