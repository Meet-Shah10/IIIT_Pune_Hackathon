import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'

export function Layout() {
  return (
    <div className="flex h-screen overflow-hidden bg-white text-zinc-900 font-body-base">
      <Sidebar />
      
      {/* Main content shifts right on md screens */}
      <main className="flex-1 md:ml-64 relative z-10 overflow-y-auto flex flex-col h-full w-full bg-white">
        <Outlet />
      </main>
    </div>
  )
}
