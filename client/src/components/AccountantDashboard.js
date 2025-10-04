import React, { useState } from 'react';
import DashboardLayout from './DashboardLayout';
import '../App.css';

const AccountantDashboard = () => {
  const [activeTab, setActiveTab] = useState('payments');

  // Mock data
  const pendingPayments = [
    {
      id: 1,
      type: 'DPQ',
      buyer: 'BUY-23-XYZ789',
      seller: 'VEND-23-ABC123',
      amount: '$5200',
      status: 'pending'
    },
    {
      id: 2,
      type: 'Survey Fee',
      buyer: 'BUY-23-XYZ789',
      seller: 'VEND-23-ABC123',
      amount: '$150',
      status: 'pending'
    }
  ];

  const invoices = [
    {
      id: 1,
      type: 'Final Quotation',
      buyer: 'BUY-23-XYZ789',
      seller: 'VEND-23-ABC123',
      amount: '$5200',
      status: 'generated'
    }
  ];

  const disputeReviews = [
    {
      id: 1,
      case: 'Rejected Survey Report',
      buyer: 'BUY-23-XYZ789',
      seller: 'VEND-23-ABC123',
      status: 'pending_review'
    }
  ];

  return (
    <DashboardLayout title="Accountant Dashboard" role="accountant">
      <div className="dashboard-tabs">
        <button 
          className={`tab ${activeTab === 'payments' ? 'active' : ''}`}
          onClick={() => setActiveTab('payments')}
        >
          Payment Management
        </button>
        <button 
          className={`tab ${activeTab === 'invoices' ? 'active' : ''}`}
          onClick={() => setActiveTab('invoices')}
        >
          Invoice Generation
        </button>
        <button 
          className={`tab ${activeTab === 'disputes' ? 'active' : ''}`}
          onClick={() => setActiveTab('disputes')}
        >
          Dispute Review
        </button>
      </div>

      {activeTab === 'payments' && (
        <div>
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Pending Payments</h2>
            </div>
            
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Buyer</th>
                    <th>Seller</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingPayments.map(payment => (
                    <tr key={payment.id}>
                      <td>{payment.type}</td>
                      <td>{payment.buyer}</td>
                      <td>{payment.seller}</td>
                      <td>{payment.amount}</td>
                      <td>
                        <span className={`status-badge status-${payment.status}`}>
                          {payment.status}
                        </span>
                      </td>
                      <td>
                        <button className="btn btn-outline btn-small">View</button>
                        <button className="btn btn-success btn-small">Process</button>
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
              <h2 className="card-title">Generated Invoices</h2>
            </div>
            
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Buyer</th>
                    <th>Seller</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map(invoice => (
                    <tr key={invoice.id}>
                      <td>{invoice.type}</td>
                      <td>{invoice.buyer}</td>
                      <td>{invoice.seller}</td>
                      <td>{invoice.amount}</td>
                      <td>
                        <span className={`status-badge status-${invoice.status}`}>
                          {invoice.status}
                        </span>
                      </td>
                      <td>
                        <button className="btn btn-outline btn-small">View</button>
                        <button className="btn btn-primary btn-small">Send</button>
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
              <h2 className="card-title">Dispute Reviews</h2>
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
                  {disputeReviews.map(review => (
                    <tr key={review.id}>
                      <td>{review.case}</td>
                      <td>{review.buyer}</td>
                      <td>{review.seller}</td>
                      <td>
                        <span className={`status-badge status-${review.status}`}>
                          {review.status.replace('_', ' ')}
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

export default AccountantDashboard;