import React from 'react';
import './ProductCard.css';

interface ProductCardProps {
  id: number;
  title: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  rating: number;
  reviewCount: number;
  soldCount: number;
  storeName: string;
  storeLocation: string;
  imageUrl: string;
  cashbackPercentage?: number;
  badges?: string[];
  freeShipping?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({
  id,
  title,
  price,
  originalPrice,
  discount,
  rating,
  reviewCount,
  soldCount,
  storeName,
  storeLocation,
  imageUrl,
  cashbackPercentage,
  badges = [],
  freeShipping = false
}) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price).replace('IDR', 'Rp');
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'rb';
    }
    return num.toString();
  };

  return (
    <div className="product-card">
      <div className="product-image-container">
        <img 
          src={imageUrl} 
          alt={title}
          className="product-image"
          onError={(e) => {
            e.currentTarget.src = 'https://via.placeholder.com/200x200/f0f0f0/666666?text=No+Image';
          }}
        />
        
        {/* Badges */}
        {badges.length > 0 && (
          <div className="product-badges">
            {badges.map((badge, index) => (
              <span key={index} className={`badge ${badge.toLowerCase().replace(' ', '-')}`}>
                {badge}
              </span>
            ))}
          </div>
        )}

        {/* Discount Badge */}
        {discount && (
          <div className="discount-badge">
            {discount}%
          </div>
        )}

        {/* Cashback Badge */}
        {cashbackPercentage && (
          <div className="cashback-badge">
            {cashbackPercentage}% Cashback
          </div>
        )}
      </div>

      <div className="product-info">
        <h3 className="product-title">{title}</h3>
        
        <div className="product-pricing">
          <span className="current-price">{formatPrice(price)}</span>
          {originalPrice && originalPrice > price && (
            <span className="original-price">{formatPrice(originalPrice)}</span>
          )}
        </div>

        <div className="product-rating">
          <div className="stars">
            <span className="star-icon">★</span>
            <span className="rating-value">{rating}</span>
          </div>
          <span className="review-count">·{reviewCount}+ terjual</span>
        </div>

        <div className="store-info">
          <span className="store-name">{storeName}</span>
          <span className="store-location">{storeLocation}</span>
        </div>

        {/* Additional Info */}
        <div className="product-extras">
          {freeShipping && (
            <span className="free-shipping">Gratis Ongkir</span>
          )}
          <span className="sold-count">Hemat s.d. 5% Pakai Bonus</span>
        </div>
      </div>
    </div>
  );
};

export default ProductCard; 