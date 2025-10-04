import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Search } from 'lucide-react';
import '../App.css';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [submitStatus, setSubmitStatus] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Simulate form submission
    setTimeout(() => {
      setSubmitStatus({ type: 'success', message: 'Thank you for your message! We will get back to you soon.' });
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 1000);
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
            <a href="#" onClick={(e) => {e.preventDefault(); navigate('/contact');}} className="font-semibold text-orange-600">Contact</a>
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

      {/* Contact Header */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Contact Us</h1>
          <p className="text-xl text-blue-100">We'd love to hear from you. Get in touch with our team.</p>
        </div>
      </section>

      {/* Contact Content */}
      <section className="contact-content">
        <div className="container">
          <div className="contact-layout">
            <div className="contact-form-section">
              <h2>Send us a message</h2>
              <form onSubmit={handleSubmit} className="contact-form">
                <div className="form-group">
                  <label htmlFor="name">Full Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="form-control"
                    placeholder="Enter your full name"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="form-control"
                    placeholder="Enter your email address"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="subject">Subject</label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="form-control"
                    placeholder="Enter subject"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="message">Message</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    className="form-control"
                    placeholder="Enter your message"
                    rows="6"
                  ></textarea>
                </div>
                <button type="submit" className="btn btn-primary">Send Message</button>
              </form>
              {submitStatus && (
                <div className={`status-message ${submitStatus.type}`}>
                  {submitStatus.message}
                </div>
              )}
            </div>
            
            <div className="contact-info-section">
              <h2>Contact Information</h2>
              <div className="contact-info">
                <div className="info-item">
                  <div className="info-icon">📍</div>
                  <div className="info-content">
                    <h3>Our Office</h3>
                    <p>123 Global Trade Center<br />Mumbai, Maharashtra 400001<br />India</p>
                  </div>
                </div>
                <div className="info-item">
                  <div className="info-icon">📞</div>
                  <div className="info-content">
                    <h3>Phone Numbers</h3>
                    <p>+1 (555) 123-4567 (International)<br />+91 98765 43210 (India)</p>
                  </div>
                </div>
                <div className="info-item">
                  <div className="info-icon">✉️</div>
                  <div className="info-content">
                    <h3>Email Addresses</h3>
                    <p>support@marsafyi.com<br />sales@marsafyi.com<br />partnerships@marsafyi.com</p>
                  </div>
                </div>
                <div className="info-item">
                  <div className="info-icon">🕒</div>
                  <div className="info-content">
                    <h3>Working Hours</h3>
                    <p>Monday - Friday: 9:00 AM - 6:00 PM (IST)<br />Saturday: 10:00 AM - 2:00 PM (IST)<br />Sunday: Closed</p>
                  </div>
                </div>
              </div>
              
              <div className="map-container">
                <div className="placeholder-map">Interactive Map</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Support Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-16">How Can We Help You?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white rounded-xl p-8 shadow-md hover:shadow-lg transition-shadow text-center">
              <div className="text-4xl mb-6">❓</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">General Inquiries</h3>
              <p className="text-gray-600 mb-4">Have questions about our platform or services? Our team is here to help.</p>
              <a href="mailto:info@marsafyi.com" className="text-blue-600 hover:text-blue-800 font-medium">info@marsafyi.com</a>
            </div>
            <div className="bg-white rounded-xl p-8 shadow-md hover:shadow-lg transition-shadow text-center">
              <div className="text-4xl mb-6">🛒</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Buyer Support</h3>
              <p className="text-gray-600 mb-4">Need assistance with purchasing or finding products? Contact our buyer support.</p>
              <a href="mailto:buyers@marsafyi.com" className="text-blue-600 hover:text-blue-800 font-medium">buyers@marsafyi.com</a>
            </div>
            <div className="bg-white rounded-xl p-8 shadow-md hover:shadow-lg transition-shadow text-center">
              <div className="text-4xl mb-6">🏪</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Supplier Support</h3>
              <p className="text-gray-600 mb-4">Looking to sell on our platform? Get help with supplier onboarding.</p>
              <a href="mailto:suppliers@marsafyi.com" className="text-blue-600 hover:text-blue-800 font-medium">suppliers@marsafyi.com</a>
            </div>
            <div className="bg-white rounded-xl p-8 shadow-md hover:shadow-lg transition-shadow text-center">
              <div className="text-4xl mb-6">💼</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Partnerships</h3>
              <p className="text-gray-600 mb-4">Interested in partnering with us? Let's explore opportunities together.</p>
              <a href="mailto:partnerships@marsafyi.com" className="text-blue-600 hover:text-blue-800 font-medium">partnerships@marsafyi.com</a>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-16">Frequently Asked Questions</h2>
          <div className="max-w-3xl mx-auto space-y-6">
            {[
              {
                question: "How do I register as a buyer?",
                answer: "Registration is simple and free. Click on the 'Register' button in the header, select 'Buyer' as your role, and follow the step-by-step registration process. You'll need to provide basic business information and verify your email address."
              },
              {
                question: "What verification process do suppliers go through?",
                answer: "All suppliers undergo a rigorous verification process that includes business registration verification, product quality checks, and reputation assessment. Verified suppliers receive a special badge on their profile and products."
              },
              {
                question: "How does the quotation process work?",
                answer: "Once you find a product you're interested in, click 'Request Quotation'. The supplier will receive your request and typically respond within 24 hours with pricing, terms, and delivery information."
              },
              {
                question: "What payment methods are supported?",
                answer: "We support multiple payment methods including credit cards, bank transfers, and our secure escrow service. All transactions are protected by our Trade Assurance program."
              }
            ].map((faq, index) => (
              <div key={index} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                <h3 className="text-xl font-bold text-gray-900 mb-3">{faq.question}</h3>
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            ))}
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

export default ContactPage;