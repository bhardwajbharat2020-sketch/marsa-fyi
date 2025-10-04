import React, { useState, useEffect } from 'react';
import DashboardLayout from './DashboardLayout';
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

  return (
    <DashboardLayout title="Administrator Dashboard" role="admin">
      <div className="dashboard-tabs">
        <button 
          className={`tab ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          User Management
        </button>
        <button 
          className={`tab ${activeTab === 'config' ? 'active' : ''}`}
          onClick={() => setActiveTab('config')}
        >
          System Configuration
        </button>
        <button 
          className={`tab ${activeTab === 'logs' ? 'active' : ''}`}
          onClick={() => setActiveTab('logs')}
        >
          Audit Logs
        </button>
      </div>

      {loading && <div className="text-center py-10">Loading dashboard data...</div>}
      {error && <div className="text-center py-10 text-red-500">Error: {error}</div>}
      
      {activeTab === 'users' && (
        <div>
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">User Management</h2>
              <button 
                className="btn btn-primary"
                onClick={() => setShowAddUserModal(true)}
              >
                Add New User
              </button>
            </div>
            
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>User ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.id}>
                      <td>{user.id}</td>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>{user.role}</td>
                      <td>
                        <span className={`status-badge status-${user.status}`}>
                          {user.status}
                        </span>
                      </td>
                      <td>
                        <button className="btn btn-outline btn-small">View</button>
                        <button className="btn btn-primary btn-small">Edit</button>
                        <button className="btn btn-danger btn-small">Disable</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'config' && (
        <div>
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">System Configuration</h2>
            </div>
            
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Setting</th>
                    <th>Value</th>
                    <th>Description</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {systemConfig.map(config => (
                    <tr key={config.id}>
                      <td>{config.setting}</td>
                      <td>{config.value}</td>
                      <td>{config.description}</td>
                      <td>
                        <button className="btn btn-outline btn-small">View</button>
                        <button className="btn btn-primary btn-small">Edit</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'logs' && (
        <div>
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Audit Logs</h2>
            </div>
            
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>User</th>
                    <th>Action</th>
                    <th>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.map(log => (
                    <tr key={log.id}>
                      <td>{log.timestamp}</td>
                      <td>{log.user}</td>
                      <td>{log.action}</td>
                      <td>{log.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Add New User</h3>
              <button 
                className="close-button"
                onClick={() => setShowAddUserModal(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleAddUser}>
              <div className="form-group">
                <label htmlFor="name" className="form-label">Full Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="form-control"
                  value={newUser.name}
                  onChange={handleUserInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="email" className="form-label">Email *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="form-control"
                  value={newUser.email}
                  onChange={handleUserInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="role" className="form-label">Role *</label>
                <select
                  id="role"
                  name="role"
                  className="form-control"
                  value={newUser.role}
                  onChange={handleUserInputChange}
                  required
                >
                  <option value="">Select a role</option>
                  <option value="Seller">Seller</option>
                  <option value="Buyer">Buyer</option>
                  <option value="Transporter">Transporter</option>
                  <option value="Logistics">Logistics</option>
                  <option value="Insurance">Insurance</option>
                  <option value="Surveyor">Surveyor</option>
                  <option value="CHA">CHA</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
              
              <div className="form-navigation">
                <button 
                  type="button" 
                  className="btn btn-outline"
                  onClick={() => setShowAddUserModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                >
                  Add User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default AdminDashboard;