import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, Ticket, Heart, Store, MapPin } from 'lucide-react';
import './ShoppingCart.css';
import { apiService } from '../services/api';
import CartNotification from './CartNotification';
import ErrorState from './ErrorState';
import ProductCarousel from './ProductCarousel';

interface CartItem {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  quantity: number;
  selectedVariant?: string;
  selectedColor?: string;
  seller: string;
  stock: number;
  isSelected: boolean;
  cartItemId: string; // ID of the cart item in database
}

interface ShoppingCartProps {
  onBack: () => void;
  onCheckout: (items: CartItem[]) => void;
}

const ShoppingCart: React.FC<ShoppingCartProps> = ({ onBack, onCheckout }) => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectAll, setSelectAll] = useState(false);
  const [voucherCode, setVoucherCode] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState<{
    code: string;
    discount: number;
    type: 'percentage' | 'fixed';
  } | null>(null);

  // Notification state
  const [notification, setNotification] = useState({
    show: false,
    type: 'success' as 'success' | 'error' | 'warning',
    message: '',
    productName: '',
    productImage: ''
  });

  useEffect(() => {
    loadCartItems();
  }, []);

  const loadCartItems = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.getCart();
      
      if (response.error) {
        setError(response.message || 'Failed to load cart items');
        return;
      }

      if (response.data && response.data.items && response.data.items.length > 0) {
        // Transform API data to component format
        const transformedItems: CartItem[] = response.data.items.map((item: any) => {
          // Backend returns flattened structure with snake_case or specific keys
          const finalImage = item.image && item.image.trim() !== '' 
            ? item.image 
            : '/img.png';
          
          return {
            id: item.product_id,
            cartItemId: item.id,
            name: item.name,
            price: item.price,
            originalPrice: item.original_price,
            image: finalImage,
            quantity: item.quantity,
            selectedVariant: item.selectedVariant,
            seller: item.seller,
            stock: item.stock,
            isSelected: true, // Default all items selected
          };
        });
        
        setCartItems(transformedItems);
      } else {
        // No items in response, set empty cart
        setCartItems([]);
      }
    } catch (err) {
      setError('Failed to load cart items');
      console.error('Error loading cart:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const img = e.currentTarget;
    const container = img.parentElement;
    
    console.log('Image error for:', img.src, 'switching to fallback');
    
    // Always set to fallback on error
    img.src = '/img.png';
    
    // Remove loading class
    if (container) {
      container.classList.remove('loading');
    }
  };

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const img = e.currentTarget;
    const container = img.parentElement;
    
    // Remove loading class when image loads
    if (container) {
      container.classList.remove('loading');
    }
  };

  const handleImageLoadStart = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const img = e.currentTarget;
    const container = img.parentElement;
    
    // Add loading class when image starts loading
    if (container) {
      container.classList.add('loading');
    }
  };

  const updateQuantity = async (cartItemId: string, change: number) => {
    const item = cartItems.find(item => item.cartItemId === cartItemId);
    if (!item) return;

    const newQuantity = item.quantity + change;
    if (newQuantity < 1 || newQuantity > item.stock) return;

    try {
      const response = await apiService.updateCartItem(cartItemId, newQuantity);
      
      if (response.error) {
        setNotification({
          show: true,
          type: 'error',
          message: response.message || 'Failed to update quantity',
          productName: '',
          productImage: ''
        });
        return;
      }

      // Update local state
      setCartItems(items =>
        items.map(item => 
          item.cartItemId === cartItemId 
            ? { ...item, quantity: newQuantity }
            : item
        )
      );
    } catch (err) {
      setNotification({
        show: true,
        type: 'error',
        message: 'Failed to update cart item',
        productName: '',
        productImage: ''
      });
    }
  };

  const removeItem = async (cartItemId: string) => {
    const item = cartItems.find(item => item.cartItemId === cartItemId);
    if (!item) return;

    try {
      const response = await apiService.removeFromCart(cartItemId);
      
      if (response.error) {
        setNotification({
          show: true,
          type: 'error',
          message: response.message || 'Failed to remove item',
          productName: '',
          productImage: ''
        });
        return;
      }

      // Remove from local state
      setCartItems(items => items.filter(item => item.cartItemId !== cartItemId));
      
      setNotification({
        show: true,
        type: 'success',
        message: 'Item berhasil dihapus dari keranjang',
        productName: item.name,
        productImage: item.image
      });
    } catch (err) {
      setNotification({
        show: true,
        type: 'error',
        message: 'Failed to remove item from cart',
        productName: '',
        productImage: ''
      });
    }
  };

  const toggleItemSelection = (cartItemId: string) => {
    setCartItems(items =>
      items.map(item =>
        item.cartItemId === cartItemId ? { ...item, isSelected: !item.isSelected } : item
      )
    );
  };

  const toggleSelectAll = () => {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);
    setCartItems(items =>
      items.map(item => ({ ...item, isSelected: newSelectAll }))
    );
  };

  const removeSelectedItems = async () => {
    const selectedItems = cartItems.filter(item => item.isSelected);
    if (selectedItems.length === 0) return;

    try {
      // Remove all selected items
      const removePromises = selectedItems.map(item => 
        apiService.removeFromCart(item.cartItemId)
      );
      
      await Promise.all(removePromises);
      
      // Update local state
      const selectedIds = selectedItems.map(item => item.cartItemId);
      setCartItems(items => items.filter(item => !selectedIds.includes(item.cartItemId)));
      
      setNotification({
        show: true,
        type: 'success',
        message: `${selectedItems.length} item berhasil dihapus dari keranjang`,
        productName: '',
        productImage: ''
      });
    } catch (err) {
      setNotification({
        show: true,
        type: 'error',
        message: 'Failed to remove selected items',
        productName: '',
        productImage: ''
      });
    }
  };

  const applyVoucher = () => {
    // Mock voucher validation
    const vouchers = {
      'DISKON10': { discount: 10, type: 'percentage' as const },
      'HEMAT50K': { discount: 50000, type: 'fixed' as const },
      'GRATIS20': { discount: 20, type: 'percentage' as const },
    };

    const voucher = vouchers[voucherCode as keyof typeof vouchers];
    if (voucher) {
      setAppliedVoucher({ code: voucherCode, ...voucher });
      setNotification({
        show: true,
        type: 'success',
        message: `Voucher ${voucherCode} berhasil diterapkan!`,
        productName: '',
        productImage: ''
      });
    } else {
      setNotification({
        show: true,
        type: 'error',
        message: 'Kode voucher tidak valid!',
        productName: '',
        productImage: ''
      });
    }
  };

  const removeVoucher = () => {
    setAppliedVoucher(null);
    setVoucherCode('');
  };

  const selectedItems = cartItems.filter(item => item.isSelected);
  const subtotal = selectedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  let discount = 0;
  if (appliedVoucher) {
    if (appliedVoucher.type === 'percentage') {
      discount = subtotal * (appliedVoucher.discount / 100);
    } else {
      discount = appliedVoucher.discount;
    }
  }

  const shippingCost = selectedItems.length > 0 ? 0 : 0; // Free shipping
  const total = subtotal - discount + shippingCost;

  const handleCheckout = () => {
    if (selectedItems.length === 0) {
      setNotification({
        show: true,
        type: 'warning',
        message: 'Pilih minimal 1 item untuk checkout!',
        productName: '',
        productImage: ''
      });
      return;
    }
    onCheckout(selectedItems);
  };

  // Group items by seller
  const itemsBySeller = cartItems.reduce((acc, item) => {
    if (!acc[item.seller]) {
      acc[item.seller] = [];
    }
    acc[item.seller].push(item);
    return acc;
  }, {} as Record<string, CartItem[]>);

  if (loading) {
    return (
      <div className="shopping-cart">
        <div className="cart-container">
          <div className="cart-loading">
            <div className="loading-spinner"></div>
            <p>Memuat keranjang belanja...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="shopping-cart">
        <div className="cart-container">
          <ErrorState 
            type="api-error" 
            message={error} 
            onRetry={loadCartItems} 
            showRetry={true}
          />
        </div>
      </div>
    );
  }

  if (cartItems.length === 0 && !loading) {
    return (
      <div className="shopping-cart">
        <div className="cart-container">
          <div className="empty-cart-custom">
            <div className="empty-cart-icon">
              <ShoppingBag size={80} />
            </div>
            <h3 className="empty-cart-title">Belum ada yang masuk keranjang</h3>
            <p className="empty-cart-message">Ayo belanja dan temukan produk favorit Anda!</p>
            <button className="start-shopping-btn" onClick={onBack}>
              Ayo Belanja
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="shopping-cart">
      <div className="cart-container">
        <h1 className="cart-page-title">Keranjang</h1>
        
        <div className="cart-content">
          {/* Cart Items Column */}
          <div className="cart-items-column">
            {/* Select All Section */}
            <div className="cart-section-header">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={toggleSelectAll}
                />
                <span className="checkmark"></span>
                <span className="select-all-text">Pilih Semua ({cartItems.length})</span>
              </label>
              {selectedItems.length > 0 && (
                <button 
                  className="delete-selected-text-btn"
                  onClick={removeSelectedItems}
                >
                  Hapus
                </button>
              )}
            </div>

            {/* Items by Seller */}
            {Object.entries(itemsBySeller).map(([seller, items]) => (
              <div key={seller} className="cart-store-group">
                <div className="store-header">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={items.every(i => i.isSelected)}
                      onChange={() => {
                        const allSelected = items.every(i => i.isSelected);
                        items.forEach(item => {
                          if (item.isSelected === allSelected) {
                            toggleItemSelection(item.cartItemId);
                          }
                        });
                      }}
                    />
                    <span className="checkmark"></span>
                  </label>
                  <div className="store-info">
                    <Store size={18} className="store-icon" />
                    <span className="store-name">{seller}</span>
                    <span className="store-badge">Official Store</span>
                  </div>
                </div>

                <div className="store-items-list">
                  {items.map((item) => (
                    <div key={item.cartItemId} className="cart-item-card">
                      <div className="item-checkbox-col">
                        <label className="checkbox-label">
                          <input
                            type="checkbox"
                            checked={item.isSelected}
                            onChange={() => toggleItemSelection(item.cartItemId)}
                          />
                          <span className="checkmark"></span>
                        </label>
                      </div>

                      <div className="item-content-col">
                        <div className="item-main-info">
                          <div className="item-image-wrapper">
                            <img 
                              src={item.image} 
                              alt={item.name}
                              onError={handleImageError}
                              onLoad={handleImageLoad}
                              onLoadStart={handleImageLoadStart}
                              loading="lazy"
                            />
                          </div>
                          
                          <div className="item-details-wrapper">
                            <h3 className="item-name-link" onClick={() => navigate(`/product/${item.id}`)}>
                              {item.name}
                            </h3>
                            
                            {(item.selectedVariant || item.selectedColor) && (
                              <div className="item-variant-badge">
                                {item.selectedVariant && <span>{item.selectedVariant}</span>}
                                {item.selectedColor && <span>{item.selectedColor}</span>}
                              </div>
                            )}
                            
                            <div className="item-price-wrapper">
                              <div className="current-price">{formatPrice(item.price)}</div>
                              {item.originalPrice && item.originalPrice > item.price && (
                                <div className="discount-info">
                                  <span className="original-price">{formatPrice(item.originalPrice)}</span>
                                  <span className="discount-badge">
                                    {Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)}%
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="item-actions-row">
                          <div className="item-left-actions">
                            <button className="action-text-btn" title="Tulis Catatan">Tulis Catatan</button>
                          </div>
                          
                          <div className="item-right-actions">
                            <button className="icon-action-btn" title="Pindahkan ke Wishlist">
                              <Heart size={20} />
                            </button>
                            <button 
                              className="icon-action-btn"
                              onClick={() => removeItem(item.cartItemId)}
                              title="Hapus"
                            >
                              <Trash2 size={20} />
                            </button>
                            
                            <div className="quantity-editor">
                              <button 
                                onClick={() => updateQuantity(item.cartItemId, -1)}
                                disabled={item.quantity <= 1}
                                className="qty-btn minus"
                              >
                                <Minus size={14} />
                              </button>
                              <input 
                                type="text" 
                                value={item.quantity} 
                                readOnly 
                                className="qty-input"
                              />
                              <button 
                                onClick={() => updateQuantity(item.cartItemId, 1)}
                                disabled={item.quantity >= item.stock}
                                className="qty-btn plus"
                              >
                                <Plus size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary Column */}
          {cartItems.length > 0 && (
            <div className="cart-summary-column">
              <div className="summary-sticky-card">
                <h3>Ringkasan belanja</h3>

                <div className="summary-section">
                  <div className="summary-row">
                    <span>Total Harga ({selectedItems.length} barang)</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="summary-row discount">
                      <span>Total Diskon Barang</span>
                      <span>-{formatPrice(discount)}</span>
                    </div>
                  )}
                </div>

                <div className="summary-divider"></div>

                <div className="summary-total-row">
                  <span className="total-label">Total Belanja</span>
                  <span className="total-value">{formatPrice(total)}</span>
                </div>

                <div className="promo-section-btn">
                  <button className="promo-trigger-btn" onClick={() => document.getElementById('promo-input')?.focus()}>
                    <Ticket size={18} />
                    <span>Makin hemat pakai promo</span>
                    <span className="chevron">›</span>
                  </button>
                </div>
                
                {/* Voucher Input (Hidden by default or simpler) - keeping functional for now */}
                <div className="voucher-input-group">
                   <input
                      id="promo-input"
                      type="text"
                      placeholder="Masukkan kode promo"
                      value={voucherCode}
                      onChange={(e) => setVoucherCode(e.target.value)}
                    />
                    <button onClick={applyVoucher} disabled={!voucherCode}>
                      Pakai
                    </button>
                </div>
                 {appliedVoucher && (
                    <div className="applied-voucher-tag">
                      <span>{appliedVoucher.code} applied</span>
                      <button onClick={removeVoucher}>×</button>
                    </div>
                 )}

                <button 
                  className="buy-btn-large"
                  onClick={handleCheckout}
                  disabled={selectedItems.length === 0}
                >
                  Beli ({selectedItems.length})
                </button>
              </div>
            </div>
          )}

          <div className="cart-recommendations">
            <h3 className="recommendation-title">Rekomendasi untukmu</h3>
            <ProductCarousel onProductClick={(id) => navigate(`/product/${id}`)} />
          </div>
        </div>
      </div>

      {/* Cart Notification */}
      <CartNotification
        show={notification.show}
        type={notification.type}
        message={notification.message}
        productName={notification.productName}
        productImage={notification.productImage}
        onClose={() => setNotification(prev => ({ ...prev, show: false }))}
      />
    </div>
  );
};

export default ShoppingCart; 