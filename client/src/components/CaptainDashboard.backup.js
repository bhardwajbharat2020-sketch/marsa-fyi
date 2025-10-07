import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import DashboardLayout from './DashboardLayout';
import '../App.css';

const CaptainDashboard = () => {
  const { authToken } = useAuth();
  const [activeTab, setActiveTab] = useState('roles');
  const [roles, setRoles] = useState([]);
  const [catalogs, setCatalogs] = useState([]);
  const [rfqs, setRfqs] = useState([]);
  const [dpqs, setDpqs] = useState([]);
  const [dpos, setDpos] = useState([]);
  const [disputes, setDisputes] = useState([]);
  const [products, setProducts] = useState([]); // New state for products
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rejectionReason, setRejectionReason] = useState(''); // For rejection modal
  const [productToReject, setProductToReject] = useState(null); // For rejection modal
  
  // State for editing product
  const [showEditProductModal, setShowEditProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editProductData, setEditProductData] = useState({
    name: '',
    category: '',
    branded: 'branded',
    description: '',
    moq: '',
    moqUom: 'pcs',
    quantity: '',
    quantityUom: 'pcs',
    price: '',
    currency: 'USD',
    priceType: 'EXW',
    reLabeling: 'no',
    validityDate: '',
    validityTime: ''
  });

  // State for RFQ response
  const [showRFQResponseModal, setShowRFQResponseModal] = useState(false);
  const [selectedRFQ, setSelectedRFQ] = useState(null);
  const [rfqResponse, setRfqResponse] = useState({
    action: 'negotiate', // negotiate, doq, accept, reject
    message: ''
  });

  // State for RFQ details modal
  const [showRFQDetailsModal, setShowRFQDetailsModal] = useState(false);
  const [selectedRFQDetails, setSelectedRFQDetails] = useState(null);
  const [productDetails, setProductDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Define categories list (from ShopPage)
  const categories = [
    'All Categories',
    'Industrial Plants, Machinery & Equipment',
    'Consumer Electronics & Household Appliances',
    'Industrial & Engineering Products, Spares and Supplies',
    'Building Construction Material & Equipment',
    'Apparel, Clothing & Garments',
    'Vegetables, Fruits, Grains, Dairy Products & FMCG',
    'Medical, Pharma, Surgical & Healthcare',
    'Packaging Material, Supplies & Machines',
    'Chemicals, Dyes & Allied Products',
    'Kitchen Containers, Utensils & Cookware',
    'Textiles, Yarn, Fabrics & Allied Industries',
    'Books, Notebooks, Stationery & Publications',
    'Cosmetics, Toiletries & Personal Care Products',
    'Home Furnishings and Home Textiles',
    'Gems, Jewellery & Precious Stones',
    'Computers, Software, IT Support & Solutions',
    'Fashion & Garment Accessories',
    'Ayurvedic & Herbal Products',
    'Security Devices, Safety Systems & Services',
    'Sports Goods, Games, Toys & Accessories',
    'Telecom Products, Equipment & Supplies',
    'Stationery and Paper Products',
    'Bags, Handbags, Luggage & Accessories',
    'Stones, Marble & Granite Supplies',
    'Railway, Shipping & Aviation Products',
    'Leather and Leather Products & Accessories',
    'Electronics Components and Supplies',
    'Electrical Equipment and Supplies',
    'Pharmaceutical Drugs & Medicines',
    'Mechanical Components & Parts',
    'Scientific, Measuring & Laboratory Instruments',
    'Furniture, Furniture Supplies & Hardware',
    'Fertilizers, Seeds, Plants & Animal Husbandry',
    'Automobiles, Spare Parts and Accessories',
    'Housewares, Home Appliances & Decorations',
    'Metals, Minerals, Ores & Alloys',
    'Tools, Machine Tools & Power Tools',
    'Gifts, Crafts, Antiques & Handmade Decoratives',
    'Bicycles, Rickshaws, Spares and Accessories'
  ];

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
        setError(null); // Clear any previous errors
        
        // Fetch roles
        try {
          const rolesResponse = await fetch('/api/captain/roles', {
            headers: {
              'Authorization': `Bearer ${authToken}`
            }
          });
          const rolesData = await rolesResponse.json();
          
          if (rolesResponse.ok) {
            setRoles(rolesData);
          } else {
            console.error('Error fetching roles:', rolesData.error);
            // Don't set global error, just log it
          }
        } catch (err) {
          console.error('Error fetching roles:', err);
        }
        
        // Fetch catalogs
        try {
          const catalogsResponse = await fetch('/api/captain/catalogs', {
            headers: {
              'Authorization': `Bearer ${authToken}`
            }
          });
          const catalogsData = await catalogsResponse.json();
          
          if (catalogsResponse.ok) {
            setCatalogs(catalogsData);
          } else {
            console.error('Error fetching catalogs:', catalogsData.error);
            // Don't set global error, just log it
          }
        } catch (err) {
          console.error('Error fetching catalogs:', err);
        }
        
        // Fetch RFQs
        try {
          const rfqsResponse = await fetch('/api/captain/rfqs', {
            headers: {
              'Authorization': `Bearer ${authToken}`
            }
          });
          const rfqsData = await rfqsResponse.json();
          
          if (rfqsResponse.ok) {
            setRfqs(rfqsData);
            console.log('Successfully fetched RFQs:', rfqsData);
          } else {
            console.error('Error fetching RFQs:', rfqsData.error);
            // Don't set global error, just log it
          }
        } catch (err) {
          console.error('Error fetching RFQs:', err);
        }
        
        // Fetch DPQs
        try {
          const dpqsResponse = await fetch('/api/captain/dpqs', {
            headers: {
              'Authorization': `Bearer ${authToken}`
            }
          });
          const dpqsData = await dpqsResponse.json();
          
          if (dpqsResponse.ok) {
            setDpqs(dpqsData);
          } else {
            console.error('Error fetching DPQs:', dpqsData.error);
            // Don't set global error, just log it
          }
        } catch (err) {
          console.error('Error fetching DPQs:', err);
        }
        
        // Fetch DPOs
        try {
          const dposResponse = await fetch('/api/captain/dpos', {
            headers: {
              'Authorization': `Bearer ${authToken}`
            }
          });
          const dposData = await dposResponse.json();
          
          if (dposResponse.ok) {
            setDpos(dposData);
          } else {
            console.error('Error fetching DPOs:', dposData.error);
            // Don't set global error, just log it
          }
        } catch (err) {
          console.error('Error fetching DPOs:', err);
        }
        
        // Fetch disputes
        try {
          const disputesResponse = await fetch('/api/captain/disputes', {
            headers: {
              'Authorization': `Bearer ${authToken}`
            }
          });
          const disputesData = await disputesResponse.json();
          
          if (disputesResponse.ok) {
            setDisputes(disputesData);
          } else {
            console.error('Error fetching disputes:', disputesData.error);
            // Don't set global error, just log it
          }
        } catch (err) {
          console.error('Error fetching disputes:', err);
        }
        
        // Fetch products pending approval
        try {
          const productsResponse = await fetch('/api/captain/products', {
            headers: {
              'Authorization': `Bearer ${authToken}`
            }
          });
          const productsData = await productsResponse.json();
          
          if (productsResponse.ok) {
            setProducts(productsData);
          } else {
            console.error('Error fetching products:', productsData.error);
            // Don't set global error, just log it
          }
        } catch (err) {
          console.error('Error fetching products:', err);
          // Don't set global error, just log it
        }
      } catch (err) {
        console.error('Unexpected error in dashboard data fetching:', err);
        setError('Failed to fetch dashboard data');
      } finally {
        setLoading(false);
      }
    };

    if (authToken) {
      fetchData();
    }
  }, [authToken]);

  // Function to approve a catalog
  const approveCatalog = async (catalogId) => {
    try {
      const response = await fetch('/api/captain/catalogs/approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
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

  // Function to approve a product
  const approveProduct = async (productId) => {
    try {
      const response = await fetch('/api/captain/products/approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ productId }),
      });
      
      const result = await response.json();
      
      if (response.ok) {
        // Update the products state to reflect the approval
        setProducts(prevProducts => 
          prevProducts.filter(product => product.id !== productId)
        );
        
        alert('Product approved successfully!');
      } else {
        alert('Failed to approve product: ' + result.error);
      }
    } catch (err) {
      console.error('Error approving product:', err);
      alert('Failed to approve product. Please try again.');
    }
  };

  // Function to reject a product
  const rejectProduct = async () => {
    if (!productToReject || !rejectionReason) {
      alert('Please provide a rejection reason');
      return;
    }
    
    try {
      const response = await fetch('/api/captain/products/reject', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ 
          productId: productToReject.id,
          reason: rejectionReason
        }),
      });
      
      const result = await response.json();
      
      if (response.ok) {
        // Update the products state to reflect the rejection
        setProducts(prevProducts => 
          prevProducts.filter(product => product.id !== productToReject.id)
        );
        
        // Close modal and reset state
        setProductToReject(null);
        setRejectionReason('');
        
        alert('Product rejected successfully!');
      } else {
        alert('Failed to reject product: ' + result.error);
      }
    } catch (err) {
      console.error('Error rejecting product:', err);
      alert('Failed to reject product. Please try again.');
    }
  };

  // Function to open edit product modal
  const openEditProductModal = (product) => {
    setEditingProduct(product);
    setEditProductData({
      name: product.name || '',
      category: product.category || '',
      branded: 'branded', // Default value
      description: product.description || '',
      moq: product.moq || '',
      moqUom: product.moqUom || 'pcs',
      quantity: product.quantity || '',
      quantityUom: product.quantityUom || 'pcs',
      price: product.price || '',
      currency: product.currency || 'USD',
      priceType: product.priceType || 'EXW',
      reLabeling: product.reLabeling || 'no',
      validityDate: product.validityDate || '',
      validityTime: product.validityTime || ''
    });
    setShowEditProductModal(true);
  };

  // Handle input changes for edit product form
  const handleEditProductInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditProductData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle edit product form submission
  const handleEditProduct = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch(`/api/captain/products/${editingProduct.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          name: editProductData.name,
          category: editProductData.category,
          description: editProductData.description,
          price: parseFloat(editProductData.price),
          currency: editProductData.currency,
          moq: editProductData.moq,
          moqUom: editProductData.moqUom,
          quantity: editProductData.quantity,
          quantityUom: editProductData.quantityUom,
          priceType: editProductData.priceType,
          reLabeling: editProductData.reLabeling,
          validityDate: editProductData.validityDate,
          validityTime: editProductData.validityTime
        }),
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        // Update the products state with the edited product
        setProducts(prevProducts => 
          prevProducts.map(product => 
            product.id === editingProduct.id 
              ? { ...product, ...editProductData }
              : product
          )
        );
        
        // Close modal and reset state
        setShowEditProductModal(false);
        setEditingProduct(null);
        setEditProductData({
          name: '',
          category: '',
          branded: 'branded',
          description: '',
          moq: '',
          moqUom: 'pcs',
          quantity: '',
          quantityUom: 'pcs',
          price: '',
          currency: 'USD',
          priceType: 'EXW',
          reLabeling: 'no',
          validityDate: '',
          validityTime: ''
        });
        
        alert('Product updated successfully! A notification has been sent to the seller.');
      } else {
        alert('Failed to update product: ' + result.error);
      }
    } catch (err) {
      console.error('Error updating product:', err);
      alert('Failed to update product. Please try again.');
    }
  };

  // Function to open RFQ response modal
  const openRFQResponseModal = (rfq) => {
    setSelectedRFQ(rfq);
    setRfqResponse({
      action: 'negotiate',
      message: ''
    });
    setShowRFQResponseModal(true);
  };

  // Handle input changes for RFQ response form
  const handleRFQResponseChange = (e) => {
    const { name, value } = e.target;
    setRfqResponse(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle RFQ response submission
  const handleRFQResponseSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedRFQ || !rfqResponse.message) {
      alert('Please provide a response message');
      return;
    }
    
    try {
      const response = await fetch(`/api/captain/rfqs/${selectedRFQ.id}/respond`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          response: rfqResponse.message,
          action: rfqResponse.action
        }),
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        // Update RFQ status in the local state
        setRfqs(prevRfqs => 
          prevRfqs.map(rfq => 
            rfq.id === selectedRFQ.id 
              ? { ...rfq, status: result.rfq.status } 
              : rfq
          )
        );
        
        // Close modal and reset state
        setShowRFQResponseModal(false);
        setSelectedRFQ(null);
        setRfqResponse({
          action: 'negotiate',
          message: ''
        });
        
        alert('RFQ response submitted successfully!');
      } else {
        alert('Failed to submit RFQ response: ' + result.error);
      }
    } catch (err) {
      console.error('Error submitting RFQ response:', err);
      alert('Failed to submit RFQ response. Please try again.');
    }
  };

  // Function to fetch RFQ details
  const fetchRFQDetails = async (rfqId) => {
    try {
      setLoadingDetails(true);
      
      // Fetch RFQ details
      const rfqResponse = await fetch(`/api/captain/rfqs/${rfqId}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      const rfqData = await rfqResponse.json();
      
      if (rfqResponse.ok) {
        setSelectedRFQDetails(rfqData);
        
        // Fetch product details if product_id exists
        if (rfqData.product_id) {
          const productResponse = await fetch(`/api/products/${rfqData.product_id}`);
          const productData = await productResponse.json();
          
          if (productResponse.ok) {
            setProductDetails(productData);
          } else {
            console.error('Error fetching product details:', productData.error);
            setProductDetails(null);
          }
        }
        
        setShowRFQDetailsModal(true);
      } else {
        console.error('Error fetching RFQ details:', rfqData.error);
        alert('Failed to fetch RFQ details: ' + rfqData.error);
      }
    } catch (err) {
      console.error('Error fetching RFQ details:', err);
      alert('Failed to fetch RFQ details. Please try again.');
    } finally {
      setLoadingDetails(false);
    }
  };

  // Function to close RFQ details modal
  const closeRFQDetailsModal = () => {
    setShowRFQDetailsModal(false);
    setSelectedRFQDetails(null);
    setProductDetails(null);
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
      resolved: { backgroundColor: '#d4edda', color: '#155724' },
      submitted: { backgroundColor: '#cce5ff', color: '#004085' }
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
            activeTab === 'products' ? 'border-b-2' : ''
          }`}
          onClick={() => setActiveTab('products')}
          style={{ 
            color: activeTab === 'products' ? bhagwa : darkText,
            borderColor: activeTab === 'products' ? bhagwa : 'transparent'
          }}
        >
          Product Management
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
                      {roles.length > 0 ? roles.map(role => (
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
                      )) : (
                        <tr>
                          <td colSpan="4" className="text-center py-10" style={{ color: darkText }}>
                            No roles found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
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
                      {catalogs.length > 0 ? catalogs.map(catalog => (
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
                      )) : (
                        <tr>
                          <td colSpan="5" className="text-center py-10" style={{ color: darkText }}>
                            No catalogs found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'products' && (
            <div>
              <div 
                className="rounded-xl shadow-sm p-6 mb-6"
                style={{ backgroundColor: "#fff" }}
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                  <h2 className="text-2xl font-bold" style={{ color: darkText }}>Product Management</h2>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr style={{ backgroundColor: creamCard }}>
                        <th className="text-left p-3" style={{ color: darkText }}>Product ID</th>
                        <th className="text-left p-3" style={{ color: darkText }}>Name</th>
                        <th className="text-left p-3" style={{ color: darkText }}>Seller</th>
                        <th className="text-left p-3" style={{ color: darkText }}>Category</th>
                        <th className="text-left p-3" style={{ color: darkText }}>Price</th>
                        <th className="text-left p-3" style={{ color: darkText }}>Status</th>
                        <th className="text-left p-3" style={{ color: darkText }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.length > 0 ? products.map(product => (
                        <tr key={product.id} className="border-b" style={{ borderColor: "#d9cfc1" }}>
                          <td className="p-3" style={{ color: darkText }}>{product.id}</td>
                          <td className="p-3" style={{ color: darkText }}>{product.name}</td>
                          <td className="p-3" style={{ color: darkText }}>{product.sellerName}</td>
                          <td className="p-3" style={{ color: darkText }}>{product.category}</td>
                          <td className="p-3" style={{ color: darkText }}>${product.price} {product.currency}</td>
                          <td className="p-3">
                            <StatusBadge status={product.status} />
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
                                onClick={() => openEditProductModal(product)}
                                style={{ backgroundColor: "#3498db", color: "#fff" }}
                              >
                                Edit
                              </button>
                              <button 
                                className="px-3 py-1 rounded text-sm"
                                onClick={() => approveProduct(product.id)}
                                style={{ backgroundColor: "#2ecc71", color: "#fff" }}
                              >
                                Approve
                              </button>
                              <button 
                                className="px-3 py-1 rounded text-sm"
                                onClick={() => setProductToReject(product)}
                                style={{ backgroundColor: "#e74c3c", color: "#fff" }}
                              >
                                Reject
                              </button>
                            </div>
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan="7" className="text-center py-10" style={{ color: darkText }}>
                            No products pending approval.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
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
                
                {/* Need Action Section - for all RFQs with status other than "open" */}
                {rfqs.filter(rfq => rfq.status?.toLowerCase() !== 'open').length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-xl font-bold mb-4" style={{ color: darkText }}>Need Action</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr style={{ backgroundColor: creamCard }}>
                            <th className="text-left p-3" style={{ color: darkText }}>RFQ ID</th>
                            <th className="text-left p-3" style={{ color: darkText }}>Product</th>
                            <th className="text-left p-3" style={{ color: darkText }}>Buyer</th>
                            <th className="text-left p-3" style={{ color: darkText }}>Quantity</th>
                            <th className="text-left p-3" style={{ color: darkText }}>Status</th>
                            <th className="text-left p-3" style={{ color: darkText }}>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {rfqs
                            .filter(rfq => rfq.status?.toLowerCase() !== 'open')
                            .map(rfq => (
                            <tr key={rfq.id} className="border-b" style={{ borderColor: "#d9cfc1" }}>
                              <td className="p-3" style={{ color: darkText }}>{rfq.id}</td>
                              <td className="p-3" style={{ color: darkText }}>{rfq.title}</td>
                              <td className="p-3" style={{ color: darkText }}>{rfq.buyer}</td>
                              <td className="p-3" style={{ color: darkText }}>{rfq.quantity}</td>
                              <td className="p-3">
                                <StatusBadge status={rfq.status} />
                              </td>
                              <td className="p-3">
                                <div className="flex flex-wrap gap-2">
                                  <button 
                                    className="px-3 py-1 rounded text-sm"
                                    style={{ backgroundColor: "#fff", color: darkText, border: "1px solid #d9cfc1" }}
                                    onClick={() => fetchRFQDetails(rfq.id)}
                                  >
                                    See Details
                                  </button>
                                  <button 
                                    className="px-3 py-1 rounded text-sm"
                                    style={{ backgroundColor: "#fff", color: darkText, border: "1px solid #d9cfc1" }}
                                    onClick={() => openRFQResponseModal(rfq)}
                                  >
                                    Respond
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
                
                {/* All RFQs Section - only "open" RFQs */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr style={{ backgroundColor: creamCard }}>
                        <th className="text-left p-3" style={{ color: darkText }}>RFQ ID</th>
                        <th className="text-left p-3" style={{ color: darkText }}>Product</th>
                        <th className="text-left p-3" style={{ color: darkText }}>Buyer</th>
                        <th className="text-left p-3" style={{ color: darkText }}>Quantity</th>
                        <th className="text-left p-3" style={{ color: darkText }}>Status</th>
                        <th className="text-left p-3" style={{ color: darkText }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rfqs
                        .filter(rfq => rfq.status?.toLowerCase() === 'open')
                        .length > 0 ? 
                        rfqs
                          .filter(rfq => rfq.status?.toLowerCase() === 'open')
                          .map(rfq => (
                          <tr key={rfq.id} className="border-b" style={{ borderColor: "#d9cfc1" }}>
                            <td className="p-3" style={{ color: darkText }}>{rfq.id}</td>
                            <td className="p-3" style={{ color: darkText }}>{rfq.title}</td>
                            <td className="p-3" style={{ color: darkText }}>{rfq.buyer}</td>
                            <td className="p-3" style={{ color: darkText }}>{rfq.quantity}</td>
                            <td className="p-3">
                              <StatusBadge status={rfq.status} />
                            </td>
                            <td className="p-3">
                              <div className="flex flex-wrap gap-2">
                                <button 
                                  className="px-3 py-1 rounded text-sm"
                                  style={{ backgroundColor: "#fff", color: darkText, border: "1px solid #d9cfc1" }}
                                  onClick={() => fetchRFQDetails(rfq.id)}
                                >
                                  See Details
                                </button>
                                <button 
                                  className="px-3 py-1 rounded text-sm"
                                  style={{ backgroundColor: "#fff", color: darkText, border: "1px solid #d9cfc1" }}
                                  onClick={() => openRFQResponseModal(rfq)}
                                >
                                  Respond
                                </button>
                                <button 
                                  className="px-3 py-1 rounded text-sm"
                                  style={{ backgroundColor: "#2ecc71", color: "#fff" }}
                                >
                                  Assign
                                </button>
                              </div>
                            </td>
                          </tr>
                        )) : (
                        <tr>
                          <td colSpan="6" className="text-center py-10" style={{ color: darkText }}>
                            No open RFQs found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
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
                      {dpqs.length > 0 ? dpqs.map(dpq => (
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
                      )) : (
                        <tr>
                          <td colSpan="5" className="text-center py-10" style={{ color: darkText }}>
                            No DPQs found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
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
                      {dpos.length > 0 ? dpos.map(dpo => (
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
                      )) : (
                        <tr>
                          <td colSpan="5" className="text-center py-10" style={{ color: darkText }}>
                            No DPOs found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
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
                      {disputes.length > 0 ? disputes.map(dispute => (
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
                      )) : (
                        <tr>
                          <td colSpan="5" className="text-center py-10" style={{ color: darkText }}>
                            No disputes found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Rejection Reason Modal */}
      {productToReject && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div 
            className="rounded-xl w-full max-w-md"
            style={{ backgroundColor: "#fff" }}
          >
            <div className="p-6">
              <h3 className="text-xl font-bold mb-4" style={{ color: darkText }}>Reject Product</h3>
              <p className="mb-4" style={{ color: darkText }}>
                Please provide a reason for rejecting the product "{productToReject.name}":
              </p>
              <textarea
                className="w-full p-3 rounded-lg border mb-4"
                style={{ borderColor: "#d9cfc1", backgroundColor: "#fff", color: darkText }}
                rows="4"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Enter rejection reason..."
              ></textarea>
              <div className="flex justify-end gap-3">
                <button 
                  className="px-4 py-2 rounded-lg font-medium"
                  onClick={() => {
                    setProductToReject(null);
                    setRejectionReason('');
                  }}
                  style={{ backgroundColor: "#fff", color: darkText, border: "1px solid #d9cfc1" }}
                >
                  Cancel
                </button>
                <button 
                  className="px-4 py-2 rounded-lg font-medium"
                  onClick={rejectProduct}
                  style={{ backgroundColor: "#e74c3c", color: "#fff" }}
                >
                  Reject Product
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {showEditProductModal && editingProduct && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div 
            className="rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            style={{ backgroundColor: "#fff" }}
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold" style={{ color: darkText }}>Edit Product</h3>
                <button 
                  className="p-2 rounded-full"
                  onClick={() => setShowEditProductModal(false)}
                  style={{ backgroundColor: creamCard }}
                >
                  <span style={{ color: darkText, fontSize: '20px' }}>&times;</span>
                </button>
              </div>
              <form onSubmit={handleEditProduct}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {/* Product Name */}
                  <div className="md:col-span-2">
                    <label htmlFor="edit-name" className="block mb-2 font-medium" style={{ color: darkText }}>
                      Product Name/Version *
                    </label>
                    <input
                      type="text"
                      id="edit-name"
                      name="name"
                      className="w-full p-3 rounded-lg border"
                      style={{ borderColor: "#d9cfc1", backgroundColor: "#fff", color: darkText }}
                      value={editProductData.name}
                      onChange={handleEditProductInputChange}
                      required
                    />
                  </div>
                  
                  {/* Category */}
                  <div>
                    <label htmlFor="edit-category" className="block mb-2 font-medium" style={{ color: darkText }}>
                      Product Category *
                    </label>
                    <select
                      id="edit-category"
                      name="category"
                      className="w-full p-3 rounded-lg border"
                      style={{ borderColor: "#d9cfc1", backgroundColor: "#fff", color: darkText }}
                      value={editProductData.category}
                      onChange={handleEditProductInputChange}
                      required
                    >
                      <option value="">Select a category</option>
                      {categories.map((category, index) => (
                        <option key={index} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Branded/Unbranded */}
                  <div>
                    <label className="block mb-2 font-medium" style={{ color: darkText }}>
                      Branded/Unbranded *
                    </label>
                    <div className="flex gap-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="branded"
                          value="branded"
                          checked={editProductData.branded === 'branded'}
                          onChange={handleEditProductInputChange}
                          className="mr-2"
                        />
                        <span style={{ color: darkText }}>Branded</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="branded"
                          value="unbranded"
                          checked={editProductData.branded === 'unbranded'}
                          onChange={handleEditProductInputChange}
                          className="mr-2"
                        />
                        <span style={{ color: darkText }}>Unbranded</span>
                      </label>
                    </div>
                  </div>
                  
                  {/* MOQ and UOM */}
                  <div>
                    <label htmlFor="edit-moq" className="block mb-2 font-medium" style={{ color: darkText }}>
                      MOQ
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        id="edit-moq"
                        name="moq"
                        className="w-full p-3 rounded-lg border"
                        style={{ borderColor: "#d9cfc1", backgroundColor: "#fff", color: darkText }}
                        value={editProductData.moq}
                        onChange={handleEditProductInputChange}
                        min="0"
                      />
                      <select
                        name="moqUom"
                        className="p-3 rounded-lg border"
                        style={{ borderColor: "#d9cfc1", backgroundColor: "#fff", color: darkText }}
                        value={editProductData.moqUom}
                        onChange={handleEditProductInputChange}
                      >
                        <option value="pcs">pcs</option>
                        <option value="kg">kg</option>
                        <option value="ltr">ltr</option>
                        <option value="mtr">mtr</option>
                      </select>
                    </div>
                  </div>
                  
                  {/* Available Quantity and UOM */}
                  <div>
                    <label htmlFor="edit-quantity" className="block mb-2 font-medium" style={{ color: darkText }}>
                      Available Quantity
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        id="edit-quantity"
                        name="quantity"
                        className="w-full p-3 rounded-lg border"
                        style={{ borderColor: "#d9cfc1", backgroundColor: "#fff", color: darkText }}
                        value={editProductData.quantity}
                        onChange={handleEditProductInputChange}
                        min="0"
                      />
                      <select
                        name="quantityUom"
                        className="p-3 rounded-lg border"
                        style={{ borderColor: "#d9cfc1", backgroundColor: "#fff", color: darkText }}
                        value={editProductData.quantityUom}
                        onChange={handleEditProductInputChange}
                      >
                        <option value="pcs">pcs</option>
                        <option value="kg">kg</option>
                        <option value="ltr">ltr</option>
                        <option value="mtr">mtr</option>
                      </select>
                    </div>
                  </div>
                  
                  {/* Offer Price and Currency */}
                  <div>
                    <label htmlFor="edit-price" className="block mb-2 font-medium" style={{ color: darkText }}>
                      Offer Price *
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        id="edit-price"
                        name="price"
                        className="w-full p-3 rounded-lg border"
                        style={{ borderColor: "#d9cfc1", backgroundColor: "#fff", color: darkText }}
                        value={editProductData.price}
                        onChange={handleEditProductInputChange}
                        required
                        min="0"
                        step="0.01"
                      />
                      <select
                        name="currency"
                        className="p-3 rounded-lg border"
                        style={{ borderColor: "#d9cfc1", backgroundColor: "#fff", color: darkText }}
                        value={editProductData.currency}
                        onChange={handleEditProductInputChange}
                      >
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                        <option value="GBP">GBP</option>
                        <option value="INR">INR</option>
                      </select>
                    </div>
                  </div>
                  
                  {/* Price Type */}
                  <div>
                    <label htmlFor="edit-priceType" className="block mb-2 font-medium" style={{ color: darkText }}>
                      Price Type
                    </label>
                    <select
                      id="edit-priceType"
                      name="priceType"
                      className="w-full p-3 rounded-lg border"
                      style={{ borderColor: "#d9cfc1", backgroundColor: "#fff", color: darkText }}
                      value={editProductData.priceType}
                      onChange={handleEditProductInputChange}
                    >
                      <option value="EXW">EXW</option>
                      <option value="FOB">FOB</option>
                      <option value="CIF">CIF</option>
                      <option value="DDP">DDP</option>
                    </select>
                  </div>
                  
                  {/* Re-labeling Option */}
                  <div>
                    <label className="block mb-2 font-medium" style={{ color: darkText }}>
                      Re-labeling Option
                    </label>
                    <div className="flex gap-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="reLabeling"
                          value="yes"
                          checked={editProductData.reLabeling === 'yes'}
                          onChange={handleEditProductInputChange}
                          className="mr-2"
                        />
                        <span style={{ color: darkText }}>Yes</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="reLabeling"
                          value="no"
                          checked={editProductData.reLabeling === 'no'}
                          onChange={handleEditProductInputChange}
                          className="mr-2"
                        />
                        <span style={{ color: darkText }}>No</span>
                      </label>
                    </div>
                  </div>
                  
                  {/* Offer Validity */}
                  <div>
                    <label className="block mb-2 font-medium" style={{ color: darkText }}>
                      Offer Validity
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="date"
                        name="validityDate"
                        className="w-full p-3 rounded-lg border"
                        style={{ borderColor: "#d9cfc1", backgroundColor: "#fff", color: darkText }}
                        value={editProductData.validityDate}
                        onChange={handleEditProductInputChange}
                      />
                      <input
                        type="time"
                        name="validityTime"
                        className="w-full p-3 rounded-lg border"
                        style={{ borderColor: "#d9cfc1", backgroundColor: "#fff", color: darkText }}
                        value={editProductData.validityTime}
                        onChange={handleEditProductInputChange}
                      />
                    </div>
                  </div>
                </div>
                
                {/* Description */}
                <div className="mb-4">
                  <label htmlFor="edit-description" className="block mb-2 font-medium" style={{ color: darkText }}>
                    Description *
                  </label>
                  <textarea
                    id="edit-description"
                    name="description"
                    className="w-full p-3 rounded-lg border"
                    style={{ borderColor: "#d9cfc1", backgroundColor: "#fff", color: darkText }}
                    value={editProductData.description}
                    onChange={handleEditProductInputChange}
                    rows="4"
                    required
                  ></textarea>
                  <p className="text-sm mt-1" style={{ color: "#7a614a" }}>
                    * No contact details allowed in description
                  </p>
                </div>
                
                <div className="flex justify-end gap-3">
                  <button 
                    type="button" 
                    className="px-4 py-2 rounded-lg font-medium"
                    onClick={() => setShowEditProductModal(false)}
                    style={{ backgroundColor: "#fff", color: darkText, border: "1px solid #d9cfc1" }}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="px-4 py-2 rounded-lg font-medium"
                    style={{ backgroundColor: bhagwa, color: "#fff" }}
                  >
                    Update Product
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* RFQ Response Modal */}
      {showRFQResponseModal && selectedRFQ && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div 
            className="rounded-xl w-full max-w-md"
            style={{ backgroundColor: "#fff" }}
          >
            <div className="p-6">
              <h3 className="text-xl font-bold mb-4" style={{ color: darkText }}>Respond to RFQ</h3>
              <p className="mb-4" style={{ color: darkText }}>
                Respond to RFQ #{selectedRFQ.id} for "{selectedRFQ.title}"
              </p>
              <form onSubmit={handleRFQResponseSubmit}>
                <div className="mb-4">
                  <label className="block mb-2 font-medium" style={{ color: darkText }}>
                    Action
                  </label>
                  <select
                    name="action"
                    className="w-full p-3 rounded-lg border"
                    style={{ borderColor: "#d9cfc1", backgroundColor: "#fff", color: darkText }}
                    value={rfqResponse.action}
                    onChange={handleRFQResponseChange}
                  >
                    <option value="negotiate">Request Negotiation</option>
                    <option value="doq">Provide Document of Quotation (DOQ)</option>
                    <option value="accept">Accept RFQ</option>
                    <option value="reject">Reject RFQ</option>
                  </select>
                </div>
                
                <div className="mb-4">
                  <label htmlFor="rfq-response-message" className="block mb-2 font-medium" style={{ color: darkText }}>
                    Response Message *
                  </label>
                  <textarea
                    id="rfq-response-message"
                    name="message"
                    className="w-full p-3 rounded-lg border"
                    style={{ borderColor: "#d9cfc1", backgroundColor: "#fff", color: darkText }}
                    rows="4"
                    value={rfqResponse.message}
                    onChange={handleRFQResponseChange}
                    placeholder="Enter your response..."
                    required
                  ></textarea>
                </div>
                
                <div className="flex justify-end gap-3">
                  <button 
                    type="button"
                    className="px-4 py-2 rounded-lg font-medium"
                    onClick={() => {
                      setShowRFQResponseModal(false);
                      setSelectedRFQ(null);
                      setRfqResponse({
                        action: 'negotiate',
                        message: ''
                      });
                    }}
                    style={{ backgroundColor: "#fff", color: darkText, border: "1px solid #d9cfc1" }}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="px-4 py-2 rounded-lg font-medium"
                    style={{ backgroundColor: bhagwa, color: "#fff" }}
                  >
                    Submit Response
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* RFQ Details Modal */}
      {showRFQDetailsModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div 
            className="rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            style={{ backgroundColor: "#fff" }}
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold" style={{ color: darkText }}>RFQ Details</h3>
                <button 
                  className="p-2 rounded-full"
                  onClick={closeRFQDetailsModal}
                  style={{ backgroundColor: creamCard }}
                >
                  <span style={{ color: darkText, fontSize: '20px' }}>&times;</span>
                </button>
              </div>
              
              {loadingDetails ? (
                <div className="text-center py-10" style={{ color: darkText }}>
                  Loading RFQ details...
                </div>
              ) : selectedRFQDetails ? (
                <div>
                  {/* Buyer RFQ Details */}
                  <div className="mb-6">
                    <h4 className="text-lg font-bold mb-3" style={{ color: darkText, borderBottom: `1px solid ${creamCard}`, paddingBottom: '8px' }}>
                      Buyer RFQ Details
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm" style={{ color: "#7a614a" }}>RFQ ID</p>
                        <p style={{ color: darkText }}>{selectedRFQDetails.id}</p>
                      </div>
                      <div>
                        <p className="text-sm" style={{ color: "#7a614a" }}>Product Title</p>
                        <p style={{ color: darkText }}>{selectedRFQDetails.title}</p>
                      </div>
                      <div>
                        <p className="text-sm" style={{ color: "#7a614a" }}>Buyer</p>
                        <p style={{ color: darkText }}>{selectedRFQDetails.buyer.vendorCode}</p>
                      </div>
                      <div>
                        <p className="text-sm" style={{ color: "#7a614a" }}>Quantity</p>
                        <p style={{ color: darkText }}>{selectedRFQDetails.quantity}</p>
                      </div>
                      <div>
                        <p className="text-sm" style={{ color: "#7a614a" }}>Status</p>
                        <p style={{ color: darkText }}>
                          <StatusBadge status={selectedRFQDetails.status} />
                        </p>
                      </div>
                      <div>
                        <p className="text-sm" style={{ color: "#7a614a" }}>Created At</p>
                        <p style={{ color: darkText }}>
                          {new Date(selectedRFQDetails.createdAt).toLocaleString()}
                        </p>
                      </div>
                      {selectedRFQDetails.budgetRangeMin && (
                        <div>
                          <p className="text-sm" style={{ color: "#7a614a" }}>Budget Range (Min)</p>
                          <p style={{ color: darkText }}>${selectedRFQDetails.budgetRangeMin}</p>
                        </div>
                      )}
                      {selectedRFQDetails.budgetRangeMax && (
                        <div>
                          <p className="text-sm" style={{ color: "#7a614a" }}>Budget Range (Max)</p>
                          <p style={{ color: darkText }}>${selectedRFQDetails.budgetRangeMax}</p>
                        </div>
                      )}
                      {selectedRFQDetails.responseDeadline && (
                        <div>
                          <p className="text-sm" style={{ color: "#7a614a" }}>Response Deadline</p>
                          <p style={{ color: darkText }}>
                            {new Date(selectedRFQDetails.responseDeadline).toLocaleString()}
                          </p>
                        </div>
                      )}
                    </div>
                    
                    {selectedRFQDetails.description && (
                      <div className="mt-4">
                        <p className="text-sm" style={{ color: "#7a614a" }}>Description</p>
                        <p style={{ color: darkText }}>{selectedRFQDetails.description}</p>
                      </div>
                    )}
                  </div>
                  
                  {/* Product Details (if available) */}
                  {selectedRFQDetails.productDetails && (
                    <div className="mb-6">
                      <h4 className="text-lg font-bold mb-3" style={{ color: darkText, borderBottom: `1px solid ${creamCard}`, paddingBottom: '8px' }}>
                        Seller Product Details
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm" style={{ color: "#7a614a" }}>Product Name</p>
                          <p style={{ color: darkText }}>{selectedRFQDetails.productDetails.name}</p>
                        </div>
                        <div>
                          <p className="text-sm" style={{ color: "#7a614a" }}>Category</p>
                          <p style={{ color: darkText }}>{selectedRFQDetails.productDetails.category}</p>
                        </div>
                        <div>
                          <p className="text-sm" style={{ color: "#7a614a" }}>Price</p>
                          <p style={{ color: darkText }}>${selectedRFQDetails.productDetails.price} {selectedRFQDetails.productDetails.currency}</p>
                        </div>
                        <div>
                          <p className="text-sm" style={{ color: "#7a614a" }}>MOQ</p>
                          <p style={{ color: darkText }}>
                            {selectedRFQDetails.productDetails.moq} {selectedRFQDetails.productDetails.moqUom}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm" style={{ color: "#7a614a" }}>Available Quantity</p>
                          <p style={{ color: darkText }}>
                            {selectedRFQDetails.productDetails.availableQuantity} {selectedRFQDetails.productDetails.quantityUom}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm" style={{ color: "#7a614a" }}>Price Type</p>
                          <p style={{ color: darkText }}>{selectedRFQDetails.productDetails.priceType}</p>
                        </div>
                        {selectedRFQDetails.productDetails.offerValidityDate && (
                          <div>
                            <p className="text-sm" style={{ color: "#7a614a" }}>Offer Validity</p>
                            <p style={{ color: darkText }}>
                              {new Date(selectedRFQDetails.productDetails.offerValidityDate).toLocaleString()}
                            </p>
                          </div>
                        )}
                        <div>
                          <p className="text-sm" style={{ color: "#7a614a" }}>Relabeling Allowed</p>
                          <p style={{ color: darkText }}>
                            {selectedRFQDetails.productDetails.isRelabelingAllowed ? 'Yes' : 'No'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm" style={{ color: "#7a614a" }}>Product Status</p>
                          <p style={{ color: darkText }}>
                            <StatusBadge status={selectedRFQDetails.productDetails.status} />
                          </p>
                        </div>
                        {selectedRFQDetails.productDetails.seller && (
                          <>
                            <div>
                              <p className="text-sm" style={{ color: "#7a614a" }}>Seller</p>
                              <p style={{ color: darkText }}>{selectedRFQDetails.productDetails.seller.vendorCode}</p>
                            </div>
                            <div>
                              <p className="text-sm" style={{ color: "#7a614a" }}>Seller Name</p>
                              <p style={{ color: darkText }}>
                                {selectedRFQDetails.productDetails.seller.firstName} {selectedRFQDetails.productDetails.seller.lastName}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm" style={{ color: "#7a614a" }}>Seller Email</p>
                              <p style={{ color: darkText }}>{selectedRFQDetails.productDetails.seller.email}</p>
                            </div>
                            <div>
                              <p className="text-sm" style={{ color: "#7a614a" }}>Seller Phone</p>
                              <p style={{ color: darkText }}>{selectedRFQDetails.productDetails.seller.phone}</p>
                            </div>
                          </>
                        )}
                      </div>
                      
                      {selectedRFQDetails.productDetails.description && (
                        <div className="mt-4">
                          <p className="text-sm" style={{ color: "#7a614a" }}>Product Description</p>
                          <p style={{ color: darkText }}>{selectedRFQDetails.productDetails.description}</p>
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="flex justify-end">
                    <button 
                      className="px-4 py-2 rounded-lg font-medium"
                      onClick={closeRFQDetailsModal}
                      style={{ backgroundColor: bhagwa, color: "#fff" }}
                    >
                      Close
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-10" style={{ color: darkText }}>
                  No details available
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default CaptainDashboard;