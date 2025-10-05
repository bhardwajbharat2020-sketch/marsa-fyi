import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const AccessDenied = () => {
  const { userRole } = useAuth();
  const navigate = useNavigate();

  // Theme colors to match homepage
  const bhagwa = "#f77f00";
  const cream = "#f6efe6";
  const creamCard = "#efe6d9";
  const darkText = "#5a4632";

  const handleGoBack = () => {
    // Navigate to user's own dashboard
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
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: cream }}>
      <div 
        className="rounded-xl shadow-lg p-8 max-w-md w-full text-center"
        style={{ backgroundColor: "#fff" }}
      >
        <div className="mb-6">
          <div 
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: "#fee2e2" }}
          >
            <svg 
              className="w-8 h-8" 
              style={{ color: "#ef4444" }} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              ></path>
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-2" style={{ color: darkText }}>Access Denied</h1>
          <p className="text-lg" style={{ color: "#7a614a" }}>
            You don't have permission to view this dashboard.
          </p>
        </div>
        
        <div className="mb-6">
          <p style={{ color: darkText }}>
            As a <span className="font-semibold">{userRole}</span>, you can only access your own dashboard.
          </p>
        </div>
        
        <div className="flex flex-col gap-3">
          <button
            onClick={handleGoBack}
            className="px-4 py-3 rounded-lg font-semibold w-full"
            style={{ backgroundColor: bhagwa, color: "#fff" }}
          >
            Go to My Dashboard
          </button>
          
          <button
            onClick={() => navigate('/')}
            className="px-4 py-3 rounded-lg font-semibold w-full"
            style={{ backgroundColor: "#fff", color: darkText, border: "1px solid #d9cfc1" }}
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccessDenied;