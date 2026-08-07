import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider, useAuth } from './context/AuthContext'
import { Layout } from './components/layout/Layout'
import LoginPage from './pages/LoginPage'
import ChatPage from './pages/ChatPage'
import DashboardOverview from './pages/DashboardOverview'
import DashboardPage from './pages/DashboardPage'
import MemoryTimeline from './pages/MemoryTimeline'

const queryClient = new QueryClient()

// Protected Route Wrapper
function ProtectedRoute({ children }) {
  const { user } = useAuth()
  if (!user) {
    return <Navigate to="/login" replace />
  }
  return children
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            
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

