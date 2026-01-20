import React, { useEffect, useState } from 'react';
import { Package, ShoppingBag, Clock, Truck, CheckCircle, XCircle } from 'lucide-react';
import './OrderPage.css';
import { apiService, Order } from '../../services/api';
import ChatPage from './ChatPage';

interface OrderPageProps {
  onBack: () => void;
}

const OrderPage: React.FC<OrderPageProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState('all');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [trackingLoadingId, setTrackingLoadingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDateRange, setSelectedDateRange] = useState('');
  const [centerView, setCenterView] = useState<
    'orders' | 'chat' | 'reviews' | 'help_messages' | 'complaints' | 'updates'
  >('orders');
  const [moreMenuOpenId, setMoreMenuOpenId] = useState<string | null>(null);
  const [detailOrder, setDetailOrder] = useState<Order | null>(null);
  const [detailInvoice, setDetailInvoice] = useState<any | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value || 0);
  };

  const getStatusLabel = (status: Order['status']) => {
    if (status === 'pending') return 'Belum Bayar';
    if (status === 'processing') return 'Sedang Dikemas';
    if (status === 'shipped') return 'Dalam Pengiriman';
    if (status === 'delivered' || status === 'completed') return 'Selesai';
    if (status === 'cancelled') return 'Dibatalkan';
    return status;
  };

  const getStatusColor = (status: Order['status']) => {
    if (status === 'pending') return '#ff9500';
    if (status === 'processing') return '#007aff';
    if (status === 'shipped') return '#5856d6';
    if (status === 'delivered' || status === 'completed') return '#34c759';
    if (status === 'cancelled') return '#ff3b30';
    return '#666666';
  };

  const getPaymentStatusLabel = (status: string) => {
    if (!status) return 'Status pembayaran tidak diketahui';
    const normalized = status.toLowerCase();
    if (normalized === 'pending' || normalized === 'unpaid') return 'Menunggu pembayaran';
    if (normalized === 'paid' || normalized === 'success') return 'Sudah dibayar';
    if (normalized === 'failed') return 'Pembayaran gagal';
    if (normalized === 'refunded') return 'Dana dikembalikan';
    return status;
  };

  const getPaymentMethodLabel = (method: string) => {
    if (!method) return 'Metode pembayaran tidak diketahui';
    if (method === 'bca_va') return 'BCA Virtual Account';
    if (method === 'mandiri_va') return 'Mandiri Virtual Account';
    if (method === 'bri_va') return 'BRI Virtual Account';
    if (method === 'cimb_va') return 'CIMB Virtual Account';
    if (method === 'cod') return 'Bayar di Tempat (COD)';
    return method;
  };

  const handleTrackOrder = async (orderId: string) => {
    try {
      setTrackingLoadingId(orderId);
      const res = await apiService.getOrderShipment(orderId);
      if (!res.error && res.data) {
        const shipment = res.data.shipment;
        if (!shipment) {
          alert('Belum ada informasi pengiriman untuk pesanan ini.');
          return;
        }
        const parts: string[] = [];
        if (shipment.courier_name || shipment.courier_code) {
          parts.push(`Kurir: ${shipment.courier_name || shipment.courier_code}`);
        }
        if (shipment.service_name) {
          parts.push(`Layanan: ${shipment.service_name}`);
        }
        if (shipment.tracking_number) {
          parts.push(`No. Resi: ${shipment.tracking_number}`);
        }
        if (shipment.last_status) {
          parts.push(`Status Terakhir: ${shipment.last_status}`);
        } else if (shipment.status) {
          parts.push(`Status: ${shipment.status}`);
        }
        if (shipment.estimated_delivery_at) {
          parts.push(
            `Perkiraan Tiba: ${new Date(
              shipment.estimated_delivery_at
            ).toLocaleDateString('id-ID')}`
          );
        }
        alert(parts.join('\n'));
      } else {
        alert(res.message || 'Gagal mengambil informasi pengiriman');
      }
    } catch (err: any) {
      alert(err.message || 'Gagal mengambil informasi pengiriman');
    } finally {
      setTrackingLoadingId(null);
    }
  };

  const handleRequestRefund = async (orderId: string) => {
    const reason = window.prompt('Alasan refund (wajib diisi):');
    if (!reason) return;
    const description = window.prompt('Detail tambahan (opsional):') || undefined;
    try {
      const res = await apiService.requestRefund(orderId, { reason, description });
      if (!res.error) {
        alert('Permintaan refund berhasil dikirim. Tim kami akan meninjau.');
      } else {
        alert(res.message || 'Gagal mengirim permintaan refund');
      }
    } catch (err: any) {
      alert(err.message || 'Gagal mengirim permintaan refund');
    }
  };

  const handleViewInvoice = async (order: Order) => {
    try {
      setDetailLoading(true);
      setDetailOrder(order);
      const res = await apiService.getInvoice(order.id);
      if (res.error || !res.data) {
        alert(res.message || 'Gagal mengambil data invoice');
        return;
      }
      setDetailInvoice(res.data);
    } catch (err: any) {
      alert(err.message || 'Gagal membuka invoice');
    } finally {
      setDetailLoading(false);
    }
  };

  const getEmptyStateContent = () => {
    switch (activeTab) {
      case 'pending':
        return {
          icon: <Clock size={48} />,
          title: 'Belum Ada Pesanan Menunggu Pembayaran',
          subtitle: 'Pesanan yang belum dibayar akan muncul di sini'
        };
      case 'processing':
        return {
          icon: <Package size={48} />,
          title: 'Belum Ada Pesanan Sedang Dikemas',
          subtitle: 'Pesanan yang sedang disiapkan akan muncul di sini'
        };
      case 'shipped':
        return {
          icon: <Truck size={48} />,
          title: 'Belum Ada Pesanan Dalam Pengiriman',
          subtitle: 'Pesanan yang sedang dikirim akan muncul di sini'
        };
      case 'delivered':
        return {
          icon: <CheckCircle size={48} />,
          title: 'Belum Ada Pesanan Selesai',
          subtitle: 'Pesanan yang sudah selesai akan muncul di sini'
        };
      case 'cancelled':
        return {
          icon: <XCircle size={48} />,
          title: 'Belum Ada Pesanan Dibatalkan',
          subtitle: 'Pesanan yang dibatalkan akan muncul di sini'
        };
      default:
        return {
          icon: <ShoppingBag size={48} />,
          title: 'Belum Ada Pesanan',
          subtitle: 'Mulai berbelanja untuk melihat pesanan Anda di sini'
        };
    }
  };

  const emptyState = getEmptyStateContent();

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const res = await apiService.getOrders();
        if (!res.error && res.data && Array.isArray(res.data)) {
          setOrders(res.data);
        } else {
          setOrders([]);
        }
      } catch (_) {
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };
    loadOrders();
  }, []);

  const filteredOrders = Array.isArray(orders) ? orders.filter(order => {
    if (activeTab !== 'all') {
      if (activeTab === 'pending' && order.status !== 'pending') return false;
      if (activeTab === 'processing' && order.status !== 'processing') return false;
      if (activeTab === 'shipped' && order.status !== 'shipped') return false;
      if (activeTab === 'delivered' && !(order.status === 'delivered' || order.status === 'completed')) {
        return false;
      }
      if (activeTab === 'cancelled' && order.status !== 'cancelled') return false;
    }

    const query = searchQuery.trim().toLowerCase();
    if (query) {
      const orderNumber = (order.order_number || order.id || '').toLowerCase();
      const matchOrderNumber = orderNumber.includes(query);
      const matchItem = (order.items || []).some(item => {
        const name = (item.product_name || item.product?.name || '').toLowerCase();
        return name.includes(query);
      });
      if (!matchOrderNumber && !matchItem) {
        return false;
      }
    }

    if (selectedDateRange) {
      const createdAt = new Date(order.created_at);
      if (!Number.isFinite(createdAt.getTime())) {
        return true;
      }
      const now = new Date();
      const diffMs = now.getTime() - createdAt.getTime();
      const diffDays = diffMs / (1000 * 60 * 60 * 24);
      if (selectedDateRange === '7days' && diffDays > 7) return false;
      if (selectedDateRange === '30days' && diffDays > 30) return false;
      if (selectedDateRange === '90days' && diffDays > 90) return false;
    }

    return true;
  }) : [];

  return (
    <div className="order-page">
      <div className="order-header">
        <div className="container">
          <h2>Daftar Transaksi</h2>
        </div>
      </div>

      <div className="order-layout">
        <aside className="order-sidebar">
          <div className="user-profile">
            <div className="user-avatar">
              C
            </div>
            <div className="user-info">
              <div className="user-name">Customer</div>
              <div className="user-subtitle">Akun Pembeli</div>
            </div>
          </div>

          <div className="sidebar-balance-card">
            <div className="sidebar-balance-title">Saldo</div>
            <div className="sidebar-balance-row">
              <span>Saldo</span>
              <span>Rp0</span>
            </div>
          </div>

          <div className="sidebar-section">
            <div className="sidebar-section-title">Kotak Masuk</div>
            <div className="sidebar-section-items">
              <button
                type="button"
                className="sidebar-section-item"
                onClick={() => {
                  setCenterView('chat');
                }}
              >
                Chat
              </button>
              <button
                type="button"
                className="sidebar-section-item"
                onClick={() => {
                  setCenterView('reviews');
                }}
              >
                Ulasan
              </button>
              <button
                type="button"
                className="sidebar-section-item"
                onClick={() => {
                  setCenterView('help_messages');
                }}
              >
                Pesan Bantuan
              </button>
              <button
                type="button"
                className="sidebar-section-item"
                onClick={() => {
                  setCenterView('complaints');
                }}
              >
                Pesanan Dikomplain
              </button>
              <button
                type="button"
                className="sidebar-section-item"
                onClick={() => {
                  setCenterView('updates');
                }}
              >
                Update
              </button>
            </div>
          </div>

          <div className="sidebar-section">
            <div className="sidebar-section-title">Pembelian</div>
            <div className="sidebar-section-items">
              <button
                type="button"
                className="sidebar-section-item"
                onClick={() => {
                  setCenterView('orders');
                  setActiveTab('pending');
                }}
              >
                Menunggu Pembayaran
              </button>
              <button
                type="button"
                className="sidebar-section-item"
                onClick={() => {
                  setCenterView('orders');
                  setActiveTab('all');
                }}
              >
                Daftar Transaksi
              </button>
            </div>
          </div>

          <div className="sidebar-section">
            <div className="sidebar-section-title">Profil Saya</div>
            <div className="sidebar-section-items">
              <button
                type="button"
                className="sidebar-section-item"
                onClick={() => {
                  window.location.href = '/profile#wishlist';
                }}
              >
                Wishlist
              </button>
              <button
                type="button"
                className="sidebar-section-item"
                onClick={() => {
                  window.location.href = '/profile#favorite-stores';
                }}
              >
                Toko Favorit
              </button>
              <button
                type="button"
                className="sidebar-section-item"
                onClick={() => {
                  window.location.href = '/profile#account-settings';
                }}
              >
                Pengaturan
              </button>
            </div>
          </div>
        </aside>

        <div className="order-content">
          {centerView === 'orders' ? (
            <>
              <div className="order-filters-top">
                <input
                  type="text"
                  placeholder="Cari nomor pesanan atau produk"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <select
                  value={selectedDateRange}
                  onChange={(e) => setSelectedDateRange(e.target.value)}
                >
                  <option value="">Semua Waktu</option>
                  <option value="7days">7 Hari Terakhir</option>
                  <option value="30days">30 Hari Terakhir</option>
                  <option value="90days">90 Hari Terakhir</option>
                </select>
              </div>

              <div className="order-tabs">
                <button 
                  className={activeTab === 'all' ? 'active' : ''}
                  onClick={() => setActiveTab('all')}
                >
                  Semua
                </button>
                <button 
                  className={activeTab === 'pending' ? 'active' : ''}
                  onClick={() => setActiveTab('pending')}
                >
                  Belum Bayar
                </button>
                <button 
                  className={activeTab === 'processing' ? 'active' : ''}
                  onClick={() => setActiveTab('processing')}
                >
                  Dikemas
                </button>
                <button 
                  className={activeTab === 'shipped' ? 'active' : ''}
                  onClick={() => setActiveTab('shipped')}
                >
                  Dikirim
                </button>
                <button 
                  className={activeTab === 'delivered' ? 'active' : ''}
                  onClick={() => setActiveTab('delivered')}
                >
                  Selesai
                </button>
                <button 
                  className={activeTab === 'cancelled' ? 'active' : ''}
                  onClick={() => setActiveTab('cancelled')}
                >
                  Dibatalkan
                </button>
              </div>

              <div className="order-list">
                {loading ? (
                  <div className="empty-orders">
                    <div className="empty-icon">
                      <Clock size={48} />
                    </div>
                    <h3>Sedang memuat pesanan...</h3>
                    <p>Harap tunggu sebentar, kami sedang mengambil data pesanan Anda</p>
                  </div>
                ) : filteredOrders.length === 0 ? (
                  <div className="empty-orders">
                    <div className="empty-icon">
                      {emptyState.icon}
                    </div>
                    <h3>{emptyState.title}</h3>
                    <p>{emptyState.subtitle}</p>
                    <button
                      className="start-shopping-btn"
                      onClick={onBack}
                    >
                      Mulai Berbelanja
                    </button>
                  </div>
                ) : (
                  filteredOrders.map((order) => {
                const firstItem = (order.items || [])[0];
                const otherItemsCount = (order.items?.length || 0) - 1;
                const productImage =
                  firstItem?.product?.main_image ||
                  (firstItem?.product?.images && firstItem.product.images[0]) ||
                  '/img.png';
                const productName =
                  firstItem?.product_name || firstItem?.product?.name || 'Produk';
                const quantity = firstItem?.quantity || 0;
                const price = firstItem?.price || 0;
                const subtotal =
                  firstItem?.subtotal || (quantity && price ? quantity * price : 0);

                return (
                  <div key={order.id} className="order-item">
                    <div className="order-header-info">
                      <div className="order-header-left">
                        <div className="icon-category" />
                        <span className="order-type">Belanja</span>
                        <span className="order-date">
                          {new Date(order.created_at).toLocaleDateString('id-ID', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                        <span
                          className="order-status"
                          style={{ color: getStatusColor(order.status) }}
                        >
                          {getStatusLabel(order.status)}
                        </span>
                        <span className="order-invoice">
                          {order.order_number || order.id}
                        </span>
                      </div>
                      <div className="order-store-row">
                        <span className="store-name">
                          {order.store?.store_name || order.store?.name || 'Toko'}
                        </span>
                      </div>
                    </div>
                    <div className="order-item-body">
                      <div className="order-item-row">
                        <img
                          className="order-item-image"
                          src={productImage}
                          alt={productName}
                          onError={(e) => {
                            e.currentTarget.src = '/img.png';
                          }}
                        />
                        <div className="order-item-info">
                          <span className="order-item-name">
                            {productName}
                          </span>
                          <span className="order-item-meta">
                            {quantity} barang x {formatCurrency(price)}
                          </span>
                        </div>
                        <div className="order-item-total">
                          <span className="order-item-total-label">
                            Total Belanja
                          </span>
                          <span className="order-item-total-value">
                            {formatCurrency(order.total_amount || subtotal)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="order-footer">
                      <div className="order-footer-actions">
                        <button
                          type="button"
                          className="order-footer-link"
                          onClick={() => handleViewInvoice(order)}
                        >
                          Lihat Detail Transaksi
                        </button>
                        <button
                          type="button"
                          className="order-footer-primary"
                          onClick={() => {
                            if (order.status === 'delivered' || order.status === 'completed') {
                              if (firstItem?.product_id) {
                                window.location.href = `/product/${firstItem.product_id}`;
                              }
                            } else {
                              window.location.href = `/orders/${order.id}`;
                            }
                          }}
                        >
                          {order.status === 'delivered' || order.status === 'completed'
                            ? 'Beli Lagi'
                            : order.status === 'pending'
                            ? 'Bayar Sekarang'
                            : 'Selesaikan Pesanan'}
                        </button>
                        <div className="order-footer-more">
                          <button
                            type="button"
                            className="order-footer-more-button"
                            onClick={() =>
                              setMoreMenuOpenId(moreMenuOpenId === order.id ? null : order.id)
                            }
                          >
                            ⋯
                          </button>
                          {moreMenuOpenId === order.id && (
                            <div className="order-footer-more-menu">
                              <button
                                type="button"
                                onClick={() => {
                                  alert('Fitur chat penjual belum tersedia.');
                                }}
                              >
                                Chat Penjual
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  alert('Fitur bantuan belum tersedia.');
                                }}
                              >
                                Bantuan
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
            </>
          ) : centerView === 'chat' ? (
            <div className="order-chat-wrapper">
              <ChatPage onBack={() => setCenterView('orders')} />
            </div>
          ) : (
            <div className="order-center-alt">
              <div className="order-center-card">
                <h3>
                  {centerView === 'reviews' && 'Ulasan'}
                  {centerView === 'help_messages' && 'Pesan Bantuan'}
                  {centerView === 'complaints' && 'Pesanan Dikomplain'}
                  {centerView === 'updates' && 'Update'}
                </h3>
                <p>
                  {centerView === 'reviews' && 'Belum ada ulasan yang dapat ditampilkan.'}
                  {centerView === 'help_messages' && 'Belum ada pesan bantuan.'}
                  {centerView === 'complaints' && 'Belum ada pesanan yang dikomplain.'}
                  {centerView === 'updates' && 'Belum ada update terbaru.'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {detailOrder && detailInvoice && (
        <div className="order-detail-modal-overlay" onClick={() => {
          if (!detailLoading) {
            setDetailOrder(null);
            setDetailInvoice(null);
          }
        }}>
          <div
            className="order-detail-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="order-detail-header">
              <div>
                <h2>Detail Transaksi</h2>
                <div className="order-detail-status">
                  {getStatusLabel(detailOrder.status)}
                </div>
                <div className="order-detail-meta">
                  <div>
                    <div>No. Pesanan</div>
                    <div className="order-detail-meta-value">
                      {detailInvoice.order_number || detailOrder.order_number || detailOrder.id}
                    </div>
                  </div>
                  <div>
                    <div>Tanggal Pembelian</div>
                    <div className="order-detail-meta-value">
                      {detailOrder.created_at
                        ? new Date(detailOrder.created_at).toLocaleString('id-ID')
                        : '-'}
                    </div>
                  </div>
                </div>
              </div>
              <button
                type="button"
                className="order-detail-close"
                onClick={() => {
                  setDetailOrder(null);
                  setDetailInvoice(null);
                }}
              >
                ×
              </button>
            </div>

            <div className="order-detail-body">
              <div className="order-detail-main">
                <section className="order-detail-section">
                  <div className="order-detail-section-header">
                    <h3>Detail Produk</h3>
                    <div className="order-detail-store">
                      {detailInvoice.store?.name || detailOrder.store?.store_name || detailOrder.store?.name}
                    </div>
                  </div>
                  {detailInvoice.items && detailInvoice.items[0] && (
                    <div className="order-detail-product-row">
                      <div className="order-detail-product-left">
                        <div className="order-detail-product-image">
                          <img
                            src={
                              detailInvoice.items[0].image ||
                              detailOrder.items?.[0]?.product?.main_image ||
                              '/img.png'
                            }
                            alt={detailInvoice.items[0].name}
                            onError={(e) => {
                              e.currentTarget.src = '/img.png';
                            }}
                          />
                        </div>
                        <div className="order-detail-product-info">
                          <div className="order-detail-product-name">
                            {detailInvoice.items[0].name}
                          </div>
                          <div className="order-detail-product-meta">
                            {detailInvoice.items[0].quantity} x {formatCurrency(detailInvoice.items[0].price)}
                          </div>
                        </div>
                      </div>
                      <div className="order-detail-product-action">
                        <button
                          type="button"
                          className="order-detail-secondary-btn"
                          onClick={() => {
                            const pid = detailOrder.items?.[0]?.product_id;
                            if (pid) {
                              window.location.href = `/product/${pid}`;
                            }
                          }}
                        >
                          Beli Lagi
                        </button>
                      </div>
                    </div>
                  )}
                </section>

                <section className="order-detail-section">
                  <div className="order-detail-section-header">
                    <h3>Info Pengiriman</h3>
                  </div>
                  <div className="order-detail-shipping">
                    <div>
                      <div className="order-detail-field-label">Kurir</div>
                      <div className="order-detail-field-value">
                        {detailInvoice.shipment?.courier_name ||
                          detailInvoice.shipment?.courier_code ||
                          detailOrder.shipping_courier ||
                          '-'}
                      </div>
                    </div>
                    <div>
                      <div className="order-detail-field-label">No Resi</div>
                      <div className="order-detail-field-value">
                        {detailInvoice.shipment?.tracking_number || '-'}
                      </div>
                    </div>
                    <div>
                      <div className="order-detail-field-label">Alamat</div>
                      <div className="order-detail-field-value">
                        {detailInvoice.shipping_address ||
                          detailOrder.shipping_address ||
                          '-'}
                      </div>
                    </div>
                  </div>
                </section>

                <section className="order-detail-section">
                  <div className="order-detail-section-header">
                    <h3>Rincian Pembayaran</h3>
                  </div>
                  <div className="order-detail-payment">
                    <div className="order-detail-payment-row">
                      <span>Metode Pembayaran</span>
                      <span>
                        {getPaymentMethodLabel(detailInvoice.payment_method || detailOrder.payment_method || '')}
                      </span>
                    </div>
                    <div className="order-detail-payment-row">
                      <span>Subtotal Harga Barang</span>
                      <span>{formatCurrency(detailInvoice.total_amount || detailOrder.total_amount || 0)}</span>
                    </div>
                    <div className="order-detail-payment-row">
                      <span>Total Ongkos Kirim</span>
                      <span>{formatCurrency(detailInvoice.shipping_cost || detailOrder.shipping_cost || 0)}</span>
                    </div>
                    <div className="order-detail-payment-row total">
                      <span>Total Pembayaran</span>
                      <span>{formatCurrency(detailInvoice.grand_total || detailOrder.total_amount || 0)}</span>
                    </div>
                  </div>
                </section>
              </div>

              <aside className="order-detail-sidebar">
                <button
                  type="button"
                  className="order-detail-tertiary-btn"
                  disabled
                >
                  Beri Ulasan
                </button>
                <button
                  type="button"
                  className="order-detail-primary-btn"
                  onClick={() => {
                    const pid = detailOrder.items?.[0]?.product_id;
                    if (pid) {
                      window.location.href = `/product/${pid}`;
                    }
                  }}
                >
                  Beli Lagi
                </button>
                <button
                  type="button"
                  className="order-detail-tertiary-btn"
                  onClick={() => alert('Fitur chat penjual belum tersedia.')}
                >
                  Chat Penjual
                </button>
                <button
                  type="button"
                  className="order-detail-tertiary-btn"
                  onClick={() => alert('Fitur bantuan belum tersedia.')}
                >
                  Bantuan
                </button>
              </aside>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderPage; 
