import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useParams } from 'react-router-dom';
import './App.css';

// Layout Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import UnderMaintenance from './components/UnderMaintenance';

// Services
import { apiService, authUtils } from './services/api';

// Guest/Buyer Pages
import HomePage from './pages/guest/HomePage';
import SearchPage from './pages/guest/SearchPage';
import SearchResultsPage from './pages/guest/SearchResultsPage';
import DetailPage from './pages/guest/DetailPage';
import CartPage from './pages/guest/CartPage';
import CheckoutPage from './pages/guest/CheckoutPage';

import ProfilePage from './pages/guest/ProfilePage';
import OrderPage from './pages/guest/OrderPage';
import ChatPage from './pages/guest/ChatPage';
import ProductDemo from './pages/guest/ProductDemo';
import ProductsFromAPI from './pages/guest/ProductsFromAPI';
import StorePage from './pages/guest/StorePage';
import ApiTestPage from './pages/guest/ApiTestPage';

// Seller Pages
import DashboardPage from './pages/seller/DashboardPage';
import AddProductPage from './pages/seller/AddProductPage';
import StoreSettingsPage from './pages/seller/StoreSettingsPage';
import SellerAuthPage from './pages/seller/SellerAuthPage';

const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <>{children}</>
);

const AdminDashboardPage: React.FC = () => null;

const AdminUsersPage: React.FC = () => null;

interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  selectedVariant?: string;
  selectedColor?: string;
  seller: string;
  stock: number;
  isSelected: boolean;
}

// Standalone Seller App Component (for new tab)
function SellerApp() {
  const navigate = useNavigate();

  const navigateToSellerDashboard = () => navigate('/seller/dashboard');
  const navigateToAddProduct = () => navigate('/seller/add-product');
  const navigateToStoreSettings = () => navigate('/seller/store-settings');

  return (
    <div className="seller-app">
      <Routes>
        {/* Default seller route - check auth and redirect accordingly */}
        <Route 
          path="/seller" 
          element={
            <SellerAuthPage
              onBack={() => window.close()} // Close tab if user wants to go back
              onAuthSuccess={(user) => {
                navigateToSellerDashboard();
              }}
            />
          } 
        />
        
        {/* Seller Dashboard Routes */}
        <Route 
          path="/seller/dashboard" 
          element={
            <DashboardPage
              onSwitchToGuest={() => window.close()} // Close seller tab to go back to main site
              onNavigateToAddProduct={navigateToAddProduct}
              onNavigateToStoreSettings={navigateToStoreSettings}
            />
          } 
        />
        
        <Route 
          path="/seller/add-product" 
          element={
            <AddProductPage
              onBack={() => navigate('/seller/dashboard')}
              onSwitchToGuest={() => window.close()}
            />
          } 
        />
        
        <Route 
          path="/seller/store-settings" 
          element={
            <StoreSettingsPage
              onBack={() => navigate('/seller/dashboard')}
              onSwitchToGuest={() => window.close()}
            />
          } 
        />

        {/* Redirect unknown seller routes to seller auth */}
        <Route path="/seller/*" element={<Navigate to="/seller" replace />} />
      </Routes>
    </div>
  );
}

// Main App Component with Router Context
function App() {
  return (
    <Router>
      <AppRouter />
    </Router>
  );
}

// Router component to decide between main app or seller app
function AppRouter() {
  const location = window.location.pathname;
  
  // If URL starts with /seller, use SellerApp (standalone seller interface)
  if (location.startsWith('/seller')) {
    return <SellerApp />;
  }
  
  // Otherwise use main buyer app
  return <AppContent />;
}

// Helper Components defined outside to prevent re-renders
const MainLayout = ({ 
  children, 
  showFooter = false, 
  navbarProps 
}: { 
  children: React.ReactNode, 
  showFooter?: boolean, 
  navbarProps: any 
}) => (
  <>
    <Navbar {...navbarProps} />
    {children}
    {showFooter && <Footer />}
  </>
);

const DetailPageWithParams = ({ onAddToCart, onAddToWishlist }: { onAddToCart: any, onAddToWishlist: any }) => {
  const { productId } = useParams<{ productId: string }>();
  return (
    <DetailPage
      productId={productId || ''}
      onBack={() => window.history.back()}
      onAddToCart={onAddToCart}
      onAddToWishlist={onAddToWishlist}
    />
  );
};

const SearchPageWithParams = ({ onProductClick, onBack }: { onProductClick: any, onBack: any }) => {
  const searchParams = new URLSearchParams(window.location.search);
  const query = searchParams.get('q') || '';
  
  return (
    <SearchPage
      searchQuery={query}
      onProductClick={onProductClick}
      onBack={onBack}
    />
  );
};

// App Content Component with Navigation Logic
function AppContent() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartItemCount, setCartItemCount] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Load cart count when user logs in
  React.useEffect(() => {
    if (isLoggedIn && authUtils.isAuthenticated()) {
      loadCartCount();
    } else {
      setCartItemCount(0);
    }
  }, [isLoggedIn]);

  const loadCartCount = async () => {
    try {
      const response = await apiService.getCart();
      if (!response.error && response.data) {
        setCartItemCount(response.data.total_items || 0);
      }
    } catch (error) {
      console.error('Failed to load cart count:', error);
    }
  };

  // Navigation functions
  const navigateToHome = () => navigate('/');
  const navigateToSearch = (query: string) => navigate(`/search-results?q=${encodeURIComponent(query)}`);
  const navigateToProductDetail = (productId: string) => navigate(`/product/${productId}`);
  const navigateToCart = () => {
    if (!isLoggedIn) {
      alert('Silakan login terlebih dahulu');
      return;
    }
    navigate('/cart');
  };
  const navigateToPayment = (items?: any[]) => {
    if (!isLoggedIn) {
      alert('Silakan login terlebih dahulu');
      return;
    }
    navigate('/payment', { state: { items } });
  };
  const navigateToProfile = () => {
    if (!isLoggedIn) {
      alert('Silakan login terlebih dahulu');
      return;
    }
    navigate('/profile');
  };
  const navigateToOrder = () => {
    if (!isLoggedIn) {
      alert('Silakan login terlebih dahulu');
      return;
    }
    navigate('/orders');
  };
  const navigateToChat = () => {
    if (!isLoggedIn) {
      alert('Silakan login terlebih dahulu');
      return;
    }
    navigate('/chat');
  };
  const navigateToStore = (id:string)=> navigate(`/store/${id}`);

  // Note: Seller navigation is now handled in SellerApp component

  // Cart functions
  const handleAddToCart = (product: any, quantity: number) => {
    if (!isLoggedIn) {
      return; // Let ProductDetail handle the error message
    }

    // Update cart count after successful add
    setCartItemCount(prev => prev + quantity);
    
    // Keep existing logic for backward compatibility
    const cartItem: CartItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images?.[0] || 'https://via.placeholder.com/100x100',
      quantity: quantity,
      selectedVariant: product.selectedVariant,
      selectedColor: product.selectedColor,
      seller: product.seller?.name || 'Unknown Seller',
      stock: product.stock || 10,
      isSelected: true,
    };

    setCartItems(prev => {
      const existingIndex = prev.findIndex(item => 
        item.id === cartItem.id && 
        item.selectedVariant === cartItem.selectedVariant &&
        item.selectedColor === cartItem.selectedColor
      );

      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      } else {
        return [...prev, cartItem];
      }
    });
  };

  const handleAddToWishlist = (product: any) => {
    if (!isLoggedIn) {
      alert('Silakan login terlebih dahulu untuk menambahkan ke wishlist');
      return;
    }
    alert(`${product.name} ditambahkan ke wishlist!`);
  };

  const handlePaymentComplete = () => {
    alert('Pembayaran berhasil! Pesanan Anda sedang diproses.');
    setCartItems([]);
    navigate('/orders');
  };

  const navbarProps = {
    onSwitchToSeller: () => {},
    onSwitchToBuyer: () => {},
    onSwitchToCart: navigateToCart,
    onSwitchToProfile: navigateToProfile,
    onSwitchToOrder: navigateToOrder,
    onSwitchToChat: navigateToChat,
    onSearch: navigateToSearch,
    cartItemCount: cartItemCount,
    currentView: "",
    isLoggedIn: isLoggedIn,
    onLogin: () => setIsLoggedIn(true),
    onLogout: () => setIsLoggedIn(false)
  };

  return (
    <div className="App">
      <Routes>
        {/* Guest/Buyer Routes */}
        <Route 
          path="/" 
          element={
            <MainLayout showFooter={true} navbarProps={navbarProps}>
              <HomePage onProductClick={navigateToProductDetail} />
            </MainLayout>
          } 
        />
        
        <Route path="/search" element={
          <MainLayout navbarProps={navbarProps}>
            <SearchPageWithParams onProductClick={navigateToProductDetail} onBack={navigateToHome} />
          </MainLayout>
        } />
        
        <Route path="/search-results" element={
          <MainLayout navbarProps={navbarProps}>
            <SearchResultsPage />
          </MainLayout>
        } />
        
        <Route path="/product/:productId" element={
          <MainLayout showFooter={true} navbarProps={navbarProps}>
            <DetailPageWithParams 
              onAddToCart={handleAddToCart}
              onAddToWishlist={handleAddToWishlist}
            />
          </MainLayout>
        } />
        
        <Route path="/store/:storeId" element={<MainLayout showFooter={true} navbarProps={navbarProps}><StorePage /></MainLayout>} />
        
        <Route 
          path="/cart" 
          element={
            <MainLayout navbarProps={navbarProps}>
              <CartPage
                onBack={() => window.history.back()}
                onCheckout={navigateToPayment}
              />
            </MainLayout>
          } 
        />
        
        <Route 
          path="/payment" 
          element={
            <MainLayout navbarProps={navbarProps}>
              <CheckoutPage />
            </MainLayout>
          } 
        />
        
        <Route 
          path="/profile" 
          element={
            <MainLayout navbarProps={navbarProps}>
              <ProfilePage />
            </MainLayout>
          } 
        />
        
        <Route 
          path="/orders" 
          element={
            <MainLayout showFooter={true} navbarProps={navbarProps}>
              <OrderPage onBack={() => window.history.back()} />
            </MainLayout>
          } 
        />
        
        <Route 
          path="/chat" 
          element={
            <MainLayout navbarProps={navbarProps}>
              <ChatPage onBack={() => window.history.back()} />
            </MainLayout>
          } 
        />

        <Route 
          path="/product-demo" 
          element={
            <MainLayout navbarProps={navbarProps}>
              <ProductDemo />
            </MainLayout>
          } 
        />

        <Route 
          path="/products-api" 
          element={
            <MainLayout navbarProps={navbarProps}>
              <ProductsFromAPI />
            </MainLayout>
          } 
        />

        <Route 
          path="/api-test" 
          element={
            <MainLayout navbarProps={navbarProps}>
              <ApiTestPage />
            </MainLayout>
          } 
        />

        {/* Redirect unknown routes to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;
