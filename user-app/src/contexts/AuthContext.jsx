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

  useEffect(() => {
    // Check for existing token and get current user
    const initAuth = async () => {
      const token = api.getToken()
      if (token) {
        try {
          const { data, error } = await api.getCurrentUser()
          if (data && !error) {
            setUser(data.user)
          } else {
            api.setTokens(null, null)
          }
        } catch (error) {
          console.error('Error getting current user:', error)
          api.setTokens(null, null)
        }
      }
      setLoading(false)
    }
    
    initAuth()
  }, [])

  // Check if user is a seller
  const isSeller = () => {
    return user?.seller || user?.roles?.includes('ROLE_SELLER')
  }

  const signUp = async (email, password, fullName = null) => {
    try {
      const { data, error } = await api.signUp(email, password, fullName)
      if (error) {
        return { data: null, error, blocked: error.blocked, remainingAttempts: error.remainingAttempts }
      }
      setUser(data.user)
      return { data, error: null }
    } catch (error) {
      return { data: null, error, blocked: false }
    }
  }

  // Sign up as seller with store name
  const signUpAsSeller = async (email, password, fullName, storeName) => {
    try {
      const { data, error, blocked, remainingAttempts } = await api.signUpAsSeller(email, password, fullName, storeName)
      if (error) {
        return { data: null, error, blocked, remainingAttempts }
      }
      setUser(data.user)
      return { data, error: null }
    } catch (error) {
      return { data: null, error, blocked: false }
    }
  }

  // Upgrade existing user to seller
  const upgradeToSeller = async (storeName) => {
    try {
      const { data, error } = await api.upgradeToSeller(storeName)
      if (error) {
        const msg = (error.message || '').toLowerCase()
        if (msg.includes('already a seller')) {
          const refreshed = await api.getCurrentUser()
          if (refreshed.data?.user) {
            setUser(refreshed.data.user)
          }
          return { data: refreshed.data || null, error: null }
        }
        return { data: null, error }
      }
      setUser(data.user)
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  const signIn = async (email, password) => {
    try {
      const { data, error, blocked, remainingAttempts } = await api.signIn(email, password)
      if (error) {
        return { data: null, error, blocked, remainingAttempts }
      }
      setUser(data.user)
      return { data, error: null, remainingAttempts: data.remainingAttempts }
    } catch (error) {
      return { data: null, error, blocked: false }
    }
  }

  const signOut = async () => {
    await api.signOut()
    setUser(null)
    return { error: null }
  }

  const value = {
    user,
    loading,
    isSeller,
    signUp,
    signUpAsSeller,
    upgradeToSeller,
    signIn,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
