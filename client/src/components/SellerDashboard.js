import React, { useState, useEffect } from 'react';
import DashboardLayout from './DashboardLayout';
import '../App.css';

const SellerDashboard = () => {
  const [activeTab, setActiveTab] = useState('catalogs');
  const [catalogs, setCatalogs] = useState([]);
  const [dpos, setDpos] = useState([]);
  const [payments, setPayments] = useState([]);
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch real data from Supabase
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch seller's catalogs
        const catalogsResponse = await fetch('/api/seller/catalogs');
        const catalogsData = await catalogsResponse.json();
        
        if (catalogsResponse.ok) {
          setCatalogs(catalogsData);
        } else {
          console.error('Error fetching catalogs:', catalogsData.error);
        }
        
        // Fetch seller's DPOs
        const dposResponse = await fetch('/api/seller/dpos');
        const dposData = await dposResponse.json();
        
        if (dposResponse.ok) {
          setDpos(dposData);
        } else {
          console.error('Error fetching DPOs:', dposData.error);
        }
        
        // Fetch seller's payments
        const paymentsResponse = await fetch('/api/seller/payments');
        const paymentsData = await paymentsResponse.json();
        
        if (paymentsResponse.ok) {
          setPayments(paymentsData);
        } else {
          console.error('Error fetching payments:', paymentsData.error);
        }
        
        // Fetch seller's payout history
        const payoutsResponse = await fetch('/api/seller/payouts');
        const payoutsData = await payoutsResponse.json();
        
        if (payoutsResponse.ok) {
          setPayouts(payoutsData);
        } else {
          console.error('Error fetching payouts:', payoutsData.error);
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

  // Function to approve a payment
  const approvePayment = async (paymentId) => {
    try {
      const response = await fetch('/api/payments/approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          paymentId: paymentId,
          approvedBy: 'seller' // In a real app, this would be the current user
        }),
      });
      
      const result = await response.json();
      
      if (response.ok) {
        // Update the payments state to reflect the approval
        setPayments(prevPayments => 
          prevPayments.map(payment => 
            payment.id === paymentId 
              ? { ...payment, status: 'approved' } 
              : payment
          )
        );
        
        // Add the new payout to the payouts state
        if (result.payout) {
          setPayouts(prevPayouts => [...prevPayouts, result.payout]);
        }
        
        alert('Payment approved successfully!');
      } else {
        alert('Failed to approve payment: ' + result.error);
      }
    } catch (err) {
      console.error('Error approving payment:', err);
      alert('Failed to approve payment. Please try again.');
    }
  };

  return (
    <DashboardLayout title="Seller Dashboard" role="seller">
      <div className="dashboard-tabs">
        <button 
          className={`tab ${activeTab === 'catalogs' ? 'active' : ''}`}
          onClick={() => setActiveTab('catalogs')}
        >
          My Catalogs
        </button>
        <button 
          className={`tab ${activeTab === 'dpos' ? 'active' : ''}`}
          onClick={() => setActiveTab('dpos')}
        >
          DPO Management
        </button>
        <button 
          className={`tab ${activeTab === 'payments' ? 'active' : ''}`}
          onClick={() => setActiveTab('payments')}
        >
          Payments
        </button>
        <button 
          className={`tab ${activeTab === 'payouts' ? 'active' : ''}`}
          onClick={() => setActiveTab('payouts')}
        >
          Payout History
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
                  <h2 className="card-title">My Product Catalogs</h2>
                  <button className="btn btn-primary">Add New Product</button>
                </div>
                
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Category</th>
                        <th>Price</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {catalogs.map(catalog => (
                        <tr key={catalog.id}>
                          <td>{catalog.title}</td>
                          <td>{catalog.category}</td>
                          <td>${catalog.price}</td>
                          <td>
                            <span className={`status-badge status-${catalog.status}`}>
                              {catalog.status}
                            </span>
                          </td>
                          <td>
                            <button className="btn btn-outline btn-small">Edit</button>
                            <button className="btn btn-danger btn-small">Delete</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'dpos' && (
            <div>
              <div className="card">
                <div className="card-header">
                  <h2 className="card-title">DPO Management</h2>
                </div>
                
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Buyer</th>
                        <th>Quantity</th>
                        <th>Total Price</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dpos.map(dpo => (
                        <tr key={dpo.id}>
                          <td>{dpo.productName}</td>
                          <td>{dpo.buyerName}</td>
                          <td>{dpo.quantity}</td>
                          <td>${dpo.totalPrice}</td>
                          <td>
                            <span className={`status-badge status-${dpo.status}`}>
                              {dpo.status}
                            </span>
                          </td>
                          <td>
                            <button className="btn btn-outline btn-small">View</button>
                            <button className="btn btn-primary btn-small">Process</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'payments' && (
            <div>
              <div className="card">
                <div className="card-header">
                  <h2 className="card-title">Payment Management</h2>
                </div>
                
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Amount</th>
                        <th>Currency</th>
                        <th>Status</th>
                        <th>Created At</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map(payment => (
                        <tr key={payment.id}>
                          <td>{payment.id}</td>
                          <td>${payment.amount}</td>
                          <td>{payment.currency}</td>
                          <td>
                            <span className={`status-badge status-${payment.status}`}>
                              {payment.status}
                            </span>
                          </td>
                          <td>{new Date(payment.created_at).toLocaleDateString()}</td>
                          <td>
                            {payment.status === 'pending' && (
                              <button 
                                className="btn btn-success btn-small"
                                onClick={() => approvePayment(payment.id)}
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

          {activeTab === 'payouts' && (
            <div>
              <div className="card">
                <div className="card-header">
                  <h2 className="card-title">Payout History</h2>
                </div>
                
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Payment ID</th>
                        <th>Amount</th>
                        <th>Currency</th>
                        <th>Status</th>
                        <th>Processed At</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payouts.map(payout => (
                        <tr key={payout.id}>
                          <td>{payout.payment_id}</td>
                          <td>${payout.amount}</td>
                          <td>{payout.currency}</td>
                          <td>
                            <span className={`status-badge status-${payout.status}`}>
                              {payout.status}
                            </span>
                          </td>
                          <td>{payout.processed_at ? new Date(payout.processed_at).toLocaleDateString() : 'N/A'}</td>
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

export default SellerDashboard;