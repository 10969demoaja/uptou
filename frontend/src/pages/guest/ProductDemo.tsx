import React from 'react';
import ProductGrid from '../../components/ProductGrid';

const ProductDemo: React.FC = () => {
  const sampleProducts = [
    {
      id: 1,
      title: "HIPPO ORIGINAL HIP HANDSFREE UNIVERSAL BAS...",
      price: 23400,
      originalPrice: 30000,
      discount: 22,
      rating: 4.7,
      reviewCount: 50,
      soldCount: 120,
      storeName: "Jakarta Utara",
      storeLocation: "Jakarta Utara",
      imageUrl: "https://via.placeholder.com/200x200/e0e0e0/333333?text=HIPPO+HANDSFREE",
      cashbackPercentage: 5,
      badges: ["Hemat s.d. 5%"],
      freeShipping: false
    },
    {
      id: 2,
      title: "Ellipsesinc - Kaos Oversize Pria Wanita Polos",
      price: 43900,
      originalPrice: 55000,
      discount: 20,
      rating: 4.4,
      reviewCount: 80,
      soldCount: 200,
      storeName: "Jakarta Timur",
      storeLocation: "Jakarta Timur",
      imageUrl: "https://via.placeholder.com/200x200/e0e0e0/333333?text=KAOS+OVERSIZE",
      cashbackPercentage: 5,
      badges: ["Hemat s.d. 5%"],
      freeShipping: true
    },
    {
      id: 3,
      title: "Ellipsesinc - Kaos Oversize Pria Wanita NY",
      price: 43900,
      originalPrice: 55000,
      discount: 20,
      rating: 4.7,
      reviewCount: 80,
      soldCount: 150,
      storeName: "Jakarta Barat",
      storeLocation: "Jakarta Barat",
      imageUrl: "https://via.placeholder.com/200x200/e0e0e0/333333?text=KAOS+NY",
      cashbackPercentage: 5,
      badges: ["Hemat s.d. 5%"],
      freeShipping: false
    },
    {
      id: 4,
      title: "Hemat 10% headset earphone L-10 METAL Store...",
      price: 19000,
      originalPrice: 25000,
      discount: 24,
      rating: 4.5,
      reviewCount: 40,
      soldCount: 300,
      storeName: "Jakarta Selatan",
      storeLocation: "Jakarta Selatan",
      imageUrl: "https://via.placeholder.com/200x200/ee4d2d/ffffff?text=HEADSET",
      cashbackPercentage: 10,
      badges: ["Hemat 10%"],
      freeShipping: true
    },
    {
      id: 5,
      title: "Apple iPhone 15 Pro Max 128GB Garansi...",
      price: 21999000,
      originalPrice: 23000000,
      discount: 4,
      rating: 5.0,
      reviewCount: 40,
      soldCount: 50,
      storeName: "iSmile Indonesia",
      storeLocation: "Jakarta",
      imageUrl: "https://via.placeholder.com/200x200/000000/ffffff?text=iPHONE+15+PRO",
      cashbackPercentage: 5,
      badges: ["KHUSUS PENGRIMAN 20"],
      freeShipping: false
    },
    {
      id: 6,
      title: "Sepatu Pria Pantofol Pantovel...",
      price: 80000,
      originalPrice: 100000,
      discount: 20,
      rating: 4.9,
      reviewCount: 14,
      soldCount: 80,
      storeName: "Bekasi",
      storeLocation: "Bekasi",
      imageUrl: "https://via.placeholder.com/200x200/8B4513/ffffff?text=SEPATU+PRIA",
      cashbackPercentage: 5,
      badges: ["Hemat s.d. 5%"],
      freeShipping: true
    },
    {
      id: 7,
      title: "Lampu Sorot LED 10W 20W...",
      price: 16800,
      originalPrice: 20000,
      discount: 16,
      rating: 4.9,
      reviewCount: 10,
      soldCount: 200,
      storeName: "Sle Ibin Store",
      storeLocation: "Jakarta",
      imageUrl: "https://via.placeholder.com/200x200/FFD700/000000?text=LAMPU+LED",
      cashbackPercentage: 0,
      badges: [],
      freeShipping: false
    },
    {
      id: 8,
      title: "INTELLIGENT INVESTOR - ...",
      price: 40000,
      originalPrice: 50000,
      discount: 20,
      rating: 4.8,
      reviewCount: 100,
      soldCount: 500,
      storeName: "paravarabook",
      storeLocation: "Jakarta",
      imageUrl: "https://via.placeholder.com/200x200/4169E1/ffffff?text=BOOK",
      cashbackPercentage: 5,
      badges: ["Hemat s.d. 5%"],
      freeShipping: true
    },
    {
      id: 9,
      title: "Apple iPad Air 5 10.9 Inch 2022...",
      price: 6409000,
      originalPrice: 7000000,
      discount: 8,
      rating: 5.0,
      reviewCount: 100,
      soldCount: 30,
      storeName: "AMPMI EXPRESS",
      storeLocation: "Jakarta",
      imageUrl: "https://via.placeholder.com/200x200/C0C0C0/000000?text=iPAD+AIR+5",
      cashbackPercentage: 0,
      badges: [],
      freeShipping: false
    },
    {
      id: 10,
      title: "PAKET isi 4 Buku The ...",
      price: 86500,
      originalPrice: 100000,
      discount: 14,
      rating: 4.8,
      reviewCount: 10,
      soldCount: 150,
      storeName: "Kedai2",
      storeLocation: "Jakarta",
      imageUrl: "https://via.placeholder.com/200x200/228B22/ffffff?text=BOOK+SET",
      cashbackPercentage: 5,
      badges: ["Hemat s.d. 5%"],
      freeShipping: true
    },
    {
      id: 11,
      title: "TERBARU Stop Lamp Lampu ...",
      price: 350000,
      originalPrice: 400000,
      discount: 13,
      rating: 5.0,
      reviewCount: 40,
      soldCount: 100,
      storeName: "GarasiVarian",
      storeLocation: "Jakarta",
      imageUrl: "https://via.placeholder.com/200x200/FF4500/ffffff?text=STOP+LAMP",
      cashbackPercentage: 5,
      badges: ["Hemat s.d. 5%"],
      freeShipping: false
    },
    {
      id: 12,
      title: "AICO - Kamus ChatGPT - Buku...",
      price: 169000,
      originalPrice: 200000,
      discount: 16,
      rating: 4.8,
      reviewCount: 3,
      soldCount: 50,
      storeName: "AICO COMMUNITY",
      storeLocation: "Jakarta",
      imageUrl: "https://via.placeholder.com/200x200/9932CC/ffffff?text=CHATGPT+BOOK",
      cashbackPercentage: 5,
      badges: ["Hemat s.d. 5%"],
      freeShipping: true
    }
  ];

  return (
    <div style={{ padding: '20px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '30px', color: '#333' }}>
          Demo Product Cards
        </h1>
        <ProductGrid products={sampleProducts} />
      </div>
    </div>
  );
};

export default ProductDemo; 