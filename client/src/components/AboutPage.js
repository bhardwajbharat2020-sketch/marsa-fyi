import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Search } from 'lucide-react';
import '../App.css';

const AboutPage = () => {
  const navigate = useNavigate();

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
            <a href="#" onClick={(e) => {e.preventDefault(); navigate('/about');}} className="font-semibold text-orange-600">About</a>
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

      {/* About Header */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold text-white mb-4">About MarsaFyi</h1>
          <p className="text-xl text-blue-100">Revolutionizing global B2B trade since 2023</p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="mission-section">
        <div className="container">
          <div className="mission-content">
            <div className="mission-text">
              <h2>Our Mission</h2>
              <p>
                At MarsaFyi, we are committed to transforming the landscape of international B2B trade by 
                creating a seamless, secure, and efficient platform that connects businesses worldwide. 
                Our mission is to eliminate the barriers that have traditionally hindered global commerce, 
                enabling companies of all sizes to participate in the global marketplace with confidence.
              </p>
              <p>
                We believe that every business, regardless of its size or location, deserves access to 
                high-quality suppliers, competitive pricing, and reliable trade partners. Through innovative 
                technology and a commitment to transparency, we're building a future where international 
                trade is accessible to all.
              </p>
            </div>
            <div className="mission-image">
              <div className="placeholder-image">Our Mission Visualization</div>
            </div>
          </div>
        </div>
      </section>

      {/* Vision Section */}
      <section className="vision-section">
        <div className="container">
          <div className="vision-content">
            <div className="vision-image">
              <div className="placeholder-image">Our Vision Visualization</div>
            </div>
            <div className="vision-text">
              <h2>Our Vision</h2>
              <p>
                We envision a world where geographical boundaries no longer limit business opportunities. 
                Our goal is to become the most trusted global B2B platform, facilitating trillions of dollars 
                in trade transactions annually while maintaining the highest standards of security, 
                transparency, and user satisfaction.
              </p>
              <p>
                Through continuous innovation and strategic partnerships, we aim to create an ecosystem 
                where businesses can thrive, suppliers can showcase their capabilities, and buyers can 
                discover the perfect products for their needs. We're not just building a platform; 
                we're shaping the future of global commerce.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="values-section">
        <div className="container">
          <h2 className="section-title">Our Core Values</h2>
          <div className="values-grid">
            <div className="value-card">
              <div className="value-icon">🔒</div>
              <h3>Integrity</h3>
              <p>We conduct all our business with honesty, transparency, and ethical practices.</p>
            </div>
            <div className="value-card">
              <div className="value-icon">🚀</div>
              <h3>Innovation</h3>
              <p>We continuously strive to improve our platform with cutting-edge technology.</p>
            </div>
            <div className="value-card">
              <div className="value-icon">🤝</div>
              <h3>Collaboration</h3>
              <p>We believe in the power of partnerships to achieve extraordinary results.</p>
            </div>
            <div className="value-card">
              <div className="value-icon">🌎</div>
              <h3>Global Perspective</h3>
              <p>We celebrate diversity and embrace the opportunities of global commerce.</p>
            </div>
            <div className="value-card">
              <div className="value-icon">💯</div>
              <h3>Excellence</h3>
              <p>We are committed to delivering exceptional value to all our stakeholders.</p>
            </div>
            <div className="value-card">
              <div className="value-icon">💡</div>
              <h3>Empowerment</h3>
              <p>We empower businesses to reach their full potential in global markets.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Leadership Team */}
      <section className="leadership-section">
        <div className="container">
          <h2 className="section-title">Our Leadership Team</h2>
          <div className="leaders-grid">
            <div className="leader-card">
              <div className="leader-image">
                <div className="placeholder-image">Leader Photo</div>
              </div>
              <h3>Alex Johnson</h3>
              <p className="leader-title">Founder & CEO</p>
              <p className="leader-bio">
                Former VP of International Trade at GlobalCommerce Inc. with 15+ years of experience 
                in B2B marketplaces.
              </p>
            </div>
            <div className="leader-card">
              <div className="leader-image">
                <div className="placeholder-image">Leader Photo</div>
              </div>
              <h3>Sarah Williams</h3>
              <p className="leader-title">Chief Technology Officer</p>
              <p className="leader-bio">
                Expert in scalable platform architecture with previous roles at TechInnovate and 
                DigitalSolutions.
              </p>
            </div>
            <div className="leader-card">
              <div className="leader-image">
                <div className="placeholder-image">Leader Photo</div>
              </div>
              <h3>Michael Chen</h3>
              <p className="leader-title">Chief Operations Officer</p>
              <p className="leader-bio">
                Operations specialist with extensive experience in logistics and supply chain 
                management across 30+ countries.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Milestones Section */}
      <section className="py-16 bg-gray-900 text-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-16">Our Journey</h2>
          <div className="max-w-4xl mx-auto">
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-blue-500"></div>
              
              {/* Timeline items */}
              <div className="relative space-y-12">
                {[
                  { year: '2023', title: 'Founded', description: 'MarsaFyi launched with a vision to revolutionize global B2B trade' },
                  { year: '2023 Q4', title: '10,000 Users', description: 'Reached our first major milestone with 10,000 registered users' },
                  { year: '2024 Q2', title: 'Global Expansion', description: 'Expanded to 50+ countries with localized support' },
                  { year: '2024 Q4', title: '100,000 Transactions', description: 'Facilitated over 100,000 successful transactions' },
                  { year: '2025', title: 'New Horizons', description: 'Launched AI-powered recommendation engine and mobile app' }
                ].map((milestone, index) => (
                  <div key={index} className={`flex ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'} items-center`}>
                    <div className="w-1/2 px-8">
                      <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
                        <div className="text-blue-400 font-bold text-lg mb-2">{milestone.year}</div>
                        <h3 className="text-xl font-bold mb-3">{milestone.title}</h3>
                        <p className="text-gray-300">{milestone.description}</p>
                      </div>
                    </div>
                    <div className="w-1/2 flex justify-center">
                      <div className="w-6 h-6 bg-blue-500 rounded-full border-4 border-gray-900"></div>
                    </div>
                    <div className="w-1/2"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Ready to Transform Your Global Trade?</h2>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
            Join thousands of businesses already using MarsaFyi to expand their global reach
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button 
              className="px-8 py-3 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition-colors font-medium"
              onClick={() => navigate('/register')}
            >
              Register Now - It's Free
            </button>
            <button 
              className="px-8 py-3 bg-transparent border-2 border-white text-white rounded-lg hover:bg-white/10 transition-colors font-medium"
              onClick={() => navigate('/login')}
            >
              Login to Your Account
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

export default AboutPage;