import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronRight, Star, Heart, CheckCircle, Ship, ShieldCheck, Globe, User, MapPin, ArrowLeft } from 'lucide-react';
import '../App.css';
import { useLanguage, useTranslation } from '../contexts/LanguageContext';
import Translate from './Translate';

const Register = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    whatsapp: '',
    address: '',
    zipCode: '',
    port: '',
    workClass: '',
    documents: [],
    declaration: false
  });
  const [emailVerified, setEmailVerified] = useState(false);
  const [whatsappVerified, setWhatsappVerified] = useState(false);
  const [emailOtp, setEmailOtp] = useState('');
  const [whatsappOtp, setWhatsappOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [vendorCode, setVendorCode] = useState('');
  const [requiresEmailConfirmation, setRequiresEmailConfirmation] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState([]);
  const [emailError, setEmailError] = useState('');
  const [selectedCountry, setSelectedCountry] = useState("Global");
  const [countryOpen, setCountryOpen] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();

  // small helper for theme colors in inline style
  const bhagwa = "#f77f00";
  const cream = "#f6efe6";
  const creamCard = "#efe6d9";
  const darkText = "#5a4632";

  const countries = ["Global", "India", "UAE", "China", "USA", "Germany", "UK", "Singapore"];

  // Only include roles that users can register for directly
  const workClasses = [
    { id: 'seller', name: 'Seller', icon: '🏪' },
    { id: 'buyer', name: 'Buyer', icon: '🛒' },
    { id: 'surveyor', name: 'Surveyor', icon: '🔍' },
    { id: 'insurance', name: 'Insurance Agent', icon: '🛡️' },
    { id: 'transporter', name: 'Transporter', icon: '🚚' },
    { id: 'logistics', name: 'Logistics', icon: '📦' },
    { id: 'cha', name: 'CHA', icon: '🏛️' }
  ];

  const ports = [
    'Mumbai Port',
    'Chennai Port',
    'JNPT',
    'Kolkata Port',
    'Vishakhapatnam Port',
    'Not Applicable'
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Validate password in real-time
    if (name === 'password') {
      validatePasswordRequirements(value);
    }
    
    // Validate email format
    if (name === 'email') {
      validateEmailFormat(value);
    }
  };
  
  const validatePasswordRequirements = (password) => {
    const errors = [];
    
    if (password && password.length < 8) {
      errors.push('At least 8 characters');
    }
    
    if (password && !/[A-Z]/.test(password)) {
      errors.push('One uppercase letter');
    }
    
    if (password && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('One special character');
    }
    
    if (password && !/\d/.test(password)) {
      errors.push('One digit');
    }
    
    // Update password errors state
    setPasswordErrors(errors);
  };
  
  const validateEmailFormat = (email) => {
    // Check if email contains @ and has content after it
    const emailRegex = /^[^@]+@.+$/;
    if (email && !emailRegex.test(email)) {
      setEmailError('Email must contain @ with content after it');
    } else {
      setEmailError('');
    }
  };

  const handleDocumentUpload = (e) => {
    // In a real app, this would handle file uploads
    const files = Array.from(e.target.files);
    setFormData(prev => ({
      ...prev,
      documents: [...prev.documents, ...files]
    }));
  };

  const sendEmailOtp = () => {
    // In a real app, this would send an OTP to the email
    if (!formData.email) {
      setError('Please enter your email first');
      return;
    }
    alert(`OTP sent to ${formData.email}: 123456`);
    setError('');
  };

  const verifyEmailOtp = () => {
    if (emailOtp === '123456') {
      setEmailVerified(true);
      setError('');
    } else {
      setError('Invalid OTP. Please try again.');
    }
  };

  const sendWhatsappOtp = () => {
    // In a real app, this would send an OTP to WhatsApp
    if (!formData.whatsapp) {
      setError('Please enter your WhatsApp number first');
      return;
    }
    alert(`OTP sent to WhatsApp ${formData.whatsapp}: 654321`);
    setError('');
  };

  const verifyWhatsappOtp = () => {
    if (whatsappOtp === '654321') {
      setWhatsappVerified(true);
      setError('');
    } else {
      setError('Invalid OTP. Please try again.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all required fields
    if (!formData.name) {
      setError('Please enter your name/company name');
      return;
    }
    
    if (!formData.email) {
      setError('Please enter your email');
      return;
    }
    
    // Check email format
    if (emailError) {
      setError(emailError);
      return;
    }
    
    if (!formData.password) {
      setError('Please enter a password');
      return;
    }
    
    // Check password requirements using real-time validation
    if (passwordErrors.length > 0) {
      setError('Password does not meet requirements: ' + passwordErrors.join(', '));
      return;
    }
    
    if (!emailVerified) {
      setError('Please verify your email');
      return;
    }
    
    if (!formData.whatsapp) {
      setError('Please enter your WhatsApp number');
      return;
    }
    
    if (!whatsappVerified) {
      setError('Please verify your WhatsApp number');
      return;
    }
    
    if (!formData.address) {
      setError('Please enter your address');
      return;
    }
    
    if (!formData.port) {
      setError('Please select your nearest port');
      return;
    }
    
    if (!formData.workClass) {
      setError('Please select your work class');
      return;
    }
    
    if (!formData.declaration) {
      setError('Please accept the declaration and consent checkbox');
      return;
    }
    
    // Check password requirements using real-time validation
    if (passwordErrors.length > 0) {
      setError('Password does not meet requirements: ' + passwordErrors.join(', '));
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // Extract first and last name from the full name
      const nameParts = formData.name.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';
      
      // Prepare data for the API call
      const registrationData = {
        email: formData.email,
        password: formData.password,
        firstName: firstName,
        lastName: lastName,
        phone: formData.whatsapp,
        workClass: formData.workClass
      };
      
      console.log('Sending registration data:', registrationData);
      
      // Send registration data to the backend
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registrationData),
      });
      
      const result = await response.json();
      console.log('Registration response:', result);
      
      if (response.ok) {
        // Registration successful
        setVendorCode(result.vendorCode);
        setRequiresEmailConfirmation(result.requiresEmailConfirmation);
        
        if (result.requiresEmailConfirmation) {
          alert(`Registration successful! A confirmation email has been sent to ${formData.email}. Please check your email and follow the instructions to complete your registration. Your Vendor Code is: ${result.vendorCode}`);
        } else {
          alert(`Registration successful! Your Vendor Code is: ${result.vendorCode}. You can now login with your email and password.`);
        }
        
        // Redirect to login page
        navigate('/login');
      } else {
        // Registration failed
        setError(result.error || 'Registration failed. Please try again.');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError('An error occurred during registration. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleNextStep1 = () => {
    // Validate step 1 fields before proceeding
    if (!formData.name) {
      setError('Please enter your name/company name');
      return;
    }
    
    if (!formData.email) {
      setError('Please enter your email');
      return;
    }
    
    // Check email format
    if (emailError) {
      setError(emailError);
      return;
    }
    
    if (!formData.password) {
      setError('Please enter a password');
      return;
    }
    
    // Check password requirements using real-time validation
    if (passwordErrors.length > 0) {
      setError('Password does not meet requirements: ' + passwordErrors.join(', '));
      return;
    }
    
    if (!emailVerified) {
      setError('Please verify your email');
      return;
    }
    
    if (!formData.whatsapp) {
      setError('Please enter your WhatsApp number');
      return;
    }
    
    if (!whatsappVerified) {
      setError('Please verify your WhatsApp number');
      return;
    }
    
    if (!formData.address) {
      setError('Please enter your address');
      return;
    }
    
    if (!formData.port) {
      setError('Please select your nearest port');
      return;
    }
    
    // Check password requirements using real-time validation
    if (passwordErrors.length > 0) {
      setError('Password does not meet requirements: ' + passwordErrors.join(', '));
      return;
    }
    
    setError('');
    setStep(2);
  };

  const handleNextStep2 = () => {
    // Validate step 2 fields before proceeding
    if (!formData.workClass) {
      setError('Please select your work class');
      return;
    }
    
    setError('');
    setStep(3);
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

      {/* Registration Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
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
            <div className="p-6 md:p-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-2" style={{ color: darkText }}><Translate text="joinMarsaFyi" /></h2>
                <p className="text-[#7a614a]"><Translate text="createAccount" /></p>
              </div>
              
              {/* Progress Indicator */}
              <div className="flex justify-center mb-8">
                <div className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= 1 ? 'bg-[#f77f00] text-white' : 'bg-[#e6d9cc] text-[#7a614a]'}`}>
                    1
                  </div>
                  <div className={`w-16 h-1 ${step >= 2 ? 'bg-[#f77f00]' : 'bg-[#e6d9cc]'}`}></div>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= 2 ? 'bg-[#f77f00] text-white' : 'bg-[#e6d9cc] text-[#7a614a]'}`}>
                    2
                  </div>
                  <div className={`w-16 h-1 ${step >= 3 ? 'bg-[#f77f00]' : 'bg-[#e6d9cc]'}`}></div>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= 3 ? 'bg-[#f77f00] text-white' : 'bg-[#e6d9cc] text-[#7a614a]'}`}>
                    3
                  </div>
                </div>
              </div>
              
              {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">{error}</div>}
              {loading && <div className="text-center py-4 text-[#7a614a]"><Translate text="processingRegistration" /></div>}
              {requiresEmailConfirmation && (
                <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-6">
                  <Translate text="confirmationEmailSent" />
                </div>
              )}
              
              <form onSubmit={handleSubmit}>
                {step === 1 && (
                  <div className="registration-step animate-float">
                    <h3 className="text-xl font-bold mb-6" style={{ color: darkText }}><Translate text="personalInformation" /></h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div className="md:col-span-2">
                        <label htmlFor="name" className="block text-lg font-semibold mb-2" style={{ color: darkText }}><Translate text="nameOrCompanyName" /></label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                          style={{ backgroundColor: "#fff", color: darkText }}
                        />
                      </div>
                      
                      <div className="md:col-span-2">
                        <label htmlFor="email" className="block text-lg font-semibold mb-2" style={{ color: darkText }}><Translate text="email" /></label>
                        <div className="flex gap-2">
                          <input
                            type="email"
                            id="email"
                            name="email"
                            className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                            style={{ backgroundColor: "#fff", color: darkText }}
                          />
                          <button 
                            type="button" 
                            className="px-4 py-3 rounded-lg font-semibold whitespace-nowrap"
                            style={{ backgroundColor: bhagwa, color: "#fff" }}
                            onClick={sendEmailOtp}
                            disabled={!formData.email}
                          >
                            <Translate text="sendOtp" />
                          </button>
                        </div>
                        {emailError && <div className="text-red-500 mt-2">{emailError}</div>}
                        {formData.email && (
                          <div className="flex gap-2 mt-3">
                            <input
                              type="text"
                              placeholder={t('enterOtp')}
                              className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              value={emailOtp}
                              onChange={(e) => setEmailOtp(e.target.value)}
                              style={{ backgroundColor: "#fff", color: darkText }}
                            />
                            <button 
                              type="button" 
                              className="px-4 py-3 rounded-lg font-semibold"
                              style={{ backgroundColor: "#7a614a", color: "#fff" }}
                              onClick={verifyEmailOtp}
                            >
                              <Translate text="verify" />
                            </button>
                          </div>
                        )}
                        {emailVerified && <div className="text-green-600 mt-2 font-semibold">✓ <Translate text="emailVerified" /></div>}
                      </div>
                      
                      <div>
                        <label htmlFor="password" className="block text-lg font-semibold mb-2" style={{ color: darkText }}><Translate text="password" /></label>
                        <input
                          type="password"
                          id="password"
                          name="password"
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={formData.password}
                          onChange={handleInputChange}
                          required
                          minLength="8"
                          style={{ backgroundColor: "#fff", color: darkText }}
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="whatsapp" className="block text-lg font-semibold mb-2" style={{ color: darkText }}><Translate text="whatsappNumber" /></label>
                        <div className="flex gap-2">
                          <input
                            type="tel"
                            id="whatsapp"
                            name="whatsapp"
                            className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={formData.whatsapp}
                            onChange={handleInputChange}
                            required
                            style={{ backgroundColor: "#fff", color: darkText }}
                          />
                          <button 
                            type="button" 
                            className="px-4 py-3 rounded-lg font-semibold whitespace-nowrap"
                            style={{ backgroundColor: bhagwa, color: "#fff" }}
                            onClick={sendWhatsappOtp}
                            disabled={!formData.whatsapp}
                          >
                            <Translate text="sendOtp" />
                          </button>
                        </div>
                        {formData.whatsapp && (
                          <div className="flex gap-2 mt-3">
                            <input
                              type="text"
                              placeholder={t('enterOtp')}
                              className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              value={whatsappOtp}
                              onChange={(e) => setWhatsappOtp(e.target.value)}
                              style={{ backgroundColor: "#fff", color: darkText }}
                            />
                            <button 
                              type="button" 
                              className="px-4 py-3 rounded-lg font-semibold"
                              style={{ backgroundColor: "#7a614a", color: "#fff" }}
                              onClick={verifyWhatsappOtp}
                            >
                              <Translate text="verify" />
                            </button>
                          </div>
                        )}
                        {whatsappVerified && <div className="text-green-600 mt-2 font-semibold">✓ <Translate text="whatsappVerified" /></div>}
                      </div>
                      
                      <div className="md:col-span-2">
                        <label htmlFor="address" className="block text-lg font-semibold mb-2" style={{ color: darkText }}><Translate text="address" /></label>
                        <textarea
                          id="address"
                          name="address"
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={formData.address}
                          onChange={handleInputChange}
                          rows="3"
                          required
                          style={{ backgroundColor: "#fff", color: darkText }}
                        ></textarea>
                      </div>
                      
                      <div>
                        <label htmlFor="zipCode" className="block text-lg font-semibold mb-2" style={{ color: darkText }}><Translate text="pincode" /></label>
                        <input
                          type="text"
                          id="zipCode"
                          name="zipCode"
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={formData.zipCode}
                          onChange={handleInputChange}
                          style={{ backgroundColor: "#fff", color: darkText }}
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="port" className="block text-lg font-semibold mb-2" style={{ color: darkText }}><Translate text="nearestPort" /></label>
                        <select
                          id="port"
                          name="port"
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={formData.port}
                          onChange={handleInputChange}
                          required
                          style={{ backgroundColor: "#fff", color: darkText }}
                        >
                          <option value=""><Translate text="selectPort" /></option>
                          {ports.map(port => (
                            <option key={port} value={port}>{port}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    
                    <div className="mt-6 p-4 rounded-lg" style={{ backgroundColor: creamCard }}>
                      <small className="block font-semibold mb-2" style={{ color: darkText }}><Translate text="passwordRequirements" /></small>
                      <ul className="space-y-1">
                        <li className={`flex items-center ${passwordErrors.includes('At least 8 characters') ? 'text-red-500' : 'text-green-600'}`}>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          <span><Translate text="atLeast8Characters" /></span>
                        </li>
                        <li className={`flex items-center ${passwordErrors.includes('One uppercase letter') ? 'text-red-500' : 'text-green-600'}`}>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          <span><Translate text="oneUppercaseLetter" /></span>
                        </li>
                        <li className={`flex items-center ${passwordErrors.includes('One special character') ? 'text-red-500' : 'text-green-600'}`}>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          <span><Translate text="oneSpecialCharacter" /></span>
                        </li>
                        <li className={`flex items-center ${passwordErrors.includes('One digit') ? 'text-red-500' : 'text-green-600'}`}>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          <span><Translate text="oneDigit" /></span>
                        </li>
                      </ul>
                    </div>
                    
                    <div className="flex justify-end mt-8">
                      <button 
                        type="button" 
                        className="px-6 py-3 rounded-full font-bold"
                        style={{ backgroundColor: bhagwa, color: "#fff" }}
                        onClick={handleNextStep1}
                      >
                        <Translate text="next" />
                      </button>
                    </div>
                  </div>
                )}
                
                {step === 2 && (
                  <div className="registration-step animate-float">
                    <h3 className="text-xl font-bold mb-6" style={{ color: darkText }}><Translate text="selectWorkClass" /></h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-8">
                      {workClasses.map(workClass => (
                        <div 
                          key={workClass.id}
                          className={`p-4 rounded-xl text-center cursor-pointer transition-all ${formData.workClass === workClass.id ? 'ring-2 ring-[#f77f00] bg-[#fff9f2]' : 'bg-white border border-gray-200'}`}
                          onClick={() => setFormData(prev => ({...prev, workClass: workClass.id}))}
                        >
                          <div className="text-3xl mb-2">{workClass.icon}</div>
                          <div className="font-semibold" style={{ color: darkText }}>{workClass.name}</div>
                        </div>
                      ))}
                    </div>
                    
                    {formData.workClass && (
                      <div className="mb-8">
                        <label className="block text-lg font-semibold mb-2" style={{ color: darkText }}><Translate text="uploadDocuments" /></label>
                        <input
                          type="file"
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          onChange={handleDocumentUpload}
                          multiple
                          style={{ backgroundColor: "#fff", color: darkText }}
                        />
                        <div className="mt-3 p-4 rounded-lg" style={{ backgroundColor: creamCard }}>
                          <p className="text-[#7a614a]">{getDocumentInstructions(formData.workClass)}</p>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex justify-between mt-8">
                      <button 
                        type="button" 
                        className="px-6 py-3 rounded-full font-semibold"
                        style={{ backgroundColor: "#e6d9cc", color: darkText }}
                        onClick={() => setStep(1)}
                      >
                        <Translate text="previous" />
                      </button>
                      <button 
                        type="button" 
                        className="px-6 py-3 rounded-full font-bold"
                        style={{ backgroundColor: bhagwa, color: "#fff" }}
                        onClick={handleNextStep2}
                      >
                        <Translate text="next" />
                      </button>
                    </div>
                  </div>
                )}
                
                {step === 3 && (
                  <div className="registration-step animate-float">
                    <h3 className="text-xl font-bold mb-6" style={{ color: darkText }}><Translate text="declarationAndConsent" /></h3>
                    <div className="p-6 rounded-xl mb-8" style={{ backgroundColor: creamCard }}>
                      <p className="mb-4" style={{ color: darkText }}>
                        <Translate text="iAcceptThe" /> <strong>{getRoleName(formData.workClass)}</strong> <Translate text="agreementAndPrivacyPolicy" />
                      </p>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="declaration"
                          name="declaration"
                          checked={formData.declaration}
                          onChange={handleInputChange}
                          className="w-5 h-5 mr-3"
                        />
                        <label htmlFor="declaration" className="font-semibold" style={{ color: darkText }}>
                          <Translate text="agreeToTerms" />
                        </label>
                      </div>
                    </div>
                    
                    <div className="flex justify-between mt-8">
                      <button 
                        type="button" 
                        className="px-6 py-3 rounded-full font-semibold"
                        style={{ backgroundColor: "#e6d9cc", color: darkText }}
                        onClick={() => setStep(2)}
                      >
                        <Translate text="previous" />
                      </button>
                      <button 
                        type="submit" 
                        className="px-6 py-3 rounded-full font-bold"
                        style={{ backgroundColor: bhagwa, color: "#fff" }}
                        disabled={loading}
                      >
                        {loading ? <Translate text="submitting" /> : <Translate text="submitRegistration" />}
                      </button>
                    </div>
                  </div>
                )}
              </form>
            </div>
          </div>
          
          <div className="text-center mt-8">
            <p className="text-[#7a614a]">
              <Translate text="alreadyHaveAccount" />{' '}
              <button 
                onClick={() => navigate('/login')}
                className="font-semibold text-[#f77f00] hover:underline"
              >
                <Translate text="login" />
              </button>
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-8" style={{ backgroundColor: "#2b2017", color: "#f8efe3" }}>
        <div className="container mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col items-center">
            <img 
              src="/logo2.png" 
              alt="MarsaFyi Logo" 
              style={{ width: 170, height: 100, borderRadius: 0, border: 'none' }}
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

const getRoleName = (roleId) => {
  const roles = {
    'seller': 'Seller',
    'buyer': 'Buyer',
    'surveyor': 'Surveyor',
    'insurance': 'Insurance Agent',
    'transporter': 'Transporter',
    'logistics': 'Logistics',
    'cha': 'CHA'
  };
  return roles[roleId] || 'User';
};

const getDocumentInstructions = (workClass) => {
  const instructions = {
    'seller': 'Please upload your GST/VAT/Sales Tax government number and document.',
    'buyer': 'Please upload your GST/VAT/Sales Tax government number and document.',
    'surveyor': 'Please upload your company license number and experience document.',
    'transporter': 'Please upload your national/regional freight carrying permit number and document.',
    'insurance': 'Please upload your agency code and license copy.',
    'logistics': 'Please upload your international freight transport permit and document.',
    'cha': 'Please upload your license number and registration.'
  };
  return instructions[workClass] || 'Please upload the required documents for your role.';
};

export default Register;