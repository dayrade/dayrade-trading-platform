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
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Mail, Loader2, CheckCircle, ArrowLeft, Lock, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { z } from 'zod';

interface PasswordResetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ResetStep = 'request' | 'code-sent' | 'reset-password' | 'success';

const emailSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

const resetPasswordSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const PasswordResetModal: React.FC<PasswordResetModalProps> = ({
  isOpen,
  onClose
}) => {
  const [step, setStep] = useState<ResetStep>('request');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();
  const { resetPassword, updatePassword } = useAuth();

  const handleClose = () => {
    setStep('request');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setErrors({});
    setIsLoading(false);
    onClose();
  };

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    try {
      emailSchema.parse({ email });
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors({ email: error.errors[0].message });
        return;
      }
    }

    setIsLoading(true);
    try {
      const { error } = await resetPassword(email);
      
      if (error) {
        toast({
          title: 'Request failed',
          description: error.message || 'Could not send reset email. Please try again.',
          variant: 'destructive',
        });
      } else {
        setStep('code-sent');
        toast({
          title: 'Reset email sent!',
          description: 'Check your email for password reset instructions.',
        });
      }
    } catch (error) {
      toast({
        title: 'Request failed',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    try {
      resetPasswordSchema.parse({ password, confirmPassword });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(fieldErrors);
        return;
      }
    }

    setIsLoading(true);
    try {
      const { error } = await updatePassword(password);
      
      if (error) {
        toast({
          title: 'Reset failed',
          description: error.message || 'Could not reset password. Please try again.',
          variant: 'destructive',
        });
      } else {
        setStep('success');
        toast({
          title: 'Password reset successful!',
          description: 'Your password has been updated. You can now sign in.',
        });
      }
    } catch (error) {
      toast({
        title: 'Reset failed',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderRequestStep = () => (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="space-y-4"
    >
      <div className="text-center space-y-2">
        <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
          <Mail className="w-6 h-6 text-blue-600" />
        </div>
        <p className="text-sm text-muted-foreground">
          Enter your email address and we'll send you a link to reset your password.
        </p>
      </div>

      <form onSubmit={handleRequestReset} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="reset-email">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="reset-email"
              type="email"
              placeholder="Enter your email"
              className="pl-10"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
          </div>
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email}</p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending...
            </>
          ) : (
            'Send Reset Email'
          )}
        </Button>
      </form>
    </motion.div>
  );

  const renderCodeSentStep = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-4"
    >
      <div className="text-center space-y-2">
        <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircle className="w-6 h-6 text-green-600" />
        </div>
        <h3 className="font-semibold">Check your email</h3>
        <p className="text-sm text-muted-foreground">
          We've sent password reset instructions to <strong>{email}</strong>
        </p>
        <p className="text-sm text-muted-foreground">
          Click the link in the email to reset your password.
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setStep('request')}
            className="flex-1"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button
            variant="outline"
            onClick={handleClose}
            className="flex-1"
          >
            Close
          </Button>
        </div>
      </div>
    </motion.div>
  );

  const renderResetPasswordStep = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-4"
    >
      <div className="text-center space-y-2">
        <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
          <Lock className="w-6 h-6 text-blue-600" />
        </div>
        <h3 className="font-semibold">Reset your password</h3>
        <p className="text-sm text-muted-foreground">
          Enter your new password below.
        </p>
      </div>

      <form onSubmit={handleResetPassword} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="new-password">New Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="new-password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter new password"
              className="pl-10 pr-10"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-sm text-destructive">{errors.password}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirm-new-password">Confirm New Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="confirm-new-password"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Confirm new password"
              className="pl-10 pr-10"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-sm text-destructive">{errors.confirmPassword}</p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Resetting...
            </>
          ) : (
            'Reset Password'
          )}
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={() => setStep('code-sent')}
          className="w-full"
          disabled={isLoading}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </form>
    </motion.div>
  );

  const renderSuccessStep = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center space-y-4 py-6"
    >
      <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
        <CheckCircle className="w-8 h-8 text-green-600" />
      </div>
      
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-green-600">Password Reset Complete!</h3>
        <p className="text-muted-foreground">
          Your password has been successfully updated. You can now sign in with your new password.
        </p>
      </div>

      <Button onClick={handleClose} className="w-full">
        Continue to Sign In
      </Button>
    </motion.div>
  );

  const getTitle = () => {
    switch (step) {
      case 'request':
        return 'Reset Password';
      case 'code-sent':
        return 'Check Your Email';
      case 'reset-password':
        return 'Set New Password';
      case 'success':
        return 'Password Reset';
      default:
        return 'Reset Password';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">{getTitle()}</DialogTitle>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {step === 'request' && renderRequestStep()}
          {step === 'code-sent' && renderCodeSentStep()}
          {step === 'reset-password' && renderResetPasswordStep()}
          {step === 'success' && renderSuccessStep()}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};