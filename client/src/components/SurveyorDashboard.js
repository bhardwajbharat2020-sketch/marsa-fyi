import React, { useState } from 'react';
import DashboardLayout from './DashboardLayout';
import '../App.css';

const SurveyorDashboard = () => {
  const [activeTab, setActiveTab] = useState('requests');

  // Mock data
  const surveyRequests = [
    {
      id: 1,
      catalog: 'Premium Electronics Components',
      buyer: 'BUY-23-XYZ789',
      seller: 'VEND-23-ABC123',
      status: 'pending'
    },
    {
      id: 2,
      catalog: 'Industrial Machinery Parts',
      buyer: 'BUY-23-ABC123',
      seller: 'VEND-23-DEF456',
      status: 'accepted'
    }
  ];

  const surveyReports = [
    {
      id: 1,
      catalog: 'Premium Electronics Components',
      buyer: 'BUY-23-XYZ789',
      seller: 'VEND-23-ABC123',
      status: 'submitted'
    }
  ];

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