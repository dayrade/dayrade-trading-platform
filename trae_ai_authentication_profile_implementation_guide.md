# Trae.ai Implementation Guide: Authentication & Profile Management Fixes

**Project:** Dayrade Trading Tournament Platform  
**Task:** Fix Authentication, Profile Management, and User Setup Issues  
**Priority:** CRITICAL  
**Deadline:** 4 Days Maximum  

## 🎯 **IMPLEMENTATION OVERVIEW**

This guide provides step-by-step instructions to fix all identified authentication and profile management issues in the Dayrade platform.

## 📋 **TASK 1: CREATE FUNCTIONAL DEMO USERS**

### **Step 1.1: Create Demo Users in Supabase**

Create these users directly in Supabase Auth:

```sql
-- Run in Supabase SQL Editor

-- 1. Regular Demo User
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_user_meta_data
) VALUES (
  gen_random_uuid(),
  'demo@dayrade.com',
  crypt('DemoTrader2025!', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"first_name": "Demo", "last_name": "Trader", "username": "demo_trader"}'::jsonb
);

-- 2. Admin Demo User  
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_user_meta_data
) VALUES (
  gen_random_uuid(),
  'admin@dayrade.com',
  crypt('AdminDayrade2025!', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"first_name": "Admin", "last_name": "User", "username": "admin"}'::jsonb
);

-- 3. Moderator Demo User
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_user_meta_data
) VALUES (
  gen_random_uuid(),
  'moderator@dayrade.com',
  crypt('ModDayrade2025!', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"first_name": "Moderator", "last_name": "User", "username": "moderator"}'::jsonb
);
```

### **Step 1.2: Create Corresponding Profiles**

```sql
-- Create profiles for demo users
INSERT INTO public.profiles (
  id,
  email,
  first_name,
  last_name,
  username,
  role,
  kyc_status,
  profile_complete,
  created_at
) 
SELECT 
  u.id,
  u.email,
  u.raw_user_meta_data->>'first_name',
  u.raw_user_meta_data->>'last_name',
  u.raw_user_meta_data->>'username',
  CASE 
    WHEN u.email = 'admin@dayrade.com' THEN 'admin'
    WHEN u.email = 'moderator@dayrade.com' THEN 'moderator'
    ELSE 'user'
  END as role,
  'approved' as kyc_status,
  false as profile_complete,
  NOW()
FROM auth.users u 
WHERE u.email IN ('demo@dayrade.com', 'admin@dayrade.com', 'moderator@dayrade.com');
```

### **Step 1.3: Alternative Programmatic User Creation**

Create a user seeding script:

**File: `backend/src/scripts/seed-demo-users.ts`**
```typescript
import { supabase } from '../lib/supabase'

interface DemoUser {
  email: string
  password: string
  firstName: string
  lastName: string
  username: string
  role: 'user' | 'moderator' | 'admin'
}

const demoUsers: DemoUser[] = [
  {
    email: 'demo@dayrade.com',
    password: 'DemoTrader2025!',
    firstName: 'Demo',
    lastName: 'Trader',
    username: 'demo_trader',
    role: 'user'
  },
  {
    email: 'admin@dayrade.com',
    password: 'AdminDayrade2025!',
    firstName: 'Admin',
    lastName: 'User',
    username: 'admin',
    role: 'admin'
  },
  {
    email: 'moderator@dayrade.com',
    password: 'ModDayrade2025!',
    firstName: 'Moderator',
    lastName: 'User',
    username: 'moderator',
    role: 'moderator'
  }
]

async function seedDemoUsers() {
  console.log('Creating demo users...')
  
  for (const user of demoUsers) {
    try {
      // Create user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
        user_metadata: {
          first_name: user.firstName,
          last_name: user.lastName,
          username: user.username
        }
      })

      if (authError) {
        console.error(`Error creating auth user ${user.email}:`, authError)
        continue
      }

      // Create profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          email: user.email,
          first_name: user.firstName,
          last_name: user.lastName,
          username: user.username,
          role: user.role,
          kyc_status: 'approved',
          profile_complete: false
        })

      if (profileError) {
        console.error(`Error creating profile for ${user.email}:`, profileError)
      } else {
        console.log(`✅ Created demo user: ${user.email}`)
      }

    } catch (error) {
      console.error(`Failed to create user ${user.email}:`, error)
    }
  }
  
  console.log('Demo user creation complete!')
}

// Run if called directly
if (require.main === module) {
  seedDemoUsers()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Demo user seeding failed:', error)
      process.exit(1)
    })
}

export { seedDemoUsers }
```

**Run the seeder:**
```bash
cd backend
npm run ts-node src/scripts/seed-demo-users.ts
```

## 📋 **TASK 2: FIX EMAIL VERIFICATION MESSAGING**

### **Step 2.1: Update Website Messaging**

**File: `frontend_code/src/components/auth/EmailVerificationModal.tsx`**

Update the messaging to match Supabase's actual email verification:

```typescript
// Replace the 6-digit code messaging with link verification
const renderEmailSentStep = () => (
  <div className="text-center">
    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
      <Mail className="h-6 w-6 text-green-600" />
    </div>
    <h3 className="text-lg font-medium text-gray-900 mb-2">
      Check Your Email
    </h3>
    <p className="text-sm text-gray-600 mb-4">
      We've sent a verification link to <strong>{email}</strong>. 
      Click the link in the email to verify your account.
    </p>
    <p className="text-xs text-gray-500 mb-4">
      The verification link will expire in 24 hours.
    </p>
    <div className="flex flex-col space-y-2">
      <button
        onClick={handleResendEmail}
        disabled={isLoading}
        className="text-sm text-blue-600 hover:text-blue-500 disabled:opacity-50"
      >
        Didn't receive the email? Resend verification link
      </button>
      <button
        onClick={onClose}
        className="text-sm text-gray-500 hover:text-gray-400"
      >
        Close
      </button>
    </div>
  </div>
)
```

### **Step 2.2: Update Brevo Email Template**

Update the email verification template in Brevo to match:

**Template: `email_verification`**
```html
<!DOCTYPE html>
<html>
<head>
    <title>Verify Your Dayrade Account</title>
</head>
<body>
    <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <h2>Welcome to Dayrade, {{first_name}}!</h2>
        
        <p>Thank you for joining the Dayrade trading community. To complete your registration, please verify your email address by clicking the link below:</p>
        
        <div style="text-align: center; margin: 30px 0;">
            <a href="{{verification_url}}" 
               style="background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Verify Your Email Address
            </a>
        </div>
        
        <p>This verification link will expire in 24 hours.</p>
        
        <p>If you didn't create a Dayrade account, you can safely ignore this email.</p>
        
        <p>Best regards,<br>The Dayrade Team</p>
    </div>
</body>
</html>
```

## 📋 **TASK 3: IMPLEMENT PROFILE COMPLETION REQUIREMENTS**

### **Step 3.1: Add Profile Completion Fields to Database**

```sql
-- Add profile completion fields
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS profile_image_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS social_media_accounts JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS profile_complete BOOLEAN DEFAULT false;

-- Create function to check profile completion
CREATE OR REPLACE FUNCTION check_profile_completion(user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  profile_record RECORD;
  is_complete BOOLEAN := false;
BEGIN
  SELECT 
    profile_image_url,
    social_media_accounts,
    first_name,
    last_name
  INTO profile_record
  FROM public.profiles 
  WHERE id = user_id;
  
  -- Check if profile is complete
  IF profile_record.profile_image_url IS NOT NULL 
     AND profile_record.first_name IS NOT NULL 
     AND profile_record.last_name IS NOT NULL
     AND jsonb_array_length(profile_record.social_media_accounts) > 0 THEN
    is_complete := true;
  END IF;
  
  -- Update profile_complete status
  UPDATE public.profiles 
  SET profile_complete = is_complete 
  WHERE id = user_id;
  
  RETURN is_complete;
END;
$$ LANGUAGE plpgsql;
```

### **Step 3.2: Create Profile Completion Component**

**File: `frontend_code/src/components/profile/ProfileCompletionWizard.tsx`**
```typescript
import React, { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { Upload, Plus, Check } from 'lucide-react'

interface SocialMediaAccount {
  platform: string
  username: string
  url: string
}

const ProfileCompletionWizard: React.FC = () => {
  const { user, supabase } = useAuth()
  const [currentStep, setCurrentStep] = useState(1)
  const [profileImage, setProfileImage] = useState<File | null>(null)
  const [profileImageUrl, setProfileImageUrl] = useState<string>('')
  const [socialAccounts, setSocialAccounts] = useState<SocialMediaAccount[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const socialPlatforms = [
    'Twitter/X', 'LinkedIn', 'Instagram', 'TikTok', 'YouTube', 'Discord', 'Telegram'
  ]

  const handleImageUpload = async (file: File) => {
    if (!user) return

    setIsLoading(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}/profile.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('profile-images')
        .upload(fileName, file, { upsert: true })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('profile-images')
        .getPublicUrl(fileName)

      setProfileImageUrl(publicUrl)
      
      // Update profile in database
      await supabase
        .from('profiles')
        .update({ profile_image_url: publicUrl })
        .eq('id', user.id)

    } catch (error) {
      console.error('Error uploading image:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const addSocialAccount = () => {
    setSocialAccounts([...socialAccounts, { platform: '', username: '', url: '' }])
  }

  const updateSocialAccount = (index: number, field: keyof SocialMediaAccount, value: string) => {
    const updated = [...socialAccounts]
    updated[index][field] = value
    setSocialAccounts(updated)
  }

  const saveSocialAccounts = async () => {
    if (!user) return

    setIsLoading(true)
    try {
      await supabase
        .from('profiles')
        .update({ social_media_accounts: socialAccounts })
        .eq('id', user.id)

      // Check if profile is now complete
      await supabase.rpc('check_profile_completion', { user_id: user.id })
      
    } catch (error) {
      console.error('Error saving social accounts:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const renderStep1 = () => (
    <div className="text-center">
      <h2 className="text-2xl font-bold mb-4">Complete Your Profile</h2>
      <p className="text-gray-600 mb-6">
        To start trading and chatting, please complete your profile by adding a profile image and at least one social media account.
      </p>
      
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4">Upload Profile Image</h3>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
          {profileImageUrl ? (
            <div className="text-center">
              <img 
                src={profileImageUrl} 
                alt="Profile" 
                className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
              />
              <p className="text-green-600 flex items-center justify-center">
                <Check className="w-4 h-4 mr-2" />
                Profile image uploaded
              </p>
            </div>
          ) : (
            <div className="text-center">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    setProfileImage(file)
                    handleImageUpload(file)
                  }
                }}
                className="hidden"
                id="profile-image"
              />
              <label 
                htmlFor="profile-image"
                className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Choose Profile Image
              </label>
            </div>
          )}
        </div>
      </div>

      <button
        onClick={() => setCurrentStep(2)}
        disabled={!profileImageUrl}
        className="w-full bg-green-600 text-white py-2 px-4 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Next: Add Social Media
      </button>
    </div>
  )

  const renderStep2 = () => (
    <div>
      <h2 className="text-2xl font-bold mb-4">Add Social Media Accounts</h2>
      <p className="text-gray-600 mb-6">
        Add at least one social media account to verify your identity and connect with other traders.
      </p>

      <div className="space-y-4 mb-6">
        {socialAccounts.map((account, index) => (
          <div key={index} className="border rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <select
                value={account.platform}
                onChange={(e) => updateSocialAccount(index, 'platform', e.target.value)}
                className="border rounded-md px-3 py-2"
              >
                <option value="">Select Platform</option>
                {socialPlatforms.map(platform => (
                  <option key={platform} value={platform}>{platform}</option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Username"
                value={account.username}
                onChange={(e) => updateSocialAccount(index, 'username', e.target.value)}
                className="border rounded-md px-3 py-2"
              />
              <input
                type="url"
                placeholder="Profile URL"
                value={account.url}
                onChange={(e) => updateSocialAccount(index, 'url', e.target.value)}
                className="border rounded-md px-3 py-2"
              />
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={addSocialAccount}
        className="flex items-center text-blue-600 hover:text-blue-700 mb-6"
      >
        <Plus className="w-4 h-4 mr-2" />
        Add Social Media Account
      </button>

      <div className="flex space-x-4">
        <button
          onClick={() => setCurrentStep(1)}
          className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md"
        >
          Back
        </button>
        <button
          onClick={saveSocialAccounts}
          disabled={socialAccounts.length === 0 || isLoading}
          className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md disabled:opacity-50"
        >
          Complete Profile
        </button>
      </div>
    </div>
  )

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {currentStep === 1 ? renderStep1() : renderStep2()}
      </div>
    </div>
  )
}

export default ProfileCompletionWizard
```

### **Step 3.3: Add Profile Completion Check to App**

**File: `frontend_code/src/App.tsx`**
```typescript
import ProfileCompletionWizard from './components/profile/ProfileCompletionWizard'

const AppContent = () => {
  const { user, loading } = useAuth()
  const [showProfileWizard, setShowProfileWizard] = useState(false)
  const [profileComplete, setProfileComplete] = useState(false)

  useEffect(() => {
    if (user) {
      checkProfileCompletion()
    }
  }, [user])

  const checkProfileCompletion = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('profile_complete, profile_image_url, social_media_accounts')
        .eq('id', user.id)
        .single()

      if (error) throw error

      const isComplete = data?.profile_complete || false
      setProfileComplete(isComplete)
      
      // Show wizard if profile is not complete
      if (!isComplete) {
        setShowProfileWizard(true)
      }
    } catch (error) {
      console.error('Error checking profile completion:', error)
    }
  }

  return (
    <div className="App">
      {user ? (
        <>
          <Dashboard />
          {showProfileWizard && !profileComplete && (
            <ProfileCompletionWizard />
          )}
        </>
      ) : (
        <LandingPage />
      )}
    </div>
  )
}
```

## 📋 **TASK 4: IMPLEMENT CHAT ACCESS CONTROL**

### **Step 4.1: Update Chat Component with Access Control**

**File: `frontend_code/src/components/chat/ChatWindow.tsx`**
```typescript
import { useAuth } from '../../contexts/AuthContext'
import { useState, useEffect } from 'react'

const ChatWindow: React.FC = () => {
  const { user } = useAuth()
  const [profileComplete, setProfileComplete] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      checkProfileCompletion()
    } else {
      setLoading(false)
    }
  }, [user])

  const checkProfileCompletion = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('profile_complete')
        .eq('id', user.id)
        .single()

      if (error) throw error
      setProfileComplete(data?.profile_complete || false)
    } catch (error) {
      console.error('Error checking profile:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center p-4">Loading...</div>
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center">
        <h3 className="text-lg font-semibold mb-2">Join the Conversation</h3>
        <p className="text-gray-600 mb-4">
          Register or log in to chat with other traders
        </p>
        <button
          onClick={() => openAuthModal('sign_up')}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Register to Chat
        </button>
      </div>
    )
  }

  if (!profileComplete) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center">
        <h3 className="text-lg font-semibold mb-2">Complete Your Profile</h3>
        <p className="text-gray-600 mb-4">
          Add a profile image and social media account to start chatting
        </p>
        <button
          onClick={() => setShowProfileWizard(true)}
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
        >
          Complete Profile
        </button>
      </div>
    )
  }

  // Render normal chat interface
  return (
    <div className="chat-window">
      {/* Your existing chat implementation */}
    </div>
  )
}
```

### **Step 4.2: Update Register to Chat Button Logic**

**File: `frontend_code/src/components/layout/ChatPanel.tsx`**
```typescript
const ChatPanel: React.FC = () => {
  const { user } = useAuth()
  const [profileComplete, setProfileComplete] = useState(false)

  const renderChatButton = () => {
    if (!user) {
      return (
        <button
          onClick={() => openAuthModal('sign_up')}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
        >
          Register to Chat
        </button>
      )
    }

    if (!profileComplete) {
      return (
        <button
          onClick={() => setShowProfileWizard(true)}
          className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700"
        >
          Complete Profile to Chat
        </button>
      )
    }

    return null // Chat is accessible
  }

  return (
    <div className="chat-panel">
      {renderChatButton()}
      <ChatWindow />
    </div>
  )
}
```

## 📋 **TASK 5: VERIFY PROFILE DATA FLOW**

### **Step 5.1: Update AuthContext for Profile Sync**

**File: `frontend_code/src/contexts/AuthContext.jsx`**
```typescript
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
        kyc_status: 'pending',
        profile_complete: false,
        created_at: new Date().toISOString()
      })
    
    if (error) throw error
    
    // Verify profile was created
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    
    console.log('Profile created successfully:', profile)
    
  } catch (error) {
    console.error('Error creating user profile:', error)
    throw error
  }
}
```

## 🧪 **TESTING INSTRUCTIONS**

### **Test Demo Users:**
```bash
# Test each demo user login
1. Go to https://dayrade.vercel.app/
2. Click Login
3. Try each demo user:
   - demo@dayrade.com / DemoTrader2025!
   - admin@dayrade.com / AdminDayrade2025!
   - moderator@dayrade.com / ModDayrade2025!
4. Verify role-based access for each user
```

### **Test Profile Completion:**
```bash
1. Register a new user
2. Verify profile completion wizard appears
3. Upload profile image
4. Add social media account
5. Verify chat access is granted after completion
```

### **Test Email Verification:**
```bash
1. Register new user
2. Check email for verification link (not 6-digit code)
3. Verify website messaging matches email content
4. Click verification link and confirm it works
```

This comprehensive implementation guide addresses all identified issues systematically.

