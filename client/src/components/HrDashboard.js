import React, { useState } from 'react';
import DashboardLayout from './DashboardLayout';
import '../App.css';

const HrDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data
  const pendingDocuments = [
    {
      id: 1,
      user: 'John Seller',
      vendorCode: 'S-23-SELL123',
      role: 'Seller',
      documentType: 'GST Registration',
      status: 'pending',
      submittedDate: '2023-10-15'
    },
    {
      id: 2,
      user: 'Sarah Buyer',
      vendorCode: 'B-23-BUY456',
      role: 'Buyer',
      documentType: 'VAT Certificate',
      status: 'pending',
      submittedDate: '2023-10-16'
    },
    {
      id: 3,
      user: 'Mike Supplier',
      vendorCode: 'SP-23-SUP789',
      role: 'Supplier',
      documentType: 'Business License',
      status: 'pending',
      submittedDate: '2023-10-17'
    }
  ];

  const contactRequests = [
    {
      id: 1,
      requester: 'Captain',
      vendorCode: 'C-23-CAPT789',
      reason: 'Need contact for dispute resolution',
      status: 'pending',
      requestDate: '2023-10-18'
    },
    {
      id: 2,
      requester: 'Arbitrator',
      vendorCode: 'A-23-ARB456',
      reason: 'Case investigation',
      status: 'approved',
      requestDate: '2023-10-17'
    }
  ];

  const userIssues = [
    {
      id: 1,
      user: 'Michael Transporter',
      vendorCode: 'TRN-23-TRN101',
      issue: 'Account access problem',
      status: 'open',
      reportedDate: '2023-10-18'
    },
    {
      id: 2,
      user: 'Emma Logistics',
      vendorCode: 'LOG-23-LOG202',
      issue: 'Profile update issue',
      status: 'resolved',
      reportedDate: '2023-10-16'
    }
  ];

  const stats = {
    pendingDocuments: pendingDocuments.length,
    pendingContacts: contactRequests.filter(req => req.status === 'pending').length,
    openIssues: userIssues.filter(issue => issue.status === 'open').length,
    totalUsers: 1240
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
                            <div className="font-medium">{doc.user}</div>
                            <div className="text-gray-500 text-sm">{doc.vendorCode}</div>
                          </div>
                        </td>
                        <td>{doc.documentType}</td>
                        <td>{doc.submittedDate}</td>
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
                            <div className="font-medium">{request.requester}</div>
                            <div className="text-gray-500 text-sm">{request.vendorCode}</div>
                          </div>
                        </td>
                        <td>{request.reason}</td>
                        <td>{request.requestDate}</td>
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
                          <div className="font-medium">{doc.user}</div>
                        </div>
                      </td>
                      <td>{doc.vendorCode}</td>
                      <td>{doc.role}</td>
                      <td>{doc.documentType}</td>
                      <td>{doc.submittedDate}</td>
                      <td>
                        <span className={`status-badge status-${doc.status}`}>
                          {doc.status}
                        </span>
                      </td>
                      <td>
                        <div className="flex space-x-2">
                          <button className="btn btn-outline btn-small">View</button>
                          <button className="btn btn-success btn-small">Approve</button>
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
                          <div className="font-medium">{request.requester}</div>
                        </div>
                      </td>
                      <td>{request.vendorCode}</td>
                      <td>{request.reason}</td>
                      <td>{request.requestDate}</td>
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
                              <button className="btn btn-success btn-small">Approve</button>
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
                          <div className="font-medium">{issue.user}</div>
                        </div>
                      </td>
                      <td>{issue.vendorCode}</td>
                      <td>{issue.issue}</td>
                      <td>{issue.reportedDate}</td>
                      <td>
                        <span className={`status-badge status-${issue.status}`}>
                          {issue.status}
                        </span>
                      </td>
                      <td>
                        <div className="flex space-x-2">
                          <button className="btn btn-outline btn-small">View</button>
                          {issue.status !== 'resolved' && (
                            <button className="btn btn-primary btn-small">Resolve</button>
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
    </DashboardLayout>
  );
};

export default HrDashboard;