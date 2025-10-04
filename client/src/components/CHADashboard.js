import React, { useState, useEffect } from 'react';
import DashboardLayout from './DashboardLayout';
import '../App.css';

const CHADashboard = () => {
  const [activeTab, setActiveTab] = useState('requests');
  const [serviceRequests, setServiceRequests] = useState([]);
  const [feeOffers, setFeeOffers] = useState([]);
  const [workOrders, setWorkOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch real data from Supabase
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch service requests
        const requestsResponse = await fetch('/api/cha/requests');
        const requestsData = await requestsResponse.json();
        
        if (requestsResponse.ok) {
          setServiceRequests(requestsData);
        } else {
          console.error('Error fetching service requests:', requestsData.error);
        }
        
        // Fetch fee offers
        const feesResponse = await fetch('/api/cha/fees');
        const feesData = await feesResponse.json();
        
        if (feesResponse.ok) {
          setFeeOffers(feesData);
        } else {
          console.error('Error fetching fee offers:', feesData.error);
        }
        
        // Fetch work orders
        const ordersResponse = await fetch('/api/cha/orders');
        const ordersData = await ordersResponse.json();
        
        if (ordersResponse.ok) {
          setWorkOrders(ordersData);
        } else {
          console.error('Error fetching work orders:', ordersData.error);
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
    <DashboardLayout title="CHA Dashboard" role="cha">
      <div className="dashboard-tabs">
        <button 
          className={`tab ${activeTab === 'requests' ? 'active' : ''}`}
          onClick={() => setActiveTab('requests')}
        >
          Service Requests
        </button>
        <button 
          className={`tab ${activeTab === 'fees' ? 'active' : ''}`}
          onClick={() => setActiveTab('fees')}
        >
          Fee Offers
        </button>
        <button 
          className={`tab ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          Work Orders
        </button>
      </div>

      {loading && <div className="text-center py-10">Loading dashboard data...</div>}
      {error && <div className="text-center py-10 text-red-500">Error: {error}</div>}

      {activeTab === 'requests' && (
        <div>
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Service Requests</h2>
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
                  {serviceRequests.map(request => (
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

      {activeTab === 'fees' && (
        <div>
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Fee Offers</h2>
            </div>
            
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Catalog</th>
                    <th>Buyer</th>
                    <th>Seller</th>
                    <th>Fee</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {feeOffers.map(offer => (
                    <tr key={offer.id}>
                      <td>{offer.catalog}</td>
                      <td>{offer.buyer}</td>
                      <td>{offer.seller}</td>
                      <td>{offer.fee}</td>
                      <td>
                        <span className={`status-badge status-${offer.status}`}>
                          {offer.status}
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

      {activeTab === 'orders' && (
        <div>
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Work Orders</h2>
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
                  {workOrders.map(order => (
                    <tr key={order.id}>
                      <td>{order.catalog}</td>
                      <td>{order.buyer}</td>
                      <td>{order.seller}</td>
                      <td>
                        <span className={`status-badge status-${order.status}`}>
                          {order.status}
                        </span>
                      </td>
                      <td>
                        <button className="btn btn-outline btn-small">View</button>
                        <button className="btn btn-primary btn-small">Manage</button>
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

export default CHADashboard;