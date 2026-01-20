import React, { useEffect, useState } from 'react';
import { buildApiUrl, Category, apiService } from '../services/api';
import './CategoryTopUp.css';

const CategoryTopUp: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoading(true);
        const response = await fetch(buildApiUrl('/categories?level=1&limit=8'));
        const data = await response.json();

        if (!data.error && data.data && data.data.categories) {
          setCategories(data.data.categories);
        }
      } catch (error) {
        console.error('Error loading categories:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, []);

  const handleCategoryClick = async (category: Category) => {
    setSelectedCategory(category);
    try {
      const response = await apiService.getCategories({ level: 2, parent_id: category.id, limit: 100 });

      if (!response.error && response.data && response.data.categories) {
        setSubCategories(response.data.categories);
      } else {
        setSubCategories([]);
      }
    } catch (error) {
      console.error('Error loading sub categories:', error);
      setSubCategories([]);
    }
  };

  const popularCategories = [
    { id: 1, name: 'Kategori', icon: '📱' },
    { id: 2, name: 'Handphone & Tablet', icon: '📱' },
    { id: 3, name: 'Elektronik', icon: '🎧' },
    { id: 4, name: 'Fashion', icon: '👕' },
    { id: 5, name: 'Perawatan Hewan', icon: '🐕' },
    { id: 6, name: 'Keuangan', icon: '💳' },
    { id: 7, name: 'Komputer & Laptop', icon: '💻' },
  ];

  return (
    <div className="category-topup section">
      <div className="container">
        <div className="categories-section">
          <h3 className="section-title">Kategori Pilihan</h3>
          <div className="categories-grid grid grid-4">
            {loading && categories.length === 0 && (
              <div className="category-card">
                <div className="placeholder-img category-image">
                  Loading...
                </div>
              </div>
            )}
            {!loading && categories.map((category) => (
              <div
                key={category.id}
                className="category-card"
                onClick={() => handleCategoryClick(category)}
              >
                <div className="placeholder-img category-image">
                  {category.name.charAt(0)}
                </div>
                <span className="category-name">{category.name}</span>
              </div>
            ))}
          </div>
        </div>

        {selectedCategory && subCategories.length > 0 && (
          <div className="categories-section">
            <h3 className="section-title">Subkategori {selectedCategory.name}</h3>
            <div className="categories-grid grid grid-4">
              {subCategories.map((category) => (
                <div key={category.id} className="category-card">
                  <div className="placeholder-img category-image">
                    {category.name.charAt(0)}
                  </div>
                  <span className="category-name">{category.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="popular-categories">
          <div className="popular-categories-grid">
            {popularCategories.map((category) => (
              <div key={category.id} className="popular-category">
                <span className="category-icon">{category.icon}</span>
                <span className="category-text">{category.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryTopUp; 
