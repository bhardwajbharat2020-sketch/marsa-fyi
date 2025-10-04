import React, { useState, useEffect } from 'react';
import DashboardLayout from './DashboardLayout';
import '../App.css';

const CaptainDashboard = () => {
  const [activeTab, setActiveTab] = useState('roles');
  const [roles, setRoles] = useState([]);
  const [catalogs, setCatalogs] = useState([]);
  const [rfqs, setRfqs] = useState([]);
  const [dpqs, setDpqs] = useState([]);
  const [dpos, setDpos] = useState([]);
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch real data from Supabase
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch roles
        const rolesResponse = await fetch('/api/captain/roles');
        const rolesData = await rolesResponse.json();
        
        if (rolesResponse.ok) {
          setRoles(rolesData);
        } else {
          console.error('Error fetching roles:', rolesData.error);
        }
        
        // Fetch catalogs
        const catalogsResponse = await fetch('/api/captain/catalogs');
        const catalogsData = await catalogsResponse.json();
        
        if (catalogsResponse.ok) {
          setCatalogs(catalogsData);
        } else {
          console.error('Error fetching catalogs:', catalogsData.error);
        }
        
        // Fetch RFQs
        const rfqsResponse = await fetch('/api/captain/rfqs');
        const rfqsData = await rfqsResponse.json();
        
        if (rfqsResponse.ok) {
          setRfqs(rfqsData);
        } else {
          console.error('Error fetching RFQs:', rfqsData.error);
        }
        
        // Fetch DPQs
        const dpqsResponse = await fetch('/api/captain/dpqs');
        const dpqsData = await dpqsResponse.json();
        
        if (dpqsResponse.ok) {
          setDpqs(dpqsData);
        } else {
          console.error('Error fetching DPQs:', dpqsData.error);
        }
        
        // Fetch DPOs
        const dposResponse = await fetch('/api/captain/dpos');
        const dposData = await dposResponse.json();
        
        if (dposResponse.ok) {
          setDpos(dposData);
        } else {
          console.error('Error fetching DPOs:', dposData.error);
        }
        
        // Fetch disputes
        const disputesResponse = await fetch('/api/captain/disputes');
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

  // Function to approve a catalog
  const approveCatalog = async (catalogId) => {
    try {
      const response = await fetch('/api/captain/catalogs/approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ catalogId }),
      });
      
      const result = await response.json();
      
      if (response.ok) {
        // Update the catalogs state to reflect the approval
        setCatalogs(prevCatalogs => 
          prevCatalogs.map(catalog => 
            catalog.id === catalogId 
              ? { ...catalog, status: 'approved' } 
              : catalog
          )
        );
        
        alert('Catalog approved successfully!');
      } else {
        alert('Failed to approve catalog: ' + result.error);
      }
    } catch (err) {
      console.error('Error approving catalog:', err);
      alert('Failed to approve catalog. Please try again.');
    }
  };

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
          className={`tab ${activeTab === 'rfqs' ? 'active' : ''}`}
          onClick={() => setActiveTab('rfqs')}
        >
          RFQ Management
        </button>
        <button 
          className={`tab ${activeTab === 'dpqs' ? 'active' : ''}`}
          onClick={() => setActiveTab('dpqs')}
        >
          DPQ Management
        </button>
        <button 
          className={`tab ${activeTab === 'dpos' ? 'active' : ''}`}
          onClick={() => setActiveTab('dpos')}
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

      {loading && <div className="text-center py-10">Loading dashboard data...</div>}
      {error && <div className="text-center py-10 text-red-500">Error: {error}</div>}

      {!loading && !error && (
        <>
          {activeTab === 'roles' && (
            <div>
              <div className="card">
                <div className="card-header">
                  <h2 className="card-title">Role Management</h2>
                  <button className="btn btn-primary">Add New Role</button>
                </div>
                
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Role Name</th>
                        <th>Description</th>
                        <th>Users Count</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {roles.map(role => (
                        <tr key={role.id}>
                          <td>{role.name}</td>
                          <td>{role.description}</td>
                          <td>{role.userCount}</td>
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

          {activeTab === 'catalogs' && (
            <div>
              <div className="card">
                <div className="card-header">
                  <h2 className="card-title">Catalog Management</h2>
                </div>
                
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Seller</th>
                        <th>Category</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {catalogs.map(catalog => (
                        <tr key={catalog.id}>
                          <td>{catalog.title}</td>
                          <td>{catalog.seller}</td>
                          <td>{catalog.category}</td>
                          <td>
                            <span className={`status-badge status-${catalog.status}`}>
                              {catalog.status}
                            </span>
                          </td>
                          <td>
                            {catalog.status === 'pending' && (
                              <button 
                                className="btn btn-success btn-small"
                                onClick={() => approveCatalog(catalog.id)}
                              >
                                Approve
                              </button>
                            )}
                            <button className="btn btn-outline btn-small">View</button>
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

          {activeTab === 'rfqs' && (
            <div>
              <div className="card">
                <div className="card-header">
                  <h2 className="card-title">RFQ Management</h2>
                </div>
                
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Buyer</th>
                        <th>Category</th>
                        <th>Status</th>
                        <th>Budget</th>
                        <th>Deadline</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rfqs.map(rfq => (
                        <tr key={rfq.id}>
                          <td>{rfq.productName}</td>
                          <td>{rfq.buyerName} ({rfq.buyerCode})</td>
                          <td>{rfq.category}</td>
                          <td>
                            <span className={`status-badge status-${rfq.status}`}>
                              {rfq.status}
                            </span>
                          </td>
                          <td>{rfq.budget}</td>
                          <td>{rfq.deadline}</td>
                          <td>
                            <button className="btn btn-outline btn-small">View</button>
                            <button className="btn btn-primary btn-small">Assign Surveyor</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'dpqs' && (
            <div>
              <div className="card">
                <div className="card-header">
                  <h2 className="card-title">DPQ Management</h2>
                </div>
                
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Buyer</th>
                        <th>Quantity</th>
                        <th>Status</th>
                        <th>Created At</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dpqs.map(dpq => (
                        <tr key={dpq.id}>
                          <td>{dpq.productName}</td>
                          <td>{dpq.buyerName}</td>
                          <td>{dpq.quantity}</td>
                          <td>
                            <span className={`status-badge status-${dpq.status}`}>
                              {dpq.status}
                            </span>
                          </td>
                          <td>{new Date(dpq.createdAt).toLocaleDateString()}</td>
                          <td>
                            <button className="btn btn-outline btn-small">View</button>
                            <button className="btn btn-primary btn-small">Assign Surveyor</button>
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
                        <th>Seller</th>
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
                          <td>{dpo.sellerName}</td>
                          <td>${dpo.totalPrice}</td>
                          <td>
                            <span className={`status-badge status-${dpo.status}`}>
                              {dpo.status}
                            </span>
                          </td>
                          <td>
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

          {activeTab === 'disputes' && (
            <div>
              <div className="card">
                <div className="card-header">
                  <h2 className="card-title">Dispute Management</h2>
                </div>
                
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Dispute ID</th>
                        <th>Order ID</th>
                        <th>Type</th>
                        <th>Status</th>
                        <th>Created At</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {disputes.map(dispute => (
                        <tr key={dispute.id}>
                          <td>{dispute.id}</td>
                          <td>{dispute.orderId}</td>
                          <td>{dispute.type}</td>
                          <td>
                            <span className={`status-badge status-${dispute.status}`}>
                              {dispute.status}
                            </span>
                          </td>
                          <td>{new Date(dispute.createdAt).toLocaleDateString()}</td>
                          <td>
                            <button className="btn btn-outline btn-small">View</button>
                            <button className="btn btn-primary btn-small">Assign Arbitrator</button>
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

export default CaptainDashboard;