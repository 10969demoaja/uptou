import React, { useState, useEffect } from 'react';
import { apiService, Category, AddProductRequest } from '../services/api';
import './AddProduct.css';

interface AddProductProps {
  onBack: () => void;
}

const AddProductIntegrated: React.FC<AddProductProps> = ({ onBack }) => {
  const [activeSection, setActiveSection] = useState('basic-information');
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form states
  const [formData, setFormData] = useState<AddProductRequest>({
    category_id: '',
    name: '',
    description: '',
    price: 0,
    discount_price: 0,
    stock_quantity: 1,
    sku: '',
    status: 'draft'
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await apiService.getCategories();
      if (!response.error && response.data) {
        setCategories(response.data.categories);
      }
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleInputChange = (field: keyof AddProductRequest, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      setError('Product name is required');
      return false;
    }
    if (!formData.category_id) {
      setError('Please select a category');
      return false;
    }
    if (formData.price <= 0) {
      setError('Price must be greater than 0');
      return false;
    }
    if (formData.stock_quantity < 0) {
      setError('Stock quantity cannot be negative');
      return false;
    }
    return true;
  };

  const handleSubmit = async (status: 'draft' | 'active') => {
    setError('');
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const productData = {
        ...formData,
        status,
        price: Number(formData.price),
        discount_price: formData.discount_price ? Number(formData.discount_price) : undefined,
        stock_quantity: Number(formData.stock_quantity)
      };

      const response = await apiService.addProduct(productData);
      
      if (response.error) {
        setError(response.message || 'Failed to add product');
      } else {
        setSuccess(`Product ${status === 'draft' ? 'saved as draft' : 'submitted for review'} successfully!`);
        setTimeout(() => {
          onBack();
        }, 2000);
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = () => handleSubmit('draft');
  const handleSubmitForReview = () => handleSubmit('active');

  return (
    <div className="add-product">
      <div className="add-product-header">
        <div className="header-content">
          <button className="back-btn" onClick={onBack}>
            ← Add new product
          </button>
          <div className="publish-info">
            Publish on UPTOU Shop and UPTOU ⌄
          </div>
          <div className="action-buttons">
            <button className="help-btn">❓</button>
            <button 
              className="save-draft-btn" 
              onClick={handleSaveDraft}
              disabled={loading}
            >
              💾 {loading ? 'Saving...' : 'Save as a draft'}
            </button>
            <button 
              className="submit-btn"
              onClick={handleSubmitForReview}
              disabled={loading}
            >
              ✓ {loading ? 'Submitting...' : 'Submit for review'}
            </button>
          </div>
        </div>
      </div>

      <div className="add-product-content">
        {/* Left Sidebar */}
        <div className="left-sidebar">
          <div>
            <div className="suggestions-section">
              <h3>💡 Suggestions</h3>
              <p>Complete product information can help increase your product exposure.</p>
            </div>

            <nav className="product-nav">
              <div 
                className={`nav-item ${activeSection === 'basic-information' ? 'active' : ''}`}
                onClick={() => scrollToSection('basic-information')}
              >
                Basic information
              </div>
              <div 
                className={`nav-item ${activeSection === 'product-details' ? 'active' : ''}`}
                onClick={() => scrollToSection('product-details')}
              >
                Product details
              </div>
              <div 
                className={`nav-item ${activeSection === 'sales-information' ? 'active' : ''}`}
                onClick={() => scrollToSection('sales-information')}
              >
                Sales information
              </div>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="main-content">
          {/* Basic Information */}
          <section id="basic-information" className="form-section">
            <h2>Basic information</h2>
            
            <div className="form-group">
              <label>* Product name 📝</label>
              <input 
                type="text" 
                placeholder="Enter product name" 
                className="form-input"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                maxLength={255}
              />
              <span className="char-count">{formData.name.length}/255</span>
            </div>

            <div className="form-group">
              <label>* Category 📂</label>
              <select 
                className="form-select"
                value={formData.category_id}
                onChange={(e) => handleInputChange('category_id', e.target.value)}
              >
                <option value="">Select category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.level === 1 ? cat.name : 
                     cat.level === 2 ? `-- ${cat.name}` : 
                     `---- ${cat.name}`}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>SKU (Optional) 🏷️</label>
              <input 
                type="text" 
                placeholder="Enter product SKU" 
                className="form-input"
                value={formData.sku}
                onChange={(e) => handleInputChange('sku', e.target.value)}
              />
            </div>
          </section>

          {/* Product Details */}
          <section id="product-details" className="form-section">
            <h2>Product details</h2>
            
            <div className="form-group">
              <label>* Description 📄</label>
              <div className="description-editor">
                <textarea 
                  className="description-text" 
                  rows={10}
                  placeholder="Enter product description..."
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                ></textarea>
              </div>
            </div>
          </section>

          {/* Sales Information */}
          <section id="sales-information" className="form-section">
            <h2>Sales information</h2>
            
            <div className="form-group">
              <label>* Price (IDR) 💰</label>
              <input 
                type="number" 
                placeholder="Enter price" 
                className="form-input"
                min="0"
                value={formData.price || ''}
                onChange={(e) => handleInputChange('price', Number(e.target.value))}
              />
            </div>

            <div className="form-group">
              <label>Discount Price (IDR) 🏷️</label>
              <input 
                type="number" 
                placeholder="Enter discount price (optional)" 
                className="form-input"
                min="0"
                value={formData.discount_price || ''}
                onChange={(e) => handleInputChange('discount_price', Number(e.target.value))}
              />
            </div>

            <div className="form-group">
              <label>* Stock Quantity 📦</label>
              <input 
                type="number" 
                placeholder="Enter stock quantity" 
                className="form-input"
                min="0"
                value={formData.stock_quantity || ''}
                onChange={(e) => handleInputChange('stock_quantity', Number(e.target.value))}
              />
            </div>
          </section>
        </div>

        {/* Right Preview */}
        <div className="right-preview">
          <div>
            <h3>Preview 👁️</h3>
            <div className="preview-content">
              <h4>Product details</h4>
              
              <div className="preview-product">
                <div className="preview-image-main">
                  <div className="main-product-image">
                    <span>📷</span>
                    <p>Add images</p>
                  </div>
                </div>
                
                <div className="preview-info">
                  <h5>{formData.name || 'Product Name'}</h5>
                  <div className="preview-price">
                    {formData.discount_price && formData.discount_price > 0 ? (
                      <>
                        <span className="original-price">Rp {formData.price.toLocaleString()}</span>
                        <span className="discount-price">Rp {formData.discount_price.toLocaleString()}</span>
                      </>
                    ) : (
                      <span className="price">Rp {formData.price.toLocaleString()}</span>
                    )}
                  </div>
                  <div className="preview-stock">
                    Stock: {formData.stock_quantity} units
                  </div>
                  <div className="preview-description">
                    {formData.description || 'Product description will appear here...'}
                  </div>
                </div>
              </div>

              <div className="preview-actions-bottom">
                <button className="add-to-cart-btn">Add to Cart</button>
                <button className="buy-now-btn">Buy Now</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="error-message" style={{
          position: 'fixed', 
          top: '20px', 
          right: '20px', 
          background: '#f8d7da', 
          color: '#721c24', 
          padding: '12px 16px', 
          borderRadius: '8px',
          zIndex: 1000
        }}>
          {error}
        </div>
      )}
      
      {success && (
        <div className="success-message" style={{
          position: 'fixed', 
          top: '20px', 
          right: '20px', 
          background: '#d4edda', 
          color: '#155724', 
          padding: '12px 16px', 
          borderRadius: '8px',
          zIndex: 1000
        }}>
          {success}
        </div>
      )}
    </div>
  );
};

export default AddProductIntegrated; 