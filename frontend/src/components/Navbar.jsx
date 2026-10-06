import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { 
  ShoppingBag, 
  Heart, 
  User, 
  Search, 
  Menu, 
  X, 
  ChevronDown, 
  ShieldCheck, 
  Package, 
  LogOut, 
  Sparkles 
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';

const Navbar = ({ onOpenSearch }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  
  const { cartCount, freeShippingThreshold } = useCart();
  const { wishlistCount } = useWishlist();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  }, [location.pathname]);

  // Scroll detection for sticky effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Shop', path: '/shop' },
    { name: 'About Us', path: '/about' },
    { name: 'Why Makhana', path: '/why-makhana' },
    { name: 'Recipes', path: '/recipes' },
    { name: 'Contact', path: '/contact' },
  ];

  /**
   * Handle navigation click:
   * - If the user is ALREADY on this page (e.g. on Home '/' and clicks Home or Logo):
   *   smoothly scroll up to the very top.
   * - If navigating to another page (e.g. Home to Shop or About to Home):
   *   immediately scroll to top of that new page.
   */
  const handleNavClick = (e, targetPath) => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);

    if (location.pathname === targetPath) {
      e.preventDefault();
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth'
      });
    } else {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'instant'
      });
    }
  };

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-all duration-300 ${
        isScrolled
          ? 'bg-[#FAF6F0]/95 backdrop-blur-md shadow-sm border-b border-[#E8DEC9]'
          : 'bg-[#FAF6F0] border-b border-[#E8DEC9]/60'
      }`}
    >
      {/* Top Heritage Notice Bar */}
      <div className="bg-[#27170E] text-[#FAF6F0] text-xs py-1.5 px-4 text-center tracking-wide font-medium flex items-center justify-center space-x-2">
        <Sparkles className="w-3.5 h-3.5 text-[#F3BF58]" />
        <span>Authentic Bihar Fox Nuts • Naturally Harvested in Mithila • Free Delivery on orders over ₹{freeShippingThreshold}</span>
        <Sparkles className="w-3.5 h-3.5 text-[#F3BF58]" />
      </div>

      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Logo */}
          <Link 
            to="/" 
            onClick={(e) => handleNavClick(e, '/')}
            className="flex items-center space-x-3 group"
          >
            <div className="w-10 h-10 rounded-full bg-[#FAF6F0] border-2 border-[#D99B26] p-1 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
              <img 
                src="/images/plain-makhana-bowl.png" 
                alt="Mithila Makhana Motif" 
                className="object-cover w-full h-full rounded-full"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#4A2E1B] leading-none group-hover:text-[#D99B26] transition-colors">
                Mithila Makhana
              </span>
              <span className="text-[10px] uppercase tracking-[0.25em] text-[#8A6D56] font-semibold mt-1">
                Heritage of Bihar
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="items-center hidden space-x-8 md:flex">
            {navLinks.map((link) => (
              <NavLink
                key={link.name}
                to={link.path}
                onClick={(e) => handleNavClick(e, link.path)}
                className={({ isActive }) =>
                  `text-sm font-medium tracking-wide transition-colors py-1 border-b-2 ${
                    isActive
                      ? 'text-[#4A2E1B] border-[#D99B26] font-semibold'
                      : 'text-[#6D4A32] border-transparent hover:text-[#4A2E1B] hover:border-[#D99B26]/50'
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}
          </nav>

          {/* Right Action Icons */}
          <div className="flex items-center space-x-4 sm:space-x-5">
            {/* Search Trigger */}
            <button
              onClick={onOpenSearch}
              className="text-[#4A2E1B] hover:text-[#D99B26] p-1.5 rounded-full hover:bg-[#F3ECE2] transition-colors"
              aria-label="Search products"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Wishlist Icon */}
            <Link
              to="/wishlist"
              onClick={(e) => handleNavClick(e, '/wishlist')}
              className="relative text-[#4A2E1B] hover:text-[#D99B26] p-1.5 rounded-full hover:bg-[#F3ECE2] transition-colors"
              aria-label="View Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#D99B26] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart Icon */}
            <Link
              to="/cart"
              onClick={(e) => handleNavClick(e, '/cart')}
              className="relative text-[#4A2E1B] hover:text-[#D99B26] p-1.5 rounded-full hover:bg-[#F3ECE2] transition-colors"
              aria-label="View Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#2D5A27] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* User Account / Auth Dropdown */}
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center space-x-1.5 text-[#4A2E1B] hover:text-[#D99B26] p-1.5 rounded-full hover:bg-[#F3ECE2] transition-colors"
                aria-label="User Account Menu"
              >
                <div className="w-7 h-7 rounded-full bg-[#E8DEC9] flex items-center justify-center text-[#4A2E1B] font-semibold text-xs border border-[#D99B26]/40">
                  {isAuthenticated ? user.name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
                </div>
                <ChevronDown className="w-3.5 h-3.5 hidden sm:block text-[#8A6D56]" />
              </button>

              {/* Dropdown Menu */}
              {userDropdownOpen && (
                <div 
                  className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-lift border border-[#E8DEC9] py-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                  onMouseLeave={() => setUserDropdownOpen(false)}
                >
                  {isAuthenticated ? (
                    <>
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-xs text-[#8A6D56]">Signed in as</p>
                        <p className="text-sm font-semibold text-[#4A2E1B] truncate">{user.name}</p>
                        <span className="inline-block mt-0.5 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#FEF8EA] text-[#B07812]">
                          {user.role === 'admin' ? 'Administrator' : 'Valued Customer'}
                        </span>
                      </div>

                      <Link
                        to="/profile"
                        className="flex items-center px-4 py-2 text-sm text-[#4A2E1B] hover:bg-[#FAF6F0] hover:text-[#D99B26]"
                        onClick={(e) => handleNavClick(e, '/profile')}
                      >
                        <User className="w-4 h-4 mr-2.5 text-[#8A6D56]" />
                        My Profile & Addresses
                      </Link>

                      <Link
                        to="/track-order"
                        className="flex items-center px-4 py-2 text-sm text-[#4A2E1B] hover:bg-[#FAF6F0] hover:text-[#D99B26]"
                        onClick={(e) => handleNavClick(e, '/track-order')}
                      >
                        <Package className="w-4 h-4 mr-2.5 text-[#8A6D56]" />
                        Track Orders
                      </Link>

                      {isAdmin && (
                        <Link
                          to="/admin"
                          className="flex items-center px-4 py-2 text-sm text-[#2D5A27] font-semibold bg-[#EAF3E7]/50 hover:bg-[#EAF3E7]"
                          onClick={(e) => handleNavClick(e, '/admin')}
                        >
                          <ShieldCheck className="w-4 h-4 mr-2.5 text-[#2D5A27]" />
                          Admin Dashboard
                        </Link>
                      )}

                      <div className="mt-1 border-t border-gray-100">
                        <button
                          onClick={() => {
                            logout();
                            setUserDropdownOpen(false);
                            navigate('/login', { replace: true });
                          }}
                          className="flex items-center w-full px-4 py-2 text-sm text-left text-red-600 cursor-pointer hover:bg-red-50"
                        >
                          <LogOut className="w-4 h-4 mr-2.5 text-red-500" />
                          Sign Out
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="px-4 py-2 text-xs text-[#8A6D56] border-b border-gray-100">
                        Welcome to Mithila Makhana
                      </div>
                      <Link
                        to="/login"
                        className="flex items-center px-4 py-2 text-sm font-medium text-[#4A2E1B] hover:bg-[#FAF6F0] hover:text-[#D99B26]"
                        onClick={(e) => handleNavClick(e, '/login')}
                      >
                        <User className="w-4 h-4 mr-2.5 text-[#8A6D56]" />
                        <span>Sign In</span>
                      </Link>
                      <Link
                        to="/register"
                        className="flex items-center px-4 py-2 text-sm font-medium text-[#4A2E1B] hover:bg-[#FAF6F0] hover:text-[#D99B26]"
                        onClick={(e) => handleNavClick(e, '/register')}
                      >
                        Create Account
                      </Link>
                      <Link
                        to="/admin/login"
                        className="flex items-center px-4 py-2 text-xs font-semibold text-[#8A6D56] hover:bg-[#FEF8EA] hover:text-[#B07812]"
                        onClick={(e) => handleNavClick(e, '/admin/login')}
                      >
                        <ShieldCheck className="w-3.5 h-3.5 mr-2 text-[#D99B26]" />
                        <span>Staff / Admin Portal</span>
                      </Link>
                      <div className="mt-1 border-t border-gray-100">
                        <Link
                          to="/track-order"
                          className="flex items-center px-4 py-2 text-xs text-[#8A6D56] hover:bg-[#FAF6F0]"
                          onClick={(e) => handleNavClick(e, '/track-order')}
                        >
                          <Package className="w-3.5 h-3.5 mr-2" />
                          Track Order with ID
                        </Link>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-[#4A2E1B] p-1.5 rounded-lg hover:bg-[#F3ECE2]"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#FAF6F0] border-b border-[#E8DEC9] px-4 pt-2 pb-6 space-y-3 shadow-lg">
          <div className="flex flex-col space-y-2">
            {navLinks.map((link) => (
              <NavLink
                key={link.name}
                to={link.path}
                onClick={(e) => handleNavClick(e, link.path)}
                className={({ isActive }) =>
                  `px-3 py-2.5 rounded-xl text-base font-medium transition-colors ${
                    isActive
                      ? 'bg-[#E8DEC9] text-[#4A2E1B] font-semibold'
                      : 'text-[#6D4A32] hover:bg-[#F3ECE2] hover:text-[#4A2E1B]'
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}
          </div>

          <div className="pt-3 border-t border-[#E8DEC9] flex flex-col space-y-2">
            <Link
              to="/track-order"
              onClick={(e) => handleNavClick(e, '/track-order')}
              className="flex items-center px-3 py-2 text-sm text-[#4A2E1B] font-medium hover:bg-[#F3ECE2] rounded-xl"
            >
              <Package className="w-4 h-4 mr-2.5 text-[#D99B26]" />
              Track Any Order
            </Link>

            {isAdmin && (
              <Link
                to="/admin"
                onClick={(e) => handleNavClick(e, '/admin')}
                className="flex items-center px-3 py-2 text-sm text-[#2D5A27] font-semibold bg-[#EAF3E7] rounded-xl"
              >
                <ShieldCheck className="w-4 h-4 mr-2.5" />
                Admin Dashboard
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
