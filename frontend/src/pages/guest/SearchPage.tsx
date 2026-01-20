import React, { useState, useEffect } from 'react';
import ProductCarousel from '../../components/ProductCarousel';

interface SearchPageProps {
  searchQuery: string;
  onProductClick: (productId: string) => void;
  onBack: () => void;
}

const SearchPage: React.FC<SearchPageProps> = ({ searchQuery, onProductClick, onBack }) => {
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState({
    priceRange: '',
    category: '',
    rating: '',
    location: ''
  });

  useEffect(() => {
    if (searchQuery) {
      performSearch();
    }
  }, [searchQuery, filters]);

  const performSearch = async () => {
    setIsLoading(true);
    // TODO: Implement actual search API call
    // For now, simulate search results
    setTimeout(() => {
      setSearchResults([
        // Mock search results
      ]);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="search-page">
      <div className="search-header">
        <button onClick={onBack} className="back-button">
          ← Kembali
        </button>
        <h2>Hasil pencarian untuk "{searchQuery}"</h2>
      </div>

      <div className="search-content">
        <div className="search-filters">
          <h3>Filter</h3>
          
          <div className="filter-group">
            <label>Kategori</label>
            <select 
              value={filters.category} 
              onChange={(e) => setFilters({...filters, category: e.target.value})}
            >
              <option value="">Semua Kategori</option>
              <option value="elektronik">Elektronik</option>
              <option value="fashion">Fashion</option>
              <option value="makanan">Makanan</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Harga</label>
            <select 
              value={filters.priceRange} 
              onChange={(e) => setFilters({...filters, priceRange: e.target.value})}
            >
              <option value="">Semua Harga</option>
              <option value="0-100000">Di bawah Rp 100.000</option>
              <option value="100000-500000">Rp 100.000 - Rp 500.000</option>
              <option value="500000-1000000">Rp 500.000 - Rp 1.000.000</option>
              <option value="1000000+">Di atas Rp 1.000.000</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Rating</label>
            <select 
              value={filters.rating} 
              onChange={(e) => setFilters({...filters, rating: e.target.value})}
            >
              <option value="">Semua Rating</option>
              <option value="4+">4+ Bintang</option>
              <option value="3+">3+ Bintang</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Lokasi</label>
            <select 
              value={filters.location} 
              onChange={(e) => setFilters({...filters, location: e.target.value})}
            >
              <option value="">Semua Lokasi</option>
              <option value="jakarta">Jakarta</option>
              <option value="bandung">Bandung</option>
              <option value="surabaya">Surabaya</option>
            </select>
          </div>
        </div>

        <div className="search-results">
          {isLoading ? (
            <div className="loading">Mencari produk...</div>
          ) : (
            <>
              <div className="results-header">
                <span>Menampilkan {searchResults.length} hasil</span>
                <select className="sort-select">
                  <option>Urutkan: Relevan</option>
                  <option>Harga Terendah</option>
                  <option>Harga Tertinggi</option>
                  <option>Rating Tertinggi</option>
                  <option>Terbaru</option>
                </select>
              </div>
              
              <ProductCarousel 
                onProductClick={onProductClick}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchPage; 