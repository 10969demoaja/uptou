import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Star, MapPin } from 'lucide-react';
import './TabMenu.css';
import './ProductCarousel.css';
import { buildApiUrl } from '../services/api';
import ErrorState from './ErrorState';

interface Product {
  id: string;
  name: string;
  price: string;
  rating: number;
  sold: string;
  location: string;
  storeName: string; // added
  image: string;
  cashback?: string;
  isSpecial?: boolean;
  discount?: string;
}

interface TabMenuProps {
  onProductClick?: (productId:string)=>void;
}

const TabMenu: React.FC<TabMenuProps> = ({ onProductClick }) => {
  const [activeTab, setActiveTab] = useState('for-you');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const tabs = [
    { id: 'for-you', name: 'For You' },
    { id: 'guncang-77', name: 'Guncang 7.7' },
    { id: 'kesehatan', name: 'Kesehatan' },
    { id: 'mirip-yang-kamu-cek', name: 'Mirip yang kamu cek' },
    { id: 'promo-spesial', name: 'Promo Spesial' },
    { id: 'fashion-pria', name: 'Fashion Pria' },
    { id: 'fashion-wanita', name: 'Fashion Wanita' },
    { id: 'elektronik-trending', name: 'Elektronik Trending' },
    { id: 'rumah-tangga', name: 'Rumah Tangga' },
    { id: 'gadget-terbaru', name: 'Gadget Terbaru' },
    { id: 'kecantikan', name: 'Kecantikan' },
    { id: 'olahraga', name: 'Olahraga' },
    { id: 'makanan-minuman', name: 'Makanan & Minuman' },
    { id: 'super-hemat', name: 'Super Hemat' },
    { id: 'hobi-koleksi', name: 'Hobi & Koleksi' },
  ];

  // Fetch products once on mount
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch(buildApiUrl('/buyer/products'));
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      const transformed: Product[] = (data.data.products || []).map((p: any) => ({
        id: p.id,
        name: p.name,
        price: `Rp${p.price.toLocaleString('id-ID')}`,
        rating: p.rating || 4.5,
        sold: `${p.review_count || 0}+ terjual`,
        location: p.store?.location || 'Unknown',
        storeName: p.store?.name || 'Unknown',
        image: p.main_image || '/img.png',
        cashback: Math.random() > 0.5 ? 'CB 5%' : undefined,
        isSpecial: Math.random() > 0.8,
        discount: p.discount_price ? '-10%' : undefined,
      }));
      setProducts(transformed);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const nextSlide = () => {
    if (currentSlide < Math.max(products.length - 6, 0)) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  if (loading) {
    return (
      <div className="tab-menu section">
        <div className="container">
          <div className="tab-navigation">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.name}
              </button>
            ))}
          </div>
          <div className="tab-content">
            <div className="products-slider">
              <div className="products-track">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="product-card skeleton">
                    <div className="product-image skeleton-image"></div>
                    <div className="product-info">
                      <div className="skeleton-text skeleton-title"></div>
                      <div className="skeleton-text skeleton-price"></div>
                      <div className="skeleton-text skeleton-meta"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="tab-menu section">
        <div className="container">
          <div className="tab-navigation">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.name}
              </button>
            ))}
          </div>
          <div className="tab-content">
            <ErrorState 
              type="api-error"
              message={error}
              onRetry={fetchProducts}
              showRetry={true}
              size="small"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="tab-menu section">
      <div className="container">
        <div className="tab-navigation">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.name}
            </button>
          ))}
        </div>

        <div className="tab-content">
          <div className="carousel-container">
            <button
              className={`carousel-nav prev ${currentSlide === 0 ? 'disabled' : ''}`}
              onClick={prevSlide}
            >
              <ChevronLeft size={20} />
            </button>

            <div className="products-slider">
              <div
                className="products-track"
                style={{ transform: `translateX(-${currentSlide * (100/6)}%)` }}
              >
                {products.map((product) => (
                  <div key={product.id} className="product-card" onClick={()=> onProductClick && onProductClick(product.id)} style={{cursor:'pointer'}}>
                    <div className="product-image">
                      <img src={product.image} alt={product.name} onError={(e)=>{e.currentTarget.src='/img.png'}} />
                      {product.isSpecial && (
                        <div className="special-badge">KHUSUS</div>
                      )}
                      {product.discount && (
                        <div className="discount-badge">{product.discount}</div>
                      )}
                      {product.cashback && (
                        <div className="cashback-badge">{product.cashback}</div>
                      )}
                    </div>
                    <div className="product-info">
                      <h4 className="product-name">{product.name}</h4>
                      <div className="store-name">{product.storeName}</div>
                      <div className="product-price">
                        <span className="current-price">{product.price}</span>
                      </div>
                      <div className="product-meta">
                        <div className="rating-container">
                          <div className="rating">
                            <Star size={12} fill="currentColor" />
                            <span>{product.rating}</span>
                          </div>
                          <span className="sold">{product.sold}</span>
                        </div>
                        <div className="location">
                          <MapPin size={12} />
                          {product.location}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              className={`carousel-nav next ${currentSlide >= products.length - 6 ? 'disabled' : ''}`}
              onClick={nextSlide}
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TabMenu; 