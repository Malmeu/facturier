import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase, authService } from '../lib/supabase'
import { DataService } from '../services/dataService'

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
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [initialLoading, setInitialLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const session = await authService.getCurrentSession()
        setSession(session)
        setUser(session?.user ?? null)
      } catch (error) {
        console.error('Error getting initial session:', error)
      } finally {
        setInitialLoading(false)
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session?.user?.email)
        
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)

        // Handle different auth events
        switch (event) {
          case 'SIGNED_IN':
            console.log('User signed in')
            // Migrate existing data to user-specific storage
            setTimeout(async () => {
              await DataService.migrateExistingData()
            }, 1000)
            break
          case 'SIGNED_OUT':
            console.log('User signed out')
            // Clear old global data (but keep user-specific data)
            localStorage.removeItem('invoices')
            localStorage.removeItem('orders')
            localStorage.removeItem('deliveries')
            localStorage.removeItem('company_logo')
            localStorage.removeItem('company_logo_info')
            localStorage.removeItem('app_settings')
            break
          case 'TOKEN_REFRESHED':
            console.log('Token refreshed')
            break
          case 'USER_UPDATED':
            console.log('User updated')
            break
        }
      }
    )

    return () => {
      subscription?.unsubscribe()
    }
  }, [])

  // Auth actions
  const signUp = async (email, password, userData = {}) => {
    setLoading(true)
    try {
      const { data, error } = await authService.signUp(email, password, {
        full_name: userData.fullName,
        company_name: userData.companyName,
        ...userData
      })
      
      if (error) throw error
      
      return { data, error: null }
    } catch (error) {
      console.error('Sign up error:', error)
      return { data: null, error }
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email, password) => {
    setLoading(true)
    try {
      const { data, error } = await authService.signIn(email, password)
      
      if (error) throw error
      
      return { data, error: null }
    } catch (error) {
      console.error('Sign in error:', error)
      return { data: null, error }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    setLoading(true)
    try {
      const { error } = await authService.signOut()
      if (error) throw error
      
      // Clear user state
      setUser(null)
      setSession(null)
      
      return { error: null }
    } catch (error) {
      console.error('Sign out error:', error)
      return { error }
    } finally {
      setLoading(false)
    }
  }

  const resetPassword = async (email) => {
    try {
      const { data, error } = await authService.resetPassword(email)
      return { data, error }
    } catch (error) {
      console.error('Reset password error:', error)
      return { data: null, error }
    }
  }

  const updateProfile = async (updates) => {
    setLoading(true)
    try {
      const { data, error } = await authService.updateProfile(updates)
      
      if (error) throw error
      
      return { data, error: null }
    } catch (error) {
      console.error('Update profile error:', error)
      return { data: null, error }
    } finally {
      setLoading(false)
    }
  }

  const value = {
    user,
    session,
    loading,
    initialLoading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updateProfile,
    isAuthenticated: !!user,
    isLoading: loading || initialLoading
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}