import { NavLink, useNavigate } from 'react-router-dom'
import {
  Plus, Monitor, LayoutDashboard, GitCommit, Settings,
  ChevronDown, Bell, PanelLeftClose, PanelLeftOpen
} from 'lucide-react'
import { useSidebar } from '../../context/SidebarContext'

export function Sidebar() {
  const { isOpen, toggle, triggerNewChat } = useSidebar()
  const navigate = useNavigate()

  const handleNewChat = () => {
    // Navigate to chat first, then trigger the new-chat handler
    navigate('/')
    // Small delay so ChatPage mounts and registers its handler if not already
    setTimeout(() => triggerNewChat(), 50)
  }

  return (
    <>
      {/* Collapsed state — show only a small re-open strip/button */}
      {!isOpen && (
        <div className="fixed left-0 top-0 h-full w-12 bg-[#f9f9f9] border-r border-zinc-200 flex flex-col items-center py-4 gap-4 z-40 transition-all duration-300 ease-in-out hidden md:flex">
          {/* Logo — click to go home */}
          <button
            onClick={() => navigate('/')}
            className="w-8 h-8 flex items-center justify-center text-zinc-800 hover:text-zinc-500 transition-colors"
            title="Go to Chat"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </button>

          {/* Re-open button */}
          <button
            onClick={toggle}
            className="w-8 h-8 flex items-center justify-center text-zinc-500 hover:text-zinc-800 hover:bg-zinc-200/50 rounded-md transition-colors"
            title="Expand sidebar"
          >
            <PanelLeftOpen className="w-4 h-4" />
          </button>

          {/* Quick new-chat */}
          <button
            onClick={handleNewChat}
            className="w-8 h-8 flex items-center justify-center text-zinc-500 hover:text-zinc-800 hover:bg-zinc-200/50 rounded-md transition-colors"
            title="New chat"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      )}
      {/* Full sidebar */}
      <nav
        className={`fixed left-0 top-0 h-full w-64 bg-[#f9f9f9] border-r border-zinc-200 flex-col z-40 transition-all duration-300 ease-in-out hidden md:flex ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top Header */}
        <div className="px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Logo icon — clickable, navigates to chat */}
            <button
              onClick={() => navigate('/')}
              className="w-6 h-6 flex items-center justify-center text-zinc-800 hover:text-zinc-500 transition-colors"
              title="Go to Chat"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </button>
          </div>

          {/* Collapse button */}
          <button
            onClick={toggle}
            className="text-zinc-500 hover:text-zinc-800 hover:bg-zinc-200/50 p-1.5 rounded-md transition-colors"
            title="Collapse sidebar"
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>
        </div>

        {/* New Session Button */}
        <div className="px-4 mt-2">
          <button
            onClick={handleNewChat}
            className="flex items-center gap-2 px-3 py-2 w-full rounded-md hover:bg-zinc-200/50 text-zinc-700 font-medium text-sm transition-colors active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>New</span>
          </button>
        </div>

        {/* Primary Links */}
        <div className="px-4 mt-4 space-y-0.5">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `flex items-center space-x-3 px-3 py-2 rounded-md transition-all duration-200 text-sm font-medium ${isActive
                ? 'bg-zinc-200/50 text-zinc-900'
                : 'text-zinc-600 hover:bg-zinc-200/30 hover:text-zinc-900'
              }`
            }
          >
            <Monitor className="w-4 h-4" />
            <span>Chat</span>
          </NavLink>

          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `flex items-center space-x-3 px-3 py-2 rounded-md transition-all duration-200 text-sm font-medium ${isActive
                ? 'bg-zinc-200/50 text-zinc-900'
                : 'text-zinc-600 hover:bg-zinc-200/30 hover:text-zinc-900'
              }`
            }
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard</span>
          </NavLink>

          <NavLink
            to="/timeline"
            className={({ isActive }) =>
              `flex items-center space-x-3 px-3 py-2 rounded-md transition-all duration-200 text-sm font-medium ${isActive
                ? 'bg-zinc-200/50 text-zinc-900'
                : 'text-zinc-600 hover:bg-zinc-200/30 hover:text-zinc-900'
              }`
            }
          >
            <GitCommit className="w-4 h-4" />
            <span>Timeline</span>
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
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
              </div>
              <span className="text-xs font-medium text-zinc-700 truncate max-w-[120px]">harshlal0155935</span>
            </div>
            <Bell className="w-3.5 h-3.5 text-zinc-500" />
          </div>
        </div>
      </nav>
    </>
  )
}
