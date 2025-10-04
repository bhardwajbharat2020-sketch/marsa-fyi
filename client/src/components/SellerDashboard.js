import React, { useState, useEffect } from 'react';
import DashboardLayout from './DashboardLayout';
import '../App.css';

const SellerDashboard = () => {
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [rfqs, setRfqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for add product modal
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: '',
    price: '',
    description: ''
  });

  // Fetch real data from Supabase
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch products
        const productsResponse = await fetch('/api/seller/products');
        const productsData = await productsResponse.json();
        
        if (productsResponse.ok) {
          setProducts(productsData);
        } else {
          console.error('Error fetching products:', productsData.error);
        }
        
        // Fetch orders
        const ordersResponse = await fetch('/api/seller/orders');
        const ordersData = await ordersResponse.json();
        
        if (ordersResponse.ok) {
          setOrders(ordersData);
        } else {
          console.error('Error fetching orders:', ordersData.error);
        }
        
        // Fetch RFQs
        const rfqsResponse = await fetch('/api/seller/rfqs');
        const rfqsData = await rfqsResponse.json();
        
        if (rfqsResponse.ok) {
          setRfqs(rfqsData);
        } else {
          console.error('Error fetching RFQs:', rfqsData.error);
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

  // Handle input changes for new product form
  const handleProductInputChange = (e) => {
    const { name, value } = e.target;
    setNewProduct(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle add product form submission
  const handleAddProduct = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/seller/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newProduct),
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        // Add the new product to the products list
        setProducts(prev => [...prev, result.product]);
        
        // Reset form and close modal
        setNewProduct({
          name: '',
          category: '',
          price: '',
          description: ''
        });
        setShowAddProductModal(false);
        
        alert('Product added successfully!');
      } else {
        alert('Failed to add product: ' + (result.error || 'Unknown error'));
      }
    } catch (err) {
      console.error('Error adding product:', err);
      alert('Failed to add product. Please try again.');
    }
  };

  return (
    <DashboardLayout title="Seller Dashboard" role="seller">
      <div className="dashboard-tabs">
        <button 
          className={`tab ${activeTab === 'products' ? 'active' : ''}`}
          onClick={() => setActiveTab('products')}
        >
          My Products
        </button>
        <button 
          className={`tab ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          Orders
        </button>
        <button 
          className={`tab ${activeTab === 'rfqs' ? 'active' : ''}`}
          onClick={() => setActiveTab('rfqs')}
        >
          RFQs
        </button>
      </div>

      {loading && <div className="text-center py-10">Loading dashboard data...</div>}
      {error && <div className="text-center py-10 text-red-500">Error: {error}</div>}
      
      {activeTab === 'products' && (
        <div>
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">My Products</h2>
              <button 
                className="btn btn-primary"
                onClick={() => setShowAddProductModal(true)}
              >
                Add New Product
              </button>
            </div>
            
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Product Name</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(product => (
                    <tr key={product.id}>
                      <td>{product.name}</td>
                      <td>{product.category}</td>
                      <td>${product.price}</td>
                      <td>
                        <span className={`status-badge status-${product.status}`}>
                          {product.status}
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
              <h2 className="card-title">Orders</h2>
            </div>
            
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Buyer</th>
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
                      <td>{order.buyer}</td>
                      <td>{order.product}</td>
                      <td>{order.quantity}</td>
                      <td>
                        <span className={`status-badge status-${order.status}`}>
                          {order.status}
                        </span>
                      </td>
                      <td>
                        <button className="btn btn-outline btn-small">View</button>
                        <button className="btn btn-success btn-small">Confirm</button>
                        <button className="btn btn-danger btn-small">Cancel</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'rfqs' && (
        <div>
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">RFQs</h2>
            </div>
            
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>RFQ ID</th>
                    <th>Buyer</th>
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
                      <td>{rfq.buyer}</td>
                      <td>{rfq.product}</td>
                      <td>{rfq.quantity}</td>
                      <td>
                        <span className={`status-badge status-${rfq.status}`}>
                          {rfq.status}
                        </span>
                      </td>
                      <td>
                        <button className="btn btn-outline btn-small">View</button>
                        <button className="btn btn-primary btn-small">Respond</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {showAddProductModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Add New Product</h3>
              <button 
                className="close-button"
                onClick={() => setShowAddProductModal(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleAddProduct}>
              <div className="form-group">
                <label htmlFor="name" className="form-label">Product Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="form-control"
                  value={newProduct.name}
                  onChange={handleProductInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="category" className="form-label">Category *</label>
                <input
                  type="text"
                  id="category"
                  name="category"
                  className="form-control"
                  value={newProduct.category}
                  onChange={handleProductInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="price" className="form-label">Price *</label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  className="form-control"
                  value={newProduct.price}
                  onChange={handleProductInputChange}
                  required
                  min="0"
                  step="0.01"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="description" className="form-label">Description</label>
                <textarea
                  id="description"
                  name="description"
                  className="form-control"
                  value={newProduct.description}
                  onChange={handleProductInputChange}
                  rows="4"
                ></textarea>
              </div>
              
              <div className="form-navigation">
                <button 
                  type="button" 
                  className="btn btn-outline"
                  onClick={() => setShowAddProductModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                >
                  Add Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default SellerDashboard;