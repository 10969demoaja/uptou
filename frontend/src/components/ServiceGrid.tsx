import React, { useState } from 'react';
import './ServiceGrid.css';

const ServiceGrid: React.FC = () => {
  const [activeTab, setActiveTab] = useState('promo');

  const tabs = [
    { id: 'promo', name: 'Promo' },
    { id: 'tiket-pesawat', name: 'Tiket Pesawat' },
    { id: 'tiket-kereta', name: 'Tiket Kereta' },
    { id: 'hotel', name: 'Hotel' },
    { id: 'kartu-prakerja', name: 'Kartu Prakerja' },
    { id: 'food-voucher', name: 'Food & Voucher' },
    { id: 'produk-digital', name: 'Produk Digital' },
    { id: 'fintech', name: 'Fintech' },
    { id: 'uptou-salam', name: 'UPTOU Salam' },
    { id: 'diskon-spesial', name: 'Diskon Spesial' },
    { id: 'uptou-play', name: 'UPTOU Play' },
    { id: 'uptou-games', name: 'UPTOU Games' },
    { id: 'investasi-digital', name: 'Investasi Digital' },
    { id: 'travel-lifestyle', name: 'Travel & Lifestyle' },
    { id: 'uptou-member', name: 'UPTOUMember' },
  ];

  const services = [
    [
      { name: 'Bebas Ongkir', link: '#' },
      { name: 'Flash Sale', link: '#' },
      { name: 'Serbu Official Store', link: '#' },
    ],
    [
      { name: 'Catalog', link: '#' },
      { name: 'Kolaborasi Anak Bangsa', link: '#' },
      { name: 'Home Living Celebration', link: '#' },
    ],
    [
      { name: 'UPTOU B2B Digital', link: '#' },
      { name: 'Cantik Fest', link: '#' },
      { name: 'Kejar Diskon', link: '#' },
    ],
    [
      { name: 'Mitra UPTOU', link: '#' },
    ],
  ];

  return (
    <div className="service-grid section">
      <div className="container">
        <h2 className="main-title">Cari Semua di UPTOU!</h2>
        
        <div className="service-tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`service-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.name}
            </button>
          ))}
        </div>

        <div className="services-content">
          <div className="services-grid">
            {services.map((column, columnIndex) => (
              <div key={columnIndex} className="service-column">
                {column.map((service, serviceIndex) => (
                  <a key={serviceIndex} href={service.link} className="service-link">
                    {service.name}
                  </a>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="promotion-section">
          <div className="promotion-content">
            <div className="promotion-text">
              <h3>Punya Toko Online? Buka cabangnya di UPTOU</h3>
              <p>Mudah, nyaman dan bebas Biaya Layanan Transaksi. <strong>GRATIS!</strong></p>
              <div className="promotion-buttons">
                <button className="btn-primary">Buka Toko GRATIS</button>
                <a href="#" className="learn-more">Pelajari lebih lanjut</a>
              </div>
            </div>
            <div className="promotion-image">
              <div className="placeholder-img">400x300 - Ilustrasi Toko Online</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceGrid; 