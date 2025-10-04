import React, { useState } from 'react';
import DashboardLayout from './DashboardLayout';
import '../App.css';

const InsuranceAgentDashboard = () => {
  const [activeTab, setActiveTab] = useState('policies');

  // Mock data
  const policyRequests = [
    {
      id: 1,
      catalog: 'Premium Electronics Components',
      buyer: 'BUY-23-XYZ789',
      seller: 'VEND-23-ABC123',
      status: 'pending'
    }
  ];

  const policyDocuments = [
    {
      id: 1,
      catalog: 'Premium Electronics Components',
      buyer: 'BUY-23-XYZ789',
      seller: 'VEND-23-ABC123',
      status: 'finalized'
    }
  ];

  return (
    <DashboardLayout title="Insurance Agent Dashboard" role="insurance">
      <div className="dashboard-tabs">
        <button 
          className={`tab ${activeTab === 'policies' ? 'active' : ''}`}
          onClick={() => setActiveTab('policies')}
        >
          Policy Requests
        </button>
        <button 
          className={`tab ${activeTab === 'documents' ? 'active' : ''}`}
          onClick={() => setActiveTab('documents')}
        >
          Policy Documents
        </button>
      </div>

      {activeTab === 'policies' && (
        <div>
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Insurance Policy Requests</h2>
            </div>
            
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Catalog</th>
                    <th>Buyer</th>
                    <th>Seller</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {policyRequests.map(request => (
                    <tr key={request.id}>
                      <td>{request.catalog}</td>
                      <td>{request.buyer}</td>
                      <td>{request.seller}</td>
                      <td>
                        <span className={`status-badge status-${request.status}`}>
                          {request.status}
                        </span>
                      </td>
                      <td>
                        <button className="btn btn-outline btn-small">View</button>
                        <button className="btn btn-success btn-small">Accept</button>
                        <button className="btn btn-danger btn-small">Reject</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'documents' && (
        <div>
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Policy Documents</h2>
            </div>
            
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Catalog</th>
                    <th>Buyer</th>
                    <th>Seller</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {policyDocuments.map(document => (
                    <tr key={document.id}>
                      <td>{document.catalog}</td>
                      <td>{document.buyer}</td>
                      <td>{document.seller}</td>
                      <td>
                        <span className={`status-badge status-${document.status}`}>
                          {document.status}
                        </span>
                      </td>
                      <td>
                        <button className="btn btn-outline btn-small">View</button>
                        <button className="btn btn-primary btn-small">Download</button>
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

export default InsuranceAgentDashboard;