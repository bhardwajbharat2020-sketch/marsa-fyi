import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronRight, Star, Heart, CheckCircle, User } from 'lucide-react';
import '../App.css';

const ShopPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedPort, setSelectedPort] = useState('All Ports');
  const [sortBy, setSortBy] = useState('featured');
  const [currentPage, setCurrentPage] = useState(1);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState(['All Categories']);
  const [ports, setPorts] = useState(['All Ports']);
  const navigate = useNavigate();

  // Fetch real products from Supabase
  useEffect(() => {
    const fetchProductsAndFilters = async () => {
      try {
        setLoading(true);
        
        // Fetch products
        const productsResponse = await fetch('/api/products');
        const productsData = await productsResponse.json();
        
        if (productsResponse.ok) {
          setProducts(productsData);
          
          // Extract unique categories and ports for filter dropdowns
          const uniqueCategories = ['All Categories', ...new Set(productsData.map(product => product.category_name).filter(Boolean))];
          const uniquePorts = ['All Ports', ...new Set(productsData.map(product => product.origin_port_name).filter(Boolean))];
          
          setCategories(uniqueCategories);
          setPorts(uniquePorts);
        } else {
          setError(productsData.error || 'Failed to fetch products');
        }
      } catch (err) {
        setError('Failed to fetch products');
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProductsAndFilters();
  }, []);

  // Filter products based on search, category, and port
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.short_description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All Categories' || product.category_name === selectedCategory;
    const matchesPort = selectedPort === 'All Ports' || product.origin_port_name === selectedPort;
    return matchesSearch && matchesCategory && matchesPort;
  });

  // Pagination
  const productsPerPage = 8;
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const startIndex = (currentPage - 1) * productsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, startIndex + productsPerPage);

  const handleRFQ = (productId) => {
    // In a real app, this would check if user is logged in
    // For now, we'll redirect to login
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gray-100 text-sm text-center text-gray-600 py-2 px-4">
        <p>Free shipping on orders $100+</p>
      </div>

      <header className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800 cursor-pointer" onClick={() => navigate('/')}>MARSA FYI</h1>
          
          <nav className="hidden lg:flex items-center space-x-8">
            <a href="#" onClick={(e) => {e.preventDefault(); navigate('/');}} className="text-gray-600 hover:text-orange-600 font-medium">Home</a>
            <a href="#" onClick={(e) => {e.preventDefault(); navigate('/shop');}} className="font-semibold text-orange-600">Shop</a>
            <a href="#" onClick={(e) => {e.preventDefault(); navigate('/about');}} className="text-gray-600 hover:text-orange-600 font-medium">About</a>
            <a href="#" onClick={(e) => {e.preventDefault(); navigate('/contact');}} className="text-gray-600 hover:text-orange-600 font-medium">Contact</a>
          </nav>

          <div className="flex items-center space-x-4">
            <div className="relative hidden md:block">
              <input type="text" placeholder="Search for..." className="pl-4 pr-10 py-2 border rounded-md w-48 focus:ring-2 focus:ring-orange-500 transition"/>
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
            <button onClick={() => navigate('/register')} className="px-5 py-2 bg-orange-500 text-white font-semibold rounded-md hover:bg-orange-600 transition-colors">Register/Login</button>
            <User className="text-gray-700 h-6 w-6 cursor-pointer lg:hidden" />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative h-80 md:h-96 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 to-purple-900/60 z-10"></div>
        <div className="absolute inset-0 bg-cover bg-center" style={{backgroundImage: "url('/placeholder-hero.jpg')"}}></div>
        
        <div className="relative z-20 container mx-auto px-4 h-full flex items-center">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Discover Quality Products</h1>
            <p className="text-xl text-blue-100 mb-8">Connect with verified suppliers from around the world</p>
          </div>
        </div>
      </section>

      {/* Filters and Search */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* Search Bar */}
            <div className="mb-10">
              <div className="relative max-w-3xl mx-auto">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search products, suppliers, categories..."
                  className="w-full pl-10 pr-4 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button className="absolute inset-y-0 right-0 px-6 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 transition-colors">
                  Search
                </button>
              </div>
            </div>
            
            {/* Filters */}
            <div className="flex flex-wrap gap-4 justify-center mb-12">
              <div className="relative">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-lg py-3 px-4 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                >
                  {categories.map(category => (
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
                  className="appearance-none bg-white border border-gray-300 rounded-lg py-3 px-4 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
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
                  className="appearance-none bg-white border border-gray-300 rounded-lg py-3 px-4 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                >
                  <option value="featured">Featured</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Top Rated</option>
                  <option value="newest">Newest First</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <ChevronRight className="h-4 w-4 rotate-90" />
                </div>
              </div>
            </div>
            
            {/* Results Info */}
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-gray-900">Featured Products</h2>
              <p className="text-gray-600 mt-2">{filteredProducts.length} products found</p>
            </div>
            
            {/* Loading and Error States */}
            {loading && <div className="text-center py-10">Loading products...</div>}
            {error && <div className="text-center py-10 text-red-500">Error: {error}</div>}
            
            {/* Products Grid */}
            {!loading && !error && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {currentProducts.map(product => (
                  <div 
                    key={product.id} 
                    className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
                    onClick={() => navigate(`/product/${product.id}`)}
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
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{product.name}</h3>
                      <p className="text-gray-600 text-sm mb-1">Seller: {product.company_name || 'Unknown'}</p>
                      <p className="text-gray-600 text-sm mb-4">Port: {product.origin_port_name || 'Unknown'}</p>
                    
                      <p className="text-gray-700 mb-4 text-sm">{product.short_description || product.description}</p>
                    
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
                          <span className="ml-2 text-gray-600 text-sm">4.5</span> {/* In a real app, this would come from the product rating */}
                        </div>
                        <span className="text-gray-500 text-sm">👍 0</span> {/* In a real app, this would come from the product likes */}
                      </div>
                    
                      <div className="mt-auto">
                        <button 
                          className="w-full px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                          onClick={() => handleRFQ(product.id)}
                        >
                          Request Quotation
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
                  className="px-4 py-2 bg-white text-gray-600 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </button>
                
                <div className="flex gap-2">
                  {[...Array(totalPages)].map((_, index) => {
                    const page = index + 1;
                    return (
                      <button
                        key={page}
                        className={`w-10 h-10 rounded-full ${
                          currentPage === page
                            ? 'bg-blue-600 text-white'
                            : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
                        }`}
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </button>
                    );
                  })}
                </div>
                
                <button 
                  className="px-4 py-2 bg-white text-gray-600 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Can't Find What You're Looking For?</h2>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
            Submit a request and our suppliers will reach out to you with custom solutions
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button 
              className="px-8 py-3 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition-colors font-medium"
              onClick={() => navigate('/contact')}
            >
              Submit RFQ
            </button>
            <button 
              className="px-8 py-3 bg-transparent border-2 border-white text-white rounded-lg hover:bg-white/10 transition-colors font-medium"
              onClick={() => navigate('/register')}
            >
              Become a Supplier
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-2">
              <h3 className="text-2xl font-bold mb-4">MarsaFyi</h3>
              <p className="text-gray-400 mb-6 max-w-md">
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
              <h4 className="text-lg font-semibold mb-4">For Buyers</h4>
              <ul className="space-y-2">
                {['Submit RFQ', 'Search Suppliers', 'Trade Assurance', 'Payment Options'].map((item, index) => (
                  <li key={index}>
                    <a href="#" className="text-gray-400 hover:text-white transition-colors">{item}</a>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">For Suppliers</h4>
              <ul className="space-y-2">
                {['Display Products', 'Supplier Membership', 'Learning Center', 'Success Stories'].map((item, index) => (
                  <li key={index}>
                    <a href="#" className="text-gray-400 hover:text-white transition-colors">{item}</a>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Company</h4>
              <ul className="space-y-2">
                {['About Us', 'Contact Us', 'Careers', 'Press'].map((item, index) => (
                  <li key={index}>
                    <a href="#" className="text-gray-400 hover:text-white transition-colors">{item}</a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2025 MarsaFyi. All rights reserved. | Privacy Policy | Terms of Service</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ShopPage;