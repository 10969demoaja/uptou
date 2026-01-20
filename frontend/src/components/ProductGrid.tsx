import React from 'react';
import ProductCard from './ProductCard';
import './ProductGrid.css';

interface Product {
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

interface ProductGridProps {
  products: Product[];
  loading?: boolean;
}

const ProductGrid: React.FC<ProductGridProps> = ({ products, loading = false }) => {
  if (loading) {
    return (
      <div className="product-grid">
        {Array.from({ length: 12 }).map((_, index) => (
          <div key={index} className="product-card-skeleton">
            <div className="skeleton-image"></div>
            <div className="skeleton-content">
              <div className="skeleton-title"></div>
              <div className="skeleton-price"></div>
              <div className="skeleton-rating"></div>
              <div className="skeleton-store"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="empty-products">
        <div className="empty-icon">📦</div>
        <h3>Tidak ada produk ditemukan</h3>
        <p>Coba ubah kata kunci pencarian atau filter Anda</p>
      </div>
    );
  }

  return (
    <div className="product-grid">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          id={product.id}
          title={product.title}
          price={product.price}
          originalPrice={product.originalPrice}
          discount={product.discount}
          rating={product.rating}
          reviewCount={product.reviewCount}
          soldCount={product.soldCount}
          storeName={product.storeName}
          storeLocation={product.storeLocation}
          imageUrl={product.imageUrl}
          cashbackPercentage={product.cashbackPercentage}
          badges={product.badges}
          freeShipping={product.freeShipping}
        />
      ))}
    </div>
  );
};

export default ProductGrid; 