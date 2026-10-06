import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Star, 
  ShoppingBag, 
  Heart, 
  Truck, 
  ShieldCheck, 
  Check, 
  Plus, 
  Minus, 
  ArrowRight, 
  Sparkles, 
  Clock, 
  Info 
} from 'lucide-react';
import { productAPI } from '../services/api';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import ProductCard from '../components/ProductCard';

const ProductDetail = () => {
  const { slugOrId } = useParams();
  const navigate = useNavigate();
  const { addToCart, freeShippingThreshold } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { isAuthenticated } = useAuth();
  const { success, error, info } = useToast();

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);

  // User Interactive Selections
  const [selectedImage, setSelectedImage] = useState('');
  const [selectedWeight, setSelectedWeight] = useState('');
  const [currentPrice, setCurrentPrice] = useState(0);
  const [currentComparePrice, setCurrentComparePrice] = useState(0);
  const [quantity, setQuantity] = useState(1);

  // Review Form
  const [reviewName, setReviewName] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await productAPI.getBySlugOrId(slugOrId);
        if (res.data.success) {
          const prod = res.data.product;
          setProduct(prod);
          setRelated(res.data.related || []);
          setSelectedImage(prod.images?.[0] || prod.image || '/images/plain-makhana-bowl.png');
          
          // Initial weight selection
          const defaultWeight = prod.weight || (prod.availableWeights?.[0]?.weight) || '250g';
          setSelectedWeight(defaultWeight);

          // Find initial price for selected weight
          if (prod.availableWeights && prod.availableWeights.length > 0) {
            const match = prod.availableWeights.find((w) => w.weight === defaultWeight);
            if (match) {
              setCurrentPrice(match.price);
              setCurrentComparePrice(match.compareAtPrice || 0);
            } else {
              setCurrentPrice(prod.price);
              setCurrentComparePrice(prod.compareAtPrice || 0);
            }
          } else {
            setCurrentPrice(prod.price);
            setCurrentComparePrice(prod.compareAtPrice || 0);
          }
        }
      } catch (err) {
        console.error('Failed to load product detail', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
    window.scrollTo(0, 0);
  }, [slugOrId]);

  const handleWeightSelect = (weightOpt) => {
    setSelectedWeight(weightOpt.weight);
    setCurrentPrice(weightOpt.price);
    setCurrentComparePrice(weightOpt.compareAtPrice || 0);
  };

  const handleAddToCart = () => {
    if (!product) return;
    addToCart({ ...product, price: currentPrice }, quantity, selectedWeight);
  };

  const handleBuyNow = () => {
    if (!product) return;
    addToCart({ ...product, price: currentPrice }, quantity, selectedWeight);
    if (!isAuthenticated) {
      info('Please sign in to complete your purchase.');
      navigate('/login?redirect=/checkout');
    } else {
      navigate('/checkout');
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewComment.trim()) {
      error('Please write a review comment.');
      return;
    }
    setSubmittingReview(true);
    try {
      const res = await productAPI.addReview(product._id, {
        rating: reviewRating,
        comment: reviewComment,
        name: reviewName.trim() || 'Verified Customer'
      });
      if (res.data.success) {
        setProduct(res.data.product);
        setReviewComment('');
        setReviewName('');
        success('Thank you! Your review has been submitted.');
      }
    } catch (err) {
      error('Failed to submit review.');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="inline-block w-8 h-8 border-4 border-[#D99B26] border-t-transparent rounded-full animate-spin" />
        <p className="mt-4 text-sm text-[#8A6D56]">Loading makhana details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="font-serif text-3xl font-bold text-[#4A2E1B]">Product Not Found</h2>
        <p className="text-xs text-[#8A6D56]">The product you requested does not exist or has been moved.</p>
        <Link to="/shop" className="inline-flex px-6 py-2.5 rounded-xl bg-[#4A2E1B] text-[#FAF6F0] text-xs font-semibold">
          Return to Shop
        </Link>
      </div>
    );
  }

  const isWishlisted = isInWishlist(product._id);
  const gallery = product.images && product.images.length > 0 ? product.images : ['/images/plain-makhana-bowl.png'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-xs text-[#8A6D56]">
        <Link to="/" className="hover:text-[#4A2E1B]">Home</Link>
        <span>/</span>
        <Link to="/shop" className="hover:text-[#4A2E1B]">Shop</Link>
        <span>/</span>
        <span className="capitalize hover:text-[#4A2E1B]">{product.category}</span>
        <span>/</span>
        <span className="text-[#4A2E1B] font-semibold truncate max-w-[200px]">{product.name}</span>
      </nav>

      {/* Main Product Showcase Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* Left: Gallery & Large Image */}
        <div className="lg:col-span-6 space-y-4">
          <div className="aspect-square rounded-3xl overflow-hidden bg-white border border-[#E8DEC9] shadow-soft relative">
            <img
              src={selectedImage}
              alt={product.name}
              className="w-full h-full object-cover object-center transition-all duration-300"
            />
            {currentComparePrice > currentPrice && (
              <span className="absolute top-4 left-4 bg-[#D99B26] text-[#27170E] font-bold text-xs uppercase px-3 py-1 rounded-full shadow-sm">
                Save ₹{currentComparePrice - currentPrice}
              </span>
            )}
          </div>

          {/* Thumbnails */}
          {gallery.length > 1 && (
            <div className="flex items-center space-x-3 overflow-x-auto pb-2">
              {gallery.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`w-20 h-20 rounded-2xl overflow-hidden border-2 flex-shrink-0 transition-all ${
                    selectedImage === img ? 'border-[#D99B26] ring-2 ring-[#D99B26]/30' : 'border-[#E8DEC9] opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`${product.name} angle ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Information & Purchasing Options */}
        <div className="lg:col-span-6 space-y-6">
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider font-bold text-[#D99B26] bg-[#FEF8EA] px-3 py-1 rounded-full border border-[#D99B26]/30">
                {product.category} Makhana
              </span>
              <button
                onClick={() => toggleWishlist(product)}
                className={`p-2 rounded-full border transition-colors ${
                  isWishlisted
                    ? 'bg-red-50 border-red-200 text-red-500'
                    : 'border-[#E8DEC9] text-[#6D4A32] hover:text-red-500'
                }`}
                aria-label="Wishlist"
              >
                <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
              </button>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#4A2E1B] leading-tight">
              {product.name}
            </h1>

            {/* Rating Stars */}
            <div className="flex items-center space-x-3 text-sm">
              <div className="flex items-center text-[#D99B26]">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.round(product.rating || 5) ? 'fill-current text-[#D99B26]' : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="font-bold text-[#4A2E1B]">{product.rating}</span>
              <span className="text-xs text-[#8A6D56]">({product.reviewsCount || 0} reviews)</span>
            </div>
          </div>

          {/* Pricing */}
          <div className="p-4 rounded-2xl bg-[#FAF6F0] border border-[#E8DEC9] flex items-baseline space-x-3">
            <span className="text-3xl font-bold text-[#4A2E1B]">₹{currentPrice}</span>
            {currentComparePrice > currentPrice && (
              <span className="text-base text-gray-400 line-through">₹{currentComparePrice}</span>
            )}
            <span className="text-xs font-semibold text-[#2D5A27]">Inclusive of all taxes</span>
          </div>

          {/* Weight Selector */}
          {product.availableWeights && product.availableWeights.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs uppercase font-bold text-[#4A2E1B] tracking-wider block">
                Select Package Weight:
              </label>
              <div className="flex flex-wrap gap-2.5">
                {product.availableWeights.map((wOpt) => (
                  <button
                    key={wOpt.weight}
                    onClick={() => handleWeightSelect(wOpt)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                      selectedWeight === wOpt.weight
                        ? 'bg-[#4A2E1B] text-[#FAF6F0] border-[#4A2E1B] shadow-sm'
                        : 'bg-white text-[#6D4A32] border-[#E8DEC9] hover:bg-[#FAF6F0]'
                    }`}
                  >
                    <span>{wOpt.weight}</span>
                    <span className="ml-1.5 opacity-80 font-normal">₹{wOpt.price}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity Stepper & Action Buttons */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center space-x-4">
              <span className="text-xs uppercase font-bold text-[#4A2E1B] tracking-wider">Quantity:</span>
              <div className="flex items-center border border-[#E8DEC9] rounded-xl bg-white">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 text-[#4A2E1B] hover:bg-[#FAF6F0] rounded-l-xl transition-colors"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="px-4 py-1 text-xs font-bold text-[#4A2E1B]">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-2 text-[#4A2E1B] hover:bg-[#FAF6F0] rounded-r-xl transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                onClick={handleAddToCart}
                className="w-full flex items-center justify-center space-x-2 py-3 px-6 rounded-2xl border-2 border-[#4A2E1B] text-[#4A2E1B] font-bold text-sm hover:bg-[#FAF6F0] transition-colors"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Add to Cart</span>
              </button>

              <button
                onClick={handleBuyNow}
                className="w-full flex items-center justify-center space-x-2 py-3 px-6 rounded-2xl bg-[#4A2E1B] hover:bg-[#27170E] text-[#FAF6F0] font-bold text-sm shadow-card transition-colors"
              >
                <span>Buy Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Assurances */}
          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-[#E8DEC9] text-xs text-[#6D4A32]">
            <div className="flex items-center space-x-2">
              <Truck className="w-4 h-4 text-[#2D5A27]" />
              <span>Free Delivery over ₹{freeShippingThreshold}</span>
            </div>
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-[#2D5A27]" />
              <span>100% Authentic Bihar Harvest</span>
            </div>
          </div>

          {/* Short Description */}
          <div className="text-xs text-[#6D4A32] leading-relaxed pt-2">
            <p>{product.description}</p>
          </div>

        </div>

      </div>

      {/* ==================================================
          Nutritional Facts, Ingredients, Storage & Delivery
          ================================================== */}
      <div className="bg-white rounded-3xl p-8 sm:p-10 border border-[#E8DEC9] shadow-soft space-y-8">
        <h3 className="font-serif text-2xl font-bold text-[#4A2E1B] border-b border-[#E8DEC9] pb-4">
          Product Details & Nutrition
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          {/* Ingredients & Storage */}
          <div className="space-y-4">
            <div>
              <h4 className="font-bold text-sm text-[#4A2E1B] uppercase tracking-wider mb-2">Ingredients</h4>
              <ul className="space-y-1.5 text-xs text-[#6D4A32]">
                {product.ingredients?.map((item, idx) => (
                  <li key={idx} className="flex items-start space-x-2">
                    <Check className="w-3.5 h-3.5 text-[#2D5A27] flex-shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-2">
              <h4 className="font-bold text-sm text-[#4A2E1B] uppercase tracking-wider mb-1.5">Storage Instructions</h4>
              <p className="text-xs text-[#6D4A32] leading-relaxed">{product.storageInstructions}</p>
            </div>

            <div>
              <h4 className="font-bold text-sm text-[#4A2E1B] uppercase tracking-wider mb-1.5">Delivery Information</h4>
              <p className="text-xs text-[#6D4A32] leading-relaxed">{product.deliveryInfo}</p>
            </div>
          </div>

          {/* Nutritional Facts Table */}
          <div className="space-y-3">
            <h4 className="font-bold text-sm text-[#4A2E1B] uppercase tracking-wider">
              Nutritional Facts <span className="text-[11px] font-normal text-[#8A6D56]">(Approximate per 100g)</span>
            </h4>
            <div className="border border-[#E8DEC9] rounded-2xl overflow-hidden text-xs">
              <div className="flex justify-between p-2.5 bg-[#FAF6F0] font-semibold text-[#4A2E1B] border-b border-[#E8DEC9]">
                <span>Energy / Calories</span>
                <span>{product.nutrition?.calories || '347 kcal'}</span>
              </div>
              <div className="flex justify-between p-2.5 border-b border-[#E8DEC9]">
                <span>Plant Protein</span>
                <span className="font-semibold text-[#2D5A27]">{product.nutrition?.protein || '9.7g'}</span>
              </div>
              <div className="flex justify-between p-2.5 bg-[#FAF6F0] border-b border-[#E8DEC9]">
                <span>Carbohydrates</span>
                <span>{product.nutrition?.carbs || '76.9g'}</span>
              </div>
              <div className="flex justify-between p-2.5 border-b border-[#E8DEC9]">
                <span>Dietary Fiber</span>
                <span className="font-semibold text-[#D99B26]">{product.nutrition?.fiber || '14.5g'}</span>
              </div>
              <div className="flex justify-between p-2.5 bg-[#FAF6F0] border-b border-[#E8DEC9]">
                <span>Total Fat</span>
                <span>{product.nutrition?.fat || '0.1g'}</span>
              </div>
              <div className="flex justify-between p-2.5">
                <span>Calcium</span>
                <span>{product.nutrition?.calcium || '60mg'}</span>
              </div>
            </div>
          </div>

          {/* Benefits */}
          <div className="space-y-3">
            <h4 className="font-bold text-sm text-[#4A2E1B] uppercase tracking-wider">Key Benefits</h4>
            <ul className="space-y-2 text-xs text-[#6D4A32]">
              {product.benefits?.map((benefit, idx) => (
                <li key={idx} className="flex items-start space-x-2">
                  <div className="w-4 h-4 rounded-full bg-[#EAF3E7] text-[#2D5A27] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Sparkles className="w-2.5 h-2.5" />
                  </div>
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
            <div className="p-3 rounded-xl bg-[#FAF6F0] text-[11px] text-[#8A6D56] italic border border-[#E8DEC9]">
              *Can be part of a wholesome, balanced daily diet.
            </div>
          </div>

        </div>
      </div>

      {/* ==================================================
          Customer Reviews & Review Submission
          ================================================== */}
      <div className="bg-white rounded-3xl p-8 sm:p-10 border border-[#E8DEC9] shadow-soft space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#E8DEC9] pb-4">
          <div>
            <h3 className="font-serif text-2xl font-bold text-[#4A2E1B]">Customer Reviews</h3>
            <p className="text-xs text-[#8A6D56] mt-0.5">
              Average {product.rating} out of 5 stars based on {product.reviewsCount || 0} reviews
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Reviews List */}
          <div className="lg:col-span-7 space-y-4">
            {product.reviews && product.reviews.length > 0 ? (
              product.reviews.map((rev) => (
                <div key={rev.id || rev._id} className="p-4 rounded-2xl bg-[#FAF6F0] border border-[#E8DEC9] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-[#4A2E1B]">{rev.name}</span>
                    <span className="text-[10px] text-[#8A6D56]">
                      {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent'}
                    </span>
                  </div>
                  <div className="flex items-center text-[#D99B26]">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-3.5 h-3.5 ${i < rev.rating ? 'fill-current' : 'text-gray-300'}`} />
                    ))}
                  </div>
                  <p className="text-xs text-[#6D4A32] leading-relaxed">"{rev.comment}"</p>
                </div>
              ))
            ) : (
              <p className="text-xs text-[#8A6D56] italic">No reviews yet. Be the first to share your experience!</p>
            )}
          </div>

          {/* Add Review Form */}
          <div className="lg:col-span-5 bg-[#FAF6F0] p-6 rounded-2xl border border-[#E8DEC9] space-y-4">
            <h4 className="font-bold text-sm text-[#4A2E1B]">Write a Review</h4>
            <form onSubmit={handleReviewSubmit} className="space-y-3">
              <div>
                <label className="text-xs text-[#6D4A32] block mb-1">Your Name</label>
                <input
                  type="text"
                  value={reviewName}
                  onChange={(e) => setReviewName(e.target.value)}
                  placeholder="e.g. Priyanshu Sharma"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-[#E8DEC9] focus:outline-none focus:border-[#D99B26]"
                />
              </div>

              <div>
                <label className="text-xs text-[#6D4A32] block mb-1">Rating</label>
                <div className="flex items-center space-x-1.5">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setReviewRating(num)}
                      className="p-1 focus:outline-none"
                    >
                      <Star
                        className={`w-5 h-5 ${
                          num <= reviewRating ? 'fill-[#D99B26] text-[#D99B26]' : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-[#4A2E1B] ml-2">{reviewRating} Stars</span>
                </div>
              </div>

              <div>
                <label className="text-xs text-[#6D4A32] block mb-1">Review</label>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Share details about the crunch, aroma, and flavour..."
                  rows={3}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-[#E8DEC9] focus:outline-none focus:border-[#D99B26]"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={submittingReview}
                className="w-full py-2.5 rounded-xl bg-[#4A2E1B] text-[#FAF6F0] text-xs font-bold hover:bg-[#27170E] transition-colors"
              >
                {submittingReview ? 'Submitting...' : 'Post Review'}
              </button>
            </form>
          </div>

        </div>
      </div>

      {/* ==================================================
          "You May Also Like" Related Products
          ================================================== */}
      {related.length > 0 && (
        <div className="space-y-6">
          <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#4A2E1B]">
            You May Also Like
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {related.map((prod) => (
              <ProductCard key={prod._id} product={prod} />
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

export default ProductDetail;
