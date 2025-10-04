import React, { useState, useEffect } from 'react';
import DashboardLayout from './DashboardLayout';
import '../App.css';

const InsuranceAgentDashboard = () => {
  const [activeTab, setActiveTab] = useState('policies');
  const [policyRequests, setPolicyRequests] = useState([]);
  const [policyDocuments, setPolicyDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch real data from Supabase
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch policy requests
        const requestsResponse = await fetch('/api/insurance/policies');
        const requestsData = await requestsResponse.json();
        
        if (requestsResponse.ok) {
          setPolicyRequests(requestsData);
        } else {
          console.error('Error fetching policy requests:', requestsData.error);
        }
        
        // Fetch policy documents
        const documentsResponse = await fetch('/api/insurance/documents');
        const documentsData = await documentsResponse.json();
        
        if (documentsResponse.ok) {
          setPolicyDocuments(documentsData);
        } else {
          console.error('Error fetching policy documents:', documentsData.error);
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

      {loading && <div className="text-center py-10">Loading dashboard data...</div>}
      {error && <div className="text-center py-10 text-red-500">Error: {error}</div>}

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