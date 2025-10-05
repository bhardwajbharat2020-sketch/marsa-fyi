import React, { useState, useEffect } from 'react';
import DashboardLayout from './DashboardLayout';
import { Search, ChevronRight, Star, Heart, CheckCircle, Plus } from 'lucide-react';
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

  // Theme colors to match homepage
  const bhagwa = "#f77f00";
  const cream = "#f6efe6";
  const creamCard = "#efe6d9";
  const darkText = "#5a4632";

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

  // Status badge component
  const StatusBadge = ({ status }) => {
    const statusStyles = {
      pending: { backgroundColor: '#fff3cd', color: '#856404' },
      approved: { backgroundColor: '#d4edda', color: '#155724' },
      rejected: { backgroundColor: '#f8d7da', color: '#721c24' },
      active: { backgroundColor: '#cce5ff', color: '#004085' },
      completed: { backgroundColor: '#d4edda', color: '#155724' },
      open: { backgroundColor: '#fff3cd', color: '#856404' },
      resolved: { backgroundColor: '#d4edda', color: '#155724' }
    };
    
    const style = statusStyles[status.toLowerCase()] || statusStyles.pending;
    
    return (
      <span 
        className="px-3 py-1 rounded-full text-xs font-semibold"
        style={style}
      >
        {status}
      </span>
    );
  };

  return (
    <DashboardLayout title="Buyer Dashboard" role="buyer">
      <div className="mb-6 flex flex-wrap gap-2 border-b" style={{ borderColor: "#d9cfc1" }}>
        <button 
          className={`px-4 py-2 rounded-t-lg font-medium ${
            activeTab === 'rfqs' ? 'border-b-2' : ''
          }`}
          onClick={() => setActiveTab('rfqs')}
          style={{ 
            color: activeTab === 'rfqs' ? bhagwa : darkText,
            borderColor: activeTab === 'rfqs' ? bhagwa : 'transparent'
          }}
        >
          RFQs
        </button>
        <button 
          className={`px-4 py-2 rounded-t-lg font-medium ${
            activeTab === 'orders' ? 'border-b-2' : ''
          }`}
          onClick={() => setActiveTab('orders')}
          style={{ 
            color: activeTab === 'orders' ? bhagwa : darkText,
            borderColor: activeTab === 'orders' ? bhagwa : 'transparent'
          }}
        >
          Orders
        </button>
        <button 
          className={`px-4 py-2 rounded-t-lg font-medium ${
            activeTab === 'suppliers' ? 'border-b-2' : ''
          }`}
          onClick={() => setActiveTab('suppliers')}
          style={{ 
            color: activeTab === 'suppliers' ? bhagwa : darkText,
            borderColor: activeTab === 'suppliers' ? bhagwa : 'transparent'
          }}
        >
          Suppliers
        </button>
      </div>

      {loading && <div className="text-center py-10" style={{ color: darkText }}>Loading dashboard data...</div>}
      {error && <div className="text-center py-10 text-red-500">Error: {error}</div>}
      
      {activeTab === 'rfqs' && (
        <div>
          <div 
            className="rounded-xl shadow-sm p-6 mb-6"
            style={{ backgroundColor: "#fff" }}
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <h2 className="text-2xl font-bold" style={{ color: darkText }}>My RFQs</h2>
              <button 
                className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold"
                onClick={() => setShowCreateRFQModal(true)}
                style={{ backgroundColor: bhagwa, color: "#fff" }}
              >
                <Plus size={16} />
                Create New RFQ
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ backgroundColor: creamCard }}>
                    <th className="text-left p-3" style={{ color: darkText }}>RFQ ID</th>
                    <th className="text-left p-3" style={{ color: darkText }}>Product</th>
                    <th className="text-left p-3" style={{ color: darkText }}>Quantity</th>
                    <th className="text-left p-3" style={{ color: darkText }}>Status</th>
                    <th className="text-left p-3" style={{ color: darkText }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rfqs.map(rfq => (
                    <tr key={rfq.id} className="border-b" style={{ borderColor: "#d9cfc1" }}>
                      <td className="p-3" style={{ color: darkText }}>{rfq.id}</td>
                      <td className="p-3" style={{ color: darkText }}>{rfq.product}</td>
                      <td className="p-3" style={{ color: darkText }}>{rfq.quantity}</td>
                      <td className="p-3">
                        <StatusBadge status={rfq.status} />
                      </td>
                      <td className="p-3">
                        <div className="flex flex-wrap gap-2">
                          <button 
                            className="px-3 py-1 rounded text-sm"
                            style={{ backgroundColor: "#fff", color: darkText, border: "1px solid #d9cfc1" }}
                          >
                            View
                          </button>
                          <button 
                            className="px-3 py-1 rounded text-sm"
                            style={{ backgroundColor: bhagwa, color: "#fff" }}
                          >
                            Edit
                          </button>
                          <button 
                            className="px-3 py-1 rounded text-sm"
                            style={{ backgroundColor: "#e74c3c", color: "#fff" }}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {rfqs.length === 0 && !loading && (
                <div className="text-center py-10" style={{ color: darkText }}>
                  No RFQs found. Create your first RFQ to get started.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'orders' && (
        <div>
          <div 
            className="rounded-xl shadow-sm p-6 mb-6"
            style={{ backgroundColor: "#fff" }}
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <h2 className="text-2xl font-bold" style={{ color: darkText }}>My Orders</h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ backgroundColor: creamCard }}>
                    <th className="text-left p-3" style={{ color: darkText }}>Order ID</th>
                    <th className="text-left p-3" style={{ color: darkText }}>Supplier</th>
                    <th className="text-left p-3" style={{ color: darkText }}>Product</th>
                    <th className="text-left p-3" style={{ color: darkText }}>Quantity</th>
                    <th className="text-left p-3" style={{ color: darkText }}>Status</th>
                    <th className="text-left p-3" style={{ color: darkText }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(order => (
                    <tr key={order.id} className="border-b" style={{ borderColor: "#d9cfc1" }}>
                      <td className="p-3" style={{ color: darkText }}>{order.id}</td>
                      <td className="p-3" style={{ color: darkText }}>{order.supplier}</td>
                      <td className="p-3" style={{ color: darkText }}>{order.product}</td>
                      <td className="p-3" style={{ color: darkText }}>{order.quantity}</td>
                      <td className="p-3">
                        <StatusBadge status={order.status} />
                      </td>
                      <td className="p-3">
                        <div className="flex flex-wrap gap-2">
                          <button 
                            className="px-3 py-1 rounded text-sm"
                            style={{ backgroundColor: "#fff", color: darkText, border: "1px solid #d9cfc1" }}
                          >
                            View
                          </button>
                          <button 
                            className="px-3 py-1 rounded text-sm"
                            style={{ backgroundColor: "#2ecc71", color: "#fff" }}
                          >
                            Track
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {orders.length === 0 && !loading && (
                <div className="text-center py-10" style={{ color: darkText }}>
                  No orders found.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'suppliers' && (
        <div>
          <div 
            className="rounded-xl shadow-sm p-6 mb-6"
            style={{ backgroundColor: "#fff" }}
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <h2 className="text-2xl font-bold" style={{ color: darkText }}>My Suppliers</h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ backgroundColor: creamCard }}>
                    <th className="text-left p-3" style={{ color: darkText }}>Supplier Name</th>
                    <th className="text-left p-3" style={{ color: darkText }}>Vendor Code</th>
                    <th className="text-left p-3" style={{ color: darkText }}>Products</th>
                    <th className="text-left p-3" style={{ color: darkText }}>Rating</th>
                    <th className="text-left p-3" style={{ color: darkText }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {suppliers.map(supplier => (
                    <tr key={supplier.id} className="border-b" style={{ borderColor: "#d9cfc1" }}>
                      <td className="p-3" style={{ color: darkText }}>{supplier.name}</td>
                      <td className="p-3" style={{ color: darkText }}>{supplier.vendorCode}</td>
                      <td className="p-3" style={{ color: darkText }}>{supplier.products}</td>
                      <td className="p-3" style={{ color: darkText }}>
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span className="ml-1">{supplier.rating}/5</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex flex-wrap gap-2">
                          <button 
                            className="px-3 py-1 rounded text-sm"
                            style={{ backgroundColor: "#fff", color: darkText, border: "1px solid #d9cfc1" }}
                          >
                            View
                          </button>
                          <button 
                            className="px-3 py-1 rounded text-sm"
                            style={{ backgroundColor: bhagwa, color: "#fff" }}
                          >
                            Message
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {suppliers.length === 0 && !loading && (
                <div className="text-center py-10" style={{ color: darkText }}>
                  No suppliers found.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create RFQ Modal */}
      {showCreateRFQModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div 
            className="rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto"
            style={{ backgroundColor: "#fff" }}
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold" style={{ color: darkText }}>Create New RFQ</h3>
                <button 
                  className="p-2 rounded-full"
                  onClick={() => setShowCreateRFQModal(false)}
                  style={{ backgroundColor: creamCard }}
                >
                  <X size={20} style={{ color: darkText }} />
                </button>
              </div>
              <form onSubmit={handleCreateRFQ}>
                <div className="mb-4">
                  <label htmlFor="product" className="block mb-2 font-medium" style={{ color: darkText }}>
                    Product Name *
                  </label>
                  <input
                    type="text"
                    id="product"
                    name="product"
                    className="w-full p-3 rounded-lg border"
                    style={{ borderColor: "#d9cfc1", backgroundColor: "#fff", color: darkText }}
                    value={newRFQ.product}
                    onChange={handleRFQInputChange}
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="quantity" className="block mb-2 font-medium" style={{ color: darkText }}>
                    Quantity *
                  </label>
                  <input
                    type="number"
                    id="quantity"
                    name="quantity"
                    className="w-full p-3 rounded-lg border"
                    style={{ borderColor: "#d9cfc1", backgroundColor: "#fff", color: darkText }}
                    value={newRFQ.quantity}
                    onChange={handleRFQInputChange}
                    required
                    min="1"
                  />
                </div>
                
                <div className="mb-6">
                  <label htmlFor="description" className="block mb-2 font-medium" style={{ color: darkText }}>
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    className="w-full p-3 rounded-lg border"
                    style={{ borderColor: "#d9cfc1", backgroundColor: "#fff", color: darkText }}
                    value={newRFQ.description}
                    onChange={handleRFQInputChange}
                    rows="4"
                  ></textarea>
                </div>
                
                <div className="flex justify-end gap-3">
                  <button 
                    type="button" 
                    className="px-4 py-2 rounded-lg font-medium"
                    onClick={() => setShowCreateRFQModal(false)}
                    style={{ backgroundColor: "#fff", color: darkText, border: "1px solid #d9cfc1" }}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="px-4 py-2 rounded-lg font-medium"
                    style={{ backgroundColor: bhagwa, color: "#fff" }}
                  >
                    Create RFQ
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

// Add the X icon since we're using it in the modal
const X = ({ size = 24, style }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    style={style}
  >
    <path 
      d="M18 6L6 18M6 6l12 12" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
  </svg>
);

export default BuyerDashboard;