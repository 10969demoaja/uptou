import React, { useState } from 'react';
import { apiService } from '../../services/api';

const ApiTestPage: React.FC = () => {
  const [results, setResults] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState(localStorage.getItem('auth_token') || '');

  const addResult = (message: string) => {
    setResults(prev => prev + '\n' + new Date().toLocaleTimeString() + ': ' + message);
  };

  const testGetProducts = async () => {
    setLoading(true);
    try {
      const response = await apiService.getBuyerProducts({ limit: 5 });
      addResult(`✅ Get Products: ${JSON.stringify(response, null, 2)}`);
    } catch (error) {
      addResult(`❌ Get Products Error: ${error}`);
    }
    setLoading(false);
  };

  const testLogin = async () => {
    setLoading(true);
    const testEmail = 'test@example.com';
    try {
      const response = await apiService.login(testEmail);
      addResult(`✅ Login: ${JSON.stringify(response, null, 2)}`);
    } catch (error) {
      addResult(`❌ Login Error: ${error}`);
    }
    setLoading(false);
  };

  const testGetCart = async () => {
    setLoading(true);
    try {
      const response = await apiService.getCart();
      addResult(`✅ Get Cart: ${JSON.stringify(response, null, 2)}`);
    } catch (error) {
      addResult(`❌ Get Cart Error: ${error}`);
    }
    setLoading(false);
  };

  const testAddToCart = async () => {
    setLoading(true);
    const testProductId = 'test-product-id';
    try {
      const response = await apiService.addToCart(testProductId, 1);
      addResult(`✅ Add to Cart: ${JSON.stringify(response, null, 2)}`);
    } catch (error) {
      addResult(`❌ Add to Cart Error: ${error}`);
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h2>🧪 API Test Page</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <label>
          Auth Token: 
          <input 
            type="text" 
            value={token} 
            onChange={(e) => setToken(e.target.value)}
            style={{ width: '300px', marginLeft: '10px' }}
          />
        </label>
        <button 
          onClick={() => {
            localStorage.setItem('auth_token', token);
            addResult('Token updated in localStorage');
          }}
          style={{ marginLeft: '10px' }}
        >
          Set Token
        </button>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <button onClick={testGetProducts} disabled={loading} style={{ margin: '5px' }}>
          Test Get Products
        </button>
        <button onClick={testLogin} disabled={loading} style={{ margin: '5px' }}>
          Test Login
        </button>
        <button onClick={testGetCart} disabled={loading} style={{ margin: '5px' }}>
          Test Get Cart
        </button>
        <button onClick={testAddToCart} disabled={loading} style={{ margin: '5px' }}>
          Test Add to Cart
        </button>
        <button 
          onClick={() => setResults('')} 
          style={{ margin: '5px', backgroundColor: '#ff6b6b', color: 'white' }}
        >
          Clear Results
        </button>
      </div>

      <div style={{ 
        backgroundColor: '#f5f5f5', 
        padding: '20px', 
        borderRadius: '5px',
        height: '400px',
        overflow: 'auto',
        whiteSpace: 'pre-wrap'
      }}>
        <strong>Test Results:</strong>
        {results || 'No tests run yet...'}
      </div>

      <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
        <h3>📋 Manual Test Commands:</h3>
        <div style={{ backgroundColor: '#f0f0f0', padding: '10px', borderRadius: '5px' }}>
          <p><strong>1. Get Products (Public):</strong></p>
          <code>curl -X GET "https://uptou-465507.web.app/api/buyer/products?limit=5"</code>
          
          <p><strong>2. Get Cart (Need Token):</strong></p>
          <code>curl -X GET "https://uptou-465507.web.app/api/buyer/cart" -H "Authorization: Bearer YOUR_TOKEN"</code>
          
          <p><strong>3. Add to Cart (Need Token + Product ID):</strong></p>
          <code>curl -X POST "https://uptou-465507.web.app/api/buyer/cart" -H "Content-Type: application/json" -H "Authorization: Bearer YOUR_TOKEN" -d '{`{"product_id": "PRODUCT_ID", "quantity": 1}`}'</code>
        </div>
      </div>
    </div>
  );
};

export default ApiTestPage; 