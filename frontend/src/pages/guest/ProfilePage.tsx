import React, { useState, useEffect } from 'react';
import { apiService, ProfileData, UpdateProfileRequest, buildServerUrl, Address, AddAddressRequest } from '../../services/api';
import './ProfilePage.css';

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState('biodata');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);
  
  // Address Management States
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [addressForm, setAddressForm] = useState<AddAddressRequest>({
    recipient_name: '',
    phone_number: '',
    address_line1: '',
    address_line2: '',
    city: '',
    province: '',
    postal_code: '',
    label: 'Rumah',
    is_primary: false
  });

  const [profileData, setProfileData] = useState<ProfileData>({
    id: '',
    email: '',
    full_name: '',
    phone: '',
    bio: '',
    date_of_birth: undefined,
    gender: '',
    avatar_url: '',
    email_verified: false,
    phone_verified: false,
    email_verified_at: undefined,
    phone_verified_at: undefined,
    two_factor_enabled: false,
    security_settings: {},
    notification_preferences: {},
    display_preferences: {},
    profile_completion: 0,
    created_at: '',
    updated_at: ''
  });

  // Form data for editing
  const [formData, setFormData] = useState<UpdateProfileRequest>({});

  // Load profile data on component mount
  useEffect(() => {
    loadProfile();
    loadAddresses();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Check if user is authenticated
      const token = localStorage.getItem('auth_token');
      if (!token || !apiService.isAuthenticated()) {
        // Not authenticated - show login option
        setIsDemoMode(true);
        setError('Anda belum login. Silakan login untuk melihat profil Anda.');
        return;
      }

      // Real API call
      console.log('Making API call with token:', token?.substring(0, 20) + '...');
      const response = await apiService.getProfile();
      
      console.log('API Response:', response);
      
      if (response.error) {
        if (response.message.includes('Unauthorized') || response.message.includes('Invalid token')) {
          // Token expired or invalid
          localStorage.removeItem('auth_token');
          setError('Sesi Anda telah berakhir. Silakan login kembali.');
          setIsDemoMode(true);
        } else {
          setError(response.message);
        }
        return;
      }

      if (response.data) {
        setIsDemoMode(false);
        setProfileData(response.data);
        // Initialize form data with current profile data
        setFormData({
          full_name: response.data.full_name,
          phone: response.data.phone,
          bio: response.data.bio,
          date_of_birth: response.data.date_of_birth ? response.data.date_of_birth.split('T')[0] : '',
          gender: response.data.gender,
          avatar_url: response.data.avatar_url
        });
      }
    } catch (err) {
      console.error('Error loading profile:', err);
      setError('Gagal memuat data profil. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  // Function to handle quick login for testing
  const handleQuickLogin = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Request OTP
      const otpResponse = await apiService.login('albertuscristian10969@gmail.com');
      
      if (otpResponse.error) {
        setError('Gagal mengirim OTP: ' + otpResponse.message);
        return;
      }
      
      // Auto verify with the OTP (for demo purposes)
      if (otpResponse.data && otpResponse.data.otp) {
        const verifyResponse = await apiService.verifyOTP('albertuscristian10969@gmail.com', otpResponse.data.otp);
        
        if (verifyResponse.error) {
          setError('Gagal verifikasi OTP: ' + verifyResponse.message);
          return;
        }
        
        if (verifyResponse.data && verifyResponse.data.token) {
          localStorage.setItem('auth_token', verifyResponse.data.token);
          setSuccess('Login berhasil! Memuat profil...');
          setTimeout(() => {
            setSuccess(null);
            loadProfile(); // Reload profile with authentication
          }, 1000);
        }
      }
    } catch (err) {
      console.error('Error during login:', err);
      setError('Gagal login. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  // Function to handle new user registration
  const handleRegisterNew = async () => {
    try {
      setLoading(true);
      setError(null);
      const timestamp = Date.now();
      const randomEmail = `user${timestamp}@test.com`;
      const randomName = `User ${timestamp.toString().slice(-4)}`;
      const registerResponse = await apiService.register({
        email: randomEmail,
        full_name: randomName,
        phone: ''
      });
      
      if (registerResponse.error) {
        setError('Gagal register: ' + registerResponse.message);
        return;
      }

      if (registerResponse.data && registerResponse.data.email && registerResponse.data.otp) {
        const verifyResponse = await apiService.verifyRegistrationOTP(
          registerResponse.data.email,
          registerResponse.data.otp
        );

        if (verifyResponse.error) {
          setError('Gagal verifikasi OTP registrasi: ' + verifyResponse.message);
          return;
        }

        if (verifyResponse.data && verifyResponse.data.token) {
          localStorage.setItem('auth_token', verifyResponse.data.token);
        }

        setSuccess(`Akun baru berhasil dibuat! Email: ${randomEmail}`);
        setTimeout(() => {
          setSuccess(null);
          loadProfile();
        }, 2000);
      }
    } catch (err) {
      console.error('Error during registration:', err);
      setError('Gagal membuat akun baru. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setError(null);
    setSuccess(null);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      // Demo mode: simulate save
      if (isDemoMode) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Update local profile data
        const updatedProfile = {
          ...profileData,
          full_name: formData.full_name || profileData.full_name,
          phone: formData.phone || profileData.phone,
          bio: formData.bio || profileData.bio,
          date_of_birth: formData.date_of_birth ? formData.date_of_birth + 'T00:00:00Z' : profileData.date_of_birth,
          gender: formData.gender || profileData.gender,
          updated_at: new Date().toISOString()
        };
        
        // Recalculate profile completion
        let completion = 0;
        if (updatedProfile.full_name) completion += 20;
        if (updatedProfile.email) completion += 20;
        if (updatedProfile.phone) completion += 15;
        if (updatedProfile.bio) completion += 15;
        if (updatedProfile.date_of_birth) completion += 10;
        if (updatedProfile.gender) completion += 10;
        if (updatedProfile.email_verified) completion += 5;
        if (updatedProfile.phone_verified) completion += 5;
        
        updatedProfile.profile_completion = completion;
        
        setProfileData(updatedProfile);
        setIsEditing(false);
        setSuccess('Profil berhasil diperbarui! (Demo Mode)');
        setTimeout(() => setSuccess(null), 3000);
        return;
      }

      // Filter out empty/unchanged values
      const updateData: UpdateProfileRequest = {};
      
      if (formData.full_name && formData.full_name !== profileData.full_name) {
        updateData.full_name = formData.full_name;
      }
      if (formData.phone && formData.phone !== profileData.phone) {
        updateData.phone = formData.phone;
      }
      if (formData.bio !== undefined && formData.bio !== profileData.bio) {
        updateData.bio = formData.bio;
      }
      if (formData.date_of_birth && formData.date_of_birth !== profileData.date_of_birth?.split('T')[0]) {
        updateData.date_of_birth = formData.date_of_birth;
      }
      if (formData.gender && formData.gender !== profileData.gender) {
        updateData.gender = formData.gender;
      }

      // If no changes, just exit edit mode
      if (Object.keys(updateData).length === 0) {
        setIsEditing(false);
        setSuccess('Tidak ada perubahan untuk disimpan');
        return;
      }

      const response = await apiService.updateProfile(updateData);
      
      if (response.error) {
        setError(response.message);
        return;
      }

      if (response.data) {
        setProfileData(response.data);
        setIsEditing(false);
        setSuccess('Profil berhasil diperbarui!');
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Gagal menyimpan perubahan profil');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setError(null);
    setSuccess(null);
    
    // Reset form data to original values
    setFormData({
      full_name: profileData.full_name,
      phone: profileData.phone,
      bio: profileData.bio,
      date_of_birth: profileData.date_of_birth ? profileData.date_of_birth.split('T')[0] : '',
      gender: profileData.gender,
      avatar_url: profileData.avatar_url
    });
  };

  const handleInputChange = (field: keyof UpdateProfileRequest, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('File harus berupa gambar');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Ukuran file maksimal 5MB');
      return;
    }

    try {
      setError(null);
      const response = await apiService.uploadAvatar(file);
      
      if (response.error) {
        setError(response.message);
        return;
      }

      if (response.data) {
        // Update profile data with new avatar URL
        setProfileData(prev => ({
          ...prev,
          avatar_url: response.data!.avatar_url
        }));
        setSuccess('Avatar berhasil diperbarui!');
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err) {
      console.error('Error uploading avatar:', err);
      setError('Gagal mengupload avatar');
    }
  };

  // Address Management Functions
  const loadAddresses = async () => {
    try {
      const res = await apiService.getAddresses();
      if (!res.error && res.data && Array.isArray(res.data)) {
        setAddresses(res.data);
      } else {
        console.warn('Addresses response data is not an array:', res.data);
        setAddresses([]);
      }
    } catch (err) {
      console.error('Failed to load addresses:', err);
      setAddresses([]);
    }
  };

  useEffect(() => {
    if (activeTab === 'alamat') {
      loadAddresses();
    }
  }, [activeTab]);

  const handleAddAddress = () => {
    if (addresses.length >= 3) {
      alert('Maksimal 3 alamat');
      return;
    }
    setEditingAddressId(null);
    setAddressForm({
      recipient_name: '',
      phone_number: '',
      address_line1: '',
      address_line2: '',
      city: '',
      province: '',
      postal_code: '',
      label: 'Rumah',
      is_primary: addresses.length === 0
    });
    setIsAddressModalOpen(true);
  };

  const handleEditAddress = (address: Address) => {
    setEditingAddressId(address.id);
    setAddressForm({
      recipient_name: address.recipient_name,
      phone_number: address.phone_number,
      address_line1: address.address_line1,
      address_line2: address.address_line2 || '',
      city: address.city,
      province: address.province,
      postal_code: address.postal_code,
      label: address.label,
      is_primary: address.is_primary
    });
    setIsAddressModalOpen(true);
  };

  const handleDeleteAddress = async (id: string) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus alamat ini?')) return;
    
    try {
      const res = await apiService.deleteAddress(id);
      if (!res.error) {
        setAddresses(addresses.filter(a => a.id !== id));
      } else {
        alert(res.message);
      }
    } catch (err: any) {
      alert(err.message || 'Gagal menghapus alamat');
    }
  };

  const handleSaveAddress = async () => {
    // Validate form
    if (!addressForm.recipient_name || !addressForm.phone_number || !addressForm.address_line1 || !addressForm.city || !addressForm.province || !addressForm.postal_code) {
      alert('Mohon lengkapi semua field yang wajib diisi');
      return;
    }

    setSaving(true);
    try {
      let res;
      if (editingAddressId) {
        res = await apiService.updateAddress(editingAddressId, addressForm);
      } else {
        res = await apiService.addAddress(addressForm);
      }

      if (!res.error && res.data) {
        const savedAddress = res.data;
        if (editingAddressId) {
          setAddresses(addresses.map(a => a.id === editingAddressId ? savedAddress : a));
        } else {
          setAddresses([...addresses, savedAddress]);
        }
        setIsAddressModalOpen(false);
        loadAddresses(); // Reload to ensure correct order/primary status
      } else {
        alert(res.message);
      }
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan alamat');
    } finally {
      setSaving(false);
    }
  };

  const getAvatarUrl = () => {
    if (profileData.avatar_url) {
      // If it's a full URL, use it directly
      if (profileData.avatar_url.startsWith('http')) {
        return profileData.avatar_url;
      }
      // Otherwise, prepend base URL
      return buildServerUrl(profileData.avatar_url);
    }
    
    // Generate avatar with initials
    const initials = profileData.full_name ? profileData.full_name.charAt(0).toUpperCase() : 'U';
    return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%2303A6A1'/%3E%3Ctext x='50' y='60' font-family='Arial' font-size='40' font-weight='bold' fill='white' text-anchor='middle'%3E${initials}%3C/text%3E%3C/svg%3E`;
  };

  if (loading) {
    return (
      <div className="profile-page">
        <div className="profile-loading">
          <div className="loading-spinner"></div>
          <p>Memuat data profil...</p>
        </div>
      </div>
    );
  }

  // Show login form if not authenticated
  if (isDemoMode && !profileData.id) {
    return (
      <div className="profile-page">
        <div className="profile-header">
          <div className="container">
            <button className="back-button" onClick={() => window.history.back()}>
              ← Kembali
            </button>
            <h2>Profil</h2>
          </div>
        </div>

        <div className="profile-content">
          <div className="login-section">
            <div className="login-card">
              <h3>Login Diperlukan</h3>
              
              {error && (
                <div className="alert alert-error">
                  {error}
                </div>
              )}
              
              {success && (
                <div className="alert alert-success">
                  {success}
                </div>
              )}

              <p>Untuk melihat dan mengedit profil Anda, silakan login terlebih dahulu.</p>
              
              <button 
                className="btn-primary" 
                onClick={handleQuickLogin}
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '12px',
                  marginTop: '16px',
                  backgroundColor: '#03A6A1',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1
                }}
              >
                {loading ? 'Memproses...' : 'Login Sebagai Cristian'}
              </button>
              
              <div style={{ margin: '16px 0', textAlign: 'center', color: '#666' }}>
                atau
              </div>
              
              <button 
                className="btn-secondary" 
                onClick={handleRegisterNew}
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: '#f8f9fa',
                  color: '#03A6A1',
                  border: '2px solid #03A6A1',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1
                }}
              >
                {loading ? 'Memproses...' : 'Buat Akun Baru (Profil Kosong)'}
              </button>
              
              <p style={{ fontSize: '14px', color: '#666', marginTop: '12px', textAlign: 'center' }}>
                Demo: Login dengan akun existing atau buat akun baru dengan profil kosong
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const renderBiodataTab = () => (
    <div className="profile-form-section">
      <h3 className="form-section-title">Ubah Biodata Diri</h3>
      
      {/* Error/Success Messages */}
      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}
      
      {success && (
        <div className="alert alert-success">
          {success}
        </div>
      )}

      <div className="user-info-section">
        <div className="user-avatar">
          <img src={getAvatarUrl()} alt="Avatar" />
          <label className="change-photo-btn">
            Pilih Foto
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              style={{ display: 'none' }}
            />
          </label>
        </div>
        <div className="user-basic-info">
          <h3>{profileData.full_name || 'Nama tidak tersedia'}</h3>
          <p>📧 {profileData.email}</p>
          <p>📱 {profileData.phone || 'Nomor HP belum diisi'}</p>
          <div className="profile-completion">
            <p>Kelengkapan Profil: {profileData.profile_completion}%</p>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${profileData.profile_completion}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      <div className="form-grid">
        <div className="form-field">
          <label>Nama *</label>
          <input
            type="text"
            value={isEditing ? (formData.full_name || '') : profileData.full_name}
            disabled={!isEditing}
            onChange={(e) => handleInputChange('full_name', e.target.value)}
            placeholder="Masukkan nama lengkap"
          />
          <small style={{ color: '#03A6A1', marginTop: '4px' }}>
            {isEditing ? 'Masukkan nama lengkap Anda' : 'Klik ubah untuk mengedit'}
          </small>
        </div>

        <div className="form-field">
          <label>Tanggal Lahir</label>
          <input
            type="date"
            value={isEditing ? (formData.date_of_birth || '') : (profileData.date_of_birth?.split('T')[0] || '')}
            disabled={!isEditing}
            onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
          />
          <small style={{ color: '#03A6A1', marginTop: '4px' }}>
            {profileData.date_of_birth ? 'Ubah tanggal lahir' : 'Tambah Tanggal Lahir'}
          </small>
        </div>

        <div className="form-field">
          <label>Jenis Kelamin</label>
          <select
            value={isEditing ? (formData.gender || '') : profileData.gender}
            disabled={!isEditing}
            onChange={(e) => handleInputChange('gender', e.target.value)}
          >
            <option value="">Pilih jenis kelamin</option>
            <option value="male">Laki-laki</option>
            <option value="female">Perempuan</option>
            <option value="other">Lainnya</option>
          </select>
          <small style={{ color: '#03A6A1', marginTop: '4px' }}>
            {profileData.gender ? 'Ubah jenis kelamin' : 'Tambah Jenis Kelamin'}
          </small>
        </div>

        <div className="form-field full-width">
          <h4 style={{ margin: '24px 0 16px 0', fontSize: '16px', fontWeight: '600' }}>Ubah Kontak</h4>
        </div>

        <div className="form-field">
          <label>Email</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="email"
              value={profileData.email}
              disabled={true}
              style={{ backgroundColor: '#f5f5f5' }}
            />
            <span style={{ 
              color: profileData.email_verified ? '#34c759' : '#ff6b6b', 
              fontSize: '12px', 
              fontWeight: '600' 
            }}>
              {profileData.email_verified ? 'Terverifikasi' : 'Belum Terverifikasi'}
            </span>
          </div>
          <small style={{ color: '#666', marginTop: '4px' }}>
            Email tidak dapat diubah untuk keamanan akun
          </small>
        </div>

        <div className="form-field">
          <label>Nomor HP</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="tel"
              value={isEditing ? (formData.phone || '') : profileData.phone}
              disabled={!isEditing}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="Masukkan nomor HP"
            />
            <span style={{ 
              color: profileData.phone_verified ? '#34c759' : '#ff6b6b', 
              fontSize: '12px', 
              fontWeight: '600' 
            }}>
              {profileData.phone_verified ? 'Terverifikasi' : 'Belum Terverifikasi'}
            </span>
          </div>
          <small style={{ color: '#03A6A1', marginTop: '4px' }}>
            {isEditing ? 'Masukkan nomor HP yang valid' : 'Klik ubah untuk mengedit'}
          </small>
        </div>

        <div className="form-field full-width">
          <label>Bio</label>
          <textarea
            rows={3}
            value={isEditing ? (formData.bio || '') : profileData.bio}
            disabled={!isEditing}
            onChange={(e) => handleInputChange('bio', e.target.value)}
            placeholder="Ceritakan sedikit tentang Anda..."
          />
          <small style={{ color: '#03A6A1', marginTop: '4px' }}>
            {isEditing ? 'Maksimal 500 karakter' : (profileData.bio ? 'Ubah bio' : 'Tambah Bio')}
          </small>
        </div>
      </div>

      {isEditing && (
        <div className="edit-actions">
          <button className="btn-secondary" onClick={handleCancel} disabled={saving}>
            Batal
          </button>
          <button className="btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Menyimpan...' : 'Simpan'}
          </button>
        </div>
      )}

      {!isEditing && (
        <div style={{ marginTop: '24px' }}>
          <button className="btn-primary" onClick={handleEdit}>
            Ubah Biodata
          </button>
        </div>
      )}

      <div style={{ marginTop: '32px', padding: '20px', background: '#f8f9fa', borderRadius: '8px', border: '1px solid #e9ecef' }}>
        <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: '600' }}>🔒 Keamanan Akun</h4>
        <p style={{ margin: '0 0 12px 0', fontSize: '12px', color: '#666' }}>
          Tingkatkan keamanan akun Anda dengan verifikasi dua faktor
        </p>
        <button 
          style={{ 
            background: 'transparent', 
            border: 'none', 
            color: '#03A6A1', 
            fontSize: '14px', 
            cursor: 'pointer', 
            padding: '0',
            textDecoration: 'underline'
          }}
          onClick={() => setActiveTab('keamanan')}
        >
          Atur Keamanan
        </button>
      </div>
    </div>
  );

  const renderAlamatTab = () => (
    <div className="address-section">
      <div className="address-header">
        <h3>Daftar Alamat</h3>
        {addresses.length < 3 && (
          <button className="btn-add-address" onClick={handleAddAddress}>
            + Tambah Alamat Baru
          </button>
        )}
      </div>

      <div className="address-list">
        {addresses.length === 0 ? (
          <div style={{ padding: '20px', textAlign: 'center', color: '#666', border: '1px dashed #ddd', borderRadius: '8px' }}>
            Belum ada alamat tersimpan. Silakan tambah alamat baru.
          </div>
        ) : (
          addresses.map((address) => (
            <div key={address.id} className="address-item">
              <div className="address-item-header">
                <div>
                  <h4 className="address-label">
                    {address.label || 'Alamat'}
                    {address.is_primary && <span className="default-badge">Utama</span>}
                  </h4>
                </div>
                <div className="address-actions">
                  <button className="btn-edit" onClick={() => handleEditAddress(address)}>Ubah</button>
                  <button className="btn-delete" onClick={() => handleDeleteAddress(address.id)}>Hapus</button>
                </div>
              </div>
              <div className="address-details">
                <p>
                  {address.recipient_name} | {address.phone_number}
                </p>
                <p>{address.address_line1}</p>
                {address.address_line2 && <p>{address.address_line2}</p>}
                <p>
                  {address.city}, {address.province}, {address.postal_code}
                </p>
                <p>{address.country}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const renderPembayaranTab = () => (
    <div className="profile-form-section">
      <h3 className="form-section-title">Pembayaran</h3>
      <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
        <p>🏦 Fitur pembayaran akan segera hadir</p>
        <p>Anda akan dapat menambahkan kartu kredit, e-wallet, dan metode pembayaran lainnya</p>
      </div>
    </div>
  );

  const renderRekeningBankTab = () => (
    <div className="profile-form-section">
      <h3 className="form-section-title">Rekening Bank</h3>
      <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
        <p>💳 Fitur rekening bank akan segera hadir</p>
        <p>Anda akan dapat menambahkan rekening bank untuk menerima pembayaran</p>
      </div>
    </div>
  );

  const renderNotifikasiTab = () => (
    <div className="profile-form-section">
      <h3 className="form-section-title">Notifikasi</h3>
      <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
        <p>🔔 Fitur notifikasi akan segera hadir</p>
        <p>Anda akan dapat mengatur preferensi notifikasi</p>
      </div>
    </div>
  );

  const renderModeTampilanTab = () => (
    <div className="profile-form-section">
      <h3 className="form-section-title">Mode Tampilan</h3>
      <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
        <p>🌙 Fitur mode tampilan akan segera hadir</p>
        <p>Anda akan dapat beralih antara mode terang dan gelap</p>
      </div>
    </div>
  );

  const renderKeamananTab = () => (
    <div className="security-section">
      <h3 className="form-section-title">Keamanan Akun</h3>
      
      <div className="security-list">
        <div className="security-item">
          <div className="security-info">
            <h4>Kata Sandi</h4>
            <p>Terakhir diubah 3 bulan yang lalu</p>
          </div>
          <div className="security-status">
            <span className="status-verified">✓ Aman</span>
            <button className="btn-security">Ubah</button>
          </div>
        </div>

        <div className="security-item">
          <div className="security-info">
            <h4>Autentikasi 2 Langkah</h4>
            <p>Tambahan keamanan untuk akun Anda</p>
          </div>
          <div className="security-status">
            <span className="status-unverified">! Belum Aktif</span>
            <button className="btn-security">Aktifkan</button>
          </div>
        </div>

        <div className="security-item">
          <div className="security-info">
            <h4>Verifikasi Email</h4>
            <p>{profileData.email}</p>
          </div>
          <div className="security-status">
            <span className="status-verified">✓ Terverifikasi</span>
          </div>
        </div>

        <div className="security-item">
          <div className="security-info">
            <h4>Verifikasi Nomor HP</h4>
            <p>{profileData.phone}</p>
          </div>
          <div className="security-status">
            <span className="status-verified">✓ Terverifikasi</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="profile-page">
      <div className="profile-header">
        <div className="container">
          <button className="back-button">
            ← Kembali
          </button>
          <h2>{profileData.full_name || 'Profil'}</h2>
        </div>
      </div>

      <div className="profile-content">
        <div className="profile-tabs">
          <button 
            className={activeTab === 'biodata' ? 'active' : ''} 
            onClick={() => setActiveTab('biodata')}
          >
            Biodata Diri
          </button>
          <button 
            className={activeTab === 'alamat' ? 'active' : ''} 
            onClick={() => setActiveTab('alamat')}
          >
            Daftar Alamat
          </button>
          <button 
            className={activeTab === 'pembayaran' ? 'active' : ''} 
            onClick={() => setActiveTab('pembayaran')}
          >
            Pembayaran
          </button>
          <button 
            className={activeTab === 'rekening' ? 'active' : ''} 
            onClick={() => setActiveTab('rekening')}
          >
            Rekening Bank
          </button>
          <button 
            className={activeTab === 'notifikasi' ? 'active' : ''} 
            onClick={() => setActiveTab('notifikasi')}
          >
            Notifikasi
          </button>
          <button 
            className={activeTab === 'tampilan' ? 'active' : ''} 
            onClick={() => setActiveTab('tampilan')}
          >
            Mode Tampilan
          </button>
          <button 
            className={activeTab === 'keamanan' ? 'active' : ''} 
            onClick={() => setActiveTab('keamanan')}
          >
            Keamanan
          </button>
        </div>

        <div className="profile-tab-content">
          {activeTab === 'biodata' && renderBiodataTab()}
          {activeTab === 'alamat' && renderAlamatTab()}
          {activeTab === 'pembayaran' && renderPembayaranTab()}
          {activeTab === 'rekening' && renderRekeningBankTab()}
          {activeTab === 'notifikasi' && renderNotifikasiTab()}
          {activeTab === 'tampilan' && renderModeTampilanTab()}
          {activeTab === 'keamanan' && renderKeamananTab()}
        </div>
      </div>

      {/* Address Modal */}
      {isAddressModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{editingAddressId ? 'Ubah Alamat' : 'Tambah Alamat Baru'}</h3>
              <button className="close-modal-btn" onClick={() => setIsAddressModalOpen(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Label Alamat (Rumah, Kantor, Kost, dll)</label>
                <input
                  type="text"
                  className="form-input"
                  value={addressForm.label || ''}
                  onChange={(e) => setAddressForm({ ...addressForm, label: e.target.value })}
                  placeholder="Contoh: Rumah"
                />
              </div>

              <div className="form-group">
                <label>Nama Penerima</label>
                <input
                  type="text"
                  className="form-input"
                  value={addressForm.recipient_name}
                  onChange={(e) => setAddressForm({ ...addressForm, recipient_name: e.target.value })}
                  placeholder="Nama Lengkap"
                />
              </div>

              <div className="form-group">
                <label>Nomor HP</label>
                <input
                  type="tel"
                  className="form-input"
                  value={addressForm.phone_number}
                  onChange={(e) => setAddressForm({ ...addressForm, phone_number: e.target.value })}
                  placeholder="08xxxxxxxxxx"
                />
              </div>

              <div className="form-group">
                <label>Alamat Lengkap</label>
                <textarea
                  className="form-input"
                  value={addressForm.address_line1}
                  onChange={(e) => setAddressForm({ ...addressForm, address_line1: e.target.value })}
                  placeholder="Nama Jalan, Gedung, No. Rumah"
                  rows={3}
                />
              </div>

              <div className="form-group">
                <label>Detail Lainnya (Opsional)</label>
                <input
                  type="text"
                  className="form-input"
                  value={addressForm.address_line2 || ''}
                  onChange={(e) => setAddressForm({ ...addressForm, address_line2: e.target.value })}
                  placeholder="Blok / Unit No., Patokan"
                />
              </div>

              <div className="form-group">
                <label>Kota / Kabupaten</label>
                <input
                  type="text"
                  className="form-input"
                  value={addressForm.city}
                  onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                  placeholder="Masukkan Kota"
                />
              </div>

              <div className="form-group">
                <label>Provinsi</label>
                <input
                  type="text"
                  className="form-input"
                  value={addressForm.province}
                  onChange={(e) => setAddressForm({ ...addressForm, province: e.target.value })}
                  placeholder="Masukkan Provinsi"
                />
              </div>

              <div className="form-group">
                <label>Kode Pos</label>
                <input
                  type="text"
                  className="form-input"
                  value={addressForm.postal_code}
                  onChange={(e) => setAddressForm({ ...addressForm, postal_code: e.target.value })}
                  placeholder="Masukkan Kode Pos"
                />
              </div>

              <div className="form-group">
                <label className="form-checkbox">
                  <input
                    type="checkbox"
                    checked={addressForm.is_primary}
                    onChange={(e) => setAddressForm({ ...addressForm, is_primary: e.target.checked })}
                    disabled={addresses.length === 0} // First address is always primary
                  />
                  Jadikan Alamat Utama
                </label>
              </div>

              <div className="form-actions">
                <button className="btn-cancel" onClick={() => setIsAddressModalOpen(false)}>Batal</button>
                <button 
                  className="btn-save" 
                  onClick={handleSaveAddress}
                  disabled={saving}
                >
                  {saving ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage; 
