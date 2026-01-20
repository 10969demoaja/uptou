import React from 'react';
import SellerHeader from '../../components/SellerHeader';
import ComingSoon from '../../components/ComingSoon';

interface StoreProfilePageProps {
  onBack: () => void;
  onSwitchToGuest: () => void;
}

const StoreProfilePage: React.FC<StoreProfilePageProps> = ({ onBack, onSwitchToGuest }) => {
  const handleNotifyMe = () => {
    alert('Kami akan mengirim email notifikasi ketika fitur Profil Toko Lengkap sudah tersedia!');
  };

  return (
    <div className="seller-page">
      <SellerHeader 
        onSwitchToGuest={onSwitchToGuest}
      />
      
      <ComingSoon 
        feature="profile"
        estimatedDate="April 2025"
        onNotifyMe={handleNotifyMe}
      />
    </div>
  );
};

export default StoreProfilePage; 