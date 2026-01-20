import React from 'react';
import ComingSoon from './ComingSoon';

const ManageShippingSettings: React.FC = () => {
  const handleNotifyMe = () => {
    alert('Kami akan mengirim email notifikasi ketika fitur Pengaturan Pengiriman sudah tersedia!');
  };

  return (
    <div className="page-content" style={{ padding: '0', background: 'transparent' }}>
      <ComingSoon 
        feature="shipping"
        estimatedDate="Maret 2025"
        onNotifyMe={handleNotifyMe}
      />
    </div>
  );
};

export default ManageShippingSettings; 