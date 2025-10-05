import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';

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
  const navigate = useNavigate();

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
    <div className="auth-container">
      <div className="auth-card">
        <h2>Register for MarsaFyi</h2>
        
        {/* Progress Indicator */}
        <div className="progress-indicator">
          <div className={`step ${step >= 1 ? 'active' : ''}`}>1</div>
          <div className={`step ${step >= 2 ? 'active' : ''}`}>2</div>
          <div className={`step ${step >= 3 ? 'active' : ''}`}>3</div>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        {loading && <div className="loading-message">Processing registration...</div>}
        {requiresEmailConfirmation && (
          <div className="info-message">
            A confirmation email has been sent to your email address. Please check your inbox and follow the instructions to complete your registration.
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          {step === 1 && (
            <div className="registration-step">
              <h3>Personal Information</h3>
              <div className="form-group">
                <label htmlFor="name" className="form-label">Name / Company Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="form-control"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="email" className="form-label">Email *</label>
                <div className="input-group">
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className="form-control"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                  <button 
                    type="button" 
                    className="btn btn-outline"
                    onClick={sendEmailOtp}
                    disabled={!formData.email}
                  >
                    Send OTP
                  </button>
                </div>
                {emailError && <div className="error-message">{emailError}</div>}
                {formData.email && (
                  <div className="otp-verification">
                    <input
                      type="text"
                      placeholder="Enter OTP"
                      className="form-control"
                      value={emailOtp}
                      onChange={(e) => setEmailOtp(e.target.value)}
                    />
                    <button 
                      type="button" 
                      className="btn btn-primary"
                      onClick={verifyEmailOtp}
                    >
                      Verify
                    </button>
                  </div>
                )}
                {emailVerified && <div className="verification-success">✓ Email Verified</div>}
              </div>
              
              <div className="form-group">
                <label htmlFor="password" className="form-label">Password *</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  className="form-control"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  minLength="8"
                />
                <div className="password-requirements">
                  <small className="form-text">Password must contain:</small>
                  <ul className="password-requirements-list">
                    <li className={passwordErrors.includes('At least 8 characters') ? 'invalid' : 'valid'}>
                      At least 8 characters
                    </li>
                    <li className={passwordErrors.includes('One uppercase letter') ? 'invalid' : 'valid'}>
                      One uppercase letter
                    </li>
                    <li className={passwordErrors.includes('One special character') ? 'invalid' : 'valid'}>
                      One special character
                    </li>
                    <li className={passwordErrors.includes('One digit') ? 'invalid' : 'valid'}>
                      One digit
                    </li>
                  </ul>
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="whatsapp" className="form-label">WhatsApp Number *</label>
                <div className="input-group">
                  <input
                    type="tel"
                    id="whatsapp"
                    name="whatsapp"
                    className="form-control"
                    value={formData.whatsapp}
                    onChange={handleInputChange}
                    required
                  />
                  <button 
                    type="button" 
                    className="btn btn-outline"
                    onClick={sendWhatsappOtp}
                    disabled={!formData.whatsapp}
                  >
                    Send OTP
                  </button>
                </div>
                {formData.whatsapp && (
                  <div className="otp-verification">
                    <input
                      type="text"
                      placeholder="Enter OTP"
                      className="form-control"
                      value={whatsappOtp}
                      onChange={(e) => setWhatsappOtp(e.target.value)}
                    />
                    <button 
                      type="button" 
                      className="btn btn-primary"
                      onClick={verifyWhatsappOtp}
                    >
                      Verify
                    </button>
                  </div>
                )}
                {whatsappVerified && <div className="verification-success">✓ WhatsApp Verified</div>}
              </div>
              
              <div className="form-group">
                <label htmlFor="address" className="form-label">Address *</label>
                <textarea
                  id="address"
                  name="address"
                  className="form-control"
                  value={formData.address}
                  onChange={handleInputChange}
                  rows="3"
                  required
                ></textarea>
              </div>
              
              <div className="form-group">
                <label htmlFor="zipCode" className="form-label">Zip Code</label>
                <input
                  type="text"
                  id="zipCode"
                  name="zipCode"
                  className="form-control"
                  value={formData.zipCode}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="port" className="form-label">Nearest Commercially Active Port *</label>
                <select
                  id="port"
                  name="port"
                  className="form-control"
                  value={formData.port}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select a port</option>
                  {ports.map(port => (
                    <option key={port} value={port}>{port}</option>
                  ))}
                </select>
              </div>
              
              <div className="form-navigation">
                <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={handleNextStep1}
                >
                  Next
                </button>
              </div>
            </div>
          )}
          
          {step === 2 && (
            <div className="registration-step">
              <h3>Select Work Class *</h3>
              <div className="work-classes">
                {workClasses.map(workClass => (
                  <div 
                    key={workClass.id}
                    className={`work-class-card ${formData.workClass === workClass.id ? 'selected' : ''}`}
                    onClick={() => setFormData(prev => ({...prev, workClass: workClass.id}))}
                  >
                    <div className="work-class-icon">{workClass.icon}</div>
                    <div className="work-class-name">{workClass.name}</div>
                  </div>
                ))}
              </div>
              
              {formData.workClass && (
                <div className="form-group">
                  <label className="form-label">Upload Required Documents</label>
                  <input
                    type="file"
                    className="form-control"
                    onChange={handleDocumentUpload}
                    multiple
                  />
                  <div className="document-instructions">
                    {getDocumentInstructions(formData.workClass)}
                  </div>
                </div>
              )}
              
              <div className="form-navigation">
                <button 
                  type="button" 
                  className="btn btn-outline"
                  onClick={() => setStep(1)}
                >
                  Previous
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={handleNextStep2}
                >
                  Next
                </button>
              </div>
            </div>
          )}
          
          {step === 3 && (
            <div className="registration-step">
              <h3>Declaration and Consent *</h3>
              <div className="declaration-box">
                <p>
                  I accept the <strong>{getRoleName(formData.workClass)}</strong> agreement and 
                  uphold the platform and company's privacy policy.
                </p>
                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="declaration"
                      checked={formData.declaration}
                      onChange={handleInputChange}
                    />
                    I agree to the terms and conditions
                  </label>
                </div>
              </div>
              
              <div className="form-navigation">
                <button 
                  type="button" 
                  className="btn btn-outline"
                  onClick={() => setStep(2)}
                >
                  Previous
                </button>
                <button 
                  type="submit" 
                  className="btn btn-success"
                  disabled={loading}
                >
                  {loading ? 'Submitting...' : 'Submit Registration'}
                </button>
              </div>
            </div>
          )}
        </form>
        
        <div className="auth-links">
          <p>Already have an account? <a href="/login">Login</a></p>
          <p><a href="/">Back to Main Dashboard</a></p>
        </div>
      </div>
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

//forcing a fresh update for vercel deployment