import React, { useState, useEffect } from 'react';
import DashboardLayout from './DashboardLayout';
import '../App.css';

const AccountantDashboard = () => {
  const [activeTab, setActiveTab] = useState('payments');
  const [payments, setPayments] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch real data from Supabase
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch payments
        const paymentsResponse = await fetch('/api/accountant/payments');
        const paymentsData = await paymentsResponse.json();
        
        if (paymentsResponse.ok) {
          setPayments(paymentsData);
        } else {
          console.error('Error fetching payments:', paymentsData.error);
        }
        
        // Fetch invoices
        const invoicesResponse = await fetch('/api/accountant/invoices');
        const invoicesData = await invoicesResponse.json();
        
        if (invoicesResponse.ok) {
          setInvoices(invoicesData);
        } else {
          console.error('Error fetching invoices:', invoicesData.error);
        }
        
        // Fetch disputes
        const disputesResponse = await fetch('/api/accountant/disputes');
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

  // Function to process a payment
  const processPayment = async (paymentId) => {
    try {
      const response = await fetch('/api/accountant/payments/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ paymentId }),
      });
      
      const result = await response.json();
      
      if (response.ok) {
        // Update the payments state to reflect the processing
        setPayments(prevPayments => 
          prevPayments.map(payment => 
            payment.id === paymentId 
              ? { ...payment, status: 'processed' } 
              : payment
          )
        );
        
        alert('Payment processed successfully!');
      } else {
        alert('Failed to process payment: ' + result.error);
      }
    } catch (err) {
      console.error('Error processing payment:', err);
      alert('Failed to process payment. Please try again.');
    }
  };

  // Function to generate an invoice
  const generateInvoice = async (orderId) => {
    try {
      const response = await fetch('/api/accountant/invoices/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderId }),
      });
      
      const result = await response.json();
      
      if (response.ok) {
        // Add the new invoice to the invoices state
        setInvoices(prevInvoices => [...prevInvoices, result.invoice]);
        
        alert('Invoice generated successfully!');
      } else {
        alert('Failed to generate invoice: ' + result.error);
      }
    } catch (err) {
      console.error('Error generating invoice:', err);
      alert('Failed to generate invoice. Please try again.');
    }
  };

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

      {loading && <div className="text-center py-10">Loading dashboard data...</div>}
      {error && <div className="text-center py-10 text-red-500">Error: {error}</div>}

      {!loading && !error && (
        <>
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
                        <th>Payment ID</th>
                        <th>Order ID</th>
                        <th>Amount</th>
                        <th>Currency</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map(payment => (
                        <tr key={payment.id}>
                          <td>{payment.id}</td>
                          <td>{payment.orderId}</td>
                          <td>${payment.amount}</td>
                          <td>{payment.currency}</td>
                          <td>
                            <span className={`status-badge status-${payment.status}`}>
                              {payment.status}
                            </span>
                          </td>
                          <td>
                            {payment.status === 'pending' && (
                              <button 
                                className="btn btn-success btn-small"
                                onClick={() => processPayment(payment.id)}
                              >
                                Process
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

          {activeTab === 'invoices' && (
            <div>
              <div className="card">
                <div className="card-header">
                  <h2 className="card-title">Invoice Generation</h2>
                  <button className="btn btn-primary">Generate Bulk Invoices</button>
                </div>
                
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Invoice ID</th>
                        <th>Order ID</th>
                        <th>Buyer</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoices.map(invoice => (
                        <tr key={invoice.id}>
                          <td>{invoice.id}</td>
                          <td>{invoice.orderId}</td>
                          <td>{invoice.buyerName}</td>
                          <td>${invoice.amount}</td>
                          <td>
                            <span className={`status-badge status-${invoice.status}`}>
                              {invoice.status}
                            </span>
                          </td>
                          <td>
                            <button className="btn btn-outline btn-small">View</button>
                            <button className="btn btn-primary btn-small">Download</button>
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
                            <button className="btn btn-success btn-small">Approve Refund</button>
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

export default AccountantDashboard;