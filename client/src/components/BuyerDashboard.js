import React, { useState, useEffect } from 'react';
import DashboardLayout from './DashboardLayout';
import '../App.css';

const BuyerDashboard = () => {
  const [activeTab, setActiveTab] = useState('rfqs');
  const [rfqs, setRfqs] = useState([]);
  const [surveys, setSurveys] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch real data from Supabase
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // For now, we'll use mock data since we don't have specific endpoints for these
        // In a real implementation, you would fetch from specific API endpoints
        setRfqs([
          {
            id: 1,
            catalog: 'Premium Electronics Components',
            seller: 'VEND-23-ABC123',
            status: 'priced',
            price: '$5200',
            validity: '2025-12-31'
          },
          {
            id: 2,
            catalog: 'Industrial Machinery Parts',
            seller: 'VEND-23-DEF456',
            status: 'pending',
            price: '-',
            validity: '-'
          },
          {
            id: 3,
            catalog: 'Organic Textiles',
            seller: 'VEND-23-XYZ789',
            status: 'accepted',
            price: '$3500',
            validity: '2025-10-30'
          }
        ]);

        setSurveys([
          {
            id: 1,
            catalog: 'Premium Electronics Components',
            seller: 'VEND-23-ABC123',
            status: 'fee_paid',
            fee: '$150'
          },
          {
            id: 2,
            catalog: 'Industrial Machinery Parts',
            seller: 'VEND-23-DEF456',
            status: 'report_received',
            fee: '$200'
          }
        ]);

        setOrders([
          {
            id: 1,
            catalog: 'Organic Textiles',
            seller: 'VEND-23-XYZ789',
            status: 'in_transit',
            tracking: 'TRK-2025-789456'
          }
        ]);
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
    <DashboardLayout title="Buyer Dashboard" role="buyer">
      <div className="dashboard-tabs">
        <button 
          className={`tab ${activeTab === 'rfqs' ? 'active' : ''}`}
          onClick={() => setActiveTab('rfqs')}
        >
          My RFQs
        </button>
        <button 
          className={`tab ${activeTab === 'surveys' ? 'active' : ''}`}
          onClick={() => setActiveTab('surveys')}
        >
          My Surveys
        </button>
        <button 
          className={`tab ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          My Orders
        </button>
        <button 
          className={`tab ${activeTab === 'invoices' ? 'active' : ''}`}
          onClick={() => setActiveTab('invoices')}
        >
          My Invoices
        </button>
        <button 
          className={`tab ${activeTab === 'disputes' ? 'active' : ''}`}
          onClick={() => setActiveTab('disputes')}
        >
          Disputes
        </button>
      </div>

      {loading && <div className="text-center py-10">Loading dashboard data...</div>}
      {error && <div className="text-center py-10 text-red-500">Error: {error}</div>}

      {!loading && !error && (
        <>
          {activeTab === 'rfqs' && (
            <div>
              <div className="card">
                <div className="card-header">
                  <h2 className="card-title">Requested Quotations (RFQs)</h2>
                </div>
                
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Catalog</th>
                        <th>Seller</th>
                        <th>Status</th>
                        <th>Price</th>
                        <th>Validity</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rfqs.map(rfq => (
                        <tr key={rfq.id}>
                          <td>{rfq.catalog}</td>
                          <td>{rfq.seller}</td>
                          <td>
                            <span className={`status-badge status-${rfq.status}`}>
                              {rfq.status.replace('_', ' ')}
                            </span>
                          </td>
                          <td>{rfq.price}</td>
                          <td>{rfq.validity}</td>
                          <td>
                            <button className="btn btn-outline btn-small">View</button>
                            {rfq.status === 'priced' && (
                              <>
                                <button className="btn btn-success btn-small">Accept</button>
                                <button className="btn btn-warning btn-small">Negotiate</button>
                              </>
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

          {activeTab === 'surveys' && (
            <div>
              <div className="card">
                <div className="card-header">
                  <h2 className="card-title">My Surveys</h2>
                </div>
                
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Catalog</th>
                        <th>Seller</th>
                        <th>Status</th>
                        <th>Survey Fee</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {surveys.map(survey => (
                        <tr key={survey.id}>
                          <td>{survey.catalog}</td>
                          <td>{survey.seller}</td>
                          <td>
                            <span className={`status-badge status-${survey.status}`}>
                              {survey.status.replace('_', ' ')}
                            </span>
                          </td>
                          <td>{survey.fee}</td>
                          <td>
                            <button className="btn btn-outline btn-small">View</button>
                            {survey.status === 'fee_paid' && (
                              <button className="btn btn-primary btn-small">Pay Survey Fee</button>
                            )}
                            {survey.status === 'report_received' && (
                              <>
                                <button className="btn btn-success btn-small">Accept</button>
                                <button className="btn btn-danger btn-small">Reject</button>
                              </>
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

          {activeTab === 'orders' && (
            <div>
              <div className="card">
                <div className="card-header">
                  <h2 className="card-title">My Orders</h2>
                </div>
                
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Catalog</th>
                        <th>Seller</th>
                        <th>Status</th>
                        <th>Tracking</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map(order => (
                        <tr key={order.id}>
                          <td>{order.catalog}</td>
                          <td>{order.seller}</td>
                          <td>
                            <span className={`status-badge status-${order.status}`}>
                              {order.status.replace('_', ' ')}
                            </span>
                          </td>
                          <td>{order.tracking}</td>
                          <td>
                            <button className="btn btn-outline btn-small">View</button>
                            <button className="btn btn-primary btn-small">Track</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'invoices' && (
            <div>
              <div className="card">
                <div className="card-header">
                  <h2 className="card-title">My Invoices</h2>
                </div>
                <p>Invoice management features will be implemented here.</p>
              </div>
            </div>
          )}

          {activeTab === 'disputes' && (
            <div>
              <div className="card">
                <div className="card-header">
                  <h2 className="card-title">Dispute Management</h2>
                </div>
                <p>Dispute management features will be implemented here.</p>
              </div>
            </div>
          )}
        </>
      )}
    </DashboardLayout>
  );
};

export default BuyerDashboard;