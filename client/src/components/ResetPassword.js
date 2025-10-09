import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, User, MapPin, ArrowLeft } from 'lucide-react';
import '../App.css';
import { useLanguage, useTranslation } from '../contexts/LanguageContext';
import Translate from './Translate';

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState('');
  const [selectedCountry, setSelectedCountry] = useState("Global");
  const [countryOpen, setCountryOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  // small helper for theme colors in inline style
  const bhagwa = "#f77f00";
  const cream = "#f6efe6";
  const creamCard = "#efe6d9";
  const darkText = "#5a4632";

  const countries = ["Global", "India", "UAE", "China", "USA", "Germany", "UK", "Singapore"];

  useEffect(() => {
    // Extract token from URL query parameters
    const searchParams = new URLSearchParams(location.search);
    const tokenParam = searchParams.get('token');
    if (tokenParam) {
      setToken(tokenParam);
    } else {
      setError('Invalid or missing reset token. Please request a new password reset.');
    }
  }, [location]);

  const validatePassword = (password) => {
    const errors = [];
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }
    
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one digit');
    }
    
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate passwords
    if (!newPassword || !confirmPassword) {
      setError('Please enter both password fields');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    const passwordErrors = validatePassword(newPassword);
    if (passwordErrors.length > 0) {
      setError(passwordErrors.join(', '));
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, newPassword }),
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        setSuccess(true);
      } else {
        setError(data.error || 'Failed to reset password. Please try again.');
      }
    } catch (err) {
      setError('Failed to reset password. Please try again.');
      console.error('Reset password error:', err);
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
              className="cursor-pointer flex items-center gap-2"
              onClick={() => navigate("/")}
            >
              <img 
                src="/logo.png" 
                alt="MarsaFyi Logo" 
                style={{ width: 60, height: 60, borderRadius: 0, border: 'none' }}
                className="flex items-center justify-center text-white font-bold text-lg"
              />
            </div>

            {/* visible on desktop */}
            <nav className="hidden lg:flex items-center gap-6 ml-4 text-sm font-medium" style={{ color: "#6b503d" }}>
              <button onClick={() => navigate("/")} className="hover:text-[#8b5f3b]"><Translate text="home" /></button>
              <button onClick={() => navigate("/about")} className="hover:text-[#8b5f3b]"><Translate text="about" /></button>
              <button onClick={() => navigate("/shop")} className="hover:text-[#8b5f3b]"><Translate text="shop" /></button>
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
            <Translate text="serving" /> <span className="font-semibold">{selectedCountry}</span> • <Translate text="portCentricLogistics" />
          </div>
        </div>
      </div>

      {/* Reset Password Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          {/* Back button */}
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center gap-2 mb-6 text-sm font-semibold"
            style={{ color: bhagwa }}
          >
            <ArrowLeft className="h-4 w-4" />
            <Translate text="back" />
          </button>

          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="p-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-2" style={{ color: darkText }}><Translate text="resetPassword" /></h2>
                <p className="text-[#7a614a]"><Translate text="enterNewPassword" /></p>
              </div>
              
              {success ? (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
                  <p><Translate text="passwordResetSuccess" /></p>
                  <p className="mt-2"><Translate text="youCanNow" /> <button onClick={() => navigate('/login')} className="font-semibold text-[#f77f00] hover:underline"><Translate text="logIn" /></button> <Translate text="withNewPassword" /></p>
                </div>
              ) : (
                <>
                  {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">{error}</div>}
                  
                  <form onSubmit={handleSubmit}>
                    <div className="mb-6">
                      <label htmlFor="newPassword" className="block text-lg font-semibold mb-2" style={{ color: darkText }}><Translate text="newPassword" /></label>
                      <input
                        type="password"
                        id="newPassword"
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder={t('enterNewPassword')}
                        required
                        style={{ backgroundColor: "#fff", color: darkText }}
                      />
                      <p className="text-sm text-gray-500 mt-1"><Translate text="passwordRequirements" /></p>
                    </div>
                    
                    <div className="mb-6">
                      <label htmlFor="confirmPassword" className="block text-lg font-semibold mb-2" style={{ color: darkText }}><Translate text="confirmPassword" /></label>
                      <input
                        type="password"
                        id="confirmPassword"
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder={t('confirmNewPassword')}
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
                      {loading ? <Translate text="resetting" /> : <Translate text="resetPassword" />}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
          
          <div className="text-center mt-6">
            <button 
              onClick={() => navigate('/')}
              className="font-semibold text-[#f77f00] hover:underline"
            >
              <Translate text="backToMainDashboard" />
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-8" style={{ backgroundColor: "#2b2017", color: "#f8efe3" }}>
        <div className="container mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col items-center">
            <img 
              src="/logo.png" 
              alt="MarsaFyi Logo" 
              style={{ width: 60, height: 60, borderRadius: 0, border: 'none' }}
              className="mb-3"
            />
            <p className="text-sm text-[#e6d8c6] max-w-sm mb-4 text-center"><Translate text="portCentricB2B" /></p>

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
            <div className="font-semibold mb-3"><Translate text="forBuyers" /></div>
            <ul className="text-sm text-[#e6d8c6] space-y-2 text-center">
              <li><Translate text="submitRfq" /></li>
              <li><Translate text="searchSuppliers" /></li>
              <li><Translate text="tradeAssurance" /></li>
              <li><Translate text="paymentOptions" /></li>
            </ul>
          </div>

          <div className="flex flex-col items-center">
            <div className="font-semibold mb-3"><Translate text="forSuppliers" /></div>
            <ul className="text-sm text-[#e6d8c6] space-y-2 text-center">
              <li><Translate text="displayProducts" /></li>
              <li><Translate text="supplierMembership" /></li>
              <li><Translate text="learningCenter" /></li>
              <li><Translate text="successStories" /></li>
            </ul>
          </div>
        </div>

        <div className="border-t" style={{ borderColor: "#3a2b20" }}>
          <div className="container mx-auto px-4 py-4 text-center text-sm text-[#e6d8c6]">
            <Translate text="copyrightText" year={new Date().getFullYear()} />
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ResetPassword;