import React, { useState, useEffect } from 'react';
import ProductGrid from '../../components/ProductGrid';
import { buildApiUrl } from '../../services/api';
import ErrorState from '../../components/ErrorState';

interface Product {
  id: number;
  title: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  rating: number;
  reviewCount: number;
  soldCount: number;
  storeName: string;
  storeLocation: string;
  imageUrl: string;
  cashbackPercentage?: number;
  badges?: string[];
  freeShipping?: boolean;
}

const ProductsFromAPI: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
              const response = await fetch(buildApiUrl('/buyer/products?limit=20'));
      const data = await response.json();
      
      if (data.error) {
        setError(data.message);
        return;
      }

      // Transform API data to match our component interface
      const transformedProducts: Product[] = (data.data.products || []).map((apiProduct: any) => ({
        id: parseInt(apiProduct.id.slice(-8), 16), // Convert part of UUID to number
        title: apiProduct.name,
        price: apiProduct.price,
        originalPrice: apiProduct.discount_price,
        discount: apiProduct.discount_price 
          ? Math.round(((apiProduct.discount_price - apiProduct.price) / apiProduct.discount_price) * 100)
          : undefined,
        rating: apiProduct.rating || 0,
        reviewCount: apiProduct.review_count || 0,
        soldCount: apiProduct.stock_quantity || 0, // Using stock as sold count for demo
        storeName: apiProduct.store?.name || "Unknown Store",
        storeLocation: apiProduct.store?.location || "Unknown Location",
        imageUrl: apiProduct.main_image || "https://via.placeholder.com/200x200/f0f0f0/666666?text=No+Image",
        cashbackPercentage: 5, // Default cashback
        badges: ["Hemat s.d. 5%"],
        freeShipping: Math.random() > 0.5, // Random free shipping for demo
      }));

      setProducts(transformedProducts);
    } catch (err) {
      setError('Failed to fetch products from API');
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <div style={{ 
        padding: '20px', 
        backgroundColor: '#f5f5f5', 
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <ErrorState 
          type="api-error"
          message={error}
          onRetry={fetchProducts}
          showRetry={true}
        />
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <h1 style={{ color: '#333' }}>
            Produk dari Database
          </h1>
          <button 
            onClick={fetchProducts}
            style={{
              padding: '8px 16px',
              backgroundColor: '#ee4d2d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Refresh
          </button>
        </div>
        
        {products.length === 0 && !loading && (
          <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
            <p>Tidak ada produk ditemukan. Jalankan seeder untuk menambahkan data produk.</p>
          </div>
        )}
        
        <ProductGrid products={products} loading={loading} />
      </div>
    </div>
  );
};

export default ProductsFromAPI; 