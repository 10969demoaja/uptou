import React, { useState } from 'react';
import { apiService, authUtils, User, ApiResponse } from '../services/api';
import './AuthModal.css';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: User) => void;
}

type AuthMode = 'login' | 'register' | 'otp-verify' | 'register-otp-verify';

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onAuthSuccess }) => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [otpEmail, setOtpEmail] = useState('');
  const [generatedOTP, setGeneratedOTP] = useState('');
  const [isRegistrationOTP, setIsRegistrationOTP] = useState(false);

  // Form states
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [otpToken, setOtpToken] = useState('');

  const resetForm = () => {
    setEmail('');
    setFullName('');
    setPhone('');
    setOtpToken('');
    setError('');
    setSuccess('');
    setOtpEmail('');
    setGeneratedOTP('');
    setIsRegistrationOTP(false);
  };

  const handleClose = () => {
    resetForm();
    setMode('login');
    onClose();
  };

  const handleRegister = async () => {
    if (!email || !fullName) {
      setError('Email and full name are required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Registrasi buyer dengan OTP
      const response = await apiService.register({ email, full_name: fullName, phone });

      if (response.error) {
        setError(response.message || 'Registration failed');
      } else if (response.data) {
        setOtpEmail(email);
        setGeneratedOTP(response.data.otp); // In production, this won't be returned
        setIsRegistrationOTP(true);
        setSuccess(`Registration successful! OTP sent to ${email}. Please check your email!`);
        setMode('register-otp-verify');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestOTP = async () => {
    if (!email) {
      setError('Email is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await apiService.login(email);
      
      if (response.error) {
        setError(response.message || 'Failed to send OTP');
      } else if (response.data) {
        setOtpEmail(email);
        setGeneratedOTP(response.data.otp); // In production, this won't be returned
        setIsRegistrationOTP(false);
        setSuccess(`OTP sent to ${email}. Check your email!`);
        setMode('otp-verify');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otpToken) {
      setError('OTP is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      let response: ApiResponse;
      
      if (isRegistrationOTP) {
        // Verify registration OTP
        response = await apiService.verifyRegistrationOTP(otpEmail, otpToken);
      } else {
        // Verify login OTP
        response = await apiService.verifyOTP(otpEmail, otpToken);
      }
      
      if (response.error) {
        setError(response.message || 'Invalid OTP');
      } else if (response.data) {
        authUtils.setToken(response.data.token);
        authUtils.setUser(response.data.user);
        const successMessage = isRegistrationOTP ? 'Registration completed successfully! Welcome to UPTOU!' : 'Login successful!';
        setSuccess(successMessage);
        setTimeout(() => {
          onAuthSuccess(response.data!.user);
          handleClose();
        }, 1000);
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const renderLoginForm = () => (
    <div className="auth-form">
      <h2>Masuk UPTOU</h2>
      <div className="form-group">
        <label>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Masukkan email Anda"
          disabled={loading}
        />
      </div>
      <button 
        onClick={handleRequestOTP}
        disabled={loading}
        className="auth-btn primary"
      >
        {loading ? 'Mengirim...' : 'Selanjutnya'}
      </button>
      
      <div className="auth-divider">atau</div>
      
      <div className="register-options">
        <p>Belum punya akun?</p>
        <button 
          onClick={() => setMode('register')}
          className="auth-btn secondary"
        >
          Daftar Sekarang
        </button>
      </div>
    </div>
  );

  const renderRegisterForm = () => (
    <div className="auth-form">
      <h2>Daftar UPTOU</h2>
      <div className="register-description">
        <p>Bergabunglah dengan jutaan pengguna di UPTOU!</p>
        <p>Belanja mudah, jual kapan saja</p>
      </div>
      <div className="form-group">
        <label>Email *</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Masukkan email Anda"
          disabled={loading}
        />
      </div>
      <div className="form-group">
        <label>Nama Lengkap *</label>
        <input
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Masukkan nama lengkap"
          disabled={loading}
        />
      </div>
      <div className="form-group">
        <label>Nomor HP</label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Masukkan nomor HP"
          disabled={loading}
        />
      </div>
      <button 
        onClick={handleRegister}
        disabled={loading}
        className="auth-btn primary"
      >
        {loading ? 'Memproses...' : 'Daftar Sekarang'}
      </button>
      
      <button 
        onClick={() => setMode('login')}
        className="auth-btn secondary"
      >
        Kembali ke Masuk
      </button>
    </div>
  );

  const renderOTPForm = () => (
    <div className="auth-form">
      <h2>Masukkan Kode OTP</h2>
      <p>Kami telah mengirim kode 6 digit ke {otpEmail}</p>
      {generatedOTP && (
        <div className="otp-hint">
          <strong>Mode Development:</strong> Gunakan OTP: <code>{generatedOTP}</code>
        </div>
      )}
      <div className="form-group">
        <label>Kode OTP</label>
        <input
          type="text"
          value={otpToken}
          onChange={(e) => setOtpToken(e.target.value)}
          placeholder="Masukkan kode 6 digit"
          maxLength={6}
          disabled={loading}
        />
      </div>
      <button 
        onClick={handleVerifyOTP}
        disabled={loading}
        className="auth-btn primary"
      >
        {loading ? 'Memverifikasi...' : 'Verifikasi OTP'}
      </button>
      
      <button 
        onClick={() => setMode('login')}
        className="auth-btn secondary"
      >
        Kembali ke Masuk
      </button>
    </div>
  );

  const renderForm = () => {
    switch (mode) {
      case 'register':
        return renderRegisterForm();
      case 'otp-verify':
      case 'register-otp-verify':
        return renderOTPForm();
      default:
        return renderLoginForm();
    }
  };

  return (
    <div className="auth-modal-overlay" onClick={handleClose}>
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={handleClose}>
          ×
        </button>
        
        {renderForm()}
        
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
      </div>
    </div>
  );
};

export default AuthModal; 