import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MapPin, Ticket, ShieldCheck, ChevronRight, AlertCircle, Plus, Edit2, Trash2, X } from 'lucide-react';
import { apiService, Address, AddAddressRequest } from '../../services/api';
import './CheckoutPage.css';

interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  selectedVariant?: string;
  seller: string;
  product_id?: string;
}

interface ShippingOption {
  id: string;
  name: string;
  price: number;
  etd: string; // Estimated time of delivery
}

const SHIPPING_OPTIONS: ShippingOption[] = [
  { id: 'reguler', name: 'Reguler (AnterAja)', price: 21400, etd: '15 - 18 Jan' },
  { id: 'kargo', name: 'Kargo (JNE Trucking)', price: 143500, etd: '17 - 24 Jan' },
  { id: 'instant', name: 'Instant (GoSend)', price: 35000, etd: '3 Jam' },
];

const PAYMENT_METHODS = [
  { id: 'bca_va', name: 'BCA Virtual Account', logo: 'https://upload.wikimedia.org/wikipedia/commons/5/5c/Bank_Central_Asia.svg' },
  { id: 'mandiri_va', name: 'Mandiri Virtual Account', logo: 'https://upload.wikimedia.org/wikipedia/commons/a/ad/Bank_Mandiri_logo_2016.svg' },
  { id: 'bri_va', name: 'BRI Virtual Account', logo: 'https://upload.wikimedia.org/wikipedia/commons/6/68/BANK_BRI_logo.svg' },
  { id: 'cimb_va', name: 'CIMB Virtual Account', logo: 'https://upload.wikimedia.org/wikipedia/commons/b/b5/Bank_CIMB_Niaga_logo.svg' },
  { id: 'cod', name: 'Bayar di Tempat (COD)', logo: '' }, // No logo for COD generic
];

const CheckoutPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  
  // Address State
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [addressForm, setAddressForm] = useState<AddAddressRequest>({
    recipient_name: '',
    phone_number: '',
    address_line1: '',
    address_line2: '',
    city: '',
    province: '',
    postal_code: '',
    label: 'Rumah',
    is_primary: false
  });
  
  // Checkout State
  const [selectedPayment, setSelectedPayment] = useState('bca_va');
  const [shippingSelections, setShippingSelections] = useState<Record<string, string>>({});
  const [insuranceSelections, setInsuranceSelections] = useState<Record<string, boolean>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 1. Get items
    if (location.state?.items) {
      setItems(location.state.items);
      
      // Initialize shipping for each seller
      const initialShipping: Record<string, string> = {};
      const uniqueSellers = Array.from(new Set(location.state.items.map((i: CartItem) => i.seller)));
      uniqueSellers.forEach((seller: any) => {
        initialShipping[seller] = 'reguler'; // Default
      });
      setShippingSelections(initialShipping);
    } else {
      navigate('/cart');
    }
    
    // 2. Get User Profile & Addresses
    const fetchData = async () => {
        const profileRes = await apiService.getProfile();
        if (!profileRes.error && profileRes.data) {
            setUserProfile(profileRes.data);
        }

        const addressRes = await apiService.getAddresses();
        if (!addressRes.error && addressRes.data && Array.isArray(addressRes.data)) {
            setAddresses(addressRes.data);
            const primary = addressRes.data.find(a => a.is_primary);
            if (primary) {
                setSelectedAddressId(primary.id);
            } else if (addressRes.data.length > 0) {
                setSelectedAddressId(addressRes.data[0].id);
            }
        } else {
            console.warn('Addresses response data is not an array:', addressRes.data);
            setAddresses([]);
        }
    };
    fetchData();
  }, [location, navigate]);

  // Address Helper
  const getSelectedAddress = () => {
    return addresses.find(a => a.id === selectedAddressId);
  };

  const formatAddress = (addr: Address) => {
    return `${addr.address_line1}${addr.address_line2 ? ', ' + addr.address_line2 : ''}, ${addr.city}, ${addr.province}, ${addr.postal_code}, ${addr.country} (${addr.phone_number})`;
  };

  const resetAddressForm = () => {
    setAddressForm({
      recipient_name: userProfile?.full_name || '',
      phone_number: userProfile?.phone || '',
      address_line1: '',
      address_line2: '',
      city: '',
      province: '',
      postal_code: '',
      label: 'Rumah',
      is_primary: false
    });
    setEditingAddressId(null);
    setIsEditingAddress(false);
  };

  const handleEditAddress = (addr: Address) => {
    setAddressForm({
      recipient_name: addr.recipient_name,
      phone_number: addr.phone_number,
      address_line1: addr.address_line1,
      address_line2: addr.address_line2 || '',
      city: addr.city,
      province: addr.province,
      postal_code: addr.postal_code,
      label: addr.label,
      is_primary: addr.is_primary
    });
    setEditingAddressId(addr.id);
    setIsEditingAddress(true);
  };

  const handleDeleteAddress = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Yakin ingin menghapus alamat ini?')) return;

    const res = await apiService.deleteAddress(id);
    if (!res.error) {
        const newAddresses = addresses.filter(a => a.id !== id);
        setAddresses(newAddresses);
        if (selectedAddressId === id) {
            setSelectedAddressId(newAddresses.length > 0 ? newAddresses[0].id : '');
        }
    }
  };

  const handleSaveAddress = async () => {
    setLoading(true);
    try {
        let res;
        if (editingAddressId) {
            res = await apiService.updateAddress(editingAddressId, addressForm);
        } else {
            res = await apiService.addAddress(addressForm);
        }

        if (!res.error && res.data) {
            const savedAddress = res.data;
            if (editingAddressId) {
                setAddresses(addresses.map(a => a.id === editingAddressId ? savedAddress : a));
            } else {
                setAddresses([...addresses, savedAddress]);
            }
            
            // If it's the only address or set as primary, select it
            if (savedAddress.is_primary || addresses.length === 0) {
                setSelectedAddressId(savedAddress.id);
            }
            
            resetAddressForm();
        } else {
            alert(res.message);
        }
    } catch (err: any) {
        alert(err.message || 'Gagal menyimpan alamat');
    } finally {
        setLoading(false);
    }
  };

  // Group items by seller
  const itemsBySeller = items.reduce((acc, item) => {
    if (!acc[item.seller]) {
      acc[item.seller] = [];
    }
    acc[item.seller].push(item);
    return acc;
  }, {} as Record<string, CartItem[]>);

  // Calculations
  const calculateTotals = () => {
    const itemsTotal = items.reduce((total, item) => total + (item.price * item.quantity), 0);
    
    let shippingTotal = 0;
    Object.keys(itemsBySeller).forEach(seller => {
        const methodId = shippingSelections[seller];
        const option = SHIPPING_OPTIONS.find(o => o.id === methodId);
        if (option) shippingTotal += option.price;
    });

    let insuranceTotal = 0;
    Object.keys(itemsBySeller).forEach(seller => {
        if (insuranceSelections[seller]) {
            // Dummy insurance calc: 0.5% of store items total
            const storeItems = itemsBySeller[seller];
            const storeTotal = storeItems.reduce((t, i) => t + (i.price * i.quantity), 0);
            insuranceTotal += Math.round(storeTotal * 0.005);
        }
    });

    return {
        itemsTotal,
        shippingTotal,
        insuranceTotal,
        grandTotal: itemsTotal + shippingTotal + insuranceTotal
    };
  };

  const totals = calculateTotals();

  const handlePlaceOrder = async () => {
    const selectedAddress = getSelectedAddress();
    if (!selectedAddress) {
        setError('Silakan pilih atau tambahkan alamat pengiriman terlebih dahulu.');
        return;
    }

    setLoading(true);
    setError(null);

    try {
            const checkoutItems = items.map(item => {
              const productId = (item.product_id || item.id || '') as string;
              if (!productId) {
                throw new Error(`Produk tidak valid: ${item.name}`);
              }
              return {
                product_id: productId,
                quantity: item.quantity,
                variant: item.selectedVariant
              };
            });

            const response = await apiService.checkout({
        items: checkoutItems,
        shipping_address: formatAddress(selectedAddress),
        payment_method: selectedPayment,
        notes: JSON.stringify(notes) // stringify notes object for now
      });

      if (response.error) {
        throw new Error(response.message);
      }
      
      // Clear cart after successful checkout
      await apiService.clearCart();

      navigate('/orders', { replace: true });
      
    } catch (err: any) {
      setError(err.message || 'Gagal membuat pesanan');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) return null;

  const selectedAddress = getSelectedAddress();

  return (
    <div className="checkout-page">
      <div className="checkout-header">
        <h2>Checkout</h2>
      </div>

      <div className="checkout-container">
        {/* Left Column: Address & Orders */}
        <div className="checkout-main">
            
            {/* Address Section */}
            <div className="checkout-card address-card">
                <h3 className="section-title">Alamat Pengiriman</h3>
                <div className="address-card-content">
                    {selectedAddress ? (
                        <>
                            <div className="address-header">
                                <div className="address-label">
                                    <MapPin size={18} fill="#03ac0e" color="white" />
                                    <span>{selectedAddress.label} • {selectedAddress.recipient_name}</span>
                                    {selectedAddress.is_primary && <span className="address-tag">Utama</span>}
                                </div>
                                <button className="change-address-btn" onClick={() => setIsAddressModalOpen(true)}>Ganti</button>
                            </div>
                            <div className="address-details">
                                <div className="address-recipient">{selectedAddress.recipient_name} ({selectedAddress.phone_number})</div>
                                <div className="address-text">{selectedAddress.address_line1}{selectedAddress.address_line2 ? `, ${selectedAddress.address_line2}` : ''}</div>
                                <div className="address-text">{selectedAddress.city}, {selectedAddress.province}, {selectedAddress.postal_code}</div>
                            </div>
                        </>
                    ) : (
                        <div style={{textAlign: 'center', padding: '20px'}}>
                            <p>Belum ada alamat tersimpan.</p>
                            <button className="add-address-btn" onClick={() => { setIsAddressModalOpen(true); setIsEditingAddress(true); }}>
                                <Plus size={16} /> Tambah Alamat Baru
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Orders per Store */}
            {Object.entries(itemsBySeller).map(([seller, storeItems]) => (
                <div key={seller} className="checkout-card order-card">
                    <div className="store-header">
                        <span className="store-name">{seller}</span>
                        <img src="/verified.png" alt="verified" className="verified-badge" onError={(e) => e.currentTarget.style.display = 'none'} />
                    </div>

                    {storeItems.map((item, idx) => (
                        <div key={idx} className="order-item">
                            <img src={item.image} alt={item.name} className="item-image" />
                            <div className="item-info">
                                <div className="item-name">{item.name}</div>
                                {item.selectedVariant && <div className="item-variant">Varian: {item.selectedVariant}</div>}
                                <div className="item-price-row">{item.quantity} x Rp {item.price.toLocaleString('id-ID')}</div>
                            </div>
                            <div className="item-total" style={{fontWeight: 'bold'}}>
                                Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                            </div>
                        </div>
                    ))}

                    <div className="shipping-section">
                        <select 
                            className="shipping-select"
                            value={shippingSelections[seller]}
                            onChange={(e) => setShippingSelections({...shippingSelections, [seller]: e.target.value})}
                        >
                            {SHIPPING_OPTIONS.map(opt => (
                                <option key={opt.id} value={opt.id}>
                                    {opt.name} (Rp {opt.price.toLocaleString('id-ID')}) - Est. {opt.etd}
                                </option>
                            ))}
                        </select>

                        <label className="insurance-checkbox">
                            <input 
                                type="checkbox"
                                checked={!!insuranceSelections[seller]}
                                onChange={(e) => setInsuranceSelections({...insuranceSelections, [seller]: e.target.checked})}
                            />
                            <ShieldCheck size={16} />
                            <span>Pakai Asuransi Pengiriman (Rp {Math.round(storeItems.reduce((t, i) => t + (i.price * i.quantity), 0) * 0.005).toLocaleString('id-ID')})</span>
                        </label>

                        <div className="note-input-wrapper">
                            <input 
                                type="text" 
                                className="note-input"
                                placeholder="Kasih Catatan (Opsional)"
                                value={notes[seller] || ''}
                                onChange={(e) => setNotes({...notes, [seller]: e.target.value})}
                            />
                        </div>
                    </div>
                </div>
            ))}
        </div>

        {/* Right Column: Payment & Summary */}
        <div className="checkout-sidebar">
            <div className="checkout-card">
                <h3 className="section-title">Metode Pembayaran</h3>
                <div className="payment-method-list">
                    {PAYMENT_METHODS.map(method => (
                        <label key={method.id} className="payment-method-item">
                            <div className="payment-method-info">
                                {method.logo && <img src={method.logo} alt={method.name} className="payment-logo" />}
                                <span className="payment-name">{method.name}</span>
                            </div>
                            <input 
                                type="radio" 
                                name="payment" 
                                className="payment-radio"
                                checked={selectedPayment === method.id}
                                onChange={() => setSelectedPayment(method.id)}
                            />
                        </label>
                    ))}
                </div>
            </div>

            <div className="checkout-card">
                <button className="promo-btn">
                    <div style={{display:'flex', alignItems:'center'}}>
                        <Ticket size={20} className="promo-icon" fill="#ff9800" />
                        <span>Pakai promo biar makin hemat!</span>
                    </div>
                    <ChevronRight size={16} color="#999" />
                </button>
            </div>

            <div className="checkout-card">
                <h3 className="summary-title">Ringkasan Belanja</h3>
                
                <div className="summary-row">
                    <span>Total Harga ({items.length} Barang)</span>
                    <span>Rp {totals.itemsTotal.toLocaleString('id-ID')}</span>
                </div>
                <div className="summary-row">
                    <span>Total Ongkos Kirim</span>
                    <span>Rp {totals.shippingTotal.toLocaleString('id-ID')}</span>
                </div>
                <div className="summary-row">
                    <span>Total Asuransi Pengiriman</span>
                    <span>Rp {totals.insuranceTotal.toLocaleString('id-ID')}</span>
                </div>
                
                <div className="summary-total">
                    <span className="total-label">Total Tagihan</span>
                    <span className="total-value">Rp {totals.grandTotal.toLocaleString('id-ID')}</span>
                </div>

                {error && (
                    <div className="checkout-error">
                        <AlertCircle size={16} />
                        <span>{error}</span>
                    </div>
                )}

                <button 
                    className="pay-btn"
                    onClick={handlePlaceOrder}
                    disabled={loading}
                >
                    {loading ? 'Memproses...' : 'Bayar Sekarang'}
                </button>

                <p className="terms-text">
                    Dengan melanjutkan pembayaran, kamu menyetujui <a href="#">S&K Asuransi Pengiriman & Proteksi</a>
                </p>
            </div>
        </div>

      </div>

      {/* Address Modal */}
      {isAddressModalOpen && (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h3>{isEditingAddress ? (editingAddressId ? 'Ubah Alamat' : 'Tambah Alamat') : 'Pilih Alamat Pengiriman'}</h3>
                    <button className="close-modal-btn" onClick={() => { setIsAddressModalOpen(false); resetAddressForm(); }}>
                        <X size={24} />
                    </button>
                </div>
                <div className="modal-body">
                    {isEditingAddress ? (
                        <div className="address-form">
                            <div className="form-group">
                                <label>Label Alamat</label>
                                <input 
                                    className="form-input" 
                                    value={addressForm.label} 
                                    onChange={e => setAddressForm({...addressForm, label: e.target.value})}
                                    placeholder="Contoh: Rumah, Kantor, Kost"
                                />
                            </div>
                            <div className="form-group">
                                <label>Nama Penerima</label>
                                <input 
                                    className="form-input" 
                                    value={addressForm.recipient_name} 
                                    onChange={e => setAddressForm({...addressForm, recipient_name: e.target.value})}
                                />
                            </div>
                            <div className="form-group">
                                <label>Nomor Telepon</label>
                                <input 
                                    className="form-input" 
                                    value={addressForm.phone_number} 
                                    onChange={e => setAddressForm({...addressForm, phone_number: e.target.value})}
                                />
                            </div>
                            <div className="form-group">
                                <label>Alamat Lengkap</label>
                                <input 
                                    className="form-input" 
                                    value={addressForm.address_line1} 
                                    onChange={e => setAddressForm({...addressForm, address_line1: e.target.value})}
                                    placeholder="Nama Jalan, No. Rumah, RT/RW"
                                />
                            </div>
                            <div className="form-group">
                                <label>Detail Lainnya (Opsional)</label>
                                <input 
                                    className="form-input" 
                                    value={addressForm.address_line2 || ''} 
                                    onChange={e => setAddressForm({...addressForm, address_line2: e.target.value})}
                                    placeholder="Blok, Patokan, dll"
                                />
                            </div>
                            <div className="form-group">
                                <label>Kota / Kabupaten</label>
                                <input 
                                    className="form-input" 
                                    value={addressForm.city} 
                                    onChange={e => setAddressForm({...addressForm, city: e.target.value})}
                                />
                            </div>
                            <div className="form-group">
                                <label>Provinsi</label>
                                <input 
                                    className="form-input" 
                                    value={addressForm.province} 
                                    onChange={e => setAddressForm({...addressForm, province: e.target.value})}
                                />
                            </div>
                            <div className="form-group">
                                <label>Kode Pos</label>
                                <input 
                                    className="form-input" 
                                    value={addressForm.postal_code} 
                                    onChange={e => setAddressForm({...addressForm, postal_code: e.target.value})}
                                />
                            </div>
                            <label className="form-checkbox">
                                <input 
                                    type="checkbox"
                                    checked={addressForm.is_primary}
                                    onChange={e => setAddressForm({...addressForm, is_primary: e.target.checked})}
                                />
                                Jadikan Alamat Utama
                            </label>

                            <div className="form-actions">
                                <button className="btn-cancel" onClick={resetAddressForm}>Batal</button>
                                <button className="btn-save" onClick={handleSaveAddress} disabled={loading}>
                                    {loading ? 'Menyimpan...' : 'Simpan Alamat'}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="address-list">
                            {Array.isArray(addresses) && addresses.map(addr => (
                                <div 
                                    key={addr.id} 
                                    className={`address-item ${selectedAddressId === addr.id ? 'selected' : ''}`}
                                    onClick={() => { setSelectedAddressId(addr.id); setIsAddressModalOpen(false); }}
                                >
                                    <div className="address-item-header">
                                        <div className="address-label-text">
                                            {addr.label} {addr.is_primary && <span className="address-tag">Utama</span>}
                                        </div>
                                        <div className="address-actions">
                                            <button className="address-action-btn" onClick={(e) => { e.stopPropagation(); handleEditAddress(addr); }}>Ubah</button>
                                            <button className="address-action-btn delete" onClick={(e) => handleDeleteAddress(addr.id, e)}>Hapus</button>
                                        </div>
                                    </div>
                                    <div className="address-recipient">{addr.recipient_name}</div>
                                    <div className="address-phone">{addr.phone_number}</div>
                                    <div className="address-text">
                                        {addr.address_line1}
                                        {addr.address_line2 && <>, {addr.address_line2}</>}
                                        <br/>
                                        {addr.city}, {addr.province}, {addr.postal_code}
                                    </div>
                                </div>
                            ))}

                            {addresses.length < 3 && (
                                <button className="add-address-btn" onClick={() => setIsEditingAddress(true)}>
                                    <Plus size={16} /> Tambah Alamat Baru
                                </button>
                            )}
                            {addresses.length >= 3 && (
                                <p style={{textAlign:'center', color:'#999', fontSize:'12px'}}>
                                    Maksimal 3 alamat tersimpan.
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default CheckoutPage;
