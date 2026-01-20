import React from 'react';
import { Calendar, Rocket, Settings, Sparkles, Clock, ArrowRight } from 'lucide-react';
import './ComingSoon.css';

interface ComingSoonProps {
  feature: 'shipping' | 'profile' | 'storefront' | 'general';
  title?: string;
  description?: string;
  estimatedDate?: string;
  onNotifyMe?: () => void;
}

const ComingSoon: React.FC<ComingSoonProps> = ({ 
  feature, 
  title, 
  description, 
  estimatedDate = "Q2 2025",
  onNotifyMe 
}) => {
  const getFeatureConfig = () => {
    switch (feature) {
      case 'shipping':
        return {
          icon: <Settings size={48} />,
          title: title || 'Pengaturan Pengiriman',
          description: description || 'Atur opsi pengiriman, zona pengiriman, biaya ongkir, dan integrasi dengan kurir untuk memudahkan proses pengiriman produk Anda.',
          gradient: 'linear-gradient(135deg, #008080 0%, #20b2aa 100%)',
          benefits: [
            'Integrasi dengan berbagai kurir',
            'Pengaturan zona pengiriman otomatis',
            'Kalkulator ongkir real-time',
            'Template gratis ongkir'
          ]
        };
      case 'profile':
        return {
          icon: <Sparkles size={48} />,
          title: title || 'Profil Toko Lengkap',
          description: description || 'Buat profil toko yang menarik dengan customisasi tampilan, branding, dan informasi detail untuk meningkatkan kepercayaan pelanggan.',
          gradient: 'linear-gradient(135deg, #008080 0%, #40e0d0 100%)',
          benefits: [
            'Customisasi theme dan warna toko',
            'Upload logo dan banner profesional',
            'Galeri produk unggulan',
            'Story & about us section'
          ]
        };
      case 'storefront':
        return {
          icon: <Rocket size={48} />,
          title: title || 'Tampilan Toko Premium',
          description: description || 'Dapatkan halaman toko yang lebih menarik dengan layout profesional, widget interaktif, dan fitur marketing yang powerful.',
          gradient: 'linear-gradient(135deg, #2dd4bf 0%, #14b8a6 100%)',
          benefits: [
            'Layout toko yang customizable',
            'Widget promosi dan banner',
            'Analytics dan insights pelanggan',
            'SEO optimization tools'
          ]
        };
      default:
        return {
          icon: <Clock size={48} />,
          title: title || 'Fitur Segera Hadir',
          description: description || 'Kami sedang mengembangkan fitur baru yang akan membantu meningkatkan performa toko Anda.',
          gradient: 'linear-gradient(135deg, #5eead4 0%, #0f766e 100%)',
          benefits: [
            'Fitur canggih dan mudah digunakan',
            'Integrasi yang seamless',
            'Support 24/7',
            'Update gratis selamanya'
          ]
        };
    }
  };

  const config = getFeatureConfig();

  return (
    <div className="coming-soon-container">
      <div className="coming-soon-card" style={{ background: config.gradient }}>
        <div className="coming-soon-header">
          <div className="coming-soon-icon">
            {config.icon}
          </div>
          <div className="coming-soon-badge">
            <Calendar size={16} />
            <span>Coming Soon</span>
          </div>
        </div>

        <div className="coming-soon-content">
          <h2 className="coming-soon-title">{config.title}</h2>
          <p className="coming-soon-description">{config.description}</p>

          <div className="coming-soon-benefits">
            <h4>Yang akan Anda dapatkan:</h4>
            <ul>
              {config.benefits.map((benefit, index) => (
                <li key={index}>
                  <ArrowRight size={16} />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="coming-soon-timeline">
            <div className="timeline-item">
              <div className="timeline-dot active"></div>
              <div className="timeline-content">
                <h5>Development</h5>
                <p>Sedang dikembangkan</p>
              </div>
            </div>
            <div className="timeline-item">
              <div className="timeline-dot"></div>
              <div className="timeline-content">
                <h5>Testing</h5>
                <p>Quality assurance</p>
              </div>
            </div>
            <div className="timeline-item">
              <div className="timeline-dot"></div>
              <div className="timeline-content">
                <h5>Launch</h5>
                <p>Estimasi {estimatedDate}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="coming-soon-actions">
          {onNotifyMe && (
            <button className="notify-btn" onClick={onNotifyMe}>
              <span>Beritahu Saya</span>
              <ArrowRight size={16} />
            </button>
          )}
          <div className="coming-soon-note">
            <p>Kami akan mengirim notifikasi ketika fitur ini sudah tersedia</p>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="coming-soon-decoration">
          <div className="floating-circle circle-1"></div>
          <div className="floating-circle circle-2"></div>
          <div className="floating-circle circle-3"></div>
        </div>
      </div>
    </div>
  );
};

export default ComingSoon; 