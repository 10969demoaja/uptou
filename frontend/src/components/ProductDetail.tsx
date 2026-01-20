import React, { useState, useEffect } from 'react';
import { Star, Heart, Share2, ShoppingCart, Plus, Minus, MessageCircle, Shield, Truck, ChevronLeft, ChevronRight, MapPin } from 'lucide-react';
import './ProductDetail.css';
import './ProductCarousel.css';
import { useNavigate } from 'react-router-dom';
import { apiService, buildApiUrl, ProductReview } from '../services/api';
import CartNotification from './CartNotification';
import UnderMaintenance from './UnderMaintenance';

interface ProductDetailProps {
  productId: string;
  onBack: () => void;
  onAddToCart: (product: any, quantity: number) => void;
  onAddToWishlist: (product: any) => void;
}

interface ProductAPI {
  id: string;
  name: string;
  price: number;
  discount_price?: number;
  rating: number;
  review_count: number;
  stock_quantity: number;
  main_image: string;
  description?: string;
  additional_images?: string[];
  edges?: {
    store?: { name?: string; location?: string; id?: string; store_name?: string; city?: string; average_rating?: number; };
  };
}

const ProductDetail: React.FC<ProductDetailProps> = ({ 
  productId, 
  onBack, 
  onAddToCart, 
  onAddToWishlist 
}) => {
  const navigate = useNavigate();
  const token = localStorage.getItem('auth_token') || '';
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addingToCart, setAddingToCart] = useState(false);
  const [showMaintenance, setShowMaintenance] = useState(false);
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  
  // Notification state
  const [notification, setNotification] = useState({
    show: false,
    type: 'success' as 'success' | 'error' | 'warning',
    message: '',
    productName: '',
    productImage: ''
  });

  useEffect(() => {
    window.scrollTo({top:0,behavior:'smooth'});
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await fetch(buildApiUrl(`/buyer/products/${productId}`));
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        const p: ProductAPI = data.data;
        
        // Combine main_image and additional_images for gallery
        const allImages = [];
        if (p.main_image) allImages.push(p.main_image);
        if (p.additional_images && p.additional_images.length > 0) {
          allImages.push(...p.additional_images);
        }
        // If no images, use placeholder
        if (allImages.length === 0) {
          allImages.push('/placeholder-product.jpg');
        }
        
        const transformed = {
          id: p.id,
          name: p.name,
          price: p.price,
          discountPrice: p.discount_price,
          rating: p.rating || 0,
          reviewCount: p.review_count || 0,
          sold: p.review_count || 0,
          stock: p.stock_quantity || 0,
          images: allImages,
          description: p.description,
          seller: {
            id: p.edges?.store?.id || '',
            name: p.edges?.store?.store_name || 'Unknown',
            location: p.edges?.store?.city || 'Jakarta',
            rating: p.edges?.store?.average_rating || 4.5,
          },
          reviews: [],
        };
        setProduct(transformed);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [productId]);

  useEffect(() => {
    const loadReviews = async () => {
      try {
        const res = await apiService.getProductReviews(productId);
        if (!res.error && res.data && Array.isArray(res.data.reviews)) {
          setReviews(res.data.reviews);
        } else {
          setReviews([]);
        }
      } catch (_) {
        setReviews([]);
      }
    };
    loadReviews();
  }, [productId]);

  const formatPrice = (price: number) => new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',minimumFractionDigits:0}).format(price);

  const handleQuantityChange = (change:number)=>{
    if(!product) return;
    const newQ = quantity+change;
    if(newQ>=1 && newQ<=product.stock){setQuantity(newQ);}  };

  const handleAddToCart = async () => {
    if (!product) return;
    
    // Check if user is logged in
    if (!token) {
      setNotification({
        show: true,
        type: 'warning',
        message: 'Silakan login terlebih dahulu untuk menambahkan ke keranjang',
        productName: '',
        productImage: ''
      });
      return;
    }
    
    setAddingToCart(true);
    try {
      const response = await apiService.addToCart(product.id, quantity);
      
      if (response.error) {
        setNotification({
          show: true,
          type: 'error',
          message: response.message || 'Gagal menambahkan ke keranjang',
          productName: '',
          productImage: ''
        });
      } else {
        setNotification({
          show: true,
          type: 'success',
          message: 'Produk berhasil ditambahkan ke keranjang!',
          productName: product.name,
          productImage: product.main_image || (product.images && product.images[0]) || '/img.png'
        });
        
        // Call the original onAddToCart for updating cart count in navbar
        onAddToCart(product, quantity);
      }
    } catch (error) {
      setNotification({
        show: true,
        type: 'error',
        message: 'Terjadi kesalahan saat menambahkan ke keranjang',
        productName: '',
        productImage: ''
      });
    } finally {
      setAddingToCart(false);
    }
  };

  const handleAddToWishlist = async () => {
    if (!product) return;
    if (!token) {
      setNotification({
        show: true,
        type: 'warning',
        message: 'Silakan login terlebih dahulu untuk menyimpan ke wishlist',
        productName: '',
        productImage: ''
      });
      return;
    }
    try {
      const response = await apiService.addWishlistProduct(product.id);
      if (response.error) {
        setNotification({
          show: true,
          type: 'error',
          message: response.message || 'Gagal menyimpan ke wishlist',
          productName: '',
          productImage: ''
        });
      } else {
        setNotification({
          show: true,
          type: 'success',
          message: 'Produk disimpan ke wishlist',
          productName: product.name,
          productImage: (product.images && product.images[0]) || '/img.png'
        });
        onAddToWishlist(product);
      }
    } catch (err: any) {
      setNotification({
        show: true,
        type: 'error',
        message: err.message || 'Gagal menyimpan ke wishlist',
        productName: '',
        productImage: ''
      });
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;
    if (!token) {
      setReviewError('Silakan login untuk memberikan ulasan');
      return;
    }
    if (reviewRating < 1 || reviewRating > 5) {
      setReviewError('Silakan pilih rating 1-5');
      return;
    }
    setReviewSubmitting(true);
    setReviewError(null);
    try {
      const res = await apiService.submitReview(product.id, {
        rating: reviewRating,
        comment: reviewComment || undefined,
      });
      if (res.error) {
        setReviewError(res.message || 'Gagal menyimpan ulasan');
      } else {
        const reviewsRes = await apiService.getProductReviews(product.id);
        if (!reviewsRes.error && reviewsRes.data && Array.isArray(reviewsRes.data.reviews)) {
          setReviews(reviewsRes.data.reviews);
        }
        setReviewComment('');
      }
    } catch (err: any) {
      setReviewError(err.message || 'Gagal menyimpan ulasan');
    } finally {
      setReviewSubmitting(false);
    }
  };

  const handleChatClick = async () => {
    if (!product) return;
    try {
              const res = await fetch(buildApiUrl('/chat/start'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ store_id: product.seller.id }),
      });
      const data = await res.json();
      if(!data.error){
        const convId = data.data.id;
        navigate(`/chat?conv=${convId}`);
      } else {
        alert(data.message||'Gagal membuka chat');
      }
    } catch (err){
      console.error(err);
      alert('Tidak dapat terhubung ke server');
    }
  };

  if(loading){return <div className="product-detail"><p>Loading...</p></div>}
  if(error||!product){return <div className="product-detail"><p>Error: {error||'Not found'}</p></div>}

  // Show under maintenance when checkout is clicked
  if (showMaintenance) {
    return (
      <UnderMaintenance
        title="Fitur Checkout Sedang Dalam Pengembangan"
        message="Fitur checkout dan pembayaran sedang dalam tahap pengembangan. Untuk sementara, Anda dapat menambahkan produk ke keranjang dan melakukan chat dengan penjual."
        onBack={() => setShowMaintenance(false)}
      />
    );
  }

  return (
    <div className="product-detail">
      <div className="product-detail-container">
        <div className="product-detail-content">
          {/* Image Gallery */}
          <div className="product-images">
            <div className="main-image">
              <img src={product.images[selectedImage]} alt={product.name} onError={(e)=>{e.currentTarget.src='/img.png'}} />
              <div className="image-actions">
                <button className="action-btn" onClick={handleAddToWishlist}>
                  <Heart size={20} />
                </button>
                <button className="action-btn">
                  <Share2 size={20} />
                </button>
              </div>
            </div>
            <div className="image-thumbnails">
              {product.images.map((image: string, index: number) => (
                <img
                  key={index}
                  src={image}
                  alt={`${product.name} ${index + 1}`}
                  className={selectedImage === index ? 'active' : ''}
                  onClick={() => setSelectedImage(index)}
                  onError={(e)=>{e.currentTarget.src='/img.png'}}
                />
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="product-info">
            <div className="product-header">
              <h1>{product.name}</h1>
              <div className="detail-product-meta">
                <div className="detail-rating">
                    <span className="store-link" onClick={()=>navigate(`/store/${product.seller.id}`)} style={{cursor:'pointer', color:'var(--primary-color)', fontWeight:500}}>{product.seller.name}</span>
                    <span className="dot">•</span>
                    <Star size={16} fill="currentColor" />
                    <span>{product.rating}</span>
                    <span className="review-count">({product.reviewCount} ulasan)</span>
                    <span className="dot">•</span>
                    <span className="sold">{product.sold} terjual</span>
                  </div>
              </div>
            </div>

            {/* Price */}
            <div className="price-section">
              <div className="detail-current-price-lg">{formatPrice(product.price)}</div>
            </div>

            {/* Quantity */}
            <div className="quantity-section">
              <label>Kuantitas:</label>
              <div className="quantity-controls">
                <button onClick={()=>handleQuantityChange(-1)} disabled={quantity<=1}><Minus size={16}/></button>
                <span>{quantity}</span>
                <button onClick={()=>handleQuantityChange(1)} disabled={quantity>=product.stock}><Plus size={16}/></button>
              </div>
              <span className="stock-info">Stock: {product.stock}</span>
            </div>

            {/* Action Buttons */}
            <div className="action-buttons">
              <button 
                className="product-btn-secondary" 
                onClick={handleAddToCart}
                disabled={addingToCart}
              >
                <ShoppingCart size={20} />
                {addingToCart ? 'Menambahkan...' : 'Tambah ke Keranjang'}
              </button>
              <button className="product-btn-primary" onClick={() => setShowMaintenance(true)}>Beli Sekarang</button>
              <button className="product-btn-chat" onClick={handleChatClick}><MessageCircle size={20}/>Chat</button>
            </div>

            {/* Features */}
            <div className="product-features">
              <div className="feature"><Truck size={20}/><div><strong>Gratis Ongkir</strong></div></div>
              <div className="feature"><Shield size={20}/><div><strong>Garansi Resmi</strong></div></div>
            </div>

            {/* Description */}
            {product.description && (
              <div className="description-section"><h2>Deskripsi</h2><p>{product.description}</p></div>
            )}
            {/* Reviews Section */}
            {/* Reviews will be displayed below */}
          </div>
        </div>
      </div>

      {/* Reviews Section outside main card */}
      <div className="container reviews-section">
        <h2>ULASAN PEMBELI</h2>
        {reviews && reviews.length > 0 ? (
          <div className="reviews-list">
            {reviews.map((r) => (
              <div key={r.id} className="review-item">
                <div className="review-header">
                  <div className="review-author">
                    <Star size={14} fill="currentColor" />
                    <span>{r.rating.toFixed(1)}</span>
                  </div>
                  <div className="review-meta">
                    <span>{r.is_anonymous ? 'Pembeli Anonim' : (r.user?.full_name || 'Pembeli')}</span>
                    <span className="dot">•</span>
                    <span>{new Date(r.created_at).toLocaleDateString('id-ID')}</span>
                  </div>
                </div>
                {r.comment && (
                  <div className="review-comment">
                    {r.comment}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p>Belum ada ulasan.</p>
        )}
        <div className="review-form-wrapper">
          {token ? (
            <form onSubmit={handleSubmitReview} className="review-form">
              <h3>Tulis Ulasan</h3>
              <div className="rating-input">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    type="button"
                    key={value}
                    className={value <= reviewRating ? 'rating-star active' : 'rating-star'}
                    onClick={() => setReviewRating(value)}
                  >
                    <Star size={20} />
                  </button>
                ))}
              </div>
              <textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Ceritakan pengalamanmu dengan produk ini"
                className="review-textarea"
              />
              {reviewError && (
                <div className="review-error">
                  {reviewError}
                </div>
              )}
              <button type="submit" className="product-btn-primary" disabled={reviewSubmitting}>
                {reviewSubmitting ? 'Menyimpan...' : 'Kirim Ulasan'}
              </button>
            </form>
          ) : (
            <p>Silakan login untuk menulis ulasan.</p>
          )}
        </div>
      </div>

      {/* Recommended Products Section */}
      <RecommendedProducts currentProductId={product.id} />

      {/* Cart Notification */}
      <CartNotification
        show={notification.show}
        type={notification.type}
        message={notification.message}
        productName={notification.productName}
        productImage={notification.productImage}
        onClose={() => setNotification(prev => ({ ...prev, show: false }))}
      />

    </div>
  );
};

interface RecommendedProps {
  currentProductId: string;
}

const RecommendedProducts: React.FC<RecommendedProps> = ({ currentProductId }) => {
  const [products, setProducts] = useState<any[]>([]);
  const [slide, setSlide] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(buildApiUrl('/buyer/products?limit=12'));
        const data = await res.json();
        if (data.data && Array.isArray(data.data.products)) {
          const list = data.data.products.filter((p: any)=>p.id!==currentProductId).slice(0,12).map((p:any)=>({
            id:p.id,
            name:p.name,
            price:p.price,
            rating:p.rating||4.5,
            sold:`${p.review_count||0}+ terjual`,
            location:p.store?.location||'Jakarta',
            storeName:p.store?.name||'Unknown',
            image:p.main_image||'/img.png',
            cashback:Math.random()>0.5?'5% Cashback':undefined,
            isSpecial:Math.random()>0.8,
            discount:p.discount_price?'Hemat 10%':undefined,
          }));
          setProducts(list);
        }
      } catch (_) {}
    })();
  }, [currentProductId]);

  if(products.length===0) return null;

  const next=()=>{ if(slide < products.length-6) setSlide(slide+1); };
  const prev=()=>{ if(slide>0) setSlide(slide-1); };

  return (
    <div className="recommended-section product-carousel section">
      <div className="container">
        <h2 style={{marginBottom:16}}>Produk Terkait</h2>
        <div className="carousel-container">
          <button className={`carousel-nav prev ${slide===0?'disabled':''}`} onClick={prev}>
            <ChevronLeft size={20}/>
          </button>
          <div className="products-slider">
            <div className="products-track" style={{transform:`translateX(-${slide*(100/6)}%)`}}>
              {products.map((p:any)=> (
                <div key={p.id} className="carousel-product-card" onClick={()=>navigate(`/product/${p.id}`)} style={{cursor:'pointer'}}>
                  <div className="carousel-product-image">
                    <img src={p.image} alt={p.name} onError={(e)=>{e.currentTarget.src='/img.png'}} />
                    {p.isSpecial && (
                      <div className="special-badge">KHUSUS PENGIRIMAN 20</div>
                    )}
                    {p.discount && (
                      <div className="discount-badge">{p.discount}</div>
                    )}
                    {p.cashback && (
                      <div className="cashback-badge">{p.cashback}</div>
                    )}
                  </div>
                  <div className="carousel-product-info">
                    <h4 className="carousel-product-name">{p.name}</h4>
                    <div className="carousel-store-name">{p.storeName}</div>
                    <div className="carousel-product-price">
                      <span className="carousel-current-price">Rp{p.price.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="carousel-product-meta">
                      <div className="carousel-rating-container">
                        <div className="carousel-rating"><Star size={12} fill="currentColor" /><span>{p.rating}</span></div>
                        <span className="carousel-sold">{p.sold}</span>
                      </div>
                      <div className="carousel-location"><MapPin size={12} />{p.location}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <button className={`carousel-nav next ${slide>=products.length-6?'disabled':''}`} onClick={next}>
            <ChevronRight size={20}/>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
