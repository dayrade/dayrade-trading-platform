# Sample User Credentials for Testing

This document provides sample user credentials for testing the Dayrade authentication system with different user states and KYC statuses.

## Running the Seed Script

To create the sample users in your database, run:

```bash
cd backend
npm run build
ts-node scripts/seed-sample-users.ts
```

## Sample User Accounts

### 1. Viewer State (Unverified Email)
- **Email**: `viewer@dayrade.com`
- **Password**: `password123`
- **State**: `viewer`
- **Email Verified**: ❌ No
- **KYC Status**: `pending`
- **Role**: `user`
- **Description**: User who has registered but hasn't verified their email yet

### 2. Registered State (Email Verified, KYC Pending)
- **Email**: `registered@dayrade.com`
- **Password**: `password123`
- **State**: `registered`
- **Email Verified**: ✅ Yes
- **KYC Status**: `pending`
- **Role**: `user`
- **Description**: User who has verified their email but hasn't completed KYC

### 3. KYC Verified State (Fully Verified)
- **Email**: `verified@dayrade.com`
- **Password**: `password123`
- **State**: `kyc_verified`
- **Email Verified**: ✅ Yes
- **KYC Status**: `approved`
- **Role**: `user`
- **Description**: Fully verified user who can participate in tournaments

### 4. KYC Rejected State
- **Email**: `rejected@dayrade.com`
- **Password**: `password123`
- **State**: `registered`
- **Email Verified**: ✅ Yes
- **KYC Status**: `rejected`
- **Role**: `user`
- **Description**: User whose KYC verification was rejected

### 5. Moderator Account
- **Email**: `moderator@dayrade.com`
- **Password**: `password123`
- **State**: `kyc_verified`
- **Email Verified**: ✅ Yes
- **KYC Status**: `approved`
- **Role**: `moderator`
- **Description**: Moderator with additional permissions

### 6. Admin Account
- **Email**: `admin@dayrade.com`
- **Password**: `password123`
- **State**: `kyc_verified`
- **Email Verified**: ✅ Yes
- **KYC Status**: `approved`
- **Role**: `admin`
- **Description**: Administrator with full system access

## User State Flow

The authentication system supports three main user states:

1. **Viewer** (`viewer`): Unverified email, limited access
2. **Registered** (`registered`): Email verified, can browse but limited trading
3. **KYC Verified** (`kyc_verified`): Fully verified, can participate in tournaments

## Testing Scenarios

### Authentication Flow Testing
1. Use `viewer@dayrade.com` to test email verification flow
2. Use `registered@dayrade.com` to test KYC verification flow
3. Use `verified@dayrade.com` to test full platform access

### KYC Status Testing
- **Pending**: `viewer@dayrade.com` or `registered@dayrade.com`
- **Approved**: `verified@dayrade.com`, `moderator@dayrade.com`, `admin@dayrade.com`
- **Rejected**: `rejected@dayrade.com`

### Role-Based Access Testing
- **User**: All accounts except moderator and admin
- **Moderator**: `moderator@dayrade.com`
- **Admin**: `admin@dayrade.com`

## UI Components to Test

1. **TopBar Authentication**:
   - Login/Register buttons for unauthenticated users
   - User dropdown with state indicator for authenticated users

2. **User State Indicator**:
   - Different badges for each user state
   - Progress indicator showing verification steps

3. **Authentication Modals**:
   - Login modal with validation
   - Registration modal with form validation
   - Email verification prompts

4. **KYC Modal**:
   - Multi-step KYC verification process
   - Document upload functionality
   - Status feedback

## Security Notes

- All passwords are hashed using bcryptjs
- These are test credentials only - never use in production
- The seed script checks for existing users to avoid duplicates
- Users are created in both Supabase Auth and the users table

## Troubleshooting

If you encounter issues:

1. Ensure your Supabase connection is working
2. Check that the users table schema matches the expected structure
3. Verify that Supabase Auth is properly configured
4. Check the console logs for detailed error messages