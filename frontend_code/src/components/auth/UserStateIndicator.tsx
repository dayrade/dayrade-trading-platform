import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, AlertCircle, User } from 'lucide-react';
import { cn } from '@/lib/utils';

export type UserState = 'viewer' | 'registered' | 'kyc_verified';

interface UserStateIndicatorProps {
  userState: UserState;
  kycStatus?: 'pending' | 'approved' | 'rejected';
  className?: string;
  showIcon?: boolean;
  showText?: boolean;
}

export const UserStateIndicator: React.FC<UserStateIndicatorProps> = ({
  userState,
  kycStatus,
  className,
  showIcon = true,
  showText = true,
}) => {
  const getStateConfig = () => {
    switch (userState) {
      case 'viewer':
        return {
          label: 'Viewer',
          icon: User,
          variant: 'secondary' as const,
          description: 'Not registered',
        };
      case 'registered':
        return {
          label: 'Registered',
          icon: Clock,
          variant: 'outline' as const,
          description: 'Email verified, KYC pending',
        };
      case 'kyc_verified':
        return {
          label: 'Verified',
          icon: CheckCircle,
          variant: 'default' as const,
          description: 'Fully verified user',
        };
      default:
        return {
          label: 'Unknown',
          icon: AlertCircle,
          variant: 'destructive' as const,
          description: 'Unknown state',
        };
    }
  };

  const getKycStatusConfig = () => {
    if (!kycStatus) return null;
    
    switch (kycStatus) {
      case 'pending':
        return {
          label: 'KYC Pending',
          icon: Clock,
          variant: 'outline' as const,
          color: 'text-yellow-600',
        };
      case 'approved':
        return {
          label: 'KYC Approved',
          icon: CheckCircle,
          variant: 'default' as const,
          color: 'text-green-600',
        };
      case 'rejected':
        return {
          label: 'KYC Rejected',
          icon: AlertCircle,
          variant: 'destructive' as const,
          color: 'text-red-600',
        };
      default:
        return null;
    }
  };

  const stateConfig = getStateConfig();
  const kycConfig = getKycStatusConfig();
  const IconComponent = stateConfig.icon;

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Badge variant={stateConfig.variant} className="flex items-center gap-1">
        {showIcon && <IconComponent className="h-3 w-3" />}
        {showText && stateConfig.label}
      </Badge>
      
      {kycConfig && userState === 'registered' && (
        <Badge variant={kycConfig.variant} className="flex items-center gap-1">
          {showIcon && <kycConfig.icon className="h-3 w-3" />}
          {showText && kycConfig.label}
        </Badge>
      )}
    </div>
  );
};

interface UserStateProgressProps {
  userState: UserState;
  kycStatus?: 'pending' | 'approved' | 'rejected';
  className?: string;
}

export const UserStateProgress: React.FC<UserStateProgressProps> = ({
  userState,
  kycStatus,
  className,
}) => {
  const steps = [
    { key: 'viewer', label: 'Viewer', completed: true },
    { key: 'registered', label: 'Registered', completed: userState !== 'viewer' },
    { key: 'kyc_verified', label: 'Verified', completed: userState === 'kyc_verified' },
  ];

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <React.Fragment key={step.key}>
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
                  step.completed
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                )}
              >
                {step.completed ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  index + 1
                )}
              </div>
              <span className="text-xs mt-1 text-center">{step.label}</span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  'flex-1 h-0.5 mx-2',
                  steps[index + 1].completed ? 'bg-primary' : 'bg-muted'
                )}
              />
            )}
          </React.Fragment>
        ))}
      </div>
      
      {userState === 'registered' && kycStatus && (
        <div className="text-center">
          <UserStateIndicator
            userState={userState}
            kycStatus={kycStatus}
            showIcon={false}
            className="justify-center"
          />
        </div>
      )}
    </div>
  );
};