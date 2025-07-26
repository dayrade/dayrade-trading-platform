import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Brevo email integration for authentication events
export const sendBrevoEmail = async (templateId, recipientEmail, templateData = {}) => {
  try {
    // This will integrate with existing Brevo service
    const response = await fetch('/api/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        templateId,
        recipientEmail,
        templateData
      })
    })
    
    if (!response.ok) {
      throw new Error('Failed to send email')
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error sending Brevo email:', error)
    throw error
  }
}

// Email template IDs for different authentication events
export const EMAIL_TEMPLATES = {
  WELCOME: 1, // Welcome email template ID
  EMAIL_VERIFICATION: 2, // Email verification template ID  
  PASSWORD_RESET: 3, // Password reset template ID
  LOGIN_NOTIFICATION: 4 // Login notification template ID
}