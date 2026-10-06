import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Leaf, 
  Sparkles, 
  Flame, 
  Sun, 
  Check, 
  ShieldCheck, 
  Utensils, 
  ArrowRight, 
  CheckCircle2 
} from 'lucide-react';

const WhyMakhana = () => {
  return (
    <div className="space-y-16 pb-20">
      
      {/* Header */}
      <section className="bg-hero-gradient pt-12 pb-16 border-b border-[#E8DEC9]">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-4">
          <div className="inline-flex items-center space-x-2 bg-white px-4 py-1.5 rounded-full border border-[#D99B26]/30 shadow-sm">
            <Sparkles className="w-4 h-4 text-[#D99B26]" />
            <span className="text-xs uppercase tracking-widest text-[#4A2E1B] font-bold">
              The Superfood of Bihar
            </span>
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold text-[#4A2E1B]">
            Understanding Makhana
          </h1>
          <p className="text-base text-[#6D4A32] leading-relaxed max-w-2xl mx-auto">
            A comprehensive guide to fox nuts: their unique wetland cultivation, ancient Indian culinary tradition, and wholesome nutritional profile.
          </p>
        </div>
      </section>

      {/* 1. What is Makhana */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-6 space-y-5 text-sm text-[#6D4A32] leading-relaxed">
            <span className="text-xs uppercase tracking-widest text-[#D99B26] font-bold">
              Botanical Origin
            </span>
            <h2 className="font-serif text-3xl font-bold text-[#4A2E1B]">
              What is Makhana?
            </h2>
            <p>
              Makhana (also referred to as fox nuts, gorgon nuts, or popped lotus seeds) is the seed of the <span className="font-semibold text-[#4A2E1B]">Euryale ferox</span> plant, a flowering aquatic water lily that thrives in still, natural freshwater ponds and shallow wetland ecosystems across northern Bihar.
            </p>
            <p>
              Unlike tree nuts or groundnuts, makhana grows in water and is naturally free from common nut allergens. When mature, the seeds are harvested from the sediment of the pond bed and processed through a gentle heat popping technique that puffs the internal starchy kernel into an airy, cloud-like white orb.
            </p>
            <div className="p-4 rounded-2xl bg-white border border-[#E8DEC9] text-xs">
              <span className="font-bold text-[#4A2E1B] block mb-1">Key Characteristic:</span>
              Makhana naturally absorbs the flavors of the seasonings and broths it is paired with, making it uniquely versatile for savory, spicy, and sweet delicacies.
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="rounded-3xl overflow-hidden border border-[#E8DEC9] shadow-soft aspect-[4/3]">
              <img
                src="/images/plain-makhana-bowl.png"
                alt="White popped makhana in glass bowl"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

        </div>
      </section>

      {/* 2. Traditional Harvesting & Roasting Process */}
      <section className="bg-white py-16 border-y border-[#E8DEC9]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs uppercase tracking-widest text-[#2D5A27] font-bold">
              Field to Kernel
            </span>
            <h2 className="font-serif text-3xl font-bold text-[#4A2E1B]">
              How Makhana is Traditionally Sourced & Prepared
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            <div className="p-6 rounded-3xl bg-[#FAF6F0] border border-[#E8DEC9] space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-[#EAF3E7] text-[#2D5A27] flex items-center justify-center font-bold">
                1
              </div>
              <h3 className="font-serif text-xl font-bold text-[#4A2E1B]">Wetland Gathering</h3>
              <p className="text-xs text-[#6D4A32] leading-relaxed">
                Skilled harvesters enter the ponds during the late monsoon months to collect the black thorny seeds from the water floor using traditional bamboo sieve baskets.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-[#FAF6F0] border border-[#E8DEC9] space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-[#FEF8EA] text-[#D99B26] flex items-center justify-center font-bold">
                2
              </div>
              <h3 className="font-serif text-xl font-bold text-[#4A2E1B]">Sun-Curing & Grading</h3>
              <p className="text-xs text-[#6D4A32] leading-relaxed">
                The seeds are washed thoroughly in clean fresh water, spread out on clean mats under the sun to adjust moisture content, and graded through sieves into uniform sizes.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-[#FAF6F0] border border-[#E8DEC9] space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-[#FAF6F0] text-[#4A2E1B] flex items-center justify-center font-bold border border-[#E8DEC9]">
                3
              </div>
              <h3 className="font-serif text-xl font-bold text-[#4A2E1B]">Artisanal Popping</h3>
              <p className="text-xs text-[#6D4A32] leading-relaxed">
                Heated in cast-iron pans over earthen stoves, each seed is struck with a wooden mallet. The hard black shell bursts open with an audible pop, revealing the tender white kernel.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* 3. Nutrition & Comparison */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#FAF6F0] rounded-3xl p-8 sm:p-12 border border-[#E8DEC9] shadow-soft space-y-8">
          
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs uppercase tracking-widest text-[#2D5A27] font-bold">
              Nutritional Perspective
            </span>
            <h3 className="font-serif text-3xl font-bold text-[#4A2E1B]">
              A Wholesome Choice for Everyday Snacking
            </h3>
            <p className="text-xs text-[#6D4A32]">
              Fox nuts can be part of a balanced diet when prepared mindfully with minimal oils and natural herbs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="bg-white p-6 rounded-2xl border border-[#E8DEC9] space-y-3">
              <h4 className="font-bold text-sm text-[#4A2E1B]">Plant-Based Protein</h4>
              <p className="text-xs text-[#6D4A32] leading-relaxed">
                Contains approximately 9.7g of plant-derived protein per 100g, making it a valuable snack for vegetarians and fitness-conscious eaters.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-[#E8DEC9] space-y-3">
              <h4 className="font-bold text-sm text-[#4A2E1B]">Dietary Fiber</h4>
              <p className="text-xs text-[#6D4A32] leading-relaxed">
                Rich in natural dietary fiber (approx 14.5g per 100g) which supports healthy digestion and provides long-lasting satiety.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-[#E8DEC9] space-y-3">
              <h4 className="font-bold text-sm text-[#4A2E1B]">Naturally Low in Sodium</h4>
              <p className="text-xs text-[#6D4A32] leading-relaxed">
                Raw makhana is inherently low in sodium and contains virtually zero saturated fat, making it a mindful alternative to fried potato chips.
              </p>
            </div>

          </div>

          <p className="text-[11px] text-[#8A6D56] text-center italic">
            *Note: Makhana is a nutritious natural food that can be part of a balanced lifestyle. We do not claim makhana cures, treats, or prevents medical conditions.
          </p>

        </div>
      </section>

      {/* 4. Ways to Enjoy Makhana */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between">
          <div>
            <span className="text-xs uppercase tracking-widest text-[#D99B26] font-bold block mb-1">
              Culinary Uses
            </span>
            <h2 className="font-serif text-3xl font-bold text-[#4A2E1B]">
              Ways to Include Makhana in Everyday Meals
            </h2>
          </div>
          <Link
            to="/recipes"
            className="mt-3 sm:mt-0 text-xs font-bold text-[#4A2E1B] hover:text-[#D99B26] flex items-center space-x-1"
          >
            <span>See step-by-step recipes</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-5 rounded-3xl bg-white border border-[#E8DEC9] shadow-soft space-y-2">
            <span className="font-serif font-bold text-lg text-[#4A2E1B] block">1. 5-Min Ghee Roast</span>
            <p className="text-xs text-[#6D4A32] leading-relaxed">
              Tossed in a warm skillet with a spoonful of cow ghee, pink salt, and freshly cracked black pepper.
            </p>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-[#E8DEC9] shadow-soft space-y-2">
            <span className="font-serif font-bold text-lg text-[#4A2E1B] block">2. Royal Kheer (Pudding)</span>
            <p className="text-xs text-[#6D4A32] leading-relaxed">
              Slow-simmered in milk with saffron, cardamom, and jaggery for an exquisite traditional dessert.
            </p>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-[#E8DEC9] shadow-soft space-y-2">
            <span className="font-serif font-bold text-lg text-[#4A2E1B] block">3. Street-Style Chaat</span>
            <p className="text-xs text-[#6D4A32] leading-relaxed">
              Mixed with chopped onions, tomatoes, coriander, green chutney, and a squeeze of fresh lemon.
            </p>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-[#E8DEC9] shadow-soft space-y-2">
            <span className="font-serif font-bold text-lg text-[#4A2E1B] block">4. Sweet Jaggery Glaze</span>
            <p className="text-xs text-[#6D4A32] leading-relaxed">
              Coated in bubbling natural jaggery syrup and sesame seeds for a brittle candy-like crunch.
            </p>
          </div>
        </div>
      </section>

    </div>
  );
};

export default WhyMakhana;
