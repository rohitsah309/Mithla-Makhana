import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, ArrowRight, Heart, Sparkles, CheckCircle2 } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const { success, error } = useToast();

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      error('Please enter a valid email address.');
      return;
    }
    setSubscribed(true);
    success('Thank you for subscribing to Mithila Makhana updates!');
    setEmail('');
  };

  return (
    <footer className="bg-[#27170E] text-[#FAF6F0] pt-16 pb-12 border-t-4 border-[#D99B26]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-[#4A2E1B]">
          
          {/* Col 1 & 2: Brand & Heritage */}
          <div className="lg:col-span-2 space-y-4">
            <Link 
              to="/" 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="flex items-center space-x-3 group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-full bg-[#FAF6F0] p-1 border-2 border-[#D99B26] flex items-center justify-center group-hover:scale-105 transition-transform">
                <img 
                  src="/images/plain-makhana-bowl.png" 
                  alt="Mithila Makhana" 
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              <div>
                <span className="font-serif text-2xl font-bold tracking-tight text-[#FAF6F0] block group-hover:text-[#F3BF58] transition-colors">
                  Mithila Makhana
                </span>
                <span className="text-xs uppercase tracking-widest text-[#D99B26] font-semibold">
                  Authentic Makhana from Bihar
                </span>
              </div>
            </Link>

            <p className="text-sm text-[#D8C3A5] leading-relaxed max-w-sm">
              Rooted in the agricultural heritage of Bihar, we bring naturally grown, carefully selected, 
              and thoughtfully prepared lotus seeds from our family directly to your home.
            </p>

            <div className="space-y-2 pt-2 text-xs text-[#D8C3A5]">
              <div className="flex items-center space-x-2.5">
                <MapPin className="w-4 h-4 text-[#D99B26] flex-shrink-0" />
                <span>Mithila Makhana, Bihar, India</span>
              </div>
              <div className="flex items-center space-x-2.5">
                <Phone className="w-4 h-4 text-[#D99B26] flex-shrink-0" />
                <span>Customer Care: +91 98765 43210 (Mon-Sat, 9AM-6PM IST)</span>
              </div>
              <div className="flex items-center space-x-2.5">
                <Mail className="w-4 h-4 text-[#D99B26] flex-shrink-0" />
                <span>care@mithilamakhana.com</span>
              </div>
            </div>
          </div>

          {/* Col 3: Quick Links */}
          <div className="space-y-4">
            <h4 className="font-serif text-lg font-semibold text-[#FAF6F0] tracking-wide border-b border-[#4A2E1B] pb-2 inline-block">
              Quick Links
            </h4>
            <ul className="space-y-2.5 text-sm text-[#D8C3A5]">
              <li>
                <Link to="/" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-[#F3BF58] transition-colors">Home</Link>
              </li>
              <li>
                <Link to="/shop" className="hover:text-[#F3BF58] transition-colors">Shop All Flavours</Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-[#F3BF58] transition-colors">Our Story & Heritage</Link>
              </li>
              <li>
                <Link to="/why-makhana" className="hover:text-[#F3BF58] transition-colors">Why Makhana</Link>
              </li>
              <li>
                <Link to="/recipes" className="hover:text-[#F3BF58] transition-colors">Makhana Recipes</Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-[#F3BF58] transition-colors">Contact Us</Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Customer Support & Policies */}
          <div className="space-y-4">
            <h4 className="font-serif text-lg font-semibold text-[#FAF6F0] tracking-wide border-b border-[#4A2E1B] pb-2 inline-block">
              Customer Support
            </h4>
            <ul className="space-y-2.5 text-sm text-[#D8C3A5]">
              <li>
                <Link to="/track-order" className="hover:text-[#F3BF58] transition-colors">Track Your Order</Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-[#F3BF58] transition-colors">Shipping & Delivery</Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-[#F3BF58] transition-colors">Returns & Refunds</Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-[#F3BF58] transition-colors">Privacy Policy</Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-[#F3BF58] transition-colors">Terms & Conditions</Link>
              </li>
              <li className="pt-1.5 border-t border-[#3D2516]">
                <Link to="/admin/login" className="text-xs text-[#A68A75] hover:text-[#F3BF58] transition-colors flex items-center space-x-1">
                  <span>Staff & Admin Portal →</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 5: Newsletter */}
          <div className="space-y-4">
            <h4 className="font-serif text-lg font-semibold text-[#FAF6F0] tracking-wide border-b border-[#4A2E1B] pb-2 inline-block">
              Stay Connected
            </h4>
            <p className="text-xs text-[#D8C3A5] leading-relaxed">
              Subscribe for updates, healthy recipes, seasonal harvest news and special offers.
            </p>

            {subscribed ? (
              <div className="bg-[#1C3B18] p-3 rounded-xl flex items-center space-x-2 text-xs text-[#FAF6F0]">
                <CheckCircle2 className="w-4 h-4 text-[#F3BF58] flex-shrink-0" />
                <span>You're subscribed! Welcome to the family.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2">
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#3D2516] border border-[#5A3821] text-xs text-white placeholder-gray-400 focus:outline-none focus:border-[#D99B26]"
                    required
                  />
                  <button
                    type="submit"
                    className="absolute right-1.5 top-1.5 bottom-1.5 px-3 bg-[#D99B26] hover:bg-[#F3BF58] text-[#27170E] rounded-lg transition-colors flex items-center justify-center font-bold"
                    aria-label="Subscribe"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            )}

            {/* Social Media Placeholders */}
            <div className="pt-2">
              <span className="text-[11px] text-[#A68A75] block mb-2 uppercase tracking-wider font-semibold">Follow Our Journey</span>
              <div className="flex items-center space-x-3 text-sm text-[#D8C3A5]">
                <a href="#instagram" className="w-8 h-8 rounded-full bg-[#3D2516] hover:bg-[#D99B26] hover:text-[#27170E] flex items-center justify-center transition-colors">
                  <span className="font-bold text-xs">IG</span>
                </a>
                <a href="#facebook" className="w-8 h-8 rounded-full bg-[#3D2516] hover:bg-[#D99B26] hover:text-[#27170E] flex items-center justify-center transition-colors">
                  <span className="font-bold text-xs">FB</span>
                </a>
                <a href="#youtube" className="w-8 h-8 rounded-full bg-[#3D2516] hover:bg-[#D99B26] hover:text-[#27170E] flex items-center justify-center transition-colors">
                  <span className="font-bold text-xs">YT</span>
                </a>
                <a href="#twitter" className="w-8 h-8 rounded-full bg-[#3D2516] hover:bg-[#D99B26] hover:text-[#27170E] flex items-center justify-center transition-colors">
                  <span className="font-bold text-xs">X</span>
                </a>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#A68A75] space-y-4 sm:space-y-0">
          <p>© {new Date().getFullYear()} Mithila Makhana. All rights reserved. A family business rooted in Bihar.</p>
          <div className="flex items-center space-x-2 text-xs">
            <span>Crafted with</span>
            <Heart className="w-3.5 h-3.5 text-red-400 fill-current" />
            <span>for authentic Indian snacking</span>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
