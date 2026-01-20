import React from 'react';
import { 
  AlertCircle, 
  Wifi, 
  RefreshCw, 
  ShoppingBag, 
  Package, 
  Search, 
  Heart, 
  MessageCircle,
  MapPin,
  CreditCard,
  User,
  Clock
} from 'lucide-react';
import './ErrorState.css';

export type ErrorType = 
  | 'network-error'     // Network/connection issues
  | 'api-error'         // API/server errors
  | 'not-found'         // 404 or resource not found
  | 'empty-data'        // No data available
  | 'unauthorized'      // Authentication required
  | 'forbidden'         // Access denied
  | 'validation-error'  // Form validation errors
  | 'timeout'           // Request timeout
  | 'generic';          // Generic error

export type EmptyStateType =
  | 'cart'              // Empty shopping cart
  | 'orders'            // No orders
  | 'products'          // No products found
  | 'search'            // No search results
  | 'wishlist'          // Empty wishlist
  | 'messages'          // No messages
  | 'notifications'     // No notifications
  | 'addresses'         // No saved addresses
  | 'payments'          // No payment methods
  | 'profile'           // Empty profile
  | 'history'           // No history data
  | 'reviews';          // No reviews

interface ErrorStateProps {
  type: ErrorType | EmptyStateType;
  title?: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  showRetry?: boolean;
  onRetry?: () => void;
  className?: string;
  size?: 'small' | 'medium' | 'large';
}

const ErrorState: React.FC<ErrorStateProps> = ({
  type,
  title,
  message,
  actionLabel,
  onAction,
  showRetry = false,
  onRetry,
  className = '',
  size = 'medium'
}) => {
  const getErrorConfig = () => {
    switch (type) {
      case 'network-error':
        return {
          icon: <Wifi size={48} />,
          defaultTitle: 'Koneksi Bermasalah',
          defaultMessage: 'Periksa koneksi internet Anda dan coba lagi',
          color: 'error',
          showRetry: true
        };
      
      case 'api-error':
        return {
          icon: <AlertCircle size={48} />,
          defaultTitle: 'Terjadi Kesalahan',
          defaultMessage: 'Server sedang mengalami gangguan. Silakan coba beberapa saat lagi',
          color: 'error',
          showRetry: true
        };
      
      case 'not-found':
        return {
          icon: <Search size={48} />,
          defaultTitle: 'Tidak Ditemukan',
          defaultMessage: 'Data yang Anda cari tidak ditemukan',
          color: 'warning'
        };
      
      case 'empty-data':
        return {
          icon: <Package size={48} />,
          defaultTitle: 'Tidak Ada Data',
          defaultMessage: 'Belum ada data tersedia',
          color: 'neutral'
        };
      
      case 'unauthorized':
        return {
          icon: <User size={48} />,
          defaultTitle: 'Perlu Login',
          defaultMessage: 'Silakan login untuk mengakses fitur ini',
          color: 'warning',
          defaultActionLabel: 'Login'
        };
      
      case 'forbidden':
        return {
          icon: <AlertCircle size={48} />,
          defaultTitle: 'Akses Ditolak',
          defaultMessage: 'Anda tidak memiliki izin untuk mengakses halaman ini',
          color: 'error'
        };
      
      case 'validation-error':
        return {
          icon: <AlertCircle size={48} />,
          defaultTitle: 'Data Tidak Valid',
          defaultMessage: 'Periksa kembali data yang Anda masukkan',
          color: 'warning'
        };
      
      case 'timeout':
        return {
          icon: <Clock size={48} />,
          defaultTitle: 'Waktu Habis',
          defaultMessage: 'Permintaan membutuhkan waktu terlalu lama',
          color: 'warning',
          showRetry: true
        };
      
      // Empty States
      case 'cart':
        return {
          icon: <ShoppingBag size={48} />,
          defaultTitle: 'Keranjang Kosong',
          defaultMessage: 'Belum ada produk di keranjang Anda',
          color: 'neutral',
          defaultActionLabel: 'Mulai Berbelanja'
        };
      
      case 'orders':
        return {
          icon: <Package size={48} />,
          defaultTitle: 'Belum Ada Pesanan',
          defaultMessage: 'Anda belum memiliki pesanan apapun',
          color: 'neutral',
          defaultActionLabel: 'Mulai Berbelanja'
        };
      
      case 'products':
        return {
          icon: <Package size={48} />,
          defaultTitle: 'Tidak Ada Produk',
          defaultMessage: 'Belum ada produk tersedia',
          color: 'neutral'
        };
      
      case 'search':
        return {
          icon: <Search size={48} />,
          defaultTitle: 'Tidak Ada Hasil',
          defaultMessage: 'Coba kata kunci yang berbeda atau periksa ejaan',
          color: 'neutral'
        };
      
      case 'wishlist':
        return {
          icon: <Heart size={48} />,
          defaultTitle: 'Wishlist Kosong',
          defaultMessage: 'Belum ada produk favorit Anda',
          color: 'neutral',
          defaultActionLabel: 'Jelajahi Produk'
        };
      
      case 'messages':
        return {
          icon: <MessageCircle size={48} />,
          defaultTitle: 'Belum Ada Pesan',
          defaultMessage: 'Anda belum memiliki percakapan',
          color: 'neutral'
        };
      
      case 'notifications':
        return {
          icon: <AlertCircle size={48} />,
          defaultTitle: 'Tidak Ada Notifikasi',
          defaultMessage: 'Semua notifikasi sudah dibaca',
          color: 'neutral'
        };
      
      case 'addresses':
        return {
          icon: <MapPin size={48} />,
          defaultTitle: 'Belum Ada Alamat',
          defaultMessage: 'Tambahkan alamat pengiriman Anda',
          color: 'neutral',
          defaultActionLabel: 'Tambah Alamat'
        };
      
      case 'payments':
        return {
          icon: <CreditCard size={48} />,
          defaultTitle: 'Belum Ada Metode Pembayaran',
          defaultMessage: 'Tambahkan metode pembayaran untuk checkout',
          color: 'neutral',
          defaultActionLabel: 'Tambah Metode Pembayaran'
        };
      
      case 'profile':
        return {
          icon: <User size={48} />,
          defaultTitle: 'Profil Belum Lengkap',
          defaultMessage: 'Lengkapi profil Anda untuk pengalaman yang lebih baik',
          color: 'neutral',
          defaultActionLabel: 'Lengkapi Profil'
        };
      
      case 'history':
        return {
          icon: <Clock size={48} />,
          defaultTitle: 'Belum Ada Riwayat',
          defaultMessage: 'Riwayat aktivitas akan muncul di sini',
          color: 'neutral'
        };
      
      case 'reviews':
        return {
          icon: <AlertCircle size={48} />,
          defaultTitle: 'Belum Ada Ulasan',
          defaultMessage: 'Produk ini belum memiliki ulasan',
          color: 'neutral'
        };
      
      default:
        return {
          icon: <AlertCircle size={48} />,
          defaultTitle: 'Terjadi Kesalahan',
          defaultMessage: 'Silakan coba lagi',
          color: 'error',
          showRetry: true
        };
    }
  };

  const config = getErrorConfig();
  const finalTitle = title || config.defaultTitle;
  const finalMessage = message || config.defaultMessage;
  const finalActionLabel = actionLabel || config.defaultActionLabel;
  const shouldShowRetry = showRetry || config.showRetry;

  return (
    <div className={`error-state error-state--${size} error-state--${config.color} ${className}`}>
      <div className="error-state__content">
        <div className="error-state__icon">
          {config.icon}
        </div>
        
        <h3 className="error-state__title">
          {finalTitle}
        </h3>
        
        <p className="error-state__message">
          {finalMessage}
        </p>
        
        <div className="error-state__actions">
          {shouldShowRetry && onRetry && (
            <button 
              className="error-state__button error-state__button--secondary"
              onClick={onRetry}
            >
              <RefreshCw size={16} />
              Coba Lagi
            </button>
          )}
          
          {finalActionLabel && onAction && (
            <button 
              className="error-state__button error-state__button--primary"
              onClick={onAction}
            >
              {finalActionLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorState; 