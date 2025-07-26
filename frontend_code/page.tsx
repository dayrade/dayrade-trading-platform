'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSupabase } from '@/lib/providers/supabase-provider'
import { useBrand } from '@/lib/providers/brand-provider'
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Loader2 } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

type AuthMode = 'signin' | 'signup' | 'reset'

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { signIn, signUp, resetPassword, user, loading: authLoading } = useSupabase()
  const { brandAssets } = useBrand()
  
  const [mode, setMode] = useState<AuthMode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [verificationSent, setVerificationSent] = useState(false)
  const [isVerified, setIsVerified] = useState(false)

  const redirectTo = searchParams.get('redirect') || '/dashboard'
  const verified = searchParams.get('verified')
  const emailParam = searchParams.get('email')

  // Redirect if user is already logged in
  useEffect(() => {
    if (!authLoading && user) {
      router.push(redirectTo)
      return
    }
  }, [user, authLoading, router, redirectTo])

  // Set initial mode and handle verification status
  useEffect(() => {
    const modeParam = searchParams.get('mode')
    if (modeParam === 'signup' || modeParam === 'reset') {
      setMode(modeParam as AuthMode)
    }
    
    // Handle verification success
    if (verified === 'true') {
      setIsVerified(true)
      setSuccess('Email verified successfully! You can now sign in.')
      if (emailParam) {
        setEmail(emailParam)
      }
    }
  }, [searchParams, verified, emailParam])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')
    setSuccess('')

    try {
      if (mode === 'signin') {
        const { error } = await signIn(email, password)
        if (error) {
          setError(error.message)
        } else {
          router.push(redirectTo)
        }
      } else if (mode === 'signup') {
        if (password !== confirmPassword) {
          setError('Passwords do not match')
          return
        }
        if (password.length < 6) {
          setError('Password must be at least 6 characters')
          return
        }
        
        // Use our backend signup endpoint which includes duplicate prevention
        try {
          const signupResponse = await fetch('/api/auth/signup', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email,
              password
            }),
          })
          
          const signupResult = await signupResponse.json()
          
          if (!signupResponse.ok) {
            if (signupResponse.status === 409) {
              // User already exists
              setError('An account with this email already exists. Please sign in instead or use the forgot password option if you need to reset your password.')
              return
            } else {
              // Other signup errors
              setError(signupResult.error || 'Signup failed. Please try again.')
              return
            }
          }
          
          // Signup successful
          setVerificationSent(true)
          setSuccess('Account created! Please check your email to verify your account before signing in.')
          // Redirect to success page with email parameter
          setTimeout(() => {
            router.push(`/auth/signup-success?email=${encodeURIComponent(email)}`)
          }, 2000)
          
        } catch (signupError) {
          console.error('Signup error:', signupError)
          setError('An unexpected error occurred during signup. Please try again.')
        }
      } else if (mode === 'reset') {
        try {
          const resetResponse = await fetch('/api/auth/reset-password', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email }),
          })
          
          const resetResult = await resetResponse.json()
          
          if (!resetResponse.ok) {
            setError(resetResult.error || 'Failed to send reset email. Please try again.')
          } else {
            setSuccess('Password reset email sent! Please check your inbox and follow the instructions.')
            setTimeout(() => {
              setMode('signin')
            }, 3000)
          }
        } catch (resetError) {
          console.error('Reset password error:', resetError)
          setError('An unexpected error occurred. Please try again.')
        }
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Show loading spinner while checking authentication status
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          {brandAssets?.logo && (
            <Image
              src={brandAssets.logo}
              alt={brandAssets.companyName || 'Logo'}
              width={80}
              height={80}
              className="h-20 w-auto mx-auto mb-4"
            />
          )}
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {mode === 'signin' ? 'Welcome back' :
             mode === 'signup' ? 'Create your account' :
             'Reset your password'}
          </h1>
          <p className="text-gray-600">
            {mode === 'signin' ? 'Sign in to your Nester account' :
             mode === 'signup' ? 'Start generating amazing property content' :
             'Enter your email to reset your password'}
          </p>
        </div>

        {/* Auth Form */}
        <div className="card bg-white shadow-xl">
          <div className="card-body">
            {/* Verification Success Message */}
            {isVerified && (
              <div className="alert alert-success mb-4">
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Email verified successfully! You can now sign in.</span>
                </div>
              </div>
            )}

            {/* Verification Sent Message */}
            {verificationSent && (
              <div className="alert alert-info mb-4">
                <div className="flex items-center">
                  <Mail className="h-5 w-5 mr-2" />
                  <div>
                    <div className="font-bold">Verification Email Sent!</div>
                    <div className="text-sm">Please check your inbox and click the verification link before signing in.</div>
                  </div>
                </div>
              </div>
            )}

            {/* Success Message */}
            {success && !isVerified && !verificationSent && (
              <div className="alert alert-success mb-4">
                <span>{success}</span>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="alert alert-error mb-4">
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span>{error}</span>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Field */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Email</span>
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="input input-bordered w-full pl-10"
                    required
                    disabled={isSubmitting}
                  />
                  <Mail className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                </div>
              </div>

              {/* Password Field */}
              {mode !== 'reset' && (
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Password</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="input input-bordered w-full pl-10 pr-10"
                      required
                      disabled={isSubmitting}
                      minLength={8}
                    />
                    <Lock className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      disabled={isSubmitting}
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
              )}

              {/* Confirm Password Field */}
              {mode === 'signup' && (
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Confirm Password</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="input input-bordered w-full pl-10"
                      required
                      disabled={isSubmitting}
                      minLength={8}
                    />
                    <Lock className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  </div>
                </div>
              )}

              {/* Password Strength Indicator for Signup */}
              {mode === 'signup' && password && (
                <div className="form-control">
                  <label className="label">
                    <span className="label-text-alt">Password Strength</span>
                  </label>
                  <div className="flex space-x-1">
                    <div className={`h-2 flex-1 rounded ${
                      password.length >= 8 ? 'bg-green-500' : 'bg-gray-200'
                    }`}></div>
                    <div className={`h-2 flex-1 rounded ${
                      password.length >= 8 && /[A-Z]/.test(password) && /[a-z]/.test(password) ? 'bg-green-500' : 'bg-gray-200'
                    }`}></div>
                    <div className={`h-2 flex-1 rounded ${
                      password.length >= 8 && /[A-Z]/.test(password) && /[a-z]/.test(password) && /[0-9]/.test(password) ? 'bg-green-500' : 'bg-gray-200'
                    }`}></div>
                    <div className={`h-2 flex-1 rounded ${
                      password.length >= 8 && /[A-Z]/.test(password) && /[a-z]/.test(password) && /[0-9]/.test(password) && /[!@#$%^&*(),.?":{}|<>]/.test(password) ? 'bg-green-500' : 'bg-gray-200'
                    }`}></div>
                  </div>
                  <label className="label">
                    <span className="label-text-alt text-xs">
                      {password.length < 8 ? 'At least 8 characters' :
                       !/[A-Z]/.test(password) ? 'Add uppercase letter' :
                       !/[a-z]/.test(password) ? 'Add lowercase letter' :
                       !/[0-9]/.test(password) ? 'Add a number' :
                       !/[!@#$%^&*(),.?":{}|<>]/.test(password) ? 'Add special character (!@#$%^&*)' :
                       'Strong password!'}
                    </span>
                  </label>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || !email || (mode !== 'reset' && !password) || verificationSent}
                className={`btn w-full ${
                  mode === 'signin' ? 'btn-primary' :
                  mode === 'signup' ? 'btn-success' :
                  'btn-warning'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {mode === 'signin' ? 'Signing in...' :
                     mode === 'signup' ? 'Creating account...' :
                     'Sending reset email...'}
                  </>
                ) : verificationSent ? (
                  <>
                    <Mail className="h-4 w-4 mr-2" />
                    Check your email
                  </>
                ) : (
                  <>
                    {mode === 'signin' ? 'Sign In' :
                     mode === 'signup' ? 'Create Account' :
                     'Send Reset Email'}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </button>

              {/* Email Verification Notice for Sign In */}
              {mode === 'signin' && (
                <div className="text-center">
                  <p className="text-xs text-gray-600">
                    Make sure your email is verified before signing in.
                    <br />
                    <Link href="/auth/verify-email" className="link link-primary text-xs">
                      Need to verify your email?
                    </Link>
                  </p>
                </div>
              )}
            </form>

            {/* Mode Switching */}
            <div className="divider">or</div>
            
            <div className="text-center space-y-2">
              {mode === 'signin' && (
                <>
                  <button
                    onClick={() => setMode('signup')}
                    className="btn btn-ghost btn-sm"
                    disabled={isSubmitting}
                  >
                    <User className="h-4 w-4 mr-2" />
                    Create new account
                  </button>
                  <br />
                  <button
                    onClick={() => setMode('reset')}
                    className="btn btn-ghost btn-sm"
                    disabled={isSubmitting}
                  >
                    Forgot your password?
                  </button>
                </>
              )}
              
              {mode === 'signup' && (
                <button
                  onClick={() => setMode('signin')}
                  className="btn btn-ghost btn-sm"
                  disabled={isSubmitting}
                >
                  Already have an account? Sign in
                </button>
              )}
              
              {mode === 'reset' && (
                <button
                  onClick={() => setMode('signin')}
                  className="btn btn-ghost btn-sm"
                  disabled={isSubmitting}
                >
                  Back to sign in
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-600">
          <p>
            By signing up, you agree to our{' '}
            <Link href="/terms" className="link link-primary">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="link link-primary">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center"><div className="loading loading-spinner loading-lg"></div></div>}>
      <LoginContent />
    </Suspense>
  )
}