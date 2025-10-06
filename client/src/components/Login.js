import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Search, User, MapPin, ArrowLeft } from 'lucide-react';
import '../App.css';

const Login = () => {
  const [vendorCode, setVendorCode] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState("Global");
  const [countryOpen, setCountryOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  // small helper for theme colors in inline style
  const bhagwa = "#f77f00";
  const cream = "#f6efe6";
  const creamCard = "#efe6d9";
  const darkText = "#5a4632";

  const countries = ["Global", "India", "UAE", "China", "USA", "Germany", "UK", "Singapore"];

  useEffect(() => {
    // Check if there's a pending RFQ after login
    const checkPendingRFQ = () => {
      const pendingRFQ = localStorage.getItem('pendingRFQ');
      if (pendingRFQ) {
        try {
          const rfqData = JSON.parse(pendingRFQ);
          // Check if the RFQ is still valid (not older than 30 minutes)
          if (Date.now() - rfqData.timestamp < 30 * 60 * 1000) {
            return rfqData;
          } else {
            // Clear expired RFQ
            localStorage.removeItem('pendingRFQ');
          }
        } catch (e) {
          // Clear invalid RFQ data
          localStorage.removeItem('pendingRFQ');
        }
      }
      return null;
    };

    // If we're on the login page and there's a pending RFQ, store the from location
    const pendingRFQ = checkPendingRFQ();
    if (pendingRFQ && !location.state?.from) {
      // Store the original location in state
      navigate(location.pathname, { 
        replace: true, 
        state: { ...location.state, from: location, hasPendingRFQ: true } 
      });
    }
  }, [location, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!vendorCode || !password) {
      setError('Please enter both Vendor Code/Email and Password');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // Make API call to login endpoint
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ vendorCode, password }),
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        console.log('Login successful, checking for redirects');
        // Login successful
        login(data.user, data.user.role, data.token);
        
        // Check if there's a pending RFQ
        const pendingRFQ = localStorage.getItem('pendingRFQ');
        console.log('Checking for pending RFQ in localStorage:', pendingRFQ);
        if (pendingRFQ) {
          try {
            const rfqData = JSON.parse(pendingRFQ);
            console.log('Found pending RFQ data:', rfqData);
            
            // Check if the RFQ is still valid (not older than 30 minutes)
            if (Date.now() - rfqData.timestamp < 30 * 60 * 1000) {
              console.log('Redirecting to RFQ page for product:', rfqData.productId);
              // Clear the pending RFQ from localStorage ONLY after successful redirect
              localStorage.removeItem('pendingRFQ');
              console.log('Cleared pending RFQ from localStorage');
              // Redirect to RFQ page
              navigate(`/rfq/${rfqData.productId}`);
              // Important: Return here to prevent further redirection
              setLoading(false);
              return;
            } else {
              console.log('RFQ data expired');
              // Clear expired data
              localStorage.removeItem('pendingRFQ');
            }
          } catch (e) {
            console.error('Error parsing pending RFQ:', e);
            // Clear invalid RFQ data
            localStorage.removeItem('pendingRFQ');
          }
        }
        
        // Check for post-login redirect (for direct navigation to login page)
        const postLoginRedirect = localStorage.getItem('postLoginRedirect');
        console.log('Checking for post-login redirect:', postLoginRedirect);
        if (postLoginRedirect) {
          try {
            const redirectData = JSON.parse(postLoginRedirect);
            console.log('Found post-login redirect data:', redirectData);
            
            // Check if the redirect is still valid (not older than 30 minutes)
            if (Date.now() - redirectData.timestamp < 30 * 60 * 1000) {
              console.log('Redirecting to post-login destination:', redirectData.path);
              // Clear the redirect data from localStorage ONLY after successful redirect
              localStorage.removeItem('postLoginRedirect');
              console.log('Cleared post-login redirect from localStorage');
              // Redirect to the intended destination
              navigate(redirectData.path);
              // Important: Return here to prevent further redirection
              setLoading(false);
              return;
            } else {
              console.log('Post-login redirect data expired');
              // Clear expired data
              localStorage.removeItem('postLoginRedirect');
            }
          } catch (e) {
            console.error('Error parsing post-login redirect:', e);
            // Clear invalid redirect data
            localStorage.removeItem('postLoginRedirect');
          }
        }
        
        // Redirect to role-specific dashboard only if no pending RFQ or other redirect
        console.log('Redirecting to role-specific dashboard for role:', data.user.role);
        switch(data.user.role) {
          case 'seller':
            navigate('/dashboard/seller');
            break;
          case 'buyer':
            navigate('/dashboard/buyer');
            break;
          case 'captain':
            navigate('/dashboard/captain');
            break;
          case 'admin':
            navigate('/dashboard/admin');
            break;
          case 'hr':
            navigate('/dashboard/hr');
            break;
          case 'accountant':
            navigate('/dashboard/accountant');
            break;
          case 'arbitrator':
            navigate('/dashboard/arbitrator');
            break;
          case 'surveyor':
            navigate('/dashboard/surveyor');
            break;
          case 'insurance':
            navigate('/dashboard/insurance');
            break;
          case 'transporter':
            navigate('/dashboard/transporter');
            break;
          case 'logistics':
            navigate('/dashboard/logistics');
            break;
          case 'cha':
            navigate('/dashboard/cha');
            break;
          default:
            navigate('/dashboard/buyer');
        }
      } else {
        // Login failed
        setError(data.message || 'Invalid credentials. Please try again.');
      }
    } catch (err) {
      setError('Failed to login. Please check your credentials and try again.');
      console.error('Login error:', err);
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: cream, color: darkText }}>
      {/* global small style additions (keyframes) */}
      <style>{`
        @keyframes floatUp { from { transform: translateY(8px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
        .animate-float { animation: floatUp 600ms ease-out both; }
        .glass {
          background: linear-gradient(180deg, rgba(255,255,255,0.6), rgba(255,255,255,0.35));
          backdrop-filter: blur(6px);
        }
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
              <button onClick={() => navigate("/about")} className="hover:text-[#8b5f3b]">About</button>
              <button onClick={() => navigate("/shop")} className="hover:text-[#8b5f3b]">Shop</button>
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
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8b5f3b]" />
            </div>

            <button
              onClick={() => navigate("/register")}
              className="px-4 py-2 rounded-full font-semibold"
              style={{ backgroundColor: bhagwa, color: "#fff" }}
            >
              Join / Login
            </button>

            <User className="h-6 w-6 text-[#6b503d]" />
          </div>
        </div>
      </header>

      {/* Country selector */}
      <div className="w-full border-t border-b" style={{ borderColor: "#eadfce" }}>
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="relative" onMouseLeave={() => setCountryOpen(false)}>
            <button
              onMouseEnter={() => setCountryOpen(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-md font-semibold"
              style={{ backgroundColor: creamCard, color: darkText }}
            >
              <MapPin className="h-4 w-4" />
              <span>{selectedCountry}</span>
              <svg className="w-3 h-3 ml-1 text-[#6b503d]" viewBox="0 0 24 24" fill="none">
                <path d="M6 9l6 6 6-6" stroke="#6b503d" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            {countryOpen && (
              <div className="absolute mt-2 left-0 w-44 rounded-md shadow-lg glass overflow-hidden z-40">
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

          <div className="text-sm" style={{ color: "#7a614a" }}>
            Serving <span className="font-semibold">{selectedCountry}</span> • Port-centric logistics & verified suppliers
          </div>
        </div>
      </div>

      {/* Login Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          {/* Back button */}
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center gap-2 mb-6 text-sm font-semibold"
            style={{ color: bhagwa }}
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="p-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-2" style={{ color: darkText }}>Welcome Back</h2>
                <p className="text-[#7a614a]">Sign in to access your account</p>
              </div>
              
              {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">{error}</div>}
              
              <form onSubmit={handleSubmit}>
                <div className="mb-6">
                  <label htmlFor="vendorCode" className="block text-lg font-semibold mb-2" style={{ color: darkText }}>Vendor Code or Email</label>
                  <input
                    type="text"
                    id="vendorCode"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={vendorCode}
                    onChange={(e) => setVendorCode(e.target.value)}
                    placeholder="Enter your Vendor Code or Email"
                    required
                    style={{ backgroundColor: "#fff", color: darkText }}
                  />
                </div>
                
                <div className="mb-6">
                  <label htmlFor="password" className="block text-lg font-semibold mb-2" style={{ color: darkText }}>Password</label>
                  <input
                    type="password"
                    id="password"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your Password"
                    required
                    style={{ backgroundColor: "#fff", color: darkText }}
                  />
                </div>
                
                <button 
                  type="submit" 
                  className="w-full px-6 py-3 rounded-full font-bold"
                  style={{ backgroundColor: bhagwa, color: "#fff" }}
                  disabled={loading}
                >
                  {loading ? 'Logging in...' : 'Login'}
                </button>
              </form>
              
              <div className="text-center mt-6">
                <button 
                  onClick={() => navigate('/register')}
                  className="font-semibold text-[#f77f00] hover:underline"
                >
                  Don't have an account? Register
                </button>
              </div>
            </div>
          </div>
          
          <div className="text-center mt-6">
            <button 
              onClick={() => navigate('/')}
              className="font-semibold text-[#f77f00] hover:underline"
            >
              Back to Main Dashboard
            </button>
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
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M22.5 6.2s-.2-1.6-.8-2.3c-.7-.9-1.4-.9-1.8-1C16.6 2.5 12 2.5 12 2.5h0s-4.6 0-7.9.4c-.4.1-1.1.1-1.8 1-.6.7-.8 2.3-.8 2.3S1 8 1 9.8v1.4C1 13 1.2 14.7 1.2 14.7s.2 1.6.8 2.3c.7.9 1.6.9 2 1 1.5.2 6.3.4 6.3.4s4.6 0 7.9-.4c.4-.1 1.1-.1 1.8-1 .6-.7.8-2.3.8-2.3s.2-1.8.2-3.6v-1.4C23 8 22.5 6.2 22.5 6.2z" stroke="#f6efe6" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/><path d="M10 14.5V8.5l5 3-5 3z" fill="#f6efe6"/></svg>
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

export default Login;