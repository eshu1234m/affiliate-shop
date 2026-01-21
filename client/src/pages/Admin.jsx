import React, { useState } from 'react';
import api from '../api'; // Import our new central api

function Admin() {
  const [formData, setFormData] = useState({
    title: '',
    image_url: '',
    link: '',
    price: '',
    category: ''
  });

  // State for the password
  const [secretKey, setSecretKey] = useState('');

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Use api.post instead of axios.post
      await api.post('/api/add-product', formData, {
        headers: { 
            'Admin-Secret': secretKey 
        } 
      });
      alert('Product Added Successfully!');
      // Clear form but keep the password
      setFormData({ title: '', image_url: '', link: '', price: '', category: '' });
    } catch (error) {
      console.error(error);
      alert('FAILED! Incorrect Secret Key or Server Error.');
    }
  };

  return (
    <div className="max-w-lg mx-auto bg-white p-8 rounded shadow-md mt-10">
      <h2 className="text-2xl font-bold mb-6 text-center text-red-600">Admin Area</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* --- PASSWORD FIELD --- */}
        <div className="bg-red-50 p-4 rounded border border-red-200">
            <label className="block text-sm font-bold text-red-700">Admin Password</label>
            <input 
                type="password" 
                value={secretKey}
                onChange={(e) => setSecretKey(e.target.value)}
                placeholder="Enter Secret Key" 
                required
                className="mt-1 block w-full border border-gray-300 rounded-md p-2" 
            />
            <p className="text-xs text-red-500 mt-1">
                (Must match the 'Admin-Secret' in your server/app.py)
            </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Product Title</label>
          <input name="title" onChange={handleChange} value={formData.title} required
            className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Image URL</label>
          <input name="image_url" placeholder="https://..." onChange={handleChange} value={formData.image_url} required
            className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Affiliate Link</label>
          <input name="link" placeholder="https://amzn.to/..." onChange={handleChange} value={formData.link} required
            className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
        </div>

        <div className="flex gap-4">
            <div className="w-1/2">
                <label className="block text-sm font-medium text-gray-700">Price</label>
                <input name="price" placeholder="₹999" onChange={handleChange} value={formData.price} required
                    className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
            </div>
            <div className="w-1/2">
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <input name="category" placeholder="Home" onChange={handleChange} value={formData.category} 
                    className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
            </div>
        </div>

        <button type="submit" 
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition font-bold">
            Upload Product
        </button>
      </form>
    </div>
  );
}

export default Admin;