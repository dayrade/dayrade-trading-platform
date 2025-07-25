import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Mail, Lock, User, Loader2, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { EmailVerificationModal } from './EmailVerificationModal';
import { PasswordResetModal } from './PasswordResetModal';

// Form schemas
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain uppercase, lowercase, and number'),
  confirmPassword: z.string(),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  zimtraUsername: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login'
}) => {
  const [mode, setMode] = useState<'login' | 'register' | 'verify-email'>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const { login, register, isLoggingIn, isRegistering, loginError, registerError } = useAuth();
  const { toast } = useToast();

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
      zimtraUsername: '',
    },
  });

  const handleLogin = async (data: LoginFormData) => {
    try {
      const loginData = {
        email: data.email,
        password: data.password,
      };
      await login(loginData);
      toast({
        title: 'Welcome back!',
        description: 'You have successfully logged in.',
      });
      onClose();
    } catch (error: any) {
      toast({
        title: 'Login failed',
        description: error.message || 'Please check your credentials and try again.',
        variant: 'destructive',
      });
    }
  };

  const handleRegister = async (data: RegisterFormData) => {
    try {
      const registerData = {
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        zimtraUsername: data.zimtraUsername,
      };
      await register(registerData);
      
      // Store email and show verification modal
      setUserEmail(data.email);
      setShowEmailVerification(true);
      
      toast({
        title: 'Registration successful!',
        description: 'Please check your email for a verification code.',
      });
    } catch (error: any) {
      toast({
        title: 'Registration failed',
        description: error.message || 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleClose = () => {
    setMode('login');
    setShowEmailVerification(false);
    setShowPasswordReset(false);
    setUserEmail('');
    onClose();
  };

  const handleEmailVerificationSuccess = () => {
    setShowEmailVerification(false);
    setUserEmail('');
    toast({
      title: 'Welcome to Dayrade!',
      description: 'Your account has been verified. You can now access all features.',
    });
    onClose();
  };

  const handleEmailVerificationClose = () => {
    setShowEmailVerification(false);
    setUserEmail('');
  };

  const renderLoginForm = () => (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="login-email">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="login-email"
              type="email"
              placeholder="Enter your email"
              className="pl-10"
              {...loginForm.register('email')}
            />
          </div>
          {loginForm.formState.errors.email && (
            <p className="text-sm text-destructive">{loginForm.formState.errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="login-password">Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              className="pl-10 pr-10"
              {...loginForm.register('password')}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {loginForm.formState.errors.password && (
            <p className="text-sm text-destructive">{loginForm.formState.errors.password.message}</p>
          )}
        </div>

        {loginError && (
          <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
            {loginError.message}
          </div>
        )}

        <Button type="submit" className="w-full" disabled={isLoggingIn}>
          {isLoggingIn ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : (
            'Sign In'
          )}
        </Button>
      </form>

      <div className="text-center space-y-2">
        <Button
          variant="link"
          onClick={() => setShowPasswordReset(true)}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          Forgot your password?
        </Button>
        
        <Button
          variant="link"
          onClick={() => setMode('register')}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          Don't have an account? Sign up
        </Button>
      </div>
    </motion.div>
  );

  const renderRegisterForm = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      <form onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="register-firstName">First Name</Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="register-firstName"
                placeholder="First name"
                className="pl-10"
                {...registerForm.register('firstName')}
              />
            </div>
            {registerForm.formState.errors.firstName && (
              <p className="text-sm text-destructive">{registerForm.formState.errors.firstName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="register-lastName">Last Name</Label>
            <Input
              id="register-lastName"
              placeholder="Last name"
              {...registerForm.register('lastName')}
            />
            {registerForm.formState.errors.lastName && (
              <p className="text-sm text-destructive">{registerForm.formState.errors.lastName.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="register-email">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="register-email"
              type="email"
              placeholder="Enter your email"
              className="pl-10"
              {...registerForm.register('email')}
            />
          </div>
          {registerForm.formState.errors.email && (
            <p className="text-sm text-destructive">{registerForm.formState.errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="register-password">Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="register-password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Create a password"
              className="pl-10 pr-10"
              {...registerForm.register('password')}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {registerForm.formState.errors.password && (
            <p className="text-sm text-destructive">{registerForm.formState.errors.password.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="register-confirmPassword">Confirm Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="register-confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Confirm your password"
              className="pl-10 pr-10"
              {...registerForm.register('confirmPassword')}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {registerForm.formState.errors.confirmPassword && (
            <p className="text-sm text-destructive">{registerForm.formState.errors.confirmPassword.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="register-zimtraUsername">Zimtra Username (Optional)</Label>
          <Input
            id="register-zimtraUsername"
            placeholder="Your Zimtra trading username"
            {...registerForm.register('zimtraUsername')}
          />
          <p className="text-xs text-muted-foreground">
            If you already have a Zimtra account, enter your username to link it.
          </p>
        </div>

        {registerError && (
          <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
            {registerError.message}
          </div>
        )}

        <Button type="submit" className="w-full" disabled={isRegistering}>
          {isRegistering ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating account...
            </>
          ) : (
            'Create Account'
          )}
        </Button>
      </form>

      <div className="text-center">
        <Button
          variant="link"
          onClick={() => setMode('login')}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          Already have an account? Sign in
        </Button>
      </div>
    </motion.div>
  );

  const renderEmailVerification = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="text-center space-y-4"
    >
      <div className="mx-auto w-16 h-16 bg-profit/10 rounded-full flex items-center justify-center">
        <CheckCircle className="w-8 h-8 text-profit" />
      </div>
      
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Check your email</h3>
        <p className="text-muted-foreground">
          We've sent a verification link to your email address. Please click the link to verify your account.
        </p>
      </div>

      <div className="space-y-2">
        <Button onClick={handleClose} className="w-full">
          Got it
        </Button>
        <Button
          variant="link"
          onClick={() => setMode('login')}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          Back to sign in
        </Button>
      </div>
    </motion.div>
  );

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">
              {mode === 'login' && 'Welcome back'}
              {mode === 'register' && 'Create your account'}
              {mode === 'verify-email' && 'Account created'}
            </DialogTitle>
          </DialogHeader>

          <AnimatePresence mode="wait">
            {mode === 'login' && renderLoginForm()}
            {mode === 'register' && renderRegisterForm()}
            {mode === 'verify-email' && renderEmailVerification()}
          </AnimatePresence>

          {mode !== 'verify-email' && (
            <>
              <div className="my-4 border-t" />
              <div className="text-center text-sm text-muted-foreground">
                By continuing, you agree to our Terms of Service and Privacy Policy.
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <EmailVerificationModal
        isOpen={showEmailVerification}
        onClose={handleEmailVerificationClose}
        email={userEmail}
        onVerificationSuccess={handleEmailVerificationSuccess}
      />

      <PasswordResetModal
        isOpen={showPasswordReset}
        onClose={() => setShowPasswordReset(false)}
      />
    </>
  );
};