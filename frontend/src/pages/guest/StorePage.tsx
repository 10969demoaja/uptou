import React, { useEffect, useState } from 'react';
import { Star, MapPin, MessageCircle } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import '../../components/ProductCarousel.css'; // reuse card styles
import './StorePage.css';
import { buildApiUrl } from '../../services/api';

interface StoreEntity {
  id: string;
  store_name: string;
  logo_url?: string;
  banner_url?: string;
  average_rating: number;
  total_products: number;
  total_sales: number;
  city?: string;
  province?: string;
}

interface ProductItem {
  id: string;
  name: string;
  price: number;
  rating: number;
  review_count: number;
  location: string;
  image: string;
  storeName: string;
}

const PAGE_LIMIT = 60;

const StorePage: React.FC = () => {
  const { storeId } = useParams<{ storeId: string }>();
  const navigate = useNavigate();
  const [store, setStore] = useState<StoreEntity | null>(null);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const token = localStorage.getItem('auth_token');

  useEffect(() => {
    const fetchStore = async () => {
      if (!storeId) return;
      setLoading(true);
      try {
        const res = await fetch(buildApiUrl(`/buyer/stores/${storeId}?limit=${PAGE_LIMIT}&offset=${page*PAGE_LIMIT}`));
        if(!res.ok) throw new Error('Failed');
        const data = await res.json();
        const storeData = data.data.store || {};
        setStore({
          id: storeData.id || '',
          store_name: storeData.store_name || 'Unknown Store',
          logo_url: storeData.logo_url || '/img.png',
          banner_url: storeData.banner_url || '/img.png',
          average_rating: storeData.average_rating || 0,
          total_products: storeData.total_products || 0,
          total_sales: storeData.total_sales || 0,
          city: storeData.city || '',
          province: storeData.province || '',
        });
        const list = (data.data.products || []).map((p:any)=>({
          id:p.id || '',
          name:p.name || 'Unknown Product',
          price:p.price || 0,
          rating:p.rating || 4.5,
          review_count:p.review_count || 0,
          location:p.store?.location || 'Jakarta',
          image:p.main_image || '/img.png',
          storeName:data.data.store?.store_name || 'Unknown Store',
        }));
        setProducts(list);
        setTotal(data.data.total || 0);
      } catch (_) {}
      setLoading(false);
    };
    fetchStore();
  }, [storeId, page]);

  const handleChatClick = async () => {
    if (!store) return;
    
    if (!token) {
      alert('Silakan login terlebih dahulu untuk chat dengan penjual');
      // navigate('/login'); // Uncomment if you have a login route or logic
      return;
    }

    try {
      const res = await fetch(buildApiUrl('/chat/conversations/start'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ store_id: store.id }),
      });
      const data = await res.json();
      if(!data.error){
        const convId = data.data.id;
        navigate(`/chat?conv=${convId}`);
      } else {
        alert(data.message || 'Gagal membuka chat');
      }
    } catch (err){
      console.error(err);
      alert('Tidak dapat terhubung ke server');
    }
  };

  const totalPages = Math.ceil(total / PAGE_LIMIT);

  return (
    <div className="store-page container">
      {loading && <p>Loading...</p>}
      {!loading && store && (
        <>
          {/* Store Header */}
          <div className="store-header">
            <img className="store-logo" src={store.logo_url||'/img.png'} alt={store.store_name} onError={(e)=>{e.currentTarget.src='/img.png'}} />
            <div className="store-info">
              <div className="store-info-top">
                <h2>{store.store_name}</h2>
                <button className="chat-seller-btn" onClick={handleChatClick}>
                  <MessageCircle size={16} />
                  Chat Penjual
                </button>
              </div>
              <div className="store-meta">
                <Star size={14} fill="currentColor" /> {(store.average_rating || 0).toFixed(1)} • {store.total_sales || 0} terjual • {store.city||''} {store.province||''}
              </div>
            </div>
          </div>
          {/* Products Grid */}
          <div className="products-grid">
            {products.map(prod=> (
              <div key={prod.id} className="store-page-card" onClick={()=>navigate(`/product/${prod.id}`)} style={{cursor:'pointer'}}>
                <div className="store-product-image">
                  <img src={prod.image} alt={prod.name} onError={(e)=>{e.currentTarget.src='/img.png'}} />
                  {/* Add badges like ProductCarousel */}
                  <div className="special-badge">KHUSUS</div>
                  <div className="discount-badge">-10%</div>
                  <div className="cashback-badge">CB 5%</div>
                </div>
                <div className="store-product-info">
                  <h4 className="store-product-name">{prod.name}</h4>
                  <div className="store-store-name">{store.store_name}</div>
                  <div className="store-product-price">
                    <span className="store-current-price">Rp{(prod.price || 0).toLocaleString('id-ID')}</span>
                  </div>
                  <div className="store-product-meta">
                    <div className="store-rating-container">
                      <Star size={12} fill="currentColor" />
                      <span>{prod.rating || 0}</span> 
                      <span className="store-sold">{prod.review_count || 0}+ terjual</span>
                    </div>
                    <div className="store-location">
                      <MapPin size={12} />
                      {prod.location}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {/* Pagination */}
          {totalPages>1 && (
            <div className="pagination">
              <button disabled={page===0} onClick={()=>setPage(p=>Math.max(0,p-1))}>Prev</button>
              <span>{page+1} / {totalPages}</span>
              <button disabled={page>=totalPages-1} onClick={()=>setPage(p=>p+1)}>Next</button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default StorePage; 