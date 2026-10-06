import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  CheckCircle2, 
  Heart, 
  Sun, 
  Leaf, 
  Award, 
  Flame, 
  UtensilsCrossed 
} from 'lucide-react';
import { motion } from 'framer-motion';
import { productAPI, recipeAPI } from '../services/api';
import ProductCard from '../components/ProductCard';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [featuredRecipes, setFeaturedRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, recRes] = await Promise.all([
          productAPI.getAll({ featured: 'true' }),
          recipeAPI.getAll()
        ]);

        if (prodRes.data.success) {
          setFeaturedProducts(prodRes.data.products.slice(0, 4));
        }
        if (recRes.data.success) {
          setFeaturedRecipes(recRes.data.recipes.slice(0, 3));
        }
      } catch (err) {
        console.error('Error fetching homepage data', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="space-y-20 pb-20">
      
      {/* ==================================================
          1. HERO SECTION
          ================================================== */}
      <section className="relative overflow-hidden bg-hero-gradient pt-8 pb-20 sm:pt-14 sm:pb-28 border-b border-[#E8DEC9]">
        {/* Subtle Decorative Background Rings */}
        <div className="absolute top-1/4 -right-24 w-96 h-96 rounded-full bg-[#D99B26]/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-20 w-80 h-80 rounded-full bg-[#2D5A27]/10 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left Content */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="lg:col-span-7 space-y-6 text-center lg:text-left"
            >
              {/* Pill Badge */}
              <div className="inline-flex items-center space-x-2 bg-[#FAF6F0] px-4 py-1.5 rounded-full border border-[#D99B26]/40 shadow-sm">
                <Sparkles className="w-4 h-4 text-[#D99B26]" />
                <span className="text-xs uppercase tracking-widest text-[#4A2E1B] font-bold">
                  Mithila Heritage • Family Owned Business
                </span>
              </div>

              {/* Main Headline */}
              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#4A2E1B] leading-[1.15]">
                Authentic Makhana from the Heart of Bihar
              </h1>

              {/* Subheading */}
              <p className="text-base sm:text-lg text-[#6D4A32] leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Naturally grown, carefully selected, and thoughtfully prepared for a healthier everyday snack.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-3">
                <Link
                  to="/shop"
                  className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-8 py-3.5 rounded-2xl bg-[#4A2E1B] hover:bg-[#27170E] text-[#FAF6F0] font-semibold text-base shadow-soft hover:shadow-lift transition-all"
                >
                  <span>Shop Makhana</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  to="/about"
                  className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-8 py-3.5 rounded-2xl bg-[#FAF6F0] hover:bg-[#F3ECE2] text-[#4A2E1B] border border-[#D99B26]/50 font-semibold text-base transition-colors"
                >
                  <span>Explore Our Story</span>
                </Link>
              </div>

              {/* Quick Trust Highlights */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-[#E8DEC9]/80 max-w-xl mx-auto lg:mx-0">
                <div className="text-center lg:text-left">
                  <span className="block font-serif text-2xl font-bold text-[#4A2E1B]">100%</span>
                  <span className="text-xs text-[#8A6D56]">Direct Bihar Harvest</span>
                </div>
                <div className="text-center lg:text-left">
                  <span className="block font-serif text-2xl font-bold text-[#4A2E1B]">Natural</span>
                  <span className="text-xs text-[#8A6D56]">Plant-Based Protein</span>
                </div>
                <div className="text-center lg:text-left">
                  <span className="block font-serif text-2xl font-bold text-[#4A2E1B]">Handpicked</span>
                  <span className="text-xs text-[#8A6D56]">Evenly Popped Kernels</span>
                </div>
              </div>
            </motion.div>

            {/* Right Visual Image Showcase using Uploaded Media */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="lg:col-span-5 relative"
            >
              <div className="relative mx-auto max-w-md lg:max-w-none">
                {/* Main Prominent Photo: Heritage seeds and popped bowl */}
                <div className="relative rounded-3xl overflow-hidden shadow-lift border-4 border-white aspect-[4/3] bg-white group">
                  <img
                    src="/images/heritage-seeds-burlap.png"
                    alt="Traditional raw makhana seeds and popped lotus seeds in wooden bowl"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 text-white text-xs">
                    <p className="font-serif font-bold text-sm">From Farm to Popped Perfection</p>
                    <p className="text-white/80 text-[11px]">Sourced directly from Mithila's natural aquatic ecosystems</p>
                  </div>
                </div>

                {/* Secondary Floating Card 1: Popped Plain Bowl */}
                <div className="absolute -bottom-8 -left-6 sm:-left-8 w-44 sm:w-52 rounded-2xl overflow-hidden shadow-card border-2 border-white bg-white p-2 animate-bounce-slow">
                  <div className="aspect-square rounded-xl overflow-hidden bg-[#FAF6F0]">
                    <img
                      src="/images/plain-makhana-bowl.png"
                      alt="Snow white popped makhana"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="pt-2 text-center">
                    <span className="text-[11px] font-bold text-[#4A2E1B] block">Crisp & Snow White</span>
                    <span className="text-[10px] text-[#2D5A27] font-semibold">Extra Large Kernels</span>
                  </div>
                </div>

                {/* Secondary Floating Card 2: Roasted Spiced Jar */}
                <div className="absolute -top-6 -right-4 sm:-right-6 w-40 sm:w-48 rounded-2xl overflow-hidden shadow-card border-2 border-white bg-white p-2 hidden sm:block">
                  <div className="aspect-square rounded-xl overflow-hidden bg-[#FAF6F0]">
                    <img
                      src="/images/roasted-makhana-jar.png"
                      alt="Roasted spiced makhana in glass jar"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="pt-1.5 text-center">
                    <span className="text-[11px] font-bold text-[#4A2E1B] block">Slow Ghee Roasted</span>
                    <span className="text-[10px] text-[#D99B26] font-bold">Teatime Favorite</span>
                  </div>
                </div>

              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ==================================================
          2. ABOUT / OUR STORY
          ================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl p-8 sm:p-12 lg:p-16 border border-[#E8DEC9] shadow-soft">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center space-x-2 text-xs font-bold uppercase tracking-widest text-[#D99B26]">
                <Leaf className="w-4 h-4 text-[#2D5A27]" />
                <span>Our Family Story</span>
              </div>

              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#4A2E1B] leading-tight">
                Mithila Makhana is a family business rooted in Bihar, bringing the authentic taste and quality of Bihar's makhana to customers.
              </h2>

              <div className="space-y-4 text-sm text-[#6D4A32] leading-relaxed">
                <p>
                  In the serene wetland districts of Mithila, makhana cultivation is more than agriculture — it is a time-honored tradition nurtured across generations. Our family founded Mithila Makhana with a straightforward promise: to bridge the gap between conscientious local growers and families seeking wholesome, unadulterated snacking.
                </p>
                <p>
                  Every batch starts with selective sorting at the source, ensuring only plump, wholesome kernels are harvested. We honor traditional sun-drying and gentle roasting methods while applying rigorous modern quality standards for hygiene, packaging, and crunch retention.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-[#FAF6F0] border border-[#E8DEC9]">
                  <h4 className="font-bold text-[#4A2E1B] text-sm">Ethical Sourcing</h4>
                  <p className="text-xs text-[#8A6D56] mt-1">Direct partnership with local agricultural harvesters in Bihar.</p>
                </div>
                <div className="p-4 rounded-2xl bg-[#FAF6F0] border border-[#E8DEC9]">
                  <h4 className="font-bold text-[#4A2E1B] text-sm">Small-Batch Freshness</h4>
                  <p className="text-xs text-[#8A6D56] mt-1">Carefully roasted and sealed to preserve maximum crispness.</p>
                </div>
              </div>

              <div>
                <Link
                  to="/about"
                  className="inline-flex items-center space-x-2 text-sm font-bold text-[#4A2E1B] hover:text-[#D99B26] transition-colors"
                >
                  <span>Read our complete story</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Right Images Composite */}
            <div className="lg:col-span-6 grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="rounded-2xl overflow-hidden shadow-sm border border-[#E8DEC9] aspect-square">
                  <img
                    src="/images/makhana-seeds-spoon.png"
                    alt="Fresh peeled lotus seeds on wooden spoon"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-4 rounded-2xl bg-[#FEF8EA] border border-[#D99B26]/30 text-center">
                  <span className="font-serif text-lg font-bold text-[#4A2E1B] block">Natural Harvest</span>
                  <span className="text-[11px] text-[#8A6D56]">Clean, unpolished lotus seeds</span>
                </div>
              </div>

              <div className="space-y-4 pt-6">
                <div className="p-4 rounded-2xl bg-[#EAF3E7] border border-[#2D5A27]/30 text-center">
                  <span className="font-serif text-lg font-bold text-[#2D5A27] block">Family Owned</span>
                  <span className="text-[11px] text-[#2D5A27]/80">From our home to yours</span>
                </div>
                <div className="rounded-2xl overflow-hidden shadow-sm border border-[#E8DEC9] aspect-square">
                  <img
                    src="/images/cheese-flavoured-dip.png"
                    alt="Seasoned makhana snack served with dip"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ==================================================
          3. FEATURED PRODUCTS SECTION
          ================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10">
          <div>
            <span className="text-xs uppercase tracking-widest text-[#D99B26] font-bold block mb-1">
              Popular Selections
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#4A2E1B]">
              Handcrafted Makhana Flavours
            </h2>
          </div>
          <Link
            to="/shop"
            className="mt-4 sm:mt-0 inline-flex items-center space-x-1.5 text-sm font-bold text-[#4A2E1B] hover:text-[#D99B26] transition-colors"
          >
            <span>View All Products</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="bg-white rounded-3xl p-4 h-80 animate-pulse border border-[#E8DEC9]" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* ==================================================
          4. WHY MITHILA MAKHANA (6 Feature Cards)
          ================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs uppercase tracking-widest text-[#D99B26] font-bold block mb-1">
            The Mithila Distinction
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#4A2E1B]">
            Why Mithila Makhana?
          </h2>
          <p className="text-sm text-[#6D4A32] mt-2">
            We hold ourselves to rigorous standards from harvesting in the waterlands to delivery at your table.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          
          <div className="p-6 rounded-3xl bg-white border border-[#E8DEC9] shadow-soft hover:shadow-card transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-[#FEF8EA] text-[#D99B26] flex items-center justify-center mb-4">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-xl font-bold text-[#4A2E1B]">Premium Quality</h3>
            <p className="text-xs text-[#6D4A32] leading-relaxed mt-2">
              Every kernel undergoes manual sizing and inspection to ensure uniform pop, tenderness, and absence of hard unpopped shells.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-[#E8DEC9] shadow-soft hover:shadow-card transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-[#EAF3E7] text-[#2D5A27] flex items-center justify-center mb-4">
              <Sun className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-xl font-bold text-[#4A2E1B]">Bihar's Authentic Makhana</h3>
            <p className="text-xs text-[#6D4A32] leading-relaxed mt-2">
              Deeply rooted in the waterland belt of Mithila, renowned globally for optimal micro-climates for fox nut cultivation.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-[#E8DEC9] shadow-soft hover:shadow-card transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-[#FAF6F0] text-[#4A2E1B] flex items-center justify-center mb-4">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-xl font-bold text-[#4A2E1B]">Carefully Selected</h3>
            <p className="text-xs text-[#6D4A32] leading-relaxed mt-2">
              Sourced from dedicated harvest pools and handpicked to guarantee clean, immaculate white lotus seeds without artificial bleaching.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-[#E8DEC9] shadow-soft hover:shadow-card transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-[#FEF8EA] text-[#D99B26] flex items-center justify-center mb-4">
              <Flame className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-xl font-bold text-[#4A2E1B]">Fresh & Crunchy</h3>
            <p className="text-xs text-[#6D4A32] leading-relaxed mt-2">
              Slow roasted in small batches and packed inside multi-layered barrier pouches to lock in oven-fresh crunchiness.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-[#E8DEC9] shadow-soft hover:shadow-card transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-[#EAF3E7] text-[#2D5A27] flex items-center justify-center mb-4">
              <Leaf className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-xl font-bold text-[#4A2E1B]">Healthy Snacking</h3>
            <p className="text-xs text-[#6D4A32] leading-relaxed mt-2">
              A light, satisfying, naturally gluten-free snack with plant-based protein and dietary fiber that can be part of a balanced diet.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-[#E8DEC9] shadow-soft hover:shadow-card transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-[#FAF6F0] text-[#4A2E1B] flex items-center justify-center mb-4">
              <Heart className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="font-serif text-xl font-bold text-[#4A2E1B]">Family-Owned Business</h3>
            <p className="text-xs text-[#6D4A32] leading-relaxed mt-2">
              We manage our brand with direct care and responsibility, upholding our family’s reputation for honesty, fairness, and warmth.
            </p>
          </div>

        </div>
      </section>

      {/* ==================================================
          5. MITHILA / BIHAR SECTION
          ================================================== */}
      <section className="bg-[#27170E] text-[#FAF6F0] py-20 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center space-x-2 text-xs font-bold uppercase tracking-widest text-[#F3BF58]">
                <Sparkles className="w-4 h-4" />
                <span>Agricultural Heritage</span>
              </div>

              <h2 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-[#FAF6F0] leading-tight">
                From the Waterlands of Bihar to Your Home
              </h2>

              <p className="text-sm text-[#D8C3A5] leading-relaxed">
                The northern plains of Bihar are blessed with perennial freshwater ponds and wetlands, where the prickly water lily (Euryale ferox) thrives naturally. For centuries, the skilled harvesters of Mithila have gathered these seeds from the pond beds in a labor of dedication.
              </p>

              <p className="text-sm text-[#D8C3A5] leading-relaxed">
                The seeds are sun-dried on clean bamboo mats, graded by size, and popped over open wood fires through traditional popping techniques. This delicate craftsmanship creates the soft, cloud-like makhana that has been celebrated in cultural ceremonies and everyday feasts throughout Bihar’s history.
              </p>

              <div className="pt-2 flex items-center space-x-6 text-xs text-[#D8C3A5]">
                <div>
                  <span className="font-bold text-[#F3BF58] text-base block font-serif">Pond Cultivated</span>
                  <span>Natural wetland ecosystem</span>
                </div>
                <div className="border-l border-[#5A3821] pl-6">
                  <span className="font-bold text-[#F3BF58] text-base block font-serif">Traditional Popping</span>
                  <span>Handcrafted technique</span>
                </div>
              </div>
            </div>

            {/* Right Large Image */}
            <div className="lg:col-span-6">
              <div className="rounded-3xl overflow-hidden border-2 border-[#5A3821] shadow-2xl relative aspect-[4/3]">
                <img
                  src="/images/heritage-seeds-burlap.png"
                  alt="Harvested lotus seeds and popped makhana in Mithila"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#27170E]/80 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-6 right-6">
                  <p className="font-serif text-lg font-bold text-white">The Mithila Tradition</p>
                  <p className="text-xs text-white/80">Dark raw seeds transformed into fluffy, nutritious puffs.</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ==================================================
          6. WHY MAKHANA (Educational Section)
          ================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs uppercase tracking-widest text-[#D99B26] font-bold block mb-1">
            Ancient Nutrition
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#4A2E1B]">
            Why Makhana?
          </h2>
          <p className="text-sm text-[#6D4A32] mt-2">
            An ancient lotus seed revered across India for purity, gentle crunch, and nutritional versatility.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <div className="p-6 rounded-3xl bg-white border border-[#E8DEC9] shadow-soft space-y-3">
            <span className="text-2xl font-serif font-bold text-[#D99B26]">01</span>
            <h4 className="font-serif text-lg font-bold text-[#4A2E1B]">What is Makhana?</h4>
            <p className="text-xs text-[#6D4A32] leading-relaxed">
              Makhana, also known as fox nuts or lotus seeds, is the popped edible seed of the aquatic plant Euryale ferox, cultivated primarily in freshwater wetlands.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-[#E8DEC9] shadow-soft space-y-3">
            <span className="text-2xl font-serif font-bold text-[#2D5A27]">02</span>
            <h4 className="font-serif text-lg font-bold text-[#4A2E1B]">Traditional Harvest</h4>
            <p className="text-xs text-[#6D4A32] leading-relaxed">
              Harvesters gather mature seeds from pond beds, clean them in running water, sun-dry them under natural sunlight, and gently pop them over controlled cast-iron pans.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-[#E8DEC9] shadow-soft space-y-3">
            <span className="text-2xl font-serif font-bold text-[#D99B26]">03</span>
            <h4 className="font-serif text-lg font-bold text-[#4A2E1B]">How it is Roasted</h4>
            <p className="text-xs text-[#6D4A32] leading-relaxed">
              When slow-roasted on low heat with a dash of pure cow ghee or cold-pressed oil, makhana develops an airy, shattering crispness without absorbing excess fats.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-[#E8DEC9] shadow-soft space-y-3">
            <span className="text-2xl font-serif font-bold text-[#2D5A27]">04</span>
            <h4 className="font-serif text-lg font-bold text-[#4A2E1B]">Everyday Meals</h4>
            <p className="text-xs text-[#6D4A32] leading-relaxed">
              Beyond snacking, makhana is a beloved ingredient in rich kheer (puddings), creamy curries, savory vegetable stir-fries, and festival fasting delicacies.
            </p>
          </div>

        </div>
      </section>

      {/* ==================================================
          7. HEALTH / NUTRITION SECTION
          ================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#FAF6F0] rounded-3xl p-8 sm:p-12 border border-[#E8DEC9] shadow-soft">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-5 space-y-4">
              <span className="text-xs uppercase tracking-widest text-[#2D5A27] font-bold block">
                Wholesome Facts
              </span>
              <h3 className="font-serif text-3xl font-bold text-[#4A2E1B]">
                Mindful Snacking for Every Day
              </h3>
              <p className="text-xs text-[#6D4A32] leading-relaxed">
                Makhana has stood the test of time because of its wholesome nutritional profile. When included as part of a balanced diet, it provides satisfying volume and crunch without the heaviness of deep-fried potato chips or artificial snacks.
              </p>
              <div className="p-4 rounded-2xl bg-white border border-[#E8DEC9] text-[11px] text-[#8A6D56] italic">
                *Makhana can be part of a balanced diet and healthy active lifestyle. We celebrate its natural attributes with honesty and care.
              </div>
            </div>

            <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-white border border-[#E8DEC9] text-center">
                <span className="font-serif text-2xl font-bold text-[#4A2E1B] block">9.7g</span>
                <span className="text-[11px] text-[#8A6D56]">Plant Protein (per 100g)</span>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-[#E8DEC9] text-center">
                <span className="font-serif text-2xl font-bold text-[#2D5A27] block">14.5g</span>
                <span className="text-[11px] text-[#8A6D56]">Dietary Fiber (per 100g)</span>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-[#E8DEC9] text-center">
                <span className="font-serif text-2xl font-bold text-[#D99B26] block">0.1g</span>
                <span className="text-[11px] text-[#8A6D56]">Naturally Low Fat</span>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-[#E8DEC9] text-center">
                <span className="font-serif text-2xl font-bold text-[#4A2E1B] block">Zero</span>
                <span className="text-[11px] text-[#8A6D56]">Trans Fats & Gluten</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ==================================================
          8. RECIPES TEASER
          ================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8">
          <div>
            <span className="text-xs uppercase tracking-widest text-[#D99B26] font-bold block mb-1">
              Culinary Inspiration
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#4A2E1B]">
              Delicious Makhana Recipes
            </h2>
          </div>
          <Link
            to="/recipes"
            className="mt-4 sm:mt-0 inline-flex items-center space-x-1.5 text-sm font-bold text-[#4A2E1B] hover:text-[#D99B26] transition-colors"
          >
            <span>Explore All Recipes</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredRecipes.map((recipe) => (
            <Link
              key={recipe._id}
              to="/recipes"
              className="group bg-white rounded-3xl overflow-hidden border border-[#E8DEC9] shadow-soft hover:shadow-card transition-all flex flex-col justify-between"
            >
              <div className="aspect-[16/10] overflow-hidden bg-[#FAF6F0]">
                <img
                  src={recipe.image || '/images/roasted-makhana-jar.png'}
                  alt={recipe.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-5 space-y-2">
                <div className="flex items-center justify-between text-xs text-[#8A6D56]">
                  <span className="font-medium">Prep: {recipe.prepTime}</span>
                  <span className="bg-[#FAF6F0] px-2 py-0.5 rounded text-[#2D5A27] font-bold">
                    {recipe.difficulty}
                  </span>
                </div>
                <h4 className="font-serif text-lg font-bold text-[#4A2E1B] group-hover:text-[#D99B26] transition-colors">
                  {recipe.title}
                </h4>
                <p className="text-xs text-[#6D4A32] line-clamp-2 leading-relaxed">
                  {recipe.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

    </div>
  );
};

export default Home;
