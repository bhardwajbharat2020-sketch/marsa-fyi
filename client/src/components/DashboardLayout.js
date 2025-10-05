import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { User, LogOut, Menu, X } from 'lucide-react';
import '../App.css';

const DashboardLayout = ({ children, title, role }) => {
  const { currentUser, userRole, vendorCode, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Theme colors to match homepage
  const bhagwa = "#f77f00";
  const cream = "#f6efe6";
  const creamCard = "#efe6d9";
  const darkText = "#5a4632";

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
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
    <div className="min-h-screen" style={{ backgroundColor: cream, color: darkText }}>
      {/* Mobile menu button */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button
          onClick={toggleMobileMenu}
          className="p-2 rounded-md"
          style={{ backgroundColor: creamCard }}
        >
          {mobileMenuOpen ? <X size={24} style={{ color: darkText }} /> : <Menu size={24} style={{ color: darkText }} />}
        </button>
      </div>

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 md:hidden"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          onClick={toggleMobileMenu}
        >
          <div 
            className="fixed left-0 top-0 h-full w-64 overflow-y-auto"
            style={{ backgroundColor: "#2b2017" }}
            onClick={e => e.stopPropagation()}
          >
            <div className="p-4 border-b" style={{ borderColor: "#3a2b20" }}>
              <h2 className="text-xl font-bold" style={{ color: "#f8efe3" }}>MarsaFyi</h2>
            </div>
            <nav className="p-2">
              {getMenuItems().map((item, index) => (
                <div 
                  key={index} 
                  className={`p-3 rounded-md mb-1 flex items-center cursor-pointer ${
                    location.pathname === item.path ? 'font-semibold' : ''
                  }`}
                  onClick={() => {
                    navigate(item.path);
                    setMobileMenuOpen(false);
                  }}
                  style={{ 
                    backgroundColor: location.pathname === item.path ? "#3a2b20" : "transparent",
                    color: "#f8efe3"
                  }}
                >
                  <span className="mr-3 text-lg">{item.icon}</span>
                  <span>{item.name}</span>
                </div>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className={`hidden md:block fixed h-full z-30 transition-all duration-300 ${
        sidebarCollapsed ? 'w-20' : 'w-64'
      }`} style={{ backgroundColor: "#2b2017" }}>
        <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: "#3a2b20" }}>
          {!sidebarCollapsed && (
            <h2 className="text-xl font-bold" style={{ color: "#f8efe3" }}>MarsaFyi</h2>
          )}
          <button 
            className="p-1 rounded-md"
            onClick={toggleSidebar}
            style={{ color: "#f8efe3" }}
          >
            {sidebarCollapsed ? '»' : '«'}
          </button>
        </div>
        <nav className="p-2">
          {getMenuItems().map((item, index) => (
            <div 
              key={index} 
              className={`p-3 rounded-md mb-1 flex items-center cursor-pointer ${
                location.pathname === item.path ? 'font-semibold' : ''
              }`}
              onClick={() => navigate(item.path)}
              style={{ 
                backgroundColor: location.pathname === item.path ? "#3a2b20" : "transparent",
                color: "#f8efe3"
              }}
            >
              <span className="text-lg mr-3">{item.icon}</span>
              {!sidebarCollapsed && <span>{item.name}</span>}
            </div>
          ))}
        </nav>
      </div>
      
      {/* Main Content */}
      <div 
        className={`transition-all duration-300 ${
          sidebarCollapsed ? 'md:ml-20' : 'md:ml-64'
        }`}
      >
        {/* Top Navigation Bar */}
        <div 
          className="sticky top-0 z-20 shadow-sm"
          style={{ backgroundColor: cream }}
        >
          <div className="flex justify-between items-center p-4">
            <div>
              <h1 className="text-xl font-bold" style={{ color: darkText }}>{title}</h1>
              {/* Display role code for all roles except buyer */}
              {role !== 'buyer' && vendorCode && (
                <div className="text-sm" style={{ color: "#7a614a" }}>
                  Role Code: <strong>{vendorCode}</strong>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <div className="font-semibold" style={{ color: darkText }}>
                  {currentUser ? `${currentUser.first_name} ${currentUser.last_name}` : 'User'}
                </div>
                <div className="text-sm" style={{ color: "#7a614a" }}>
                  {getRoleName(userRole)}
                </div>
              </div>
              <button 
                className="flex items-center gap-2 px-4 py-2 rounded-full font-semibold"
                onClick={handleLogout}
                style={{ backgroundColor: bhagwa, color: "#fff" }}
              >
                <LogOut size={16} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
        
        {/* Page Content */}
        <div className="p-4 md:p-6">
          {children}
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

export default DashboardLayout;