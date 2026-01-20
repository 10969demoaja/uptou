import React from 'react';
import './InfoSections.css';

const InfoSections: React.FC = () => {
  const infoSections = [
    {
      id: 1,
      title: 'Nikmati Mudahnya Jualan Online di UPTOU',
      subtitle: 'UPTOU mempermudah siapa saja untuk mulai jualan online.',
      content: 'Pendaftaran UPTOU Seller sangat mudah, dan ada fitur Power Merchant yang menawarkan keunggulan seperti Bebas Ongkir dan TopAds untuk memperluas jangkauan pasar dan meningkatkan kepercayaan pembeli.',
      image: '400x300 - Info Image 1'
    },
    {
      id: 2,
      title: 'Belanja Produk-produk Original',
      subtitle: 'UPTOU menyediakan Official Store dari berbagai brand terpercaya.',
      content: 'Produk 100% original, garansi resmi, dan banyak promo menarik seperti cashback dan bebas ongkir. Kamu bisa menemukan produk fashion, elektronik, aksesoris, hingga motor di Official Store UPTOU.',
      image: '400x300 - Info Image 2'
    },
    {
      id: 3,
      title: 'Kerjasama Dengan Brand Ternama',
      subtitle: 'UPTOU menjalin kerjasama dengan brand besar dan UMKM dari seluruh Indonesia.',
      content: 'Banyak brand ternama seperti Samsung, Xiaomi, Wardah, Oppo, dan Vivo membuka Official Store di UPTOU, menjamin produk original, harga terbaik, dan jaminan garansi bagi pembeli.',
      image: '400x300 - Info Image 3'
    },
    {
      id: 4,
      title: 'Pelayanan Menarik Lainnya',
      subtitle: 'UPTOU menyediakan berbagai layanan tambahan untuk kemudahan Anda.',
      content: 'Layanan seperti asuransi, pinjaman online, kartu kredit, investasi reksa dana dan emas, hingga produk digital. Pengguna dapat membeli tiket transportasi, hotel, event, dan membayar tagihan langsung dari aplikasi.',
      image: '400x300 - Info Image 4'
    },
  ];

  return (
    <div className="info-sections section">
      <div className="container">
        {infoSections.map((section, index) => (
          <div key={section.id} className={`info-section ${index % 2 === 1 ? 'reverse' : ''}`}>
            <div className="info-content-wrapper">
              <div className="info-content-top">
                <h3 className="info-title">{section.title}</h3>
                <p className="info-subtitle">{section.subtitle}</p>
              </div>
              <div className="info-content-bottom">
                <p className="info-text">{section.content}</p>
              </div>
            </div>
            <div className="info-image">
              <div className="placeholder-img">{section.image}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InfoSections; 