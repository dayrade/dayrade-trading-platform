import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Home, Users, BarChart3, Calendar, DollarSign, Trophy, Settings, HelpCircle, LogOut } from 'lucide-react';
import { useLocation, Link } from 'react-router-dom';

interface SidebarProps {
  onExpandedChange?: (expanded: boolean) => void;
  isAuthenticated?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ onExpandedChange, isAuthenticated = false }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const location = useLocation();

  const handleMouseEnter = () => {
    setIsExpanded(true);
    onExpandedChange?.(true);
  };

  const handleMouseLeave = () => {
    setIsExpanded(false);
    onExpandedChange?.(false);
  };

  // Top navigation items
  const topNavigationItems = [
    { icon: Home, label: "Dashboard", path: "/", badge: null },
    { icon: Users, label: "Participants", path: "/participants", badge: "100" },
    { icon: BarChart3, label: "Compare Traders", path: "/compare", badge: null },
    { icon: Calendar, label: "Event Calendar", path: "/calendar", badge: null },
    { icon: DollarSign, label: "Economic Calendar", path: "/economic", badge: null },
    { icon: Trophy, label: "Tournament Winners", path: "/winners", badge: null }
  ];

  // Bottom navigation items (footer)
  const bottomNavigationItems = [
    { icon: Settings, label: "Settings", path: "/settings" },
    { icon: HelpCircle, label: "FAQ", path: "/faq" },
    ...(isAuthenticated ? [{ icon: LogOut, label: "Logout" }] : [])
  ];

  return (
    <motion.div
      className="fixed left-0 top-0 h-screen bg-nav-background/95 backdrop-blur-md border-r border-border flex flex-col z-40 overflow-hidden"
      animate={{ width: isExpanded ? 256 : 80 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Logo Section */}
      <div className="h-16 p-6 border-b border-border flex items-center overflow-hidden">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-profit to-profit/60 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-lg font-bold text-background">⚡</span>
          </div>
          <span className={`text-xl font-bold text-foreground whitespace-nowrap transition-opacity duration-300 overflow-hidden ${isExpanded ? 'opacity-100' : 'opacity-0 w-0'}`}>
            Dayrade®
          </span>
        </div>
      </div>
      
      {/* Top Navigation Menu */}
      <div className="flex-1 py-6 px-4 space-y-2 overflow-hidden">
        {topNavigationItems.map(({ icon: Icon, label, path, badge }, index) => {
          const isActive = location.pathname === path;
          
          return (
            <div key={index} className="relative group">
              <Link to={path}>
                <div
                  className={`flex items-center cursor-pointer transition-all rounded-lg border ${
                    isActive 
                      ? 'text-profit border-transparent' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-metric-card/50 border-transparent hover:border-border/50'
                  } ${isExpanded ? 'px-3 py-3' : 'px-2 py-3'} overflow-hidden`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span className={`font-medium whitespace-nowrap ml-3 flex items-center transition-all duration-300 overflow-hidden ${isExpanded ? 'opacity-100 max-w-none' : 'opacity-0 max-w-0'}`}>
                    {label}
                    {badge && (
                      <span className="ml-2 bg-profit text-background text-xs px-1.5 py-0.5 rounded-full">
                        {badge}
                      </span>
                    )}
                  </span>
                </div>
              </Link>
              
              {/* Tooltip for collapsed state */}
              {!isExpanded && (
                <div className="absolute left-20 top-1/2 transform -translate-y-1/2 bg-popover text-popover-foreground px-2 py-1 rounded text-sm opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 border border-border shadow-lg">
                  {label}
                  {badge && ` (${badge})`}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom Navigation (Footer) */}
      <div className="pb-6 px-4 space-y-2 border-t border-border pt-4 overflow-hidden">
        {bottomNavigationItems.map(({ icon: Icon, label, path }, index) => (
          <div key={index} className="relative group">
            {path ? (
              <Link to={path}>
                <div
                  className="flex items-center cursor-pointer transition-all rounded-lg border border-transparent hover:border-border/50 text-muted-foreground hover:text-foreground hover:bg-metric-card/50 px-2 py-3 overflow-hidden"
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span className={`font-medium whitespace-nowrap ml-3 transition-all duration-300 overflow-hidden ${isExpanded ? 'opacity-100 max-w-none' : 'opacity-0 max-w-0'}`}>
                    {label}
                  </span>
                </div>
              </Link>
            ) : (
              <div
                className="flex items-center cursor-pointer transition-all rounded-lg border border-transparent hover:border-border/50 text-muted-foreground hover:text-foreground hover:bg-metric-card/50 px-2 py-3 overflow-hidden"
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className={`font-medium whitespace-nowrap ml-3 transition-all duration-300 overflow-hidden ${isExpanded ? 'opacity-100 max-w-none' : 'opacity-0 max-w-0'}`}>
                  {label}
                </span>
              </div>
            )}
            
            {/* Tooltip for collapsed state */}
            {!isExpanded && (
              <div className="absolute left-20 top-1/2 transform -translate-y-1/2 bg-popover text-popover-foreground px-2 py-1 rounded text-sm opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 border border-border shadow-lg">
                {label}
              </div>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default Sidebar;