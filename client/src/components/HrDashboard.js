import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import DashboardLayout from './DashboardLayout';
import '../App.css';

const HrDashboard = () => {
  const { authToken } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [pendingDocuments, setPendingDocuments] = useState([]);
  const [contactRequests, setContactRequests] = useState([]);
  const [userIssues, setUserIssues] = useState([]);
  const [users, setUsers] = useState([]); // For user management
  const [newUsers, setNewUsers] = useState([]); // For new user registrations
  const [roles, setRoles] = useState([]); // For role dropdown
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [blockModal, setBlockModal] = useState({ open: false, user: null, type: 'temp' }); // For block modal
  const [unblockModal, setUnblockModal] = useState({ open: false, user: null }); // For unblock modal
  const [editUserModal, setEditUserModal] = useState({ open: false, user: null }); // For edit user modal
  const [blockReason, setBlockReason] = useState('');
  const [blockDuration, setBlockDuration] = useState(7); // Default 7 days for temp block
  const [editUserForm, setEditUserForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    vendor_code: '',
    is_active: true,
    is_verified: false,
    role: '' // Add role field
  });

  // Fetch real data from Supabase
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch pending documents
        const documentsResponse = await fetch('/api/hr/documents', {
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        });
        const documentsData = await documentsResponse.json();
        
        if (documentsResponse.ok) {
          setPendingDocuments(documentsData);
        } else {
          console.error('Error fetching documents:', documentsData.error);
        }
        
        // Fetch contact requests
        const contactsResponse = await fetch('/api/hr/contacts', {
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        });
        const contactsData = await contactsResponse.json();
        
        if (contactsResponse.ok) {
          setContactRequests(contactsData);
        } else {
          console.error('Error fetching contacts:', contactsData.error);
        }
        
        // Fetch user issues
        const issuesResponse = await fetch('/api/hr/issues', {
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        });
        const issuesData = await issuesResponse.json();
        
        if (issuesResponse.ok) {
          setUserIssues(issuesData);
        } else {
          console.error('Error fetching issues:', issuesData.error);
        }
        
        // Fetch users for user management (only when on users tab or overview)
        if (activeTab === 'users' || activeTab === 'overview') {
          await fetchUsers();
        }
        
        // Fetch new users
        if (activeTab === 'new-users') {
          await fetchNewUsers();
        }
        
        // Fetch roles for dropdown
        await fetchRoles();
      } catch (err) {
        setError('Failed to fetch dashboard data');
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (authToken) {
      fetchData();
    }
  }, [activeTab, authToken]);

  // Function to fetch users (for user management tab)
  const fetchUsers = async () => {
    try {
      console.log('Fetching users from /api/hr/users');
      const response = await fetch('/api/hr/users', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      const data = await response.json();
      console.log('Users API response:', response, data);
      
      if (response.ok) {
        console.log('Setting users state with:', data);
        setUsers(data);
      } else {
        console.error('Error fetching users:', data.error);
        setError('Failed to fetch users: ' + data.error);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to fetch users. Please try again.');
    }
  };

  // Function to fetch new users
  const fetchNewUsers = async () => {
    try {
      const response = await fetch('/api/hr/new-users', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      const data = await response.json();
      
      if (response.ok) {
        setNewUsers(data);
      } else {
        console.error('Error fetching new users:', data.error);
      }
    } catch (err) {
      console.error('Error fetching new users:', err);
    }
  };

  // Function to fetch roles for dropdown
  const fetchRoles = async () => {
    try {
      const response = await fetch('/api/hr/roles', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      const data = await response.json();
      
      if (response.ok) {
        // Filter out restricted roles (captain, accountant, arbitrator, hr, admin)
        const allowedRoles = data.filter(role => 
          !['CAPT', 'ACC', 'ARB', 'HR', 'ADM'].includes(role.code)
        );
        setRoles(allowedRoles);
      } else {
        console.error('Error fetching roles:', data.error);
      }
    } catch (err) {
      console.error('Error fetching roles:', err);
    }
  };

  // Function to approve a document
  const approveDocument = async (documentId) => {
    try {
      const response = await fetch('/api/hr/documents/approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ documentId }),
      });
      
      const result = await response.json();
      
      if (response.ok) {
        // Update the documents state to reflect the approval
        setPendingDocuments(prevDocuments => 
          prevDocuments.map(document => 
            document.id === documentId 
              ? { ...document, status: 'approved' } 
              : document
          )
        );
        
        alert('Document approved successfully!');
      } else {
        alert('Failed to approve document: ' + result.error);
      }
    } catch (err) {
      console.error('Error approving document:', err);
      alert('Failed to approve document. Please try again.');
    }
  };

  // Function to approve a contact request
  const approveContactRequest = async (requestId) => {
    try {
      const response = await fetch('/api/hr/contacts/approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ requestId }),
      });
      
      const result = await response.json();
      
      if (response.ok) {
        // Update the contact requests state to reflect the approval
        setContactRequests(prevRequests => 
          prevRequests.map(request => 
            request.id === requestId 
              ? { ...request, status: 'approved' } 
              : request
          )
        );
        
        alert('Contact request approved successfully!');
      } else {
        alert('Failed to approve contact request: ' + result.error);
      }
    } catch (err) {
      console.error('Error approving contact request:', err);
      alert('Failed to approve contact request. Please try again.');
    }
  };

  // Function to resolve a user issue
  const resolveUserIssue = async (issueId) => {
    try {
      const response = await fetch('/api/hr/issues/resolve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ issueId }),
      });
      
      const result = await response.json();
      
      if (response.ok) {
        // Update the user issues state to reflect the resolution
        setUserIssues(prevIssues => 
          prevIssues.map(issue => 
            issue.id === issueId 
              ? { ...issue, status: 'resolved' } 
              : issue
          )
        );
        
        alert('User issue resolved successfully!');
      } else {
        alert('Failed to resolve user issue: ' + result.error);
      }
    } catch (err) {
      console.error('Error resolving user issue:', err);
      alert('Failed to resolve user issue. Please try again.');
    }
  };

  // Function to block a user temporarily
  const blockUserTemporarily = async () => {
    try {
      const response = await fetch('/api/hr/users/block-temp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ 
          userId: blockModal.user.id, 
          reason: blockReason,
          duration: blockDuration
        }),
      });
      
      const result = await response.json();
      
      if (response.ok) {
        // Update the users state to reflect the block
        setUsers(prevUsers => 
          prevUsers.map(user => 
            user.id === blockModal.user.id 
              ? { ...user, status: 'Temporarily Blocked', is_blocked_temp: true } 
              : user
          )
        );
        
        alert('User blocked temporarily successfully!');
        setBlockModal({ open: false, user: null, type: 'temp' });
        setBlockReason('');
        setBlockDuration(7);
      } else {
        alert('Failed to block user: ' + result.error);
      }
    } catch (err) {
      console.error('Error blocking user:', err);
      alert('Failed to block user. Please try again.');
    }
  };

  // Function to block a user permanently
  const blockUserPermanently = async () => {
    try {
      const response = await fetch('/api/hr/users/block-perm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ 
          userId: blockModal.user.id, 
          reason: blockReason
        }),
      });
      
      const result = await response.json();
      
      if (response.ok) {
        // Update the users state to reflect the block
        setUsers(prevUsers => 
          prevUsers.map(user => 
            user.id === blockModal.user.id 
              ? { ...user, status: 'Permanently Blocked', is_blocked_perm: true } 
              : user
          )
        );
        
        alert('User blocked permanently successfully!');
        setBlockModal({ open: false, user: null, type: 'perm' });
        setBlockReason('');
      } else {
        alert('Failed to block user: ' + result.error);
      }
    } catch (err) {
      console.error('Error blocking user:', err);
      alert('Failed to block user. Please try again.');
    }
  };

  // Function to unblock a user
  const unblockUser = async () => {
    try {
      const response = await fetch('/api/hr/users/unblock', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ 
          userId: unblockModal.user.id, 
          reason: blockReason
        }),
      });
      
      const result = await response.json();
      
      if (response.ok) {
        // Update the users state to reflect the unblock
        setUsers(prevUsers => 
          prevUsers.map(user => 
            user.id === unblockModal.user.id 
              ? { ...user, status: 'Active', is_blocked_temp: false, is_blocked_perm: false } 
              : user
          )
        );
        
        alert('User unblocked successfully!');
        setUnblockModal({ open: false, user: null });
        setBlockReason('');
      } else {
        alert('Failed to unblock user: ' + result.error);
      }
    } catch (err) {
      console.error('Error unblocking user:', err);
      alert('Failed to unblock user. Please try again.');
    }
  };

  // Function to open edit user modal
  const openEditUserModal = (user) => {
    setEditUserModal({ open: true, user });
    setEditUserForm({
      first_name: user.name.split(' ')[0] || '',
      last_name: user.name.split(' ').slice(1).join(' ') || '',
      email: user.email,
      phone: user.phone,
      vendor_code: user.vendor_code,
      is_active: user.status === 'Active' || user.status === 'Temporarily Blocked' || user.status === 'Permanently Blocked',
      is_verified: user.status === 'Active' || user.status === 'Temporarily Blocked' || user.status === 'Permanently Blocked',
      role: user.role // Set the current role
    });
  };

  // Function to handle edit user form changes
  const handleEditUserFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditUserForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Function to update user details
  const updateUserDetails = async () => {
    try {
      const response = await fetch('/api/hr/users/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ 
          userId: editUserModal.user.id,
          ...editUserForm
        }),
      });
      
      const result = await response.json();
      
      if (response.ok) {
        // Update the users state to reflect the changes
        setUsers(prevUsers => 
          prevUsers.map(user => 
            user.id === editUserModal.user.id 
              ? { 
                  ...user, 
                  name: `${editUserForm.first_name} ${editUserForm.last_name}`,
                  email: editUserForm.email,
                  phone: editUserForm.phone,
                  vendor_code: editUserForm.vendor_code,
                  status: editUserForm.is_active ? 'Active' : 'Inactive',
                  role: editUserForm.role
                } 
              : user
          )
        );
        
        // Also update in new users if present
        setNewUsers(prevNewUsers => 
          prevNewUsers.map(user => 
            user.id === editUserModal.user.id 
              ? { 
                  ...user, 
                  name: `${editUserForm.first_name} ${editUserForm.last_name}`,
                  email: editUserForm.email,
                  phone: editUserForm.phone,
                  vendor_code: editUserForm.vendor_code,
                  status: editUserForm.is_active ? 'Active' : 'Inactive',
                  role: editUserForm.role
                } 
              : user
          )
        );
        
        alert('User details updated successfully!');
        setEditUserModal({ open: false, user: null });
      } else {
        alert('Failed to update user: ' + result.error);
      }
    } catch (err) {
      console.error('Error updating user:', err);
      alert('Failed to update user. Please try again.');
    }
  };

  // Function to approve a new user
  const approveNewUser = async (userId) => {
    try {
      const response = await fetch('/api/hr/new-users/approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ userId }),
      });
      
      const result = await response.json();
      
      if (response.ok) {
        // Remove the approved user from new users list
        setNewUsers(prevNewUsers => prevNewUsers.filter(user => user.id !== userId));
        alert('New user approved successfully!');
      } else {
        alert('Failed to approve new user: ' + result.error);
      }
    } catch (err) {
      console.error('Error approving new user:', err);
      alert('Failed to approve new user. Please try again.');
    }
  };

  // Calculate stats from real data
  const stats = {
    pendingDocuments: pendingDocuments.filter(doc => doc.status === 'pending').length,
    pendingContacts: contactRequests.filter(req => req.status === 'pending').length,
    openIssues: userIssues.filter(issue => issue.status === 'open').length,
    totalUsers: users.length || 0, // Use actual user count
    activeUsers: users.filter(user => user.status === 'Active').length,
    blockedUsers: users.filter(user => user.status === 'Temporarily Blocked' || user.status === 'Permanently Blocked').length,
    newUsers: newUsers.length || 0 // New users count
  };

  return (
    <DashboardLayout title="HR Dashboard" role="hr">
      <div className="dashboard-tabs">
        <button 
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button 
          className={`tab ${activeTab === 'documents' ? 'active' : ''}`}
          onClick={() => setActiveTab('documents')}
        >
          Document Verification
        </button>
        <button 
          className={`tab ${activeTab === 'contacts' ? 'active' : ''}`}
          onClick={() => setActiveTab('contacts')}
        >
          Contact Requests
        </button>
        <button 
          className={`tab ${activeTab === 'new-users' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('new-users');
          }}
        >
          New User Registrations
        </button>
        <button 
          className={`tab ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('users');
          }}
        >
          User Management
        </button>
      </div>

      {loading && <div className="text-center py-10">Loading dashboard data...</div>}
      {error && <div className="text-center py-10 text-red-500">Error: {error}</div>}

      {!loading && !error && (
        <>
          {activeTab === 'overview' && (
            <div>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
                      <span className="text-xl">📄</span>
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm">Pending Documents</p>
                      <p className="text-2xl font-bold">{stats.pendingDocuments}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
                      <span className="text-xl">📞</span>
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm">Pending Contacts</p>
                      <p className="text-2xl font-bold">{stats.pendingContacts}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-yellow-100 text-yellow-600 mr-4">
                      <span className="text-xl">⚠️</span>
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm">Open Issues</p>
                      <p className="text-2xl font-bold">{stats.openIssues}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-purple-100 text-purple-600 mr-4">
                      <span className="text-xl">👥</span>
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm">Total Users</p>
                      <p className="text-2xl font-bold">{stats.totalUsers}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
                      <span className="text-xl">✅</span>
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm">Active Users</p>
                      <p className="text-2xl font-bold">{stats.activeUsers}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-red-100 text-red-600 mr-4">
                      <span className="text-xl">🚫</span>
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm">Blocked Users</p>
                      <p className="text-2xl font-bold">{stats.blockedUsers}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-indigo-100 text-indigo-600 mr-4">
                      <span className="text-xl">🆕</span>
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm">New Registrations</p>
                      <p className="text-2xl font-bold">{stats.newUsers}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="card">
                  <div className="card-header">
                    <h2 className="card-title">Recent Document Submissions</h2>
                  </div>
                  <div className="table-container">
                    <table>
                      <thead>
                        <tr>
                          <th>User</th>
                          <th>Document Type</th>
                          <th>Date</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pendingDocuments.slice(0, 3).map(doc => (
                          <tr key={doc.id}>
                            <td>
                              <div>
                                <div className="font-medium">{doc.user_name}</div>
                                <div className="text-gray-500 text-sm">{doc.vendor_code}</div>
                              </div>
                            </td>
                            <td>{doc.document_type}</td>
                            <td>{new Date(doc.submitted_date).toLocaleDateString()}</td>
                            <td>
                              <span className={`status-badge status-${doc.status}`}>
                                {doc.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="card">
                  <div className="card-header">
                    <h2 className="card-title">Recent Contact Requests</h2>
                  </div>
                  <div className="table-container">
                    <table>
                      <thead>
                        <tr>
                          <th>Requester</th>
                          <th>Reason</th>
                          <th>Date</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {contactRequests.slice(0, 3).map(request => (
                          <tr key={request.id}>
                            <td>
                              <div>
                                <div className="font-medium">{request.requester_name}</div>
                                <div className="text-gray-500 text-sm">{request.vendor_code}</div>
                              </div>
                            </td>
                            <td>{request.reason}</td>
                            <td>{new Date(request.request_date).toLocaleDateString()}</td>
                            <td>
                              <span className={`status-badge status-${request.status}`}>
                                {request.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              
              {/* User Status Distribution */}
              <div className="card mt-8">
                <div className="card-header">
                  <h2 className="card-title">User Status Distribution</h2>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-blue-800">Active Users</h3>
                      <p className="text-3xl font-bold text-blue-600">{stats.activeUsers}</p>
                      <p className="text-sm text-gray-600">{((stats.activeUsers / stats.totalUsers) * 100 || 0).toFixed(1)}% of total</p>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-yellow-800">Temporarily Blocked</h3>
                      <p className="text-3xl font-bold text-yellow-600">
                        {users.filter(user => user.status === 'Temporarily Blocked').length}
                      </p>
                      <p className="text-sm text-gray-600">
                        {((users.filter(user => user.status === 'Temporarily Blocked').length / stats.totalUsers) * 100 || 0).toFixed(1)}% of total
                      </p>
                    </div>
                    <div className="bg-red-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-red-800">Permanently Blocked</h3>
                      <p className="text-3xl font-bold text-red-600">
                        {users.filter(user => user.status === 'Permanently Blocked').length}
                      </p>
                      <p className="text-sm text-gray-600">
                        {((users.filter(user => user.status === 'Permanently Blocked').length / stats.totalUsers) * 100 || 0).toFixed(1)}% of total
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'documents' && (
            <div>
              <div className="card">
                <div className="card-header">
                  <h2 className="card-title">Pending Document Verifications</h2>
                  <div className="flex space-x-2">
                    <input 
                      type="text" 
                      placeholder="Search documents..." 
                      className="form-control"
                    />
                    <select className="form-control">
                      <option>All Roles</option>
                      <option>Seller</option>
                      <option>Buyer</option>
                      <option>Supplier</option>
                    </select>
                  </div>
                </div>
                
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>User</th>
                        <th>Vendor Code</th>
                        <th>Role</th>
                        <th>Document Type</th>
                        <th>Submitted Date</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingDocuments.map(doc => (
                        <tr key={doc.id}>
                          <td>
                            <div>
                              <div className="font-medium">{doc.user_name}</div>
                            </div>
                          </td>
                          <td>{doc.vendor_code}</td>
                          <td>{doc.role}</td>
                          <td>{doc.document_type}</td>
                          <td>{new Date(doc.submitted_date).toLocaleDateString()}</td>
                          <td>
                            <span className={`status-badge status-${doc.status}`}>
                              {doc.status}
                            </span>
                          </td>
                          <td>
                            <div className="flex space-x-2">
                              <button className="btn btn-outline btn-small">View</button>
                              {doc.status === 'pending' && (
                                <button 
                                  className="btn btn-success btn-small"
                                  onClick={() => approveDocument(doc.id)}
                                >
                                  Approve
                                </button>
                              )}
                              <button className="btn btn-danger btn-small">Reject</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'contacts' && (
            <div>
              <div className="card">
                <div className="card-header">
                  <h2 className="card-title">Contact Detail Requests</h2>
                  <div className="flex space-x-2">
                    <input 
                      type="text" 
                      placeholder="Search requests..." 
                      className="form-control"
                    />
                    <select className="form-control">
                      <option>All Statuses</option>
                      <option>Pending</option>
                      <option>Approved</option>
                      <option>Rejected</option>
                    </select>
                  </div>
                </div>
                
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Requester</th>
                        <th>Vendor Code</th>
                        <th>Reason</th>
                        <th>Request Date</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {contactRequests.map(request => (
                        <tr key={request.id}>
                          <td>
                            <div>
                              <div className="font-medium">{request.requester_name}</div>
                            </div>
                          </td>
                          <td>{request.vendor_code}</td>
                          <td>{request.reason}</td>
                          <td>{new Date(request.request_date).toLocaleDateString()}</td>
                          <td>
                            <span className={`status-badge status-${request.status}`}>
                              {request.status}
                            </span>
                          </td>
                          <td>
                            <div className="flex space-x-2">
                              <button className="btn btn-outline btn-small">View</button>
                              {request.status === 'pending' && (
                                <>
                                  <button 
                                    className="btn btn-success btn-small"
                                    onClick={() => approveContactRequest(request.id)}
                                  >
                                    Approve
                                  </button>
                                  <button className="btn btn-danger btn-small">Reject</button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'new-users' && (
            <div>
              <div className="card">
                <div className="card-header">
                  <h2 className="card-title">New User Registrations</h2>
                  <div className="flex space-x-2">
                    <input 
                      type="text" 
                      placeholder="Search new users..." 
                      className="form-control"
                    />
                    <select className="form-control">
                      <option>All Roles</option>
                      <option>Seller</option>
                      <option>Buyer</option>
                      <option>Supplier</option>
                    </select>
                  </div>
                </div>
                
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>User</th>
                        <th>Vendor Code</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Role</th>
                        <th>Registration Date</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {newUsers && newUsers.length > 0 ? (
                        newUsers.map(user => (
                          <tr key={user.id}>
                            <td>
                              <div>
                                <div className="font-medium">{user.name}</div>
                              </div>
                            </td>
                            <td>{user.vendor_code}</td>
                            <td>{user.email}</td>
                            <td>{user.phone}</td>
                            <td>{user.role}</td>
                            <td>{new Date(user.created_at).toLocaleDateString()}</td>
                            <td>
                              <span className={`status-badge status-${
                                user.status === 'Active' ? 'success' :
                                user.status === 'Pending' ? 'warning' : 'secondary'
                              }`}>
                                {user.status}
                              </span>
                            </td>
                            <td>
                              <div className="flex space-x-2">
                                <button 
                                  className="btn btn-success btn-small"
                                  onClick={() => approveNewUser(user.id)}
                                >
                                  Approve
                                </button>
                                <button 
                                  className="btn btn-info btn-small"
                                  onClick={() => openEditUserModal(user)}
                                >
                                  Edit
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="8" className="text-center py-4">
                            {loading ? 'Loading new users...' : 'No new user registrations found'}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div>
              <div className="card">
                <div className="card-header">
                  <h2 className="card-title">User Management</h2>
                  <div className="flex space-x-2">
                    <input 
                      type="text" 
                      placeholder="Search users..." 
                      className="form-control"
                    />
                    <select className="form-control">
                      <option>All Statuses</option>
                      <option>Active</option>
                      <option>Temporarily Blocked</option>
                      <option>Permanently Blocked</option>
                    </select>
                  </div>
                </div>
                
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>User</th>
                        <th>Vendor Code</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Role</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users && users.length > 0 ? (
                        users.map(user => (
                          <tr key={user.id}>
                            <td>
                              <div>
                                <div className="font-medium">{user.name}</div>
                              </div>
                            </td>
                            <td>{user.vendor_code}</td>
                            <td>{user.email}</td>
                            <td>{user.phone}</td>
                            <td>{user.role}</td>
                            <td>
                              <span className={`status-badge status-${
                                user.status === 'Active' ? 'success' :
                                user.status === 'Temporarily Blocked' ? 'warning' :
                                user.status === 'Permanently Blocked' ? 'danger' : 'secondary'
                              }`}>
                                {user.status}
                              </span>
                            </td>
                            <td>
                              <div className="flex space-x-2">
                                <button 
                                  className="btn btn-info btn-small"
                                  onClick={() => openEditUserModal(user)}
                                >
                                  Edit
                                </button>
                                {user.status === 'Active' && (
                                  <>
                                    <button 
                                      className="btn btn-warning btn-small"
                                      onClick={() => setBlockModal({ open: true, user, type: 'temp' })}
                                    >
                                      Temp Block
                                    </button>
                                    <button 
                                      className="btn btn-danger btn-small"
                                      onClick={() => setBlockModal({ open: true, user, type: 'perm' })}
                                    >
                                      Perm Block
                                    </button>
                                  </>
                                )}
                                {(user.status === 'Temporarily Blocked' || user.status === 'Permanently Blocked') && (
                                  <button 
                                    className="btn btn-success btn-small"
                                    onClick={() => setUnblockModal({ open: true, user })}
                                  >
                                    Unblock
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="7" className="text-center py-4">
                            {loading ? 'Loading users...' : 'No users found'}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Block User Modal */}
      {blockModal.open && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{blockModal.type === 'temp' ? 'Temporary Block' : 'Permanent Block'}</h3>
              <button 
                className="modal-close" 
                onClick={() => {
                  setBlockModal({ open: false, user: null, type: 'temp' });
                  setBlockReason('');
                  setBlockDuration(7);
                }}
              >
                &times;
              </button>
            </div>
            <div className="modal-body">
              <p>
                Are you sure you want to {blockModal.type === 'temp' ? 'temporarily' : 'permanently'} block 
                <strong> {blockModal.user?.name}</strong>?
              </p>
              
              <div className="form-group">
                <label>Reason for blocking:</label>
                <textarea
                  className="form-control"
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  placeholder="Enter reason for blocking..."
                  rows="3"
                />
              </div>
              
              {blockModal.type === 'temp' && (
                <div className="form-group">
                  <label>Duration (days):</label>
                  <input
                    type="number"
                    className="form-control"
                    value={blockDuration}
                    onChange={(e) => setBlockDuration(parseInt(e.target.value) || 7)}
                    min="1"
                  />
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button 
                className="btn btn-outline"
                onClick={() => {
                  setBlockModal({ open: false, user: null, type: 'temp' });
                  setBlockReason('');
                  setBlockDuration(7);
                }}
              >
                Cancel
              </button>
              <button 
                className={`btn ${blockModal.type === 'temp' ? 'btn-warning' : 'btn-danger'}`}
                onClick={blockModal.type === 'temp' ? blockUserTemporarily : blockUserPermanently}
                disabled={!blockReason.trim()}
              >
                {blockModal.type === 'temp' ? 'Block Temporarily' : 'Block Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Unblock User Modal */}
      {unblockModal.open && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Unblock User</h3>
              <button 
                className="modal-close" 
                onClick={() => {
                  setUnblockModal({ open: false, user: null });
                  setBlockReason('');
                }}
              >
                &times;
              </button>
            </div>
            <div className="modal-body">
              <p>
                Are you sure you want to unblock <strong>{unblockModal.user?.name}</strong>?
              </p>
              
              <div className="form-group">
                <label>Reason for unblocking:</label>
                <textarea
                  className="form-control"
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  placeholder="Enter reason for unblocking..."
                  rows="3"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="btn btn-outline"
                onClick={() => {
                  setUnblockModal({ open: false, user: null });
                  setBlockReason('');
                }}
              >
                Cancel
              </button>
              <button 
                className="btn btn-success"
                onClick={unblockUser}
                disabled={!blockReason.trim()}
              >
                Unblock User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editUserModal.open && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h3>Edit User Details</h3>
              <button 
                className="modal-close" 
                onClick={() => {
                  setEditUserModal({ open: false, user: null });
                  setEditUserForm({
                    first_name: '',
                    last_name: '',
                    email: '',
                    phone: '',
                    vendor_code: '',
                    is_active: true,
                    is_verified: false,
                    role: ''
                  });
                }}
              >
                &times;
              </button>
            </div>
            <div className="modal-body">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <label>First Name:</label>
                  <input
                    type="text"
                    className="form-control"
                    name="first_name"
                    value={editUserForm.first_name}
                    onChange={handleEditUserFormChange}
                  />
                </div>
                
                <div className="form-group">
                  <label>Last Name:</label>
                  <input
                    type="text"
                    className="form-control"
                    name="last_name"
                    value={editUserForm.last_name}
                    onChange={handleEditUserFormChange}
                  />
                </div>
                
                <div className="form-group md:col-span-2">
                  <label>Email:</label>
                  <input
                    type="email"
                    className="form-control"
                    name="email"
                    value={editUserForm.email}
                    onChange={handleEditUserFormChange}
                  />
                </div>
                
                <div className="form-group">
                  <label>Phone:</label>
                  <input
                    type="text"
                    className="form-control"
                    name="phone"
                    value={editUserForm.phone}
                    onChange={handleEditUserFormChange}
                  />
                </div>
                
                <div className="form-group">
                  <label>Vendor Code:</label>
                  <input
                    type="text"
                    className="form-control"
                    name="vendor_code"
                    value={editUserForm.vendor_code}
                    onChange={handleEditUserFormChange}
                  />
                </div>
                
                <div className="form-group">
                  <label>Role:</label>
                  <select
                    className="form-control"
                    name="role"
                    value={editUserForm.role}
                    onChange={handleEditUserFormChange}
                  >
                    <option value="">Select Role</option>
                    {roles.map(role => (
                      <option key={role.id} value={role.name}>
                        {role.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label>
                    <input
                      type="checkbox"
                      name="is_active"
                      checked={editUserForm.is_active}
                      onChange={handleEditUserFormChange}
                      className="mr-2"
                    />
                    Active User
                  </label>
                </div>
                
                <div className="form-group">
                  <label>
                    <input
                      type="checkbox"
                      name="is_verified"
                      checked={editUserForm.is_verified}
                      onChange={handleEditUserFormChange}
                      className="mr-2"
                    />
                    Verified User
                  </label>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="btn btn-outline"
                onClick={() => {
                  setEditUserModal({ open: false, user: null });
                  setEditUserForm({
                    first_name: '',
                    last_name: '',
                    email: '',
                    phone: '',
                    vendor_code: '',
                    is_active: true,
                    is_verified: false,
                    role: ''
                  });
                }}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary"
                onClick={updateUserDetails}
              >
                Update User
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default HrDashboard;