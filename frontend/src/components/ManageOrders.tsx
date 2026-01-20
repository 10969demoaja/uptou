import React, { useState, useEffect } from 'react';
import { Search, Filter, Download, MoreHorizontal, Package, AlertTriangle, Truck, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import './ManageOrders.css';
import { authUtils, buildApiUrl } from '../services/api';

interface OrderItem {
  product_name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  order_number: string;
  status: 'paid' | 'processing' | 'shipped' | 'delivered' | 'completed' | 'pending' | 'cancelled' | 'refunded';
  total_amount: number;
  created_at: string;
  updated_at: string;
  edges?: {
    buyer?: {
      full_name: string;
      email: string;
    };
    order_items?: OrderItem[];
  };
}

const ManageOrders: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'to-ship' | 'shipped' | 'completed' | 'pending' | 'canceled' | 'failed-delivery'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Load orders from API
  useEffect(() => {
    loadOrders();
  }, [activeTab]);

  const loadOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const token = authUtils.getToken();
      if (!token) {
        setError('Authentication required');
        return;
      }

      const status = activeTab === 'all' ? '' : activeTab;
      const response = await fetch(buildApiUrl(`/seller/orders?status=${status}&limit=50`), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      
      if (!data.error) {
        setOrders(data.data?.orders || []);
      } else {
        setError(data.message || 'Failed to load orders');
      }
    } catch (err) {
      setError('Network error occurred');
      console.error('Error loading orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
      case 'processing': return <Package size={16} className="status-icon to-ship" />;
      case 'shipped': return <Truck size={16} className="status-icon shipped" />;
      case 'completed':
      case 'delivered': return <CheckCircle size={16} className="status-icon completed" />;
      case 'pending': return <Clock size={16} className="status-icon pending" />;
      case 'cancelled': return <XCircle size={16} className="status-icon canceled" />;
      case 'refunded': return <AlertCircle size={16} className="status-icon failed" />;
      default: return <Package size={16} />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'paid': return 'Paid';
      case 'processing': return 'Processing';
      case 'shipped': return 'Shipped';
      case 'delivered': return 'Delivered';
      case 'completed': return 'Completed';
      case 'pending': return 'Pending';
      case 'cancelled': return 'Cancelled';
      case 'refunded': return 'Refunded';
      default: return status;
    }
  };

  const getCustomerName = (order: Order) => {
    return order.edges?.buyer?.full_name || 'Unknown Customer';
  };

  const getOrderItems = (order: Order) => {
    return order.edges?.order_items?.map(item => item.product_name) || [];
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const filteredOrders = orders.filter(order => {
    const matchesTab = activeTab === 'all' || order.status === activeTab;
    const customerName = getCustomerName(order);
    const orderItems = getOrderItems(order);
    const matchesSearch = order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         orderItems.some(item => item.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesTab && matchesSearch;
  });

  const getOrderCounts = (): Record<string, number> => {
    return {
      'to-ship': orders.filter(o => o.status === 'processing' || o.status === 'paid').length,
      'auto-cancel': orders.filter(o => o.status === 'pending').length,
      'shipping-overdue': 0,
      'cancellation-requested': 0,
      'logistics-issue': 0,
      'return-refund': 0,
      'processing': orders.filter(o => o.status === 'processing').length,
      'shipped': orders.filter(o => o.status === 'shipped').length,
      'pending': orders.filter(o => o.status === 'pending').length,
      'completed': orders.filter(o => o.status === 'completed').length,
      'cancelled': orders.filter(o => o.status === 'cancelled').length,
    };
  };

  const orderCounts = getOrderCounts();

  if (loading) {
    return (
      <div className="manage-orders">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="manage-orders">
      {/* Page Header */}
      <div className="page-header">
        <h1>Manage Orders</h1>
        <div className="header-notice">
          <AlertTriangle size={16} />
          <span>Attention sellers: Don't lose out on earnings due to damaged packages. </span>
          <button className="learn-more-btn">Learn More</button>
        </div>
      </div>

      {/* Collection Notice */}
      <div className="collection-notice">
        <AlertTriangle size={16} />
        <span>Please set up the collection method before you ship orders. </span>
        <button className="update-info-btn">Update info</button>
        <button className="close-notice-btn">×</button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="error-banner">
          <span>❌ {error}</span>
          <button onClick={() => setError('')}>✕</button>
        </div>
      )}

      {/* Action Cards */}
      <div className="action-needed-section">
        <div className="action-needed-grid">
          <div className="action-needed-item">
            <div className="action-label">To ship by 23:59 today</div>
            <div className="action-value">{orderCounts['to-ship']}</div>
          </div>
          <div className="action-needed-item">
            <div className="action-label">Auto-canceling within 24 hours or less</div>
            <div className="action-value">{orderCounts['auto-cancel']}</div>
          </div>
          <div className="action-needed-item">
            <div className="action-label">Shipping overdue</div>
            <div className="action-value">{orderCounts['shipping-overdue']}</div>
          </div>
          <div className="action-needed-item">
            <div className="action-label">Cancellation requested</div>
            <div className="action-value">{orderCounts['cancellation-requested']}</div>
          </div>
          <div className="action-needed-item">
            <div className="action-label">Logistics issue</div>
            <div className="action-value">{orderCounts['logistics-issue']}</div>
          </div>
          <div className="action-needed-item">
            <div className="action-label">Return/refund requested</div>
            <div className="action-value">{orderCounts['return-refund']}</div>
          </div>
        </div>
      </div>

      {/* Order Tabs */}
      <div className="order-tabs">
        <button 
          className={`tab ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          All
        </button>
        <button 
          className={`tab ${activeTab === 'to-ship' ? 'active' : ''}`}
          onClick={() => setActiveTab('to-ship')}
        >
          To ship
        </button>
        <button 
          className={`tab ${activeTab === 'shipped' ? 'active' : ''}`}
          onClick={() => setActiveTab('shipped')}
        >
          Shipped
        </button>
        <button 
          className={`tab ${activeTab === 'completed' ? 'active' : ''}`}
          onClick={() => setActiveTab('completed')}
        >
          Completed
        </button>
        <button 
          className={`tab ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          Pending
        </button>
        <button 
          className={`tab ${activeTab === 'canceled' ? 'active' : ''}`}
          onClick={() => setActiveTab('canceled')}
        >
          Canceled
        </button>
      </div>

      {/* Search and Filter Bar */}
      <div className="orders-toolbar">
        <div className="search-container">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search by order number, customer name, or product"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="toolbar-actions">
          <button 
            className="filter-btn"
            onClick={() => setFilterOpen(!filterOpen)}
          >
            <Filter size={16} />
            Filter
          </button>
          <button className="export-btn">
            <Download size={16} />
            Export
          </button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="orders-table-container">
        {filteredOrders.length === 0 ? (
          <div className="empty-state">
            <Package size={48} />
            <h3>No orders found</h3>
            <p>You don't have any orders matching the current filters.</p>
          </div>
        ) : (
          <table className="orders-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Products</th>
                <th>Status</th>
                <th>Total</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id}>
                  <td>
                    <div className="order-info">
                      <span className="order-number">{order.order_number}</span>
                    </div>
                  </td>
                  <td>
                    <div className="customer-info">
                      <span className="customer-name">{getCustomerName(order)}</span>
                      <span className="customer-email">{order.edges?.buyer?.email}</span>
                    </div>
                  </td>
                  <td>
                    <div className="products-info">
                      {getOrderItems(order).slice(0, 2).map((item, index) => (
                        <span key={index} className="product-name">{item}</span>
                      ))}
                      {getOrderItems(order).length > 2 && (
                        <span className="more-products">+{getOrderItems(order).length - 2} more</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="status-info">
                      {getStatusIcon(order.status)}
                      <span className="status-text">{getStatusText(order.status)}</span>
                    </div>
                  </td>
                  <td>
                    <span className="order-total">{formatPrice(order.total_amount)}</span>
                  </td>
                  <td>
                    <span className="order-date">
                      {new Date(order.created_at).toLocaleDateString('id-ID')}
                    </span>
                  </td>
                  <td>
                    <button className="action-btn">
                      <MoreHorizontal size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ManageOrders; 