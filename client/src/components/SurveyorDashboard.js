import React, { useState, useEffect } from 'react';
import DashboardLayout from './DashboardLayout';
import WorkflowTracker from './WorkflowTracker';
import '../App.css';

const SurveyorDashboard = () => {
  const [activeTab, setActiveTab] = useState('requests');
  const [surveyRequests, setSurveyRequests] = useState([]);
  const [surveyReports, setSurveyReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showWorkflowTracker, setShowWorkflowTracker] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState(null);

  // Fetch real data from Supabase
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch survey requests
        const requestsResponse = await fetch('/api/surveyor/requests');
        const requestsData = await requestsResponse.json();
        
        if (requestsResponse.ok) {
          setSurveyRequests(requestsData);
        } else {
          console.error('Error fetching requests:', requestsData.error);
        }
        
        // Fetch survey reports
        const reportsResponse = await fetch('/api/surveyor/reports');
        const reportsData = await reportsResponse.json();
        
        if (reportsResponse.ok) {
          setSurveyReports(reportsData);
        } else {
          console.error('Error fetching reports:', reportsData.error);
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
    <DashboardLayout title="Surveyor Dashboard" role="surveyor">
      <div className="dashboard-tabs">
        <button 
          className={`tab ${activeTab === 'requests' ? 'active' : ''}`}
          onClick={() => setActiveTab('requests')}
        >
          Survey Requests
        </button>
        <button 
          className={`tab ${activeTab === 'reports' ? 'active' : ''}`}
          onClick={() => setActiveTab('reports')}
        >
          Survey Reports
        </button>
      </div>

      {loading && <div className="text-center py-10">Loading dashboard data...</div>}
      {error && <div className="text-center py-10 text-red-500">Error: {error}</div>}

      {showWorkflowTracker && (
        <WorkflowTracker 
          orderId={selectedRequestId} 
          onClose={() => setShowWorkflowTracker(false)} 
        />
      )}
      
      {activeTab === 'requests' && (
        <div>
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Survey Requests</h2>
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
                  {surveyRequests.map(request => (
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
                        {request.status === 'pending' && (
                          <>
                            <button className="btn btn-success btn-small">Accept</button>
                            <button className="btn btn-danger btn-small">Reject</button>
                          </>
                        )}
                        {request.status === 'accepted' && (
                          <button className="btn btn-primary btn-small">Fill Survey</button>
                        )}
                        <button 
                          className="btn btn-info btn-small"
                          onClick={() => {
                            setSelectedRequestId(request.id);
                            setShowWorkflowTracker(true);
                          }}
                        >
                          Workflow
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'reports' && (
        <div>
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Survey Reports</h2>
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
                  {surveyReports.map(report => (
                    <tr key={report.id}>
                      <td>{report.catalog}</td>
                      <td>{report.buyer}</td>
                      <td>{report.seller}</td>
                      <td>
                        <span className={`status-badge status-${report.status}`}>
                          {report.status}
                        </span>
                      </td>
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
    </DashboardLayout>
  );
};

export default SurveyorDashboard;