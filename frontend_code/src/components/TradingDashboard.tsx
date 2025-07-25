import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import DashboardContent from '@/components/dashboard/DashboardContent';

const TradingDashboard: React.FC = () => {
  console.log('TradingDashboard rendering...');
  const [sidebarExpanded, setSidebarExpanded] = React.useState(true);
  
  return (
    <DashboardLayout 
      sidebarExpanded={sidebarExpanded}
      onSidebarExpandedChange={setSidebarExpanded}
      isAuthenticated={false}
    >
      <DashboardContent />
    </DashboardLayout>
  );
};

export default TradingDashboard;