import React from 'react';

function ProductCard({ product }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow hover:shadow-lg transition-shadow duration-300 overflow-hidden flex flex-col">
      {/* Image Container */}
      <div className="h-48 w-full bg-white flex items-center justify-center p-2">
        <img 
          src={product.image_url} 
          alt={product.title} 
          className="max-h-full max-w-full object-contain"
        />
      </div>
      
      {/* Content */}
      <div className="p-4 flex flex-col flex-grow">
        <span className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">
          {product.category}
        </span>
        <h2 className="text-lg font-bold text-gray-800 leading-tight mb-2 line-clamp-2">
          {product.title}
        </h2>
        <div className="mt-auto flex items-center justify-between">
          <span className="text-xl font-bold text-green-600">
            {product.price}
          </span>
          <a 
            href={product.link} 
            target="_blank" 
            rel="noopener noreferrer"
            className="bg-blue-600 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700 transition-colors"
          >
            Buy Now
          </a>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;