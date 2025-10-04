import React, { useState, useEffect } from 'react';
import DashboardLayout from './DashboardLayout';
import '../App.css';

const LogisticsDashboard = () => {
  const [activeTab, setActiveTab] = useState('orders');
  const [workOrders, setWorkOrders] = useState([]);
  const [trackingInfo, setTrackingInfo] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch real data from Supabase
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch work orders
        const ordersResponse = await fetch('/api/logistics/orders');
        const ordersData = await ordersResponse.json();
        
        if (ordersResponse.ok) {
          setWorkOrders(ordersData);
        } else {
          console.error('Error fetching work orders:', ordersData.error);
        }
        
        // Fetch tracking information
        const trackingResponse = await fetch('/api/logistics/tracking');
        const trackingData = await trackingResponse.json();
        
        if (trackingResponse.ok) {
          setTrackingInfo(trackingData);
        } else {
          console.error('Error fetching tracking info:', trackingData.error);
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
    <DashboardLayout title="Logistics Dashboard" role="logistics">
      <div className="dashboard-tabs">
        <button 
          className={`tab ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          Work Orders
        </button>
        <button 
          className={`tab ${activeTab === 'tracking' ? 'active' : ''}`}
          onClick={() => setActiveTab('tracking')}
        >
          Tracking
        </button>
      </div>

      {loading && <div className="text-center py-10">Loading dashboard data...</div>}
      {error && <div className="text-center py-10 text-red-500">Error: {error}</div>}

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
                          {order.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td>
                        <button className="btn btn-outline btn-small">View</button>
                        {order.status === 'pending' && (
                          <>
                            <button className="btn btn-success btn-small">Accept</button>
                            <button className="btn btn-danger btn-small">Reject</button>
                          </>
                        )}
                        {order.status === 'accepted' && (
                          <button className="btn btn-primary btn-small">Start Logistics</button>
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

      {activeTab === 'tracking' && (
        <div>
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Tracking Information</h2>
            </div>
            
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Tracking ID</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {trackingInfo.map(track => (
                    <tr key={track.id}>
                      <td>{track.order}</td>
                      <td>{track.trackingId}</td>
                      <td>
                        <span className={`status-badge status-${track.status}`}>
                          {track.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td>
                        <button className="btn btn-outline btn-small">View</button>
                        <button className="btn btn-primary btn-small">Update</button>
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

export default LogisticsDashboard;