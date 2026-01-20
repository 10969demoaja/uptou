import React, { useState } from 'react';
import './SellerSidebar.css';
import { PageType } from './SellerDashboard';

interface SellerSidebarProps {
  currentPage: PageType;
  onPageChange: (page: PageType) => void;
}

const SellerSidebar: React.FC<SellerSidebarProps> = ({ currentPage, onPageChange }) => {
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['orders', 'products', 'toko']);

  const toggleMenu = (menuId: string) => {
    setExpandedMenus(prev => 
      prev.includes(menuId) 
        ? prev.filter(id => id !== menuId)
        : [...prev, menuId]
    );
  };
  
  const isMenuActive = (menuId: string, subPages: string[] = []) => {
    return currentPage === menuId || subPages.includes(currentPage);
  };

  const menuItems = [
    { 
      id: 'homepage', 
      label: 'Homepage', 
      icon: '🏠',
      page: 'homepage' as PageType,
      hidden: true
    },
    { 
      id: 'orders', 
      label: 'Orders', 
      icon: '📦', 
      hasSubmenu: true,
      subPages: ['manage-orders', 'shipping-settings']
    },
    { 
      id: 'products', 
      label: 'Products', 
      icon: '🛍️', 
      hasSubmenu: true,
      subPages: ['manage-products']
    },
    { 
      id: 'toko', 
      label: 'Toko', 
      icon: '🏪', 
      hasSubmenu: true,
      subPages: ['shop-profile', 'shop-appearance']
    },
    { 
      id: 'chat', 
      label: 'Chat', 
      icon: '💬',
      page: 'chat' as PageType
    },
    { 
      id: 'marketing', 
      label: 'Marketing', 
      icon: '📢',
      page: 'marketing' as PageType,
      hidden: true
    },
    { 
      id: 'affiliate', 
      label: 'Affiliate', 
      icon: '🤝',
      page: 'affiliate' as PageType,
      hidden: true
    },
    { 
      id: 'live-video', 
      label: 'LIVE & Video', 
      icon: '📹',
      page: 'live-video' as PageType,
      hidden: true
    },
    { 
      id: 'growth', 
      label: 'Growth', 
      icon: '📈',
      page: 'growth' as PageType,
      hidden: true
    },
    { 
      id: 'data-compass', 
      label: 'Data compass', 
      icon: '🧭',
      page: 'data-compass' as PageType,
      hidden: true
    },
    { 
      id: 'account-health', 
      label: 'Account health', 
      icon: '💊',
      page: 'account-health' as PageType,
      hidden: true
    },
    { 
      id: 'finance', 
      label: 'Finance', 
      icon: '💰',
      page: 'finance' as PageType,
      hidden: true
    },
  ];

  const ordersSubmenu = [
    { id: 'manage-orders', label: 'Manage orders', page: 'manage-orders' as PageType },
    { id: 'shipping-settings', label: 'Shipping settings', page: 'shipping-settings' as PageType },
  ];

  const productSubmenu = [
    { id: 'manage-products', label: 'Manage products', page: 'manage-products' as PageType },
  ];

  const tokoSubmenu = [
    { id: 'shop-profile', label: 'Profil Toko', page: 'shop-profile' as PageType },
    { id: 'shop-appearance', label: 'Tampilan Toko', page: 'shop-appearance' as PageType },
  ];

  return (
    <aside className="seller-sidebar">
      <nav className="sidebar-nav">
        {menuItems.filter(item => !item.hidden).map((item) => (
          <div key={item.id} className="sidebar-menu-item">
            <div 
              className={`menu-item ${isMenuActive(item.page || '', item.subPages) ? 'active' : ''}`}
              onClick={() => {
                if (item.hasSubmenu) {
                  toggleMenu(item.id);
                  // Set default page for submenu
                  if (item.id === 'orders' && !item.subPages?.includes(currentPage)) {
                    onPageChange('manage-orders');
                  } else if (item.id === 'products' && !item.subPages?.includes(currentPage)) {
                    onPageChange('manage-products');
                  } else if (item.id === 'toko' && !item.subPages?.includes(currentPage)) {
                    onPageChange('shop-profile');
                  }
                } else if (item.page) {
                  onPageChange(item.page);
                }
              }}
            >
              <span className="menu-icon">{item.icon}</span>
              <span className="menu-label">{item.label}</span>
              {item.hasSubmenu && (
                <span className={`menu-arrow ${expandedMenus.includes(item.id) ? 'expanded' : ''}`}>
                  ▼
                </span>
              )}
            </div>
            
            {/* Orders Submenu */}
            {item.hasSubmenu && item.id === 'orders' && expandedMenus.includes(item.id) && (
              <div className="submenu">
                {ordersSubmenu.map((subItem) => (
                  <div 
                    key={subItem.id}
                    className={`submenu-item ${currentPage === subItem.page ? 'active' : ''}`}
                    onClick={() => onPageChange(subItem.page)}
                  >
                    <span className="submenu-label">{subItem.label}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Products Submenu */}
            {item.hasSubmenu && item.id === 'products' && expandedMenus.includes(item.id) && (
              <div className="submenu">
                {productSubmenu.map((subItem) => (
                  <div 
                    key={subItem.id}
                    className={`submenu-item ${currentPage === subItem.page ? 'active' : ''}`}
                    onClick={() => onPageChange(subItem.page)}
                  >
                    <span className="submenu-label">{subItem.label}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Toko Submenu */}
            {item.hasSubmenu && item.id === 'toko' && expandedMenus.includes(item.id) && (
              <div className="submenu">
                {tokoSubmenu.map((subItem) => (
                  <div 
                    key={subItem.id}
                    className={`submenu-item ${currentPage === subItem.page ? 'active' : ''}`}
                    onClick={() => onPageChange(subItem.page)}
                  >
                    <span className="submenu-label">{subItem.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>
    </aside>
  );
};

export default SellerSidebar; 