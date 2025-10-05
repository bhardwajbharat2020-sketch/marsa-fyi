import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AccessDenied from './AccessDenied';

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

  // User doesn't have permission, show access denied page
  return <AccessDenied />;
};

export default ProtectedRoute;