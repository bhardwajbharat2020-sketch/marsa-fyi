import React, { useState } from 'react';
import DashboardLayout from './DashboardLayout';
import '../App.css';

const SellerDashboard = () => {
  const [activeTab, setActiveTab] = useState('catalogs');
  const [showCreateCatalog, setShowCreateCatalog] = useState(false);

  // Mock data
  const catalogs = [
    {
      id: 1,
      title: 'Premium Electronics Components',
      status: 'approved',
      category: 'Electronics',
      price: '$5000',
      validity: '2025-12-31',
      views: 1240,
      rfqs: 24
    },
    {
      id: 2,
      title: 'Industrial Machinery Parts',
      status: 'pending',
      category: 'Machinery',
      price: '$12000',
      validity: '2025-11-15',
      views: 890,
      rfqs: 17
    },
    {
      id: 3,
      title: 'Organic Textiles',
      status: 'approved',
      category: 'Textiles',
      price: '$3500',
      validity: '2025-10-30',
      views: 2100,
      rfqs: 42
    }
  ];

  const dpos = [
    {
      id: 1,
      buyer: 'BUY-23-XYZ789',
      product: 'Premium Electronics Components',
      price: '$5200',
      status: 'pending',
      validity: '2025-12-31'
    },
    {
      id: 2,
      buyer: 'BUY-23-ABC123',
      product: 'Industrial Machinery Parts',
      price: '$12500',
      status: 'accepted',
      validity: '2025-11-15'
    }
  ];

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
          className={`tab ${activeTab === 'dpo' ? 'active' : ''}`}
          onClick={() => setActiveTab('dpo')}
        >
          DPO Management
        </button>
        <button 
          className={`tab ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          Orders
        </button>
        <button 
          className={`tab ${activeTab === 'payments' ? 'active' : ''}`}
          onClick={() => setActiveTab('payments')}
        >
          Payments
        </button>
      </div>

      {activeTab === 'catalogs' && (
        <div>
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">My Catalogs</h2>
              <button 
                className="btn btn-primary"
                onClick={() => setShowCreateCatalog(true)}
              >
                Create New Catalog
              </button>
            </div>
            
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Validity</th>
                    <th>Status</th>
                    <th>Views/RFQs</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {catalogs.map(catalog => (
                    <tr key={catalog.id}>
                      <td>{catalog.title}</td>
                      <td>{catalog.category}</td>
                      <td>{catalog.price}</td>
                      <td>{catalog.validity}</td>
                      <td>
                        <span className={`status-badge status-${catalog.status}`}>
                          {catalog.status}
                        </span>
                      </td>
                      <td>{catalog.views}/{catalog.rfqs}</td>
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

      {activeTab === 'dpo' && (
        <div>
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Draft Purchase Orders (DPO)</h2>
            </div>
            
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Buyer Code</th>
                    <th>Product</th>
                    <th>Price</th>
                    <th>Validity</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {dpos.map(dpo => (
                    <tr key={dpo.id}>
                      <td>{dpo.buyer}</td>
                      <td>{dpo.product}</td>
                      <td>{dpo.price}</td>
                      <td>{dpo.validity}</td>
                      <td>
                        <span className={`status-badge status-${dpo.status}`}>
                          {dpo.status}
                        </span>
                      </td>
                      <td>
                        <button className="btn btn-outline btn-small">View</button>
                        <button className="btn btn-success btn-small">Accept</button>
                        <button className="btn btn-warning btn-small">Negotiate</button>
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
            <p>Order management features will be implemented here.</p>
          </div>
        </div>
      )}

      {activeTab === 'payments' && (
        <div>
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Payment Management</h2>
            </div>
            <p>Payment management features will be implemented here.</p>
          </div>
        </div>
      )}

      {showCreateCatalog && (
        <CreateCatalogModal onClose={() => setShowCreateCatalog(false)} />
      )}
    </DashboardLayout>
  );
};

const CreateCatalogModal = ({ onClose }) => {
  const [formData, setFormData] = useState({
    category: '',
    branded: 'branded',
    productName: '',
    description: '',
    moq: '',
    uom: '',
    quantity: '',
    price: '',
    currency: 'USD',
    priceType: 'EXW',
    reLabel: 'no',
    validity: '',
    surveyTerms: false
  });

  const categories = [
    'Electronics', 'Machinery', 'Textiles', 'Chemicals', 'Food & Beverages',
    'Automotive', 'Construction', 'Healthcare', 'Agriculture', 'Other'
  ];

  const uoms = ['Pieces', 'Kilograms', 'Meters', 'Liters', 'Boxes', 'Pallets'];

  const priceTypes = [
    { value: 'EXW', label: 'EXW (Ex Works)' },
    { value: 'FOB', label: 'FOB (Free On Board)' },
    { value: 'CIF', label: 'CIF (Cost, Insurance & Freight)' },
    { value: 'DDP', label: 'DDP (Delivered Duty Paid)' }
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real app, this would submit the catalog data
    alert('Catalog submitted for approval!');
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Create New Catalog</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Product Category</label>
              <select
                name="category"
                className="form-control"
                value={formData.category}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Category</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label className="form-label">Branded/Unbranded</label>
              <select
                name="branded"
                className="form-control"
                value={formData.branded}
                onChange={handleInputChange}
              >
                <option value="branded">Branded</option>
                <option value="unbranded">Unbranded</option>
              </select>
            </div>
          </div>
          
          <div className="form-group">
            <label className="form-label">Product Name/Version</label>
            <input
              type="text"
              name="productName"
              className="form-control"
              value={formData.productName}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              name="description"
              className="form-control"
              value={formData.description}
              onChange={handleInputChange}
              rows="3"
              required
            ></textarea>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">MOQ</label>
              <input
                type="number"
                name="moq"
                className="form-control"
                value={formData.moq}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">UOM</label>
              <select
                name="uom"
                className="form-control"
                value={formData.uom}
                onChange={handleInputChange}
                required
              >
                <option value="">Select UOM</option>
                {uoms.map(uom => (
                  <option key={uom} value={uom}>{uom}</option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label className="form-label">Available Quantity</label>
              <input
                type="number"
                name="quantity"
                className="form-control"
                value={formData.quantity}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Offer Price</label>
              <input
                type="number"
                name="price"
                className="form-control"
                value={formData.price}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Currency</label>
              <select
                name="currency"
                className="form-control"
                value={formData.currency}
                onChange={handleInputChange}
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="INR">INR</option>
              </select>
            </div>
            
            <div className="form-group">
              <label className="form-label">Price Type</label>
              <select
                name="priceType"
                className="form-control"
                value={formData.priceType}
                onChange={handleInputChange}
              >
                {priceTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Re-labeling Option</label>
              <select
                name="reLabel"
                className="form-control"
                value={formData.reLabel}
                onChange={handleInputChange}
              >
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>
            
            <div className="form-group">
              <label className="form-label">Offer Validity</label>
              <input
                type="date"
                name="validity"
                className="form-control"
                value={formData.validity}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>
          
          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="surveyTerms"
                checked={formData.surveyTerms}
                onChange={handleInputChange}
                required
              />
              I accept the survey terms & conditions
            </label>
          </div>
          
          <div className="form-navigation">
            <button type="button" className="btn btn-outline" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Submit for Approval
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SellerDashboard;