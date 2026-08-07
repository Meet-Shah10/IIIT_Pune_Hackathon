import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'

export function Layout() {
  return (
    <div className="flex h-screen overflow-hidden bg-[var(--color-background-pure)] text-[var(--color-on-surface)]">
      {/* Abstract Shader Background Placeholder */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-50 flex justify-center items-center">
        <div className="w-[800px] h-[800px] bg-gradient-to-tr from-blue-500/10 to-purple-500/10 blur-[100px] rounded-full opacity-50"></div>
      </div>

      <Sidebar />
      
      {/* Main content shifts right on md screens */}
      <main className="flex-1 md:ml-64 relative z-10 overflow-hidden flex flex-col h-full w-full">
        <Outlet />
      </main>
    </div>
  )
}
