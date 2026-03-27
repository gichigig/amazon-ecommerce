import { createContext, useContext, useState, useEffect } from 'react'
import { api } from '../lib/api'

const AuthContext = createContext({})

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkUser()
  }, [])

  async function checkUser() {
    try {
      const { data, error } = await api.getCurrentUser()
      if (data && !error) {
        // Check if user is a seller
        if (data.user?.seller || data.user?.roles?.includes('ROLE_SELLER')) {
          setUser(data.user)
        } else {
          // Not a seller, redirect to user app
          api.signOut()
          setUser(null)
        }
      }
    } catch (error) {
      console.error('Error checking user:', error)
    } finally {
      setLoading(false)
    }
  }

  async function signIn(email, password) {
    const { data, error, blocked, remainingAttempts } = await api.signIn(email, password)
    if (data && !error) {
      // Check if user is a seller
      if (data.user?.seller || data.user?.roles?.includes('ROLE_SELLER')) {
        setUser(data.user)
        return { data, error: null, remainingAttempts: data.remainingAttempts }
      } else {
        api.signOut()
        return { data: null, error: { message: 'This account is not registered as a seller. Please switch to user login.' } }
      }
    }
    return { data: null, error: error || { message: 'Login failed' }, blocked, remainingAttempts }
  }

  async function signUp(email, password, fullName, storeName) {
    try {
      const { data, error, blocked, remainingAttempts } = await api.signUp(email, password, fullName, storeName)
      if (data && !error) {
        setUser(data.user)
        return { data, error: null }
      }
      return { data: null, error: error || { message: 'Sign up failed' }, blocked, remainingAttempts }
    } catch (error) {
      return { data: null, error }
    }
  }

  async function signOut() {
    await api.signOut()
    setUser(null)
  }

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}
