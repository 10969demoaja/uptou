import React, { useState, useEffect } from 'react';
import { apiService, AddProductRequest, buildApiUrl } from '../services/api';
import './AddProduct.css';

interface Category {
  id: string;
  name: string;
  slug: string;
  level: number;
  parent_id?: string | null;
  sort_order: number;
  is_active: boolean;
}

interface AddProductProps {
  onBack: () => void;
}

const AddProductWithCategories: React.FC<AddProductProps> = ({ onBack }) => {
  const [activeSection, setActiveSection] = useState('basic-information');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [mainImage, setMainImage] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);

  // Category states
  const [mainCategories, setMainCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<Category[]>([]);
  const [subSubCategories, setSubSubCategories] = useState<Category[]>([]);
  const [selectedMainCategory, setSelectedMainCategory] = useState<string>('');
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('');
  const [selectedSubSubCategory, setSelectedSubSubCategory] = useState<string>('');

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

  // Load main categories on component mount
  useEffect(() => {
    loadMainCategories();
  }, []);

  // Load sub categories when main category changes
  useEffect(() => {
    if (selectedMainCategory) {
      loadSubCategories(selectedMainCategory);
      setSubSubCategories([]);
      setSelectedSubCategory('');
      setSelectedSubSubCategory('');
      setFormData(prev => ({ ...prev, category_id: '' }));
    } else {
      setSubCategories([]);
      setSubSubCategories([]);
      setSelectedSubCategory('');
      setSelectedSubSubCategory('');
    }
  }, [selectedMainCategory]);

  // Load sub-sub categories when sub category changes
  useEffect(() => {
    if (selectedSubCategory) {
      loadSubSubCategories(selectedSubCategory);
      setSelectedSubSubCategory('');
      setFormData(prev => ({ ...prev, category_id: '' }));
    } else {
      setSubSubCategories([]);
      setSelectedSubSubCategory('');
    }
  }, [selectedSubCategory]);

  // Update form category_id when sub-sub category is selected
  useEffect(() => {
    if (selectedSubSubCategory) {
      setFormData(prev => ({ ...prev, category_id: selectedSubSubCategory }));
    } else if (selectedSubCategory && subSubCategories.length === 0) {
      setFormData(prev => ({ ...prev, category_id: selectedSubCategory }));
    } else if (selectedMainCategory && subCategories.length === 0) {
      setFormData(prev => ({ ...prev, category_id: selectedMainCategory }));
    }
  }, [selectedSubSubCategory, selectedSubCategory, selectedMainCategory, subCategories.length, subSubCategories.length]);

  const loadMainCategories = async () => {
    try {
      const response = await fetch(buildApiUrl('/categories?level=1&limit=100'));
      const data = await response.json();
      
      if (!data.error && data.data && data.data.categories) {
        setMainCategories(data.data.categories);
      }
    } catch (error) {
      console.error('Error loading main categories:', error);
    }
  };

  const loadSubCategories = async (parentId: string) => {
    try {
      const response = await fetch(buildApiUrl(`/categories?level=2&parent_id=${parentId}&limit=100`));
      const data = await response.json();
      
      if (!data.error && data.data && data.data.categories) {
        setSubCategories(data.data.categories);
      }
    } catch (error) {
      console.error('Error loading sub categories:', error);
    }
  };

  const loadSubSubCategories = async (parentId: string) => {
    try {
      const response = await fetch(buildApiUrl(`/categories?level=3&parent_id=${parentId}&limit=100`));
      const data = await response.json();
      
      if (!data.error && data.data && data.data.categories) {
        setSubSubCategories(data.data.categories);
      }
    } catch (error) {
      console.error('Error loading sub-sub categories:', error);
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

  const handleImageUpload = async (file: File, isMain: boolean = false) => {
    if (!file) return;

    // Validate file type
    if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
      setError('Invalid file type. Only JPG, JPEG, PNG allowed');
      return;
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size too large. Maximum 10MB allowed');
      return;
    }

    setIsUploading(true);
    setError('');
    try {
      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Use local object URL for instant preview
      const localUrl = URL.createObjectURL(file);
      if (isMain) {
        setMainImage(localUrl);
      } else {
        if (uploadedImages.length < 8) {
          setUploadedImages(prev => [...prev, localUrl]);
        } else {
          setError('Maximum 9 images allowed (1 main + 8 additional)');
        }
      }
      setSuccess('Image uploaded successfully!');
      setTimeout(() => setSuccess(''), 2000);
    } catch (err) {
      setError('Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageClick = (isMain: boolean = false) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/jpeg,image/jpg,image/png';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        handleImageUpload(file, isMain);
      }
    };
    input.click();
  };

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeMainImage = () => {
    setMainImage('');
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

  const getCategoryBreadcrumb = () => {
    const breadcrumbs = [];
    
    const selectedMain = mainCategories.find(cat => cat.id === selectedMainCategory);
    if (selectedMain) breadcrumbs.push(selectedMain.name);
    
    const selectedSub = subCategories.find(cat => cat.id === selectedSubCategory);
    if (selectedSub) breadcrumbs.push(selectedSub.name);
    
    const selectedSubSub = subSubCategories.find(cat => cat.id === selectedSubSubCategory);
    if (selectedSubSub) breadcrumbs.push(selectedSubSub.name);
    
    return breadcrumbs.join(' > ');
  };

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
                className={`nav-item ${activeSection === 'images-upload' ? 'active' : ''}`}
                onClick={() => scrollToSection('images-upload')}
              >
                Images
              </div>
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
          {/* Images Upload Section */}
          <section id="images-upload" className="form-section">
            <h2>* Images 📷</h2>
            <p className="section-help">Dimensions: 600 x 600 px. Maximum file size: 10 MB (Up to 9 files). Format: JPG, JPEG, PNG</p>
            
            <div className="image-upload-grid">
              {/* Main Image Upload */}
              <div className="upload-main" onClick={() => handleImageClick(true)}>
                {mainImage ? (
                  <div className="uploaded-image-main">
                    <img src={mainImage} alt="Main product" />
                    <button 
                      className="remove-image-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeMainImage();
                      }}
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div className="upload-placeholder">
                    <span>📤</span>
                    <p>Upload main image</p>
                    {isUploading && <div className="upload-loading">Uploading...</div>}
                  </div>
                )}
              </div>
              
              {/* Additional Images */}
              {[...Array(8)].map((_, index) => (
                <div 
                  key={index}
                  className="upload-slot" 
                  onClick={() => {
                    if (!uploadedImages[index]) {
                      handleImageClick(false);
                    }
                  }}
                >
                  {uploadedImages[index] ? (
                    <div className="uploaded-image-small">
                      <img src={uploadedImages[index]} alt={`Additional ${index + 1}`} />
                      <button 
                        className="remove-image-btn-small"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeImage(index);
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div className="upload-placeholder-small">
                      <span>+</span>
                      {isUploading && <div className="upload-loading-small">...</div>}
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            <p className="form-help">Upload at least 1 product image</p>
          </section>

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
              
              {/* Main Category */}
              <div className="category-selection">
                <div className="category-level">
                  <label className="category-label">Level 1: Main Category</label>
                  <select 
                    className="form-select"
                    value={selectedMainCategory}
                    onChange={(e) => setSelectedMainCategory(e.target.value)}
                  >
                    <option value="">Select main category</option>
                    {mainCategories.map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sub Category */}
                {subCategories.length > 0 && (
                  <div className="category-level">
                    <label className="category-label">Level 2: Sub Category</label>
                    <select 
                      className="form-select"
                      value={selectedSubCategory}
                      onChange={(e) => setSelectedSubCategory(e.target.value)}
                    >
                      <option value="">Select sub category</option>
                      {subCategories.map(cat => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Sub-Sub Category */}
                {subSubCategories.length > 0 && (
                  <div className="category-level">
                    <label className="category-label">Level 3: Sub-Sub Category</label>
                    <select 
                      className="form-select"
                      value={selectedSubSubCategory}
                      onChange={(e) => setSelectedSubSubCategory(e.target.value)}
                    >
                      <option value="">Select sub-sub category</option>
                      {subSubCategories.map(cat => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Category Breadcrumb */}
                {getCategoryBreadcrumb() && (
                  <div className="category-breadcrumb">
                    <span className="breadcrumb-label">Selected: </span>
                    <span className="breadcrumb-path">{getCategoryBreadcrumb()}</span>
                  </div>
                )}
              </div>
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
                    {mainImage ? (
                      <img src={mainImage} alt="Product preview" style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                    ) : (
                      <>
                        <span>📷</span>
                        <p>Add images</p>
                      </>
                    )}
                  </div>
                </div>
                
                <div className="preview-info">
                  <h5>{formData.name || 'Product Name'}</h5>
                  
                  {/* Category in preview */}
                  {getCategoryBreadcrumb() && (
                    <div className="preview-category">
                      <small>Category: {getCategoryBreadcrumb()}</small>
                    </div>
                  )}
                  
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
                <button className="preview-product-btn">Preview Product</button>
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

export default AddProductWithCategories; 