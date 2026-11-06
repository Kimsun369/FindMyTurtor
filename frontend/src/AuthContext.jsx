import { createContext, useContext, useEffect, useState } from 'react'
import { api } from './api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    api('/auth/me')
      .then((result) => setUser(result.data.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [])

  const value = {
    user,
    loading,
    async login(credentials) {
      const result = await api('/auth/login', { method: 'POST', body: credentials })
      setUser(result.data.user)
      return result
    },
    async register(values) {
      const result = await api('/auth/register', { method: 'POST', body: values })
      setUser(result.data.user?.account_status === 'active' ? result.data.user : null)
      return result
    },
    async logout() {
      await api('/auth/logout', { method: 'POST' })
      setUser(null)
    },
    refresh() {
      return api('/auth/me').then((result) => setUser(result.data.user))
    },
  }
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
