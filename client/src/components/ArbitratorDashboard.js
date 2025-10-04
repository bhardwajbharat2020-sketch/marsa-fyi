import React, { useState, useEffect } from 'react';
import DashboardLayout from './DashboardLayout';
import '../App.css';

const ArbitratorDashboard = () => {
  const [activeTab, setActiveTab] = useState('cases');
  const [arbitrationCases, setArbitrationCases] = useState([]);
  const [evidenceRequests, setEvidenceRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch real data from Supabase
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch arbitration cases
        const casesResponse = await fetch('/api/arbitrator/cases');
        const casesData = await casesResponse.json();
        
        if (casesResponse.ok) {
          setArbitrationCases(casesData);
        } else {
          console.error('Error fetching cases:', casesData.error);
        }
        
        // Fetch evidence requests
        const evidenceResponse = await fetch('/api/arbitrator/evidence');
        const evidenceData = await evidenceResponse.json();
        
        if (evidenceResponse.ok) {
          setEvidenceRequests(evidenceData);
        } else {
          console.error('Error fetching evidence:', evidenceData.error);
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

      {loading && <div className="text-center py-10">Loading dashboard data...</div>}
      {error && <div className="text-center py-10 text-red-500">Error: {error}</div>}

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