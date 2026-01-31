import React, { useState, useEffect } from 'react';
import api from '../api';

function Admin() {
  const [linkInput, setLinkInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [secretKey, setSecretKey] = useState('');
  
  // New: List of existing products for management
  const [existingProducts, setExistingProducts] = useState([]);

  // The form data
  const [product, setProduct] = useState({
    title: '',
    image_url: '',
    link: '',
    price: '',
    category: '',
    description: ''
  });

  // Fetch products on load
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await api.get('/api/products');
      setExistingProducts(res.data);
    } catch (err) {
      console.error("Error fetching products:", err);
    }
  };

  const handleSmartAnalyze = async () => {
    if (!linkInput) return alert("Please paste a link first!");
    
    setLoading(true);
    setProduct({ ...product, title: 'AI Scanned... Writing Title...', description: 'AI is thinking...' }); 

    try {
      const res = await api.post('/api/smart-scrape', { url: linkInput });
      setProduct(res.data); 
    } catch (err) {
      alert("Analysis failed. Please enter details manually.");
      console.error(err);
      setProduct(prev => ({ ...prev, description: '' }));
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/add-product', product, {
        headers: { 'Admin-Secret': secretKey }
      });
      alert('Product Published Successfully! 🚀');
      setProduct({ title: '', image_url: '', link: '', price: '', category: '', description: '' });
      setLinkInput('');
      fetchProducts(); // Refresh the list below
    } catch (err) {
      alert('Failed to save. Check your Admin Password.');
    }
  };

  // NEW: Delete Handler
  const handleDelete = async (id) => {
    if (!secretKey) {
        alert("Please enter the Admin Password in the field above first!");
        return;
    }
    
    if (!window.confirm("Are you sure you want to delete this product?")) return;

    try {
      await api.delete(`/api/delete-product/${id}`, {
        headers: { 'Admin-Secret': secretKey }
      });
      alert("Product Deleted!");
      fetchProducts(); // Refresh the list
    } catch (err) {
      console.error(err);
      alert("Failed to delete. Check your Admin Password.");
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white shadow-xl rounded-xl mt-10 mb-10">
      <h1 className="text-3xl font-extrabold text-center mb-6 text-indigo-600">✨ AI Admin Panel</h1>

      {/* 1. INPUT SECTION */}
      <div className="mb-8 p-6 bg-indigo-50 rounded-xl border border-indigo-100">
        <label className="block font-bold text-indigo-900 mb-2">Paste Product Link</label>
        <div className="flex gap-2">
            <input 
                value={linkInput}
                onChange={(e) => setLinkInput(e.target.value)}
                placeholder="Paste Amazon/Flipkart link here..."
                className="flex-grow p-3 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none"
            />
            <button 
                onClick={handleSmartAnalyze}
                disabled={loading}
                className="bg-indigo-600 text-white px-6 rounded-lg font-bold hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-md"
            >
                {loading ? 'Thinking...' : 'Analyze 🪄'}
            </button>
        </div>
      </div>

      {/* 2. PREVIEW & EDIT SECTION */}
      {(product.image_url || product.title) && (
          <form onSubmit={handleSave} className="space-y-4 animate-fade-in" autoComplete="off">
            
            {/* --- TRICK TO STOP EMAIL AUTOFILL --- */}
            <input type="text" name="fake-email" style={{display: 'none'}} autoComplete="username" />
            <input type="password" name="fake-password" style={{display: 'none'}} autoComplete="current-password" />
            {/* ------------------------------------ */}

            <div className="p-4 border rounded-lg bg-gray-50">
                {product.image_url && (
                    <img src={product.image_url} alt="Preview" className="h-40 mx-auto object-contain mb-4 bg-white rounded p-2 border"/>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase">Category</label>
                        <input className="w-full p-2 border rounded font-medium" value={product.category} onChange={e => setProduct({...product, category: e.target.value})} />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase">Price</label>
                        <input className="w-full p-2 border rounded font-medium text-green-700" value={product.price} onChange={e => setProduct({...product, price: e.target.value})} />
                    </div>
                </div>

                <div className="mt-3">
                    <label className="text-xs font-bold text-gray-500 uppercase">Smart Title</label>
                    <input className="w-full p-2 border rounded font-bold" value={product.title} onChange={e => setProduct({...product, title: e.target.value})} />
                </div>

                <div className="mt-3">
                    <label className="text-xs font-bold text-gray-500 uppercase">Description</label>
                    <textarea 
                        name="product-description"
                        autoComplete="off"
                        className="w-full p-2 border rounded h-24 text-sm text-gray-700" 
                        value={product.description} 
                        onChange={e => setProduct({...product, description: e.target.value})} 
                    />
                </div>
            </div>

            <div className="mt-4">
                <label className="text-sm font-bold text-red-500">Admin Password</label>
                <input 
                    type="password" 
                    value={secretKey} 
                    onChange={e => setSecretKey(e.target.value)} 
                    className="w-full p-2 border border-red-200 rounded focus:border-red-500 outline-none" 
                    placeholder="Enter Secret Key to Save or Delete" 
                    required
                    autoComplete="new-password"
                />
            </div>

            <button type="submit" className="w-full bg-green-600 text-white py-3 rounded-lg font-bold text-lg hover:bg-green-700 shadow-lg transform hover:-translate-y-0.5 transition-all">
                Publish Product 🚀
            </button>
          </form>
      )}

      {/* 3. MANAGE PRODUCTS SECTION */}
      <div className="mt-16 border-t pt-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Manage Existing Products</h2>
        <div className="space-y-3">
            {existingProducts.length === 0 && <p className="text-gray-500 text-sm">No products found.</p>}
            
            {existingProducts.map(p => (
                <div key={p.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border hover:shadow-sm transition">
                    <div className="flex items-center gap-3 overflow-hidden">
                        <img src={p.image_url} alt="tiny" className="h-10 w-10 object-contain bg-white rounded border" />
                        <div className="flex flex-col">
                            <span className="font-bold text-sm text-gray-700 truncate w-32 sm:w-60" title={p.title}>
                                {p.title}
                            </span>
                            <span className="text-xs text-green-600">{p.price}</span>
                        </div>
                    </div>
                    <button 
                        onClick={() => handleDelete(p.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1 rounded text-sm font-bold transition"
                    >
                        Delete
                    </button>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
}

export default Admin;