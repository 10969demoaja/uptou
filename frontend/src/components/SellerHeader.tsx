import React from 'react';
import './SellerHeader.css';

interface SellerHeaderProps {
  onSwitchToGuest: () => void;
}

const SellerHeader: React.FC<SellerHeaderProps> = ({ onSwitchToGuest }) => {
  return (
    <header className="seller-header">
      <div className="seller-header-content">
        <div className="seller-header-left">
          <div className="seller-logo">
            <span className="uptou-logo">UPTOU</span>
            <span className="seller-center-text">Seller Center</span>
            <span className="managed-by">Managed by PT UPTOU Indonesia</span>
          </div>
        </div>
        <div className="seller-header-right">
          <div className="notification-icon">
            <span>🔔</span>
          </div>
          <button className="switch-view-btn" onClick={onSwitchToGuest}>
            Back to Store
          </button>
        </div>
      </div>
    </header>
  );
};

export default SellerHeader; 