import React from 'react';
import SellerHeader from '../../components/SellerHeader';
import ComingSoon from '../../components/ComingSoon';

interface StorefrontPageProps {
  onBack: () => void;
  onSwitchToGuest: () => void;
}

const StorefrontPage: React.FC<StorefrontPageProps> = ({ onBack, onSwitchToGuest }) => {
  const handleNotifyMe = () => {
    alert('Kami akan mengirim email notifikasi ketika fitur Tampilan Toko Premium sudah tersedia!');
  };

  return (
    <div className="seller-page">
      <SellerHeader 
        onSwitchToGuest={onSwitchToGuest}
      />
      
      <ComingSoon 
        feature="storefront"
        estimatedDate="Mei 2025"
        onNotifyMe={handleNotifyMe}
      />
    </div>
  );
};

export default StorefrontPage; 