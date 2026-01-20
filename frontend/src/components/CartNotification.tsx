import React, { useEffect, useState } from 'react';
import { Check, ShoppingCart, X, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ProductCard from './ProductCard';
import { buildApiUrl } from '../services/api';
import './CartNotification.css';

interface CartNotificationProps {
  show: boolean;
  type: 'success' | 'error' | 'warning';
  message: string;
  productName?: string;
  productImage?: string;
  onClose: () => void;
  autoClose?: boolean; // Kept for compatibility but we might ignore it for modal
  duration?: number;
}

const CartNotification: React.FC<CartNotificationProps> = ({
  show,
  type,
  message,
  productName,
  productImage,
  onClose,
  autoClose = false, // Default to false for modal
  duration = 3000
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      fetchRecommendations();
    } else {
      setIsVisible(false);
    }
  }, [show]);

  const fetchRecommendations = async () => {
    try {
      const res = await fetch(buildApiUrl('/buyer/products?limit=5'));
      const data = await res.json();
      const list = data.data.products.slice(0, 5).map((p: any) => ({
        id: p.id,
        title: p.name,
        price: p.price,
        rating: p.rating || 5.0,
        reviewCount: p.review_count || 0,
        soldCount: 100, // Mock data if missing
        storeName: p.store?.name || 'Official Store',
        storeLocation: p.store?.location || 'Jakarta',
        imageUrl: p.main_image || '/img.png',
        cashbackPercentage: 5,
        freeShipping: true
      }));
      setRecommendations(list);
    } catch (error) {
      console.error("Failed to fetch recommendations", error);
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    onClose();
  };

  const handleViewCart = () => {
    onClose();
    navigate('/cart');
  };

  if (!isVisible) return null;

  // If it's an error or warning, use the old toast style (optional, but good for UX)
  // But user requested "like this" for "success adding to cart".
  // Let's stick to modal for success, toast for others if needed.
  // For now, I'll apply modal style for success, and maybe simple style for others?
  // The user specifically asked "bagaimana kalau notifikasinya sebuah pop up".
  
  if (type !== 'success') {
     // Fallback to simple toast for errors/warnings
     return (
        <div className={`cart-notification-toast ${type}`}>
          <div className="toast-content">
            <span>{message}</span>
            <button onClick={handleClose}><X size={16}/></button>
          </div>
        </div>
     );
  }

  return (
    <div className="cart-modal-overlay" onClick={handleClose}>
      <div className="cart-modal-container" onClick={e => e.stopPropagation()}>
        <div className="cart-modal-header">
          <h3>Berhasil Ditambahkan</h3>
          <button className="close-btn" onClick={handleClose}>
            <X size={24} />
          </button>
        </div>

        <div className="cart-modal-body">
          {/* Added Product Section */}
          <div className="added-product-section">
            <div className="added-product-info">
              <img 
                src={productImage || '/img.png'} 
                alt={productName} 
                className="added-product-img"
                onError={(e) => {
                  const img = e.currentTarget;
                  if (img.src !== '/img.png') {
                    img.src = '/img.png';
                  }
                }}
              />
              <span className="added-product-name">{productName}</span>
            </div>
            <button className="view-cart-btn" onClick={handleViewCart}>
              Lihat Keranjang
            </button>
          </div>

          {/* Recommendations Section */}
          <div className="recommendations-section">
            <h4>Kamu Mungkin Juga Suka</h4>
            <div className="recommendations-grid">
              {recommendations.map((product) => (
                <div 
                  key={product.id} 
                  className="recommendation-item"
                  onClick={() => {
                    onClose();
                    navigate(`/product/${product.id}`);
                  }}
                  style={{ cursor: 'pointer' }}
                >
                   <ProductCard {...product} />
                </div>
              ))}
            </div>
          </div>
          
          <div className="shipping-info">
            <h4>Dikirim sekaligus, satu ongkir</h4>
            <div className="shipping-products-preview">
                {/* Visual placeholder for "shipped together" items */}
                {recommendations.slice(0, 3).map((p, idx) => (
                    <div key={idx} className="shipping-preview-item">
                        <img src={p.imageUrl} alt="" />
                    </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartNotification; 