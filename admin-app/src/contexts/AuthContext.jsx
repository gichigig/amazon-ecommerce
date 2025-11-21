import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

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
    // Get initial session
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        console.log('Initial session:', session?.user?.email || 'No user')
        setUser(session?.user ?? null)
        
        if (session?.user) {
          await checkAdminStatus(session.user.id)
        } else {
          setIsAdmin(false)
        }
      } catch (error) {
        console.error('Auth init error:', error)
        setIsAdmin(false)
      } finally {
        setLoading(false)
      }
    }

    initAuth()

    // Fallback timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      console.warn('Auth check timeout - forcing loading to false')
      setLoading(false)
    }, 5000) // 5 second timeout

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log('Auth state changed:', _event, session?.user?.email || 'No user')
      setUser(session?.user ?? null)
      if (session?.user) {
        setLoading(true)
        await checkAdminStatus(session.user.id)
      } else {
        setIsAdmin(false)
      }
      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
      clearTimeout(timeout)
    }
  }, [])

  const checkAdminStatus = async (userId) => {
    console.log('Checking admin status for user:', userId)
    try {
      // Set a timeout for the query
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Admin check timeout')), 3000)
      )

      const queryPromise = supabase
        .from('admins')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle()

      const { data, error } = await Promise.race([queryPromise, timeoutPromise])

      console.log('Admin check result:', { data, error })

      if (error) {
        console.error('Admin check error:', error)
        setIsAdmin(false)
        return
      }

      if (data) {
        console.log('User IS an admin')
        setIsAdmin(true)
      } else {
        console.log('User is NOT an admin (no record found)')
        setIsAdmin(false)
      }
    } catch (error) {
      console.error('Error checking admin status:', error)
      setIsAdmin(false)
    }
  }

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
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
