import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider, useAuth } from './context/AuthContext'
import { Layout } from './components/layout/Layout'
import AuthPage from './pages/AuthPage'
import ChatPage from './pages/ChatPage'
import DashboardOverview from './pages/DashboardOverview'
import DashboardPage from './pages/DashboardPage'
import MemoryTimeline from './pages/MemoryTimeline'

const queryClient = new QueryClient()

// Protected Route Wrapper
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  
  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-zinc-50">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-8 h-8 border-4 border-zinc-200 border-t-zinc-900 rounded-full animate-spin"></div>
          <p className="mt-4 text-sm font-medium text-zinc-500">Loading your vault...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />
  }
  return children
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<AuthPage />} />
            
            {/* Redirect /login to /auth */}
            <Route path="/login" element={<Navigate to="/auth" replace />} />
            
            <Route path="/" element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }>
              <Route index element={<ChatPage />} />
              <Route path="dashboard" element={<DashboardOverview />} />
              <Route path="vault" element={<DashboardPage />} />
              <Route path="timeline" element={<MemoryTimeline />} />
            </Route>
            
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App

