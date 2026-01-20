import React, { useState } from 'react';
import { User } from '../services/api';
import './AuthModal.css';

interface SellerRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: User) => void;
  currentUser?: User | null;
}

const SellerRegistrationModal: React.FC<SellerRegistrationModalProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess,
  currentUser 
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Form states untuk toko
  const [storeName, setStoreName] = useState('');
  const [storeDescription, setStoreDescription] = useState('');
  const [storeCategory, setStoreCategory] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [accountHolder, setAccountHolder] = useState('');

  const resetForm = () => {
    setStoreName('');
    setStoreDescription('');
    setStoreCategory('');
    setBankAccount('');
    setAccountHolder('');
    setError('');
    setSuccess('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleCreateStore = async () => {
    if (!storeName || !storeDescription || !storeCategory) {
      setError('Nama toko, deskripsi, dan kategori harus diisi');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Simulate API call to create store
      setTimeout(() => {
        // Update user role to include seller
        const updatedUser: User = {
          ...currentUser!,
          role: 'seller', // Update role to seller
        };

        // Store in localStorage for demo
        localStorage.setItem('auth_user', JSON.stringify(updatedUser));

        setSuccess('Toko berhasil dibuat! Selamat datang di UPTOU Seller!');
        setTimeout(() => {
          onSuccess(updatedUser);
          handleClose();
        }, 1500);
        setLoading(false);
      }, 1000);
    } catch (err) {
      setError('Terjadi kesalahan. Silakan coba lagi.');
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const renderLoginPrompt = () => (
    <div className="auth-form">
      <h2>🏪 Mulai Berjualan di UPTOU</h2>
      <div className="register-description">
        <p>📈 Bergabunglah dengan jutaan seller di UPTOU!</p>
        <p>💰 Jual produk Anda dan raih keuntungan maksimal</p>
        <p>🚀 Gratis biaya pendaftaran, tanpa biaya tersembunyi</p>
      </div>
      
      <div className="seller-benefits">
        <h3>Keuntungan Menjadi Seller UPTOU:</h3>
        <ul>
          <li>✅ Jangkauan pembeli di seluruh Indonesia</li>
          <li>✅ Dashboard analytics lengkap</li>
          <li>✅ Sistem pembayaran aman & terpercaya</li>
          <li>✅ Promosi gratis untuk produk unggulan</li>
          <li>✅ Customer service 24/7</li>
        </ul>
      </div>
      
      <p style={{ textAlign: 'center', color: '#666', fontSize: '14px' }}>
        Silakan login atau daftar terlebih dahulu untuk memulai berjualan
      </p>
      
      <button 
        onClick={handleClose}
        className="auth-btn primary"
      >
        Login / Daftar
      </button>
    </div>
  );

  const renderStoreForm = () => (
    <div className="auth-form">
      <h2>🏪 Buat Toko Anda</h2>
      <div className="register-description">
        <p>Halo <strong>{currentUser?.full_name}</strong>! 👋</p>
        <p>Mari buat toko pertama Anda di UPTOU</p>
      </div>

      <div className="form-group">
        <label>Nama Toko *</label>
        <input
          type="text"
          value={storeName}
          onChange={(e) => setStoreName(e.target.value)}
          placeholder="Contoh: Toko Elektronik Jaya"
          disabled={loading}
        />
      </div>

      <div className="form-group">
        <label>Deskripsi Toko *</label>
        <textarea
          value={storeDescription}
          onChange={(e) => setStoreDescription(e.target.value)}
          placeholder="Ceritakan tentang toko Anda..."
          disabled={loading}
          rows={3}
          style={{ resize: 'vertical', fontFamily: 'inherit' }}
        />
      </div>

      <div className="form-group">
        <label>Kategori Utama *</label>
        <select
          value={storeCategory}
          onChange={(e) => setStoreCategory(e.target.value)}
          disabled={loading}
        >
          <option value="">Pilih kategori utama</option>
          <option value="elektronik">Elektronik</option>
          <option value="fashion">Fashion & Pakaian</option>
          <option value="kesehatan">Kesehatan & Kecantikan</option>
          <option value="rumah-tangga">Rumah Tangga</option>
          <option value="olahraga">Olahraga & Outdoor</option>
          <option value="otomotif">Otomotif</option>
          <option value="hobi">Hobi & Koleksi</option>
          <option value="makanan">Makanan & Minuman</option>
          <option value="buku">Buku & Alat Tulis</option>
          <option value="lainnya">Lainnya</option>
        </select>
      </div>

      <div className="form-group">
        <label>Nomor Rekening Bank</label>
        <input
          type="text"
          value={bankAccount}
          onChange={(e) => setBankAccount(e.target.value)}
          placeholder="1234567890"
          disabled={loading}
        />
      </div>

      <div className="form-group">
        <label>Nama Pemilik Rekening</label>
        <input
          type="text"
          value={accountHolder}
          onChange={(e) => setAccountHolder(e.target.value)}
          placeholder="Sesuai nama di rekening bank"
          disabled={loading}
        />
      </div>

      <button 
        onClick={handleCreateStore}
        disabled={loading}
        className="auth-btn primary"
      >
        {loading ? 'Membuat Toko...' : '🚀 Buat Toko Sekarang'}
      </button>
      
      <button 
        onClick={handleClose}
        className="auth-btn secondary"
      >
        Batal
      </button>
    </div>
  );

  return (
    <div className="auth-modal-overlay" onClick={handleClose}>
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={handleClose}>
          ×
        </button>
        
        {currentUser ? renderStoreForm() : renderLoginPrompt()}
        
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
      </div>
    </div>
  );
};

export default SellerRegistrationModal; 