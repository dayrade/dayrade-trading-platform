import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Sun, Moon, Menu, X, User, Settings, LogOut } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { useNavigate } from 'react-router-dom';

interface NavigationBarProps {
  onThemeToggle?: () => void;
  isDarkMode?: boolean;
}

const NavigationBar: React.FC<NavigationBarProps> = ({ 
  onThemeToggle, 
  isDarkMode = true 
}) => {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hasNotifications, setHasNotifications] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const avatarRef = useRef<HTMLButtonElement>(null);

  // Close dropdown on outside click or Esc key
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
          avatarRef.current && !avatarRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsDropdownOpen(false);
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleNotificationClick = () => {
    setHasNotifications(false);
    // Simulate new notification after 3 seconds
    setTimeout(() => setHasNotifications(true), 3000);
  };

  const dropdownVariants = {
    hidden: {
      opacity: 0,
      scale: 0.95,
      y: -10
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0
    }
  };

  const mobileMenuVariants = {
    hidden: {
      x: '-100%'
    },
    visible: {
      x: 0
    }
  };

  const notificationDotVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: { 
      scale: 1, 
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 500,
        damping: 15
      }
    }
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-nav-background/95 backdrop-blur-md border-b border-border h-16">
        <div className="flex items-center justify-between h-full px-4 lg:px-6">
          {/* Left Section */}
          <div className="flex items-center space-x-3">
            <motion.div 
              className="flex items-center space-x-2"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <div className="w-8 h-8 bg-gradient-to-br from-profit to-profit/60 rounded-lg flex items-center justify-center">
                <span className="text-lg font-bold text-background">⚡</span>
              </div>
              <span className="hidden sm:block text-lg font-bold text-foreground">Dayrade</span>
            </motion.div>
          </div>

          {/* Right Section - Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Notification Bell */}
            <motion.button
              onClick={handleNotificationClick}
              className="relative p-2 rounded-lg hover:bg-accent transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Bell className="w-5 h-5 text-foreground" />
              <AnimatePresence>
                {hasNotifications && (
                  <motion.div
                    className="absolute -top-1 -right-1 w-3 h-3 bg-profit rounded-full"
                    variants={notificationDotVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                  />
                )}
              </AnimatePresence>
            </motion.button>

            {/* Theme Toggle */}
            <motion.button
              onClick={onThemeToggle}
              className="p-2 rounded-lg hover:bg-accent transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                animate={{ rotate: isDarkMode ? 0 : 180 }}
                transition={{ duration: 0.3 }}
              >
                {isDarkMode ? (
                  <Moon className="w-5 h-5 text-foreground" />
                ) : (
                  <Sun className="w-5 h-5 text-foreground" />
                )}
              </motion.div>
            </motion.button>

            {/* User Avatar */}
            <div className="relative">
              <motion.button
                ref={avatarRef}
                onClick={toggleDropdown}
                className="focus:outline-none focus:ring-2 focus:ring-ring rounded-full"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Avatar className="w-8 h-8">
                  <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                </Avatar>
              </motion.button>

              {/* Dropdown Menu */}
              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div
                    ref={dropdownRef}
                    className="absolute right-0 top-full mt-2 w-48 bg-popover border border-border rounded-lg shadow-lg py-1"
                    variants={dropdownVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                  >
                    <button className="w-full px-4 py-2 text-left text-sm text-popover-foreground hover:bg-accent transition-colors flex items-center space-x-2">
                      <User className="w-4 h-4" />
                      <span>Profile</span>
                    </button>
                    <button 
                      onClick={() => navigate('/settings')}
                      className="w-full px-4 py-2 text-left text-sm text-popover-foreground hover:bg-accent transition-colors flex items-center space-x-2"
                    >
                      <Settings className="w-4 h-4" />
                      <span>Settings</span>
                    </button>
                    <hr className="my-1 border-border" />
                    <button className="w-full px-4 py-2 text-left text-sm text-destructive hover:bg-accent transition-colors flex items-center space-x-2">
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-accent transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6 text-foreground" />
            ) : (
              <Menu className="w-6 h-6 text-foreground" />
            )}
          </motion.button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.div
              className="fixed top-16 left-0 bottom-0 w-64 bg-card border-r border-border z-50 md:hidden"
              variants={mobileMenuVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              <div className="p-4 space-y-4">
                <div className="flex items-center space-x-3 pb-4 border-b border-border">
                  <Avatar className="w-10 h-10">
                    <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                  </Avatar>
                  <div>
                    <div className="font-medium text-foreground">John Doe</div>
                    <div className="text-sm text-muted-foreground">Trader</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <button className="w-full p-3 text-left rounded-lg hover:bg-accent transition-colors flex items-center space-x-3">
                    <Bell className="w-5 h-5 text-foreground" />
                    <span className="text-foreground">Notifications</span>
                    {hasNotifications && (
                      <div className="w-2 h-2 bg-profit rounded-full ml-auto" />
                    )}
                  </button>
                  
                  <button 
                    onClick={onThemeToggle}
                    className="w-full p-3 text-left rounded-lg hover:bg-accent transition-colors flex items-center space-x-3"
                  >
                    {isDarkMode ? (
                      <Moon className="w-5 h-5 text-foreground" />
                    ) : (
                      <Sun className="w-5 h-5 text-foreground" />
                    )}
                    <span className="text-foreground">Theme</span>
                  </button>
                  
                  <button className="w-full p-3 text-left rounded-lg hover:bg-accent transition-colors flex items-center space-x-3">
                    <User className="w-5 h-5 text-foreground" />
                    <span className="text-foreground">Profile</span>
                  </button>
                  
                  <button 
                    onClick={() => navigate('/settings')}
                    className="w-full p-3 text-left rounded-lg hover:bg-accent transition-colors flex items-center space-x-3"
                  >
                    <Settings className="w-5 h-5 text-foreground" />
                    <span className="text-foreground">Settings</span>
                  </button>
                  
                  <button className="w-full p-3 text-left rounded-lg hover:bg-accent transition-colors flex items-center space-x-3 text-destructive">
                    <LogOut className="w-5 h-5" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default NavigationBar;