import React, { useEffect, useState } from 'react';
import api from '../api';
import ProductCard from '../components/ProductCard';

function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/products')
      .then(res => setProducts(res.data))
      .catch(err => console.error("Error fetching data:", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="container mx-auto px-4 pb-10 pt-6">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Today's Top Deals</h1>
        <p className="text-gray-500">Hand-picked tech, fashion, and home gear.</p>
      </div>
      
      {loading ? (
        <div className="text-center py-20 text-gray-400">Loading deals...</div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-lg border border-dashed">
            <p className="text-xl text-gray-500 font-medium">No products yet.</p>
            <p className="text-gray-400">Go to /admin to add some!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}

export default Home;