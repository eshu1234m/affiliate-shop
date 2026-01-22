import React from 'react';

function ProductCard({ product }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-2xl transition-all duration-300 flex flex-col group h-full overflow-hidden">
      
      {/* Image Area */}
      <div className="h-56 w-full bg-white flex items-center justify-center p-6 relative">
        <img 
          src={product.image_url} 
          alt={product.title} 
          className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-500"
        />
        {/* Category Badge */}
        <span className="absolute top-3 right-3 bg-indigo-50 text-indigo-700 text-xs font-bold px-3 py-1 rounded-full border border-indigo-100 shadow-sm">
            {product.category}
        </span>
      </div>
      
      {/* Content Area */}
      <div className="p-5 flex flex-col flex-grow bg-gray-50/50">
        <h2 className="text-lg font-bold text-gray-900 leading-tight mb-2 line-clamp-2" title={product.title}>
          {product.title}
        </h2>
        
        {/* AI Description */}
        {product.description && (
            <p className="text-sm text-gray-600 line-clamp-3 mb-4 leading-relaxed">
                {product.description}
            </p>
        )}

        {/* Footer: Price & Button */}
        <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-200">
          <span className="text-xl font-extrabold text-green-700 tracking-tight">
            {product.price}
          </span>
          <a 
            href={product.link} 
            target="_blank" 
            rel="noopener noreferrer"
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-indigo-700 transition-colors shadow-md hover:shadow-indigo-500/30 text-sm"
          >
            Buy Now
          </a>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;