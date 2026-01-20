import React from 'react';
import AddProductWithCategories from '../../components/AddProductWithCategories';
import SellerHeader from '../../components/SellerHeader';

interface AddProductPageProps {
  onBack: () => void;
  onSwitchToGuest: () => void;
}

const AddProductPage: React.FC<AddProductPageProps> = ({ onBack, onSwitchToGuest }) => {
  return (
    <div className="add-product-page">
      <SellerHeader onSwitchToGuest={onSwitchToGuest} />
      
      <div className="add-product-container">
        <div className="page-header">
         
        </div>
        
        <AddProductWithCategories onBack={onBack} />
      </div>
    </div>
  );
};

export default AddProductPage; 