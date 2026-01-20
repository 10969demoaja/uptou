import React from 'react';
import BannerCarousel from '../../components/BannerCarousel';
import CategoryTopUp from '../../components/CategoryTopUp';
import ProductCarousel from '../../components/ProductCarousel';
import TabMenu from '../../components/TabMenu';
import ServiceGrid from '../../components/ServiceGrid';
import InfoSections from '../../components/InfoSections';
import TopSearch from '../../components/TopSearch';

interface HomePageProps {
  onProductClick: (productId: string) => void;
}

const HomePage: React.FC<HomePageProps> = ({ onProductClick }) => {
  return (
    <div className="home-page">
  
      <BannerCarousel />
      <CategoryTopUp />
      <ProductCarousel onProductClick={onProductClick} />
      <TabMenu onProductClick={onProductClick} />
      <ServiceGrid />
      <InfoSections />
      <TopSearch />
    </div>
  );
};

export default HomePage; 