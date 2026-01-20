import React, { useState, useEffect } from 'react';
import { ArrowLeft, Store, MapPin, CreditCard, User, Phone, Mail } from 'lucide-react';
import { authUtils, apiService, User as UserType } from '../../services/api';
import './SellerAuthPage.css';

interface SellerAuthPageProps {
  onBack: () => void;
  onAuthSuccess: (user: UserType) => void;
}

interface StoreData {
  storeName: string;
  storeDescription: string;
  bankName: string;
  bankAccountNumber: string;
  bankAccountHolder: string;
  phone: string;
  address: string;
  city: string;
  province: string;
}

const SellerAuthPage: React.FC<SellerAuthPageProps> = ({ onBack, onAuthSuccess }) => {
  const [mode, setMode] = useState<'checking' | 'not-logged-in' | 'create-store' | 'has-store'>('checking');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  
  // Store form states
  const [storeData, setStoreData] = useState<StoreData>({
    storeName: '',
    storeDescription: '',
    bankName: '',
    bankAccountNumber: '',
    bankAccountHolder: '',
    phone: '',
    address: '',
    city: '',
    province: ''
  });

  useEffect(() => {
    checkUserAndStore();
  }, []);

  const checkUserAndStore = async () => {
    try {
      // Check if user is logged in
      const user = authUtils.getUser();
      const token = authUtils.getToken();
      
      console.log('🔍 Debug - User from storage:', user);
      console.log('🔍 Debug - Token from storage:', token ? 'EXISTS' : 'NULL');
      
      if (!user) {
        console.log('❌ No user found, showing not-logged-in');
        setMode('not-logged-in');
        return;
      }

      console.log('✅ User found:', user.email, 'Role:', user.role);
      setCurrentUser(user);
      
      // Check if user already has a store
      console.log('🏪 Checking for existing store...');
      const storeResponse = await apiService.checkSellerStore();
      
      console.log('🏪 Store response:', storeResponse);
      
      if (storeResponse.error || !(storeResponse as any).has_store) {
        // User doesn't have a store, show create store form
        console.log('❌ No store found, showing create-store form');
        console.log('❌ storeResponse.error:', storeResponse.error);
        console.log('❌ storeResponse.has_store:', (storeResponse as any).has_store);
        setMode('create-store');
        // Pre-fill some data from user
        setStoreData(prev => ({
          ...prev,
          bankAccountHolder: user.full_name,
          phone: user.phone || ''
        }));
      } else {
        // User has a store, redirect to dashboard
        console.log('✅ Store found! Redirecting to dashboard...');
        setMode('has-store');
        setTimeout(() => {
          onAuthSuccess(user);
        }, 1000);
      }
    } catch (err) {
      console.error('Error checking user and store:', err);
      // If there's an error checking store, assume user needs to create one
      setMode('create-store');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStore = async () => {
    if (!storeData.storeName || !storeData.bankName || !storeData.bankAccountNumber || !storeData.bankAccountHolder) {
      setError('Store name, bank name, account number, and account holder are required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const storePayload = {
        store_name: storeData.storeName,
        store_description: storeData.storeDescription,
        bank_name: storeData.bankName,
        bank_account_number: storeData.bankAccountNumber,
        bank_account_holder: storeData.bankAccountHolder,
        phone: storeData.phone,
        address: storeData.address,
        city: storeData.city,
        province: storeData.province
      };
      
      const response: any = await apiService.createStore(storePayload);
      
      if (response.error) {
        setError(response.message || 'Failed to create store');
      } else if (response.data) {
        // Update token and user data
        authUtils.setToken(response.data.token);
        authUtils.setUser(response.data.user);
        setSuccess('Store created successfully! Welcome to UPTOU Seller!');
        
        setTimeout(() => {
          onAuthSuccess(response.data.user);
        }, 1500);
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleStoreDataChange = (field: keyof StoreData, value: string) => {
    setStoreData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const renderNotLoggedIn = () => (
    <div className="auth-form">
      <div className="auth-header">
        <h2>Login Required</h2>
        <p>You need to login as a buyer first before becoming a seller</p>
      </div>
      
      <div className="not-logged-in-content">
        <div className="info-box">
          <User size={48} />
          <h3>Please Login First</h3>
          <p>To become a seller on UPTOU, you need to have a buyer account first. Please go back and login to continue.</p>
        </div>
        
        <button 
          className="btn-primary full-width"
          onClick={onBack}
        >
          Go Back to Login
        </button>
      </div>
    </div>
  );

  const renderHasStore = () => (
    <div className="auth-form">
      <div className="auth-header">
        <h2>Welcome Back!</h2>
        <p>Redirecting you to your seller dashboard...</p>
      </div>
      
      <div className="has-store-content">
        <div className="success-box">
          <Store size={48} />
          <h3>Store Found!</h3>
          <p>You already have a store set up. Taking you to your dashboard...</p>
        </div>
      </div>
    </div>
  );

  const renderCreateStore = () => (
    <div className="auth-form store-form">
      <div className="auth-header">
        <h2>Create Your Store</h2>
        <p>Set up your store to start selling on UPTOU</p>
      </div>

      <div className="form-sections">
        {/* Store Information */}
        <div className="form-section">
          <h3>
            <Store size={20} />
            Store Information
          </h3>
          
          <div className="form-group">
            <label>Store Name *</label>
            <div className="input-group">
              <Store size={20} />
              <input
                type="text"
                value={storeData.storeName}
                onChange={(e) => handleStoreDataChange('storeName', e.target.value)}
                placeholder="Enter your store name"
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Store Description</label>
            <div className="input-group">
              <textarea
                value={storeData.storeDescription}
                onChange={(e) => handleStoreDataChange('storeDescription', e.target.value)}
                placeholder="Describe your store and products"
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Store Phone</label>
            <div className="input-group">
              <Phone size={20} />
              <input
                type="tel"
                value={storeData.phone}
                onChange={(e) => handleStoreDataChange('phone', e.target.value)}
                placeholder="Store contact number"
                disabled={loading}
              />
            </div>
          </div>
        </div>

        {/* Address Information */}
        <div className="form-section">
          <h3>
            <MapPin size={20} />
            Store Address
          </h3>
          
          <div className="form-row">
            <div className="form-group">
              <label>City</label>
              <div className="input-group">
                <input
                  type="text"
                  value={storeData.city}
                  onChange={(e) => handleStoreDataChange('city', e.target.value)}
                  placeholder="City"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Province</label>
              <div className="input-group">
                <input
                  type="text"
                  value={storeData.province}
                  onChange={(e) => handleStoreDataChange('province', e.target.value)}
                  placeholder="Province"
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label>Full Address</label>
            <div className="input-group">
              <textarea
                value={storeData.address}
                onChange={(e) => handleStoreDataChange('address', e.target.value)}
                placeholder="Complete store address"
                disabled={loading}
              />
            </div>
          </div>
        </div>

        {/* Bank Information */}
        <div className="form-section">
          <h3>
            <CreditCard size={20} />
            Bank Information
          </h3>
          
          <div className="form-group">
            <label>Bank Name *</label>
            <div className="input-group">
              <CreditCard size={20} />
              <input
                type="text"
                value={storeData.bankName}
                onChange={(e) => handleStoreDataChange('bankName', e.target.value)}
                placeholder="e.g., BCA, Mandiri, BNI"
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Account Number *</label>
            <div className="input-group">
              <input
                type="text"
                value={storeData.bankAccountNumber}
                onChange={(e) => handleStoreDataChange('bankAccountNumber', e.target.value)}
                placeholder="Bank account number"
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Account Holder Name *</label>
            <div className="input-group">
              <User size={20} />
              <input
                type="text"
                value={storeData.bankAccountHolder}
                onChange={(e) => handleStoreDataChange('bankAccountHolder', e.target.value)}
                placeholder="Account holder name"
                disabled={loading}
              />
            </div>
          </div>
        </div>
      </div>

      <button 
        className="btn-primary full-width"
        onClick={handleCreateStore}
        disabled={loading}
      >
        {loading ? 'Creating Store...' : 'Create Store'}
      </button>
    </div>
  );

  const renderContent = () => {
    switch (mode) {
      case 'checking':
        return (
          <div className="auth-form">
            <div className="auth-header">
              <h2>Checking Account...</h2>
              <p>Please wait while we verify your account</p>
            </div>
          </div>
        );
      case 'not-logged-in':
        return renderNotLoggedIn();
      case 'has-store':
        return renderHasStore();
      case 'create-store':
        return renderCreateStore();
      default:
        return null;
    }
  };

  return (
    <div className="seller-auth-page">
      <div className="auth-container">
        <div className="auth-header-nav">
          <button className="back-btn" onClick={onBack}>
            <ArrowLeft size={20} />
            Kembali
          </button>
          <div className="auth-logo">
            <h1>UPTOU Seller</h1>
          </div>
        </div>

        <div className="auth-content">
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

          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default SellerAuthPage; 