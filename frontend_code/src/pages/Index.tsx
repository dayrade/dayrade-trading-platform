import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import DashboardContent from '@/components/dashboard/DashboardContent';

const Index = () => {
  const [sidebarExpanded, setSidebarExpanded] = React.useState(true);
  const [selectedTrader, setSelectedTrader] = React.useState(null);
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
  
  return (
    <DashboardLayout 
      sidebarExpanded={sidebarExpanded}
      onSidebarExpandedChange={setSidebarExpanded}
      isAuthenticated={false}
      onTraderSelect={setSelectedTrader}
      onThemeToggle={handleThemeToggle}
      isDarkMode={isDarkMode}
    >
      <main>
        <div className="sr-only">
          <h1>Dayrade Trading Dashboard</h1>
          <p>Real-time tournament trading performance and leaderboards</p>
        </div>
      <DashboardContent selectedTrader={selectedTrader} />
      </main>
    </DashboardLayout>
  );
};

export default Index;