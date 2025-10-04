import React, { useState } from 'react';
import DashboardLayout from './DashboardLayout';
import '../App.css';

const CaptainDashboard = () => {
  const [activeTab, setActiveTab] = useState('roles');

  // Mock data
  const roleCodes = [
    {
      id: 1,
      name: 'John Admin',
      email: 'john.admin@marsafyi.com',
      role: 'Admin',
      code: 'A-25-ADMIN123'
    },
    {
      id: 2,
      name: 'Sarah Accountant',
      email: 'sarah.accountant@marsafyi.com',
      role: 'Accountant',
      code: 'ACC-25-ACCT456'
    },
    {
      id: 3,
      name: 'Michael Arbitrator',
      email: 'michael.arbitrator@marsafyi.com',
      role: 'Arbitrator',
      code: 'ARB-25-ARB789'
    },
    {
      id: 4,
      name: 'Emily HR',
      email: 'emily.hr@marsafyi.com',
      role: 'HR',
      code: 'H-25-HR101'
    }
  ];

  const pendingCatalogs = [
    {
      id: 1,
      title: 'Premium Electronics Components',
      seller: 'VEND-23-ABC123',
      category: 'Electronics',
      price: '$5000'
    },
    {
      id: 2,
      title: 'Industrial Machinery Parts',
      seller: 'VEND-23-DEF456',
      category: 'Machinery',
      price: '$12000'
    }
  ];

  const dpqs = [
    {
      id: 1,
      catalog: 'Premium Electronics Components',
      buyer: 'BUY-23-XYZ789',
      seller: 'VEND-23-ABC123',
      price: '$5200',
      status: 'pending'
    }
  ];

  const dpos = [
    {
      id: 1,
      catalog: 'Industrial Machinery Parts',
      buyer: 'BUY-23-ABC123',
      seller: 'VEND-23-DEF456',
      price: '$12500',
      status: 'pending'
    }
  ];

  return (
    <DashboardLayout title="Captain Dashboard" role="captain">
      <div className="dashboard-tabs">
        <button 
          className={`tab ${activeTab === 'roles' ? 'active' : ''}`}
          onClick={() => setActiveTab('roles')}
        >
          Role Management
        </button>
        <button 
          className={`tab ${activeTab === 'catalogs' ? 'active' : ''}`}
          onClick={() => setActiveTab('catalogs')}
        >
          Catalog Management
        </button>
        <button 
          className={`tab ${activeTab === 'dpq' ? 'active' : ''}`}
          onClick={() => setActiveTab('dpq')}
        >
          DPQ Management
        </button>
        <button 
          className={`tab ${activeTab === 'dpo' ? 'active' : ''}`}
          onClick={() => setActiveTab('dpo')}
        >
          DPO Management
        </button>
        <button 
          className={`tab ${activeTab === 'disputes' ? 'active' : ''}`}
          onClick={() => setActiveTab('disputes')}
        >
          Disputes
        </button>
      </div>

      {activeTab === 'roles' && (
        <div>
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Generate Role Codes</h2>
              <button className="btn btn-primary">Generate New Role Code</button>
            </div>
            <p>Generate one-time role codes for Admin, Accountant, Arbitrator, and HR roles.</p>
            
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Name</label>
                <input type="text" className="form-control" placeholder="Enter name" />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input type="email" className="form-control" placeholder="Enter email" />
              </div>
              <div className="form-group">
                <label className="form-label">WhatsApp Number</label>
                <input type="tel" className="form-control" placeholder="Enter WhatsApp number" />
              </div>
              <div className="form-group">
                <label className="form-label">Job Type</label>
                <select className="form-control">
                  <option value="">Select Role</option>
                  <option value="admin">Admin</option>
                  <option value="accountant">Accountant</option>
                  <option value="arbitrator">Arbitrator</option>
                  <option value="hr">HR</option>
                </select>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Generated Role Codes</h2>
            </div>
            
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Role Code</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {roleCodes.map(role => (
                    <tr key={role.id}>
                      <td>{role.name}</td>
                      <td>{role.email}</td>
                      <td>{role.role}</td>
                      <td>{role.code}</td>
                      <td>
                        <span className="status-badge status-active">Active</span>
                      </td>
                      <td>
                        <button className="btn btn-outline btn-small">Resend</button>
                        <button className="btn btn-danger btn-small">Revoke</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

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

      {activeTab === 'dpq' && (
        <div>
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Draft Priced Quotations (DPQ)</h2>
            </div>
            
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Catalog</th>
                    <th>Buyer</th>
                    <th>Seller</th>
                    <th>Price</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {dpqs.map(dpq => (
                    <tr key={dpq.id}>
                      <td>{dpq.catalog}</td>
                      <td>{dpq.buyer}</td>
                      <td>{dpq.seller}</td>
                      <td>{dpq.price}</td>
                      <td>
                        <span className={`status-badge status-${dpq.status}`}>
                          {dpq.status}
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
                    <th>Catalog</th>
                    <th>Buyer</th>
                    <th>Seller</th>
                    <th>Price</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {dpos.map(dpo => (
                    <tr key={dpo.id}>
                      <td>{dpo.catalog}</td>
                      <td>{dpo.buyer}</td>
                      <td>{dpo.seller}</td>
                      <td>{dpo.price}</td>
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

      {activeTab === 'disputes' && (
        <div>
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Dispute Management</h2>
            </div>
            <p>Dispute management features will be implemented here.</p>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default CaptainDashboard;