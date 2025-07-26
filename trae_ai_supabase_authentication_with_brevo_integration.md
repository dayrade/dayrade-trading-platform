# Trae.ai Instructions: Implement Supabase Authentication with Brevo Email Integration

**Project:** Dayrade Trading Tournament Platform  
**Task:** Replace Custom Authentication with Supabase Auth + Integrate Existing Brevo Templates  
**Priority:** CRITICAL  
**Deadline:** 3 Days Maximum  

## 🎯 **TASK OVERVIEW**

You need to completely replace the current custom JWT authentication system with Supabase's native authentication while integrating with the **EXISTING BREVO EMAIL TEMPLATES** that have already been designed and implemented in the platform.

## 📧 **EXISTING BREVO EMAIL TEMPLATES (ALREADY DESIGNED)**

The platform already has these Brevo email templates configured:

### **Authentication-Related Templates:**
1. **`email_verification`** - Email verification for new registrations
2. **`password_reset`** - Password reset instructions
3. **`welcome_email`** - Welcome email after successful registration
4. **`login_notification`** - Security notification for new logins

### **Platform-Specific Templates:**
5. **`dayrade_kyc_approved`** - KYC approval notification
6. **`dayrade_simulator_ready`** - SIMULATOR account ready notification
7. **`tournament_registration_confirmation`** - Tournament registration confirmation
8. **`tournament_reminder`** - Tournament starting soon reminder
9. **`tournament_results`** - Tournament completion results

## 📋 **PROVIDED CREDENTIALS**

```env
DATABASE_URL=postgresql://postgres.lmycmbdbuytazkccdqfz:sbp_59680742ff7cecadfc94babb89892cdc06f03a06@aws-0-us-east-1.pooler.supabase.com:6543/postgres
SUPABASE_URL=https://lmycmbdbuytazkccdqfz.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxteWNtYmRidXl0YXprY2NkcWZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyNzgzNDYsImV4cCI6MjA2ODg1NDM0Nn0.-gHstam7zp6wOTspQdDgF8B4KxZWJDfgNulMQPkZySM
BREVO_API_KEY=[Use existing key from platform]
BREVO_SENDER_EMAIL=noreply@dayrade.com
```

## 🚨 **CRITICAL ISSUES TO FIX**

### **1. Remove Zimtra Username Field**
- **Location:** Registration form
- **Current:** "Zimtra Username (Optional)" field with description
- **Action:** Completely remove this field and all related backend logic
- **Priority:** IMMEDIATE

### **2. Implement Functional Authentication with Email Integration**
- **Current:** Login/Register buttons exist but don't work
- **Action:** Create working authentication modals using Supabase + trigger Brevo emails
- **Priority:** CRITICAL

### **3. Replace Custom JWT System**
- **Current:** Custom JWT implementation with manual session management
- **Action:** Use Supabase Auth exclusively with Brevo email notifications
- **Priority:** CRITICAL

## 📦 **STEP 1: INSTALL SUPABASE DEPENDENCIES**

```bash
# Install required Supabase packages
npm install @supabase/supabase-js @supabase/auth-ui-react @supabase/auth-ui-shared

# Ensure Brevo integration is available (should already be installed)
npm list @brevo/api # Verify existing Brevo integration
```

## 🔧 **STEP 2: CONFIGURE SUPABASE CLIENT WITH BREVO INTEGRATION**

### **File: `src/lib/supabase.js`**
```javascript
import { createClient } from '@supabase/supabase-js'
import { BrevoService } from '../services/brevo.service' // Use existing Brevo service

const supabaseUrl = 'https://lmycmbdbuytazkccdqfz.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxteWNtYmRidXl0YXprY2NkcWZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyNzgzNDYsImV4cCI6MjA2ODg1NDM0Nn0.-gHstam7zp6wOTspQdDgF8B4KxZWJDfgNulMQPkZySM'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    // Configure custom email templates (disable Supabase defaults)
    emailRedirectTo: `${window.location.origin}/auth/callback`,
    // We'll handle emails via Brevo instead of Supabase
    flowType: 'pkce'
  }
})

// Initialize Brevo service for email notifications
const brevoService = BrevoService.getInstance()

// Custom email handlers using existing Brevo templates
export const sendWelcomeEmail = async (user) => {
  return await brevoService.sendTransactionalEmail({
    templateId: 'welcome_email',
    to: user.email,
    variables: {
      first_name: user.user_metadata?.first_name || 'Trader',
      last_name: user.user_metadata?.last_name || '',
      email: user.email,
      dashboard_url: `${window.location.origin}/dashboard`,
      support_email: process.env.BREVO_SENDER_EMAIL
    },
    tags: ['authentication', 'welcome']
  })
}

export const sendEmailVerification = async (user) => {
  // Note: Supabase handles verification links, but we send custom notification
  return await brevoService.sendTransactionalEmail({
    templateId: 'email_verification',
    to: user.email,
    variables: {
      first_name: user.user_metadata?.first_name || 'Trader',
      verification_url: `${window.location.origin}/auth/verify?token=${user.email_confirmation_token}`,
      support_email: process.env.BREVO_SENDER_EMAIL
    },
    tags: ['authentication', 'verification']
  })
}

export const sendPasswordResetEmail = async (email) => {
  return await brevoService.sendTransactionalEmail({
    templateId: 'password_reset',
    to: email,
    variables: {
      reset_url: `${window.location.origin}/auth/reset-password`,
      support_email: process.env.BREVO_SENDER_EMAIL
    },
    tags: ['authentication', 'password-reset']
  })
}

export const sendLoginNotification = async (user, loginDetails) => {
  return await brevoService.sendTransactionalEmail({
    templateId: 'login_notification',
    to: user.email,
    variables: {
      first_name: user.user_metadata?.first_name || 'Trader',
      login_time: new Date().toLocaleString(),
      ip_address: loginDetails.ip || 'Unknown',
      device: loginDetails.userAgent || 'Unknown device',
      location: loginDetails.location || 'Unknown location',
      support_email: process.env.BREVO_SENDER_EMAIL
    },
    tags: ['authentication', 'security']
  })
}
```

## 🎨 **STEP 3: CREATE AUTHENTICATION CONTEXT WITH BREVO INTEGRATION**

### **File: `src/contexts/AuthContext.jsx`**
```javascript
import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase, sendWelcomeEmail, sendEmailVerification, sendLoginNotification } from '../lib/supabase'

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
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)
        
        // Handle authentication events with Brevo emails
        switch (event) {
          case 'SIGNED_UP':
            if (session?.user) {
              await handleUserSignUp(session.user)
            }
            break
          
          case 'SIGNED_IN':
            if (session?.user) {
              await handleUserSignIn(session.user)
            }
            break
          
          case 'PASSWORD_RECOVERY':
            // Supabase handles the reset link, we just log it
            console.log('Password recovery initiated')
            break
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const handleUserSignUp = async (user) => {
    try {
      // Create user profile in database
      await createUserProfile(user)
      
      // Send welcome email using existing Brevo template
      await sendWelcomeEmail(user)
      
      // Send email verification notification
      if (!user.email_confirmed_at) {
        await sendEmailVerification(user)
      }
      
      console.log('User signup processed with email notifications')
    } catch (error) {
      console.error('Error processing user signup:', error)
    }
  }

  const handleUserSignIn = async (user) => {
    try {
      // Get login details for security notification
      const loginDetails = {
        ip: await getUserIP(),
        userAgent: navigator.userAgent,
        location: await getUserLocation()
      }
      
      // Send login notification using existing Brevo template
      await sendLoginNotification(user, loginDetails)
      
      console.log('User signin processed with email notification')
    } catch (error) {
      console.error('Error processing user signin:', error)
    }
  }

  const createUserProfile = async (user) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          email: user.email,
          first_name: user.user_metadata?.first_name || '',
          last_name: user.user_metadata?.last_name || '',
          username: user.user_metadata?.username || '',
          role: 'user',
          created_at: new Date().toISOString()
        })
      
      if (error) throw error
    } catch (error) {
      console.error('Error creating user profile:', error)
    }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  // Helper functions for login details
  const getUserIP = async () => {
    try {
      const response = await fetch('https://api.ipify.org?format=json')
      const data = await response.json()
      return data.ip
    } catch {
      return 'Unknown'
    }
  }

  const getUserLocation = async () => {
    try {
      const response = await fetch('https://ipapi.co/json/')
      const data = await response.json()
      return `${data.city}, ${data.country_name}`
    } catch {
      return 'Unknown location'
    }
  }

  const value = {
    user,
    session,
    loading,
    signOut,
    supabase
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
```

## 🔐 **STEP 4: CREATE AUTHENTICATION MODALS (NO ZIMTRA FIELD)**

### **File: `src/components/auth/AuthModal.jsx`**
```javascript
import React, { useState } from 'react'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { supabase } from '../../lib/supabase'

const AuthModal = ({ isOpen, onClose, view = 'sign_in' }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            {view === 'sign_in' ? 'Sign In to Dayrade' : 'Join Dayrade'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        
        <Auth
          supabaseClient={supabase}
          view={view}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: '#10b981',
                  brandAccent: '#059669',
                }
              }
            }
          }}
          providers={[]}
          redirectTo={`${window.location.origin}/auth/callback`}
          onlyThirdPartyProviders={false}
          magicLink={false}
          showLinks={true}
          additionalData={{
            // Collect additional user data (NO ZIMTRA FIELD)
            first_name: '',
            last_name: '',
            username: ''
          }}
          localization={{
            variables: {
              sign_up: {
                email_label: 'Email address',
                password_label: 'Create a password',
                button_label: 'Create Account',
                loading_button_label: 'Creating account...',
                link_text: 'Already have an account? Sign in',
                confirmation_text: 'Welcome to Dayrade! Check your email to verify your account.'
              },
              sign_in: {
                email_label: 'Email address',
                password_label: 'Your password',
                button_label: 'Sign In',
                loading_button_label: 'Signing in...',
                link_text: 'Don\'t have an account? Sign up',
                forgot_password_link_text: 'Forgot your password?'
              }
            }
          }}
        />
        
        {/* Custom form fields for additional data (NO ZIMTRA) */}
        {view === 'sign_up' && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">Additional Information:</p>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="First Name"
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                onChange={(e) => {
                  // Handle first name input
                }}
              />
              <input
                type="text"
                placeholder="Last Name"
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                onChange={(e) => {
                  // Handle last name input
                }}
              />
            </div>
            <input
              type="text"
              placeholder="Username (optional)"
              className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md text-sm"
              onChange={(e) => {
                // Handle username input
              }}
            />
            <p className="text-xs text-gray-500 mt-2">
              By creating an account, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default AuthModal
```

## 🗄️ **STEP 5: UPDATE DATABASE SCHEMA (REMOVE ZIMTRA FIELDS)**

### **Run in Supabase SQL Editor:**
```sql
-- Create profiles table (NO ZIMTRA FIELDS)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE,
  email TEXT,
  first_name TEXT,
  last_name TEXT,
  username TEXT UNIQUE,
  avatar_url TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'moderator', 'admin')),
  kyc_status TEXT DEFAULT 'pending' CHECK (kyc_status IN ('pending', 'in_review', 'approved', 'rejected')),
  country TEXT,
  timezone TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- Remove any existing Zimtra-related columns if they exist
ALTER TABLE public.profiles DROP COLUMN IF EXISTS zimtra_id;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS zimtra_username;

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Create function to handle user creation with Brevo email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name, username)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    NEW.raw_user_meta_data->>'username'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
```

## 📧 **STEP 6: INTEGRATE WITH EXISTING BREVO EMAIL TEMPLATES**

### **File: `src/services/auth-email.service.js`**
```javascript
import { BrevoService } from './brevo.service' // Use existing service

class AuthEmailService {
  constructor() {
    this.brevoService = BrevoService.getInstance()
  }

  /**
   * Send welcome email using existing Brevo template
   */
  async sendWelcomeEmail(user) {
    return await this.brevoService.sendTransactionalEmail({
      templateId: 'welcome_email', // Use existing template
      to: user.email,
      variables: {
        first_name: user.user_metadata?.first_name || 'Trader',
        last_name: user.user_metadata?.last_name || '',
        full_name: `${user.user_metadata?.first_name || 'Trader'} ${user.user_metadata?.last_name || ''}`.trim(),
        email: user.email,
        dashboard_url: `${window.location.origin}/dashboard`,
        support_email: process.env.BREVO_SENDER_EMAIL || 'support@dayrade.com',
        platform_name: 'Dayrade'
      },
      tags: ['authentication', 'welcome', 'supabase']
    })
  }

  /**
   * Send email verification notification using existing template
   */
  async sendEmailVerificationNotification(user) {
    return await this.brevoService.sendTransactionalEmail({
      templateId: 'email_verification', // Use existing template
      to: user.email,
      variables: {
        first_name: user.user_metadata?.first_name || 'Trader',
        verification_url: `${window.location.origin}/auth/verify`,
        support_email: process.env.BREVO_SENDER_EMAIL || 'support@dayrade.com',
        platform_name: 'Dayrade'
      },
      tags: ['authentication', 'verification', 'supabase']
    })
  }

  /**
   * Send password reset notification using existing template
   */
  async sendPasswordResetNotification(email) {
    return await this.brevoService.sendTransactionalEmail({
      templateId: 'password_reset', // Use existing template
      to: email,
      variables: {
        reset_url: `${window.location.origin}/auth/reset-password`,
        support_email: process.env.BREVO_SENDER_EMAIL || 'support@dayrade.com',
        platform_name: 'Dayrade'
      },
      tags: ['authentication', 'password-reset', 'supabase']
    })
  }

  /**
   * Send login security notification using existing template
   */
  async sendLoginNotification(user, loginDetails) {
    return await this.brevoService.sendTransactionalEmail({
      templateId: 'login_notification', // Use existing template
      to: user.email,
      variables: {
        first_name: user.user_metadata?.first_name || 'Trader',
        login_time: new Date().toLocaleString(),
        ip_address: loginDetails.ip || 'Unknown',
        device: loginDetails.userAgent || 'Unknown device',
        location: loginDetails.location || 'Unknown location',
        support_email: process.env.BREVO_SENDER_EMAIL || 'support@dayrade.com',
        platform_name: 'Dayrade'
      },
      tags: ['authentication', 'security', 'supabase']
    })
  }

  /**
   * Send KYC approval email using existing template
   */
  async sendKYCApprovalEmail(user) {
    return await this.brevoService.sendKYCApprovalEmail(
      user.email,
      user.user_metadata?.first_name || 'Trader',
      user.user_metadata?.last_name || '',
      new Date().toISOString()
    )
  }
}

export default new AuthEmailService()
```

## 🔒 **STEP 7: IMPLEMENT ROLE-BASED ACCESS WITH EMAIL NOTIFICATIONS**

### **File: `src/hooks/useRole.js`**
```javascript
import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import AuthEmailService from '../services/auth-email.service'

export const useRole = () => {
  const { user, supabase } = useAuth()
  const [role, setRole] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchUserRole()
    } else {
      setRole(null)
      setLoading(false)
    }
  }, [user])

  const fetchUserRole = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role, kyc_status')
        .eq('id', user.id)
        .single()

      if (error) throw error
      
      const userRole = data?.role || 'user'
      setRole(userRole)
      
      // Send KYC approval email if status changed to approved
      if (data?.kyc_status === 'approved' && !user.kyc_email_sent) {
        await AuthEmailService.sendKYCApprovalEmail(user)
        
        // Mark KYC email as sent
        await supabase
          .from('profiles')
          .update({ kyc_email_sent: true })
          .eq('id', user.id)
      }
      
    } catch (error) {
      console.error('Error fetching user role:', error)
      setRole('user')
    } finally {
      setLoading(false)
    }
  }

  const isAdmin = role === 'admin'
  const isModerator = role === 'moderator' || role === 'admin'
  const isUser = role === 'user'

  return {
    role,
    loading,
    isAdmin,
    isModerator,
    isUser
  }
}
```

## 🧪 **STEP 8: TESTING CHECKLIST WITH EMAIL VERIFICATION**

### **Test User Registration with Brevo Emails**
1. Open registration modal (verify NO Zimtra field)
2. Enter email, password, first name, last name
3. Submit registration
4. **Verify welcome email sent via Brevo**
5. **Verify email verification notification sent**
6. Check user created in Supabase Auth
7. Verify profile created in profiles table

### **Test User Login with Email Notifications**
1. Open login modal
2. Enter valid credentials
3. Verify successful login
4. **Verify login notification email sent via Brevo**
5. Check session persistence on page refresh
6. Test logout functionality

### **Test Password Reset with Brevo**
1. Click "Forgot Password" link
2. Enter email address
3. **Verify password reset email sent via Brevo**
4. Test reset flow functionality

### **Test Admin Access with Email Integration**
1. Manually set user role to 'admin' in database
2. Login as admin user
3. Verify admin-only features are accessible
4. **Verify login notification includes admin role info**

## 🚀 **STEP 9: DEPLOYMENT CHECKLIST**

### **Environment Variables**
```env
# Supabase Configuration
SUPABASE_URL=https://lmycmbdbuytazkccdqfz.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxteWNtYmRidXl0YXprY2NkcWZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyNzgzNDYsImV4cCI6MjA2ODg1NDM0Nn0.-gHstam7zp6wOTspQdDgF8B4KxZWJDfgNulMQPkZySM
SUPABASE_SERVICE_ROLE_KEY=[Get from Supabase Dashboard]

# Brevo Configuration (Use existing)
BREVO_API_KEY=[Use existing key from platform]
BREVO_SENDER_EMAIL=noreply@dayrade.com

# Platform URLs
FRONTEND_URL=https://dayrade.vercel.app
```

### **Final Verification Checklist**
- [ ] **Zimtra username field completely removed from all forms**
- [ ] Login/Register buttons functional with Supabase Auth
- [ ] **Welcome email sent via Brevo after registration**
- [ ] **Email verification notification sent via Brevo**
- [ ] **Login notification email sent via Brevo**
- [ ] **Password reset email sent via Brevo**
- [ ] User can register and access dashboard
- [ ] Admin can login and access admin features
- [ ] Session persists across page refreshes
- [ ] Logout works correctly
- [ ] All API endpoints use Supabase auth
- [ ] No custom JWT code remains
- [ ] **All emails use existing Brevo templates**
- [ ] **Email delivery tracking works**

## 📧 **EMAIL FLOW SUMMARY**

### **User Registration Flow:**
1. User fills registration form (NO Zimtra field)
2. Supabase creates auth user
3. **Brevo sends welcome email** (existing template)
4. **Brevo sends email verification notification** (existing template)
5. User profile created in database
6. User redirected to dashboard

### **User Login Flow:**
1. User enters credentials
2. Supabase authenticates user
3. **Brevo sends login notification email** (existing template)
4. User session established
5. User redirected to dashboard

### **Password Reset Flow:**
1. User requests password reset
2. Supabase generates reset token
3. **Brevo sends password reset email** (existing template)
4. User follows reset link
5. User sets new password

### **KYC Approval Flow:**
1. Admin approves user KYC
2. Database updated with approval status
3. **Brevo sends KYC approval email** (existing template)
4. User notified to join tournaments

## ❗ **CRITICAL REMINDERS**

1. **NO ZIMTRA FIELDS ANYWHERE** - This is non-negotiable
2. **USE EXISTING BREVO TEMPLATES** - Don't create new ones
3. **ALL EMAILS VIA BREVO** - No Supabase default emails
4. **TEST EMAIL DELIVERY** - Verify all emails are sent
5. **ADMIN USES SAME LOGIN** - No separate admin authentication

## 🆘 **ADMIN LOGIN CLARIFICATION**

**Admin Authentication Process:**
1. Admins use the SAME login system as regular users
2. Admin role is assigned in the database (`profiles.role = 'admin'`)
3. After login, admin role is checked to show admin features
4. **Admin login notifications sent via Brevo** (same template, different role)
5. NO separate admin URL or login form needed

**To Create Admin User:**
1. Register normally through the platform
2. Manually update role in database: `UPDATE profiles SET role = 'admin' WHERE email = 'admin@example.com'`
3. Login normally - admin features will be available based on role
4. **Admin receives same email notifications as regular users**

This implementation leverages the existing Brevo email infrastructure while providing secure Supabase authentication with comprehensive email notifications at every step.

