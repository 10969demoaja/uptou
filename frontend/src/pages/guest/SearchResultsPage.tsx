import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import './SearchResultsPage.css';
import { buildApiUrl } from '../../services/api';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  discount_price?: number;
  stock_quantity: number;
  status: string;
  sku?: string;
  images?: string[];
  main_image?: string;
  additional_images?: string[];
  condition: string;
  rating: number;
  review_count: number;
  view_count: number;
  created_at: string;
  store?: {
    name: string;
    location: string;
  } | null;
  location?: string;
  edges?: {
    category?: {
      id: string;
      name: string;
    };
    seller?: {
      id: string;
      full_name: string;
      business_name?: string;
    };
  };
}

interface SearchFilters {
  category: string;
  minPrice: number;
  maxPrice: number;
  condition: string;
  rating: number;
  location: string;
  sortBy: string;
  promoOnly: boolean;
}

const SearchResultsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<SearchFilters>({
    category: '',
    minPrice: 0,
    maxPrice: 0,
    condition: '',
    rating: 0,
    location: '',
    sortBy: 'relevance',
    promoOnly: false,
  });

  const searchQuery = searchParams.get('q') || '';
  const itemsPerPage = 60;

  useEffect(() => {
    console.log('SearchResultsPage useEffect triggered:', { searchQuery, filters, currentPage });
    // Always load results, even with empty query to show all products
    loadSearchResults();
  }, [searchQuery, filters, currentPage]);

  const loadSearchResults = async () => {
    try {
      setLoading(true);
      setError('');

      // Build search parameters
      const searchParams = new URLSearchParams();
      
      // Use main products endpoint with search parameter
      const endpoint = buildApiUrl('/buyer/products');
      
      if (searchQuery && searchQuery.trim() !== '') {
        searchParams.append('search', searchQuery.trim());
      }
      
      searchParams.append('limit', '60');
      searchParams.append('offset', '0');

      // Add filter parameters
      if (filters.category) {
        searchParams.append('category', filters.category);
      }
      if (filters.minPrice > 0) {
        searchParams.append('min_price', filters.minPrice.toString());
      }
      if (filters.maxPrice > 0) {
        searchParams.append('max_price', filters.maxPrice.toString());
      }
      if (filters.condition) {
        searchParams.append('condition', filters.condition);
      }
      if (filters.rating > 0) {
        searchParams.append('min_rating', filters.rating.toString());
      }
      if (filters.location) {
        searchParams.append('city', filters.location);
      }
      if (filters.sortBy && filters.sortBy !== 'relevance') {
        searchParams.append('sort_by', filters.sortBy);
      }
      if (filters.promoOnly) {
        searchParams.append('promo', '1');
      }

      console.log('Search URL:', `${endpoint}?${searchParams.toString()}`);

      const response = await fetch(`${endpoint}?${searchParams.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }

      const data = await response.json();
      console.log('API Response:', data);

      let filteredProducts: Product[] = [];
      let totalCount = 0;

      // Handle response structure from products endpoint
      if (data.data) {
        // Products endpoint returns data.data.products
        if (data.data.products && Array.isArray(data.data.products)) {
          filteredProducts = data.data.products;
          totalCount = data.data.total || data.data.products.length;
        }
        // Fallback for direct array
        else if (Array.isArray(data.data)) {
          filteredProducts = data.data;
          totalCount = data.data.length;
        }
      }

      // Process products to ensure consistent structure
      const processedProducts: Product[] = filteredProducts.map((p: any) => ({
        id: p.id || '',
        name: p.name || 'Unknown Product',
        description: p.description || '',
        price: p.price || 0,
        discount_price: p.discount_price,
        stock_quantity: p.stock_quantity || 0,
        status: p.status || 'active',
        sku: p.sku || '',
        condition: p.condition || 'new',
        rating: p.rating || 4.5,
        review_count: p.review_count || 0,
        view_count: p.view_count || 0,
        created_at: p.created_at || new Date().toISOString(),
        main_image: p.main_image || '/img.png',
        images: p.images || [],
        additional_images: p.additional_images || [],
        store: p.store || null,
        location: p.store?.location || p.location || 'Indonesia',
        edges: {
          category: p.edges?.category || (p.category ? {
            id: p.category.id || '',
            name: p.category.name || 'Unknown Category'
          } : undefined),
          seller: p.edges?.seller || (p.seller ? {
            id: p.seller.id || '',
            full_name: p.seller.full_name || 'Unknown Seller',
            business_name: p.seller.business_name
          } : undefined)
        }
      }));

      console.log('Processed products:', processedProducts);
      
      setProducts(processedProducts);
      setTotalResults(totalCount);
    } catch (err) {
      setError('Network error occurred');
      console.error('Error loading search results:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (filterName: keyof SearchFilters, value: string | number | boolean) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value,
    }));
    setCurrentPage(1);
  };

  const handleSortChange = (sortBy: string) => {
    setFilters(prev => ({
      ...prev,
      sortBy
    }));
    setCurrentPage(1);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const calculateDiscount = (originalPrice: number, discountPrice: number) => {
    return Math.round(((originalPrice - discountPrice) / originalPrice) * 100);
  };

  const getProductImage = (product: Product) => {
    if (product.main_image) return product.main_image;
    if (product.images && product.images.length > 0) return product.images[0];
    if (product.additional_images && product.additional_images.length > 0) return product.additional_images[0];
    return null;
  };

  const handleProductClick = (productId: string) => {
    navigate(`/product/${productId}`);
  };

  console.log('SearchResultsPage render:', { loading, products: products.length, totalResults, searchQuery });

  if (loading) {
    return (
      <div className="search-results-page">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Mencari produk...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="search-results-page">
      <div className="search-header">
        <div className="search-info">
          <h1>
            {searchQuery && searchQuery.trim() !== '' 
              ? `Menampilkan 1 - ${Math.min(itemsPerPage, totalResults)} barang dari total ${totalResults.toLocaleString('id-ID')} untuk "${searchQuery}"`
              : `Menampilkan semua ${totalResults.toLocaleString('id-ID')} produk`
            }
          </h1>
        </div>
        <div className="search-controls">
          <div className="sort-dropdown">
            <label>Urutkan:</label>
            <select 
              value={filters.sortBy} 
              onChange={(e) => handleSortChange(e.target.value)}
            >
              <option value="relevance">Paling Sesuai</option>
              <option value="price_asc">Harga Terendah</option>
              <option value="price_desc">Harga Tertinggi</option>
              <option value="newest">Terbaru</option>
              <option value="rating">Rating Tertinggi</option>
              <option value="popular">Terpopuler</option>
            </select>
          </div>
        </div>
      </div>

      <div className="search-content">
        <div className="search-sidebar">
          <div className="filter-section">
            <h3>Filter</h3>
            
            {/* Category Filter */}
            <div className="filter-group">
              <h4>Kategori</h4>
              <div className="filter-options">
                <label>
                  <input 
                    type="radio" 
                    name="category" 
                    value=""
                    checked={filters.category === ''}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                  />
                  Semua Kategori
                </label>
                <label>
                  <input 
                    type="radio" 
                    name="category" 
                    value="electronics"
                    checked={filters.category === 'electronics'}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                  />
                  Elektronik
                </label>
                <label>
                  <input 
                    type="radio" 
                    name="category" 
                    value="fashion"
                    checked={filters.category === 'fashion'}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                  />
                  Fashion
                </label>
                <label>
                  <input 
                    type="radio" 
                    name="category" 
                    value="gaming"
                    checked={filters.category === 'gaming'}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                  />
                  Gaming
                </label>
              </div>
            </div>

            {/* Price Range Filter */}
            <div className="filter-group">
              <h4>Harga</h4>
              <div className="price-inputs">
                <input 
                  type="number" 
                  placeholder="Harga Minimum"
                  value={filters.minPrice || ''}
                  onChange={(e) => handleFilterChange('minPrice', parseInt(e.target.value) || 0)}
                />
                <span>-</span>
                <input 
                  type="number" 
                  placeholder="Harga Maksimum"
                  value={filters.maxPrice || ''}
                  onChange={(e) => handleFilterChange('maxPrice', parseInt(e.target.value) || 0)}
                />
              </div>
            </div>

            {/* Condition Filter */}
            <div className="filter-group">
              <h4>Kondisi</h4>
              <div className="filter-options">
                <label>
                  <input 
                    type="radio" 
                    name="condition" 
                    value=""
                    checked={filters.condition === ''}
                    onChange={(e) => handleFilterChange('condition', e.target.value)}
                  />
                  Semua Kondisi
                </label>
                <label>
                  <input 
                    type="radio" 
                    name="condition" 
                    value="new"
                    checked={filters.condition === 'new'}
                    onChange={(e) => handleFilterChange('condition', e.target.value)}
                  />
                  Baru
                </label>
                <label>
                  <input 
                    type="radio" 
                    name="condition" 
                    value="used"
                    checked={filters.condition === 'used'}
                    onChange={(e) => handleFilterChange('condition', e.target.value)}
                  />
                  Bekas
                </label>
              </div>
            </div>

            {/* Rating Filter */}
            <div className="filter-group">
              <h4>Rating</h4>
              <div className="filter-options">
                <label>
                  <input 
                    type="radio" 
                    name="rating" 
                    value="0"
                    checked={filters.rating === 0}
                    onChange={(e) => handleFilterChange('rating', parseInt(e.target.value))}
                  />
                  Semua Rating
                </label>
                <label>
                  <input 
                    type="radio" 
                    name="rating" 
                    value="4"
                    checked={filters.rating === 4}
                    onChange={(e) => handleFilterChange('rating', parseInt(e.target.value))}
                  />
                  ⭐ 4 ke atas
                </label>
                <label>
                  <input 
                    type="radio" 
                    name="rating" 
                    value="3"
                    checked={filters.rating === 3}
                    onChange={(e) => handleFilterChange('rating', parseInt(e.target.value))}
                  />
                  ⭐ 3 ke atas
                </label>
              </div>
            </div>

            {/* Location Filter */}
            <div className="filter-group">
              <h4>Lokasi</h4>
              <div className="filter-options">
                <label>
                  <input 
                    type="radio" 
                    name="location" 
                    value=""
                    checked={filters.location === ''}
                    onChange={(e) => handleFilterChange('location', e.target.value)}
                  />
                  Semua Lokasi
                </label>
                <label>
                  <input 
                    type="radio" 
                    name="location" 
                    value="jakarta"
                    checked={filters.location === 'jakarta'}
                    onChange={(e) => handleFilterChange('location', e.target.value)}
                  />
                  DKI Jakarta
                </label>
                <label>
                  <input 
                    type="radio" 
                    name="location" 
                    value="surabaya"
                    checked={filters.location === 'surabaya'}
                    onChange={(e) => handleFilterChange('location', e.target.value)}
                  />
                  Surabaya
                </label>
                <label>
                  <input 
                    type="radio" 
                    name="location" 
                    value="bandung"
                    checked={filters.location === 'bandung'}
                    onChange={(e) => handleFilterChange('location', e.target.value)}
                  />
                  Bandung
                </label>
              </div>
            </div>

            <div className="filter-group">
              <h4>Promo</h4>
              <div className="filter-options">
                <label>
                  <input
                    type="checkbox"
                    checked={filters.promoOnly}
                    onChange={(e) => handleFilterChange('promoOnly', e.target.checked)}
                  />
                  Hanya tampilkan produk dengan promo atau diskon
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="search-main">
          {error && (
            <div className="error-message">
              <p>❌ {error}</p>
            </div>
          )}

          {products.length === 0 && !loading && (
            <div className="no-results">
              <div className="no-results-icon">🔍</div>
              <h2>Tidak ada hasil untuk "{searchQuery}"</h2>
              <p>Coba kata kunci yang berbeda atau periksa ejaan kata kunci Anda</p>
              <div className="search-suggestions">
                <p>Saran pencarian:</p>
                <ul>
                  <li>Gunakan kata kunci yang lebih umum</li>
                  <li>Periksa ejaan kata kunci</li>
                  <li>Gunakan sinonim atau kata alternatif</li>
                </ul>
              </div>
            </div>
          )}

          {products.length > 0 && (
            <div className="products-grid">
              {products.map((product) => {
                const productImage = getProductImage(product);
                const hasDiscount = product.discount_price && product.discount_price < product.price;
                const discountPercent = hasDiscount ? calculateDiscount(product.price, product.discount_price!) : 0;

                return (
                  <div 
                    key={product.id} 
                    className="search-product-card"
                    onClick={() => handleProductClick(product.id)}
                  >
                    <div className="search-product-image">
                      {productImage ? (
                        <img src={productImage} alt={product.name} onError={(e)=>{e.currentTarget.src='/img.png'}} />
                      ) : (
                        <div className="no-image">📦</div>
                      )}
                      {/* Add badges like ProductCarousel */}
                      <div className="search-special-badge">KHUSUS</div>
                      {hasDiscount && (
                        <div className="search-discount-badge">-{discountPercent}%</div>
                      )}
                      <div className="search-cashback-badge">CB 5%</div>
                    </div>
                    
                    <div className="search-product-info">
                      <h3 className="search-product-name">{product.name}</h3>
                      <div className="search-store-name">
                        {product.edges?.seller?.business_name || product.edges?.seller?.full_name || 'Seller'}
                      </div>
                      
                      <div className="search-product-price">
                        {hasDiscount ? (
                          <>
                            <span className="search-discount-price">{formatPrice(product.discount_price!)}</span>
                            <span className="search-original-price">{formatPrice(product.price)}</span>
                          </>
                        ) : (
                          <span className="search-current-price">{formatPrice(product.price)}</span>
                        )}
                      </div>
                      
                      <div className="search-product-meta">
                        <div className="search-rating-container">
                          <span className="search-rating-stars">⭐ {product.rating.toFixed(1)}</span>
                          <span className="search-rating-count">({product.review_count})</span>
                          <span className="search-sold">{product.view_count} dilihat</span>
                        </div>
                        <div className="search-location">
                          📍 Jakarta
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {totalResults > itemsPerPage && (
            <div className="pagination">
              <button 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => prev - 1)}
              >
                Previous
              </button>
              <span>Halaman {currentPage} dari {Math.ceil(totalResults / itemsPerPage)}</span>
              <button 
                disabled={currentPage >= Math.ceil(totalResults / itemsPerPage)}
                onClick={() => setCurrentPage(prev => prev + 1)}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchResultsPage; 
