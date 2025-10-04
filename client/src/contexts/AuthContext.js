import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [authToken, setAuthToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('marsafyi_user');
    const storedRole = localStorage.getItem('marsafyi_role');
    const storedToken = localStorage.getItem('marsafyi_token');
    
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
    
    if (storedRole) {
      setUserRole(storedRole);
    }
    
    if (storedToken) {
      setAuthToken(storedToken);
    }
    
    setLoading(false);
  }, []);

  function login(userData, role, token = null) {
    setCurrentUser(userData);
    setUserRole(role);
    if (token) {
      setAuthToken(token);
      localStorage.setItem('marsafyi_token', token);
    }
    localStorage.setItem('marsafyi_user', JSON.stringify(userData));
    localStorage.setItem('marsafyi_role', role);
  }

  function logout() {
    setCurrentUser(null);
    setUserRole(null);
    setAuthToken(null);
    localStorage.removeItem('marsafyi_user');
    localStorage.removeItem('marsafyi_role');
    localStorage.removeItem('marsafyi_token');
  }

  function switchRole(newRole) {
    setUserRole(newRole);
    localStorage.setItem('marsafyi_role', newRole);
  }

  const value = {
    currentUser,
    userRole,
    authToken,
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