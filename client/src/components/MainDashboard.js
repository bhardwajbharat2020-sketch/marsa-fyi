import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// Icons from a popular library like 'lucide-react'. To install: npm install lucide-react
import { Search, ChevronRight, Star, Heart, CheckCircle, Ship, ShieldCheck, Globe, User } from 'lucide-react';

// Hero slides remain as mock data since they're for display purposes
const heroSlides = [
  {
    id: 1,
    title: "Revolutionizing Global Trade",
    subtitle: "Connecting businesses across continents with trusted partnerships",
    image: "/placeholder-hero.jpg",
    cta: "Explore Opportunities"
  },
  {
    id: 2,
    title: "Verified Suppliers Worldwide",
    subtitle: "Work with pre-verified partners for secure transactions",
    image: "/placeholder-hero2.jpg",
    cta: "Find Suppliers"
  },
  {
    id: 3,
    title: "End-to-End Trade Solutions",
    subtitle: "From RFQ to delivery, we've got you covered",
    image: "/placeholder-hero3.jpg",
    cta: "Learn More"
  }
];

// Categories remain as mock data since they're for display purposes
const categories = [
  { id: 1, name: "Electronics", icon: "🔌", count: "12,450+" },
  { id: 2, name: "Machinery", icon: "⚙️", count: "8,760+" },
  { id: 3, name: "Textiles", icon: "🧵", count: "15,230+" },
  { id: 4, name: "Chemicals", icon: "⚗️", count: "6,890+" },
  { id: 5, name: "Food & Beverages", icon: "🍎", count: "9,420+" },
  { id: 6, name: "Automotive", icon: "🚗", count: "7,560+" },
  { id: 7, name: "Construction", icon: "🏗️", count: "5,320+" },
  { id: 8, name: "Healthcare", icon: "⚕️", count: "4,890+" }
];

const MainDashboard = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [catalogs, setCatalogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Fetch real catalogs from Supabase
  useEffect(() => {
    const fetchCatalogs = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/catalogs');
        const data = await response.json();
        
        if (response.ok) {
          setCatalogs(data);
        } else {
          setError(data.error || 'Failed to fetch catalogs');
        }
      } catch (err) {
        setError('Failed to fetch catalogs');
        console.error('Error fetching catalogs:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCatalogs();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev === heroSlides.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(interval);
  }, [heroSlides.length]);

  const handleRFQ = (catalogId) => {
    navigate('/login');
  };

  return (
    <div className="bg-gray-50 text-gray-800">
      
      {/* ======================= NEW HEADER START ======================= */}
      {/* This is the new header you requested, inspired by the screenshot */}

      {/* Top Announcement Bar */}
      <div className="bg-gray-100 text-sm text-center text-gray-600 py-2 px-4">
        <p>Free shipping on orders $100+</p>
      </div>

      {/* Main Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800 cursor-pointer" onClick={() => navigate('/')}>MARSA FYI</h1>
          
          <nav className="hidden lg:flex items-center space-x-8">
            <a href="#" onClick={(e) => {e.preventDefault(); navigate('/');}} className="font-semibold text-orange-600">Home</a>
            <a href="#" onClick={(e) => {e.preventDefault(); navigate('/about');}} className="text-gray-600 hover:text-orange-600 font-medium">About</a>
            <a href="#" onClick={(e) => {e.preventDefault(); navigate('/shop');}} className="text-gray-600 hover:text-orange-600 font-medium">Shop</a>
            <a href="#" onClick={(e) => {e.preventDefault(); navigate('/contact');}} className="text-gray-600 hover:text-orange-600 font-medium">Contact</a>
          </nav>

          <div className="flex items-center space-x-4">
            <div className="relative hidden md:block">
              <input type="text" placeholder="Search for..." className="pl-4 pr-10 py-2 border rounded-md w-48 focus:ring-2 focus:ring-orange-500 transition"/>
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
            <button onClick={() => navigate('/register')} className="px-5 py-2 bg-orange-500 text-white font-semibold rounded-md hover:bg-orange-600 transition-colors">Register/Login</button>
            <User className="text-gray-700 h-6 w-6 cursor-pointer lg:hidden" /> {/* Hamburger icon for mobile */}
          </div>
        </div>
      </header>
      {/* ======================== NEW HEADER END ======================== */}

      {/* Hero Section (From previous successful design) */}
      <section className="relative h-[600px] text-white">
        <div className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000" style={{backgroundImage: `url(${heroSlides[currentSlide]?.image || '/placeholder-hero.jpg'})`}}>
          <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        </div>
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
          <h2 className="text-5xl md:text-6xl font-extrabold mb-4 animate-fade-in-down">{heroSlides[currentSlide]?.title}</h2>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl animate-fade-in-up">{heroSlides[currentSlide]?.subtitle}</p>
          <button className="px-8 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-transform hover:scale-105 transform">
            {heroSlides[currentSlide]?.cta}
          </button>
        </div>
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex space-x-2">
            {heroSlides.map((_, index) => (
              <button key={index} onClick={() => setCurrentSlide(index)} className={`h-2 w-2 rounded-full transition-all ${index === currentSlide ? 'bg-white w-6' : 'bg-white/50'}`}></button>
            ))}
        </div>
      </section>

      {/* NOTE: The old standalone search bar section is now REMOVED, 
        because the search bar is included in our new header.
      */}

      {/* Categories Section (From previous successful design) */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12">Browse Top Categories</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-6">
            {categories.map(category => (
              <div key={category.id} className="text-center p-4 bg-white rounded-lg shadow-md hover:shadow-xl hover:-translate-y-1 transition-all transform cursor-pointer">
                <div className="text-5xl mb-2">{category.icon}</div>
                <h3 className="font-semibold">{category.name}</h3>
                <p className="text-sm text-gray-500">{category.count} products</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Catalogs Section (Now fetching real data from Supabase) */}
      <section className="bg-blue-50 py-20">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-4xl font-bold">Featured Catalogs</h2>
            <button onClick={() => navigate('/shop')} className="flex items-center text-blue-600 font-semibold hover:underline">
              View All <ChevronRight className="ml-1 h-5 w-5"/>
            </button>
          </div>
          
          {loading && <div className="text-center py-10">Loading catalogs...</div>}
          {error && <div className="text-center py-10 text-red-500">Error: {error}</div>}
          
          {!loading && !error && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {catalogs.map(catalog => (
                <div key={catalog.id} className="bg-white rounded-lg shadow-lg overflow-hidden transition-shadow hover:shadow-2xl flex flex-col">
                  <div className="relative">
                    <img src={catalog.image} alt={catalog.title} className="w-full h-56 object-cover" />
                    {catalog.status === 'approved' && (
                      <div className="absolute top-3 right-3 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center">
                          <CheckCircle className="h-4 w-4 mr-1"/> Verified
                      </div>
                    )}
                  </div>
                  <div className="p-6 flex flex-col flex-grow">
                    <h3 className="text-xl font-bold mb-2">{catalog.title}</h3>
                    <p className="text-sm text-gray-500 mb-4">{catalog.description}</p>
                    <div className="flex justify-between items-center text-sm text-gray-600 mb-4">
                      <div className="flex items-center">
                          <Star className="text-yellow-400 h-5 w-5 mr-1"/> 
                          <span className="font-bold">4.5</span> {/* In a real app, this would come from the data */}
                      </div>
                      <div className="flex items-center">
                          <Heart className="text-red-500 h-5 w-5 mr-1"/>
                          <span>{catalog.likes || 0}</span>
                      </div>
                    </div>
                    <div className="mt-auto">
                      <button onClick={() => handleRFQ(catalog.id)} className="w-full px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors">
                        Request Quotation
                      </button>
                    </div>

                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
      
      {/* Why Choose Us Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16">Why Choose MarsaFyi?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center p-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-6">
                <ShieldCheck className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Verified Suppliers</h3>
              <p className="text-gray-600">All our suppliers go through a rigorous verification process to ensure quality and reliability.</p>
            </div>
            <div className="text-center p-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
                <Ship className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Global Shipping</h3>
              <p className="text-gray-600">We offer worldwide shipping with real-time tracking and competitive rates.</p>
            </div>
            <div className="text-center p-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-6">
                <Globe className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">24/7 Support</h3>
              <p className="text-gray-600">Our multilingual support team is available around the clock to assist you.</p>
            </div>
            <div className="text-center p-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-6">
                <CheckCircle className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Secure Payments</h3>
              <p className="text-gray-600">We protect your transactions with industry-leading security measures.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Transform Your Global Trade?</h2>
          <p className="text-xl mb-10 max-w-2xl mx-auto">Join thousands of businesses already using MarsaFyi to expand their global reach</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button 
              className="px-8 py-3 bg-white text-blue-600 font-bold rounded-lg hover:bg-gray-100 transition-colors"
              onClick={() => navigate('/register')}
            >
              Register Now - It's Free
            </button>
            <button 
              className="px-8 py-3 bg-transparent border-2 border-white text-white font-bold rounded-lg hover:bg-white/10 transition-colors"
              onClick={() => navigate('/login')}
            >
              Login to Your Account
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
            <div className="lg:col-span-2">
              <h3 className="text-3xl font-bold mb-6">MarsaFyi</h3>
              <p className="text-gray-400 mb-8 max-w-md">
                Global B2B Trade Platform connecting buyers and sellers worldwide
              </p>
              <div className="flex space-x-4">
                {['📘', '🐦', '📷', '💼'].map((icon, index) => (
                  <a key={index} href="#" className="text-gray-400 hover:text-white text-2xl">
                    {icon}
                  </a>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="text-xl font-bold mb-6">For Buyers</h4>
              <ul className="space-y-3">
                {['Submit RFQ', 'Search Suppliers', 'Trade Assurance', 'Payment Options'].map((item, index) => (
                  <li key={index}>
                    <a href="#" className="text-gray-400 hover:text-white transition-colors">{item}</a>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="text-xl font-bold mb-6">For Suppliers</h4>
              <ul className="space-y-3">
                {['Display Products', 'Supplier Membership', 'Learning Center', 'Success Stories'].map((item, index) => (
                  <li key={index}>
                    <a href="#" className="text-gray-400 hover:text-white transition-colors">{item}</a>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="text-xl font-bold mb-6">Company</h4>
              <ul className="space-y-3">
                {['About Us', 'Contact Us', 'Careers', 'Press'].map((item, index) => (
                  <li key={index}>
                    <a href="#" className="text-gray-400 hover:text-white transition-colors">{item}</a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-16 pt-8 text-center text-gray-500">
            <p>&copy; 2025 MarsaFyi. All rights reserved. | Privacy Policy | Terms of Service</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainDashboard;