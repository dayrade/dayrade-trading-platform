# Dayrade Platform - Complete User Roles & Permissions Specification

**Platform:** Dayrade Trading Tournament Platform  
**Documentation Date:** July 26, 2025  
**Reference:** Live Platform at https://dayrade.vercel.app/

## 🎯 Overview

The Dayrade platform implements a comprehensive role-based access control (RBAC) system with five distinct user types, each with specific permissions, UI access levels, and functional capabilities. This specification details every role and their exact permissions within the platform.

---

## 👥 **COMPLETE USER ROLE HIERARCHY**

### **1. VIEWER (Unregistered/Anonymous User)**

**Role Code:** `viewer` (no database entry)  
**Authentication Status:** Not authenticated  
**Database Role:** N/A (no user record)

#### **UI Access & Permissions:**
- ✅ **Can View:**
  - Public leaderboards (limited data)
  - Basic tournament information
  - Public trader profiles (name, rank only)
  - Economic calendar events
  - FAQ page
  - Tournament winners page (public data)

- ❌ **Cannot Access:**
  - Chat functionality
  - Follow/unfollow traders
  - Detailed analytics and charts
  - Personal dashboard
  - Settings page
  - Compare traders functionality
  - Real-time notifications

#### **UI Behavior:**
- **Registration Prompts:** "Register to chat" buttons throughout interface
- **Login Prompts:** "Login" and "Register" buttons in top navigation
- **Restricted Content:** Grayed out or hidden premium features
- **Call-to-Action:** Persistent registration encouragement

#### **Sample UI Elements:**
- "Register to chat" button in chat panel
- "Login to follow" on trader profiles
- "Sign up to access detailed analytics" on dashboard

---

### **2. REGISTERED USER (Basic Account)**

**Role Code:** `user`  
**Authentication Status:** Authenticated, email verified  
**Database Role:** `'user'` (default role)

#### **UI Access & Permissions:**
- ✅ **Full Access To:**
  - Real-time chat system
  - Follow/unfollow traders
  - Personal dashboard with basic metrics
  - Settings page (profile management)
  - Compare traders functionality
  - Event calendar
  - Economic calendar
  - All navigation pages

- ✅ **Limited Access To:**
  - Tournament participation (view only until KYC)
  - Basic analytics (limited historical data)
  - Chat frequency limits (anti-spam)

- ❌ **Cannot Access:**
  - Live tournament trading
  - Advanced analytics
  - Premium tournament features
  - Administrative functions

#### **UI Behavior:**
- **Full Interface:** Complete navigation and feature access
- **KYC Prompts:** "Complete KYC to participate in tournaments"
- **Verification Badge:** None (basic user status)
- **Chat Limits:** Rate limiting on message frequency

#### **Account Requirements:**
- Email verification completed
- Basic profile information
- Accepted terms and conditions

---

### **3. KYC VERIFIED USER (Premium Account)**

**Role Code:** `user` with `kyc_status: 'approved'`  
**Authentication Status:** Authenticated, email verified, KYC approved  
**Database Role:** `'user'` with `kyc_approved_at` timestamp

#### **UI Access & Permissions:**
- ✅ **Complete Access To:**
  - All registered user features
  - Live tournament participation
  - Full trading functionality
  - Advanced analytics and insights
  - Unlimited chat and interactions
  - Priority customer support
  - Exclusive tournament access
  - Detailed performance metrics

- ✅ **Premium Features:**
  - Real-time P&L tracking
  - Advanced charting tools
  - Historical performance analysis
  - Tournament prize eligibility
  - Enhanced profile features

#### **UI Behavior:**
- **Verified Badge:** Green checkmark or "Verified" indicator
- **Full Access:** No restrictions or prompts
- **Premium UI:** Access to all advanced features
- **Tournament Eligibility:** Can register for all tournaments

#### **Account Requirements:**
- Completed KYC verification process
- Government ID verification
- Address verification
- Risk assessment completed

---

### **4. MODERATOR**

**Role Code:** `moderator`  
**Authentication Status:** Authenticated with elevated privileges  
**Database Role:** `'moderator'`

#### **UI Access & Permissions:**
- ✅ **All User Features Plus:**
  - Chat moderation dashboard
  - User report management
  - Content moderation tools
  - Warning and penalty system
  - User activity monitoring
  - Moderation logs access

- ✅ **Moderation Tools:**
  - Delete/edit chat messages
  - Mute/unmute users
  - Issue warnings
  - Temporary user suspensions
  - Content flagging system
  - Report resolution

- ❌ **Cannot Access:**
  - Tournament creation/management
  - Financial data and reports
  - System configuration
  - User account deletion
  - Administrative settings

#### **UI Behavior:**
- **Moderator Badge:** Special "MOD" indicator
- **Moderation Panel:** Additional UI elements for content control
- **Quick Actions:** Right-click context menus for moderation
- **Alert System:** Notifications for reported content

#### **Responsibilities:**
- Monitor chat for inappropriate content
- Respond to user reports
- Enforce community guidelines
- Escalate serious issues to administrators

---

### **5. ADMINISTRATOR**

**Role Code:** `admin`  
**Authentication Status:** Authenticated with full system access  
**Database Role:** `'admin'`

#### **UI Access & Permissions:**
- ✅ **Complete System Control:**
  - All user and moderator features
  - Tournament creation and management
  - User account management
  - System configuration
  - Financial oversight and reporting
  - Platform analytics and monitoring
  - External service management

- ✅ **Administrative Dashboard:**
  - User management interface
  - Tournament administration
  - System health monitoring
  - Financial reports and analytics
  - External API management
  - Security and compliance tools

- ✅ **Advanced Tools:**
  - Database access and management
  - System configuration changes
  - User role assignments
  - Platform feature toggles
  - Emergency system controls

#### **UI Behavior:**
- **Admin Badge:** "ADMIN" indicator with special styling
- **Admin Panel:** Dedicated administrative interface
- **System Alerts:** Critical system notifications
- **Override Capabilities:** Can bypass normal restrictions

#### **Responsibilities:**
- Platform maintenance and updates
- User account management
- Tournament oversight
- Financial management
- Security monitoring
- Strategic platform decisions

---

## 🔐 **AUTHENTICATION & ROLE ASSIGNMENT**

### **Role Assignment Process:**
1. **Registration:** User starts as `viewer` → `user` upon email verification
2. **KYC Verification:** `user` → `user` with `kyc_approved` status
3. **Moderator Promotion:** Manual assignment by administrator
4. **Administrator Assignment:** Manual assignment by existing administrator

### **Role Verification in Code:**
```typescript
// Database schema role check
role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'moderator', 'admin'))

// KYC status check
kyc_status VARCHAR(20) DEFAULT 'pending' CHECK (kyc_status IN ('pending', 'in_review', 'approved', 'rejected', 'requires_action'))
```

### **JWT Token Payload:**
```typescript
interface UserPayload {
  id: string;
  email: string;
  role: 'user' | 'moderator' | 'admin';
  isVerified: boolean;
  kycStatus: string;
}
```

---

## 🎨 **UI ROLE INDICATORS**

### **Visual Role Identification:**
- **Viewer:** No badge, "Register" prompts
- **Registered User:** Basic profile, no special indicators
- **KYC Verified:** Green checkmark ✅ or "Verified" badge
- **Moderator:** "MOD" badge with special color
- **Administrator:** "ADMIN" badge with distinct styling

### **Navigation Access:**
- **Viewer:** Limited navigation, registration prompts
- **Registered:** Full navigation, KYC prompts for tournaments
- **KYC Verified:** Complete access, no restrictions
- **Moderator:** Additional moderation menu items
- **Administrator:** Admin panel access, system controls

---

## 📊 **FEATURE ACCESS MATRIX**

| Feature | Viewer | Registered | KYC Verified | Moderator | Admin |
|---------|--------|------------|--------------|-----------|-------|
| View Leaderboards | ✅ Basic | ✅ Full | ✅ Full | ✅ Full | ✅ Full |
| Chat System | ❌ | ✅ Limited | ✅ Unlimited | ✅ + Moderation | ✅ + Control |
| Follow Traders | ❌ | ✅ | ✅ | ✅ | ✅ |
| Tournament Participation | ❌ | ❌ | ✅ | ✅ | ✅ |
| Advanced Analytics | ❌ | ❌ | ✅ | ✅ | ✅ |
| User Management | ❌ | ❌ | ❌ | ✅ Limited | ✅ Full |
| Tournament Creation | ❌ | ❌ | ❌ | ❌ | ✅ |
| System Configuration | ❌ | ❌ | ❌ | ❌ | ✅ |

---

## 🔄 **ROLE TRANSITION WORKFLOWS**

### **Viewer → Registered User:**
1. Click "Register" button
2. Complete registration form
3. Verify email address
4. Account activated with `user` role

### **Registered → KYC Verified:**
1. Access KYC section in settings
2. Upload required documents
3. Complete verification process
4. Admin approval → `kyc_status: 'approved'`

### **User → Moderator:**
1. Administrator selection
2. Manual role assignment
3. Moderator training (if required)
4. Role updated to `moderator`

### **Moderator → Administrator:**
1. Existing administrator approval
2. Security clearance verification
3. Manual role assignment
4. Role updated to `admin`

---

## 🎯 **IMPLEMENTATION STATUS**

### **Currently Implemented:**
✅ Basic role structure (`user`, `moderator`, `admin`)  
✅ Authentication system with JWT tokens  
✅ Email verification workflow  
✅ KYC status tracking in database  
✅ Role-based UI access controls  

### **Requires Implementation:**
🔧 Visual role badges and indicators  
🔧 Moderator dashboard and tools  
🔧 Administrator panel interface  
🔧 KYC verification workflow UI  
🔧 Role transition notifications  

---

## 📝 **CONCLUSION**

The Dayrade platform implements a comprehensive 5-tier role system designed to provide appropriate access levels for different user types while maintaining security and functionality. Each role has clearly defined permissions, UI access levels, and responsibilities that scale from basic viewing to complete administrative control.

This role system ensures:
- **Security:** Appropriate access controls for sensitive features
- **User Experience:** Clear progression path from viewer to verified user
- **Moderation:** Effective content and community management
- **Administration:** Complete platform control and oversight
- **Scalability:** Flexible role system that can accommodate future needs

**Total User Types:** 5 (Viewer, Registered User, KYC Verified User, Moderator, Administrator)  
**Implementation Status:** Core structure complete, UI enhancements in progress

