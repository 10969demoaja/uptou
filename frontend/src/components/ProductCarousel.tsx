import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Star, MapPin } from 'lucide-react';
import './ProductCarousel.css';
import { buildApiUrl } from '../services/api';

interface ProductCarouselProps {
  onProductClick?: (productId: string) => void;
}

interface Product {
  id: string;
  name: string;
  price: string;
  originalPrice?: string;
  rating: number;
  sold: string;
  location: string;
  storeName: string; // added
  image: string;
  cashback?: string;
  bonus?: string;
  isSpecial?: boolean;
  discount?: string;
}

const ProductCarousel: React.FC<ProductCarouselProps> = ({ onProductClick }) => {
  const [activeSection, setActiveSection] = useState('berdasarkan-pencarian');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const sections = [
    { id: 'berdasarkan-pencarian', name: 'Berdasarkan Pencarianmu' },
    { id: 'bayar-di-tempat', name: 'Bayar di Tempat' },
    { id: 'flash-sale', name: 'Flash Sale' },
    { id: 'kejar-diskon', name: 'Kejar Diskon' },
    { id: 'rekomendasi', name: 'Rekomendasi Untukmu' },
    { id: 'produk-terlaris', name: 'Produk Terlaris' },
    { id: 'promo-hari-ini', name: 'Promo Hari Ini' },
    { id: 'official-store', name: 'Official Store' },
    { id: 'produk-terbaru', name: 'Produk Terbaru' },
    { id: 'gratis-ongkir', name: 'Gratis Ongkir' },
  ];

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch(buildApiUrl('/buyer/products'));
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        const data = await response.json();
        
        // Transform API data to match component interface
        const transformedProducts: Product[] = (data.data.products || []).map((product: any) => ({
          id: product.id,
          name: product.name,
          price: `Rp${product.price.toLocaleString('id-ID')}`,
          originalPrice: product.discount_price ? `Rp${product.discount_price.toLocaleString('id-ID')}` : undefined,
          rating: product.rating || 4.5,
          sold: `${product.review_count || 0}+ terjual`,
          location: product.store?.location || 'Jakarta',
          storeName: product.store?.name || 'Unknown', // added
          image: product.main_image || '/img.png',
          // Add some variety for display
          cashback: Math.random() > 0.5 ? 'CB 5%' : undefined,
          // bonus not shown in carousel for cleaner layout
          bonus: undefined,
          isSpecial: Math.random() > 0.8,
          discount: product.discount_price ? '-10%' : undefined,
        }));
        
        setProducts(transformedProducts);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleProductClick = (productId: string) => {
    if (onProductClick) {
      onProductClick(productId);
    }
  };

  const nextSlide = () => {
    if (currentSlide < products.length - 6) {
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
      <div className="product-carousel section">
        <div className="container">
          <div className="section-tabs">
            {sections.map((section) => (
              <button
                key={section.id}
                className={`section-tab ${activeSection === section.id ? 'active' : ''}`}
                onClick={() => setActiveSection(section.id)}
              >
                {section.name}
              </button>
            ))}
          </div>
          <div className="carousel-container">
            <div className="products-slider">
              <div className="products-track">
                {[...Array(6)].map((_, index) => (
                  <div key={index} className="carousel-product-card skeleton">
                    <div className="carousel-product-image skeleton-image"></div>
                    <div className="carousel-product-info">
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
      <div className="product-carousel section">
        <div className="container">
          <div className="section-tabs">
            {sections.map((section) => (
              <button
                key={section.id}
                className={`section-tab ${activeSection === section.id ? 'active' : ''}`}
                onClick={() => setActiveSection(section.id)}
              >
                {section.name}
              </button>
            ))}
          </div>
          <div className="carousel-container">
            <div className="error-message">
              <p>Error loading products: {error}</p>
              <button onClick={() => window.location.reload()}>Retry</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="product-carousel section">
      <div className="container">
        <div className="section-tabs">
          {sections.map((section) => (
            <button
              key={section.id}
              className={`section-tab ${activeSection === section.id ? 'active' : ''}`}
              onClick={() => setActiveSection(section.id)}
            >
              {section.name}
            </button>
          ))}
        </div>

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
                <div 
                  key={product.id} 
                  className="carousel-product-card"
                  onClick={() => handleProductClick(product.id)}
                >
                  <div className="carousel-product-image">
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
                  <div className="carousel-product-info">
                    <h4 className="carousel-product-name">{product.name}</h4>
                    <div className="carousel-store-name">{product.storeName}</div>
                    <div className="carousel-product-price">
                      <span className="carousel-current-price">{product.price}</span>
                      {/* Hapus harga coret untuk tampilan lebih ringkas */}
                    </div>
                    <div className="carousel-product-meta">
                      <div className="carousel-rating-container">
                        <div className="carousel-rating">
                          <Star size={12} fill="currentColor" />
                          <span>{product.rating}</span>
                        </div>
                        <span className="carousel-sold">{product.sold}</span>
                      </div>
                      <div className="carousel-location">
                        <MapPin size={12} />
                        {product.location}
                      </div>
                      {/* bonus tag hidden for clean layout */}
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
  );
};

export default ProductCarousel; 