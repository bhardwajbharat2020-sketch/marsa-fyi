import React, { useState } from 'react';
import DashboardLayout from './DashboardLayout';
import '../App.css';

const ArbitratorDashboard = () => {
  const [activeTab, setActiveTab] = useState('cases');

  // Mock data
  const arbitrationCases = [
    {
      id: 1,
      case: 'Rejected Survey Report',
      buyer: 'BUY-23-XYZ789',
      seller: 'VEND-23-ABC123',
      status: 'in_progress'
    },
    {
      id: 2,
      case: 'Delivery Dispute',
      buyer: 'BUY-23-ABC123',
      seller: 'VEND-23-DEF456',
      status: 'pending'
    }
  ];

  const evidenceRequests = [
    {
      id: 1,
      case: 'Rejected Survey Report',
      party: 'Buyer',
      document: 'Rejection Reason',
      status: 'submitted'
    }
  ];

  return (
    <DashboardLayout title="Arbitrator Dashboard" role="arbitrator">
      <div className="dashboard-tabs">
        <button 
          className={`tab ${activeTab === 'cases' ? 'active' : ''}`}
          onClick={() => setActiveTab('cases')}
        >
          Case Management
        </button>
        <button 
          className={`tab ${activeTab === 'evidence' ? 'active' : ''}`}
          onClick={() => setActiveTab('evidence')}
        >
          Evidence Presentation
        </button>
        <button 
          className={`tab ${activeTab === 'messaging' ? 'active' : ''}`}
          onClick={() => setActiveTab('messaging')}
        >
          Secure Messaging
        </button>
      </div>

      {activeTab === 'cases' && (
        <div>
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Arbitration Cases</h2>
            </div>
            
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Case</th>
                    <th>Buyer</th>
                    <th>Seller</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {arbitrationCases.map(caseItem => (
                    <tr key={caseItem.id}>
                      <td>{caseItem.case}</td>
                      <td>{caseItem.buyer}</td>
                      <td>{caseItem.seller}</td>
                      <td>
                        <span className={`status-badge status-${caseItem.status}`}>
                          {caseItem.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td>
                        <button className="btn btn-outline btn-small">View</button>
                        <button className="btn btn-primary btn-small">Review</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'evidence' && (
        <div>
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Evidence Requests</h2>
            </div>
            
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Case</th>
                    <th>Party</th>
                    <th>Document</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {evidenceRequests.map(request => (
                    <tr key={request.id}>
                      <td>{request.case}</td>
                      <td>{request.party}</td>
                      <td>{request.document}</td>
                      <td>
                        <span className={`status-badge status-${request.status}`}>
                          {request.status}
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

      {activeTab === 'messaging' && (
        <div>
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Secure Messaging</h2>
            </div>
            <p>Secure messaging interface for communication with involved parties.</p>
            <div className="messaging-interface">
              <div className="message-history">
                <div className="message received">
                  <div className="sender">Buyer (BUY-23-XYZ789)</div>
                  <div className="content">The survey report does not match the product specifications.</div>
                  <div className="timestamp">2025-10-01 14:30</div>
                </div>
                <div className="message sent">
                  <div className="sender">You (Arbitrator)</div>
                  <div className="content">Please provide additional evidence to support your claim.</div>
                  <div className="timestamp">2025-10-01 15:45</div>
                </div>
              </div>
              <div className="message-input">
                <textarea placeholder="Type your message here..." className="form-control"></textarea>
                <button className="btn btn-primary">Send</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default ArbitratorDashboard;