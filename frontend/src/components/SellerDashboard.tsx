import React, { useState } from 'react';
import './SellerDashboard.css';
import SellerSidebar from './SellerSidebar';
import SellerHeader from './SellerHeader';
import ManageProducts from './ManageProducts';
import AddProduct from './AddProduct';
import ManageOrders from './ManageOrders';
import ManageShippingSettings from './ManageShippingSettings';
import SellerChat from './SellerChat';
import ComingSoon from './ComingSoon';
import { Product } from '../services/api';

interface SellerDashboardProps {
  onSwitchToGuest: () => void;
  onNavigateToAddProduct?: () => void;
  onNavigateToStoreSettings?: () => void;
}

export type PageType = 
  | 'homepage'
  | 'manage-orders'
  | 'shipping-settings'
  | 'manage-products'
  | 'add-product'
  | 'shop-profile'
  | 'shop-appearance'
  | 'chat'
  | 'image-test';

const SellerDashboard: React.FC<SellerDashboardProps> = ({ 
  onSwitchToGuest,
  onNavigateToAddProduct,
  onNavigateToStoreSettings 
}) => {
  const [currentPage, setCurrentPage] = useState<PageType>('manage-products');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const handlePageChange = (page: PageType) => {
    setCurrentPage(page);
    setEditingProduct(null);
  };

  const handleAddProduct = () => {
    setEditingProduct(null);
    setCurrentPage('add-product');
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setCurrentPage('add-product');
  };

  const handleBackToManage = () => {
    setCurrentPage('manage-products');
    setEditingProduct(null);
  };

  const handleNotifyMe = () => {
    alert('Kami akan mengirim email notifikasi ketika fitur ini sudah tersedia!');
  };

  const renderMainContent = () => {
    switch (currentPage) {
      case 'homepage':
        return (
          <div className="page-content">
            <h1>Homepage</h1>
            <p>Welcome to UPTOU Seller Center</p>
          </div>
        );
      
      case 'manage-orders':
        return <ManageOrders />;
      
      case 'shipping-settings':
        return <ManageShippingSettings />;
      
      case 'manage-products':
        return <ManageProducts onAddProduct={handleAddProduct} onEditProduct={handleEditProduct} />;
      
      case 'add-product':
        return <AddProduct onBack={handleBackToManage} initialData={editingProduct || undefined} />;
      
      case 'shop-profile':
        return (
          <div className="page-content" style={{ padding: '0', background: 'transparent' }}>
            <ComingSoon 
              feature="profile"
              estimatedDate="April 2025"
              onNotifyMe={handleNotifyMe}
            />
          </div>
        );
      
      case 'shop-appearance':
        return (
          <div className="page-content" style={{ padding: '0', background: 'transparent' }}>
            <ComingSoon 
              feature="storefront"
              estimatedDate="Mei 2025"
              onNotifyMe={handleNotifyMe}
            />
          </div>
        );
      
      case 'chat':
        return <SellerChat />;
      
      default:
        return <ManageOrders />;
    }
  };

  // Full-width layout for add-product page
  if (currentPage === 'add-product') {
    return (
      <div className="seller-dashboard">
        <SellerHeader onSwitchToGuest={onSwitchToGuest} />
        <AddProduct onBack={handleBackToManage} initialData={editingProduct || undefined} />
      </div>
    );
  }

  return (
    <div className="seller-dashboard">
      <SellerHeader onSwitchToGuest={onSwitchToGuest} />
      <div className="seller-dashboard-content">
        <SellerSidebar 
          currentPage={currentPage}
          onPageChange={handlePageChange}
        />
        <div className="seller-main-content">
          {renderMainContent()}
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard; 