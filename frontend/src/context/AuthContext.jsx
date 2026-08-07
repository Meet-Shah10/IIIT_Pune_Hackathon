import React, { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  // Simple stub for demo
  const [user, setUser] = useState({ id: 'demo-123', email: 'demo@example.com' })
  const [token, setToken] = useState('demo-token') // bypass login for now

  const login = async (email, password) => {
    // Phase 1 implementation later
    setUser({ id: 'demo-123', email })
    setToken('demo-token')
  }

  const logout = () => {
    setUser(null)
    setToken(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
