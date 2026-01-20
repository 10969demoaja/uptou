import React, { useState } from 'react';

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

interface PaymentPageProps {
  items: CartItem[];
  onBack: () => void;
  onPaymentComplete: () => void;
}

const PaymentPage: React.FC<PaymentPageProps> = ({ items, onBack, onPaymentComplete }) => {
  const [selectedPayment, setSelectedPayment] = useState('');
  const [selectedShipping, setSelectedShipping] = useState('');
  const [address, setAddress] = useState({
    fullName: '',
    phone: '',
    address: '',
    city: '',
    postalCode: ''
  });

  const totalItems = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shippingCost = 15000;
  const serviceFee = 2000;
  const totalPayment = totalItems + shippingCost + serviceFee;

  const handlePayment = () => {
    if (!selectedPayment || !selectedShipping || !address.fullName) {
      alert('Mohon lengkapi semua data!');
      return;
    }
    
    // TODO: Implement payment processing
    alert('Pembayaran berhasil diproses!');
    onPaymentComplete();
  };

  return (
    <div className="payment-page">
      <div className="payment-header">
        <button onClick={onBack} className="back-button">
          ← Kembali ke Keranjang
        </button>
        <h2>Checkout</h2>
      </div>

      <div className="payment-content">
        {/* Shipping Address */}
        <div className="payment-section">
          <h3>Alamat Pengiriman</h3>
          <div className="address-form">
            <input
              type="text"
              placeholder="Nama Lengkap"
              value={address.fullName}
              onChange={(e) => setAddress({...address, fullName: e.target.value})}
            />
            <input
              type="text"
              placeholder="Nomor Telepon"
              value={address.phone}
              onChange={(e) => setAddress({...address, phone: e.target.value})}
            />
            <textarea
              placeholder="Alamat Lengkap"
              value={address.address}
              onChange={(e) => setAddress({...address, address: e.target.value})}
            />
            <input
              type="text"
              placeholder="Kota"
              value={address.city}
              onChange={(e) => setAddress({...address, city: e.target.value})}
            />
            <input
              type="text"
              placeholder="Kode Pos"
              value={address.postalCode}
              onChange={(e) => setAddress({...address, postalCode: e.target.value})}
            />
          </div>
        </div>

        {/* Shipping Method */}
        <div className="payment-section">
          <h3>Metode Pengiriman</h3>
          <div className="shipping-options">
            <label>
              <input
                type="radio"
                name="shipping"
                value="regular"
                checked={selectedShipping === 'regular'}
                onChange={(e) => setSelectedShipping(e.target.value)}
              />
              Reguler (2-3 hari) - Rp 15.000
            </label>
            <label>
              <input
                type="radio"
                name="shipping"
                value="express"
                checked={selectedShipping === 'express'}
                onChange={(e) => setSelectedShipping(e.target.value)}
              />
              Express (1 hari) - Rp 25.000
            </label>
          </div>
        </div>

        {/* Payment Method */}
        <div className="payment-section">
          <h3>Metode Pembayaran</h3>
          <div className="payment-options">
            <label>
              <input
                type="radio"
                name="payment"
                value="bank_transfer"
                checked={selectedPayment === 'bank_transfer'}
                onChange={(e) => setSelectedPayment(e.target.value)}
              />
              Transfer Bank
            </label>
            <label>
              <input
                type="radio"
                name="payment"
                value="ewallet"
                checked={selectedPayment === 'ewallet'}
                onChange={(e) => setSelectedPayment(e.target.value)}
              />
              E-Wallet (OVO, Dana, GoPay)
            </label>
            <label>
              <input
                type="radio"
                name="payment"
                value="cod"
                checked={selectedPayment === 'cod'}
                onChange={(e) => setSelectedPayment(e.target.value)}
              />
              Bayar di Tempat (COD)
            </label>
          </div>
        </div>

        {/* Order Summary */}
        <div className="payment-section">
          <h3>Ringkasan Pesanan</h3>
          <div className="order-items">
            {items.map((item) => (
              <div key={item.id} className="order-item">
                <img src={item.image} alt={item.name} />
                <div className="item-details">
                  <h4>{item.name}</h4>
                  <p>Qty: {item.quantity}</p>
                </div>
                <div className="item-price">
                  Rp {(item.price * item.quantity).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
          
          <div className="payment-summary">
            <div className="summary-row">
              <span>Subtotal Produk:</span>
              <span>Rp {totalItems.toLocaleString()}</span>
            </div>
            <div className="summary-row">
              <span>Ongkos Kirim:</span>
              <span>Rp {shippingCost.toLocaleString()}</span>
            </div>
            <div className="summary-row">
              <span>Biaya Layanan:</span>
              <span>Rp {serviceFee.toLocaleString()}</span>
            </div>
            <div className="summary-row total">
              <span>Total Pembayaran:</span>
              <span>Rp {totalPayment.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <button 
          className="payment-button"
          onClick={handlePayment}
        >
          Bayar Sekarang
        </button>
      </div>
    </div>
  );
};

export default PaymentPage; 