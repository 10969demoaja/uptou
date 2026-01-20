import React, { useState } from 'react';
import './BuyerDashboard.css';

interface BuyerDashboardProps {
  onSwitchToGuest: () => void;
}

const BuyerDashboard: React.FC<BuyerDashboardProps> = ({ onSwitchToGuest }) => {
  const [activeTab, setActiveTab] = useState('profile');

  const menuItems = [
    { id: 'profile', label: 'Profil Saya', icon: '👤' },
    { id: 'orders', label: 'Pesanan Saya', icon: '📦' },
    { id: 'wishlist', label: 'Wishlist', icon: '❤️' },
    { id: 'address', label: 'Alamat', icon: '📍' },
    { id: 'payment', label: 'Pembayaran', icon: '💳' },
    { id: 'notifications', label: 'Notifikasi', icon: '🔔' },
    { id: 'help', label: 'Bantuan', icon: '❓' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="buyer-content">
            <h2>Profil Saya</h2>
            <div className="profile-section">
              <div className="profile-header">
                <div className="profile-avatar">
                  <div className="avatar-placeholder">👤</div>
                </div>
                <div className="profile-info">
                  <h3>John Doe</h3>
                  <p>john.doe@email.com</p>
                  <p>+62 812-3456-7890</p>
                </div>
                <button className="edit-profile-btn">Edit Profil</button>
              </div>
              
              <div className="profile-stats">
                <div className="stat-card">
                  <div className="stat-number">15</div>
                  <div className="stat-label">Total Pesanan</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">8</div>
                  <div className="stat-label">Wishlist</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">3</div>
                  <div className="stat-label">Alamat Tersimpan</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">2</div>
                  <div className="stat-label">Metode Pembayaran</div>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'orders':
        return (
          <div className="buyer-content">
            <h2>Pesanan Saya</h2>
            <div className="orders-tabs">
              <button className="order-tab active">Semua</button>
              <button className="order-tab">Belum Bayar</button>
              <button className="order-tab">Dikemas</button>
              <button className="order-tab">Dikirim</button>
              <button className="order-tab">Selesai</button>
            </div>
            
            <div className="orders-list">
              <div className="empty-orders-dashboard">
                <div className="empty-icon-dashboard">📦</div>
                <h3>Belum Ada Pesanan</h3>
                <p>Mulai berbelanja untuk melihat pesanan Anda di sini</p>
                <button 
                  className="start-shopping-btn-dashboard"
                  onClick={onSwitchToGuest}
                >
                  Mulai Berbelanja
                </button>
              </div>
            </div>
          </div>
        );
      
      case 'wishlist':
        return (
          <div className="buyer-content">
            <h2>Wishlist Saya</h2>
            <div className="wishlist-grid">
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <div key={item} className="wishlist-card">
                  <div className="wishlist-image">📱</div>
                  <h4>iPhone 15 Pro Max</h4>
                  <p className="wishlist-price">Rp 19.999.000</p>
                  <p className="wishlist-discount">Diskon 10%</p>
                  <div className="wishlist-actions">
                    <button className="add-to-cart-btn">+ Keranjang</button>
                    <button className="remove-wishlist-btn">🗑️</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      
      case 'address':
        return (
          <div className="buyer-content">
            <h2>Alamat Saya</h2>
            <div className="address-section">
              <button className="add-address-btn">+ Tambah Alamat Baru</button>
              
              <div className="address-list">
                {[1, 2, 3].map((addr) => (
                  <div key={addr} className="address-card">
                    <div className="address-header">
                      <h4>Rumah {addr === 1 ? '(Utama)' : ''}</h4>
                      {addr === 1 && <span className="primary-badge">Utama</span>}
                    </div>
                    <p>John Doe</p>
                    <p>+62 812-3456-7890</p>
                    <p>Jl. Sudirman No. 123, Kec. Tanah Abang, Jakarta Pusat, DKI Jakarta 10270</p>
                    <div className="address-actions">
                      <button className="edit-btn">Edit</button>
                      <button className="delete-btn">Hapus</button>
                      {addr !== 1 && <button className="set-primary-btn">Jadikan Utama</button>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      
      default:
        return (
          <div className="buyer-content">
            <h2>{menuItems.find(item => item.id === activeTab)?.label}</h2>
            <p>Fitur ini sedang dalam pengembangan.</p>
          </div>
        );
    }
  };

  return (
    <div className="buyer-dashboard">
      {/* Header */}
      <div className="buyer-header">
        <div className="header-content">
          <h1>Akun Saya</h1>
          <button className="back-to-store-btn" onClick={onSwitchToGuest}>
            ← Kembali ke Toko
          </button>
        </div>
      </div>

      <div className="buyer-dashboard-content">
        {/* Sidebar */}
        <div className="buyer-sidebar">
          <div className="user-profile">
            <div className="user-avatar">👤</div>
            <div className="user-info">
              <h3>John Doe</h3>
              <p>Member Silver</p>
            </div>
          </div>

          <nav className="buyer-nav">
            {menuItems.map((item) => (
              <div
                key={item.id}
                className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
                onClick={() => setActiveTab(item.id)}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
              </div>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div className="buyer-main">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default BuyerDashboard; 