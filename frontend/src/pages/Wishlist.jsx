import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';

const Wishlist = () => {
  const { wishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();

  const handleMoveToCart = (product) => {
    addToCart(product, 1, product.weight || '250g');
    toggleWishlist(product);
  };

  if (wishlist.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-20 h-20 rounded-full bg-[#FAF6F0] border-2 border-[#E8DEC9] text-red-400 mx-auto flex items-center justify-center">
          <Heart className="w-8 h-8 fill-current" />
        </div>
        <h2 className="font-serif text-3xl font-bold text-[#4A2E1B]">Your Wishlist is Empty</h2>
        <p className="text-xs text-[#8A6D56] max-w-sm mx-auto">
          Explore our range of authentic plain, slow-roasted, and masala makhana and save your favorites here.
        </p>
        <Link
          to="/shop"
          className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-[#4A2E1B] text-[#FAF6F0] text-xs font-bold"
        >
          <span>Browse Products</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      <div className="border-b border-[#E8DEC9] pb-4">
        <h1 className="font-serif text-3xl font-bold text-[#4A2E1B]">
          Saved Wishlist ({wishlist.length} Items)
        </h1>
        <p className="text-xs text-[#8A6D56] mt-0.5">
          Items you've bookmarked for your next healthy snacking haul.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {wishlist.map((product) => (
          <div
            key={product._id}
            className="bg-white rounded-3xl overflow-hidden border border-[#E8DEC9] shadow-soft flex flex-col justify-between"
          >
            <div className="relative aspect-square bg-[#FAF6F0] overflow-hidden">
              <Link to={`/product/${product.slug || product._id}`}>
                <img
                  src={product.images?.[0] || product.image || '/images/plain-makhana-bowl.png'}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </Link>
              <button
                onClick={() => toggleWishlist(product)}
                className="absolute top-3 right-3 p-2 rounded-full bg-white/90 text-red-500 shadow-sm"
                aria-label="Remove from wishlist"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3 flex flex-col flex-grow justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#D99B26] tracking-wider block mb-1">
                  {product.category}
                </span>
                <Link
                  to={`/product/${product.slug || product._id}`}
                  className="font-serif text-lg font-bold text-[#4A2E1B] hover:text-[#D99B26] transition-colors line-clamp-1"
                >
                  {product.name}
                </Link>
                <span className="font-bold text-sm text-[#4A2E1B] block mt-1">₹{product.price}</span>
              </div>

              <button
                onClick={() => handleMoveToCart(product)}
                className="w-full py-2.5 rounded-xl bg-[#4A2E1B] hover:bg-[#27170E] text-[#FAF6F0] font-bold text-xs flex items-center justify-center space-x-1.5 transition-colors"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Move to Cart</span>
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};

export default Wishlist;
