import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Search, ChevronRight, Star, Heart, CheckCircle, Ship, ShieldCheck, Globe, User, MapPin } from 'lucide-react';
import RFQForm from './RFQForm';
import WhatsAppButton from './WhatsAppButton';
import { useLanguage, useTranslation } from '../contexts/LanguageContext';
import '../App.css';
import Translate from './Translate';

const heroSlides = [
  {
    id: 1,
    title: "Revolutionizing Global Trade",
    subtitle: "Connecting businesses across continents with trusted partnerships",
    image: "product11.jpg",
    cta: "Explore Opportunities",
  },
  {
    id: 2,
    title: "Verified Suppliers Worldwide",
    subtitle: "Work with pre-verified partners for secure transactions",
    image: "product22.jpg",
    cta: "Find Suppliers",
  },
  {
    id: 3,
    title: "End-to-End Trade Solutions",
    subtitle: "From RFQ to delivery, we've got you covered",
    image: "product33.jpg",
    cta: "Learn More",
  },
];

const categories = [
  { id: 1, name: 'Land, house flat plot category', icon: '🏠' },
  { id: 2, name: 'Industrial Plants, Machinery & Equipment', icon: '🏭' },
  { id: 3, name: 'Consumer Electronics & Household Appliances', icon: '📺' },
  { id: 4, name: 'Industrial & Engineering Products, Spares and Supplies', icon: '🔩' },
  { id: 5, name: 'Building Construction Material & Equipment', icon: '🏗️' },
  { id: 6, name: 'Apparel, Clothing & Garments', icon: '👕' },
  { id: 7, name: 'Vegetables, Fruits, Grains, Dairy Products & FMCG', icon: '🍎' },
  { id: 8, name: 'Medical, Pharma, Surgical & Healthcare', icon: '⚕️' },
  { id: 9, name: 'Packaging Material, Supplies & Machines', icon: '📦' },
  { id: 10, name: 'Chemicals, Dyes & Allied Products', icon: '⚗️' },
  { id: 11, name: 'Kitchen Containers, Utensils & Cookware', icon: '🍳' },
  { id: 12, name: 'Textiles, Yarn, Fabrics & Allied Industries', icon: '🧵' },
  { id: 13, name: 'Books, Notebooks, Stationery & Publications', icon: '📚' },
  { id: 14, name: 'Cosmetics, Toiletries & Personal Care Products', icon: '🧴' },
  { id: 15, name: 'Home Furnishings and Home Textiles', icon: '🛋️' },
  { id: 16, name: 'Gems, Jewellery & Precious Stones', icon: '💎' },
  { id: 17, name: 'Computers, Software, IT Support & Solutions', icon: '💻' },
  { id: 18, name: 'Fashion & Garment Accessories', icon: '👠' },
  { id: 19, name: 'Ayurvedic & Herbal Products', icon: '🌿' },
  { id: 20, name: 'Security Devices, Safety Systems & Services', icon: '🛡️' },
  { id: 21, name: 'Sports Goods, Games, Toys & Accessories', icon: '🏀' },
  { id: 22, name: 'Telecom Products, Equipment & Supplies', icon: '📡' },
  { id: 23, name: 'Stationery and Paper Products', icon: '文' },
  { id: 24, name: 'Bags, Handbags, Luggage & Accessories', icon: '👜' },
  { id: 25, name: 'Stones, Marble & Granite Supplies', icon: '🪨' },
  { id: 26, name: 'Railway, Shipping & Aviation Products', icon: '🚆' },
  { id: 27, name: 'Leather and Leather Products & Accessories', icon: '👢' },
  { id: 28, name: 'Electronics Components and Supplies', icon: '💡' },
  { id: 29, name: 'Electrical Equipment and Supplies', icon: '⚡' },
  { id: 30, name: 'Pharmaceutical Drugs & Medicines', icon: '💊' },
  { id: 31, name: 'Mechanical Components & Parts', icon: '⚙️' },
  { id: 32, name: 'Scientific, Measuring & Laboratory Instruments', icon: '🔬' },
  { id: 33, name: 'Furniture, Furniture Supplies & Hardware', icon: '🪑' },
  { id: 34, name: 'Fertilizers, Seeds, Plants & Animal Husbandry', icon: '🌱' },
  { id: 35, name: 'Automobiles, Spare Parts and Accessories', icon: '🚗' },
  { id: 36, name: 'Housewares, Home Appliances & Decorations', icon: '🏠' },
  { id: 37, name: 'Metals, Minerals, Ores & Alloys', icon: '🪙' },
  { id: 38, name: 'Tools, Machine Tools & Power Tools', icon: '🛠️' },
  { id: 39, name: 'Gifts, Crafts, Antiques & Handmade Decoratives', icon: '🎁' },
  { id: 40, name: 'Bicycles, Rickshaws, Spares and Accessories', icon: '🚲' }
];

const countries = ["Global", "India", "UAE", "China", "USA", "Germany", "UK", "Singapore"];

// Languages for port-centric countries
const languages = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'ar', name: 'العربية', flag: '🇦🇪' }
];

const ShopPage = () => {
  const { currentUser, userRole } = useAuth();
  const { selectedLanguage, setSelectedLanguage } = useLanguage();
  const { t } = useTranslation();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedPort, setSelectedPort] = useState('All Ports');
  const [sortBy, setSortBy] = useState('featured');
  const [currentPage, setCurrentPage] = useState(1);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categoriesList, setCategoriesList] = useState(['All Categories']);
  const [ports, setPorts] = useState(['All Ports']);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedCountry, setSelectedCountry] = useState("Global");
  const [countryOpen, setCountryOpen] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);
  // State for category slider
  const [sliderPosition, setSliderPosition] = useState(0);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const sliderRef = useRef(null);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  // State for RFQ modal
  const [showRFQModal, setShowRFQModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Check for pending RFQ from login
  useEffect(() => {
    if (location.state?.showRFQ && currentUser && userRole === 'buyer') {
      // Find the product by ID
      const productId = location.state.productId;
      const product = products.find(p => p.id === parseInt(productId));
      if (product) {
        // Navigate to RFQ page with product data
        navigate(`/rfq/${productId}`, { state: { product } });
        // Clear the location state
        navigate(location.pathname, { replace: true, state: {} });
      }
    }
  }, [location, currentUser, userRole, products, navigate]);

  // Keep your Supabase fetch logic unchanged
  useEffect(() => {
    const fetchProductsAndFilters = async () => {
      try {
        setLoading(true);
        console.log('Fetching products from /api/products...');
        
        // Fetch products
        const productsResponse = await fetch('/api/products');
        console.log('Products response status:', productsResponse.status);
        const productsData = await productsResponse.json();
        console.log('Products data:', productsData);
        
        if (productsResponse.ok) {
          console.log('Setting products:', productsData);
          setProducts(productsData);
          
          // Extract unique categories and ports for filter dropdowns
          const uniqueCategories = ['All Categories', ...new Set(productsData.map(product => product.category_name).filter(Boolean))];
          // Since ports are not directly related to products in the schema, we'll use a default list
          const uniquePorts = ['All Ports', 'Mumbai Port', 'Chennai Port', 'JNPT', 'Vishakhapatnam Port', 'Kolkata Port'];
          
          setCategoriesList(uniqueCategories);
          setPorts(uniquePorts);
        } else {
          console.error('Failed to fetch products:', productsData.error || 'Unknown error');
          setError(productsData.error || 'Failed to fetch products');
        }
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to fetch products');
      } finally {
        setLoading(false);
      }
    };

    fetchProductsAndFilters();
  }, []);

  // Check for category parameter in URL
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    if (categoryParam) {
      const decodedCategory = decodeURIComponent(categoryParam);
      setSelectedCategory(decodedCategory);
      // Update the category dropdown to reflect the selected category
      const categorySelect = document.querySelector('select[name="category"]');
      if (categorySelect) {
        categorySelect.value = decodedCategory;
      }
    }
  }, [searchParams]);

  // hero auto-rotate
  useEffect(() => {
    const id = setInterval(() => {
      setCurrentSlide((s) => (s === heroSlides.length - 1 ? 0 : s + 1));
    }, 5500);
    return () => clearInterval(id);
  }, []);

  // Handle category slider navigation
  const slideLeft = () => {
    if (sliderRef.current) {
      const scrollAmount = sliderRef.current.offsetWidth * 0.8;
      sliderRef.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      setTimeout(() => {
        if (sliderRef.current) {
          updateArrowVisibility(sliderRef.current.scrollLeft - scrollAmount);
        }
      }, 300);
    }
  };

  const slideRight = () => {
    if (sliderRef.current) {
      const scrollAmount = sliderRef.current.offsetWidth * 0.8;
      sliderRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      setTimeout(() => {
        if (sliderRef.current) {
          updateArrowVisibility(sliderRef.current.scrollLeft + scrollAmount);
        }
      }, 300);
    }
  };

  const updateArrowVisibility = (position) => {
    if (sliderRef.current) {
      const maxScroll = sliderRef.current.scrollWidth - sliderRef.current.offsetWidth;
      setShowLeftArrow(position > 0);
      setShowRightArrow(position < maxScroll - 10);
    }
  };

  // Update arrow visibility when component mounts and on resize
  useEffect(() => {
    const handleResize = () => {
      if (sliderRef.current) {
        updateArrowVisibility(sliderRef.current.scrollLeft);
      }
    };

    window.addEventListener('resize', handleResize);
    // Initial check
    setTimeout(() => {
      if (sliderRef.current) {
        updateArrowVisibility(sliderRef.current.scrollLeft);
      }
    }, 100);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Check arrow visibility when categories load
  useEffect(() => {
    setTimeout(() => {
      if (sliderRef.current) {
        updateArrowVisibility(sliderRef.current.scrollLeft);
      }
    }, 100);
  }, [categories]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if click is outside both dropdowns
      if (countryOpen || languageOpen) {
        // Don't close if clicking on the dropdown buttons or their content
        const countryButton = document.querySelector('.country-selector-button');
        const languageButton = document.querySelector('.language-selector-button');
        const countryDropdown = document.querySelector('.country-dropdown');
        const languageDropdown = document.querySelector('.language-dropdown');
        
        const isClickOnCountry = countryButton?.contains(event.target) || countryDropdown?.contains(event.target);
        const isClickOnLanguage = languageButton?.contains(event.target) || languageDropdown?.contains(event.target);
        
        if (!isClickOnCountry && !isClickOnLanguage) {
          setCountryOpen(false);
          setLanguageOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [countryOpen, languageOpen]);

  // Filter products based on search, category, and port
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.short_description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All Categories' || product.category_name === selectedCategory;
    // Since ports are not directly related to products in the schema, we'll skip port filtering for now
    const matchesPort = selectedPort === 'All Ports';
    return matchesSearch && matchesCategory && matchesPort;
  });

  // Pagination
  const productsPerPage = 8;
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const startIndex = (currentPage - 1) * productsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, startIndex + productsPerPage);

  const handleRFQ = (product) => {
    console.log('handleRFQ called with product:', product);
    // Check if user is logged in
    if (!currentUser) {
      console.log('User not logged in, storing RFQ data');
      // Store the product info in localStorage for redirection after login
      const rfqData = {
        productId: product.id,
        productName: product.name,
        timestamp: Date.now()
      };
      console.log('Storing pending RFQ in localStorage:', rfqData);
      localStorage.setItem('pendingRFQ', JSON.stringify(rfqData));
      // Redirect to login
      navigate('/login');
      return;
    }
    
    // Check if user is a buyer
    if (userRole !== 'buyer') {
      alert('Only buyers can request quotations');
      return;
    }
    
    // Show RFQ form in modal with product data
    console.log('Showing RFQ form modal with product data');
    setSelectedProduct(product);
    setShowRFQModal(true);
  };

  // small helper for theme colors in inline style
  const bhagwa = "#f77f00";
  const cream = "#f6efe6";
  const creamCard = "#efe6d9";
  const darkText = "#5a4632";

  return (
    <div className="min-h-screen" style={{ backgroundColor: cream, color: darkText }}>
      {/* global small style additions (keyframes) */}
      <style>{`
        .glass {
          background: linear-gradient(180deg, rgba(255,255,255,0.6), rgba(255,255,255,0.35));
          backdrop-filter: blur(6px);
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}
      </style>

      {/* Top thin bar */}
      <div className="w-full text-center py-1" style={{ backgroundColor: "#f4e7d8", color: darkText }}>
        <small><Translate text="portCentricB2B" /></small>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 shadow-sm" style={{ backgroundColor: cream }}>
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div
              className="cursor-pointer flex items-center gap-2"
              onClick={() => navigate("/")}
            >
              <img 
                src="/logo.png" 
                alt="MarsaFyi Logo" 
                style={{ width: 130, height: 60, borderRadius: 0, border: 'none' }}
                className="flex items-center justify-center text-white font-bold text-lg"
              />
            </div>

            {/* visible on desktop */}
            <nav className="hidden lg:flex items-center gap-6 ml-4 text-sm font-medium" style={{ color: "#6b503d" }}>
              <button onClick={() => navigate("/")} className="hover:text-[#8b5f3b]"><Translate text="home" /></button>
              <button onClick={() => navigate("/shop")} className="font-semibold" style={{ color: bhagwa }}><Translate text="shop" /></button>
              <button onClick={() => navigate("/about")} className="hover:text-[#8b5f3b]"><Translate text="about" /></button>
              <button onClick={() => navigate("/contact")} className="hover:text-[#8b5f3b]"><Translate text="contact" /></button>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative hidden md:block">
              <input
                placeholder={t('searchPlaceholder')}
                className="pl-4 pr-10 py-2 rounded-full border border-transparent focus:outline-none focus:ring-2"
                style={{ backgroundColor: "#fff", color: darkText }}
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8b5f3b]" />
            </div>

            <button
              onClick={() => navigate("/register")}
              className="px-4 py-2 rounded-full font-semibold"
              style={{ backgroundColor: bhagwa, color: "#fff" }}
            >
              <Translate text="joinLogin" />

            </button>

            <User className="h-6 w-6 text-[#6b503d]" />
          </div>
        </div>
      </header>

      {/* Country selector */}
      <div className="w-full border-t border-b" style={{ borderColor: "#eadfce" }}>
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="relative">
              <button
                onClick={() => setCountryOpen(!countryOpen)}
                className="country-selector-button flex items-center gap-2 px-3 py-2 rounded-md font-semibold"
                style={{ backgroundColor: creamCard, color: darkText }}
              >
                <MapPin className="h-4 w-4" />
                <span>{selectedCountry}</span>
                <svg className="w-3 h-3 ml-1 text-[#6b503d]" viewBox="0 0 24 24" fill="none">
                  <path d="M6 9l6 6 6-6" stroke="#6b503d" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>

              {countryOpen && (
                <div className="country-dropdown absolute mt-2 left-0 w-44 rounded-md shadow-lg glass overflow-hidden z-40">
                  {countries.map((c) => (
                    <button
                      key={c}
                      onClick={() => { setSelectedCountry(c); setCountryOpen(false); }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-[#fff2e6] ${selectedCountry === c ? "font-semibold" : ""}`}
                      style={{ color: darkText }}
                    >
                      {c === "Global" ? "🌍 Global" : c}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Language selector */}
            <div className="relative">
              <button
                onClick={() => setLanguageOpen(!languageOpen)}
                className="language-selector-button flex items-center gap-2 px-3 py-2 rounded-md font-semibold"
                style={{ backgroundColor: creamCard, color: darkText }}
              >
                <Globe className="h-4 w-4" />
                <span>{languages.find(lang => lang.code === selectedLanguage)?.flag} {languages.find(lang => lang.code === selectedLanguage)?.name}</span>
                <svg className="w-3 h-3 ml-1 text-[#6b503d]" viewBox="0 0 24 24" fill="none">
                  <path d="M6 9l6 6 6-6" stroke="#6b503d" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>

              {languageOpen && (
                <div className="language-dropdown absolute mt-2 left-0 w-44 rounded-md shadow-lg glass overflow-hidden z-40">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => { setSelectedLanguage(lang.code); setLanguageOpen(false); }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-[#fff2e6] ${selectedLanguage === lang.code ? "font-semibold" : ""}`}
                      style={{ color: darkText }}
                    >
                      <span className="mr-2">{lang.flag}</span> {lang.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="text-sm" style={{ color: "#7a614a" }}>
            <Translate text="serving" /> <span className="font-semibold">{selectedCountry}</span> • <Translate text="portCentricLogistics" />
          </div>
        </div>
      </div>

      {/* Hero */}
      <section className="relative h-[560px] container mx-auto px-4 mt-8">
        <div
          className="absolute inset-0 rounded-2xl overflow-hidden"
          style={{
            backgroundImage: `url(${heroSlides[currentSlide].image})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "brightness(0.6) saturate(0.9)",
          }}
        />
        <div className="relative z-10 rounded-2xl p-8 md:p-16 flex flex-col md:flex-row items-center justify-between gap-8"
             style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(0,0,0,0.06))" }}>
          <div className="max-w-2xl text-white animate-float">
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight" style={{ textShadow: "0 6px 20px rgba(0,0,0,0.5)" }}>
              {heroSlides[currentSlide].title}
            </h1>
            <p className="mt-4 text-lg md:text-xl text-white/90">{heroSlides[currentSlide].subtitle}</p>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => navigate("/shop")}
                className="px-6 py-3 rounded-full font-bold"
                style={{ backgroundColor: bhagwa, color: "#fff" }}
              >
                {heroSlides[currentSlide].cta}
              </button>
              <button
                onClick={() => navigate("/contact")}
                className="px-6 py-3 rounded-full font-semibold"
                style={{ backgroundColor: "rgba(255,255,255,0.9)", color: darkText }}
              >
                <Translate text="contactSales" />
              </button>
            </div>
          </div>

          {/* quick search card */}
          <div className="w-full md:w-96 p-4 rounded-xl shadow-md" style={{ backgroundColor: creamCard }}>
            <div className="text-sm font-semibold mb-2" style={{ color: darkText }}><Translate text="quickRfqSearch" /></div>
            <div className="flex gap-2">
              <input className="flex-1 px-3 py-2 rounded-md border border-transparent focus:outline-none" placeholder={t('searchProductsSuppliers')} />
              <button className="px-3 rounded-md" style={{ backgroundColor: bhagwa, color: "#fff" }}>
                <Search />
              </button>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
              <button className="px-3 py-2 rounded-md text-left" style={{ backgroundColor: "#fff" }}>
                <div className="font-semibold" style={{ color: darkText }}>Port Integration</div>
                <div className="text-xs text-[#8b6a4f]">Live ETA & berth data</div>
              </button>
              <button className="px-3 py-2 rounded-md text-left" style={{ backgroundColor: "#fff" }}>
                <div className="font-semibold" style={{ color: darkText }}>Supplier Verification</div>
                <div className="text-xs text-[#8b6a4f]">KYC & audits</div>
              </button>
              <button className="px-3 py-2 rounded-md text-left" style={{ backgroundColor: "#fff" }}>
                <div className="font-semibold" style={{ color: darkText }}>Customs Support</div>
                <div className="text-xs text-[#8b6a4f]">Paperwork & clearance</div>
              </button>
              <button className="px-3 py-2 rounded-md text-left" style={{ backgroundColor: "#fff" }}>
                <div className="font-semibold" style={{ color: darkText }}>Secure Payments</div>
                <div className="text-xs text-[#8b6a4f]">Escrow & trade assurance</div>
              </button>
            </div>
          </div>
        </div>

        {/* hero pagination dots */}
        <div className="relative z-20 flex justify-center gap-2 mt-4">
          {heroSlides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`w-8 h-2 rounded-full transition-all ${idx === currentSlide ? "scale-110" : "opacity-60"}`}
              style={{ backgroundColor: idx === currentSlide ? bhagwa : "#fff" }}
            />
          ))}
        </div>
      </section>

      {/* Categories */}
      {/* Removed the homepage categories section to avoid duplication */}

      {/* Creative Category Slider */}
      <section className="container mx-auto px-4 mt-12 relative">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4" style={{ color: darkText }}><Translate text="shopByCategory" /></h2>
          <p className="text-[#7a614a] max-w-2xl mx-auto"><Translate text="discoverCategories" /></p>
        </div>
        
        {/* Slider Controls */}
        <div className="relative pt-12 pb-6" style={{ minHeight: '200px' }}>
          {/* Left Arrow */}
          {showLeftArrow && (
            <button 
              onClick={slideLeft}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-[#f0e6d9] transition-colors md:block hidden"
              style={{ color: darkText, marginLeft: '-10px' }}
            >
              <ChevronRight className="h-6 w-6 rotate-180" />
            </button>
          )}
          
          {/* Category Slider */}
          <div 
            ref={sliderRef}
            className="flex overflow-x-auto scrollbar-hide py-4 px-2 md:px-4"
            onScroll={(e) => updateArrowVisibility(e.target.scrollLeft)}
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            <div className="flex space-x-4 md:space-x-6" style={{ minWidth: 'max-content', minHeight: '140px' }}>
              {categories.map((category) => (
                <div 
                  key={category.id}
                  className="flex-shrink-0 w-40 md:w-48 bg-white rounded-2xl p-4 md:p-6 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer text-center relative group"
                  onClick={() => {
                    setSelectedCategory(category.name);
                    // Update URL with category parameter
                    setSearchParams({ category: encodeURIComponent(category.name) });
                    // Scroll to filter section
                    setTimeout(() => {
                      const filterSection = document.getElementById('filters-section');
                      if (filterSection) {
                        filterSection.scrollIntoView({ behavior: 'smooth' });
                      }
                    }, 100);
                  }}
                >
                  <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-[#f0e6d9] flex items-center justify-center mx-auto mb-3 md:mb-4 text-xl md:text-2xl">
                    {category.icon}
                  </div>
                  <h3 className="font-bold text-xs md:text-sm mb-2 line-clamp-3" style={{ color: darkText }}>{category.name}</h3>
                  {/* Tooltip for full category name on hover - positioned on top of the button at the bottom */}
                  <div className="absolute left-2 right-2 bottom-2 px-2 py-1 bg-black bg-opacity-90 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                    <div className="text-center text-xs">
                      {category.name}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Right Arrow */}
          {showRightArrow && (
            <button 
              onClick={slideRight}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-[#f0e6d9] transition-colors md:block hidden"
              style={{ color: darkText, marginRight: '-10px' }}
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          )}
        </div>
        
        {/* Mobile Scroll Indicator */}
        <div className="text-center mt-4 md:hidden">
          <p className="text-[#7a614a] text-sm"><Translate text="swipeBrowseCategories" /></p>
        </div>
        
        {/* View All Categories Button */}
        <div className="text-center mt-8">
          <button 
            className="px-6 py-3 rounded-full font-semibold flex items-center gap-2 mx-auto"
            style={{ backgroundColor: creamCard, color: darkText }}
            onClick={() => navigate('/categories')}
          >
            <Translate text="viewAllCategories" />
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </section>

      {/* Filters and Search */}
      <section className="py-12" style={{ backgroundColor: cream }}>
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto" id="filters-section">
            {/* Search Bar */}
            <div className="mb-10">
              <div className="relative max-w-3xl mx-auto">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder={t('searchProducts')}
                  className="w-full pl-10 pr-4 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ backgroundColor: "#fff", color: darkText }}
                />
                <button className="absolute inset-y-0 right-0 px-6 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 transition-colors">
                  <Translate text="search" />
                </button>
              </div>
            </div>
            
            {/* Filters */}
            <div className="flex flex-wrap gap-4 justify-center mb-12">
              <div className="relative">
                <select
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    // Update URL parameter
                    if (e.target.value === 'All Categories') {
                      setSearchParams({});
                    } else {
                      setSearchParams({ category: encodeURIComponent(e.target.value) });
                    }
                  }}
                  className="appearance-none border border-gray-300 rounded-lg py-3 px-4 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                  name="category"
                  style={{ backgroundColor: "#fff", color: darkText }}
                >
                  {categoriesList.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <ChevronRight className="h-4 w-4 rotate-90" />
                </div>
              </div>
              
              <div className="relative">
                <select
                  value={selectedPort}
                  onChange={(e) => setSelectedPort(e.target.value)}
                  className="appearance-none border border-gray-300 rounded-lg py-3 px-4 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                  style={{ backgroundColor: "#fff", color: darkText }}
                >
                  {ports.map(port => (
                    <option key={port} value={port}>{port}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <ChevronRight className="h-4 w-4 rotate-90" />
                </div>
              </div>
              
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none border border-gray-300 rounded-lg py-3 px-4 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                  style={{ backgroundColor: "#fff", color: darkText }}
                >
                  <option value="featured"><Translate text="featured" /></option>
                  <option value="price-low"><Translate text="priceLowHigh" /></option>
                  <option value="price-high"><Translate text="priceHighLow" /></option>
                  <option value="rating"><Translate text="topRated" /></option>
                  <option value="newest"><Translate text="newestFirst" /></option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <ChevronRight className="h-4 w-4 rotate-90" />
                </div>
              </div>
            </div>
            
            {/* Results Info */}
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold" style={{ color: darkText }}><Translate text="featuredProducts" /></h2>
              <p className="mt-2" style={{ color: "#7a614a" }}>{filteredProducts.length} <Translate text="productsFound" /></p>
            </div>
            
            {/* Loading and Error States */}
            {loading && <div className="text-center py-10" style={{ color: darkText }}><Translate text="loadingProducts" /></div>}
            {error && <div className="text-center py-10 text-red-500"><Translate text="errorLoadingProducts" />: {error}</div>}
            
            {/* Products Grid */}
            {!loading && !error && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {currentProducts.map(product => (
                  <div 
                    key={product.id} 
                    className="rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
                    onClick={() => navigate(`/product/${product.id}`)}
                    style={{ backgroundColor: "#fff" }}
                  >
                    <div className="relative">
                      <img src="/placeholder.jpg" alt={product.name} className="w-full h-56 object-cover" />
                      {product.is_verified && (
                        <div className="absolute top-4 left-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm flex items-center">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Verified
                        </div>
                      )}
                      <button 
                        className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Heart className="h-5 w-5 text-gray-600" />
                      </button>
                    </div>
                  
                    <div className="p-6">
                      <h3 className="text-xl font-bold mb-2" style={{ color: darkText }}>{product.name}</h3>
                      <p className="text-sm mb-1" style={{ color: "#7a614a" }}><Translate text="vendor" />: {product.company_name || 'Unknown Vendor'}</p>
                      <p className="text-sm mb-4" style={{ color: "#7a614a" }}><Translate text="port" />: {product.origin_port_name || <Translate text="notSpecified" />}</p>
                    
                      <p className="mb-4 text-sm" style={{ color: darkText }}>{product.short_description || product.description}</p>
                    
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                className={`h-5 w-5 ${
                                  i < 4 // In a real app, this would come from the product rating
                                    ? 'text-yellow-400 fill-current' 
                                    : 'text-gray-300'
                                }`} 
                              />
                            ))}
                          </div>
                          <span className="ml-2 text-sm" style={{ color: "#7a614a" }}>4.5</span> {/* In a real app, this would come from the product rating */}
                        </div>
                        <span className="text-sm" style={{ color: "#7a614a" }}>👍 0</span> {/* In a real app, this would come from the product likes */}
                      </div>
                    
                      <div className="mt-auto">
                        <button 
                          className="w-full px-4 py-2 rounded-lg transition-colors font-medium"
                          onClick={() => handleRFQ(product)}
                          style={{ backgroundColor: bhagwa, color: "#fff" }}
                        >
                          <Translate text="requestQuotation" />
                        </button>
                      </div>

                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Pagination */}
            {totalPages > 1 && !loading && !error && (
              <div className="flex justify-center items-center gap-4 mt-16">
                <button 
                  className="px-4 py-2 rounded-lg border transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  style={{ 
                    backgroundColor: "#fff", 
                    color: darkText,
                    borderColor: "#d9cfc1"
                  }}
                >
                  <Translate text="previous" />
                </button>
                
                <div className="flex gap-2">
                  {[...Array(totalPages)].map((_, index) => {
                    const page = index + 1;
                    return (
                      <button
                        key={page}
                        className={`w-10 h-10 rounded-full`}
                        onClick={() => setCurrentPage(page)}
                        style={{ 
                          backgroundColor: currentPage === page ? bhagwa : "#fff",
                          color: currentPage === page ? "#fff" : darkText,
                          border: currentPage === page ? "none" : "1px solid #d9cfc1"
                        }}
                      >
                        {page}
                      </button>
                    );
                  })}
                </div>
                
                <button 
                  className="px-4 py-2 rounded-lg border transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  style={{ 
                    backgroundColor: "#fff", 
                    color: darkText,
                    borderColor: "#d9cfc1"
                  }}
                >
                  <Translate text="next" />
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16" style={{ backgroundColor: cream }}>
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6" style={{ color: darkText }}><Translate text="readyToScale" /></h2>
          <p className="text-xl mb-10 max-w-2xl mx-auto" style={{ color: "#7a614a" }}>
            <Translate text="readyToScaleText" />
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button 
              className="px-8 py-3 rounded-lg transition-colors font-medium"
              onClick={() => navigate('/register')}
              style={{ backgroundColor: "#fff", color: bhagwa, border: `1px solid ${creamCard}` }}
            >
              <Translate text="registerAsBuyer" />
            </button>
            <button 
              className="px-8 py-3 rounded-lg transition-colors font-medium"
              onClick={() => navigate('/contact')}
              style={{ backgroundColor: bhagwa, color: "#fff", border: `2px solid ${bhagwa}` }}
            >
              <Translate text="contactSales" />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-8" style={{ backgroundColor: "#2b2017", color: "#f8efe3" }}>
        <div className="container mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-5 gap-8">
          <div className="md:col-span-1 flex flex-col items-center md:items-start">
            <img 
              src="/logo2.png" 
              alt="MarsaFyi Logo" 
              style={{ width: 170, height: 100, borderRadius: 0, border: 'none' }}
              className="mb-3"
            />
            <p className="text-sm text-[#e6d8c6] max-w-sm mb-4 text-center md:text-left"><Translate text="portCentricB2B" /></p>

            <div className="flex gap-3">
              {/* Instagram */}
              <a href="https://www.instagram.com/marsagroupbusiness?utm_source=qr&igsh=MWcxNWcwZTQzYnJ0" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="p-2 rounded-md hover:bg-[#3f2b1f]" title="Instagram">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5z" stroke="#f6efe6" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="12" cy="12" r="3.2" stroke="#f6efe6" strokeWidth="1.2"/><circle cx="17.5" cy="6.5" r="0.6" fill="#f6efe6"/></svg>
              </a>

              {/* Facebook */}
              <a href="https://www.facebook.com/share/1CjsjNy4AF/" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="p-2 rounded-md hover:bg-[#3f2b1f]" title="Facebook">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M18 2h-3a4 4 0 0 0-4 4v3H8v4h3v8h4v-8h3l1-4h-4V6a1 1 0 0 1 1-1h3V2z" stroke="#f6efe6" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </a>

              {/* X (Twitter) */}
              <a href="https://x.com/MarsaGroup?t=lcCaLBHxnJiOjeAqzQzTlQ&s=09" target="_blank" rel="noopener noreferrer" aria-label="X" className="p-2 rounded-md hover:bg-[#3f2b1f]" title="X">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53A4.48 4.48 0 0 0 16.5 3c-2.72 0-4.92 2.3-4.92 5.13 0 .4.05.8.13 1.18A13 13 0 0 1 2 4.5s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5V5c0-.7.5-1.5 1-2z" stroke="#f6efe6" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </a>

              {/* YouTube */}
              <a href="https://youtube.com/marsafyi" target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="p-2 rounded-md hover:bg-[#3f2b1f]" title="YouTube">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M22.5 6.2s-.2-1.6-.8-2.3c-.7-.9-1.4-.9-1.8-1C16.6 2.5 12 2.5 12 2.5h0s-4.6 0-7.9.4c-.4.1-1.1.1-1.8 1-.6.7-.8 2.3-.8 2.3S1 8 1 9.8v1.4C1 13 1.2 14.7 1.2 14.7s.2 1.6.8 2.3c.7.9 1.6.9 2 1 1.5.2 6.3.4 6.3.4s4.6 0 7.9-.4c.4-.1 1.1-.1 1.8-1 .6-.7.8-2.3.8-2.3S23 8 23 6.2z" stroke="#f6efe6" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/><path d="M10 14.5V8.5l5 3-5 3z" fill="#f6efe6"/></svg>
              </a>
            </div>
          </div>

          <div className="flex flex-col">
            <div className="font-semibold mb-3 text-lg"><Translate text="forBuyers" /></div>
            <ul className="text-sm text-[#e6d8c6] space-y-2">
              <li><button onClick={() => navigate("/login")} className="hover:text-white"><Translate text="submitRfq" /></button></li>
              <li><button onClick={() => navigate("/shop")} className="hover:text-white"><Translate text="searchSuppliers" /></button></li>
              <li><button onClick={() => navigate("/about")} className="hover:text-white"><Translate text="tradeAssurance" /></button></li>
              <li><button onClick={() => navigate("/contact")} className="hover:text-white"><Translate text="paymentOptions" /></button></li>
            </ul>
          </div>

          <div className="flex flex-col">
            <div className="font-semibold mb-3 text-lg"><Translate text="forSuppliers" /></div>
            <ul className="text-sm text-[#e6d8c6] space-y-2">
              <li><button onClick={() => navigate("/login")} className="hover:text-white"><Translate text="displayProducts" /></button></li>
              <li><button onClick={() => navigate("/register")} className="hover:text-white"><Translate text="supplierMembership" /></button></li>
              <li><button onClick={() => navigate("/about")} className="hover:text-white"><Translate text="learningCenter" /></button></li>
              <li><button onClick={() => navigate("/about")} className="hover:text-white"><Translate text="successStories" /></button></li>
            </ul>
          </div>

          <div className="flex flex-col">
            <div className="font-semibold mb-3 text-lg"><Translate text="company" /></div>
            <ul className="text-sm text-[#e6d8c6] space-y-2">
              <li><button onClick={() => navigate("/about")} className="hover:text-white"><Translate text="aboutUs" /></button></li>
              <li><button onClick={() => navigate("/contact")} className="hover:text-white"><Translate text="contactUs" /></button></li>
              <li><button onClick={() => navigate("/about")} className="hover:text-white"><Translate text="careers" /></button></li>
              <li><button onClick={() => navigate("/about")} className="hover:text-white"><Translate text="press" /></button></li>
            </ul>
          </div>

          <div className="flex flex-col">
            <div className="font-semibold mb-3 text-lg"><Translate text="support" /></div>
            <ul className="text-sm text-[#e6d8c6] space-y-2">
              <li><button onClick={() => navigate("/contact")} className="hover:text-white"><Translate text="helpCenter" /></button></li>
              <li><button onClick={() => navigate("/contact")} className="hover:text-white"><Translate text="submitRequest" /></button></li>
              <li><button onClick={() => navigate("/about")} className="hover:text-white"><Translate text="termsOfService" /></button></li>
              <li><button onClick={() => navigate("/about")} className="hover:text-white"><Translate text="privacyPolicy" /></button></li>
            </ul>
          </div>
        </div>

        <div className="border-t" style={{ borderColor: "#3a2b20" }}>
          <div className="container mx-auto px-4 py-4 text-center text-sm text-[#e6d8c6]">
            <Translate text="copyrightText" year={new Date().getFullYear()} />
          </div>
        </div>
      </footer>
      <WhatsAppButton />
    </div>
  );
};

export default ShopPage;