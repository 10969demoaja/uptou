import React from 'react';
import ShoppingCart from '../../components/ShoppingCart';

interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  selectedVariant?: string;
  selectedColor?: string;
  seller: string;
  stock: number;
  isSelected: boolean;
}

interface CartPageProps {
  onBack: () => void;
  onCheckout: (items: CartItem[]) => void;
}

const CartPage: React.FC<CartPageProps> = ({ onBack, onCheckout }) => {
  return (
    <div className="cart-page">
      <ShoppingCart
        onBack={onBack}
        onCheckout={onCheckout}
      />
    </div>
  );
};

export default CartPage; 