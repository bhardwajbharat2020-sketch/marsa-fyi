import React, { useState, useEffect } from 'react';
import DashboardLayout from './DashboardLayout';
import '../App.css';

const HrDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [pendingDocuments, setPendingDocuments] = useState([]);
  const [contactRequests, setContactRequests] = useState([]);
  const [userIssues, setUserIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch real data from Supabase
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch pending documents
        const documentsResponse = await fetch('/api/hr/documents');
        const documentsData = await documentsResponse.json();
        
        if (documentsResponse.ok) {
          setPendingDocuments(documentsData);
        } else {
          console.error('Error fetching documents:', documentsData.error);
        }
        
        // Fetch contact requests
        const contactsResponse = await fetch('/api/hr/contacts');
        const contactsData = await contactsResponse.json();
        
        if (contactsResponse.ok) {
          setContactRequests(contactsData);
        } else {
          console.error('Error fetching contacts:', contactsData.error);
        }
        
        // Fetch user issues
        const issuesResponse = await fetch('/api/hr/issues');
        const issuesData = await issuesResponse.json();
        
        if (issuesResponse.ok) {
          setUserIssues(issuesData);
        } else {
          console.error('Error fetching issues:', issuesData.error);
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

  // Function to approve a document
  const approveDocument = async (documentId) => {
    try {
      const response = await fetch('/api/hr/documents/approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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

  // Calculate stats from real data
  const stats = {
    pendingDocuments: pendingDocuments.filter(doc => doc.status === 'pending').length,
    pendingContacts: contactRequests.filter(req => req.status === 'pending').length,
    openIssues: userIssues.filter(issue => issue.status === 'open').length,
    totalUsers: pendingDocuments.length + contactRequests.length + userIssues.length
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
          className={`tab ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
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

          {activeTab === 'users' && (
            <div>
              <div className="card">
                <div className="card-header">
                  <h2 className="card-title">User Issue Management</h2>
                  <div className="flex space-x-2">
                    <input 
                      type="text" 
                      placeholder="Search issues..." 
                      className="form-control"
                    />
                    <select className="form-control">
                      <option>All Statuses</option>
                      <option>Open</option>
                      <option>In Progress</option>
                      <option>Resolved</option>
                    </select>
                  </div>
                </div>
                
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>User</th>
                        <th>Vendor Code</th>
                        <th>Issue</th>
                        <th>Reported Date</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {userIssues.map(issue => (
                        <tr key={issue.id}>
                          <td>
                            <div>
                              <div className="font-medium">{issue.user_name}</div>
                            </div>
                          </td>
                          <td>{issue.vendor_code}</td>
                          <td>{issue.issue}</td>
                          <td>{new Date(issue.reported_date).toLocaleDateString()}</td>
                          <td>
                            <span className={`status-badge status-${issue.status}`}>
                              {issue.status}
                            </span>
                          </td>
                          <td>
                            <div className="flex space-x-2">
                              <button className="btn btn-outline btn-small">View</button>
                              {issue.status !== 'resolved' && (
                                <button 
                                  className="btn btn-primary btn-small"
                                  onClick={() => resolveUserIssue(issue.id)}
                                >
                                  Resolve
                                </button>
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
        </>
      )}
    </DashboardLayout>
  );
};

export default HrDashboard;