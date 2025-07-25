// Authentication hook for Dayrade platform
import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi } from '@/api/auth';
import { supabase } from '@/lib/api';
import type { User, LoginRequest, RegisterRequest } from '@/types/api';

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  const queryClient = useQueryClient();

  // Get current user profile
  const { data: user, isLoading: profileLoading } = useQuery({
    queryKey: ['auth', 'profile'],
    queryFn: authApi.getProfile,
    enabled: authState.isAuthenticated,
    retry: false,
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: (credentials: LoginRequest) => authApi.login(credentials),
    onSuccess: (data) => {
      setAuthState(prev => ({
        ...prev,
        user: data.user,
        isAuthenticated: true,
        error: null,
      }));
      queryClient.invalidateQueries({ queryKey: ['auth'] });
    },
    onError: (error: any) => {
      setAuthState(prev => ({
        ...prev,
        error: error.message || 'Login failed',
      }));
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: (userData: RegisterRequest) => authApi.register(userData),
    onSuccess: (data) => {
      setAuthState(prev => ({
        ...prev,
        user: data.user,
        isAuthenticated: true,
        error: null,
      }));
      queryClient.invalidateQueries({ queryKey: ['auth'] });
    },
    onError: (error: any) => {
      setAuthState(prev => ({
        ...prev,
        error: error.message || 'Registration failed',
      }));
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
      queryClient.clear();
      // Clear Supabase session
      supabase.auth.signOut();
    },
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: (profileData: Partial<User>) => authApi.updateProfile(profileData),
    onSuccess: (updatedUser) => {
      setAuthState(prev => ({
        ...prev,
        user: updatedUser,
      }));
      queryClient.setQueryData(['auth', 'profile'], updatedUser);
    },
  });

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: ({ currentPassword, newPassword }: { currentPassword: string; newPassword: string }) =>
      authApi.changePassword(currentPassword, newPassword),
  });

  // Send email verification
  const sendEmailVerificationMutation = useMutation({
    mutationFn: (email: string) => authApi.sendEmailVerification(email),
  });

  // Forgot password
  const forgotPasswordMutation = useMutation({
    mutationFn: (email: string) => authApi.forgotPassword(email),
  });

  // Reset password
  const resetPasswordMutation = useMutation({
    mutationFn: ({ token, newPassword }: { token: string; newPassword: string }) =>
      authApi.resetPassword(token, newPassword),
  });

  // KYC operations
  const initiateKycMutation = useMutation({
    mutationFn: authApi.initiateKyc,
  });

  const { data: kycStatus, refetch: refetchKycStatus } = useQuery({
    queryKey: ['auth', 'kyc-status'],
    queryFn: authApi.getKycStatus,
    enabled: authState.isAuthenticated,
  });

  const submitKycMutation = useMutation({
    mutationFn: (documents: FormData) => authApi.submitKycVerification(documents),
    onSuccess: () => {
      refetchKycStatus();
    },
  });

  // Check authentication state on mount
  useEffect(() => {
    const checkAuthState = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          const userProfile = await authApi.getProfile();
          setAuthState({
            user: userProfile,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } else {
          setAuthState(prev => ({
            ...prev,
            isLoading: false,
          }));
        }
      } catch (error) {
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      }
    };

    checkAuthState();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          try {
            const userProfile = await authApi.getProfile();
            setAuthState({
              user: userProfile,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
          } catch (error) {
            console.error('Failed to fetch user profile:', error);
          }
        } else if (event === 'SIGNED_OUT') {
          setAuthState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
          queryClient.clear();
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [queryClient]);

  // Update auth state when user data changes
  useEffect(() => {
    if (user && authState.isAuthenticated) {
      setAuthState(prev => ({
        ...prev,
        user,
        isLoading: false,
      }));
    }
  }, [user, authState.isAuthenticated]);

  // Helper functions
  const login = useCallback((credentials: LoginRequest) => {
    return loginMutation.mutateAsync(credentials);
  }, [loginMutation]);

  const register = useCallback((userData: RegisterRequest) => {
    return registerMutation.mutateAsync(userData);
  }, [registerMutation]);

  const logout = useCallback(() => {
    return logoutMutation.mutateAsync();
  }, [logoutMutation]);

  const updateProfile = useCallback((profileData: Partial<User>) => {
    return updateProfileMutation.mutateAsync(profileData);
  }, [updateProfileMutation]);

  const changePassword = useCallback((currentPassword: string, newPassword: string) => {
    return changePasswordMutation.mutateAsync({ currentPassword, newPassword });
  }, [changePasswordMutation]);

  const sendEmailVerification = useCallback((email: string) => {
    return sendEmailVerificationMutation.mutateAsync(email);
  }, [sendEmailVerificationMutation]);

  const forgotPassword = useCallback((email: string) => {
    return forgotPasswordMutation.mutateAsync(email);
  }, [forgotPasswordMutation]);

  const resetPassword = useCallback((token: string, newPassword: string) => {
    return resetPasswordMutation.mutateAsync({ token, newPassword });
  }, [resetPasswordMutation]);

  const initiateKyc = useCallback(() => {
    return initiateKycMutation.mutateAsync();
  }, [initiateKycMutation]);

  const submitKyc = useCallback((documents: FormData) => {
    return submitKycMutation.mutateAsync(documents);
  }, [submitKycMutation]);

  // Permission checks
  const hasRole = useCallback((role: 'user' | 'moderator' | 'admin') => {
    if (!authState.user) return false;
    
    const roles = ['user', 'moderator', 'admin'];
    const userRoleIndex = roles.indexOf(authState.user.role);
    const requiredRoleIndex = roles.indexOf(role);
    
    return userRoleIndex >= requiredRoleIndex;
  }, [authState.user]);

  const isAdmin = useCallback(() => hasRole('admin'), [hasRole]);
  const isModerator = useCallback(() => hasRole('moderator'), [hasRole]);

  const canAccessTournament = useCallback((tournamentType: 'elevator' | 'crusader' | 'raider') => {
    if (!authState.user) return false;
    
    // Placeholder: Check user's KYC status and account type
    if (tournamentType === 'raider') {
      return authState.user.kycStatus === 'approved';
    }
    
    return true;
  }, [authState.user]);

  return {
    // State
    ...authState,
    isLoading: authState.isLoading || profileLoading,

    // Actions
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    sendEmailVerification,
    forgotPassword,
    resetPassword,

    // KYC
    kycStatus,
    initiateKyc,
    submitKyc,
    refetchKycStatus,

    // Permission checks
    hasRole,
    isAdmin,
    isModerator,
    canAccessTournament,

    // Loading states
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
    isUpdatingProfile: updateProfileMutation.isPending,
    isChangingPassword: changePasswordMutation.isPending,
    isSendingEmailVerification: sendEmailVerificationMutation.isPending,
    isSendingForgotPassword: forgotPasswordMutation.isPending,
    isResettingPassword: resetPasswordMutation.isPending,
    isInitiatingKyc: initiateKycMutation.isPending,
    isSubmittingKyc: submitKycMutation.isPending,

    // Errors
    loginError: loginMutation.error,
    registerError: registerMutation.error,
    updateProfileError: updateProfileMutation.error,
    changePasswordError: changePasswordMutation.error,
    kycError: submitKycMutation.error,
  };
};