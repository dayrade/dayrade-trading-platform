import React from 'react';
import TopBar from '@/components/TopBar';
import Sidebar from '@/components/Sidebar';
import ChatPanel from '@/components/ChatPanel';
import StockTicker from '@/components/dashboard/StockTicker';
import CommentaryBar from '@/components/CommentaryBar';
import { useCommentaryRotation } from '@/hooks/useCommentaryRotation';
import { useVolumeControl } from '@/hooks/useVolumeControl';
import { COMMENTATORS, COMMENTARY_MESSAGES } from '@/constants/commentators';

interface DashboardLayoutProps {
  children: React.ReactNode;
  sidebarExpanded: boolean;
  onSidebarExpandedChange: (expanded: boolean) => void;
  isAuthenticated?: boolean;
  onTraderSelect?: (trader: any) => void;
  onThemeToggle?: () => void;
  isDarkMode?: boolean;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = React.memo(({
  children,
  sidebarExpanded,
  onSidebarExpandedChange,
  isAuthenticated = false,
  onTraderSelect,
  onThemeToggle,
  isDarkMode = false
}) => {
  // Commentary and volume controls
  const { currentMessage } = useCommentaryRotation(COMMENTARY_MESSAGES);
  const { volume, isMuted, handleVolumeChange, handleMuteToggle } = useVolumeControl();

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar Navigation */}
      <Sidebar onExpandedChange={onSidebarExpandedChange} />
      
      {/* Top Bar */}
      <TopBar 
        sidebarExpanded={sidebarExpanded} 
        isAuthenticated={isAuthenticated}
        onTraderSelect={onTraderSelect}
        onThemeToggle={onThemeToggle}
        isDarkMode={isDarkMode}
      />
      
      {/* Main Content Area */}
      <div 
        className={`pt-16 h-screen transition-all duration-300 ${
          sidebarExpanded ? 'pl-64' : 'pl-20'
        } pr-[336px] pb-[136px]`}
      >
        <div className="flex h-full">
          {/* Page Content */}
          <div className="flex-1 flex flex-col h-full">
            {/* Page Content Area - 8px padding on all sides */}
            <div className="h-full p-2 overflow-hidden relative">
              {children}
            </div>
          </div>
        </div>
      </div>

      {/* Right Chat Panel - Always visible */}
      <div className="fixed top-[72px] right-2 w-80 h-[calc(100vh-144px)] z-10">
        <ChatPanel 
          isExpanded={sidebarExpanded}
          onSendMessage={(message) => console.log('Chat message sent:', message)}
          onRegisterClick={() => console.log('Register for chat clicked')}
        />
      </div>

      {/* Fixed Stock Ticker */}
      <div 
        className={`fixed bottom-[56px] h-12 transition-all duration-300 z-30 ${
          sidebarExpanded ? 'left-64' : 'left-20'
        } right-[336px]`}
      >
        <StockTicker />
      </div>

      {/* Fixed Commentary Bar */}
      <div 
        className={`fixed bottom-2 h-12 transition-all duration-300 z-30 ${
          sidebarExpanded ? 'left-64' : 'left-20'
        } right-[336px]`}
      >
        <CommentaryBar 
          currentSpeaker={currentMessage.speaker}
          commentText={currentMessage.text}
          commentators={COMMENTATORS}
          volume={volume}
          isMuted={isMuted}
          onVolumeChange={handleVolumeChange}
          onMuteToggle={handleMuteToggle}
          isAuthenticated={isAuthenticated}
        />
      </div>
    </div>
  );
});

DashboardLayout.displayName = 'DashboardLayout';

export default DashboardLayout;