import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './BannerCarousel.css';

const BannerCarousel: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const banners = [
    { id: 1, image: '/Banner section 1/1.png', alt: 'Banner 1' },
    { id: 2, image: '/Banner section 1/2.png', alt: 'Banner 2' },
    { id: 3, image: '/Banner section 1/3.png', alt: 'Banner 3' },
    { id: 4, image: '/Banner section 1/4.png', alt: 'Banner 4' },
    { id: 5, image: '/Banner section 1/5.png', alt: 'Banner 5' },
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % banners.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
  };

  // Auto-slide functionality
  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 3000); // 3 seconds

    // Clean up interval on component unmount
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="banner-carousel section">
      <div className="container">
        <div className="carousel-container">
          <button className="carousel-btn prev" onClick={prevSlide}>
            <ChevronLeft size={24} />
          </button>
          
          <div className="carousel-wrapper">
            <div 
              className="carousel-slides"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {banners.map((banner) => (
                <div key={banner.id} className="carousel-slide">
                  <img 
                    src={banner.image} 
                    alt={banner.alt}
                    className="banner-image"
                  />
                </div>
              ))}
            </div>
          </div>
          
          <button className="carousel-btn next" onClick={nextSlide}>
            <ChevronRight size={24} />
          </button>
        </div>
        
        <div className="carousel-indicators">
          {banners.map((_, index) => (
            <button
              key={index}
              className={`indicator ${index === currentSlide ? 'active' : ''}`}
              onClick={() => setCurrentSlide(index)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default BannerCarousel; 