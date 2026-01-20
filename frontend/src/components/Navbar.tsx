import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Menu, User, Package, MessageCircle, ChevronDown } from 'lucide-react';
import { authUtils, User as UserType, Category, buildApiUrl, apiService } from '../services/api';
import AuthModal from './AuthModal';
import SellerRegistrationModal from './SellerRegistrationModal';
import './Navbar.css';

interface NavbarProps {
  onSwitchToSeller?: () => void;
  onSwitchToBuyer?: () => void;
  onSwitchToCart?: () => void;
  onSwitchToProfile?: () => void;
  onSwitchToOrder?: () => void;
  onSwitchToChat?: () => void;
  onSearch?: (query: string) => void;
  cartItemCount?: number;
  currentView?: string;
  isLoggedIn?: boolean;
  onLogin?: () => void;
  onLogout?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ 
  onSwitchToSeller, 
  onSwitchToBuyer, 
  onSwitchToCart,
  onSwitchToProfile,
  onSwitchToOrder,
  onSwitchToChat,
  onSearch,
  cartItemCount = 0,
  currentView = 'guest-home',
  isLoggedIn = false,
  onLogin,
  onLogout
}) => {
  const navigate = useNavigate();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSellerModalOpen, setIsSellerModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const [mainCategories, setMainCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<Category[]>([]);
  const [selectedMainCategoryId, setSelectedMainCategoryId] = useState<string | null>(null);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  
  const categoryMenuRef = useRef<HTMLDivElement>(null);
  const kategoriBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        showCategoryMenu &&
        categoryMenuRef.current &&
        !categoryMenuRef.current.contains(event.target as Node) &&
        kategoriBtnRef.current &&
        !kategoriBtnRef.current.contains(event.target as Node)
      ) {
        setShowCategoryMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCategoryMenu]);

  useEffect(() => {
    // Check if user is already logged in
    const user = authUtils.getUser();
    if (user) {
      setCurrentUser(user);
      onLogin?.();
    }
  }, [onLogin]);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setIsLoadingCategories(true);
        const response = await fetch(buildApiUrl('/categories?level=1&limit=100'));
        const data = await response.json();
        if (!data.error && data.data && data.data.categories) {
          setMainCategories(data.data.categories);
        }
      } catch (error) {
        console.error('Error loading main categories:', error);
      } finally {
        setIsLoadingCategories(false);
      }
    };

    loadCategories();
  }, []);

  const handleAuthSuccess = (user: UserType) => {
    console.log('🎉 Navbar - Auth success for user:', user);
    console.log('📋 Navbar - Stored token:', authUtils.getToken() ? 'EXISTS' : 'NULL');
    console.log('📋 Navbar - Stored user:', authUtils.getUser());
    
    setCurrentUser(user);
    setIsAuthModalOpen(false);
    onLogin?.();
    
    // Switch to appropriate dashboard based on user role
    if (user.role === 'seller' && onSwitchToSeller) {
      onSwitchToSeller();
    } else if (user.role === 'buyer' && onSwitchToBuyer) {
      onSwitchToBuyer();
    }
  };

  const handleLogout = () => {
    authUtils.logout();
    setCurrentUser(null);
    setShowUserDropdown(false);
    onLogout?.();
  };

  const handleSellerClick = () => {
    console.log('🔗 Navbar - Seller click, currentUser:', currentUser);
    console.log('🔗 Navbar - Storage check - Token:', authUtils.getToken() ? 'EXISTS' : 'NULL');
    console.log('🔗 Navbar - Storage check - User:', authUtils.getUser());
    
    if (!currentUser) {
      // User not logged in, show auth modal first
      console.log('❌ No current user, showing auth modal');
      setIsAuthModalOpen(true);
      return;
    }
    
    // User is logged in, open seller interface in new tab
    console.log('✅ User logged in, opening seller interface in new tab');
    const sellerUrl = `${window.location.origin}/seller`;
    window.open(sellerUrl, '_blank', 'noopener,noreferrer');
  };

  const handleKategoriClick = () => {
    setShowCategoryMenu((prev) => !prev);
  };

  const handleMainCategoryClick = async (category: Category) => {
    setSelectedMainCategoryId(category.id);
    try {
      const response = await apiService.getCategories({ 
        level: 2, 
        parent_id: category.id, 
        limit: 100,
        include_children: true 
      });
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

  const handleSellerSuccess = (user: UserType) => {
    setCurrentUser(user);
    setIsSellerModalOpen(false);
    onSwitchToSeller?.();
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim() && onSearch) {
      onSearch(searchQuery.trim());
    }
  };

  // Only show navbar for guest views (seller has its own header)
  if (currentView.startsWith('seller-')) {
    return null;
  }

  return (
    <div className="navbar-wrapper">
      {/* Top Header */}
      <div className="top-header">
        <div className="navbar-container">
          <div className="top-header-content">
            <div className="top-links">
              <span>📱 Gratis Ongkir + Banyak Promo belanja di aplikasi</span>
              <div className="top-nav-links">
                <a href="#tentang">Tentang UPTOU</a>
                <button onClick={handleSellerClick} className="seller-link">
                  {currentUser?.role === 'seller' ? 'Seller Dashboard' : 'Mulai Berjualan'}
                </button>
                <a href="#promo">Promo</a>
                <a href="#care">UPTOU Care</a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="main-navbar">
        <div className="navbar-container">
          <div className="navbar-content">
            {/* Left Section */}
          <div className="navbar-left">
              {/* Logo */}
              <div className="logo" onClick={() => window.location.href = '/'} style={{cursor:'pointer'}}>
                <h1>UPTOU</h1>
              </div>

              <button className="kategori-btn" onClick={handleKategoriClick} ref={kategoriBtnRef}>
                <Menu size={16} />
                Kategori
              </button>
            </div>

            {/* Search Bar */}
            <form className="search-container" onSubmit={handleSearchSubmit}>
              <input
                type="text"
                placeholder="Cari di UPTOU"
                className="search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>

            {/* Right Section */}
            <div className="navbar-right">
              {/* Cart Button */}
              <button className="cart-btn" onClick={onSwitchToCart}>
                <ShoppingCart size={20} />
                {cartItemCount > 0 && (
                  <span className="cart-count">{cartItemCount}</span>
                )}
              </button>

              {/* Quick Actions for Logged In Users */}
              {isLoggedIn && (
                <>
                  <button className="nav-icon-btn" onClick={onSwitchToOrder} title="Pesanan Saya">
                    <Package size={20} />
                  </button>
                  <button className="nav-icon-btn" onClick={onSwitchToChat} title="Chat">
                    <MessageCircle size={20} />
                  </button>
                </>
              )}
              
              {/* Authentication Buttons */}
              {!isLoggedIn ? (
                <>
                  <button className="navbar-btn-secondary" onClick={() => setIsAuthModalOpen(true)}>Masuk</button>
                  <button className="navbar-btn-primary" onClick={() => setIsAuthModalOpen(true)}>Daftar</button>
                </>
              ) : (
                <div className="user-menu">
                  <button 
                    className="profile-btn" 
                    onClick={() => setShowUserDropdown(!showUserDropdown)}
                  >
                    <div className="profile-avatar">
                      <User size={16} />
                    </div>
                    <span className="profile-name">
                      {currentUser?.full_name || currentUser?.email || 'User'}
                    </span>
                    <ChevronDown size={16} />
                  </button>
                  
                  {showUserDropdown && (
                    <div className="user-dropdown">
                      <button onClick={() => {
                        onSwitchToProfile?.();
                        setShowUserDropdown(false);
                      }}>
                        <User size={16} />
                        Profil Saya
                      </button>
                      <button onClick={() => {
                        onSwitchToOrder?.();
                        setShowUserDropdown(false);
                      }}>
                        <Package size={16} />
                        Pesanan Saya
                      </button>
                      <button onClick={() => {
                        onSwitchToChat?.();
                        setShowUserDropdown(false);
                      }}>
                        <MessageCircle size={16} />
                        Chat
                      </button>
                      <hr />
                      <button onClick={handleLogout}>Logout</button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showCategoryMenu && (
        <div className="category-menu-dropdown" ref={categoryMenuRef}>
          <div className="navbar-container">
            <div className="category-menu-content">
              <div className="category-menu-column">
                <div className="category-menu-title">Kategori</div>
                {isLoadingCategories && mainCategories.length === 0 && (
                  <div className="category-menu-item">Memuat kategori...</div>
                )}
                {!isLoadingCategories && mainCategories.map((category) => (
                  <button
                    key={category.id}
                    className={`category-menu-item${selectedMainCategoryId === category.id ? ' active' : ''}`}
                    onClick={() => handleMainCategoryClick(category)}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
              <div className="category-menu-column" style={{ width: '100%' }}>
                {selectedMainCategoryId ? (
                  subCategories.length > 0 ? (
                    <div className="category-menu-grid">
                      {subCategories.map((level2) => (
                        <div key={level2.id} className="category-group">
                          <div className="category-level2-title">{level2.name}</div>
                          {level2.children && level2.children.length > 0 && (
                            <div className="category-level3-list">
                              {level2.children.map((level3) => (
                                <div key={level3.id} className="category-level3-item">
                                  {level3.name}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="category-menu-item empty">
                      Belum ada subkategori
                    </div>
                  )
                ) : (
                  <div className="category-menu-item empty">
                    Pilih kategori untuk melihat subkategori
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />

      {/* Seller Registration Modal */}
      <SellerRegistrationModal
        isOpen={isSellerModalOpen}
        onClose={() => setIsSellerModalOpen(false)}
        onSuccess={handleSellerSuccess}
        currentUser={currentUser}
      />
    </div>
  );
};

export default Navbar; 
