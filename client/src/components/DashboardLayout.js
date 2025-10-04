import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../App.css';

const DashboardLayout = ({ children, title, role }) => {
  const { currentUser, userRole, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getMenuItems = () => {
    switch(role) {
      case 'seller':
        return getSellerMenuItems();
      case 'buyer':
        return getBuyerMenuItems();
      case 'captain':
        return getCaptainMenuItems();
      case 'admin':
        return getAdminMenuItems();
      case 'hr':
        return getHrMenuItems();
      case 'accountant':
        return getAccountantMenuItems();
      case 'arbitrator':
        return getArbitratorMenuItems();
      case 'surveyor':
        return getSurveyorMenuItems();
      case 'insurance':
        return getInsuranceMenuItems();
      case 'transporter':
        return getTransporterMenuItems();
      case 'logistics':
        return getLogisticsMenuItems();
      case 'cha':
        return getCHAMenuItems();
      default:
        return getDefaultMenuItems();
    }
  };

  const getDefaultMenuItems = () => [
    { name: 'Dashboard', path: `/dashboard/${role}`, icon: '📊' },
    { name: 'Profile', path: `/dashboard/${role}/profile`, icon: '👤' },
    { name: 'Notifications', path: `/dashboard/${role}/notifications`, icon: '🔔' },
    { name: 'Settings', path: `/dashboard/${role}/settings`, icon: '⚙️' }
  ];

  const getSellerMenuItems = () => [
    { name: 'My Catalogs', path: '/dashboard/seller/catalogs', icon: '📚' },
    { name: 'DPO Management', path: '/dashboard/seller/dpo', icon: '📋' },
    { name: 'Orders', path: '/dashboard/seller/orders', icon: '📦' },
    { name: 'Payments', path: '/dashboard/seller/payments', icon: '💰' },
    { name: 'Virtual Currency', path: '/dashboard/seller/currency', icon: '🪙' },
    ...getDefaultMenuItems()
  ];

  const getBuyerMenuItems = () => [
    { name: 'Marsa Mart', path: '/dashboard/buyer/marsa-mart', icon: '🏪' },
    { name: 'My RFQs', path: '/dashboard/buyer/rfqs', icon: '📝' },
    { name: 'My Surveys', path: '/dashboard/buyer/surveys', icon: '🔍' },
    { name: 'My Orders', path: '/dashboard/buyer/orders', icon: '📦' },
    { name: 'My Invoices', path: '/dashboard/buyer/invoices', icon: '🧾' },
    { name: 'Disputes', path: '/dashboard/buyer/disputes', icon: '⚖️' },
    { name: 'Virtual Currency', path: '/dashboard/buyer/currency', icon: '🪙' },
    ...getDefaultMenuItems()
  ];

  const getCaptainMenuItems = () => [
    { name: 'Role Management', path: '/dashboard/captain/roles', icon: '🔑' },
    { name: 'Catalog Management', path: '/dashboard/captain/catalogs', icon: '📚' },
    { name: 'DPQ Management', path: '/dashboard/captain/dpq', icon: '📋' },
    { name: 'DPO Management', path: '/dashboard/captain/dpo', icon: '📋' },
    { name: 'Disputes', path: '/dashboard/captain/disputes', icon: '⚖️' },
    { name: 'Virtual Currency', path: '/dashboard/captain/currency', icon: '🪙' },
    ...getDefaultMenuItems()
  ];

  const getAdminMenuItems = () => [
    { name: 'Catalog Approval', path: '/dashboard/admin/catalogs', icon: '✅' },
    { name: 'Survey Offers', path: '/dashboard/admin/surveys', icon: '🔍' },
    { name: 'Dispute Review', path: '/dashboard/admin/disputes', icon: '⚖️' },
    { name: 'Virtual Currency', path: '/dashboard/admin/currency', icon: '🪙' },
    ...getDefaultMenuItems()
  ];

  const getHrMenuItems = () => [
    { name: 'Document Verification', path: '/dashboard/hr/documents', icon: '📄' },
    { name: 'Contact Requests', path: '/dashboard/hr/contacts', icon: '📞' },
    { name: 'User Management', path: '/dashboard/hr/users', icon: '👥' },
    { name: 'Virtual Currency', path: '/dashboard/hr/currency', icon: '🪙' },
    ...getDefaultMenuItems()
  ];

  const getAccountantMenuItems = () => [
    { name: 'Payment Management', path: '/dashboard/accountant/payments', icon: '💳' },
    { name: 'Invoice Generation', path: '/dashboard/accountant/invoices', icon: '🧾' },
    { name: 'Dispute Review', path: '/dashboard/accountant/disputes', icon: '⚖️' },
    { name: 'Virtual Currency', path: '/dashboard/accountant/currency', icon: '🪙' },
    ...getDefaultMenuItems()
  ];

  const getArbitratorMenuItems = () => [
    { name: 'Case Management', path: '/dashboard/arbitrator/cases', icon: '📁' },
    { name: 'Evidence Review', path: '/dashboard/arbitrator/evidence', icon: '🔍' },
    { name: 'Messaging', path: '/dashboard/arbitrator/messages', icon: '💬' },
    { name: 'Virtual Currency', path: '/dashboard/arbitrator/currency', icon: '🪙' },
    ...getDefaultMenuItems()
  ];

  const getSurveyorMenuItems = () => [
    { name: 'Survey Requests', path: '/dashboard/surveyor/requests', icon: '📋' },
    { name: 'Survey Reports', path: '/dashboard/surveyor/reports', icon: '📝' },
    { name: 'Virtual Currency', path: '/dashboard/surveyor/currency', icon: '🪙' },
    ...getDefaultMenuItems()
  ];

  const getInsuranceMenuItems = () => [
    { name: 'Policy Requests', path: '/dashboard/insurance/policies', icon: '🛡️' },
    { name: 'Policy Documents', path: '/dashboard/insurance/documents', icon: '📄' },
    { name: 'Virtual Currency', path: '/dashboard/insurance/currency', icon: '🪙' },
    ...getDefaultMenuItems()
  ];

  const getTransporterMenuItems = () => [
    { name: 'Work Orders', path: '/dashboard/transporter/orders', icon: '🚚' },
    { name: 'Tracking', path: '/dashboard/transporter/tracking', icon: '📍' },
    { name: 'Virtual Currency', path: '/dashboard/transporter/currency', icon: '🪙' },
    ...getDefaultMenuItems()
  ];

  const getLogisticsMenuItems = () => [
    { name: 'Work Orders', path: '/dashboard/logistics/orders', icon: '📦' },
    { name: 'Tracking', path: '/dashboard/logistics/tracking', icon: '📍' },
    { name: 'Virtual Currency', path: '/dashboard/logistics/currency', icon: '🪙' },
    ...getDefaultMenuItems()
  ];

  const getCHAMenuItems = () => [
    { name: 'Service Requests', path: '/dashboard/cha/requests', icon: '📋' },
    { name: 'Fee Offers', path: '/dashboard/cha/fees', icon: '💰' },
    { name: 'Work Orders', path: '/dashboard/cha/orders', icon: '📄' },
    { name: 'Virtual Currency', path: '/dashboard/cha/currency', icon: '🪙' },
    ...getDefaultMenuItems()
  ];

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <div className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <h2>{sidebarCollapsed ? 'MF' : 'MarsaFyi'}</h2>
          <button className="sidebar-toggle" onClick={toggleSidebar}>
            {sidebarCollapsed ? '»' : '«'}
          </button>
        </div>
        
        <nav className="sidebar-menu">
          {getMenuItems().map((item, index) => (
            <div 
              key={index} 
              className="menu-item"
              onClick={() => navigate(item.path)}
            >
              <span className="menu-icon">{item.icon}</span>
              {!sidebarCollapsed && <span className="menu-text">{item.name}</span>}
            </div>
          ))}
        </nav>
        
        <div className="sidebar-footer">
          {!sidebarCollapsed && (
            <div className="user-info">
              <div className="user-name">{currentUser?.name || 'User'}</div>
              <div className="user-role">{getRoleName(userRole)}</div>
            </div>
          )}
          <button className="btn btn-danger" onClick={handleLogout}>
            {sidebarCollapsed ? '🚪' : 'Logout'}
          </button>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="main-content">
        <div className="dashboard-header">
          <h1>{title}</h1>
          <div className="header-actions">
            <div className="role-selector">
              <span>Role:</span>
              <div className="role-badge">{getRoleName(userRole)}</div>
            </div>
            <div className="notification-icon">
              <span>🔔</span>
              <div className="notification-badge">3</div>
            </div>
          </div>
        </div>
        
        {children}
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

export default DashboardLayout;