import React, { useState } from 'react';
import { Bell, Sun, Moon, User, ChevronDown, Clock, Trophy, TrendingUp, MessageSquare, X, Shield, Settings, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import AnimatedLeaderboard from '@/components/AnimatedLeaderboard';
import { AuthModal } from '@/components/auth/AuthModal';
import { KycModal } from '@/components/auth/KycModal';
import { UserStateIndicator } from '@/components/auth/UserStateIndicator';
import { useAuth } from '@/hooks/useAuth';

interface TopBarProps {
  onThemeToggle?: () => void;
  isDarkMode?: boolean;
  sidebarExpanded?: boolean;
  onTraderSelect?: (trader: any) => void;
}

// Mock notification data
const mockNotifications = [
  {
    id: '1',
    type: 'tournament',
    title: 'Tournament Starting Soon',
    message: 'Raider Tournament begins in 30 minutes',
    time: '2 min ago',
    isRead: false,
    icon: Trophy
  },
  {
    id: '2',
    type: 'trading',
    title: 'Position Update',
    message: 'AAPL position up +$1,250 (8.5%)',
    time: '5 min ago',
    isRead: false,
    icon: TrendingUp
  },
  {
    id: '3',
    type: 'chat',
    title: 'New Chat Message',
    message: 'Sarah mentioned you in tournament chat',
    time: '12 min ago',
    isRead: true,
    icon: MessageSquare
  },
  {
    id: '4',
    type: 'system',
    title: 'Leaderboard Update',
    message: 'You moved up to rank #7',
    time: '1 hour ago',
    isRead: true,
    icon: Trophy
  },
  {
    id: '5',
    type: 'trading',
    title: 'Trade Executed',
    message: 'Sold 100 shares of TSLA at $245.50',
    time: '2 hours ago',
    isRead: true,
    icon: TrendingUp
  }
];
const TopBar: React.FC<TopBarProps> = ({ 
  onThemeToggle, 
  isDarkMode = false, 
  sidebarExpanded = false,
  onTraderSelect
}) => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [notifications, setNotifications] = useState(mockNotifications);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [kycModalOpen, setKycModalOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Get user state based on authentication and KYC status
  const getUserState = () => {
    if (!isAuthenticated) return 'viewer';
    if (user?.kycStatus === 'approved') return 'kyc_verified';
    return 'registered';
  };

  const handleLogin = () => {
    setAuthModalMode('login');
    setAuthModalOpen(true);
  };

  const handleRegister = () => {
    setAuthModalMode('register');
    setAuthModalOpen(true);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleKycVerification = () => {
    setKycModalOpen(true);
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => 
        n.id === notificationId ? { ...n, isRead: true } : n
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const removeNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const getNotificationTypeColor = (type: string) => {
    switch (type) {
      case 'tournament':
        return 'text-yellow-500';
      case 'trading':
        return 'text-green-500';
      case 'chat':
        return 'text-blue-500';
      case 'system':
        return 'text-purple-500';
      default:
        return 'text-muted-foreground';
    }
  };
  return (
    <motion.div 
      className="fixed top-0 right-0 h-16 bg-nav-background/95 backdrop-blur-md border-b border-border z-30 flex items-center justify-between px-6"
      animate={{ 
        left: sidebarExpanded ? '256px' : '80px' 
      }}
      transition={{ 
        duration: 0.3, 
        ease: "easeInOut" 
      }}
    >
      {/* Left: Leaderboard */}
      <div className="flex-1">
        <AnimatedLeaderboard onTraderSelect={onTraderSelect} />
      </div>

      {/* Right: Icon Cluster */}
      <div className="flex items-center space-x-4">
        {/* Notification Bell */}
        <DropdownMenu open={isNotificationOpen} onOpenChange={setIsNotificationOpen}>
          <DropdownMenuTrigger asChild>
            <motion.button
              className="relative p-2 rounded-lg hover:bg-accent transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Bell className="w-5 h-5 text-foreground" />
              {unreadCount > 0 && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-profit rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-background">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                </div>
              )}
            </motion.button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between p-3 border-b">
              <h3 className="font-semibold">Notifications</h3>
              <div className="flex items-center space-x-2">
                {unreadCount > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {unreadCount} new
                  </Badge>
                )}
                {notifications.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={markAllAsRead}
                    className="text-xs h-6 px-2"
                  >
                    Mark all read
                  </Button>
                )}
              </div>
            </div>
            
            {notifications.length === 0 ? (
              <div className="p-6 text-center">
                <Bell className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No notifications</p>
              </div>
            ) : (
              <div className="max-h-80 overflow-y-auto">
                {notifications.map((notification) => {
                  const IconComponent = notification.icon;
                  return (
                    <div
                      key={notification.id}
                      className={`p-3 border-b border-border/50 hover:bg-accent/50 transition-colors cursor-pointer ${
                        !notification.isRead ? 'bg-primary/5' : ''
                      }`}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`p-1.5 rounded-lg bg-background ${getNotificationTypeColor(notification.type)}`}>
                          <IconComponent className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm font-medium truncate ${
                                !notification.isRead ? 'text-foreground' : 'text-muted-foreground'
                              }`}>
                                {notification.title}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                {notification.message}
                              </p>
                              <div className="flex items-center mt-2">
                                <Clock className="w-3 h-3 text-muted-foreground mr-1" />
                                <span className="text-xs text-muted-foreground">
                                  {notification.time}
                                </span>
                                {!notification.isRead && (
                                  <div className="w-2 h-2 bg-profit rounded-full ml-2" />
                                )}
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeNotification(notification.id);
                              }}
                              className="p-1 h-6 w-6 text-muted-foreground hover:text-foreground ml-2"
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            
            {notifications.length > 0 && (
              <div className="p-3 border-t">
                <Button variant="outline" size="sm" className="w-full text-xs">
                  View All Notifications
                </Button>
              </div>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Theme Toggle */}
        <motion.button
          onClick={onThemeToggle}
          className="relative w-10 h-10 rounded-lg bg-background border border-border hover:bg-accent transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring flex items-center justify-center"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <motion.div
            animate={{ 
              rotate: isDarkMode ? 0 : 180,
              scale: isDarkMode ? 1 : 1
            }}
            transition={{ duration: 0.3 }}
          >
            {isDarkMode ? (
              <Moon className="w-5 h-5 text-foreground" />
            ) : (
              <Sun className="w-5 h-5 text-foreground" />
            )}
          </motion.div>
        </motion.button>

        {/* Authentication UI */}
        {isAuthenticated ? (
          /* User Avatar with Dropdown */
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <motion.button
                className="flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-ring rounded-full p-1"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="flex items-center space-x-2">
                  <Avatar className="w-8 h-8">
                    <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-primary" />
                    </div>
                  </Avatar>
                  <div className="hidden sm:block">
                    <UserStateIndicator
                      userState={getUserState()}
                      kycStatus={user?.kycStatus}
                      showText={false}
                    />
                  </div>
                </div>
                <ChevronDown className="w-3 h-3 text-muted-foreground" />
              </motion.button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <div className="p-3 border-b">
                <div className="flex items-center space-x-3">
                  <Avatar className="w-10 h-10">
                    <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">
                      {user?.firstName && user?.lastName 
                        ? `${user.firstName} ${user.lastName}`
                        : user?.email
                      }
                    </p>
                    <p className="text-sm text-muted-foreground truncate">
                      {user?.email}
                    </p>
                  </div>
                </div>
                <div className="mt-3">
                  <UserStateIndicator
                    userState={getUserState()}
                    kycStatus={user?.kycStatus}
                    className="justify-start"
                  />
                </div>
              </div>
              
              <DropdownMenuItem onClick={() => navigate('/profile')}>
                <User className="w-4 h-4 mr-2" />
                Profile
              </DropdownMenuItem>
              
              {getUserState() === 'registered' && user?.kycStatus !== 'approved' && (
                <DropdownMenuItem onClick={handleKycVerification}>
                  <Shield className="w-4 h-4 mr-2" />
                  Complete KYC Verification
                </DropdownMenuItem>
              )}
              
              <DropdownMenuItem onClick={() => navigate('/settings')}>
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem onClick={handleLogout} className="text-loss">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          /* Login/Register Buttons */
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-foreground hover:bg-accent"
              onClick={handleLogin}
            >
              Login
            </Button>
            <Button 
              size="sm" 
              className="bg-profit hover:bg-profit/90 text-background"
              onClick={handleRegister}
            >
              Register
            </Button>
          </div>
        )}
      </div>

      {/* Authentication Modals */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authModalMode}
      />
      
      <KycModal
        isOpen={kycModalOpen}
        onClose={() => setKycModalOpen(false)}
      />
    </motion.div>
  );
};

export default TopBar;