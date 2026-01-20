import React from 'react';
import SellerHeader from '../../components/SellerHeader';
import ComingSoon from '../../components/ComingSoon';

interface ShippingSettingsPageProps {
  onBack: () => void;
  onSwitchToGuest: () => void;
}

const ShippingSettingsPage: React.FC<ShippingSettingsPageProps> = ({ onBack, onSwitchToGuest }) => {
  const handleNotifyMe = () => {
    alert('Kami akan mengirim email notifikasi ketika fitur Pengaturan Pengiriman sudah tersedia!');
  };

  return (
    <div className="seller-page">
      <SellerHeader 
        onSwitchToGuest={onSwitchToGuest}
      />
      
      <ComingSoon 
        feature="shipping"
        estimatedDate="Maret 2025"
        onNotifyMe={handleNotifyMe}
      />
    </div>
  );
};

export default ShippingSettingsPage; 