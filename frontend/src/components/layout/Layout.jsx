import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { SidebarProvider, useSidebar } from '../../context/SidebarContext'

function LayoutInner() {
  const { isOpen } = useSidebar()

  return (
    <div className="flex h-screen overflow-hidden bg-white text-zinc-900 font-body-base">
      <Sidebar />

      {/* Main content shifts right only when sidebar is open on md+ screens */}
      <main
        className={`flex-1 relative z-10 overflow-y-auto flex flex-col h-full w-full bg-white transition-all duration-300 ease-in-out ${
          isOpen ? 'md:ml-64' : 'md:ml-0'
        }`}
      >
        <Outlet />
      </main>
    </div>
  )
}

export function Layout() {
  return (
    <SidebarProvider>
      <LayoutInner />
    </SidebarProvider>
  )
}
