import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Star, ShoppingBag, Heart, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { isAuthenticated } = useAuth();
  const { info } = useToast();
  const navigate = useNavigate();

  const isWishlisted = isInWishlist(product._id);
  const primaryImage = product.images?.[0] || product.image || '/images/plain-makhana-bowl.png';

  const discountPercent =
    product.compareAtPrice && product.compareAtPrice > product.price
      ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
      : null;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1, product.weight || '250g');
  };

  const handleBuyNow = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1, product.weight || '250g');
    if (!isAuthenticated) {
      info('Please sign in to complete your purchase.');
      navigate('/login?redirect=/checkout');
    } else {
      navigate('/checkout');
    }
  };

  const handleWishlistToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ duration: 0.25 }}
      className="group bg-white rounded-3xl overflow-hidden border border-[#E8DEC9] shadow-soft hover:shadow-lift transition-all flex flex-col justify-between"
    >
      {/* Top Image & Floating Badges */}
      <div className="relative aspect-square w-full bg-[#FAF6F0] overflow-hidden">
        <Link to={`/product/${product.slug || product._id}`}>
          <img
            src={primaryImage}
            alt={product.name}
            className="w-full h-full object-cover object-center group-hover:scale-108 transition-transform duration-500 ease-out"
            loading="lazy"
          />
        </Link>

        {/* Category Pill */}
        <span className="absolute top-3 left-3 bg-[#FAF6F0]/90 backdrop-blur-md text-[#4A2E1B] text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border border-[#E8DEC9] shadow-sm">
          {product.category}
        </span>

        {/* Discount Badge if available */}
        {discountPercent && (
          <span className="absolute bottom-3 left-3 bg-[#D99B26] text-[#27170E] text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full shadow-sm">
            Save {discountPercent}%
          </span>
        )}

        {/* Wishlist Button */}
        <button
          onClick={handleWishlistToggle}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-colors shadow-sm ${
            isWishlisted
              ? 'bg-red-50 text-red-500'
              : 'bg-white/80 text-[#6D4A32] hover:text-red-500 hover:bg-white'
          }`}
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Product Content Details */}
      <div className="p-5 flex flex-col flex-grow justify-between space-y-3">
        <div className="space-y-1.5">
          {/* Rating & Weight info */}
          <div className="flex items-center justify-between text-xs text-[#8A6D56]">
            <div className="flex items-center space-x-1">
              <Star className="w-3.5 h-3.5 fill-[#D99B26] text-[#D99B26]" />
              <span className="font-bold text-[#4A2E1B]">{product.rating || 4.8}</span>
              <span>({product.reviewsCount || 12})</span>
            </div>
            <span className="bg-[#F3ECE2] px-2 py-0.5 rounded text-[11px] font-semibold text-[#6D4A32]">
              {product.weight || '250g'}
            </span>
          </div>

          {/* Product Name */}
          <Link to={`/product/${product.slug || product._id}`} className="block">
            <h3 className="font-serif text-xl font-bold text-[#4A2E1B] group-hover:text-[#D99B26] transition-colors line-clamp-1 leading-snug">
              {product.name}
            </h3>
          </Link>

          {/* Short Description */}
          <p className="text-xs text-[#6D4A32] line-clamp-2 leading-relaxed">
            {product.shortDescription || product.description}
          </p>
        </div>

        {/* Price & Actions */}
        <div className="pt-2 border-t border-[#F3ECE2] space-y-3">
          <div className="flex items-baseline space-x-2">
            <span className="text-xl font-bold text-[#4A2E1B]">₹{product.price}</span>
            {product.compareAtPrice > product.price && (
              <span className="text-xs text-gray-400 line-through">₹{product.compareAtPrice}</span>
            )}
            <span className="text-[10px] text-[#2D5A27] font-semibold">Taxes included</span>
          </div>

          {/* Buttons: Add to Cart & Buy Now */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={handleAddToCart}
              className="w-full flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl border border-[#4A2E1B] text-[#4A2E1B] hover:bg-[#FAF6F0] font-medium text-xs transition-colors"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Add to Cart</span>
            </button>

            <button
              onClick={handleBuyNow}
              className="w-full flex items-center justify-center space-x-1 py-2 px-3 rounded-xl bg-[#4A2E1B] hover:bg-[#27170E] text-[#FAF6F0] font-semibold text-xs shadow-sm transition-colors"
            >
              <span>Buy Now</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
