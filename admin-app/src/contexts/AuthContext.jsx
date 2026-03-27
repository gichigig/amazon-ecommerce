import { createContext, useContext, useEffect, useState } from 'react'
import { api } from '../lib/api'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    // Check for existing token and get current user
    const initAuth = async () => {
      const token = api.getToken()
      if (token) {
        try {
          const { data, error } = await api.getCurrentUser()
          if (data && !error) {
            setUser(data.user)
            setIsAdmin(data.user.isAdmin || data.user.admin)
          } else {
            api.setToken(null)
          }
        } catch (error) {
          console.error('Error getting current user:', error)
          api.setToken(null)
        }
      }
      setLoading(false)
    }
    
    initAuth()
  }, [])

  const signIn = async (email, password) => {
    try {
      const { data, error } = await api.signIn(email, password)
      if (error) throw error
      setUser(data.user)
      setIsAdmin(data.user.isAdmin || data.user.admin)
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  const signOut = async () => {
    await api.signOut()
    setUser(null)
    setIsAdmin(false)
    return { error: null }
  }

  const value = {
    user,
    loading,
    isAdmin,
    signIn,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
