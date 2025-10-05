import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const RoleDashboard = () => {
  const { userRole } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (userRole) {
      // Redirect to role-specific dashboard based on user role
      // Using full role names instead of codes
      switch (userRole) {
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
          navigate('/dashboard/ccaptain');
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
          navigate('/dashboard/buyer'); // Default to buyer dashboard
      }
    }
  }, [userRole, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Redirecting to your dashboard...</h2>
        <p className="text-gray-600">Please wait while we redirect you to your role-specific dashboard.</p>
      </div>
    </div>
  );
};

export default RoleDashboard;