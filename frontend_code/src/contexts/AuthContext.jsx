import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase, sendBrevoEmail, EMAIL_TEMPLATES } from '../lib/supabase.js'

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

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)

      // Trigger Brevo emails based on auth events
      if (event === 'SIGNED_UP' && session?.user) {
        try {
          await sendBrevoEmail(
            EMAIL_TEMPLATES.WELCOME,
            session.user.email,
            {
              firstName: session.user.user_metadata?.firstName || 'User',
              email: session.user.email
            }
          )
        } catch (error) {
          console.error('Failed to send welcome email:', error)
        }
      }

      if (event === 'SIGNED_IN' && session?.user) {
        try {
          await sendBrevoEmail(
            EMAIL_TEMPLATES.LOGIN_NOTIFICATION,
            session.user.email,
            {
              firstName: session.user.user_metadata?.firstName || 'User',
              loginTime: new Date().toISOString(),
              ipAddress: 'Unknown' // Could be enhanced with actual IP detection
            }
          )
        } catch (error) {
          console.error('Failed to send login notification:', error)
        }
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (email, password, userData = {}) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData
        }
      })

      if (error) throw error

      // Send email verification
      if (data.user && !data.user.email_confirmed_at) {
        try {
          await sendBrevoEmail(
            EMAIL_TEMPLATES.EMAIL_VERIFICATION,
            email,
            {
              firstName: userData.firstName || 'User',
              verificationLink: `${window.location.origin}/verify-email?token=${data.user.id}`
            }
          )
        } catch (emailError) {
          console.error('Failed to send verification email:', emailError)
        }
      }

      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  const signIn = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  const resetPassword = async (email) => {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      })

      if (error) throw error

      // Send password reset email via Brevo
      try {
        await sendBrevoEmail(
          EMAIL_TEMPLATES.PASSWORD_RESET,
          email,
          {
            resetLink: `${window.location.origin}/reset-password?token=placeholder`,
            email: email
          }
        )
      } catch (emailError) {
        console.error('Failed to send password reset email:', emailError)
      }

      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  const updatePassword = async (newPassword) => {
    try {
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}