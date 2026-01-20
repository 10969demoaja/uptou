import React from 'react';
import './TopSearch.css';

const TopSearch: React.FC = () => {
  const topSearches = [
    { rank: 1, keyword: 'iPhone 13', searches: '1.2M pencarian' },
    { rank: 2, keyword: 'Samsung Galaxy S22', searches: '890K pencarian' },
    { rank: 3, keyword: 'Laptop ASUS', searches: '756K pencarian' },
    { rank: 4, keyword: 'Sepatu Nike', searches: '634K pencarian' },
    { rank: 5, keyword: 'Tas Wanita', searches: '567K pencarian' },
    { rank: 6, keyword: 'Headset Gaming', searches: '445K pencarian' },
    { rank: 7, keyword: 'Kemeja Pria', searches: '387K pencarian' },
    { rank: 8, keyword: 'Skincare Korea', searches: '321K pencarian' },
    { rank: 9, keyword: 'Power Bank', searches: '298K pencarian' },
    { rank: 10, keyword: 'Jam Tangan', searches: '276K pencarian' },
  ];

  return (
    <div className="top-search section">
      <div className="container">
        <h2 className="section-title">🔥 Pencarian Teratas</h2>
        <div className="search-leaderboard">
          {topSearches.map((search) => (
            <div key={search.rank} className={`search-item ${search.rank <= 3 ? 'top-three' : ''}`}>
              <div className="rank-badge">
                <span className="rank-number">{search.rank}</span>
              </div>
              <div className="search-info">
                <h4 className="search-keyword">{search.keyword}</h4>
                <span className="search-count">{search.searches}</span>
              </div>
              {search.rank <= 3 && (
                <div className="medal">
                  {search.rank === 1 ? '🥇' : search.rank === 2 ? '🥈' : '🥉'}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TopSearch; 