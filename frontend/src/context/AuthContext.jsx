import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../lib/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
      api.setToken(token);
      // Fetch user profile
      api.getMe()
        .then((userData) => {
          setUser(userData);
        })
        .catch((err) => {
          console.error("Token invalid or expired", err);
          logout();
        })
        .finally(() => setLoading(false));
    } else {
      localStorage.removeItem('token');
      api.setToken(null);
      setUser(null);
      setLoading(false);
    }
  }, [token]);

  const login = async (email, password) => {
    try {
      const data = await api.login(email, password);
      setToken(data.token);
      setUser(data);
      return data;
    } catch (err) {
      throw err;
    }
  };

  const register = async (name, email, password) => {
    try {
      const data = await api.register(name, email, password);
      setToken(data.token);
      setUser(data);
      return data;
    } catch (err) {
      throw err;
    }
  };

  const logout = () => {
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
