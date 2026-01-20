import React from 'react';
import ProductDetail from '../../components/ProductDetail';

interface DetailPageProps {
  productId: string;
  onBack: () => void;
  onAddToCart: (product: any, quantity: number) => void;
  onAddToWishlist: (product: any) => void;
}

const DetailPage: React.FC<DetailPageProps> = ({ 
  productId, 
  onBack, 
  onAddToCart, 
  onAddToWishlist 
}) => {
  return (
    <div className="detail-page">
      <ProductDetail
        productId={productId}
        onBack={onBack}
        onAddToCart={onAddToCart}
        onAddToWishlist={onAddToWishlist}
      />
    </div>
  );
};

export default DetailPage; 