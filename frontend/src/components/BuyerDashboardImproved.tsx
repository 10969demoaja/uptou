import React, { useEffect, useState } from 'react';
import { 
  User, Package, Heart, MapPin, CreditCard, Bell, HelpCircle, 
  Star, Truck, MessageCircle, Edit, Trash2, Plus, Filter,
  Eye, RotateCcw, ShoppingBag, Search, ArrowLeft
} from 'lucide-react';
import './BuyerDashboard.css';
import { apiService, WishlistProduct, UserNotificationItem, RecommendationProduct } from '../services/api';

interface BuyerDashboardProps {
  onSwitchToGuest: () => void;
}

const BuyerDashboardImproved: React.FC<BuyerDashboardProps> = ({ onSwitchToGuest }) => {
  const [activeTab, setActiveTab] = useState('profile');
  const [orderFilter, setOrderFilter] = useState('all');
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [wishlistItems, setWishlistItems] = useState<WishlistProduct[]>([]);
  const [notifications, setNotifications] = useState<UserNotificationItem[]>([]);
  const [recommendations, setRecommendations] = useState<RecommendationProduct[]>([]);

  const menuItems = [
    { id: 'profile', label: 'Profil Saya', icon: User },
    { id: 'orders', label: 'Pesanan Saya', icon: Package },
    { id: 'wishlist', label: 'Wishlist', icon: Heart },
    { id: 'address', label: 'Alamat', icon: MapPin },
    { id: 'payment', label: 'Pembayaran', icon: CreditCard },
    { id: 'chat', label: 'Chat', icon: MessageCircle },
    { id: 'notifications', label: 'Notifikasi', icon: Bell },
    { id: 'help', label: 'Bantuan', icon: HelpCircle },
  ];

  // Mock data
  const userData = {
    name: 'John Doe',
    email: 'john.doe@email.com',
    phone: '+62 812-3456-7890',
    joinDate: '2023-06-15',
    memberType: 'Silver',
    points: 2500,
    totalOrders: 15,
    completedOrders: 12,
    wishlistCount: 8,
    addressCount: 3,
    paymentMethodCount: 2,
  };

  const orders = [
    {
      id: 'ORD-001',
      date: '2024-01-15',
      status: 'delivered',
      statusText: 'Selesai',
      total: 21999000,
      items: [
        {
          name: 'Apple iPhone 15 Pro Max',
          image: 'https://via.placeholder.com/60x60/1a1a1a/ffffff?text=iPhone',
          variant: '128GB, Midnight',
          price: 21999000,
          quantity: 1,
        }
      ],
      seller: 'iSmile Indonesia',
      trackingNumber: 'JNE123456789',
      canReview: true,
      canReturn: false,
    },
    {
      id: 'ORD-002',
      date: '2024-01-18',
      status: 'shipping',
      statusText: 'Dalam Pengiriman',
      total: 18999000,
      items: [
        {
          name: 'Samsung Galaxy S24 Ultra',
          image: 'https://via.placeholder.com/60x60/2a2a2a/ffffff?text=Galaxy',
          variant: '256GB, Titanium Black',
          price: 18999000,
          quantity: 1,
        }
      ],
      seller: 'Samsung Official Store',
      trackingNumber: 'JNT987654321',
      estimatedDelivery: '2024-01-20',
    },
    {
      id: 'ORD-003',
      date: '2024-01-20',
      status: 'processing',
      statusText: 'Diproses',
      total: 3499000,
      items: [
        {
          name: 'AirPods Pro 2nd Generation',
          image: 'https://via.placeholder.com/60x60/3a3a3a/ffffff?text=AirPods',
          variant: 'USB-C, White',
          price: 3499000,
          quantity: 1,
        }
      ],
      seller: 'iSmile Indonesia',
      canCancel: true,
    },
  ];

  const addresses = [
    {
      id: 1,
      label: 'Rumah',
      name: 'John Doe',
      phone: '+62 812-3456-7890',
      address: 'Jl. Sudirman No. 123, Kec. Tanah Abang',
      city: 'Jakarta Pusat',
      postalCode: '10270',
      isPrimary: true,
    },
    {
      id: 2,
      label: 'Kantor',
      name: 'John Doe',
      phone: '+62 812-3456-7890',
      address: 'Jl. Thamrin No. 456, Menteng',
      city: 'Jakarta Pusat',
      postalCode: '10350',
      isPrimary: false,
    },
  ];

  const paymentMethods = [
    {
      id: 1,
      type: 'card',
      name: 'BCA Virtual Account',
      number: '**** **** **** 1234',
      isPrimary: true,
    },
    {
      id: 2,
      type: 'ewallet',
      name: 'UPTOU Pay',
      balance: 150000,
      isPrimary: false,
    },
  ];

  const chatList = [
    {
      id: 1,
      seller: 'iSmile Indonesia',
      lastMessage: 'Produk sudah dikirim ya kak',
      time: '10:30',
      unread: 2,
      online: true,
    },
    {
      id: 2,
      seller: 'Samsung Official Store',
      lastMessage: 'Terima kasih sudah berbelanja',
      time: 'Kemarin',
      unread: 0,
      online: false,
    },
  ];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return '#28a745';
      case 'shipping': return '#007bff';
      case 'processing': return '#ffc107';
      case 'cancelled': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const filteredOrders = orderFilter === 'all' 
    ? orders 
    : orders.filter(order => order.status === orderFilter);

  useEffect(() => {
    const loadWishlist = async () => {
      try {
        const res = await apiService.getWishlistProducts();
        if (!res.error && res.data) {
          setWishlistItems(res.data.products);
        }
      } catch (_) {}
    };
    const loadRecommendations = async () => {
      try {
        const res = await apiService.getRecommendations();
        if (!res.error && res.data) {
          setRecommendations(res.data.products);
        }
      } catch (_) {}
    };
    const loadNotifications = async () => {
      try {
        const res = await apiService.getNotifications();
        if (!res.error && res.data) {
          setNotifications(res.data.notifications);
        }
      } catch (_) {}
    };
    loadWishlist();
    loadRecommendations();
    loadNotifications();
  }, []);

  const handleRemoveWishlistItem = async (productId: string) => {
    try {
      const res = await apiService.removeWishlistProduct(productId);
      if (!res.error) {
        setWishlistItems(prev => prev.filter(item => item.id !== productId));
      }
    } catch (_) {}
  };

  const handleAddWishlistItemToCart = async (productId: string) => {
    try {
      await apiService.addToCart(productId, 1);
      alert('Produk ditambahkan ke keranjang');
    } catch (err: any) {
      alert(err.message || 'Gagal menambahkan ke keranjang');
    }
  };

  const handleMarkAllNotificationsRead = async () => {
    const unread = notifications.filter(n => !n.read_at);
    setNotifications(prev =>
      prev.map(n => ({ ...n, read_at: n.read_at || new Date().toISOString() }))
    );
    for (const n of unread) {
      try {
        await apiService.markNotificationRead(n.id);
      } catch (_) {}
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="buyer-content">
            <div className="profile-overview">
              <div className="profile-card">
                <h3>📋 Informasi Akun</h3>
                <p><strong>Nama:</strong> {userData.name}</p>
                <p><strong>Email:</strong> {userData.email}</p>
                <p><strong>Telepon:</strong> {userData.phone}</p>
                <p><strong>Member:</strong> {userData.memberType}</p>
                <p><strong>Bergabung:</strong> {new Date(userData.joinDate).toLocaleDateString('id-ID')}</p>
                <button className="profile-edit-btn">
                  <Edit size={12} />
                  Edit Profil
                </button>
              </div>
              
              <div className="profile-card">
                <h3>📊 Statistik Belanja</h3>
                <p><strong>Total Pesanan:</strong> {userData.totalOrders}</p>
                <p><strong>Pesanan Selesai:</strong> {userData.completedOrders}</p>
                <p><strong>UPTOU Points:</strong> {userData.points.toLocaleString()}</p>
                <p><strong>Item Wishlist:</strong> {userData.wishlistCount}</p>
                <button className="profile-edit-btn">
                  <Eye size={12} />
                  Lihat Detail
                </button>
              </div>
              
              <div className="profile-card">
                <h3>🏆 Status Member</h3>
                <p><strong>Level:</strong> {userData.memberType}</p>
                <p><strong>Points:</strong> {userData.points.toLocaleString()}</p>
                <p><strong>Keuntungan:</strong></p>
                <p>• Gratis ongkir unlimited</p>
                <p>• Prioritas customer service</p>
                <button className="profile-edit-btn">
                  <Star size={12} />
                  Upgrade Member
                </button>
              </div>
            </div>

            {recommendations.length > 0 && (
              <div className="profile-overview">
                <div className="profile-card" style={{ flex: 1 }}>
                  <h3>✨ Rekomendasi Untuk Kamu</h3>
                  <div className="wishlist-grid">
                    {recommendations.slice(0, 4).map((p) => (
                      <div key={p.id} className="wishlist-card">
                        <div className="wishlist-image">
                          <img src={p.main_image || '/img.png'} alt={p.name} />
                        </div>
                        <div className="wishlist-info">
                          <h4>{p.name}</h4>
                          <div className="seller-info">
                            <span>🏪 {p.store?.name || 'Toko'}</span>
                          </div>
                          <div className="rating">
                            <Star size={14} fill="currentColor" />
                            <span>{p.rating.toFixed(1)}</span>
                          </div>
                          <div className="price-section">
                            <span className="current-price">{formatPrice(p.price)}</span>
                            {p.discount_price && p.discount_price < p.price && (
                              <span className="original-price">{formatPrice(p.discount_price)}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="help-content">
              <div className="help-category">
                <h3>
                  <User size={16} />
                  Akun & Profil
                </h3>
                <div className="help-links">
                  <a href="#edit-profile">Edit Informasi Profil</a>
                  <a href="#change-password">Ubah Password</a>
                  <a href="#privacy-settings">Pengaturan Privasi</a>
                  <a href="#account-security">Keamanan Akun</a>
                </div>
              </div>
              
              <div className="help-category">
                <h3>
                  <Bell size={16} />
                  Notifikasi
                </h3>
                <div className="help-links">
                  <a href="#email-notifications">Notifikasi Email</a>
                  <a href="#push-notifications">Push Notification</a>
                  <a href="#order-updates">Update Pesanan</a>
                  <a href="#promo-alerts">Alert Promosi</a>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'orders':
        return (
          <div className="buyer-content">
            <div className="content-header">
              <h2>Pesanan Saya</h2>
              <div className="order-search">
                <Search size={16} />
                <input placeholder="Cari pesanan..." />
              </div>
            </div>
            
            <div className="order-filters">
              {['all', 'processing', 'shipping', 'delivered', 'cancelled'].map((filter) => (
                <button
                  key={filter}
                  className={`filter-btn ${orderFilter === filter ? 'active' : ''}`}
                  onClick={() => setOrderFilter(filter)}
                >
                  {filter === 'all' ? 'Semua' : 
                   filter === 'processing' ? 'Diproses' :
                   filter === 'shipping' ? 'Dikirim' :
                   filter === 'delivered' ? 'Selesai' : 'Dibatalkan'}
                </button>
              ))}
            </div>
            
            <div className="orders-list">
              {filteredOrders.map((order) => (
                <div key={order.id} className="order-card">
                  <div className="order-header">
                    <div className="order-info">
                      <span className="order-id">{order.id}</span>
                      <span className="order-date">{new Date(order.date).toLocaleDateString('id-ID')}</span>
                    </div>
                    <span 
                      className="order-status"
                      style={{ color: getStatusColor(order.status) }}
                    >
                      {order.statusText}
                    </span>
                  </div>
                  
                  <div className="order-seller">
                    <span>🏪 {order.seller}</span>
                  </div>
                  
                  <div className="order-items">
                    {order.items.map((item, index) => (
                      <div key={index} className="order-item">
                        <img src={item.image} alt={item.name} />
                        <div className="item-details">
                          <h4>{item.name}</h4>
                          {item.variant && <p>{item.variant}</p>}
                          <div className="item-price">
                            {formatPrice(item.price)} x {item.quantity}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="order-footer">
                    <div className="order-total">
                      Total: {formatPrice(order.total)}
                    </div>
                    <div className="order-actions">
                      {order.status === 'shipping' && (
                        <button className="track-btn">
                          <Truck size={16} />
                          Lacak
                        </button>
                      )}
                      {order.canReview && (
                        <button className="review-btn">
                          <Star size={16} />
                          Ulasan
                        </button>
                      )}
                      {order.canReturn && (
                        <button className="return-btn">
                          <RotateCcw size={16} />
                          Retur
                        </button>
                      )}
                      {order.canCancel && (
                        <button className="cancel-btn">Batalkan</button>
                      )}
                      <button className="detail-btn">
                        <Eye size={16} />
                        Detail
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      
      case 'wishlist':
        return (
          <div className="buyer-content">
            <div className="content-header">
              <h2>Wishlist Saya</h2>
              <span className="item-count">{wishlistItems.length} item</span>
            </div>
            
            <div className="wishlist-grid">
              {wishlistItems.map((item) => (
                <div key={item.id} className="wishlist-card">
                  <div className="wishlist-image">
                    <img src={item.main_image || '/img.png'} alt={item.name} />
                    {item.discount_price && item.discount_price < item.price && (
                      <div className="discount-badge">
                        Hemat {Math.round(((item.price - item.discount_price) / item.price) * 100)}%
                      </div>
                    )}
                  </div>
                  
                  <div className="wishlist-info">
                    <h4>{item.name}</h4>
                    <div className="seller-info">
                      <span>🏪 {item.store?.name || 'Toko'}</span>
                    </div>
                    <div className="rating">
                      <Star size={14} fill="currentColor" />
                      <span>{item.rating.toFixed(1)}</span>
                    </div>
                    <div className="price-section">
                      <span className="current-price">{formatPrice(item.price)}</span>
                      {item.discount_price && item.discount_price < item.price && (
                        <span className="original-price">{formatPrice(item.discount_price)}</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="wishlist-actions">
                    <button 
                      className="add-to-cart-btn" 
                      onClick={() => handleAddWishlistItemToCart(item.id)}
                    >
                      + Keranjang
                    </button>
                    <button
                      className="remove-wishlist-btn"
                      onClick={() => handleRemoveWishlistItem(item.id)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      
      case 'address':
        return (
          <div className="buyer-content">
            <div className="content-header">
              <h2>Alamat Saya</h2>
              <button 
                className="add-btn"
                onClick={() => setAddressModalOpen(true)}
              >
                <Plus size={16} />
                Tambah Alamat
              </button>
            </div>
            
            <div className="address-list">
              {addresses.map((address) => (
                <div key={address.id} className="address-card">
                  <div className="address-header">
                    <div className="address-label">
                      <span>{address.label}</span>
                      {address.isPrimary && (
                        <span className="primary-badge">Utama</span>
                      )}
                    </div>
                    <div className="address-actions">
                      <button className="edit-address-btn">
                        <Edit size={16} />
                      </button>
                      <button className="delete-address-btn">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="address-details">
                    <p className="address-name">{address.name}</p>
                    <p className="address-phone">{address.phone}</p>
                    <p className="address-text">
                      {address.address}<br />
                      {address.city} {address.postalCode}
                    </p>
                  </div>
                  
                  {!address.isPrimary && (
                    <button className="set-primary-btn">
                      Jadikan Alamat Utama
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      
      case 'payment':
        return (
          <div className="buyer-content">
            <div className="content-header">
              <h2>Metode Pembayaran</h2>
              <button className="add-btn">
                <Plus size={16} />
                Tambah Metode
              </button>
            </div>
            
            <div className="payment-list">
              {paymentMethods.map((method) => (
                <div key={method.id} className="payment-card">
                  <div className="payment-header">
                    <div className="payment-type">
                      <CreditCard size={20} />
                      <span>{method.name}</span>
                      {method.isPrimary && (
                        <span className="primary-badge">Utama</span>
                      )}
                    </div>
                    <div className="payment-actions">
                      <button className="edit-payment-btn">
                        <Edit size={16} />
                      </button>
                      <button className="delete-payment-btn">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="payment-details">
                    {method.type === 'card' ? (
                      <p>{method.number}</p>
                    ) : (
                      <p>Saldo: {formatPrice(method.balance || 0)}</p>
                    )}
                  </div>
                  
                  {!method.isPrimary && (
                    <button className="set-primary-btn">
                      Jadikan Metode Utama
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      case 'chat':
        return (
          <div className="buyer-content">
            <div className="content-header">
              <h2>Chat</h2>
              <div className="chat-search">
                <Search size={16} />
                <input placeholder="Cari chat..." />
              </div>
            </div>
            
            <div className="chat-list">
              {chatList.map((chat) => (
                <div key={chat.id} className="chat-item">
                  <div className="chat-avatar">
                    {chat.seller.charAt(0).toUpperCase()}
                    {chat.online && <div className="online-indicator"></div>}
                  </div>
                  
                  <div className="chat-content">
                    <div className="chat-seller">{chat.seller}</div>
                    <div className="chat-message">{chat.lastMessage}</div>
                  </div>
                  
                  <div className="chat-meta">
                    <div className="chat-time">{chat.time}</div>
                    {chat.unread > 0 && (
                      <div className="unread-badge">{chat.unread}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="buyer-content">
            <div className="content-header">
              <h2>Notifikasi</h2>
              <button className="mark-all-read-btn" onClick={handleMarkAllNotificationsRead}>Tandai Semua Dibaca</button>
            </div>
            
            <div className="notifications-list">
              {notifications.map((notif) => (
                <div 
                  key={notif.id} 
                  className={`notification-item ${!notif.read_at ? 'unread' : ''}`}
                >
                  <div className={`notification-icon ${notif.type}`}>
                    {notif.type === 'order' ? <Package size={20} /> : <Bell size={20} />}
                  </div>
                  
                  <div className="notification-content">
                    <div className="notification-title">{notif.title}</div>
                    <div className="notification-message">{notif.body}</div>
                    <div className="notification-time">
                      {notif.created_at ? new Date(notif.created_at).toLocaleString('id-ID') : ''}
                    </div>
                  </div>
                  
                  {!notif.read_at && <div className="unread-dot"></div>}
                </div>
              ))}
            </div>
          </div>
        );

      case 'help':
        return (
          <div className="buyer-content">
            <div className="help-content">
              <div className="help-category">
                <h3>
                  <Package size={16} />
                  Pesanan & Pembayaran
                </h3>
                <div className="help-links">
                  <a href="#order-status">Status Pesanan</a>
                  <a href="#payment-methods">Metode Pembayaran</a>
                  <a href="#refund-return">Pengembalian & Refund</a>
                  <a href="#order-tracking">Lacak Pesanan</a>
                </div>
              </div>
              
              <div className="help-category">
                <h3>
                  <Truck size={16} />
                  Pengiriman
                </h3>
                <div className="help-links">
                  <a href="#shipping-info">Info Pengiriman</a>
                  <a href="#delivery-area">Area Pengiriman</a>
                  <a href="#shipping-cost">Biaya Ongkir</a>
                  <a href="#delivery-time">Estimasi Pengiriman</a>
                </div>
              </div>
              
              <div className="help-category">
                <h3>
                  <User size={16} />
                  Akun & Keamanan
                </h3>
                <div className="help-links">
                  <a href="#account-security">Keamanan Akun</a>
                  <a href="#forgot-password">Lupa Password</a>
                  <a href="#privacy-policy">Kebijakan Privasi</a>
                  <a href="#terms-service">Syarat & Ketentuan</a>
                </div>
              </div>
              
              <div className="help-category">
                <h3>
                  <MessageCircle size={16} />
                  Kontak & Dukungan
                </h3>
                <div className="help-links">
                  <a href="#customer-service">Customer Service</a>
                  <a href="#live-chat">Live Chat</a>
                  <a href="#email-support">Email Support</a>
                  <a href="#faq">FAQ</a>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="buyer-content">
            <h2>{menuItems.find(item => item.id === activeTab)?.label}</h2>
            <p>Fitur ini sedang dalam pengembangan.</p>
          </div>
        );
    }
  };

  return (
    <div className="buyer-dashboard">
      <div className="dashboard-container">
        {/* Sidebar */}
        <div className="dashboard-sidebar">
          <div className="sidebar-header">
            <div className="user-avatar">
              {userData.name.charAt(0).toUpperCase()}
            </div>
            <div className="user-info">
              <h3>{userData.name}</h3>
              <p>{userData.email}</p>
              <p>Member {userData.memberType}</p>
            </div>
            <div className="user-stats">
              <div className="stat-item">
                <span className="stat-value">{userData.totalOrders}</span>
                <span className="stat-label">Pesanan</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{userData.points}</span>
                <span className="stat-label">Poin</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{userData.wishlistCount}</span>
                <span className="stat-label">Wishlist</span>
              </div>
            </div>
          </div>
          
                  <nav className="sidebar-menu">
                    {menuItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.id}
                          className={`menu-item ${activeTab === item.id ? 'active' : ''}`}
                          onClick={() => setActiveTab(item.id)}
                        >
                          <Icon size={20} />
                          <span>{item.label}</span>
                          {item.id === 'chat' && chatList.reduce((sum, chat) => sum + chat.unread, 0) > 0 && (
                            <span className="nav-badge">
                              {chatList.reduce((sum, chat) => sum + chat.unread, 0)}
                            </span>
                          )}
                          {item.id === 'notifications' && notifications.filter(n => !n.read_at).length > 0 && (
                            <span className="nav-badge">
                              {notifications.filter(n => !n.read_at).length}
                            </span>
                          )}
                        </button>
                      );
                    })}
          </nav>
        </div>

        {/* Main Content */}
        <div className="dashboard-main">
          <div className="dashboard-header">
            <h1>
              {menuItems.find(item => item.id === activeTab)?.label || 'Dashboard'}
            </h1>
            <button 
              className="back-to-shop-btn" 
              onClick={onSwitchToGuest}
            >
              <ArrowLeft size={16} />
              Kembali ke Toko
            </button>
          </div>
          
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default BuyerDashboardImproved; 
