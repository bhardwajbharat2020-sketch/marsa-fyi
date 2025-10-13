import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from './DashboardLayout';
import '../App.css';

const DraftQuotationsPage = () => {
  const { authToken, userRole } = useAuth();
  const navigate = useNavigate();
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedQuotation, setSelectedQuotation] = useState(null);
  const [showQuotationDetails, setShowQuotationDetails] = useState(false);

  // Theme colors
  const bhagwa = "#f77f00";
  const cream = "#f6efe6";
  const creamCard = "#efe6d9";
  const darkText = "#5a4632";

  // Fetch draft quotations for the buyer
  const fetchDraftQuotations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch DPQs (Draft Product Quotations) for the buyer
      const response = await fetch('/api/buyer/dpqs', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setQuotations(data);
      } else {
        setError(data.error || 'Failed to fetch draft quotations');
      }
    } catch (err) {
      console.error('Error fetching draft quotations:', err);
      setError('Failed to fetch draft quotations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authToken) {
      fetchDraftQuotations();
    }
  }, [authToken]);

  // Status badge component
  const StatusBadge = ({ status }) => {
    const statusStyles = {
      draft: { backgroundColor: '#fff3cd', color: '#856404' },
      submitted: { backgroundColor: '#cce5ff', color: '#004085' },
      accepted: { backgroundColor: '#d4edda', color: '#155724' },
      rejected: { backgroundColor: '#f8d7da', color: '#721c24' }
    };
    
    const style = statusStyles[status.toLowerCase()] || statusStyles.draft;
    
    return (
      <span 
        className="px-3 py-1 rounded-full text-xs font-semibold"
        style={style}
      >
        {status}
      </span>
    );
  };

  // Function to view quotation details
  const viewQuotationDetails = (quotation) => {
    setSelectedQuotation(quotation);
    setShowQuotationDetails(true);
  };

  // Function to close quotation details modal
  const closeQuotationDetails = () => {
    setShowQuotationDetails(false);
    setSelectedQuotation(null);
  };

  // Function to accept quotation
  const acceptQuotation = async (quotationId) => {
    if (!window.confirm('Are you sure you want to accept this quotation?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/buyer/dpqs/${quotationId}/accept`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        // Update the quotation status in the local state
        setQuotations(prevQuotations => 
          prevQuotations.map(q => 
            q.id === quotationId ? { ...q, status: 'accepted' } : q
          )
        );
        
        alert('Quotation accepted successfully!');
      } else {
        alert('Failed to accept quotation: ' + data.error);
      }
    } catch (err) {
      console.error('Error accepting quotation:', err);
      alert('Failed to accept quotation. Please try again.');
    }
  };

  // Function to reject quotation
  const rejectQuotation = async (quotationId) => {
    if (!window.confirm('Are you sure you want to reject this quotation?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/buyer/dpqs/${quotationId}/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        // Update the quotation status in the local state
        setQuotations(prevQuotations => 
          prevQuotations.map(q => 
            q.id === quotationId ? { ...q, status: 'rejected' } : q
          )
        );
        
        alert('Quotation rejected successfully!');
      } else {
        alert('Failed to reject quotation: ' + data.error);
      }
    } catch (err) {
      console.error('Error rejecting quotation:', err);
      alert('Failed to reject quotation. Please try again.');
    }
  };

  return (
    <DashboardLayout title="Draft Quotations" role="buyer">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4" style={{ color: darkText }}>Draft Quotations</h2>
        
        {loading && (
          <div className="text-center py-10" style={{ color: darkText }}>
            Loading draft quotations...
          </div>
        )}
        
        {error && (
          <div className="text-center py-10 text-red-500">
            Error: {error}
          </div>
        )}
        
        {!loading && !error && quotations.length === 0 && (
          <div className="text-center py-10" style={{ color: darkText }}>
            <p className="mb-4">You don't have any draft quotations yet.</p>
            <button
              onClick={() => navigate('/shop')}
              className="px-4 py-2 rounded-lg font-semibold"
              style={{ backgroundColor: bhagwa, color: "#fff" }}
            >
              Browse Products
            </button>
          </div>
        )}
        
        {!loading && !error && quotations.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ backgroundColor: creamCard }}>
                  <th className="text-left p-3" style={{ color: darkText }}>Quotation ID</th>
                  <th className="text-left p-3" style={{ color: darkText }}>RFQ ID</th>
                  <th className="text-left p-3" style={{ color: darkText }}>Product</th>
                  <th className="text-left p-3" style={{ color: darkText }}>Quantity</th>
                  <th className="text-left p-3" style={{ color: darkText }}>Unit Price</th>
                  <th className="text-left p-3" style={{ color: darkText }}>Status</th>
                  <th className="text-left p-3" style={{ color: darkText }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {quotations.map(quotation => (
                  <tr key={quotation.id} className="border-b" style={{ borderColor: "#d9cfc1" }}>
                    <td className="p-3" style={{ color: darkText }}>{quotation.id}</td>
                    <td className="p-3" style={{ color: darkText }}>{quotation.rfqId}</td>
                    <td className="p-3" style={{ color: darkText }}>{quotation.product}</td>
                    <td className="p-3" style={{ color: darkText }}>{quotation.quantity}</td>
                    <td className="p-3" style={{ color: darkText }}>${quotation.unitPrice} {quotation.currency}</td>
                    <td className="p-3">
                      <StatusBadge status={quotation.status} />
                    </td>
                    <td className="p-3">
                      <div className="flex flex-wrap gap-2">
                        <button 
                          className="px-3 py-1 rounded text-sm"
                          style={{ backgroundColor: "#fff", color: darkText, border: "1px solid #d9cfc1" }}
                          onClick={() => viewQuotationDetails(quotation)}
                        >
                          View Details
                        </button>
                        {quotation.status === 'draft' && (
                          <>
                            <button 
                              className="px-3 py-1 rounded text-sm"
                              style={{ backgroundColor: "#2ecc71", color: "#fff" }}
                              onClick={() => acceptQuotation(quotation.id)}
                            >
                              Accept
                            </button>
                            <button 
                              className="px-3 py-1 rounded text-sm"
                              style={{ backgroundColor: "#e74c3c", color: "#fff" }}
                              onClick={() => rejectQuotation(quotation.id)}
                            >
                              Reject
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Quotation Details Modal */}
      {showQuotationDetails && selectedQuotation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" 
             style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" 
               style={{ backgroundColor: "#fff" }}>
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold" style={{ color: darkText }}>
                  Quotation Details
                </h3>
                <button 
                  className="p-2 rounded-full"
                  onClick={closeQuotationDetails}
                  style={{ backgroundColor: creamCard }}
                >
                  <span style={{ color: darkText, fontSize: '20px' }}>&times;</span>
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-sm" style={{ color: "#7a614a" }}>Quotation ID</p>
                  <p style={{ color: darkText }}>{selectedQuotation.id}</p>
                </div>
                <div>
                  <p className="text-sm" style={{ color: "#7a614a" }}>RFQ ID</p>
                  <p style={{ color: darkText }}>{selectedQuotation.rfqId}</p>
                </div>
                <div>
                  <p className="text-sm" style={{ color: "#7a614a" }}>Product</p>
                  <p style={{ color: darkText }}>{selectedQuotation.product}</p>
                </div>
                <div>
                  <p className="text-sm" style={{ color: "#7a614a" }}>Quantity</p>
                  <p style={{ color: darkText }}>{selectedQuotation.quantity}</p>
                </div>
                <div>
                  <p className="text-sm" style={{ color: "#7a614a" }}>Unit Price</p>
                  <p style={{ color: darkText }}>${selectedQuotation.unitPrice} {selectedQuotation.currency}</p>
                </div>
                <div>
                  <p className="text-sm" style={{ color: "#7a614a" }}>Status</p>
                  <p style={{ color: darkText }}>
                    <StatusBadge status={selectedQuotation.status} />
                  </p>
                </div>
                <div>
                  <p className="text-sm" style={{ color: "#7a614a" }}>Created At</p>
                  <p style={{ color: darkText }}>
                    {new Date(selectedQuotation.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
              
              {selectedQuotation.message && (
                <div className="mb-6">
                  <p className="text-sm" style={{ color: "#7a614a" }}>Message from Captain</p>
                  <p style={{ color: darkText }}>{selectedQuotation.message}</p>
                </div>
              )}
              
              <div className="flex justify-end gap-3">
                <button 
                  className="px-4 py-2 rounded-lg font-medium"
                  onClick={closeQuotationDetails}
                  style={{ backgroundColor: "#fff", color: darkText, border: "1px solid #d9cfc1" }}
                >
                  Close
                </button>
                {selectedQuotation.status === 'draft' && (
                  <>
                    <button 
                      className="px-4 py-2 rounded-lg font-medium"
                      onClick={() => {
                        closeQuotationDetails();
                        acceptQuotation(selectedQuotation.id);
                      }}
                      style={{ backgroundColor: "#2ecc71", color: "#fff" }}
                    >
                      Accept Quotation
                    </button>
                    <button 
                      className="px-4 py-2 rounded-lg font-medium"
                      onClick={() => {
                        closeQuotationDetails();
                        rejectQuotation(selectedQuotation.id);
                      }}
                      style={{ backgroundColor: "#e74c3c", color: "#fff" }}
                    >
                      Reject Quotation
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default DraftQuotationsPage;