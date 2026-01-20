import React from 'react';
import { Facebook, Twitter, Instagram, Download } from 'lucide-react';
import './Footer.css';

const Footer: React.FC = () => {
  const footerSections = [
    {
      title: 'UPTOU',
      links: [
        'Tentang UPTOU',
        'Hak Kekayaan Intelektual',
        'Karir',
        'Blog',
        'UPTOU Affiliate Program',
        'UPTOU B2B Digital',
        'UPTOU Marketing Solutions',
        'Kalkulator Indeks Masa Tubuh',
        'UPTOU Farma',
        'Promo Hari Ini',
        'Beli Lokal',
        'Promo Guncang',
      ],
    },
    {
      title: 'Beli',
      links: [
        'Tagihan & Top Up',
        'UPTOU COD',
        'Bebas Ongkir',
      ],
    },
    {
      title: 'Jual',
      links: [
        'Pusat Edukasi Seller',
        'Daftar Mall',
      ],
    },
    {
      title: 'Bantuan dan Panduan',
      links: [
        'UPTOU Care',
        'Syarat dan Ketentuan',
        'Kebijakan Privasi',
      ],
    },
  ];

  const securityBadges = [
    { name: 'PCI DSS COMPLIANT', image: '80x40' },
    { name: 'BSI ISO 27001 & 22301', image: '80x40' },
  ];

  const socialLinks = [
    { name: 'Facebook', icon: Facebook, url: '#' },
    { name: 'Twitter', icon: Twitter, url: '#' },
    { name: 'Instagram', icon: Instagram, url: '#' },
    { name: 'Pinterest', icon: Download, url: '#' },
  ];

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-main">
            <div className="footer-sections">
              {footerSections.map((section, index) => (
                <div key={index} className="footer-section">
                  <h4 className="footer-section-title">{section.title}</h4>
                  <ul className="footer-links">
                    {section.links.map((link, linkIndex) => (
                      <li key={linkIndex}>
                        <a href="#" className="footer-link">{link}</a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="footer-extra">
              <div className="security-section">
                <h4 className="footer-section-title">Keamanan & Privasi</h4>
                <div className="security-badges">
                  {securityBadges.map((badge, index) => (
                    <div key={index} className="security-badge">
                      <div className="placeholder-img">{badge.image}</div>
                      <span>{badge.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="social-section">
                <h4 className="footer-section-title">Ikuti Kami</h4>
                <div className="social-links">
                  {socialLinks.map((social, index) => (
                    <a key={index} href={social.url} className="social-link">
                      <social.icon size={20} />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="footer-app">
            <div className="app-promotion">
              <h4 className="app-title">Nikmati keuntungan di aplikasi</h4>
              <div className="app-benefits">
                <div className="benefit">🏷️ Diskon 70% hanya di aplikasi</div>
                <div className="benefit">🎁 Promo khusus aplikasi</div>
                <div className="benefit">🚚 Gratis Ongkir tiap hari</div>
              </div>
              
              <div className="app-download">
                <div className="qr-code">
                  <div className="placeholder-img">120x120 - QR Code</div>
                </div>
                <div className="download-buttons">
                  <a href="#" className="download-btn">
                    <div className="placeholder-img">140x40 - Google Play</div>
                  </a>
                  <a href="#" className="download-btn">
                    <div className="placeholder-img">140x40 - App Store</div>
                  </a>
                  <a href="#" className="download-btn">
                    <div className="placeholder-img">140x40 - AppGallery</div>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="copyright">
            © 2009 - 2025, PT UPTOU. All Rights Reserved.
          </div>
          <div className="language-selector">
            <button className="language-btn active">Indonesia</button>
            <button className="language-btn">English</button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 