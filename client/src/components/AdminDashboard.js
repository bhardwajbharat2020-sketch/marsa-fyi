import React, { useState } from 'react';
import DashboardLayout from './DashboardLayout';
import '../App.css';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('catalogs');

  // Mock data
  const pendingCatalogs = [
    {
      id: 1,
      title: 'Premium Electronics Components',
      seller: 'VEND-23-ABC123',
      category: 'Electronics',
      price: '$5000',
      status: 'pending'
    },
    {
      id: 2,
      title: 'Industrial Machinery Parts',
      seller: 'VEND-23-DEF456',
      category: 'Machinery',
      price: '$12000',
      status: 'pending'
    }
  ];

  const surveyOffers = [
    {
      id: 1,
      catalog: 'Premium Electronics Components',
      buyer: 'BUY-23-XYZ789',
      surveyor: 'SUR-23-SUR123',
      fee: '$150',
      status: 'pending'
    }
  ];

  const disputeCases = [
    {
      id: 1,
      case: 'Rejected Survey Report',
      buyer: 'BUY-23-XYZ789',
      seller: 'VEND-23-ABC123',
      status: 'review_pending'
    }
  ];

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
                    <th>Catalog Title</th>
                    <th>Seller</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingCatalogs.map(catalog => (
                    <tr key={catalog.id}>
                      <td>{catalog.title}</td>
                      <td>{catalog.seller}</td>
                      <td>{catalog.category}</td>
                      <td>{catalog.price}</td>
                      <td>
                        <span className={`status-badge status-${catalog.status}`}>
                          {catalog.status}
                        </span>
                      </td>
                      <td>
                        <button className="btn btn-outline btn-small">View</button>
                        <button className="btn btn-success btn-small">Approve</button>
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
                    <th>Catalog</th>
                    <th>Buyer</th>
                    <th>Surveyor</th>
                    <th>Fee</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {surveyOffers.map(offer => (
                    <tr key={offer.id}>
                      <td>{offer.catalog}</td>
                      <td>{offer.buyer}</td>
                      <td>{offer.surveyor}</td>
                      <td>{offer.fee}</td>
                      <td>
                        <span className={`status-badge status-${offer.status}`}>
                          {offer.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td>
                        <button className="btn btn-outline btn-small">View</button>
                        <button className="btn btn-success btn-small">Approve</button>
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

      {activeTab === 'disputes' && (
        <div>
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Dispute Cases for Review</h2>
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
                  {disputeCases.map(caseItem => (
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
    </DashboardLayout>
  );
};

export default AdminDashboard;