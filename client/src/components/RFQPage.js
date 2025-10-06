import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft } from 'lucide-react';
import RFQForm from './RFQForm';
import '../App.css';

const RFQPage = () => {
  const { currentUser, userRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { productId } = useParams();
  
  const [product, setProduct] = useState(null);

  // Theme colors
  const bhagwa = "#f77f00";
  const cream = "#f6efe6";
  const creamCard = "#efe6d9";
  const darkText = "#5a4632";

  // Redirect if not logged in or not a buyer
  useEffect(() => {
    if (!currentUser) {
      // Store the intended destination for redirection after login
      const redirectData = {
        path: location.pathname,
        timestamp: Date.now()
      };
      localStorage.setItem('postLoginRedirect', JSON.stringify(redirectData));
      navigate('/login');
      return;
    }
    
    if (userRole !== 'buyer') {
      navigate('/access-denied');
      return;
    }
    
    // If we have product data from location state, use it
    if (location.state?.product) {
      setProduct(location.state.product);
    } else if (productId) {
      // Fetch product data if we only have productId
      fetchProductData(productId);
    }
  }, [currentUser, userRole, productId, location, navigate]);

  const fetchProductData = async (id) => {
    try {
      const response = await fetch(`/api/products/${id}`);
      const data = await response.json();
      if (response.ok) {
        setProduct(data);
      }
    } catch (err) {
      console.error('Failed to load product information:', err);
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: cream }}>
        <div className="text-center">
          <p>Redirecting to login...</p>
        </div>
      </div>
    );
  }

  if (userRole !== 'buyer') {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: cream }}>
        <div className="text-center">
          <p>Access denied. Only buyers can submit RFQs.</p>
          <button 
            onClick={() => navigate('/')}
            className="mt-4 px-4 py-2 rounded-lg font-semibold"
            style={{ backgroundColor: bhagwa, color: "#fff" }}
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: cream, color: darkText }}>
      {/* global small style additions (keyframes) */}
      <style>{`
        @keyframes floatUp { from { transform: translateY(8px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
        .animate-float { animation: floatUp 600ms ease-out both; }
      `}</style>

      {/* Top thin bar */}
      <div className="w-full text-center py-1" style={{ backgroundColor: "#f4e7d8", color: darkText }}>
        <small>Trusted port-centric B2B marketplace • Shipments | RFQs | Verified suppliers</small>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 shadow-sm" style={{ backgroundColor: cream }}>
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div
              className="rounded-lg px-3 py-2 cursor-pointer flex items-center gap-2"
              onClick={() => navigate("/")}
              style={{ backgroundColor: creamCard }}
            >
              <div
                style={{ width: 44, height: 44, borderRadius: 10, background: bhagwa }}
                className="flex items-center justify-center text-white font-bold text-lg"
              >
                M
              </div>
              <div className="">
                <div className="text-xl font-bold" style={{ color: darkText }}>Marsa<span style={{ color: bhagwa }}>Fyi</span></div>
                <div className="text-xs" style={{ color: "#7a614a" }}>Port-centric Trade</div>
              </div>
            </div>

            {/* visible on desktop */}
            <nav className="hidden lg:flex items-center gap-6 ml-4 text-sm font-medium" style={{ color: "#6b503d" }}>
              <button onClick={() => navigate("/")} className="hover:text-[#8b5f3b]">Home</button>
              <button onClick={() => navigate("/shop")} className="font-semibold" style={{ color: bhagwa }}>Shop</button>
              <button onClick={() => navigate("/about")} className="hover:text-[#8b5f3b]">About</button>
              <button onClick={() => navigate("/contact")} className="hover:text-[#8b5f3b]">Contact</button>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative hidden md:block">
              <input
                placeholder="Find products, suppliers, or ports..."
                className="pl-4 pr-10 py-2 rounded-full border border-transparent focus:outline-none focus:ring-2"
                style={{ backgroundColor: "#fff", color: darkText }}
              />
            </div>

            <button
              onClick={() => navigate("/dashboard/buyer")}
              className="px-4 py-2 rounded-full font-semibold"
              style={{ backgroundColor: bhagwa, color: "#fff" }}
            >
              Dashboard
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Back button */}
          <button 
            onClick={() => navigate('/shop')} 
            className="flex items-center gap-2 mb-6 text-sm font-semibold"
            style={{ color: bhagwa }}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Shop
          </button>

          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="p-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-2" style={{ color: darkText }}>Request for Quotation</h2>
                <p className="text-[#7a614a]">Submit your requirements to get competitive quotes from suppliers</p>
              </div>
              
              {/* Product Info Display */}
              {product && (
                <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: creamCard }}>
                  <h3 className="font-bold mb-2" style={{ color: darkText }}>Product: {product.name}</h3>
                  <p className="text-sm" style={{ color: "#7a614a" }}>
                    {product.description?.substring(0, 100)}{product.description?.length > 100 ? '...' : ''}
                  </p>
                </div>
              )}
              
              <RFQForm 
                product={product}
                onClose={() => navigate('/shop')}
                onSuccess={() => {
                  // Show success message and stay on page
                  alert('RFQ submitted successfully! The seller will respond to your request soon.');
                }}
                isResponseForm={false}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-8" style={{ backgroundColor: "#2b2017", color: "#f8efe3" }}>
        <div className="container mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col items-center">
            <div className="text-2xl font-bold mb-3">MarsaFyi</div>
            <p className="text-sm text-[#e6d8c6] max-w-sm mb-4 text-center">Port-centric B2B marketplace connecting buyers, suppliers, and logistics partners globally.</p>

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
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M22.5 6.2s-.2-1.6-.8-2.3c-.7-.9-1.4-.9-1.8-1C16.6 2.5 12 2.5 12 2.5h0s-4 0-7.9.4c-.4.1-1.1.1-1.8 1-.6.7-.8 2.3-.8 2.3S1 8 1 9.8v1.4C1 13 1.2 14.7 1.2 14.7s.2 1.6.8 2.3c.7.9 1.6.9 2 1 1.5.2 6.3.4 6.3.4s4.6 0 7.9-.4c.4-.1 1.1-.1 1.8-1 .6-.7.8-2.3.8-2.3S23 8 23 6.2z" stroke="#f6efe6" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/><path d="M10 14.5V8.5l5 3-5 3z" fill="#f6efe6"/></svg>
              </a>
            </div>
          </div>

          <div className="flex flex-col items-center">
            <div className="font-semibold mb-3">For Buyers</div>
            <ul className="text-sm text-[#e6d8c6] space-y-2 text-center">
              <li>Submit RFQ</li>
              <li>Search Suppliers</li>
              <li>Trade Assurance</li>
              <li>Payment Options</li>
            </ul>
          </div>

          <div className="flex flex-col items-center">
            <div className="font-semibold mb-3">For Suppliers</div>
            <ul className="text-sm text-[#e6d8c6] space-y-2 text-center">
              <li>Display Products</li>
              <li>Supplier Membership</li>
              <li>Learning Center</li>
              <li>Success Stories</li>
            </ul>
          </div>
        </div>

        <div className="border-t" style={{ borderColor: "#3a2b20" }}>
          <div className="container mx-auto px-4 py-4 text-center text-sm text-[#e6d8c6]">
            © {new Date().getFullYear()} MarsaFyi • All rights reserved • Privacy Policy • Terms
          </div>
        </div>
      </footer>
    </div>
  );
};

export default RFQPage;