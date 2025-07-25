import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import DashboardContent from '@/components/dashboard/DashboardContent';
import { AuthModal } from '@/components/auth/AuthModal';

const Index = () => {
  const [sidebarExpanded, setSidebarExpanded] = React.useState(true);
  const [selectedTrader, setSelectedTrader] = React.useState(null);
  const [authModalOpen, setAuthModalOpen] = React.useState(false);
  const [authModalMode, setAuthModalMode] = React.useState<'login' | 'register'>('register');
  const [isDarkMode, setIsDarkMode] = React.useState(() => {
    // Check localStorage for saved theme preference
    const saved = localStorage.getItem('dayrade-theme');
    return saved === 'dark';
  });

  // Apply theme to document
  React.useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('dayrade-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('dayrade-theme', 'light');
    }
  }, [isDarkMode]);

  const handleThemeToggle = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleAuthModalOpen = () => {
    setAuthModalMode('register');
    setAuthModalOpen(true);
  };
  
  return (
    <>
      <DashboardLayout 
        sidebarExpanded={sidebarExpanded}
        onSidebarExpandedChange={setSidebarExpanded}
        isAuthenticated={false}
        onTraderSelect={setSelectedTrader}
        onThemeToggle={handleThemeToggle}
        isDarkMode={isDarkMode}
        onAuthModalOpen={handleAuthModalOpen}
      >
        <main>
          <div className="sr-only">
            <h1>Dayrade Trading Dashboard</h1>
            <p>Real-time tournament trading performance and leaderboards</p>
          </div>
        <DashboardContent selectedTrader={selectedTrader} />
        </main>
      </DashboardLayout>

      {/* Authentication Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authModalMode}
      />
    </>
  );
};

export default Index;