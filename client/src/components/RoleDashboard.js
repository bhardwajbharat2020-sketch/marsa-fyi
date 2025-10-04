import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const RoleDashboard = () => {
  const { userRole } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (userRole) {
      // Redirect to role-specific dashboard based on user role
      switch (userRole) {
        case 'ADM':
          navigate('/dashboard/admin');
          break;
        case 'HR':
          navigate('/dashboard/hr');
          break;
        case 'ACC':
          navigate('/dashboard/accountant');
          break;
        case 'CAPT':
          navigate('/dashboard/captain');
          break;
        case 'SELL':
          navigate('/dashboard/seller');
          break;
        case 'BUY':
          navigate('/dashboard/buyer');
          break;
        case 'SUR':
          navigate('/dashboard/surveyor');
          break;
        case 'ARB':
          navigate('/dashboard/arbitrator');
          break;
        case 'INS':
          navigate('/dashboard/insurance');
          break;
        case 'TRN':
          navigate('/dashboard/transporter');
          break;
        case 'LOG':
          navigate('/dashboard/logistics');
          break;
        case 'CHA':
          navigate('/dashboard/cha');
          break;
        default:
          navigate('/dashboard');
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