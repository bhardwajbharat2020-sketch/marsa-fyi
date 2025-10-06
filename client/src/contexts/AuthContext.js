import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [authToken, setAuthToken] = useState(null);
  const [vendorCode, setVendorCode] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // Initialize auth state from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('marsafyi_user');
    const storedRole = localStorage.getItem('marsafyi_role');
    const storedToken = localStorage.getItem('marsafyi_token');
    const storedVendorCode = localStorage.getItem('marsafyi_vendor_code');
    
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
    
    if (storedRole) {
      setUserRole(storedRole);
    }
    
    if (storedToken) {
      setAuthToken(storedToken);
    }
    
    if (storedVendorCode) {
      setVendorCode(storedVendorCode);
    }
    
    setLoading(false);
  }, []);

  function login(userData, role, token = null) {
    console.log('AuthContext login called with:', { userData, role, token });
    setCurrentUser(userData);
    setUserRole(role);
    setVendorCode(userData.vendor_code);
    if (token) {
      setAuthToken(token);
      localStorage.setItem('marsafyi_token', token);
    }
    localStorage.setItem('marsafyi_user', JSON.stringify(userData));
    localStorage.setItem('marsafyi_role', role);
    localStorage.setItem('marsafyi_vendor_code', userData.vendor_code);
    
    // Don't redirect here - let the calling component handle redirection
    // redirectToRoleDashboard(role);
  }

  function logout() {
    setCurrentUser(null);
    setUserRole(null);
    setAuthToken(null);
    setVendorCode(null);
    localStorage.removeItem('marsafyi_user');
    localStorage.removeItem('marsafyi_role');
    localStorage.removeItem('marsafyi_token');
    localStorage.removeItem('marsafyi_vendor_code');
    
    // Only navigate if we're not already on the login page
    if (location.pathname !== '/login') {
      navigate('/login');
    }
  }

  function switchRole(newRole) {
    setUserRole(newRole);
    localStorage.setItem('marsafyi_role', newRole);
    redirectToRoleDashboard(newRole);
  }
  
  function redirectToRoleDashboard(role) {
    // Redirect to role-specific dashboard based on user role
    switch (role) {
      case 'admin':
        navigate('/dashboard/admin');
        break;
      case 'hr':
        navigate('/dashboard/hr');
        break;
      case 'accountant':
        navigate('/dashboard/accountant');
        break;
      case 'captain':
        navigate('/dashboard/captain');
        break;
      case 'seller':
        navigate('/dashboard/seller');
        break;
      case 'buyer':
        navigate('/dashboard/buyer');
        break;
      case 'surveyor':
        navigate('/dashboard/surveyor');
        break;
      case 'arbitrator':
        navigate('/dashboard/arbitrator');
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
        navigate('/dashboard');
    }
  }

  const value = {
    currentUser,
    userRole,
    authToken,
    vendorCode,
    login,
    logout,
    switchRole
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}