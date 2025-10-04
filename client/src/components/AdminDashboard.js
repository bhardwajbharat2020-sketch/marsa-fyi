import React, { useState, useEffect } from 'react';
import DashboardLayout from './DashboardLayout';
import '../App.css';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('catalogs');
  const [catalogs, setCatalogs] = useState([]);
  const [surveys, setSurveys] = useState([]);
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch real data from Supabase
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch pending catalogs
        const catalogsResponse = await fetch('/api/admin/catalogs');
        const catalogsData = await catalogsResponse.json();
        
        if (catalogsResponse.ok) {
          setCatalogs(catalogsData);
        } else {
          console.error('Error fetching catalogs:', catalogsData.error);
        }
        
        // Fetch survey offers
        const surveysResponse = await fetch('/api/admin/surveys');
        const surveysData = await surveysResponse.json();
        
        if (surveysResponse.ok) {
          setSurveys(surveysData);
        } else {
          console.error('Error fetching surveys:', surveysData.error);
        }
        
        // Fetch disputes
        const disputesResponse = await fetch('/api/admin/disputes');
        const disputesData = await disputesResponse.json();
        
        if (disputesResponse.ok) {
          setDisputes(disputesData);
        } else {
          console.error('Error fetching disputes:', disputesData.error);
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

  // Function to approve a catalog
  const approveCatalog = async (catalogId) => {
    try {
      const response = await fetch('/api/admin/catalogs/approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ catalogId }),
      });
      
      const result = await response.json();
      
      if (response.ok) {
        // Update the catalogs state to reflect the approval
        setCatalogs(prevCatalogs => 
          prevCatalogs.map(catalog => 
            catalog.id === catalogId 
              ? { ...catalog, status: 'approved' } 
              : catalog
          )
        );
        
        alert('Catalog approved successfully!');
      } else {
        alert('Failed to approve catalog: ' + result.error);
      }
    } catch (err) {
      console.error('Error approving catalog:', err);
      alert('Failed to approve catalog. Please try again.');
    }
  };

  // Function to approve a survey offer
  const approveSurvey = async (surveyId) => {
    try {
      const response = await fetch('/api/admin/surveys/approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ surveyId }),
      });
      
      const result = await response.json();
      
      if (response.ok) {
        // Update the surveys state to reflect the approval
        setSurveys(prevSurveys => 
          prevSurveys.map(survey => 
            survey.id === surveyId 
              ? { ...survey, status: 'approved' } 
              : survey
          )
        );
        
        alert('Survey offer approved successfully!');
      } else {
        alert('Failed to approve survey offer: ' + result.error);
      }
    } catch (err) {
      console.error('Error approving survey:', err);
      alert('Failed to approve survey offer. Please try again.');
    }
  };

  return (
    <DashboardLayout title="Admin Dashboard" role="admin">
      <div className="dashboard-tabs">
        <button 
          className={`tab ${activeTab === 'catalogs' ? 'active' : ''}`}
          onClick={() => setActiveTab('catalogs')}
        >
          Catalog Approval
        </button>
        <button 
          className={`tab ${activeTab === 'surveys' ? 'active' : ''}`}
          onClick={() => setActiveTab('surveys')}
        >
          Survey Offers
        </button>
        <button 
          className={`tab ${activeTab === 'disputes' ? 'active' : ''}`}
          onClick={() => setActiveTab('disputes')}
        >
          Dispute Review
        </button>
      </div>

      {loading && <div className="text-center py-10">Loading dashboard data...</div>}
      {error && <div className="text-center py-10 text-red-500">Error: {error}</div>}

      {!loading && !error && (
        <>
          {activeTab === 'catalogs' && (
            <div>
              <div className="card">
                <div className="card-header">
                  <h2 className="card-title">Pending Catalog Approvals</h2>
                </div>
                
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Seller</th>
                        <th>Category</th>
                        <th>Submitted At</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {catalogs.map(catalog => (
                        <tr key={catalog.id}>
                          <td>{catalog.title}</td>
                          <td>{catalog.seller}</td>
                          <td>{catalog.category}</td>
                          <td>{new Date(catalog.submittedAt).toLocaleDateString()}</td>
                          <td>
                            <button 
                              className="btn btn-success btn-small"
                              onClick={() => approveCatalog(catalog.id)}
                            >
                              Approve
                            </button>
                            <button className="btn btn-outline btn-small">View</button>
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

          {activeTab === 'surveys' && (
            <div>
              <div className="card">
                <div className="card-header">
                  <h2 className="card-title">Survey Offers</h2>
                </div>
                
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Buyer</th>
                        <th>Surveyor</th>
                        <th>Fee</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {surveys.map(survey => (
                        <tr key={survey.id}>
                          <td>{survey.productName}</td>
                          <td>{survey.buyerName}</td>
                          <td>{survey.surveyorName}</td>
                          <td>${survey.fee}</td>
                          <td>
                            <span className={`status-badge status-${survey.status}`}>
                              {survey.status}
                            </span>
                          </td>
                          <td>
                            {survey.status === 'pending' && (
                              <button 
                                className="btn btn-success btn-small"
                                onClick={() => approveSurvey(survey.id)}
                              >
                                Approve
                              </button>
                            )}
                            <button className="btn btn-outline btn-small">View</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'disputes' && (
            <div>
              <div className="card">
                <div className="card-header">
                  <h2 className="card-title">Dispute Review</h2>
                </div>
                
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Dispute ID</th>
                        <th>Order ID</th>
                        <th>Type</th>
                        <th>Submitted By</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {disputes.map(dispute => (
                        <tr key={dispute.id}>
                          <td>{dispute.id}</td>
                          <td>{dispute.orderId}</td>
                          <td>{dispute.type}</td>
                          <td>{dispute.submittedBy}</td>
                          <td>
                            <span className={`status-badge status-${dispute.status}`}>
                              {dispute.status}
                            </span>
                          </td>
                          <td>
                            <button className="btn btn-outline btn-small">View</button>
                            <button className="btn btn-primary btn-small">Assign</button>
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

export default AdminDashboard;