import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../App.css';

const Login = () => {
  const [vendorCode, setVendorCode] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!vendorCode || !password) {
      setError('Please enter both Vendor Code and Password');
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
        // Login successful
        login(data.user, data.user.role);
        
        // Redirect based on role
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
  
  const getRoleFromVendorCode = (code) => {
    if (code.startsWith('S-')) return 'seller';
    if (code.startsWith('B-')) return 'buyer';
    if (code.startsWith('C-')) return 'captain';
    if (code.startsWith('A-')) return 'admin';
    if (code.startsWith('H-')) return 'hr';
    if (code.startsWith('ACC-')) return 'accountant';
    if (code.startsWith('ARB-')) return 'arbitrator';
    if (code.startsWith('SUR-')) return 'surveyor';
    if (code.startsWith('INS-')) return 'insurance';
    if (code.startsWith('TRN-')) return 'transporter';
    if (code.startsWith('LOG-')) return 'logistics';
    if (code.startsWith('CHA-')) return 'cha';
    return 'buyer';
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Login to MarsaFyi</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="vendorCode" className="form-label">Vendor Code or Email</label>
            <input
              type="text"
              id="vendorCode"
              className="form-control"
              value={vendorCode}
              onChange={(e) => setVendorCode(e.target.value)}
              placeholder="Enter your Vendor Code or Email"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password" className="form-label">Password</label>
            <input
              type="password"
              id="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your Password"
              required
            />
          </div>
          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={loading}
            style={{ width: '100%' }}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <div className="auth-links">
          <p>Don't have an account? <a href="/register">Register</a></p>
          <p><a href="/">Back to Main Dashboard</a></p>
        </div>
      </div>
    </div>
  );
};

export default Login;