import { NavLink, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import {
  Plus, Monitor, LayoutDashboard, GitCommit, Settings,
  ChevronDown, Bell, PanelLeftClose, PanelLeftOpen, X
} from 'lucide-react'
import { useSidebar } from '../../context/SidebarContext'
import { api } from '../../lib/api'

export function Sidebar() {
  const { isOpen, toggle, triggerNewChat, sessionId, selectSession, sessions } = useSidebar()
  const navigate = useNavigate()
  
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [retentionDays, setRetentionDays] = useState(30)
  const [isSavingSettings, setIsSavingSettings] = useState(false)

  // Load settings when modal opens
  useEffect(() => {
    if (isSettingsOpen) {
      api.getSettings().then(data => {
        if (data && data.defaultRetentionDays !== undefined) {
          setRetentionDays(data.defaultRetentionDays === null ? 'never' : data.defaultRetentionDays)
        }
      }).catch(err => console.error("Failed to load settings:", err))
    }
  }, [isSettingsOpen])

  const handleSaveSettings = async () => {
    setIsSavingSettings(true)
    try {
      const parsedDays = retentionDays === 'never' ? null : Number(retentionDays)
      await api.updateSettings({ defaultRetentionDays: parsedDays })
      setIsSettingsOpen(false)
    } catch (err) {
      console.error("Failed to save settings:", err)
    } finally {
      setIsSavingSettings(false)
    }
  }

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
        </div>

        {/* Sessions Section */}
        <div className="px-4 mt-8 flex-1 overflow-y-auto no-scrollbar">
          <div className="flex items-center justify-between text-xs font-semibold text-zinc-500 px-3 mb-2">
            <span>Sessions</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </div>
          <div className="space-y-0.5">
            {sessions.map((s) => {
              const isActive = s.sessionId === sessionId
              return (
                <button
                  key={s.sessionId}
                  onClick={() => {
                    selectSession(s.sessionId)
                    navigate('/')
                  }}
                  className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors truncate font-medium ${
                    isActive
                      ? 'bg-zinc-200 text-zinc-900'
                      : 'text-zinc-600 hover:bg-zinc-200/50 hover:text-zinc-900'
                  }`}
                >
                  {s.title}
                </button>
              )
            })}
            {sessions.length === 0 && (
              <span className="text-xs text-zinc-400 px-3 italic">No sessions yet.</span>
            )}
          </div>
        </div>

        {/* Bottom Profile & Settings */}
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
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setIsSettingsOpen(true)}
                className="text-zinc-500 hover:text-zinc-800 transition-colors p-1"
                title="Settings"
              >
                <Settings className="w-3.5 h-3.5" />
              </button>
              <Bell className="w-3.5 h-3.5 text-zinc-500" />
            </div>
          </div>
        </div>
      </nav>

      {/* Global Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl border border-zinc-200 w-full max-w-md mx-4 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 bg-zinc-50/60">
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-zinc-600" />
                <span className="font-semibold text-zinc-900 text-sm">Chat Settings</span>
              </div>
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="p-1 rounded-lg hover:bg-zinc-200 transition-colors text-zinc-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6">
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-zinc-900 mb-1">Privacy & Data</h3>
                <p className="text-xs text-zinc-500 mb-4">Configure your global defaults for memory retention.</p>
                
                <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
                  Auto-delete new memories after
                </label>
                <select 
                  className="w-full border border-zinc-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:border-zinc-400 appearance-none bg-white"
                  value={retentionDays}
                  onChange={(e) => setRetentionDays(e.target.value)}
                >
                  <option value="7">7 Days</option>
                  <option value="30">30 Days</option>
                  <option value="90">3 Months (90 Days)</option>
                  <option value="180">6 Months (180 Days)</option>
                  <option value="never">Never (Keep indefinitely)</option>
                </select>
                <p className="text-xs text-zinc-400 mt-2">
                  This setting applies to all newly extracted memories. You can still set custom timers on individual memories in the Dashboard.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-zinc-100 bg-zinc-50/40">
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="px-4 py-2 text-sm font-medium text-zinc-600 bg-white border border-zinc-200 rounded-lg hover:bg-zinc-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveSettings}
                disabled={isSavingSettings}
                className="px-5 py-2 text-sm font-semibold text-white bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50 rounded-lg transition-colors flex items-center gap-2"
              >
                {isSavingSettings ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
