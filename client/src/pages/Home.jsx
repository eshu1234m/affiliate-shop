import React, { useEffect, useState } from 'react';
import api from '../api'; // Import our new central api
import ProductCard from '../components/ProductCard';

function Home() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    // Now we just say '/api/products' and let api.js handle the domain
    api.get('/api/products')
      .then(res => setProducts(res.data))
      .catch(err => console.error("Error fetching data:", err));
  }, []);

  return (
    <div className="container mx-auto px-4 pb-10">
      <h1 className="text-2xl font-bold mb-6 text-center">Top Deals & Recommendations</h1>
      
      {products.length === 0 ? (
        <p className="text-center text-gray-500">No products found. Add some from the Admin panel!</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}

export default Home;