import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { userRole, currentUser } = useAuth();

  // If user is not logged in, redirect to login
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // If allowedRoles is not specified, allow access (public route)
  if (!allowedRoles) {
    return children;
  }

  // If userRole is not set, redirect to role selection
  if (!userRole) {
    return <Navigate to="/role-switch" replace />;
  }

  // Check if user's role is in the allowed roles
  if (allowedRoles.includes(userRole)) {
    return children;
  }

  // User doesn't have permission, redirect to their own dashboard
  switch (userRole) {
    case 'admin':
      return <Navigate to="/dashboard/admin" replace />;
    case 'hr':
      return <Navigate to="/dashboard/hr" replace />;
    case 'accountant':
      return <Navigate to="/dashboard/accountant" replace />;
    case 'captain':
      return <Navigate to="/dashboard/captain" replace />;
    case 'seller':
      return <Navigate to="/dashboard/seller" replace />;
    case 'buyer':
      return <Navigate to="/dashboard/buyer" replace />;
    case 'surveyor':
      return <Navigate to="/dashboard/surveyor" replace />;
    case 'arbitrator':
      return <Navigate to="/dashboard/arbitrator" replace />;
    case 'insurance':
      return <Navigate to="/dashboard/insurance" replace />;
    case 'transporter':
      return <Navigate to="/dashboard/transporter" replace />;
    case 'logistics':
      return <Navigate to="/dashboard/logistics" replace />;
    case 'cha':
      return <Navigate to="/dashboard/cha" replace />;
    default:
      return <Navigate to="/dashboard" replace />;
  }
};

export default ProtectedRoute;