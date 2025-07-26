# Trae.ai Prompt: Authentication & Profile Management Fixes

## 🚀 **INITIAL TRAE.AI PROMPT:**

```
I need you to fix critical authentication and profile management issues in the Dayrade Trading Tournament Platform. The authentication system was recently implemented but has several issues that need immediate attention.

**CRITICAL ISSUES TO FIX:**

1. **Demo Users Not Working**: Test users for demonstration purposes are not functional
   - demo@dayrade.com / DemoTrader2025! (regular user)
   - admin@dayrade.com / AdminDayrade2025! (admin user)  
   - moderator@dayrade.com / ModDayrade2025! (moderator user)

2. **Email Verification Mismatch**: Website promises 6-digit code but Supabase sends email link
   - Users are confused by inconsistent messaging
   - Need to align website messaging with actual email content

3. **Missing Profile Completion Requirements**: Users can access platform without complete profiles
   - Need mandatory profile image upload
   - Need at least one social media account required
   - Need to block platform access until profile is complete

4. **Chat Access Control Issues**: Chat is accessible without proper authentication/profile completion
   - "Register to chat" button shows regardless of login status
   - Need to gate chat access behind profile completion
   - Need proper messaging for different user states

5. **Profile Data Flow Verification**: Ensure registration data flows properly to profile settings
   - Verify Supabase → Profile table synchronization
   - Ensure profile completion status tracking works

**DOCUMENTATION FILES TO REFERENCE:**

Please read these files for complete implementation guidance:

1. **dayrade_authentication_profile_issues_analysis.md** - Comprehensive analysis of all issues
2. **trae_ai_authentication_profile_implementation_guide.md** - Step-by-step implementation instructions
3. **dayrade_complete_documentation_package/06_BREVO_EMAIL_SYSTEM.md** - Email template integration
4. **dayrade_complete_documentation_package/02_DATABASE_SCHEMA_COMPLETE.md** - Database structure

**IMPLEMENTATION PRIORITY:**

1. **Day 1**: Create functional demo users and fix email verification messaging
2. **Day 2**: Implement profile completion requirements (image + social media)
3. **Day 3**: Add chat access control and profile completion wizard
4. **Day 4**: Test all flows and verify data synchronization

**SUCCESS CRITERIA:**

- All demo users can login with correct roles and permissions
- Email verification messaging matches actual email content
- New users must complete profile (image + social media) before platform access
- Chat is only accessible to users with complete profiles
- "Register to chat" button shows appropriate messaging based on user state
- Profile data flows correctly from registration to profile settings

**DEMO USER REQUIREMENTS:**

Create these users in Supabase with proper roles and KYC approval:
- demo@dayrade.com (role: user, KYC approved)
- admin@dayrade.com (role: admin, KYC approved)
- moderator@dayrade.com (role: moderator, KYC approved)

**PROFILE COMPLETION REQUIREMENTS:**

- Profile image upload (mandatory)
- At least one social media account (mandatory)
- Profile completion wizard for new users
- Block platform features until profile is complete
- Clear progress indicators and instructions

**CHAT ACCESS CONTROL:**

- Unauthenticated users: "Register to Chat" button
- Authenticated but incomplete profile: "Complete Profile to Chat" button
- Complete profile: Full chat access
- Clear messaging at each stage

Please start by reading the documentation files, then implement the fixes following the step-by-step guide. The platform needs to be fully functional for stakeholder demonstrations.

This is a critical priority fix as the authentication system is currently not production-ready.
```

## 📋 **FOLLOW-UP PROMPTS (Use as needed)**

### **If Trae.ai needs clarification on demo users:**
```
Create the demo users using the SQL scripts provided in the implementation guide. You can either:

1. Run the SQL directly in Supabase SQL Editor
2. Use the programmatic approach with the seed-demo-users.ts script
3. Create them manually through Supabase Auth dashboard

Make sure each user has:
- Correct email and password
- Proper role assignment (user/admin/moderator)
- KYC status set to 'approved'
- Email confirmed status set to true
```

### **If Trae.ai asks about email verification:**
```
The issue is that the website tells users "We're sending you a 6-digit code" but Supabase actually sends an email with a verification link. You need to:

1. Update the EmailVerificationModal.tsx to say "verification link" instead of "6-digit code"
2. Update the Brevo email template to match the website messaging
3. Ensure the verification flow works with links, not codes

Choose consistency - either implement 6-digit codes or update messaging to match links.
```

### **If Trae.ai needs guidance on profile completion:**
```
The profile completion system needs:

1. Database fields: profile_image_url, social_media_accounts, profile_complete
2. Profile completion wizard component with image upload and social media forms
3. Profile completion checker function
4. Blocking mechanism for incomplete profiles
5. Integration with chat access control

Follow the ProfileCompletionWizard.tsx component in the implementation guide.
```

### **If Trae.ai asks about chat access control:**
```
The chat access control should work like this:

1. No user logged in → "Register to Chat" button
2. User logged in but profile incomplete → "Complete Profile to Chat" button  
3. User logged in with complete profile → Full chat access

Update the ChatWindow.tsx and ChatPanel.tsx components to implement this logic.
```

### **If Trae.ai needs testing guidance:**
```
Test the implementation by:

1. Trying to login with each demo user and verifying their role access
2. Registering a new user and going through the profile completion flow
3. Checking that chat access is properly gated
4. Verifying email verification messaging matches actual emails
5. Confirming profile data appears correctly in profile settings

Each test should pass before moving to the next phase.
```

## 🎯 **EXPECTED OUTCOME**

After implementation:
- ✅ All demo users functional with correct roles
- ✅ Email verification messaging consistent
- ✅ Profile completion mandatory and enforced
- ✅ Chat access properly gated
- ✅ Profile data flows correctly
- ✅ Platform ready for stakeholder demonstrations

## 📁 **FILE STRUCTURE REFERENCE**

```
project_directory/
├── dayrade_authentication_profile_issues_analysis.md
├── trae_ai_authentication_profile_implementation_guide.md
└── dayrade_complete_documentation_package/
    ├── 02_DATABASE_SCHEMA_COMPLETE.md
    ├── 06_BREVO_EMAIL_SYSTEM.md
    └── [other documentation files]
```

This prompt provides clear direction for Trae.ai to systematically address all authentication and profile management issues.

