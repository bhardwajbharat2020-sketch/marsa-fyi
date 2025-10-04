import React, { useState, useEffect } from 'react';
import DashboardLayout from './DashboardLayout';
import WorkflowTracker from './WorkflowTracker.js';
import '../App.css';

const BuyerDashboard = () => {
  const [activeTab, setActiveTab] = useState('rfqs');
  const [rfqs, setRfqs] = useState([]);
  const [surveys, setSurveys] = useState([]);
  const [orders, setOrders] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [products, setProducts] = useState([]); // For creating DPQs
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showWorkflowTracker, setShowWorkflowTracker] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  
  // State for creating DPQ
  const [showCreateDpqForm, setShowCreateDpqForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [dpqQuantity, setDpqQuantity] = useState('');
  const [dpqSpecifications, setDpqSpecifications] = useState('');
  const [dpqDeliveryPort, setDpqDeliveryPort] = useState('');
  const [dpqDeliveryDate, setDpqDeliveryDate] = useState('');
  const [dpqPaymentTerms, setDpqPaymentTerms] = useState('');

  // Fetch real data from Supabase
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch buyer's RFQs
        const rfqsResponse = await fetch('/api/buyer/rfqs');
        const rfqsData = await rfqsResponse.json();
        
        if (rfqsResponse.ok) {
          setRfqs(rfqsData);
        } else {
          console.error('Error fetching RFQs:', rfqsData.error);
        }
        
        // Fetch buyer's surveys
        const surveysResponse = await fetch('/api/buyer/surveys');
        const surveysData = await surveysResponse.json();
        
        if (surveysResponse.ok) {
          setSurveys(surveysData);
        } else {
          console.error('Error fetching surveys:', surveysData.error);
        }
        
        // Fetch buyer's orders
        const ordersResponse = await fetch('/api/buyer/orders');
        const ordersData = await ordersResponse.json();
        
        if (ordersResponse.ok) {
          setOrders(ordersData);
        } else {
          console.error('Error fetching orders:', ordersData.error);
        }
        
        // Fetch buyer's invoices
        const invoicesResponse = await fetch('/api/buyer/invoices');
        const invoicesData = await invoicesResponse.json();
        
        if (invoicesResponse.ok) {
          setInvoices(invoicesData);
        } else {
          console.error('Error fetching invoices:', invoicesData.error);
        }
        
        // Fetch products for DPQ creation
        const productsResponse = await fetch('/api/products');
        const productsData = await productsResponse.json();
        
        if (productsResponse.ok) {
          setProducts(productsData);
        } else {
          console.error('Error fetching products:', productsData.error);
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

  // Function to create a DPQ
  const createDpq = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/buyer/dpqs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: selectedProduct,
          quantity: parseInt(dpqQuantity),
          specifications: dpqSpecifications,
          deliveryPortId: parseInt(dpqDeliveryPort),
          deliveryDate: dpqDeliveryDate,
          paymentTerms: dpqPaymentTerms
        }),
      });
      
      const result = await response.json();
      
      if (response.ok) {
        alert('DPQ created successfully!');
        // Reset form
        setSelectedProduct('');
        setDpqQuantity('');
        setDpqSpecifications('');
        setDpqDeliveryPort('');
        setDpqDeliveryDate('');
        setDpqPaymentTerms('');
        setShowCreateDpqForm(false);
        // Refresh RFQs
        fetchData();
      } else {
        alert('Failed to create DPQ: ' + result.error);
      }
    } catch (err) {
      console.error('Error creating DPQ:', err);
      alert('Failed to create DPQ. Please try again.');
    }
  };

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
          {showWorkflowTracker && (
            <WorkflowTracker 
              orderId={selectedOrderId} 
              onClose={() => setShowWorkflowTracker(false)} 
            />
          )}
          
          {activeTab === 'rfqs' && (
            <div>
              <div className="card">
                <div className="card-header">
                  <h2 className="card-title">Requested Quotations (RFQs)</h2>
                  <button 
                    className="btn btn-primary"
                    onClick={() => setShowCreateDpqForm(!showCreateDpqForm)}
                  >
                    {showCreateDpqForm ? 'Cancel' : 'Create New RFQ'}
                  </button>
                </div>
                
                {showCreateDpqForm && (
                  <div className="card">
                    <h3>Create New Document of Product Quantity (DPQ)</h3>
                    <form onSubmit={createDpq}>
                      <div className="form-group">
                        <label>Product</label>
                        <select 
                          className="form-control"
                          value={selectedProduct}
                          onChange={(e) => setSelectedProduct(e.target.value)}
                          required
                        >
                          <option value="">Select a product</option>
                          {products.map(product => (
                            <option key={product.id} value={product.id}>
                              {product.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="form-group">
                        <label>Quantity</label>
                        <input
                          type="number"
                          className="form-control"
                          value={dpqQuantity}
                          onChange={(e) => setDpqQuantity(e.target.value)}
                          required
                        />
                      </div>
                      
                      <div className="form-group">
                        <label>Specifications</label>
                        <textarea
                          className="form-control"
                          value={dpqSpecifications}
                          onChange={(e) => setDpqSpecifications(e.target.value)}
                          placeholder="Enter product specifications"
                        />
                      </div>
                      
                      <div className="form-group">
                        <label>Delivery Port</label>
                        <select 
                          className="form-control"
                          value={dpqDeliveryPort}
                          onChange={(e) => setDpqDeliveryPort(e.target.value)}
                          required
                        >
                          <option value="">Select delivery port</option>
                          <option value="1">Mumbai Port</option>
                          <option value="2">Chennai Port</option>
                          <option value="3">Jawaharlal Nehru Port</option>
                        </select>
                      </div>
                      
                      <div className="form-group">
                        <label>Delivery Date</label>
                        <input
                          type="date"
                          className="form-control"
                          value={dpqDeliveryDate}
                          onChange={(e) => setDpqDeliveryDate(e.target.value)}
                          required
                        />
                      </div>
                      
                      <div className="form-group">
                        <label>Payment Terms</label>
                        <input
                          type="text"
                          className="form-control"
                          value={dpqPaymentTerms}
                          onChange={(e) => setDpqPaymentTerms(e.target.value)}
                          placeholder="e.g., 50% advance, 50% before shipment"
                          required
                        />
                      </div>
                      
                      <button type="submit" className="btn btn-primary">Create DPQ</button>
                    </form>
                  </div>
                )}
                
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Product</th>
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
                          <td>{rfq.productName}</td>
                          <td>{rfq.sellerName}</td>
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
                        <th>Product</th>
                        <th>Seller</th>
                        <th>Status</th>
                        <th>Survey Fee</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {surveys.map(survey => (
                        <tr key={survey.id}>
                          <td>{survey.productName}</td>
                          <td>{survey.sellerName}</td>
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
                        <th>Product</th>
                        <th>Seller</th>
                        <th>Status</th>
                        <th>Tracking</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map(order => (
                        <tr key={order.id}>
                          <td>{order.productName}</td>
                          <td>{order.sellerName}</td>
                          <td>
                            <span className={`status-badge status-${order.status}`}>
                              {order.status.replace('_', ' ')}
                            </span>
                          </td>
                          <td>{order.tracking}</td>
                          <td>
                            <button className="btn btn-outline btn-small">View</button>
                            <button className="btn btn-primary btn-small">Track</button>
                            <button 
                              className="btn btn-info btn-small"
                              onClick={() => {
                                setSelectedOrderId(order.id);
                                setShowWorkflowTracker(true);
                              }}
                            >
                              Workflow
                            </button>
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
                
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Invoice ID</th>
                        <th>Order ID</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Due Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoices.map(invoice => (
                        <tr key={invoice.id}>
                          <td>{invoice.id}</td>
                          <td>{invoice.orderId}</td>
                          <td>${invoice.amount}</td>
                          <td>
                            <span className={`status-badge status-${invoice.status}`}>
                              {invoice.status}
                            </span>
                          </td>
                          <td>{invoice.dueDate}</td>
                          <td>
                            <button className="btn btn-outline btn-small">View</button>
                            {invoice.status === 'pending' && (
                              <button className="btn btn-success btn-small">Pay</button>
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

          {activeTab === 'disputes' && (
            <div>
              <div className="card">
                <div className="card-header">
                  <h2 className="card-title">Dispute Management</h2>
                  <button className="btn btn-primary">Raise New Dispute</button>
                </div>
                
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Dispute ID</th>
                        <th>Order ID</th>
                        <th>Reason</th>
                        <th>Status</th>
                        <th>Created At</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>D-2025-001</td>
                        <td>O-2025-001</td>
                        <td>Product quality issue</td>
                        <td>
                          <span className="status-badge status-pending">
                            Pending
                          </span>
                        </td>
                        <td>2025-10-01</td>
                        <td>
                          <button className="btn btn-outline btn-small">View</button>
                        </td>
                      </tr>
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

export default BuyerDashboard;