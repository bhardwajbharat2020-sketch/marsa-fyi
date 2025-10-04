import React, { useState } from 'react';
import DashboardLayout from './DashboardLayout';
import '../App.css';

const TransporterDashboard = () => {
  const [activeTab, setActiveTab] = useState('orders');

  // Mock data
  const workOrders = [
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
      status: 'in_transit'
    }
  ];

  const trackingInfo = [
    {
      id: 1,
      order: 'Premium Electronics Components',
      trackingId: 'TRK-2025-789456',
      status: 'in_transit'
    }
  ];

  return (
    <DashboardLayout title="Transporter Dashboard" role="transporter">
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
                          <button className="btn btn-primary btn-small">Start Transport</button>
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

export default TransporterDashboard;