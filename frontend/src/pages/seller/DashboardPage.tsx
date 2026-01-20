import React from 'react';
import SellerDashboard from '../../components/SellerDashboard';

interface DashboardPageProps {
  onSwitchToGuest: () => void;
  onNavigateToAddProduct?: () => void;
  onNavigateToStoreSettings?: () => void;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ 
  onSwitchToGuest, 
  onNavigateToAddProduct,
  onNavigateToStoreSettings 
}) => {
  return (
    <SellerDashboard 
      onSwitchToGuest={onSwitchToGuest}
      onNavigateToAddProduct={onNavigateToAddProduct}
      onNavigateToStoreSettings={onNavigateToStoreSettings}
    />
  );
};

export default DashboardPage; 