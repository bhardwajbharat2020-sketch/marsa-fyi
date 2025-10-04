import React, { useState, useEffect } from 'react';
import DashboardLayout from './DashboardLayout';
import '../App.css';

const BuyerDashboard = () => {
  const [activeTab, setActiveTab] = useState('rfqs');
  const [rfqs, setRfqs] = useState([]);
  const [orders, setOrders] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for create RFQ modal
  const [showCreateRFQModal, setShowCreateRFQModal] = useState(false);
  const [newRFQ, setNewRFQ] = useState({
    product: '',
    quantity: '',
    description: ''
  });

  // Fetch real data from Supabase
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch RFQs
        const rfqsResponse = await fetch('/api/buyer/rfqs');
        const rfqsData = await rfqsResponse.json();
        
        if (rfqsResponse.ok) {
          setRfqs(rfqsData);
        } else {
          console.error('Error fetching RFQs:', rfqsData.error);
        }
        
        // Fetch orders
        const ordersResponse = await fetch('/api/buyer/orders');
        const ordersData = await ordersResponse.json();
        
        if (ordersResponse.ok) {
          setOrders(ordersData);
        } else {
          console.error('Error fetching orders:', ordersData.error);
        }
        
        // Fetch suppliers
        const suppliersResponse = await fetch('/api/buyer/suppliers');
        const suppliersData = await suppliersResponse.json();
        
        if (suppliersResponse.ok) {
          setSuppliers(suppliersData);
        } else {
          console.error('Error fetching suppliers:', suppliersData.error);
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

  // Handle input changes for new RFQ form
  const handleRFQInputChange = (e) => {
    const { name, value } = e.target;
    setNewRFQ(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle create RFQ form submission
  const handleCreateRFQ = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/buyer/rfqs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newRFQ),
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        // Add the new RFQ to the RFQs list
        setRfqs(prev => [...prev, result.rfq]);
        
        // Reset form and close modal
        setNewRFQ({
          product: '',
          quantity: '',
          description: ''
        });
        setShowCreateRFQModal(false);
        
        alert('RFQ created successfully!');
      } else {
        alert('Failed to create RFQ: ' + (result.error || 'Unknown error'));
      }
    } catch (err) {
      console.error('Error creating RFQ:', err);
      alert('Failed to create RFQ. Please try again.');
    }
  };

  return (
    <DashboardLayout title="Buyer Dashboard" role="buyer">
      <div className="dashboard-tabs">
        <button 
          className={`tab ${activeTab === 'rfqs' ? 'active' : ''}`}
          onClick={() => setActiveTab('rfqs')}
        >
          RFQs
        </button>
        <button 
          className={`tab ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          Orders
        </button>
        <button 
          className={`tab ${activeTab === 'suppliers' ? 'active' : ''}`}
          onClick={() => setActiveTab('suppliers')}
        >
          Suppliers
        </button>
      </div>

      {loading && <div className="text-center py-10">Loading dashboard data...</div>}
      {error && <div className="text-center py-10 text-red-500">Error: {error}</div>}
      
      {activeTab === 'rfqs' && (
        <div>
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">My RFQs</h2>
              <button 
                className="btn btn-primary"
                onClick={() => setShowCreateRFQModal(true)}
              >
                Create New RFQ
              </button>
            </div>
            
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>RFQ ID</th>
                    <th>Product</th>
                    <th>Quantity</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rfqs.map(rfq => (
                    <tr key={rfq.id}>
                      <td>{rfq.id}</td>
                      <td>{rfq.product}</td>
                      <td>{rfq.quantity}</td>
                      <td>
                        <span className={`status-badge status-${rfq.status}`}>
                          {rfq.status}
                        </span>
                      </td>
                      <td>
                        <button className="btn btn-outline btn-small">View</button>
                        <button className="btn btn-primary btn-small">Edit</button>
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
                    <th>Order ID</th>
                    <th>Supplier</th>
                    <th>Product</th>
                    <th>Quantity</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(order => (
                    <tr key={order.id}>
                      <td>{order.id}</td>
                      <td>{order.supplier}</td>
                      <td>{order.product}</td>
                      <td>{order.quantity}</td>
                      <td>
                        <span className={`status-badge status-${order.status}`}>
                          {order.status}
                        </span>
                      </td>
                      <td>
                        <button className="btn btn-outline btn-small">View</button>
                        <button className="btn btn-success btn-small">Track</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'suppliers' && (
        <div>
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">My Suppliers</h2>
            </div>
            
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Supplier Name</th>
                    <th>Vendor Code</th>
                    <th>Products</th>
                    <th>Rating</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {suppliers.map(supplier => (
                    <tr key={supplier.id}>
                      <td>{supplier.name}</td>
                      <td>{supplier.vendorCode}</td>
                      <td>{supplier.products}</td>
                      <td>{supplier.rating}/5</td>
                      <td>
                        <button className="btn btn-outline btn-small">View</button>
                        <button className="btn btn-primary btn-small">Message</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Create RFQ Modal */}
      {showCreateRFQModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Create New RFQ</h3>
              <button 
                className="close-button"
                onClick={() => setShowCreateRFQModal(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleCreateRFQ}>
              <div className="form-group">
                <label htmlFor="product" className="form-label">Product Name *</label>
                <input
                  type="text"
                  id="product"
                  name="product"
                  className="form-control"
                  value={newRFQ.product}
                  onChange={handleRFQInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="quantity" className="form-label">Quantity *</label>
                <input
                  type="number"
                  id="quantity"
                  name="quantity"
                  className="form-control"
                  value={newRFQ.quantity}
                  onChange={handleRFQInputChange}
                  required
                  min="1"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="description" className="form-label">Description</label>
                <textarea
                  id="description"
                  name="description"
                  className="form-control"
                  value={newRFQ.description}
                  onChange={handleRFQInputChange}
                  rows="4"
                ></textarea>
              </div>
              
              <div className="form-navigation">
                <button 
                  type="button" 
                  className="btn btn-outline"
                  onClick={() => setShowCreateRFQModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                >
                  Create RFQ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default BuyerDashboard;