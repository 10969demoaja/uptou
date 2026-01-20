import React, { useState, useEffect } from 'react';
import { apiService, AddProductRequest, buildApiUrl, Product } from '../services/api';
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
  initialData?: Product;
}

const AddProduct: React.FC<AddProductProps> = ({ onBack, initialData }) => {
  const [activeSection, setActiveSection] = useState('basic-information');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Category states
  const [mainCategories, setMainCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<Category[]>([]);
  const [subSubCategories, setSubSubCategories] = useState<Category[]>([]);
  const [selectedMainCategory, setSelectedMainCategory] = useState<string>('');
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('');
  const [selectedSubSubCategory, setSelectedSubSubCategory] = useState<string>('');

  // Image upload states
  const [mainImage, setMainImage] = useState<string>('');
  const [additionalImages, setAdditionalImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

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

  // Initialize form with initialData if provided
  useEffect(() => {
    if (initialData) {
      setFormData({
        category_id: initialData.category_id,
        name: initialData.name,
        description: initialData.description || '',
        price: initialData.price,
        discount_price: initialData.discount_price || 0,
        stock_quantity: initialData.stock_quantity,
        sku: initialData.sku || '',
        status: (initialData.status === 'draft' || initialData.status === 'active') ? initialData.status : 'draft'
      });
      
      if (initialData.main_image) {
        setMainImage(initialData.main_image);
      }
      
      if (initialData.additional_images) {
        setAdditionalImages(initialData.additional_images);
      } else if (initialData.images && initialData.images.length > 0) {
        // Fallback if additional_images is not set but images is
        const otherImages = initialData.images.filter(img => img !== initialData.main_image);
        setAdditionalImages(otherImages);
      }
    }
  }, [initialData]);

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
        stock_quantity: Number(formData.stock_quantity),
        main_image: mainImage || undefined,
        additional_images: additionalImages.length > 0 ? additionalImages : undefined
      };

      console.log('🐛 Debug - Product data being sent:', productData);
      console.log('🐛 Debug - mainImage:', mainImage);
      console.log('🐛 Debug - additionalImages:', additionalImages);

      let response;
      if (initialData) {
        response = await apiService.updateProduct(initialData.id, productData);
      } else {
        response = await apiService.addProduct(productData);
      }
      
      if (response.error) {
        setError(response.message || `Failed to ${initialData ? 'update' : 'add'} product`);
      } else {
        setSuccess(`Product ${status === 'draft' ? 'saved as draft' : (initialData ? 'updated' : 'submitted for review')} successfully!`);
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

  // Image upload functions
  const handleImageUpload = async (file: File, isMain: boolean = false) => {
    if (!file) return;

    // Validate file type
    if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Invalid file type. Only JPG, JPEG, PNG, WebP allowed');
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
      const response = await apiService.uploadSingleImage(file);
      
      if (response.error) {
        setError(response.message);
        return;
      }

      if (response.data && response.data.image_url) {
        const imageUrl = response.data.image_url;
        if (isMain) {
          setMainImage(imageUrl);
        } else {
          if (additionalImages.length < 8) {
            setAdditionalImages(prev => [...prev, imageUrl]);
          } else {
            setError('Maximum 8 additional images allowed');
          }
        }
        setSuccess('Image uploaded successfully!');
        setTimeout(() => setSuccess(''), 2000);
      }
    } catch (err) {
      console.error('Error uploading image:', err);
      setError('Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageClick = (isMain: boolean = false) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/jpeg,image/jpg,image/png,image/webp';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        handleImageUpload(file, isMain);
      }
    };
    input.click();
  };

  const removeImage = (index: number) => {
    setAdditionalImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeMainImage = () => {
    setMainImage('');
  };

  return (
    <div className="add-product">
      <div className="add-product-header">
        <div className="header-content">
          <button className="back-btn" onClick={onBack}>
            ← Back
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

      {error && (
        <div className="error-banner">
          <span>❌ {error}</span>
          <button onClick={() => setError('')}>✕</button>
        </div>
      )}

      {success && (
        <div className="success-banner">
          <span>✅ {success}</span>
          <button onClick={() => setSuccess('')}>✕</button>
        </div>
      )}

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
              <div 
                className={`nav-item ${activeSection === 'shipping' ? 'active' : ''}`}
                onClick={() => scrollToSection('shipping')}
              >
                Shipping
              </div>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="main-content">
          {/* Images Upload Section */}
          <section id="images-upload" className="form-section">
            <h2>* Images 📷</h2>
            <p className="section-help">Dimensions: 600 x 600 px. Maximum file size: 10 MB (Up to 9 files). Format: JPG, JPEG, PNG, WebP</p>
            
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
              {Array.from({ length: 8 }, (_, index) => (
                <div key={index} className="upload-slot">
                  {additionalImages[index] ? (
                    <div className="uploaded-image-small">
                      <img src={additionalImages[index]} alt={`Additional ${index + 1}`} />
                      <button 
                        className="remove-image-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeImage(index);
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div 
                      className="upload-placeholder-small"
                      onClick={() => handleImageClick(false)}
                    >
                      <span>+</span>
                      {isUploading && <div className="upload-loading">...</div>}
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
              
              <div className="category-selection-modern">
                {/* Main Dropdown */}
                <div className="category-dropdown-container">
                  <select 
                    className="category-dropdown"
                    value={formData.category_id}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value) {
                        // Find the selected category and set appropriate levels
                        const allCats = [...mainCategories, ...subCategories, ...subSubCategories];
                        const selectedCat = allCats.find(cat => cat.id === value);
                        if (selectedCat) {
                          if (selectedCat.level === 1) {
                            setSelectedMainCategory(value);
                            setSelectedSubCategory('');
                            setSelectedSubSubCategory('');
                            loadSubCategories(value);
                          } else if (selectedCat.level === 2) {
                            setSelectedSubCategory(value);
                            setSelectedSubSubCategory('');
                            loadSubSubCategories(value);
                          } else if (selectedCat.level === 3) {
                            setSelectedSubSubCategory(value);
                          }
                          handleInputChange('category_id', value);
                        }
                      }
                    }}
                  >
                    <option value="">Select category</option>
                    {mainCategories.map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  <div className="dropdown-arrow">⌄</div>
                  </div>

                {/* Search Box */}
                <div className="category-search-container">
                  <input 
                    type="text" 
                    placeholder="Search"
                    className="category-search"
                  />
                  <div className="search-icon">🔍</div>
                </div>

                {/* Category Navigation */}
                <div className="category-navigation">
                  {/* Breadcrumb */}
                  <div className="category-breadcrumb-nav">
                    <span 
                      className={`breadcrumb-item ${!selectedMainCategory ? 'active' : ''}`}
                      onClick={() => {
                        setSelectedMainCategory('');
                        setSelectedSubCategory('');
                        setSelectedSubSubCategory('');
                        setFormData(prev => ({ ...prev, category_id: '' }));
                      }}
                    >
                      All Categories
                    </span>
                    {selectedMainCategory && (
                      <>
                        <span className="breadcrumb-separator">›</span>
                        <span 
                          className={`breadcrumb-item ${!selectedSubCategory ? 'active' : ''}`}
                          onClick={() => {
                            setSelectedSubCategory('');
                            setSelectedSubSubCategory('');
                            setFormData(prev => ({ ...prev, category_id: selectedMainCategory }));
                          }}
                        >
                          {mainCategories.find(cat => cat.id === selectedMainCategory)?.name}
                        </span>
                      </>
                    )}
                    {selectedSubCategory && (
                      <>
                        <span className="breadcrumb-separator">›</span>
                        <span 
                          className={`breadcrumb-item ${!selectedSubSubCategory ? 'active' : ''}`}
                          onClick={() => {
                            setSelectedSubSubCategory('');
                            setFormData(prev => ({ ...prev, category_id: selectedSubCategory }));
                          }}
                        >
                          {subCategories.find(cat => cat.id === selectedSubCategory)?.name}
                        </span>
                      </>
                    )}
                    {selectedSubSubCategory && (
                      <>
                        <span className="breadcrumb-separator">›</span>
                        <span className="breadcrumb-item active">
                          {subSubCategories.find(cat => cat.id === selectedSubSubCategory)?.name}
                        </span>
                      </>
                    )}
                  </div>

                  {/* Category Grid */}
                  <div className="category-grid">
                    <div className="category-sidebar">
                      {!selectedMainCategory ? (
                        // Show main categories
                        mainCategories.map(cat => (
                          <div 
                            key={cat.id}
                            className={`category-item ${selectedMainCategory === cat.id ? 'selected' : ''}`}
                            onClick={() => {
                              setSelectedMainCategory(cat.id);
                              loadSubCategories(cat.id);
                              setFormData(prev => ({ ...prev, category_id: cat.id }));
                            }}
                          >
                            {cat.name}
                            <span className="category-arrow">›</span>
                          </div>
                        ))
                      ) : !selectedSubCategory ? (
                        // Show sub categories
                        subCategories.map(cat => (
                          <div 
                            key={cat.id}
                            className={`category-item ${selectedSubCategory === cat.id ? 'selected' : ''}`}
                            onClick={() => {
                              setSelectedSubCategory(cat.id);
                              loadSubSubCategories(cat.id);
                              setFormData(prev => ({ ...prev, category_id: cat.id }));
                            }}
                          >
                            {cat.name}
                            {subSubCategories.length > 0 && <span className="category-arrow">›</span>}
                          </div>
                        ))
                      ) : (
                        // Show sub-sub categories
                        subSubCategories.map(cat => (
                          <div 
                            key={cat.id}
                            className={`category-item ${selectedSubSubCategory === cat.id ? 'selected' : ''}`}
                            onClick={() => {
                              setSelectedSubSubCategory(cat.id);
                              setFormData(prev => ({ ...prev, category_id: cat.id }));
                            }}
                          >
                            {cat.name}
                          </div>
                        ))
                      )}
                    </div>

                    {/* Right panel for sub-categories */}
                    {selectedMainCategory && subCategories.length > 0 && !selectedSubCategory && (
                      <div className="category-content">
                        {subCategories.map(cat => (
                          <div 
                            key={cat.id}
                            className="category-content-item"
                            onClick={() => {
                              setSelectedSubCategory(cat.id);
                              loadSubSubCategories(cat.id);
                              setFormData(prev => ({ ...prev, category_id: cat.id }));
                            }}
                          >
                            {cat.name}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Right panel for sub-sub categories */}
                    {selectedSubCategory && subSubCategories.length > 0 && (
                      <div className="category-content">
                        {subSubCategories.map(cat => (
                          <div 
                            key={cat.id}
                            className="category-content-item"
                            onClick={() => {
                              setSelectedSubSubCategory(cat.id);
                              setFormData(prev => ({ ...prev, category_id: cat.id }));
                            }}
                          >
                            {cat.name}
                  </div>
                ))}
                      </div>
                    )}
                  </div>
                </div>
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

            <div className="form-group">
              <label>* Condition ⚙️</label>
              <div className="radio-group">
                <input type="radio" id="new" name="condition" defaultChecked />
                <label htmlFor="new">New</label>
                <input type="radio" id="secondhand" name="condition" />
                <label htmlFor="secondhand">Secondhand</label>
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

          {/* Shipping */}
          <section id="shipping" className="form-section">
            <h2>Shipping</h2>
            <p className="section-help">Shipping options will be configured based on your store settings.</p>
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
                  <div className="preview-price">
                    {formData.price > 0 ? (
                      <>
                        <span className="price">
                          Rp {formData.price.toLocaleString('id-ID')}
                        </span>
                        {formData.discount_price && formData.discount_price > 0 && (
                          <span className="discount">
                            Rp {formData.discount_price.toLocaleString('id-ID')}
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="price-placeholder">Price</span>
                    )}
                  </div>
                  <div className="preview-stock">
                    Stock: {formData.stock_quantity || 0}
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
    </div>
  );
};

export default AddProduct; 