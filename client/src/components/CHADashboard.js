import React, { useState } from 'react';
import DashboardLayout from './DashboardLayout';
import '../App.css';

const CHADashboard = () => {
  const [activeTab, setActiveTab] = useState('requests');

  // Mock data
  const serviceRequests = [
    {
      id: 1,
      catalog: 'Premium Electronics Components',
      buyer: 'BUY-23-XYZ789',
      seller: 'VEND-23-ABC123',
      status: 'pending'
    }
  ];

  const feeOffers = [
    {
      id: 1,
      catalog: 'Premium Electronics Components',
      buyer: 'BUY-23-XYZ789',
      seller: 'VEND-23-ABC123',
      fee: '$300',
      status: 'submitted'
    }
  ];

  const workOrders = [
    {
      id: 1,
      catalog: 'Premium Electronics Components',
      buyer: 'BUY-23-XYZ789',
      seller: 'VEND-23-ABC123',
      status: 'finalized'
    }
  ];

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