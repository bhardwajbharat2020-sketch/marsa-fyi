import React, { useState, useEffect } from 'react';
import DashboardLayout from './DashboardLayout';
import { Plus, X } from 'lucide-react';
import '../App.css';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [systemConfig, setSystemConfig] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for add user modal
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: ''
  });

  // Theme colors to match homepage
  const bhagwa = "#f77f00";
  const cream = "#f6efe6";
  const creamCard = "#efe6d9";
  const darkText = "#5a4632";

  // Fetch real data from Supabase
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch users
        const usersResponse = await fetch('/api/admin/users');
        const usersData = await usersResponse.json();
        
        if (usersResponse.ok) {
          setUsers(usersData);
        } else {
          console.error('Error fetching users:', usersData.error);
        }
        
        // Fetch system configuration
        const configResponse = await fetch('/api/admin/config');
        const configData = await configResponse.json();
        
        if (configResponse.ok) {
          setSystemConfig(configData);
        } else {
          console.error('Error fetching system config:', configData.error);
        }
        
        // Fetch audit logs
        const logsResponse = await fetch('/api/admin/logs');
        const logsData = await logsResponse.json();
        
        if (logsResponse.ok) {
          setAuditLogs(logsData);
        } else {
          console.error('Error fetching audit logs:', logsData.error);
        }
      } catch (err) {
        setError('Failed to fetch dashboard data');
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle input changes for new user form
  const handleUserInputChange = (e) => {
    const { name, value } = e.target;
    setNewUser(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle add user form submission
  const handleAddUser = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newUser),
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        // Add the new user to the users list
        setUsers(prev => [...prev, result.user]);
        
        // Reset form and close modal
        setNewUser({
          name: '',
          email: '',
          role: ''
        });
        setShowAddUserModal(false);
        
        alert('User added successfully!');
      } else {
        alert('Failed to add user: ' + (result.error || 'Unknown error'));
      }
    } catch (err) {
      console.error('Error adding user:', err);
      alert('Failed to add user. Please try again.');
    }
  };

  // Status badge component
  const StatusBadge = ({ status }) => {
    const statusStyles = {
      active: { backgroundColor: '#d4edda', color: '#155724' },
      inactive: { backgroundColor: '#f8d7da', color: '#721c24' },
      pending: { backgroundColor: '#fff3cd', color: '#856404' },
      approved: { backgroundColor: '#d4edda', color: '#155724' },
      rejected: { backgroundColor: '#f8d7da', color: '#721c24' }
    };
    
    const style = statusStyles[status.toLowerCase()] || statusStyles.pending;
    
    return (
      <span 
        className="px-3 py-1 rounded-full text-xs font-semibold"
        style={style}
      >
        {status}
      </span>
    );
  };

  return (
    <DashboardLayout title="Administrator Dashboard" role="admin">
      <div className="mb-6 flex flex-wrap gap-2 border-b" style={{ borderColor: "#d9cfc1" }}>
        <button 
          className={`px-4 py-2 rounded-t-lg font-medium ${
            activeTab === 'users' ? 'border-b-2' : ''
          }`}
          onClick={() => setActiveTab('users')}
          style={{ 
            color: activeTab === 'users' ? bhagwa : darkText,
            borderColor: activeTab === 'users' ? bhagwa : 'transparent'
          }}
        >
          User Management
        </button>
        <button 
          className={`px-4 py-2 rounded-t-lg font-medium ${
            activeTab === 'config' ? 'border-b-2' : ''
          }`}
          onClick={() => setActiveTab('config')}
          style={{ 
            color: activeTab === 'config' ? bhagwa : darkText,
            borderColor: activeTab === 'config' ? bhagwa : 'transparent'
          }}
        >
          System Configuration
        </button>
        <button 
          className={`px-4 py-2 rounded-t-lg font-medium ${
            activeTab === 'logs' ? 'border-b-2' : ''
          }`}
          onClick={() => setActiveTab('logs')}
          style={{ 
            color: activeTab === 'logs' ? bhagwa : darkText,
            borderColor: activeTab === 'logs' ? bhagwa : 'transparent'
          }}
        >
          Audit Logs
        </button>
      </div>

      {loading && <div className="text-center py-10" style={{ color: darkText }}>Loading dashboard data...</div>}
      {error && <div className="text-center py-10 text-red-500">Error: {error}</div>}
      
      {activeTab === 'users' && (
        <div>
          <div 
            className="rounded-xl shadow-sm p-6 mb-6"
            style={{ backgroundColor: "#fff" }}
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <h2 className="text-2xl font-bold" style={{ color: darkText }}>User Management</h2>
              <button 
                className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold"
                onClick={() => setShowAddUserModal(true)}
                style={{ backgroundColor: bhagwa, color: "#fff" }}
              >
                <Plus size={16} />
                Add New User
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ backgroundColor: creamCard }}>
                    <th className="text-left p-3" style={{ color: darkText }}>User ID</th>
                    <th className="text-left p-3" style={{ color: darkText }}>Name</th>
                    <th className="text-left p-3" style={{ color: darkText }}>Email</th>
                    <th className="text-left p-3" style={{ color: darkText }}>Role</th>
                    <th className="text-left p-3" style={{ color: darkText }}>Status</th>
                    <th className="text-left p-3" style={{ color: darkText }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.id} className="border-b" style={{ borderColor: "#d9cfc1" }}>
                      <td className="p-3" style={{ color: darkText }}>{user.id}</td>
                      <td className="p-3" style={{ color: darkText }}>{user.name}</td>
                      <td className="p-3" style={{ color: darkText }}>{user.email}</td>
                      <td className="p-3" style={{ color: darkText }}>{user.role}</td>
                      <td className="p-3">
                        <StatusBadge status={user.status} />
                      </td>
                      <td className="p-3">
                        <div className="flex flex-wrap gap-2">
                          <button 
                            className="px-3 py-1 rounded text-sm"
                            style={{ backgroundColor: "#fff", color: darkText, border: "1px solid #d9cfc1" }}
                          >
                            View
                          </button>
                          <button 
                            className="px-3 py-1 rounded text-sm"
                            style={{ backgroundColor: bhagwa, color: "#fff" }}
                          >
                            Edit
                          </button>
                          <button 
                            className="px-3 py-1 rounded text-sm"
                            style={{ backgroundColor: "#e74c3c", color: "#fff" }}
                          >
                            Disable
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {users.length === 0 && !loading && (
                <div className="text-center py-10" style={{ color: darkText }}>
                  No users found.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'config' && (
        <div>
          <div 
            className="rounded-xl shadow-sm p-6 mb-6"
            style={{ backgroundColor: "#fff" }}
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <h2 className="text-2xl font-bold" style={{ color: darkText }}>System Configuration</h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ backgroundColor: creamCard }}>
                    <th className="text-left p-3" style={{ color: darkText }}>Setting</th>
                    <th className="text-left p-3" style={{ color: darkText }}>Value</th>
                    <th className="text-left p-3" style={{ color: darkText }}>Description</th>
                    <th className="text-left p-3" style={{ color: darkText }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {systemConfig.map((config, index) => (
                    <tr key={index} className="border-b" style={{ borderColor: "#d9cfc1" }}>
                      <td className="p-3" style={{ color: darkText }}>{config.setting}</td>
                      <td className="p-3" style={{ color: darkText }}>{config.value}</td>
                      <td className="p-3" style={{ color: darkText }}>{config.description}</td>
                      <td className="p-3">
                        <div className="flex flex-wrap gap-2">
                          <button 
                            className="px-3 py-1 rounded text-sm"
                            style={{ backgroundColor: "#fff", color: darkText, border: "1px solid #d9cfc1" }}
                          >
                            Edit
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {systemConfig.length === 0 && !loading && (
                <div className="text-center py-10" style={{ color: darkText }}>
                  No configuration settings found.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'logs' && (
        <div>
          <div 
            className="rounded-xl shadow-sm p-6 mb-6"
            style={{ backgroundColor: "#fff" }}
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <h2 className="text-2xl font-bold" style={{ color: darkText }}>Audit Logs</h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ backgroundColor: creamCard }}>
                    <th className="text-left p-3" style={{ color: darkText }}>Timestamp</th>
                    <th className="text-left p-3" style={{ color: darkText }}>User</th>
                    <th className="text-left p-3" style={{ color: darkText }}>Action</th>
                    <th className="text-left p-3" style={{ color: darkText }}>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.map((log, index) => (
                    <tr key={index} className="border-b" style={{ borderColor: "#d9cfc1" }}>
                      <td className="p-3" style={{ color: darkText }}>{log.timestamp}</td>
                      <td className="p-3" style={{ color: darkText }}>{log.user}</td>
                      <td className="p-3" style={{ color: darkText }}>{log.action}</td>
                      <td className="p-3" style={{ color: darkText }}>{log.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {auditLogs.length === 0 && !loading && (
                <div className="text-center py-10" style={{ color: darkText }}>
                  No audit logs found.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {showAddUserModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div 
            className="rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto"
            style={{ backgroundColor: "#fff" }}
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold" style={{ color: darkText }}>Add New User</h3>
                <button 
                  className="p-2 rounded-full"
                  onClick={() => setShowAddUserModal(false)}
                  style={{ backgroundColor: creamCard }}
                >
                  <X size={20} style={{ color: darkText }} />
                </button>
              </div>
              <form onSubmit={handleAddUser}>
                <div className="mb-4">
                  <label htmlFor="name" className="block mb-2 font-medium" style={{ color: darkText }}>
                    Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    className="w-full p-3 rounded-lg border"
                    style={{ borderColor: "#d9cfc1", backgroundColor: "#fff", color: darkText }}
                    value={newUser.name}
                    onChange={handleUserInputChange}
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="email" className="block mb-2 font-medium" style={{ color: darkText }}>
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className="w-full p-3 rounded-lg border"
                    style={{ borderColor: "#d9cfc1", backgroundColor: "#fff", color: darkText }}
                    value={newUser.email}
                    onChange={handleUserInputChange}
                    required
                  />
                </div>
                
                <div className="mb-6">
                  <label htmlFor="role" className="block mb-2 font-medium" style={{ color: darkText }}>
                    Role *
                  </label>
                  <select
                    id="role"
                    name="role"
                    className="w-full p-3 rounded-lg border"
                    style={{ borderColor: "#d9cfc1", backgroundColor: "#fff", color: darkText }}
                    value={newUser.role}
                    onChange={handleUserInputChange}
                    required
                  >
                    <option value="">Select a role</option>
                    <option value="admin">Administrator</option>
                    <option value="seller">Seller</option>
                    <option value="buyer">Buyer</option>
                    <option value="captain">Captain</option>
                    <option value="hr">HR</option>
                    <option value="accountant">Accountant</option>
                  </select>
                </div>
                
                <div className="flex justify-end gap-3">
                  <button 
                    type="button" 
                    className="px-4 py-2 rounded-lg font-medium"
                    onClick={() => setShowAddUserModal(false)}
                    style={{ backgroundColor: "#fff", color: darkText, border: "1px solid #d9cfc1" }}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="px-4 py-2 rounded-lg font-medium"
                    style={{ backgroundColor: bhagwa, color: "#fff" }}
                  >
                    Add User
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default AdminDashboard;