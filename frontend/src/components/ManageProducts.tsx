import React, { useState, useEffect } from 'react';
import './ManageProducts.css';
import { buildApiUrl, Product } from '../services/api';

interface ManageProductsProps {
  onAddProduct?: () => void;
  onEditProduct?: (product: Product) => void;
}

const ManageProducts: React.FC<ManageProductsProps> = ({ onAddProduct, onEditProduct }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentTab, setCurrentTab] = useState('all');
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    draft: 0,
    out_of_stock: 0,
  });

  // Load products and stats
  useEffect(() => {
    loadProducts();
    loadStats();
  }, [currentTab]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const status = currentTab === 'all' ? '' : currentTab;
      const response = await fetch(buildApiUrl(`/seller/products?status=${status}&limit=50`), {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });
      
      const data = await response.json();
      
      if (!data.error) {
        setProducts(data.data.products || []);
      } else {
        setError(data.message || 'Failed to load products');
      }
    } catch (err) {
      setError('Network error occurred');
      console.error('Error loading products:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch(buildApiUrl('/seller/dashboard/stats'), {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });
      
      const data = await response.json();
      
      if (!data.error) {
        setStats({
          total: data.data.total_products || 0,
          active: data.data.active_products || 0,
          inactive: data.data.out_of_stock_products || 0,
          draft: data.data.draft_products || 0,
          out_of_stock: data.data.out_of_stock_products || 0,
        });
      }
    } catch (err) {
      console.error('Error loading stats:', err);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }
    
    try {
      const response = await fetch(buildApiUrl(`/seller/products/${productId}`), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });
      
      const data = await response.json();
      
      if (!data.error) {
        loadProducts(); // Reload products
        loadStats(); // Reload stats
      } else {
        setError(data.message || 'Failed to delete product');
      }
    } catch (err) {
      setError('Network error occurred');
      console.error('Error deleting product:', err);
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return { label: 'Live', class: 'status-active' };
      case 'draft': return { label: 'Draft', class: 'status-draft' };
      case 'inactive': return { label: 'Deactivated', class: 'status-inactive' };
      case 'out_of_stock': return { label: 'Out of Stock', class: 'status-out-of-stock' };
      default: return { label: status, class: 'status-default' };
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="manage-products">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="manage-products">
      <div className="manage-products-header">
        <div className="header-left">
          <h1>Manage Products</h1>
          <span className="tutorials-help">📚 Tutorials & Help</span>
        </div>
        <div className="header-right">
          <div className="add-product-dropdown">
            <button className="add-product-btn" onClick={onAddProduct}>+ Add new product ⌄</button>
          </div>
        </div>
      </div>

      {error && (
        <div className="error-banner">
          <span>❌ {error}</span>
          <button onClick={() => setError('')}>✕</button>
        </div>
      )}

      <div className="info-banner">
        <div className="info-content">
          <span className="info-icon">ℹ️</span>
          <div className="info-text">
            <p><strong>Your products will be displayed and available for purchase on UPTOU</strong></p>
            <p>You can activate or deactivate products to set their visibility on each platform. <a href="#" className="learn-more">Learn more</a></p>
          </div>
          <button className="close-banner">✕</button>
        </div>
      </div>

      <div className="product-tabs">
        <button 
          className={`tab ${currentTab === 'all' ? 'active' : ''}`}
          onClick={() => setCurrentTab('all')}
        >
          All {stats.total}
        </button>
        <button 
          className={`tab ${currentTab === 'active' ? 'active' : ''}`}
          onClick={() => setCurrentTab('active')}
        >
          Live {stats.active}
        </button>
        <button 
          className={`tab ${currentTab === 'inactive' ? 'active' : ''}`}
          onClick={() => setCurrentTab('inactive')}
        >
          Deactivated {stats.inactive}
        </button>
        <button 
          className={`tab ${currentTab === 'draft' ? 'active' : ''}`}
          onClick={() => setCurrentTab('draft')}
        >
          Draft {stats.draft}
        </button>
        <button 
          className={`tab ${currentTab === 'out_of_stock' ? 'active' : ''}`}
          onClick={() => setCurrentTab('out_of_stock')}
        >
          Out of Stock {stats.out_of_stock}
        </button>
      </div>

      {products.length === 0 ? (
        <div className="empty-state">
          <div className="empty-content">
            <h2>Upload your first product:</h2>
            <div className="upload-steps">
              <div className="step">
                <span className="step-number">1</span>
                <p>Select an accurate category for the product. This helps the platform to recommend your product to target customers.</p>
              </div>
              <div className="step">
                <span className="step-number">2</span>
                <p>Fill in the product information as required. Quality product information can increase your online sales.</p>
              </div>
              <div className="step">
                <span className="step-number">3</span>
                <p>The product will be displayed publicly once approved.</p>
              </div>
            </div>
            <button className="add-product-main-btn" onClick={onAddProduct}>+ Add new product</button>
          </div>
          <div className="product-preview">
            <div className="preview-video">
              <video 
                autoPlay 
                loop 
                muted 
                playsInline
                controls={false}
                preload="auto"
                onError={(e) => {
                  console.log('Video error:', e);
                  e.currentTarget.style.backgroundColor = '#14B8A6';
                  e.currentTarget.style.display = 'flex';
                  e.currentTarget.style.alignItems = 'center';
                  e.currentTarget.style.justifyContent = 'center';
                }}
              >
                <source src="/video/video%20seller.mp4" type="video/mp4" />
                <source src="/video/video seller.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
        </div>
      ) : (
        <div className="products-list">
          <div className="products-table">
            <div className="table-header">
              <div className="col-image">Image</div>
              <div className="col-name">Product Name</div>
              <div className="col-category">Category</div>
              <div className="col-price">Price</div>
              <div className="col-stock">Stock</div>
              <div className="col-status">Status</div>
              <div className="col-date">Created</div>
              <div className="col-actions">Actions</div>
            </div>
            
            {products.map((product) => {
              const statusInfo = getStatusLabel(product.status);
              return (
                <div key={product.id} className="table-row">
                  <div className="col-image">
                    <div className="product-image-placeholder">
                      {product.images && product.images.length > 0 ? (
                        <img src={product.images[0]} alt={product.name} />
                      ) : (
                        <div className="no-image">📦</div>
                      )}
                    </div>
                  </div>
                  
                  <div className="col-name">
                    <div className="product-name-info">
                      <h4>{product.name}</h4>
                      {product.sku && <span className="sku">SKU: {product.sku}</span>}
                      {product.description && (
                        <p className="description">{product.description.substring(0, 80)}...</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="col-category">
                    {product.edges?.category?.name || 'No Category'}
                  </div>
                  
                  <div className="col-price">
                    <div className="price-info">
                      <span className="current-price">{formatPrice(product.price)}</span>
                      {product.discount_price && (
                        <span className="discount-price">{formatPrice(product.discount_price)}</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="col-stock">
                    <span className={product.stock_quantity > 0 ? 'in-stock' : 'out-of-stock'}>
                      {product.stock_quantity}
                    </span>
                  </div>
                  
                  <div className="col-status">
                    <span className={`status-badge ${statusInfo.class}`}>
                      {statusInfo.label}
                    </span>
                  </div>
                  
                  <div className="col-date">
                    {formatDate(product.created_at)}
                  </div>
                  
                  <div className="col-actions">
                    <div className="action-buttons">
                      <button 
                        className="edit-btn" 
                        title="Edit Product"
                        onClick={() => onEditProduct && onEditProduct(product)}
                      >
                        ✏️
                      </button>
                      <button 
                        className="delete-btn" 
                        title="Delete Product"
                        onClick={() => handleDeleteProduct(product.id)}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="opportunities-section">
        <h3>See your opportunities</h3>
        <div className="opportunity-card">
          <h4>Popular product recommendations</h4>
          <p>237048 opportunities to sell in-demand products and earn product views.</p>
          <div className="product-suggestions">
            <div className="suggestion-item">
              <div className="suggestion-image"></div>
              <span>99+</span>
            </div>
            <button className="view-more">→</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageProducts; 