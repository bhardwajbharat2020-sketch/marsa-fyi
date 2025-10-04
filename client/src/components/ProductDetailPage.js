import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Star, Heart, CheckCircle, ChevronLeft, ChevronRight, User, Search } from 'lucide-react';
import '../App.css';

// Mock data for products
const mockProducts = [
  {
    id: 1,
    title: 'Premium Electronics Components',
    seller: 'VEND-23-ABC123',
    port: 'Mumbai Port',
    category: 'Electronics',
    description: 'High-quality electronic components for industrial use with 5-year warranty. These components are designed for heavy-duty applications and have been tested under extreme conditions to ensure reliability and longevity.',
    detailedDescription: 'Our premium electronic components are manufactured using state-of-the-art technology and the highest quality materials. Each component undergoes rigorous testing to meet international standards. Key features include:\n\n- Operating temperature range: -40°C to +85°C\n- Humidity resistance up to 95% RH\n- Vibration resistance up to 20G\n- ESD protection up to 15kV\n- RoHS compliant\n\nApplications include industrial automation, automotive electronics, aerospace systems, and telecommunications infrastructure.',
    price: '$5,000',
    likes: 1240,
    image: '/placeholder.jpg',
    rating: 4.8,
    verified: true,
    specifications: [
      { name: 'Operating Voltage', value: '5V - 24V' },
      { name: 'Current Rating', value: '10A' },
      { name: 'Power Consumption', value: '2.5W' },
      { name: 'Dimensions', value: '50mm x 30mm x 15mm' },
      { name: 'Weight', value: '45g' },
      { name: 'Material', value: 'Aluminum Alloy' }
    ],
    certifications: ['ISO 9001', 'RoHS', 'CE']
  },
  {
    id: 2,
    title: 'Organic Cotton Textiles',
    seller: 'VEND-23-XYZ789',
    port: 'Chennai Port',
    category: 'Textiles',
    description: 'Sustainable organic cotton fabrics for fashion industry, GOTS certified. Made from 100% organic cotton without the use of harmful chemicals or pesticides.',
    detailedDescription: 'Our organic cotton textiles are produced using environmentally friendly processes that protect both the planet and the people involved in production. The cotton is grown without synthetic fertilizers or pesticides, ensuring a cleaner environment and safer working conditions.\n\nFeatures:\n- 100% Organic Cotton\n- GOTS certified production\n- OEKO-TEX Standard 100 compliant\n- Soft and breathable\n- Hypoallergenic\n- Biodegradable\n\nAvailable in various weights and weaves suitable for different applications from lightweight summer clothing to heavy-duty workwear.',
    price: '$3,500',
    likes: 890,
    image: '/placeholder.jpg',
    rating: 4.9,
    verified: true,
    specifications: [
      { name: 'Fiber Content', value: '100% Organic Cotton' },
      { name: 'Weight', value: '150 GSM' },
      { name: 'Width', value: '150cm' },
      { name: 'Shrinkage', value: '<3%' },
      { name: 'Color Fastness', value: 'Grade 4-5' }
    ],
    certifications: ['GOTS', 'OEKO-TEX', 'Fair Trade']
  },
  {
    id: 3,
    title: 'Industrial Machinery Parts',
    seller: 'VEND-23-DEF456',
    port: 'JNPT',
    category: 'Machinery',
    description: 'Heavy-duty machinery components for manufacturing with ISO 9001 certification. Precision-engineered for maximum durability and performance.',
    detailedDescription: 'These industrial machinery parts are designed for demanding applications in manufacturing environments. Each component is precision-machined to exacting tolerances and undergoes comprehensive quality control testing.\n\nKey characteristics:\n- High-strength alloy construction\n- Precision machining with tolerances ±0.01mm\n- Heat-treated for enhanced durability\n- Surface finishing for corrosion resistance\n- Interchangeable with OEM parts\n- Backed by 2-year warranty\n\nSuitable for use in automotive assembly lines, food processing equipment, packaging machinery, and textile manufacturing.',
    price: '$12,000',
    likes: 670,
    image: '/placeholder.jpg',
    rating: 4.7,
    verified: false,
    specifications: [
      { name: 'Material', value: 'Alloy Steel' },
      { name: 'Hardness', value: 'HRC 58-62' },
      { name: 'Tolerance', value: '±0.01mm' },
      { name: 'Surface Finish', value: 'Ra 0.8μm' },
      { name: 'Operating Temp', value: '-20°C to +150°C' }
    ],
    certifications: ['ISO 9001', 'CE']
  },
  {
    id: 4,
    title: 'Specialty Chemicals',
    seller: 'VEND-23-GHI321',
    port: 'Vishakhapatnam Port',
    category: 'Chemicals',
    description: 'High-purity chemicals for pharmaceutical industry, REACH compliant. Manufactured under strict quality control standards.',
    detailedDescription: 'Our specialty chemicals are produced in ISO-certified facilities with stringent quality control measures. Each batch is tested for purity, consistency, and compliance with international standards.\n\nProduct highlights:\n- Purity >99.5%\n- Trace metal content <10ppm\n- Consistent batch-to-batch quality\n- Detailed Certificate of Analysis provided\n- Custom packaging available\n- Technical support available\n\nApplications include active pharmaceutical ingredients (APIs), excipients, and intermediate compounds for drug manufacturing.',
    price: '$8,500',
    likes: 420,
    image: '/placeholder.jpg',
    rating: 4.6,
    verified: true,
    specifications: [
      { name: 'Purity', value: '>99.5%' },
      { name: 'Moisture Content', value: '<0.5%' },
      { name: 'Particle Size', value: '<10μm' },
      { name: 'Solubility', value: 'Freely soluble in water' },
      { name: 'pH', value: '6.5-7.5' }
    ],
    certifications: ['REACH', 'ISO 9001', 'GMP']
  },
  {
    id: 5,
    title: 'Automotive Spare Parts',
    seller: 'VEND-23-JKL987',
    port: 'Kolkata Port',
    category: 'Automotive',
    description: 'OEM quality automotive components with 2-year guarantee. Direct replacement parts for major vehicle manufacturers.',
    detailedDescription: 'These automotive spare parts are manufactured to OEM specifications ensuring perfect fit and performance. Each component undergoes extensive testing to meet or exceed original equipment standards.\n\nQuality assurance:\n- OEM equivalent materials\n- Precision manufacturing\n- Comprehensive testing protocols\n- 2-year warranty coverage\n- Global compatibility\n- Technical documentation included\n\nSuitable for passenger cars, light commercial vehicles, and motorcycles from major manufacturers.',
    price: '$6,200',
    likes: 750,
    image: '/placeholder.jpg',
    rating: 4.5,
    verified: true,
    specifications: [
      { name: 'Compatibility', value: 'Universal fit' },
      { name: 'Material', value: 'High-grade Steel/Aluminum' },
      { name: 'Finish', value: 'Chrome/Zinc plated' },
      { name: 'Warranty', value: '2 years' },
      { name: 'Standards', value: 'ISO 9001, TS 16949' }
    ],
    certifications: ['ISO/TS 16949', 'SAE', 'E-Mark']
  },
  {
    id: 6,
    title: 'Construction Materials',
    seller: 'VEND-23-MNO654',
    port: 'Mumbai Port',
    category: 'Construction',
    description: 'High-grade construction materials with ISI certification. Durable and reliable for all construction projects.',
    detailedDescription: 'Our construction materials are engineered for strength, durability, and compliance with national and international building standards. These materials are ideal for both residential and commercial construction projects.\n\nProduct benefits:\n- High tensile strength\n- Corrosion resistant\n- Weatherproof\n- Easy to install\n- Cost-effective\n- Long service life\n\nApplications include structural frameworks, foundation work, roofing systems, and decorative elements.',
    price: '$4,800',
    likes: 530,
    image: '/placeholder.jpg',
    rating: 4.4,
    verified: false,
    specifications: [
      { name: 'Material Grade', value: 'IS 2062' },
      { name: 'Tensile Strength', value: '410 MPa' },
      { name: 'Yield Strength', value: '250 MPa' },
      { name: 'Elongation', value: '>22%' },
      { name: 'Coating', value: 'Galvanized' }
    ],
    certifications: ['ISI', 'ISO 9001']
  }
];

const ProductDetailPage = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');

  // Find the current product
  const currentProduct = mockProducts.find(product => product.id === parseInt(productId)) || mockProducts[0];
  
  // Find related products (same category, excluding current product)
  const relatedProducts = mockProducts.filter(product => 
    product.category === currentProduct.category && product.id !== currentProduct.id
  );

  const handleRFQ = () => {
    // In a real app, this would check if user is logged in
    // For now, we'll redirect to login
    navigate('/login');
  };

  const handleAddToCart = () => {
    // In a real app, this would add to cart
    alert('Added to cart!');
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
            <User className="text-gray-700 h-6 w-6 cursor-pointer lg:hidden" />
          </div>
        </div>
      </header>

      {/* Breadcrumb */}
      <section className="py-4 bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center text-sm text-gray-600">
            <button 
              onClick={() => navigate(-1)}
              className="flex items-center text-blue-600 hover:text-blue-800"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back
            </button>
            <span className="mx-2">/</span>
            <span>{currentProduct.category}</span>
            <span className="mx-2">/</span>
            <span className="text-gray-900 font-medium">{currentProduct.title}</span>
          </div>
        </div>
      </section>

      {/* Product Detail */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Product Images */}
            <div>
              <div className="relative">
                <img 
                  src={currentProduct.image} 
                  alt={currentProduct.title} 
                  className="w-full h-96 object-cover rounded-xl"
                />
                {currentProduct.verified && (
                  <div className="absolute top-4 left-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm flex items-center">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Verified
                  </div>
                )}
              </div>
              
              {/* Thumbnails */}
              <div className="flex gap-4 mt-6">
                {[0, 1, 2].map((index) => (
                  <div 
                    key={index}
                    className={`w-20 h-20 border-2 rounded-lg overflow-hidden cursor-pointer ${
                      selectedImage === index ? 'border-blue-600' : 'border-gray-200'
                    }`}
                    onClick={() => setSelectedImage(index)}
                  >
                    <img 
                      src={currentProduct.image} 
                      alt={`${currentProduct.title} ${index + 1}`} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
            
            {/* Product Info */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{currentProduct.title}</h1>
              
              <div className="flex items-center mb-6">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`h-5 w-5 ${
                        i < Math.floor(currentProduct.rating) 
                          ? 'text-yellow-400 fill-current' 
                          : 'text-gray-300'
                      }`} 
                    />
                  ))}
                </div>
                <span className="ml-2 text-gray-600">{currentProduct.rating}</span>
                <span className="mx-2 text-gray-300">•</span>
                <span className="text-gray-500">👍 {currentProduct.likes} likes</span>
              </div>
              
              <p className="text-gray-700 mb-8">{currentProduct.description}</p>
              
              <div className="border-t border-b border-gray-200 py-6 mb-8">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Seller</h3>
                    <p className="text-gray-900">{currentProduct.seller}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Port</h3>
                    <p className="text-gray-900">{currentProduct.port}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Category</h3>
                    <p className="text-gray-900">{currentProduct.category}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Availability</h3>
                    <p className="text-green-600">In Stock</p>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-4">
                <button 
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex-1"
                  onClick={handleRFQ}
                >
                  Request Quotation
                </button>
                <button className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50">
                  <Heart className="h-6 w-6 text-gray-600" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Product Details Tabs */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="bg-white rounded-xl shadow-sm">
            {/* Tabs */}
            <div className="border-b border-gray-200">
              <nav className="flex">
                <button
                  className={`px-6 py-4 font-medium text-sm ${
                    activeTab === 'description'
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  onClick={() => setActiveTab('description')}
                >
                  Description
                </button>
                <button
                  className={`px-6 py-4 font-medium text-sm ${
                    activeTab === 'specifications'
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  onClick={() => setActiveTab('specifications')}
                >
                  Specifications
                </button>
                <button
                  className={`px-6 py-4 font-medium text-sm ${
                    activeTab === 'certifications'
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  onClick={() => setActiveTab('certifications')}
                >
                  Certifications
                </button>
              </nav>
            </div>
            
            {/* Tab Content */}
            <div className="p-6">
              {activeTab === 'description' && (
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Product Description</h3>
                  <div className="prose max-w-none">
                    {currentProduct.detailedDescription.split('\n').map((paragraph, index) => (
                      paragraph.startsWith('-') ? (
                        <li key={index} className="ml-4">{paragraph.substring(1).trim()}</li>
                      ) : (
                        <p key={index} className="mb-4 text-gray-700">{paragraph}</p>
                      )
                    ))}
                  </div>
                </div>
              )}
              
              {activeTab === 'specifications' && (
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Technical Specifications</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {currentProduct.specifications.map((spec, index) => (
                      <div key={index} className="flex justify-between py-3 border-b border-gray-100">
                        <span className="font-medium text-gray-900">{spec.name}</span>
                        <span className="text-gray-700">{spec.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {activeTab === 'certifications' && (
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Certifications</h3>
                  <div className="flex flex-wrap gap-4">
                    {currentProduct.certifications.map((cert, index) => (
                      <div key={index} className="bg-blue-50 px-4 py-2 rounded-lg">
                        <span className="font-medium text-blue-700">{cert}</span>
                      </div>
                    ))}
                  </div>
                  <p className="mt-4 text-gray-700">
                    All our products undergo rigorous testing and certification processes to ensure they meet 
                    the highest quality and safety standards. We work with internationally recognized 
                    certification bodies to provide you with confidence in our products.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900">Related Products</h2>
              <a 
                href="#" 
                className="text-blue-600 hover:text-blue-800 font-medium flex items-center"
                onClick={(e) => {e.preventDefault(); navigate('/shop');}}
              >
                View All
                <ChevronRight className="h-5 w-5 ml-1" />
              </a>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {relatedProducts.slice(0, 4).map(product => (
                <div 
                  key={product.id} 
                  className="bg-gray-50 rounded-xl p-6 text-center hover:shadow-lg transition-shadow cursor-pointer group"
                  onClick={() => navigate(`/product/${product.id}`)}
                >
                  <div className="relative mb-4">
                    <img 
                      src={product.image} 
                      alt={product.title} 
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    {product.verified && (
                      <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs flex items-center">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Verified
                      </div>
                    )}
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600">{product.title}</h3>
                  <p className="text-gray-600 text-sm mb-3">{product.seller}</p>
                  <div className="flex items-center justify-center mb-3">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`h-4 w-4 ${
                            i < Math.floor(product.rating) 
                              ? 'text-yellow-400 fill-current' 
                              : 'text-gray-300'
                          }`} 
                        />
                      ))}
                    </div>
                    <span className="ml-1 text-gray-600 text-sm">{product.rating}</span>
                  </div>
                  <button 
                    className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    onClick={(e) => {e.stopPropagation(); handleRFQ();}}
                  >
                    Request Quotation
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Need Custom Solutions?</h2>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
            Our experts can help you find the perfect products for your specific requirements
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button 
              className="px-8 py-3 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition-colors font-medium"
              onClick={() => navigate('/contact')}
            >
              Contact Supplier
            </button>
            <button 
              className="px-8 py-3 bg-transparent border-2 border-white text-white rounded-lg hover:bg-white/10 transition-colors font-medium"
              onClick={() => navigate('/register')}
            >
              Become a Buyer
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

export default ProductDetailPage;