# Trae.ai Instructions: Implement Supabase Authentication for Dayrade Platform

**Project:** Dayrade Trading Tournament Platform  
**Task:** Replace Custom Authentication with Supabase Auth  
**Priority:** CRITICAL  
**Deadline:** 3 Days Maximum  

## 🎯 **TASK OVERVIEW**

You need to completely replace the current custom JWT authentication system with Supabase's native authentication. The platform currently has non-functional login/register buttons and includes an unwanted "Zimtra Username" field that must be removed.

## 📋 **PROVIDED CREDENTIALS**

```env
DATABASE_URL=postgresql://postgres.lmycmbdbuytazkccdqfz:sbp_59680742ff7cecadfc94babb89892cdc06f03a06@aws-0-us-east-1.pooler.supabase.com:6543/postgres
SUPABASE_URL=https://lmycmbdbuytazkccdqfz.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxteWNtYmRidXl0YXprY2NkcWZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyNzgzNDYsImV4cCI6MjA2ODg1NDM0Nn0.-gHstam7zp6wOTspQdDgF8B4KxZWJDfgNulMQPkZySM
```

## 🚨 **CRITICAL ISSUES TO FIX**

### **1. Remove Zimtra Username Field**
- **Location:** Registration form
- **Current:** "Zimtra Username (Optional)" field with description
- **Action:** Completely remove this field and all related backend logic
- **Priority:** IMMEDIATE

### **2. Implement Functional Authentication**
- **Current:** Login/Register buttons exist but don't work
- **Action:** Create working authentication modals using Supabase
- **Priority:** CRITICAL

### **3. Replace Custom JWT System**
- **Current:** Custom JWT implementation with manual session management
- **Action:** Use Supabase Auth exclusively
- **Priority:** CRITICAL

## 📦 **STEP 1: INSTALL SUPABASE DEPENDENCIES**

```bash
# Install required Supabase packages
npm install @supabase/supabase-js @supabase/auth-ui-react @supabase/auth-ui-shared

# Remove custom authentication dependencies (if any)
npm uninstall jsonwebtoken bcryptjs express-jwt
```

## 🔧 **STEP 2: CONFIGURE SUPABASE CLIENT**

Create or update your Supabase client configuration:

### **File: `src/lib/supabase.js`**
```javascript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://lmycmbdbuytazkccdqfz.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxteWNtYmRidXl0YXprY2NkcWZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyNzgzNDYsImV4cCI6MjA2ODg1NDM0Nn0.-gHstam7zp6wOTspQdDgF8B4KxZWJDfgNulMQPkZySM'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})
```

## 🎨 **STEP 3: CREATE AUTHENTICATION CONTEXT**

### **File: `src/contexts/AuthContext.jsx`**
```javascript
import React, { createContext, useContext, useEffect, useState } from 'react'
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
        
        // Handle user profile creation on sign up
        if (event === 'SIGNED_UP' && session?.user) {
          await createUserProfile(session.user)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

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

## 🔐 **STEP 4: CREATE AUTHENTICATION MODALS**

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
            {view === 'sign_in' ? 'Sign In' : 'Sign Up'}
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
          redirectTo={window.location.origin}
          onlyThirdPartyProviders={false}
          magicLink={true}
          showLinks={true}
          localization={{
            variables: {
              sign_up: {
                email_label: 'Email address',
                password_label: 'Create a password',
                button_label: 'Sign up',
                loading_button_label: 'Signing up ...',
                social_provider_text: 'Sign up with {{provider}}',
                link_text: 'Don\'t have an account? Sign up',
                confirmation_text: 'Check your email for the confirmation link'
              },
              sign_in: {
                email_label: 'Email address',
                password_label: 'Your password',
                button_label: 'Sign in',
                loading_button_label: 'Signing in ...',
                social_provider_text: 'Sign in with {{provider}}',
                link_text: 'Already have an account? Sign in'
              }
            }
          }}
        />
      </div>
    </div>
  )
}

export default AuthModal
```

## 🎯 **STEP 5: UPDATE MAIN APP COMPONENT**

### **File: `src/App.jsx` (Update existing)**
```javascript
import React, { useState } from 'react'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import AuthModal from './components/auth/AuthModal'
import Dashboard from './components/Dashboard'
import './App.css'

const AppContent = () => {
  const { user, loading } = useAuth()
  const [authModal, setAuthModal] = useState({ isOpen: false, view: 'sign_in' })

  const openAuthModal = (view = 'sign_in') => {
    setAuthModal({ isOpen: true, view })
  }

  const closeAuthModal = () => {
    setAuthModal({ isOpen: false, view: 'sign_in' })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
      </div>
    )
  }

  return (
    <div className="App">
      {user ? (
        <Dashboard />
      ) : (
        <div className="min-h-screen bg-gray-100">
          {/* Your existing landing page content */}
          <header className="bg-white shadow">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center py-6">
                <div className="flex items-center">
                  <img src="/logo.svg" alt="Dayrade" className="h-8 w-auto" />
                </div>
                <div className="flex space-x-4">
                  <button
                    onClick={() => openAuthModal('sign_in')}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => openAuthModal('sign_up')}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                  >
                    Register
                  </button>
                </div>
              </div>
            </div>
          </header>
          
          {/* Your existing dashboard content for logged-out users */}
          <main>
            {/* Existing content */}
          </main>
        </div>
      )}
      
      <AuthModal
        isOpen={authModal.isOpen}
        onClose={closeAuthModal}
        view={authModal.view}
      />
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
```

## 🗄️ **STEP 6: UPDATE DATABASE SCHEMA**

### **Create Profiles Table (Run in Supabase SQL Editor)**
```sql
-- Create profiles table
CREATE TABLE public.profiles (
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

-- Create function to handle user creation
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
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
```

## 🔒 **STEP 7: IMPLEMENT ROLE-BASED ACCESS CONTROL**

### **File: `src/hooks/useRole.js`**
```javascript
import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'

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
        .select('role')
        .eq('id', user.id)
        .single()

      if (error) throw error
      setRole(data?.role || 'user')
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

### **File: `src/components/ProtectedRoute.jsx`**
```javascript
import React from 'react'
import { useRole } from '../hooks/useRole'

const ProtectedRoute = ({ children, requiredRole = 'user' }) => {
  const { role, loading } = useRole()

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading...</div>
  }

  const hasPermission = () => {
    if (requiredRole === 'admin') return role === 'admin'
    if (requiredRole === 'moderator') return role === 'moderator' || role === 'admin'
    return role === 'user' || role === 'moderator' || role === 'admin'
  }

  if (!hasPermission()) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <h2 className="text-xl font-bold text-red-600">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    )
  }

  return children
}

export default ProtectedRoute
```

## 🔧 **STEP 8: UPDATE API ENDPOINTS (Backend)**

### **File: `middleware/auth.js`**
```javascript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export const authenticateUser = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '')
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' })
    }

    const { data: { user }, error } = await supabase.auth.getUser(token)
    
    if (error || !user) {
      return res.status(401).json({ error: 'Invalid token' })
    }

    // Fetch user profile with role
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    req.user = user
    req.profile = profile
    next()
  } catch (error) {
    console.error('Auth middleware error:', error)
    return res.status(401).json({ error: 'Authentication failed' })
  }
}

export const requireRole = (requiredRole) => {
  return (req, res, next) => {
    const userRole = req.profile?.role

    if (requiredRole === 'admin' && userRole !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' })
    }

    if (requiredRole === 'moderator' && !['moderator', 'admin'].includes(userRole)) {
      return res.status(403).json({ error: 'Moderator access required' })
    }

    next()
  }
}
```

## 🧪 **STEP 9: TESTING CHECKLIST**

### **Test User Registration**
1. Open registration modal
2. Enter email and password
3. Verify email confirmation sent
4. Check user created in Supabase Auth
5. Verify profile created in profiles table

### **Test User Login**
1. Open login modal
2. Enter valid credentials
3. Verify successful login
4. Check session persistence on page refresh
5. Test logout functionality

### **Test Admin Access**
1. Manually set user role to 'admin' in database
2. Login as admin user
3. Verify admin-only features are accessible
4. Test role-based route protection

### **Test Error Handling**
1. Test invalid login credentials
2. Test duplicate email registration
3. Test network error scenarios
4. Verify proper error messages displayed

## 🚀 **STEP 10: DEPLOYMENT CHECKLIST**

### **Environment Variables**
```env
SUPABASE_URL=https://lmycmbdbuytazkccdqfz.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxteWNtYmRidXl0YXprY2NkcWZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyNzgzNDYsImV4cCI6MjA2ODg1NDM0Nn0.-gHstam7zp6wOTspQdDgF8B4KxZWJDfgNulMQPkZySM
SUPABASE_SERVICE_ROLE_KEY=[Get from Supabase Dashboard]
```

### **Final Verification**
- [ ] Zimtra username field completely removed
- [ ] Login/Register buttons functional
- [ ] User can register and receive confirmation email
- [ ] User can login and access dashboard
- [ ] Admin can login and access admin features
- [ ] Session persists across page refreshes
- [ ] Logout works correctly
- [ ] All API endpoints use Supabase auth
- [ ] No custom JWT code remains

## ❗ **CRITICAL REMINDERS**

1. **REMOVE ALL ZIMTRA REFERENCES** - This is non-negotiable
2. **USE ONLY SUPABASE AUTH** - No custom JWT implementation
3. **TEST THOROUGHLY** - All authentication flows must work
4. **ADMIN ACCESS CLARITY** - Document how admins login (same system, different role)
5. **SESSION PERSISTENCE** - Users should stay logged in across browser sessions

## 🆘 **ADMIN LOGIN CLARIFICATION**

**Admin Authentication Process:**
1. Admins use the SAME login system as regular users
2. Admin role is assigned in the database (`profiles.role = 'admin'`)
3. After login, admin role is checked to show admin features
4. NO separate admin URL or login form needed
5. Role-based access control handles admin permissions

**To Create Admin User:**
1. Register normally through the platform
2. Manually update role in database: `UPDATE profiles SET role = 'admin' WHERE email = 'admin@example.com'`
3. Login normally - admin features will be available based on role

This implementation provides a complete, secure, and scalable authentication system using Supabase's native capabilities.

