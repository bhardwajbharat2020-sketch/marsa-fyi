import React, { useState, useEffect } from 'react';
import DashboardLayout from './DashboardLayout';
import { Plus, X } from 'lucide-react';
import '../App.css';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [systemConfig, setSystemConfig] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [products, setProducts] = useState([]); // New state for products
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for add user modal
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: ''
  });
  
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
  
  // State for viewing product details
  const [showProductDetailsModal, setShowProductDetailsModal] = useState(false);
  const [viewingProduct, setViewingProduct] = useState(null);
  
  // State for rejection modal
  const [rejectionReason, setRejectionReason] = useState('');
  const [productToReject, setProductToReject] = useState(null);

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
        
        // Fetch users
        const usersResponse = await fetch('/api/admin/users');
        const usersData = await usersResponse.json();
        
        if (usersResponse.ok) {
          setUsers(usersData);
        } else {
          console.error('Error fetching users:', usersData.error);
        }
        
        // Fetch system configuration
        const configResponse = await fetch('/api/admin/config');
        const configData = await configResponse.json();
        
        if (configResponse.ok) {
          setSystemConfig(configData);
        } else {
          console.error('Error fetching system config:', configData.error);
        }
        
        // Fetch audit logs
        const logsResponse = await fetch('/api/admin/logs');
        const logsData = await logsResponse.json();
        
        if (logsResponse.ok) {
          setAuditLogs(logsData);
        } else {
          console.error('Error fetching audit logs:', logsData.error);
        }
        
        // Fetch products pending approval
        try {
          const productsResponse = await fetch('/api/admin/products');
          const productsData = await productsResponse.json();
          
          if (productsResponse.ok) {
            setProducts(productsData);
          } else {
            console.error('Error fetching products:', productsData.error);
          }
        } catch (err) {
          console.error('Error fetching products:', err);
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

  // Handle input changes for new user form
  const handleUserInputChange = (e) => {
    const { name, value } = e.target;
    setNewUser(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle add user form submission
  const handleAddUser = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newUser),
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        // Add the new user to the users list
        setUsers(prev => [...prev, result.user]);
        
        // Reset form and close modal
        setNewUser({
          name: '',
          email: '',
          role: ''
        });
        setShowAddUserModal(false);
        
        alert('User added successfully!');
      } else {
        alert('Failed to add user: ' + (result.error || 'Unknown error'));
      }
    } catch (err) {
      console.error('Error adding user:', err);
      alert('Failed to add user. Please try again.');
    }
  };

  // Status badge component
  const StatusBadge = ({ status }) => {
    const statusStyles = {
      active: { backgroundColor: '#d4edda', color: '#155724' },
      inactive: { backgroundColor: '#f8d7da', color: '#721c24' },
      pending: { backgroundColor: '#fff3cd', color: '#856404' },
      approved: { backgroundColor: '#d4edda', color: '#155724' },
      rejected: { backgroundColor: '#f8d7da', color: '#721c24' },
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

  // Function to fetch products
  const fetchProducts = async () => {
    try {
      const productsResponse = await fetch('/api/admin/products');
      const productsData = await productsResponse.json();
      
      if (productsResponse.ok) {
        setProducts(productsData);
      } else {
        console.error('Error fetching products:', productsData.error);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  };

  // Function to approve a product
  const approveProduct = async (productId) => {
    try {
      const response = await fetch('/api/admin/products/approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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
      const response = await fetch('/api/admin/products/reject', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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

  // Function to open product details modal
  const openProductDetailsModal = (product) => {
    setViewingProduct(product);
    setShowProductDetailsModal(true);
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
      const response = await fetch(`/api/admin/products/${editingProduct.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
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
        
        alert('Product updated successfully!');
      } else {
        alert('Failed to update product: ' + result.error);
      }
    } catch (err) {
      console.error('Error updating product:', err);
      alert('Failed to update product. Please try again.');
    }
  };

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

  return (
    <DashboardLayout title="Administrator Dashboard" role="admin">
      <div className="mb-6 flex flex-wrap gap-2 border-b" style={{ borderColor: "#d9cfc1" }}>
        <button 
          className={`px-4 py-2 rounded-t-lg font-medium ${
            activeTab === 'users' ? 'border-b-2' : ''
          }`}
          onClick={() => setActiveTab('users')}
          style={{ 
            color: activeTab === 'users' ? bhagwa : darkText,
            borderColor: activeTab === 'users' ? bhagwa : 'transparent'
          }}
        >
          User Management
        </button>
        <button 
          className={`px-4 py-2 rounded-t-lg font-medium ${
            activeTab === 'config' ? 'border-b-2' : ''
          }`}
          onClick={() => setActiveTab('config')}
          style={{ 
            color: activeTab === 'config' ? bhagwa : darkText,
            borderColor: activeTab === 'config' ? bhagwa : 'transparent'
          }}
        >
          System Configuration
        </button>
        <button 
          className={`px-4 py-2 rounded-t-lg font-medium ${
            activeTab === 'logs' ? 'border-b-2' : ''
          }`}
          onClick={() => setActiveTab('logs')}
          style={{ 
            color: activeTab === 'logs' ? bhagwa : darkText,
            borderColor: activeTab === 'logs' ? bhagwa : 'transparent'
          }}
        >
          Audit Logs
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
      </div>

      {loading && <div className="text-center py-10" style={{ color: darkText }}>Loading dashboard data...</div>}
      {error && <div className="text-center py-10 text-red-500">Error: {error}</div>}
      
      {activeTab === 'users' && (
        <div>
          <div 
            className="rounded-xl shadow-sm p-6 mb-6"
            style={{ backgroundColor: "#fff" }}
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <h2 className="text-2xl font-bold" style={{ color: darkText }}>User Management</h2>
              <button 
                className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold"
                onClick={() => setShowAddUserModal(true)}
                style={{ backgroundColor: bhagwa, color: "#fff" }}
              >
                <Plus size={16} />
                Add New User
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ backgroundColor: creamCard }}>
                    <th className="text-left p-3" style={{ color: darkText }}>User ID</th>
                    <th className="text-left p-3" style={{ color: darkText }}>Name</th>
                    <th className="text-left p-3" style={{ color: darkText }}>Email</th>
                    <th className="text-left p-3" style={{ color: darkText }}>Role</th>
                    <th className="text-left p-3" style={{ color: darkText }}>Status</th>
                    <th className="text-left p-3" style={{ color: darkText }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.id} className="border-b" style={{ borderColor: "#d9cfc1" }}>
                      <td className="p-3" style={{ color: darkText }}>{user.id}</td>
                      <td className="p-3" style={{ color: darkText }}>{user.name}</td>
                      <td className="p-3" style={{ color: darkText }}>{user.email}</td>
                      <td className="p-3" style={{ color: darkText }}>{user.role}</td>
                      <td className="p-3">
                        <StatusBadge status={user.status} />
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
                            Disable
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {users.length === 0 && !loading && (
                <div className="text-center py-10" style={{ color: darkText }}>
                  No users found.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'config' && (
        <div>
          <div 
            className="rounded-xl shadow-sm p-6 mb-6"
            style={{ backgroundColor: "#fff" }}
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <h2 className="text-2xl font-bold" style={{ color: darkText }}>System Configuration</h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ backgroundColor: creamCard }}>
                    <th className="text-left p-3" style={{ color: darkText }}>Setting</th>
                    <th className="text-left p-3" style={{ color: darkText }}>Value</th>
                    <th className="text-left p-3" style={{ color: darkText }}>Description</th>
                    <th className="text-left p-3" style={{ color: darkText }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {systemConfig.map((config, index) => (
                    <tr key={index} className="border-b" style={{ borderColor: "#d9cfc1" }}>
                      <td className="p-3" style={{ color: darkText }}>{config.setting}</td>
                      <td className="p-3" style={{ color: darkText }}>{config.value}</td>
                      <td className="p-3" style={{ color: darkText }}>{config.description}</td>
                      <td className="p-3">
                        <div className="flex flex-wrap gap-2">
                          <button 
                            className="px-3 py-1 rounded text-sm"
                            style={{ backgroundColor: "#fff", color: darkText, border: "1px solid #d9cfc1" }}
                          >
                            Edit
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {systemConfig.length === 0 && !loading && (
                <div className="text-center py-10" style={{ color: darkText }}>
                  No configuration settings found.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'logs' && (
        <div>
          <div 
            className="rounded-xl shadow-sm p-6 mb-6"
            style={{ backgroundColor: "#fff" }}
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <h2 className="text-2xl font-bold" style={{ color: darkText }}>Audit Logs</h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ backgroundColor: creamCard }}>
                    <th className="text-left p-3" style={{ color: darkText }}>Timestamp</th>
                    <th className="text-left p-3" style={{ color: darkText }}>User</th>
                    <th className="text-left p-3" style={{ color: darkText }}>Action</th>
                    <th className="text-left p-3" style={{ color: darkText }}>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.map((log, index) => (
                    <tr key={index} className="border-b" style={{ borderColor: "#d9cfc1" }}>
                      <td className="p-3" style={{ color: darkText }}>{log.timestamp}</td>
                      <td className="p-3" style={{ color: darkText }}>{log.user}</td>
                      <td className="p-3" style={{ color: darkText }}>{log.action}</td>
                      <td className="p-3" style={{ color: darkText }}>{log.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {auditLogs.length === 0 && !loading && (
                <div className="text-center py-10" style={{ color: darkText }}>
                  No audit logs found.
                </div>
              )}
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
                            onClick={() => openProductDetailsModal(product)}
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

      {/* Add User Modal */}
      {showAddUserModal && (
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
                <h3 className="text-xl font-bold" style={{ color: darkText }}>Add New User</h3>
                <button 
                  className="p-2 rounded-full"
                  onClick={() => setShowAddUserModal(false)}
                  style={{ backgroundColor: creamCard }}
                >
                  <X size={20} style={{ color: darkText }} />
                </button>
              </div>
              <form onSubmit={handleAddUser}>
                <div className="mb-4">
                  <label htmlFor="name" className="block mb-2 font-medium" style={{ color: darkText }}>
                    Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    className="w-full p-3 rounded-lg border"
                    style={{ borderColor: "#d9cfc1", backgroundColor: "#fff", color: darkText }}
                    value={newUser.name}
                    onChange={handleUserInputChange}
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="email" className="block mb-2 font-medium" style={{ color: darkText }}>
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className="w-full p-3 rounded-lg border"
                    style={{ borderColor: "#d9cfc1", backgroundColor: "#fff", color: darkText }}
                    value={newUser.email}
                    onChange={handleUserInputChange}
                    required
                  />
                </div>
                
                <div className="mb-6">
                  <label htmlFor="role" className="block mb-2 font-medium" style={{ color: darkText }}>
                    Role *
                  </label>
                  <select
                    id="role"
                    name="role"
                    className="w-full p-3 rounded-lg border"
                    style={{ borderColor: "#d9cfc1", backgroundColor: "#fff", color: darkText }}
                    value={newUser.role}
                    onChange={handleUserInputChange}
                    required
                  >
                    <option value="">Select a role</option>
                    <option value="admin">Administrator</option>
                    <option value="seller">Seller</option>
                    <option value="buyer">Buyer</option>
                    <option value="captain">Captain</option>
                    <option value="hr">HR</option>
                    <option value="accountant">Accountant</option>
                  </select>
                </div>
                
                <div className="flex justify-end gap-3">
                  <button 
                    type="button" 
                    className="px-4 py-2 rounded-lg font-medium"
                    onClick={() => setShowAddUserModal(false)}
                    style={{ backgroundColor: "#fff", color: darkText, border: "1px solid #d9cfc1" }}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="px-4 py-2 rounded-lg font-medium"
                    style={{ backgroundColor: bhagwa, color: "#fff" }}
                  >
                    Add User
                  </button>
                </div>
              </form>
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
                  <X size={20} style={{ color: darkText }} />
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

      {/* Product Details Modal */}
      {showProductDetailsModal && viewingProduct && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div 
            className="rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
            style={{ backgroundColor: "#fff" }}
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold" style={{ color: darkText }}>Product Details</h3>
                <button 
                  className="p-2 rounded-full"
                  onClick={() => {
                    setShowProductDetailsModal(false);
                    setViewingProduct(null);
                  }}
                  style={{ backgroundColor: creamCard }}
                >
                  <X size={20} style={{ color: darkText }} />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Product Information */}
                <div>
                  <h4 className="text-lg font-bold mb-3" style={{ color: darkText, borderBottom: `1px solid ${creamCard}`, paddingBottom: '8px' }}>
                    Product Information
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium" style={{ color: darkText }}>Product Name/Version</p>
                      <p style={{ color: "#7a614a" }}>{viewingProduct.name || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium" style={{ color: darkText }}>Category</p>
                      <p style={{ color: "#7a614a" }}>{viewingProduct.category || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium" style={{ color: darkText }}>Branded/Unbranded</p>
                      <p style={{ color: "#7a614a" }}>{viewingProduct.branded === 'branded' ? 'Branded' : 'Unbranded'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium" style={{ color: darkText }}>Description</p>
                      <p style={{ color: "#7a614a" }}>{viewingProduct.description || 'N/A'}</p>
                    </div>
                  </div>
                </div>
                
                {/* Pricing & Availability */}
                <div>
                  <h4 className="text-lg font-bold mb-3" style={{ color: darkText, borderBottom: `1px solid ${creamCard}`, paddingBottom: '8px' }}>
                    Pricing & Availability
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <p className="text-sm font-medium" style={{ color: darkText }}>MOQ</p>
                      <p style={{ color: "#7a614a" }}>
                        {viewingProduct.moq || '0'} {viewingProduct.moqUom || 'pcs'}
                      </p>
                    </div>
                    <div className="flex justify-between">
                      <p className="text-sm font-medium" style={{ color: darkText }}>Available Quantity</p>
                      <p style={{ color: "#7a614a" }}>
                        {viewingProduct.quantity || '0'} {viewingProduct.quantityUom || 'pcs'}
                      </p>
                    </div>
                    <div className="flex justify-between">
                      <p className="text-sm font-medium" style={{ color: darkText }}>Offer Price</p>
                      <p style={{ color: "#7a614a" }}>
                        {viewingProduct.currency || 'USD'} {viewingProduct.price || '0'}
                      </p>
                    </div>
                    <div className="flex justify-between">
                      <p className="text-sm font-medium" style={{ color: darkText }}>Price Type</p>
                      <p style={{ color: "#7a614a" }}>{viewingProduct.priceType || 'EXW'}</p>
                    </div>
                  </div>
                </div>
                
                {/* Additional Information */}
                <div>
                  <h4 className="text-lg font-bold mb-3" style={{ color: darkText, borderBottom: `1px solid ${creamCard}`, paddingBottom: '8px' }}>
                    Additional Information
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <p className="text-sm font-medium" style={{ color: darkText }}>Re-labeling Option</p>
                      <p style={{ color: "#7a614a" }}>
                        {viewingProduct.reLabeling === 'yes' ? 'Yes' : 'No'}
                      </p>
                    </div>
                    <div className="flex justify-between">
                      <p className="text-sm font-medium" style={{ color: darkText }}>Offer Validity</p>
                      <p style={{ color: "#7a614a" }}>
                        {viewingProduct.validityDate 
                          ? `${viewingProduct.validityDate} ${viewingProduct.validityTime || ''}`
                          : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium" style={{ color: darkText }}>Status</p>
                      <StatusBadge status={viewingProduct.status || 'submitted'} />
                    </div>
                  </div>
                </div>
                
                {/* Seller Information */}
                <div>
                  <h4 className="text-lg font-bold mb-3" style={{ color: darkText, borderBottom: `1px solid ${creamCard}`, paddingBottom: '8px' }}>
                    Seller Information
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium" style={{ color: darkText }}>Seller Name</p>
                      <p style={{ color: "#7a614a" }}>{viewingProduct.sellerName || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium" style={{ color: darkText }}>Vendor Code</p>
                      <p style={{ color: "#7a614a" }}>{viewingProduct.vendorCode || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium" style={{ color: darkText }}>Product ID</p>
                      <p style={{ color: "#7a614a" }}>{viewingProduct.id || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end mt-6">
                <button 
                  className="px-4 py-2 rounded-lg font-medium"
                  onClick={() => {
                    setShowProductDetailsModal(false);
                    setViewingProduct(null);
                  }}
                  style={{ backgroundColor: bhagwa, color: "#fff" }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
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
                Please select a reason for rejecting the product "{productToReject.name}":
              </p>
              <select
                className="w-full p-3 rounded-lg border mb-4"
                style={{ borderColor: "#d9cfc1", backgroundColor: "#fff", color: darkText }}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
              >
                <option value="">Select a rejection reason</option>
                <option value="Wrong product details">Wrong product details</option>
                <option value="Wrong product name">Wrong product name</option>
                <option value="Contact details in description">Contact details in description</option>
                <option value="Contact details in image">Contact details in image</option>
                <option value="Incomplete product information">Incomplete product information</option>
                <option value="Invalid category selection">Invalid category selection</option>
                <option value="Missing product images">Missing product images</option>
                <option value="Inappropriate content">Inappropriate content</option>
                <option value="Duplicate product listing">Duplicate product listing</option>
                <option value="Pricing policy violation">Pricing policy violation</option>
                <option value="Other">Other</option>
              </select>
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
                  disabled={!rejectionReason}
                >
                  Reject Product
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default AdminDashboard;