import React, { useState } from 'react';
import SellerHeader from '../../components/SellerHeader';
import ComingSoon from '../../components/ComingSoon';

interface StoreInfo {
  storeName: string;
  storeDescription: string;
  storeAddress: string;
  storePhone: string;
  storeEmail: string;
  storeCategory: string;
  storeLogo: string;
  storeBanner: string;
}

interface StoreSettingsPageProps {
  onBack: () => void;
  onSwitchToGuest: () => void;
}

const StoreSettingsPage: React.FC<StoreSettingsPageProps> = ({ onBack, onSwitchToGuest }) => {
  const [activeTab, setActiveTab] = useState('basic');
  const [storeInfo, setStoreInfo] = useState<StoreInfo>({
    storeName: 'TechStore Premium',
    storeDescription: 'Toko elektronik terpercaya dengan produk berkualitas tinggi',
    storeAddress: 'Jl. Teknologi No. 123, Jakarta Selatan',
    storePhone: '021-12345678',
    storeEmail: 'info@techstore.com',
    storeCategory: 'elektronik',
    storeLogo: 'https://via.placeholder.com/100x100',
    storeBanner: 'https://via.placeholder.com/800x200'
  });

  const [isEditing, setIsEditing] = useState(false);

  const handleSaveStoreInfo = () => {
    // TODO: Implement save store info API
    setIsEditing(false);
    alert('Informasi toko berhasil disimpan!');
  };

  const handleRegisterStore = () => {
    // TODO: Implement store registration logic
    alert('Registrasi toko berhasil! Menunggu verifikasi admin.');
  };

  const renderBasicInfo = () => (
    <div className="store-basic-info">
      <h3>Informasi Dasar Toko</h3>
      
      <div className="store-logos">
        <div className="logo-section">
          <label>Logo Toko</label>
          <div className="logo-upload">
            <img src={storeInfo.storeLogo} alt="Store Logo" />
            <button className="upload-btn">Ubah Logo</button>
          </div>
        </div>
        
        <div className="banner-section">
          <label>Banner Toko</label>
          <div className="banner-upload">
            <img src={storeInfo.storeBanner} alt="Store Banner" />
            <button className="upload-btn">Ubah Banner</button>
          </div>
        </div>
      </div>

      <div className="store-form">
        <div className="form-group">
          <label>Nama Toko *</label>
          <input
            type="text"
            value={storeInfo.storeName}
            disabled={!isEditing}
            onChange={(e) => setStoreInfo({...storeInfo, storeName: e.target.value})}
            placeholder="Masukkan nama toko"
          />
        </div>
        
        <div className="form-group">
          <label>Kategori Toko *</label>
          <select
            value={storeInfo.storeCategory}
            disabled={!isEditing}
            onChange={(e) => setStoreInfo({...storeInfo, storeCategory: e.target.value})}
          >
            <option value="">Pilih Kategori</option>
            <option value="elektronik">Elektronik</option>
            <option value="fashion">Fashion</option>
            <option value="makanan">Makanan & Minuman</option>
            <option value="rumah-tangga">Rumah Tangga</option>
            <option value="kesehatan">Kesehatan & Kecantikan</option>
            <option value="olahraga">Olahraga</option>
            <option value="otomotif">Otomotif</option>
            <option value="lainnya">Lainnya</option>
          </select>
        </div>
        
        <div className="form-group">
          <label>Deskripsi Toko</label>
          <textarea
            value={storeInfo.storeDescription}
            disabled={!isEditing}
            onChange={(e) => setStoreInfo({...storeInfo, storeDescription: e.target.value})}
            placeholder="Deskripsikan toko Anda"
            rows={4}
          />
        </div>
        
        <div className="form-group">
          <label>Alamat Toko *</label>
          <textarea
            value={storeInfo.storeAddress}
            disabled={!isEditing}
            onChange={(e) => setStoreInfo({...storeInfo, storeAddress: e.target.value})}
            placeholder="Alamat lengkap toko"
            rows={3}
          />
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label>Nomor Telepon Toko *</label>
            <input
              type="text"
              value={storeInfo.storePhone}
              disabled={!isEditing}
              onChange={(e) => setStoreInfo({...storeInfo, storePhone: e.target.value})}
              placeholder="021-12345678"
            />
          </div>
          
          <div className="form-group">
            <label>Email Toko</label>
            <input
              type="email"
              value={storeInfo.storeEmail}
              disabled={!isEditing}
              onChange={(e) => setStoreInfo({...storeInfo, storeEmail: e.target.value})}
              placeholder="info@tokosaya.com"
            />
          </div>
        </div>
      </div>

      <div className="form-actions">
        {isEditing ? (
          <>
            <button onClick={handleSaveStoreInfo} className="save-button">
              Simpan Perubahan
            </button>
            <button onClick={() => setIsEditing(false)} className="cancel-button">
              Batal
            </button>
          </>
        ) : (
          <button onClick={() => setIsEditing(true)} className="edit-button">
            Edit Informasi Toko
          </button>
        )}
      </div>
    </div>
  );

  const renderOperationalSettings = () => (
    <div className="operational-settings">
      <h3>Pengaturan Operasional</h3>
      
      <div className="setting-section">
        <h4>Jam Operasional</h4>
        <div className="time-settings">
          <div className="time-group">
            <label>Senin - Jumat</label>
            <div className="time-inputs">
              <input type="time" defaultValue="09:00" />
              <span>-</span>
              <input type="time" defaultValue="17:00" />
            </div>
          </div>
          
          <div className="time-group">
            <label>Sabtu - Minggu</label>
            <div className="time-inputs">
              <input type="time" defaultValue="10:00" />
              <span>-</span>
              <input type="time" defaultValue="15:00" />
            </div>
          </div>
        </div>
      </div>

      <div className="setting-section">
        <h4>Pengaturan Pengiriman</h4>
        <div className="shipping-settings">
          <label className="setting-item">
            <input type="checkbox" defaultChecked />
            <span>Gratis ongkir minimal pembelian Rp 100.000</span>
          </label>
          
          <label className="setting-item">
            <input type="checkbox" />
            <span>Tersedia pengiriman same day</span>
          </label>
          
          <label className="setting-item">
            <input type="checkbox" defaultChecked />
            <span>Tersedia pickup di toko</span>
          </label>
        </div>
      </div>

      <div className="setting-section">
        <h4>Kebijakan Toko</h4>
        <div className="policy-settings">
          <div className="form-group">
            <label>Kebijakan Return</label>
            <select>
              <option>7 hari</option>
              <option>14 hari</option>
              <option>30 hari</option>
              <option>Tidak menerima return</option>
            </select>
          </div>
          
          <div className="form-group">
            <label>Garansi Produk</label>
            <select>
              <option>Sesuai garansi resmi</option>
              <option>Garansi toko 1 bulan</option>
              <option>Garansi toko 3 bulan</option>
              <option>Tanpa garansi</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPaymentSettings = () => (
    <div className="payment-settings">
      <h3>Pengaturan Pembayaran</h3>
      
      <div className="bank-account">
        <h4>Rekening Bank</h4>
        <div className="bank-form">
          <div className="form-group">
            <label>Nama Bank</label>
            <select>
              <option>BCA</option>
              <option>Mandiri</option>
              <option>BNI</option>
              <option>BRI</option>
              <option>CIMB Niaga</option>
            </select>
          </div>
          
          <div className="form-group">
            <label>Nomor Rekening</label>
            <input type="text" placeholder="1234567890" />
          </div>
          
          <div className="form-group">
            <label>Nama Pemilik Rekening</label>
            <input type="text" placeholder="Nama sesuai rekening" />
          </div>
        </div>
      </div>

      <div className="withdrawal-settings">
        <h4>Pengaturan Pencairan</h4>
        <div className="withdrawal-form">
          <label className="setting-item">
            <input type="radio" name="withdrawal" value="auto" defaultChecked />
            <span>Otomatis setiap hari Jumat</span>
          </label>
          
          <label className="setting-item">
            <input type="radio" name="withdrawal" value="manual" />
            <span>Manual (tarik saldo sendiri)</span>
          </label>
          
          <div className="form-group">
            <label>Minimum Saldo untuk Pencairan</label>
            <input type="number" defaultValue="100000" />
          </div>
        </div>
      </div>
    </div>
  );

  const renderStoreRegistration = () => (
    <div className="store-registration">
      <h3>Registrasi Toko</h3>
      
      <div className="registration-info">
        <div className="info-card">
          <h4>📋 Syarat Registrasi Toko</h4>
          <ul>
            <li>Informasi toko lengkap dan valid</li>
            <li>Upload logo dan banner toko</li>
            <li>Verifikasi identitas pemilik</li>
            <li>Alamat toko yang jelas</li>
            <li>Nomor telepon aktif</li>
          </ul>
        </div>
        
        <div className="info-card">
          <h4>✅ Keuntungan Toko Terverifikasi</h4>
          <ul>
            <li>Badge toko terpercaya</li>
            <li>Prioritas dalam pencarian</li>
            <li>Akses fitur marketing</li>
            <li>Analytics penjualan detail</li>
            <li>Customer support prioritas</li>
          </ul>
        </div>
      </div>

      <div className="registration-steps">
        <h4>Status Registrasi</h4>
        <div className="step-list">
          <div className="step completed">
            <span className="step-number">1</span>
            <span>Buat akun penjual</span>
            <span className="status">✓</span>
          </div>
          
          <div className="step in-progress">
            <span className="step-number">2</span>
            <span>Lengkapi informasi toko</span>
            <span className="status">📝</span>
          </div>
          
          <div className="step pending">
            <span className="step-number">3</span>
            <span>Verifikasi admin</span>
            <span className="status">⏳</span>
          </div>
          
          <div className="step pending">
            <span className="step-number">4</span>
            <span>Toko aktif</span>
            <span className="status">🎉</span>
          </div>
        </div>
      </div>

      <div className="registration-action">
        <button onClick={handleRegisterStore} className="register-button">
          Submit Registrasi Toko
        </button>
        <p className="note">
          Setelah submit, tim kami akan memverifikasi informasi toko Anda dalam 1-3 hari kerja.
        </p>
      </div>
    </div>
  );

  const handleNotifyMe = () => {
    alert('Kami akan mengirim email notifikasi ketika fitur ini sudah tersedia!');
  };

  const renderShippingSettings = () => (
    <ComingSoon 
      feature="shipping"
      estimatedDate="Maret 2025"
      onNotifyMe={handleNotifyMe}
    />
  );

  const renderStoreProfile = () => (
    <ComingSoon 
      feature="profile"
      estimatedDate="April 2025"
      onNotifyMe={handleNotifyMe}
    />
  );

  const renderStorefront = () => (
    <ComingSoon 
      feature="storefront"
      estimatedDate="Mei 2025"
      onNotifyMe={handleNotifyMe}
    />
  );

  return (
    <div className="store-settings-page">
      <SellerHeader onSwitchToGuest={onSwitchToGuest} />
      
      <div className="settings-container">
        <div className="settings-header">
          <button onClick={onBack} className="back-button">
            ← Kembali ke Dashboard
          </button>
          <h2>Pengaturan Toko</h2>
        </div>

        <div className="settings-content">
          <div className="settings-tabs">
            <button 
              className={activeTab === 'basic' ? 'active' : ''}
              onClick={() => setActiveTab('basic')}
            >
              Informasi Dasar
            </button>
            <button 
              className={activeTab === 'operational' ? 'active' : ''}
              onClick={() => setActiveTab('operational')}
            >
              Operasional
            </button>
            <button 
              className={activeTab === 'payment' ? 'active' : ''}
              onClick={() => setActiveTab('payment')}
            >
              Pembayaran
            </button>
            <button 
              className={activeTab === 'registration' ? 'active' : ''}
              onClick={() => setActiveTab('registration')}
            >
              Registrasi Toko
            </button>
            <button 
              className={activeTab === 'shipping' ? 'active' : ''}
              onClick={() => setActiveTab('shipping')}
            >
              Pengaturan Pengiriman
            </button>
            <button 
              className={activeTab === 'profile' ? 'active' : ''}
              onClick={() => setActiveTab('profile')}
            >
              Profil Toko
            </button>
            <button 
              className={activeTab === 'storefront' ? 'active' : ''}
              onClick={() => setActiveTab('storefront')}
            >
              Tampilan Toko
            </button>
          </div>

          <div className="settings-tab-content">
            {activeTab === 'basic' && renderBasicInfo()}
            {activeTab === 'operational' && renderOperationalSettings()}
            {activeTab === 'payment' && renderPaymentSettings()}
            {activeTab === 'registration' && renderStoreRegistration()}
            {activeTab === 'shipping' && renderShippingSettings()}
            {activeTab === 'profile' && renderStoreProfile()}
            {activeTab === 'storefront' && renderStorefront()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoreSettingsPage; 