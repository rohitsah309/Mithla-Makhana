import React from 'react';
import { Link } from 'react-router-dom';
import { Leaf, Heart, ShieldCheck, Sun, CheckCircle2, ArrowRight, Sparkles } from 'lucide-react';

const About = () => {
  return (
    <div className="space-y-16 pb-20">
      
      {/* Hero Banner */}
      <section className="bg-hero-gradient pt-12 pb-16 border-b border-[#E8DEC9]">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-4">
          <div className="inline-flex items-center space-x-2 bg-white px-4 py-1.5 rounded-full border border-[#D99B26]/30 shadow-sm">
            <Sparkles className="w-4 h-4 text-[#D99B26]" />
            <span className="text-xs uppercase tracking-widest text-[#4A2E1B] font-bold">
              Our Heritage & Values
            </span>
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold text-[#4A2E1B] leading-tight">
            Rooted in Bihar. Sourced with Integrity.
          </h1>
          <p className="text-base text-[#6D4A32] leading-relaxed">
            Mithila Makhana is a family business rooted in Bihar, bringing the authentic taste and quality of Bihar's makhana to customers.
          </p>
        </div>
      </section>

      {/* Main Story Narrative */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-7 space-y-6 text-sm text-[#6D4A32] leading-relaxed">
            <h2 className="font-serif text-3xl font-bold text-[#4A2E1B] leading-snug">
              A Family Dedication to Authentic Agricultural Quality
            </h2>

            <p>
              Growing up in Bihar, makhana was never just an occasional packaged snack — it was an intrinsic part of our family heritage. Whether lightly tossed in a hot skillet with homemade ghee for grandparents' evening tea, or gently simmered with cardamom and nuts during festive pujas, lotus seeds were always celebrated for their wholesome purity.
            </p>

            <p>
              Over time, as makhana gained popularity across India and beyond, we noticed that commercial channels often compromised on kernel grading, mixed in unpopped hard seeds, or loaded the nuts with synthetic artificial flavor powders.
            </p>

            <p>
              We established <span className="font-bold text-[#4A2E1B]">Mithila Makhana</span> with a clear family mission: to offer pure, hand-graded, naturally grown fox nuts directly from local harvesters in Bihar. We ensure respectful farm-level partnerships, hygienic batch grading, and clean roasting without unnecessary chemical additives.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
              <div className="p-5 rounded-2xl bg-white border border-[#E8DEC9] shadow-soft">
                <div className="w-8 h-8 rounded-xl bg-[#FEF8EA] text-[#D99B26] flex items-center justify-center font-bold mb-2">
                  <Sun className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-[#4A2E1B] text-sm">Natural Sun-Drying</h4>
                <p className="text-xs text-[#8A6D56] mt-1">Seeds are naturally dried under open sunlight before gentle hand-popping.</p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-[#E8DEC9] shadow-soft">
                <div className="w-8 h-8 rounded-xl bg-[#EAF3E7] text-[#2D5A27] flex items-center justify-center font-bold mb-2">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-[#4A2E1B] text-sm">Modern Quality Standards</h4>
                <p className="text-xs text-[#8A6D56] mt-1">Multi-stage manual screening to discard hard outer husks and uneven sizes.</p>
              </div>
            </div>
          </div>

          {/* Right Image */}
          <div className="lg:col-span-5 space-y-4">
            <div className="rounded-3xl overflow-hidden shadow-lift border border-[#E8DEC9] aspect-square">
              <img
                src="/images/heritage-seeds-burlap.png"
                alt="Traditional raw makhana and popped kernels"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-4 rounded-2xl bg-white border border-[#E8DEC9] text-center">
              <p className="font-serif font-bold text-[#4A2E1B] text-base">Direct From The Wetlands</p>
              <p className="text-xs text-[#8A6D56]">Sustainably cultivated in freshwater pond ecosystems</p>
            </div>
          </div>

        </div>
      </section>

      {/* Our Guiding Principles */}
      <section className="bg-white py-16 border-y border-[#E8DEC9]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs uppercase tracking-widest text-[#D99B26] font-bold">
              Our Family Values
            </span>
            <h2 className="font-serif text-3xl font-bold text-[#4A2E1B]">
              How We Do Business
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-3xl bg-[#FAF6F0] border border-[#E8DEC9] space-y-3">
              <span className="font-serif text-3xl font-bold text-[#D99B26]">01</span>
              <h3 className="font-serif text-xl font-bold text-[#4A2E1B]">Authentic Roots</h3>
              <p className="text-xs text-[#6D4A32] leading-relaxed">
                We celebrate the agricultural heritage of Bihar without embellishment or false claims. Our connection with the land and the people is real and personal.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-[#FAF6F0] border border-[#E8DEC9] space-y-3">
              <span className="font-serif text-3xl font-bold text-[#2D5A27]">02</span>
              <h3 className="font-serif text-xl font-bold text-[#4A2E1B]">Careful Processing</h3>
              <p className="text-xs text-[#6D4A32] leading-relaxed">
                Every kernel is inspected for size, crispness, and color. We roast in modest small batches so the aroma of fresh desi ghee and authentic spices never fades.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-[#FAF6F0] border border-[#E8DEC9] space-y-3">
              <span className="font-serif text-3xl font-bold text-[#4A2E1B]">03</span>
              <h3 className="font-serif text-xl font-bold text-[#4A2E1B]">Customer Trust</h3>
              <p className="text-xs text-[#6D4A32] leading-relaxed">
                As a family-owned venture, our customer relationships mean everything to us. When you order from us, we treat your family with the same care as our own.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Sourcing Photography Feature */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-hero-gradient rounded-3xl p-8 sm:p-12 border border-[#E8DEC9] grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-5 rounded-2xl overflow-hidden border border-[#E8DEC9] shadow-soft aspect-[4/3]">
            <img
              src="/images/makhana-seeds-spoon.png"
              alt="Harvested raw lotus seeds on spoon"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="lg:col-span-7 space-y-4">
            <span className="text-xs uppercase tracking-widest text-[#2D5A27] font-bold">
              Pure Natural Harvest
            </span>
            <h3 className="font-serif text-3xl font-bold text-[#4A2E1B]">
              From Raw Harvest to Popped Goodness
            </h3>
            <p className="text-xs sm:text-sm text-[#6D4A32] leading-relaxed">
              Before it becomes the airy white crunch you know, makhana begins as a dark seed gathered from the quiet waters of Mithila. The seeds are dried, sorted by size, gently heated, and popped under precise timing. It is a slow, patient craft that cannot be automated without losing soul.
            </p>
            <div className="pt-2">
              <Link
                to="/shop"
                className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-[#4A2E1B] text-[#FAF6F0] text-xs font-bold hover:bg-[#27170E] transition-colors"
              >
                <span>Taste Our Harvest</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default About;
