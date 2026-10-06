import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, ArrowRight } from 'lucide-react';
import { productAPI } from '../services/api';

const SearchModal = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await productAPI.getAll({ search: query });
        if (res.data.success) {
          setResults(res.data.products);
        }
      } catch (err) {
        console.error('Search error', err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  const handleSelectProduct = (product) => {
    onClose();
    navigate(`/product/${product.slug || product._id}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
      <div 
        className="w-full max-w-2xl bg-[#FAF6F0] rounded-3xl shadow-2xl border border-[#E8DEC9] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="p-4 sm:p-6 border-b border-[#E8DEC9] flex items-center space-x-3 bg-white">
          <Search className="w-5 h-5 text-[#D99B26] flex-shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search makhana by name or flavour (e.g. Masala, Roasted, Cheese)..."
            className="flex-1 bg-transparent border-none text-base sm:text-lg text-[#4A2E1B] placeholder-[#8A6D56] focus:outline-none"
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-gray-400 hover:text-gray-600 text-xs px-2 py-1 rounded-md"
            >
              Clear
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1 rounded-full text-[#6D4A32] hover:bg-[#F3ECE2] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results Area */}
        <div className="max-h-96 overflow-y-auto p-4 sm:p-6">
          {loading ? (
            <div className="text-center py-8 text-sm text-[#8A6D56]">
              Searching authentic makhana...
            </div>
          ) : results.length > 0 ? (
            <div className="space-y-3">
              <span className="text-xs uppercase tracking-wider text-[#8A6D56] font-bold">
                Found {results.length} Products
              </span>
              {results.map((product) => (
                <div
                  key={product._id}
                  onClick={() => handleSelectProduct(product)}
                  className="flex items-center justify-between p-3 rounded-2xl bg-white hover:bg-[#F5ECE0] border border-[#E8DEC9] cursor-pointer transition-colors group"
                >
                  <div className="flex items-center space-x-4">
                    <img
                      src={product.images?.[0] || product.image || '/images/plain-makhana-bowl.png'}
                      alt={product.name}
                      className="w-12 h-12 rounded-xl object-cover border border-[#E8DEC9]"
                    />
                    <div>
                      <h4 className="text-sm font-bold text-[#4A2E1B] group-hover:text-[#D99B26] transition-colors">
                        {product.name}
                      </h4>
                      <div className="flex items-center space-x-2 text-xs text-[#8A6D56]">
                        <span className="capitalize">{product.category}</span>
                        <span>•</span>
                        <span>{product.weight}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span className="font-bold text-sm text-[#4A2E1B]">₹{product.price}</span>
                    <ArrowRight className="w-4 h-4 text-[#8A6D56] group-hover:text-[#D99B26] group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              ))}
            </div>
          ) : query ? (
            <div className="text-center py-8">
              <p className="text-sm font-semibold text-[#4A2E1B]">No products found matching "{query}"</p>
              <p className="text-xs text-[#8A6D56] mt-1">Try searching for "Plain", "Roasted", or "Masala"</p>
            </div>
          ) : (
            <div className="text-center py-6 text-xs text-[#8A6D56]">
              <p className="font-medium text-[#4A2E1B] text-sm mb-1">Popular Searches</p>
              <div className="flex flex-wrap items-center justify-center gap-2 mt-3">
                {['Plain Makhana', 'Roasted Ghee', 'Masala', 'Caramel Jaggery', 'Peri Peri'].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setQuery(tag)}
                    className="px-3 py-1.5 rounded-full bg-white border border-[#E8DEC9] text-[#6D4A32] hover:border-[#D99B26] hover:text-[#D99B26] transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchModal;
