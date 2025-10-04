import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../App.css';

const RoleSwitcher = () => {
  const { currentUser, userRole, switchRole } = useAuth();
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState(userRole);

  const roles = [
    { id: 'seller', name: 'Seller Dashboard', icon: '🏪' },
    { id: 'buyer', name: 'Buyer Dashboard', icon: '🛒' },
    { id: 'captain', name: 'Captain Panel', icon: '👑' },
    { id: 'admin', name: 'Admin Panel', icon: '⚙️' },
    { id: 'hr', name: 'HR Panel', icon: '👥' },
    { id: 'accountant', name: 'Accountant Panel', icon: '💰' },
    { id: 'arbitrator', name: 'Arbitrator Panel', icon: '⚖️' },
    { id: 'surveyor', name: 'Surveyor Panel', icon: '🔍' },
    { id: 'insurance', name: 'Insurance Agent Panel', icon: '🛡️' },
    { id: 'transporter', name: 'Transporter Panel', icon: '🚚' },
    { id: 'logistics', name: 'Logistics Panel', icon: '📦' },
    { id: 'cha', name: 'CHA Panel', icon: '🏛️' }
  ];

  const handleSwitchRole = () => {
    switchRole(selectedRole);
    
    // Navigate to the appropriate dashboard
    switch(selectedRole) {
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
  };

  return (
    <div className="dashboard-container">
      <div className="main-content">
        <div className="dashboard-header">
          <h1>Switch Role</h1>
          <div className="role-badge">
            Current Role: {getRoleName(userRole)}
          </div>
        </div>
        
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Select Role to Switch To</h2>
          </div>
          <div className="role-selection">
            <p>Select a role below to switch your dashboard view:</p>
            
            <div className="roles-grid">
              {roles.map(role => (
                <div 
                  key={role.id}
                  className={`role-card ${selectedRole === role.id ? 'selected' : ''}`}
                  onClick={() => setSelectedRole(role.id)}
                >
                  <div className="role-icon">{role.icon}</div>
                  <div className="role-name">{role.name}</div>
                </div>
              ))}
            </div>
            
            <div className="form-navigation" style={{ marginTop: '30px' }}>
              <button 
                className="btn btn-primary"
                onClick={handleSwitchRole}
                disabled={!selectedRole || selectedRole === userRole}
              >
                Switch to {getRoleName(selectedRole)} Dashboard
              </button>
              <button 
                className="btn btn-outline"
                onClick={() => navigate(-1)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const getRoleName = (roleId) => {
  const roles = {
    'seller': 'Seller',
    'buyer': 'Buyer',
    'captain': 'Captain',
    'admin': 'Admin',
    'hr': 'HR',
    'accountant': 'Accountant',
    'arbitrator': 'Arbitrator',
    'surveyor': 'Surveyor',
    'insurance': 'Insurance Agent',
    'transporter': 'Transporter',
    'logistics': 'Logistics',
    'cha': 'CHA'
  };
  return roles[roleId] || 'User';
};

export default RoleSwitcher;