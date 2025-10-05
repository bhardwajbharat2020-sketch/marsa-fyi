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
    <DashboardLayout title="Captain Dashboard" role="captain">
      <div className="mb-6 flex flex-wrap gap-2 border-b" style={{ borderColor: "#d9cfc1" }}>
        <button 
          className={`px-4 py-2 rounded-t-lg font-medium ${
            activeTab === 'roles' ? 'border-b-2' : ''
          }`}
          onClick={() => setActiveTab('roles')}
          style={{ 
            color: activeTab === 'roles' ? bhagwa : darkText,
            borderColor: activeTab === 'roles' ? bhagwa : 'transparent'
          }}
        >
          Role Management
        </button>
        <button 
          className={`px-4 py-2 rounded-t-lg font-medium ${
            activeTab === 'catalogs' ? 'border-b-2' : ''
          }`}
          onClick={() => setActiveTab('catalogs')}
          style={{ 
            color: activeTab === 'catalogs' ? bhagwa : darkText,
            borderColor: activeTab === 'catalogs' ? bhagwa : 'transparent'
          }}
        >
          Catalog Management
        </button>
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
          RFQ Management
        </button>
        <button 
          className={`px-4 py-2 rounded-t-lg font-medium ${
            activeTab === 'dpqs' ? 'border-b-2' : ''
          }`}
          onClick={() => setActiveTab('dpqs')}
          style={{ 
            color: activeTab === 'dpqs' ? bhagwa : darkText,
            borderColor: activeTab === 'dpqs' ? bhagwa : 'transparent'
          }}
        >
          DPQ Management
        </button>
        <button 
          className={`px-4 py-2 rounded-t-lg font-medium ${
            activeTab === 'dpos' ? 'border-b-2' : ''
          }`}
          onClick={() => setActiveTab('dpos')}
          style={{ 
            color: activeTab === 'dpos' ? bhagwa : darkText,
            borderColor: activeTab === 'dpos' ? bhagwa : 'transparent'
          }}
        >
          DPO Management
        </button>
        <button 
          className={`px-4 py-2 rounded-t-lg font-medium ${
            activeTab === 'disputes' ? 'border-b-2' : ''
          }`}
          onClick={() => setActiveTab('disputes')}
          style={{ 
            color: activeTab === 'disputes' ? bhagwa : darkText,
            borderColor: activeTab === 'disputes' ? bhagwa : 'transparent'
          }}
        >
          Disputes
        </button>
      </div>

      {loading && <div className="text-center py-10" style={{ color: darkText }}>Loading dashboard data...</div>}
      {error && <div className="text-center py-10 text-red-500">Error: {error}</div>}

      {!loading && !error && (
        <>
          {activeTab === 'roles' && (
            <div>
              <div 
                className="rounded-xl shadow-sm p-6 mb-6"
                style={{ backgroundColor: "#fff" }}
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                  <h2 className="text-2xl font-bold" style={{ color: darkText }}>Role Management</h2>
                  <button 
                    className="px-4 py-2 rounded-lg font-semibold"
                    style={{ backgroundColor: bhagwa, color: "#fff" }}
                  >
                    Add New Role
                  </button>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr style={{ backgroundColor: creamCard }}>
                        <th className="text-left p-3" style={{ color: darkText }}>Role Name</th>
                        <th className="text-left p-3" style={{ color: darkText }}>Description</th>
                        <th className="text-left p-3" style={{ color: darkText }}>Users Count</th>
                        <th className="text-left p-3" style={{ color: darkText }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {roles.map(role => (
                        <tr key={role.id} className="border-b" style={{ borderColor: "#d9cfc1" }}>
                          <td className="p-3" style={{ color: darkText }}>{role.name}</td>
                          <td className="p-3" style={{ color: darkText }}>{role.description}</td>
                          <td className="p-3" style={{ color: darkText }}>{role.userCount}</td>
                          <td className="p-3">
                            <div className="flex flex-wrap gap-2">
                              <button 
                                className="px-3 py-1 rounded text-sm"
                                style={{ backgroundColor: "#fff", color: darkText, border: "1px solid #d9cfc1" }}
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
                  
                  {roles.length === 0 && (
                    <div className="text-center py-10" style={{ color: darkText }}>
                      No roles found.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'catalogs' && (
            <div>
              <div 
                className="rounded-xl shadow-sm p-6 mb-6"
                style={{ backgroundColor: "#fff" }}
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                  <h2 className="text-2xl font-bold" style={{ color: darkText }}>Catalog Management</h2>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr style={{ backgroundColor: creamCard }}>
                        <th className="text-left p-3" style={{ color: darkText }}>Catalog ID</th>
                        <th className="text-left p-3" style={{ color: darkText }}>Title</th>
                        <th className="text-left p-3" style={{ color: darkText }}>Seller</th>
                        <th className="text-left p-3" style={{ color: darkText }}>Status</th>
                        <th className="text-left p-3" style={{ color: darkText }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {catalogs.map(catalog => (
                        <tr key={catalog.id} className="border-b" style={{ borderColor: "#d9cfc1" }}>
                          <td className="p-3" style={{ color: darkText }}>{catalog.id}</td>
                          <td className="p-3" style={{ color: darkText }}>{catalog.title}</td>
                          <td className="p-3" style={{ color: darkText }}>{catalog.seller}</td>
                          <td className="p-3">
                            <StatusBadge status={catalog.status} />
                          </td>
                          <td className="p-3">
                            <div className="flex flex-wrap gap-2">
                              <button 
                                className="px-3 py-1 rounded text-sm"
                                style={{ backgroundColor: "#fff", color: darkText, border: "1px solid #d9cfc1" }}
                              >
                                View
                              </button>
                              {catalog.status === 'pending' && (
                                <button 
                                  className="px-3 py-1 rounded text-sm"
                                  onClick={() => approveCatalog(catalog.id)}
                                  style={{ backgroundColor: "#2ecc71", color: "#fff" }}
                                >
                                  Approve
                                </button>
                              )}
                              <button 
                                className="px-3 py-1 rounded text-sm"
                                style={{ backgroundColor: "#e74c3c", color: "#fff" }}
                              >
                                Reject
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  
                  {catalogs.length === 0 && (
                    <div className="text-center py-10" style={{ color: darkText }}>
                      No catalogs found.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'rfqs' && (
            <div>
              <div 
                className="rounded-xl shadow-sm p-6 mb-6"
                style={{ backgroundColor: "#fff" }}
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                  <h2 className="text-2xl font-bold" style={{ color: darkText }}>RFQ Management</h2>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr style={{ backgroundColor: creamCard }}>
                        <th className="text-left p-3" style={{ color: darkText }}>RFQ ID</th>
                        <th className="text-left p-3" style={{ color: darkText }}>Product</th>
                        <th className="text-left p-3" style={{ color: darkText }}>Buyer</th>
                        <th className="text-left p-3" style={{ color: darkText }}>Status</th>
                        <th className="text-left p-3" style={{ color: darkText }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rfqs.map(rfq => (
                        <tr key={rfq.id} className="border-b" style={{ borderColor: "#d9cfc1" }}>
                          <td className="p-3" style={{ color: darkText }}>{rfq.id}</td>
                          <td className="p-3" style={{ color: darkText }}>{rfq.product}</td>
                          <td className="p-3" style={{ color: darkText }}>{rfq.buyer}</td>
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
                                Assign
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  
                  {rfqs.length === 0 && (
                    <div className="text-center py-10" style={{ color: darkText }}>
                      No RFQs found.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'dpqs' && (
            <div>
              <div 
                className="rounded-xl shadow-sm p-6 mb-6"
                style={{ backgroundColor: "#fff" }}
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                  <h2 className="text-2xl font-bold" style={{ color: darkText }}>DPQ Management</h2>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr style={{ backgroundColor: creamCard }}>
                        <th className="text-left p-3" style={{ color: darkText }}>DPQ ID</th>
                        <th className="text-left p-3" style={{ color: darkText }}>Product</th>
                        <th className="text-left p-3" style={{ color: darkText }}>Supplier</th>
                        <th className="text-left p-3" style={{ color: darkText }}>Status</th>
                        <th className="text-left p-3" style={{ color: darkText }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dpqs.map(dpq => (
                        <tr key={dpq.id} className="border-b" style={{ borderColor: "#d9cfc1" }}>
                          <td className="p-3" style={{ color: darkText }}>{dpq.id}</td>
                          <td className="p-3" style={{ color: darkText }}>{dpq.product}</td>
                          <td className="p-3" style={{ color: darkText }}>{dpq.supplier}</td>
                          <td className="p-3">
                            <StatusBadge status={dpq.status} />
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
                                Process
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  
                  {dpqs.length === 0 && (
                    <div className="text-center py-10" style={{ color: darkText }}>
                      No DPQs found.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'dpos' && (
            <div>
              <div 
                className="rounded-xl shadow-sm p-6 mb-6"
                style={{ backgroundColor: "#fff" }}
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                  <h2 className="text-2xl font-bold" style={{ color: darkText }}>DPO Management</h2>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr style={{ backgroundColor: creamCard }}>
                        <th className="text-left p-3" style={{ color: darkText }}>DPO ID</th>
                        <th className="text-left p-3" style={{ color: darkText }}>Product</th>
                        <th className="text-left p-3" style={{ color: darkText }}>Buyer</th>
                        <th className="text-left p-3" style={{ color: darkText }}>Status</th>
                        <th className="text-left p-3" style={{ color: darkText }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dpos.map(dpo => (
                        <tr key={dpo.id} className="border-b" style={{ borderColor: "#d9cfc1" }}>
                          <td className="p-3" style={{ color: darkText }}>{dpo.id}</td>
                          <td className="p-3" style={{ color: darkText }}>{dpo.product}</td>
                          <td className="p-3" style={{ color: darkText }}>{dpo.buyer}</td>
                          <td className="p-3">
                            <StatusBadge status={dpo.status} />
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
                                Confirm
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  
                  {dpos.length === 0 && (
                    <div className="text-center py-10" style={{ color: darkText }}>
                      No DPOs found.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'disputes' && (
            <div>
              <div 
                className="rounded-xl shadow-sm p-6 mb-6"
                style={{ backgroundColor: "#fff" }}
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                  <h2 className="text-2xl font-bold" style={{ color: darkText }}>Disputes</h2>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr style={{ backgroundColor: creamCard }}>
                        <th className="text-left p-3" style={{ color: darkText }}>Dispute ID</th>
                        <th className="text-left p-3" style={{ color: darkText }}>Parties</th>
                        <th className="text-left p-3" style={{ color: darkText }}>Reason</th>
                        <th className="text-left p-3" style={{ color: darkText }}>Status</th>
                        <th className="text-left p-3" style={{ color: darkText }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {disputes.map(dispute => (
                        <tr key={dispute.id} className="border-b" style={{ borderColor: "#d9cfc1" }}>
                          <td className="p-3" style={{ color: darkText }}>{dispute.id}</td>
                          <td className="p-3" style={{ color: darkText }}>{dispute.parties}</td>
                          <td className="p-3" style={{ color: darkText }}>{dispute.reason}</td>
                          <td className="p-3">
                            <StatusBadge status={dispute.status} />
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
                                style={{ backgroundColor: "#3498db", color: "#fff" }}
                              >
                                Assign
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  
                  {disputes.length === 0 && (
                    <div className="text-center py-10" style={{ color: darkText }}>
                      No disputes found.
                    </div>
                  )}
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