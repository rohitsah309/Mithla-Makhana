import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, SlidersHorizontal, Package, RefreshCw } from 'lucide-react';
import { productAPI } from '../services/api';
import ProductCard from '../components/ProductCard';

const CATEGORIES = [
  { id: 'all', label: 'All Products' },
  { id: 'plain', label: 'Plain & Natural' },
  { id: 'roasted', label: 'Ghee Roasted' },
  { id: 'masala', label: 'Mithila Masala' },
  { id: 'flavoured', label: 'Flavoured' },
  { id: 'sweet', label: 'Sweet & Caramel' },
  { id: 'raw', label: 'Raw Harvest Seeds' }
];

const SORT_OPTIONS = [
  { id: 'popular', label: 'Most Popular' },
  { id: 'newest', label: 'Newest Additions' },
  { id: 'price-low', label: 'Price: Low to High' },
  { id: 'price-high', label: 'Price: High to Low' }
];

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const activeCategory = searchParams.get('category') || 'all';
  const activeSort = searchParams.get('sort') || 'popular';
  const searchQuery = searchParams.get('search') || '';

  const [searchInput, setSearchInput] = useState(searchQuery);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await productAPI.getAll({
        category: activeCategory !== 'all' ? activeCategory : undefined,
        sort: activeSort,
        search: searchQuery || undefined
      });
      if (res.data.success) {
        setProducts(res.data.products);
      }
    } catch (err) {
      console.error('Failed to fetch products', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [activeCategory, activeSort, searchQuery]);

  const handleCategoryChange = (catId) => {
    const params = new URLSearchParams(searchParams);
    if (catId === 'all') {
      params.delete('category');
    } else {
      params.set('category', catId);
    }
    setSearchParams(params);
  };

  const handleSortChange = (sortId) => {
    const params = new URLSearchParams(searchParams);
    params.set('sort', sortId);
    setSearchParams(params);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (searchInput.trim()) {
      params.set('search', searchInput.trim());
    } else {
      params.delete('search');
    }
    setSearchParams(params);
  };

  const clearFilters = () => {
    setSearchInput('');
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header Banner */}
      <div className="bg-hero-gradient rounded-3xl p-8 sm:p-12 border border-[#E8DEC9] relative overflow-hidden">
        <div className="max-w-2xl space-y-3 relative z-10">
          <span className="text-xs uppercase tracking-widest text-[#D99B26] font-bold">
            Naturally Harvested & Prepared
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#4A2E1B]">
            Mithila Makhana Collection
          </h1>
          <p className="text-sm text-[#6D4A32] leading-relaxed">
            Choose from pure snow-white popped lotus seeds, traditional ghee roasted kernels, 
            and authentic regional seasonings.
          </p>
        </div>
        <div className="absolute right-0 bottom-0 opacity-15 w-64 h-64 pointer-events-none">
          <img src="/images/plain-makhana-bowl.png" alt="Makhana background" className="w-full h-full object-cover" />
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-[#E8DEC9] shadow-soft flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#8A6D56] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by product name..."
            className="w-full pl-10 pr-20 py-2 text-xs rounded-xl bg-[#FAF6F0] border border-[#E8DEC9] focus:outline-none focus:border-[#D99B26] text-[#4A2E1B]"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1.5 bottom-1.5 px-3 bg-[#4A2E1B] text-[#FAF6F0] text-[11px] font-semibold rounded-lg hover:bg-[#27170E] transition-colors"
          >
            Search
          </button>
        </form>

        {/* Sorting Dropdown */}
        <div className="flex items-center space-x-3">
          <SlidersHorizontal className="w-4 h-4 text-[#8A6D56]" />
          <span className="text-xs text-[#6D4A32] font-medium hidden sm:inline">Sort By:</span>
          <select
            value={activeSort}
            onChange={(e) => handleSortChange(e.target.value)}
            className="text-xs rounded-xl bg-[#FAF6F0] border border-[#E8DEC9] px-3 py-2 text-[#4A2E1B] font-medium focus:outline-none focus:border-[#D99B26]"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => handleCategoryChange(cat.id)}
            className={`whitespace-nowrap px-4 py-2 rounded-2xl text-xs font-semibold transition-all ${
              activeCategory === cat.id
                ? 'bg-[#4A2E1B] text-[#FAF6F0] shadow-sm'
                : 'bg-white text-[#6D4A32] border border-[#E8DEC9] hover:bg-[#FAF6F0]'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <div key={n} className="bg-white rounded-3xl p-4 h-96 animate-pulse border border-[#E8DEC9]" />
          ))}
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-12 text-center border border-[#E8DEC9] space-y-4 max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-full bg-[#FAF6F0] text-[#D99B26] mx-auto flex items-center justify-center">
            <Package className="w-8 h-8" />
          </div>
          <h3 className="font-serif text-2xl font-bold text-[#4A2E1B]">No Products Found</h3>
          <p className="text-xs text-[#8A6D56]">
            We couldn't find any products matching your current search or category filter.
          </p>
          <button
            onClick={clearFilters}
            className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-[#4A2E1B] text-[#FAF6F0] text-xs font-semibold hover:bg-[#27170E] transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset All Filters</span>
          </button>
        </div>
      )}

    </div>
  );
};

export default Shop;
