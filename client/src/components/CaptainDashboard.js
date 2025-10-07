import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import DashboardLayout from './DashboardLayout';
import '../App.css';

const CaptainDashboard = () => {
  const { authToken } = useAuth();
  const [activeTab, setActiveTab] = useState('roles');
  const [roles, setRoles] = useState([]);
  const [rfqs, setRfqs] = useState([]);
  const [dpqs, setDpqs] = useState([]);
  const [dpos, setDpos] = useState([]);
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  
  // State for role management
  const [showAddRoleModal, setShowAddRoleModal] = useState(false);
  const [showEditRoleModal, setShowEditRoleModal] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [roleFormData, setRoleFormData] = useState({
    name: '',
    code: '',
    description: ''
  });
  
  // State for user role assignment
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [userDetails, setUserDetails] = useState(null);
  const [showAssignRoleModal, setShowAssignRoleModal] = useState(false);
  const [usersByRole, setUsersByRole] = useState([]); // New state for users by role

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

  // Function to fetch all dashboard data
  const fetchDashboardData = async () => {
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
    } catch (err) {
      console.error('Unexpected error in dashboard data fetching:', err);
      setError('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Fetch real data from Supabase
  useEffect(() => {
    if (authToken) {
      fetchDashboardData();
    }
  }, [authToken]);

  // Fetch users by role when editing role changes
  useEffect(() => {
    console.log('useEffect triggered. showEditRoleModal:', showEditRoleModal, 'editingRole:', editingRole);
    if (showEditRoleModal && editingRole) {
      console.log('Fetching users for role ID in useEffect:', editingRole.id);
      // Add a small delay to ensure the modal is fully rendered
      const timer = setTimeout(() => {
        fetchUsersByRole(editingRole.id);
      }, 100);
      
      // Clean up the timer
      return () => clearTimeout(timer);
    }
  }, [showEditRoleModal, editingRole, authToken]);

  // Function to fetch user details
  const fetchUserDetails = async (userId) => {
    try {
      const response = await fetch(`/api/captain/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      const result = await response.json();
      
      if (response.ok) {
        setUserDetails(result.user);
      } else {
        console.error('Error fetching user details:', result.error);
        setUserDetails(null);
      }
    } catch (err) {
      console.error('Error fetching user details:', err);
      setUserDetails(null);
    }
  };

  // Function to fetch all users
  const fetchUsers = async () => {
    try {
      console.log('Fetching users with authToken:', authToken);
      
      // Check if authToken exists
      if (!authToken) {
        console.error('No auth token available');
        alert('Authentication required. Please log in again.');
        return;
      }
      
      const response = await fetch('/api/captain/users', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      console.log('Users API response status:', response.status);
      
      // Check if response is OK before parsing JSON
      if (!response.ok) {
        console.error('Response not OK. Status:', response.status);
        console.error('Response text:', await response.text());
        alert('Failed to fetch users. Server returned status: ' + response.status);
        return;
      }
      
      const result = await response.json();
      console.log('Users API response data:', result);
      
      // Check if result has success property (new format) or is directly the users array (old format)
      if (result.success !== undefined) {
        // New format with success property
        if (result.success) {
          console.log('Setting users state with:', result.users || []);
          setUsers(result.users || []);
        } else {
          console.error('Error fetching users:', result.error);
          alert('Failed to fetch users: ' + result.error);
        }
      } else {
        // Old format - result is directly the users array
        console.log('Setting users state with:', result || []);
        setUsers(result || []);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      // Show error to user
      alert('Failed to fetch users. Please try again. Error: ' + err.message);
    }
  };

  // Function to fetch users by role
  const fetchUsersByRole = async (roleId) => {
    try {
      console.log('Fetching users with role ID:', roleId);
      
      // Check if authToken exists
      if (!authToken) {
        console.error('No auth token available');
        return [];
      }
      
      const response = await fetch(`/api/captain/roles/${roleId}/users`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      console.log('Users by role API response status:', response.status);
      
      // Check if response is OK before parsing JSON
      if (!response.ok) {
        console.error('Response not OK. Status:', response.status);
        console.error('Response text:', await response.text());
        return [];
      }
      
      const result = await response.json();
      console.log('Users by role API response data:', result);
      
      // Check if result has success property
      if (result.success !== undefined) {
        // New format with success property
        if (result.success) {
          console.log('Setting users by role state with:', result.users || []);
          setUsersByRole(result.users || []);
          return result.users || [];
        } else {
          console.error('Error fetching users by role:', result.error);
          return [];
        }
      } else {
        // Old format - result is directly the users array
        console.log('Setting users by role state with:', result || []);
        setUsersByRole(result || []);
        return result || [];
      }
    } catch (err) {
      console.error('Error fetching users by role:', err);
      return [];
    }
  };

  // Function to assign role to user
  const assignRoleToUser = async (userId, roleId) => {
    try {
      const response = await fetch('/api/captain/users/assign-role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ userId, roleId }),
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        alert('Role assigned successfully!');
        // Refresh user details
        fetchUserDetails(userId);
        return true;
      } else {
        alert('Failed to assign role: ' + result.error);
        return false;
      }
    } catch (err) {
      console.error('Error assigning role:', err);
      alert('Failed to assign role. Please try again.');
      return false;
    }
  };

  // Function to create a new role
  const createRole = async (roleData) => {
    try {
      const response = await fetch('/api/captain/roles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(roleData),
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        // Add the new role to the roles state
        setRoles(prevRoles => [...prevRoles, result.role]);
        alert('Role created successfully!');
        return true;
      } else {
        alert('Failed to create role: ' + result.error);
        return false;
      }
    } catch (err) {
      console.error('Error creating role:', err);
      alert('Failed to create role. Please try again.');
      return false;
    }
  };

  // Function to update a role
  const updateRole = async (roleId, roleData) => {
    try {
      const response = await fetch(`/api/captain/roles/${roleId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(roleData),
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        // Update the role in the roles state
        setRoles(prevRoles => 
          prevRoles.map(role => 
            role.id === roleId ? result.role : role
          )
        );
        alert('Role updated successfully!');
        return true;
      } else {
        alert('Failed to update role: ' + result.error);
        return false;
      }
    } catch (err) {
      console.error('Error updating role:', err);
      alert('Failed to update role. Please try again.');
      return false;
    }
  };

  // Function to delete a role
  const deleteRole = async (roleId, roleName) => {
    if (!window.confirm(`Are you sure you want to delete the role "${roleName}"?`)) {
      return;
    }
    
    try {
      const response = await fetch(`/api/captain/roles/${roleId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        // Remove the role from the roles state
        setRoles(prevRoles => prevRoles.filter(role => role.id !== roleId));
        alert('Role deleted successfully!');
      } else {
        alert('Failed to delete role: ' + result.error);
      }
    } catch (err) {
      console.error('Error deleting role:', err);
      alert('Failed to delete role. Please try again.');
    }
  };

  // Function to change user role to buyer
  const changeUserToBuyer = async (userId) => {
    try {
      console.log('Changing user role to buyer. User ID:', userId);
      
      // First, get the buyer role ID
      const buyerRoleResponse = await fetch('/api/captain/roles', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      if (!buyerRoleResponse.ok) {
        const errorText = await buyerRoleResponse.text();
        console.error('Failed to fetch roles. Status:', buyerRoleResponse.status, 'Error:', errorText);
        throw new Error('Failed to fetch roles: ' + errorText);
      }
      
      const rolesData = await buyerRoleResponse.json();
      console.log('Fetched roles data:', rolesData);
      
      const buyerRole = rolesData.find(role => role.code === 'BUY');
      console.log('Buyer role found:', buyerRole);
      
      if (!buyerRole) {
        throw new Error('Buyer role not found');
      }
      
      // Assign buyer role to user
      const response = await fetch('/api/captain/users/assign-role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ 
          userId: userId, 
          roleId: buyerRole.id 
        }),
      });
      
      const result = await response.json();
      console.log('Assign role response:', result);
      
      if (response.ok && result.success) {
        alert('User role changed to buyer successfully!');
        // Refresh users by role list
        if (editingRole) {
          fetchUsersByRole(editingRole.id);
        }
        return true;
      } else {
        const errorMessage = result.error || 'Unknown error';
        console.error('Failed to change user role:', errorMessage);
        alert('Failed to change user role: ' + errorMessage);
        return false;
      }
    } catch (err) {
      console.error('Error changing user to buyer:', err);
      alert('Failed to change user role. Please try again. Error: ' + err.message);
      return false;
    }
  };

  // Handle input changes for role form
  const handleRoleFormChange = (e) => {
    const { name, value } = e.target;
    setRoleFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle role form submission for create
  const handleCreateRole = async (e) => {
    e.preventDefault();
    
    const success = await createRole(roleFormData);
    if (success) {
      // Reset form and close modal
      setRoleFormData({
        name: '',
        code: '',
        description: ''
      });
      setShowAddRoleModal(false);
    }
  };

  // Handle role form submission for update
  const handleUpdateRole = async (e) => {
    e.preventDefault();
    
    const success = await updateRole(editingRole.id, roleFormData);
    if (success) {
      // Reset form and close modal
      setRoleFormData({
        name: '',
        code: '',
        description: ''
      });
      setShowEditRoleModal(false);
    }
  };

  // Handle role form submission for delete
  const handleDeleteRole = async (e) => {
    e.preventDefault();
    
    const success = await deleteRole(editingRole.id, editingRole.name);
    if (success) {
      // Reset form and close modal
      setRoleFormData({
        name: '',
        code: '',
        description: ''
      });
      setShowEditRoleModal(false);
    }
  };

  // Handle user selection change
  const handleUserSelectionChange = (e) => {
    setSelectedUser(e.target.value);
    fetchUserDetails(e.target.value);
  };

  // Handle role selection change
  const handleRoleSelectionChange = (e) => {
    setSelectedRole(e.target.value);
  };

  // Handle user role assignment
  const handleAssignRole = async () => {
    if (!selectedUser || !selectedRole) {
      alert('Please select a user and a role.');
      return;
    }
    
    const success = await assignRoleToUser(selectedUser, selectedRole);
    if (success) {
      // Reset form and close modal
      setSelectedUser('');
      setSelectedRole('');
      setShowAssignRoleModal(false);
    }
  };

  // Handle RFQ response
  const handleRFQResponse = async () => {
    if (!selectedRFQ || !rfqResponse.action) {
      alert('Please select an RFQ and provide a response.');
      return;
    }
    
    try {
      const response = await fetch(`/api/captain/rfqs/${selectedRFQ.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(rfqResponse),
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        // Update the RFQ in the rfqs state
        setRfqs(prevRfqs => 
          prevRfqs.map(rfq => 
            rfq.id === selectedRFQ.id ? result.rfq : rfq
          )
        );
        alert('RFQ response submitted successfully!');
      } else {
        alert('Failed to submit RFQ response: ' + result.error);
      }
    } catch (err) {
      console.error('Error submitting RFQ response:', err);
      alert('Failed to submit RFQ response. Please try again.');
    }
  };

  // Handle RFQ details modal open
  const handleOpenRFQDetails = (rfq) => {
    setSelectedRFQDetails(rfq);
    setShowRFQDetailsModal(true);
  };

  // Handle RFQ details modal close
  const handleCloseRFQDetails = () => {
    setSelectedRFQDetails(null);
    setShowRFQDetailsModal(false);
  };

  // Function to open edit role modal
  const openEditRoleModal = (role) => {
    console.log('Opening edit role modal for role:', role);
    setEditingRole(role);
    setRoleFormData({
      name: role.name,
      code: role.code,
      description: role.description || ''
    });
    // Clear previous users by role data
    setUsersByRole([]);
    setShowEditRoleModal(true);
    // Fetch users with this role after a small delay to ensure state is updated
    setTimeout(() => {
      console.log('Fetching users for role ID:', role.id);
      fetchUsersByRole(role.id);
    }, 100);
  };

  // Function to open add role modal
  const openAddRoleModal = () => {
    setRoleFormData({
      name: '',
      code: '',
      description: ''
    });
    setShowAddRoleModal(true);
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
                  <div className="flex gap-2">
                    <button 
                      className="px-4 py-2 rounded-lg font-semibold"
                      style={{ backgroundColor: "#3498db", color: "#fff" }}
                      onClick={() => {
                        setShowAssignRoleModal(true);
                        fetchUsers();
                      }}
                    >
                      Assign Role to User
                    </button>
                    <button 
                      className="px-4 py-2 rounded-lg font-semibold"
                      style={{ backgroundColor: bhagwa, color: "#fff" }}
                      onClick={openAddRoleModal}
                    >
                      Add New Role
                    </button>
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr style={{ backgroundColor: creamCard }}>
                        <th className="text-left p-3" style={{ color: darkText }}>Role Name</th>
                        <th className="text-left p-3" style={{ color: darkText }}>Code</th>
                        <th className="text-left p-3" style={{ color: darkText }}>Description</th>
                        <th className="text-left p-3" style={{ color: darkText }}>Users Count</th>
                        <th className="text-left p-3" style={{ color: darkText }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {roles.length > 0 ? roles.map(role => (
                        <tr key={role.id} className="border-b" style={{ borderColor: "#d9cfc1" }}>
                          <td className="p-3" style={{ color: darkText }}>{role.name}</td>
                          <td className="p-3" style={{ color: darkText }}>{role.code}</td>
                          <td className="p-3" style={{ color: darkText }}>{role.description}</td>
                          <td className="p-3" style={{ color: darkText }}>{role.userCount}</td>
                          <td className="p-3">
                            <div className="flex flex-wrap gap-2">
                              <button 
                                className="px-3 py-1 rounded text-sm"
                                style={{ backgroundColor: "#fff", color: darkText, border: "1px solid #d9cfc1" }}
                                onClick={() => openEditRoleModal(role)}
                              >
                                Edit
                              </button>
                              <button 
                                className="px-3 py-1 rounded text-sm"
                                style={{ backgroundColor: "#e74c3c", color: "#fff" }}
                                onClick={() => deleteRole(role.id, role.name)}
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan="5" className="text-center py-10" style={{ color: darkText }}>
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

          {/* Add Role Modal */}
          {showAddRoleModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold" style={{ color: darkText }}>Add New Role</h3>
                    <button 
                      onClick={() => {
                        setShowAddRoleModal(false);
                        setRoleFormData({ name: '', code: '', description: '' });
                      }}
                      className="text-gray-500 hover:text-gray-700 text-2xl"
                    >
                      &times;
                    </button>
                  </div>
                  
                  <form onSubmit={handleCreateRole}>
                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-1" style={{ color: darkText }}>
                        Role Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={roleFormData.name}
                        onChange={handleRoleFormChange}
                        className="w-full px-3 py-2 border rounded-lg"
                        style={{ borderColor: "#d9cfc1" }}
                        placeholder="Enter role name"
                        required
                      />
                    </div>
                    
                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-1" style={{ color: darkText }}>
                        Role Code *
                      </label>
                      <input
                        type="text"
                        name="code"
                        value={roleFormData.code}
                        onChange={handleRoleFormChange}
                        className="w-full px-3 py-2 border rounded-lg"
                        style={{ borderColor: "#d9cfc1" }}
                        placeholder="Enter role code (e.g., CAPT, SELL)"
                        required
                      />
                    </div>
                    
                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-1" style={{ color: darkText }}>
                        Description
                      </label>
                      <textarea
                        name="description"
                        value={roleFormData.description}
                        onChange={handleRoleFormChange}
                        className="w-full px-3 py-2 border rounded-lg"
                        style={{ borderColor: "#d9cfc1" }}
                        placeholder="Enter role description"
                        rows="3"
                      />
                    </div>
                    
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setShowAddRoleModal(false);
                          setRoleFormData({ name: '', code: '', description: '' });
                        }}
                        className="px-4 py-2 rounded-lg font-medium"
                        style={{ backgroundColor: "#fff", color: darkText, border: "1px solid #d9cfc1" }}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 rounded-lg font-medium"
                        style={{ backgroundColor: bhagwa, color: "#fff" }}
                      >
                        Create Role
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* Edit Role Modal */}
          {showEditRoleModal && editingRole && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold" style={{ color: darkText }}>Edit Role</h3>
                    <button 
                      onClick={() => {
                        setShowEditRoleModal(false);
                        setEditingRole(null);
                        setRoleFormData({ name: '', code: '', description: '' });
                        setUsersByRole([]); // Clear users by role
                      }}
                      className="text-gray-500 hover:text-gray-700 text-2xl"
                    >
                      &times;
                    </button>
                  </div>
                  
                  <form onSubmit={handleUpdateRole}>
                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-1" style={{ color: darkText }}>
                        Role Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={roleFormData.name}
                        onChange={handleRoleFormChange}
                        className="w-full px-3 py-2 border rounded-lg"
                        style={{ borderColor: "#d9cfc1" }}
                        placeholder="Enter role name"
                        required
                      />
                    </div>
                    
                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-1" style={{ color: darkText }}>
                        Role Code *
                      </label>
                      <input
                        type="text"
                        name="code"
                        value={roleFormData.code}
                        onChange={handleRoleFormChange}
                        className="w-full px-3 py-2 border rounded-lg"
                        style={{ borderColor: "#d9cfc1" }}
                        placeholder="Enter role code"
                        required
                      />
                    </div>
                    
                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-1" style={{ color: darkText }}>
                        Description
                      </label>
                      <textarea
                        name="description"
                        value={roleFormData.description}
                        onChange={handleRoleFormChange}
                        className="w-full px-3 py-2 border rounded-lg"
                        style={{ borderColor: "#d9cfc1" }}
                        placeholder="Enter role description"
                        rows="3"
                      />
                    </div>
                    
                    {/* Users with this role */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-1" style={{ color: darkText }}>
                        Users with this role (Count: {usersByRole.length})
                      </label>
                      {usersByRole.length > 0 ? (
                        <div className="border rounded-lg" style={{ borderColor: "#d9cfc1" }}>
                          {usersByRole.map((user, index) => (
                            <div 
                              key={user.id} 
                              className={`p-3 flex justify-between items-center ${index < usersByRole.length - 1 ? 'border-b' : ''}`}
                              style={{ borderColor: "#d9cfc1" }}
                            >
                              <div>
                                <div className="font-medium" style={{ color: darkText }}>
                                  {user.first_name} {user.last_name}
                                </div>
                                <div className="text-sm" style={{ color: "#7a614a" }}>
                                  {user.email} ({user.vendor_code})
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={async () => {
                                  const success = await changeUserToBuyer(user.id);
                                  if (success) {
                                    // Remove user from the list
                                    setUsersByRole(prevUsers => 
                                      prevUsers.filter(u => u.id !== user.id)
                                    );
                                  }
                                }}
                                className="px-3 py-1 rounded text-sm"
                                style={{ backgroundColor: "#e74c3c", color: "#fff" }}
                              >
                                Remove role and make buyer
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-3 text-center" style={{ color: "#7a614a" }}>
                          No users have this role
                        </div>
                      )}
                    </div>
                    
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setShowEditRoleModal(false);
                          setEditingRole(null);
                          setRoleFormData({ name: '', code: '', description: '' });
                          setUsersByRole([]); // Clear users by role
                        }}
                        className="px-4 py-2 rounded-lg font-medium"
                        style={{ backgroundColor: "#fff", color: darkText, border: "1px solid #d9cfc1" }}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 rounded-lg font-medium"
                        style={{ backgroundColor: bhagwa, color: "#fff" }}
                      >
                        Update Role
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* Assign Role to User Modal */}
          {showAssignRoleModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold" style={{ color: darkText }}>Assign Role to User</h3>
                    <button 
                      onClick={() => {
                        setShowAssignRoleModal(false);
                        setSelectedUser('');
                        setSelectedRole('');
                        setUserDetails(null);
                      }}
                      className="text-gray-500 hover:text-gray-700 text-2xl"
                    >
                      &times;
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* User Selection */}
                    <div>
                      <div className="mb-4">
                        <label className="block text-sm font-medium mb-1" style={{ color: darkText }}>
                          Select User *
                        </label>
                        <select
                          value={selectedUser}
                          onChange={async (e) => {
                            const userId = e.target.value;
                            console.log('Selected user ID:', userId);
                            setSelectedUser(userId);
                            if (userId) {
                              await fetchUserDetails(userId);
                            } else {
                              setUserDetails(null);
                            }
                          }}
                          className="w-full px-3 py-2 border rounded-lg"
                          style={{ borderColor: "#d9cfc1" }}
                        >
                          <option value="">Choose a user</option>
                          {users.length > 0 ? (
                            users.map(user => (
                              <option key={user.id} value={user.id}>
                                {user.first_name} {user.last_name} ({user.vendor_code})
                              </option>
                            ))
                          ) : (
                            <option value="" disabled>
                              No users available
                            </option>
                          )}
                        </select>
                        {console.log('Rendering users dropdown, users count:', users.length)}
                      </div>
                      
                      {/* User Details */}
                      {userDetails && (
                        <div className="bg-gray-50 rounded-lg p-4 mb-4">
                          <h4 className="font-medium mb-2" style={{ color: darkText }}>User Details</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm" style={{ color: "#7a614a" }}>Name:</span>
                              <span style={{ color: darkText }}>
                                {userDetails.first_name} {userDetails.last_name}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm" style={{ color: "#7a614a" }}>Vendor Code:</span>
                              <span style={{ color: darkText }}>{userDetails.vendor_code}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm" style={{ color: "#7a614a" }}>Email:</span>
                              <span style={{ color: darkText }}>{userDetails.email}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm" style={{ color: "#7a614a" }}>Phone:</span>
                              <span style={{ color: darkText }}>{userDetails.phone}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm" style={{ color: "#7a614a" }}>Current Role:</span>
                              <span style={{ color: darkText }}>
                                {userDetails.current_role || 'No role assigned'}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Role Selection */}
                    <div>
                      <div className="mb-4">
                        <label className="block text-sm font-medium mb-1" style={{ color: darkText }}>
                          Select Role *
                        </label>
                        <select
                          value={selectedRole}
                          onChange={(e) => setSelectedRole(e.target.value)}
                          className="w-full px-3 py-2 border rounded-lg"
                          style={{ borderColor: "#d9cfc1" }}
                        >
                          <option value="">Choose a role</option>
                          {roles.map(role => (
                            <option key={role.id} value={role.id}>
                              {role.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      {/* Role Details */}
                      {selectedRole && (
                        <div className="bg-gray-50 rounded-lg p-4 mb-4">
                          <h4 className="font-medium mb-2" style={{ color: darkText }}>Role Details</h4>
                          {(() => {
                            const role = roles.find(r => r.id === selectedRole);
                            return role ? (
                              <div className="space-y-2">
                                <div className="flex justify-between">
                                  <span className="text-sm" style={{ color: "#7a614a" }}>Name:</span>
                                  <span style={{ color: darkText }}>{role.name}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sm" style={{ color: "#7a614a" }}>Code:</span>
                                  <span style={{ color: darkText }}>{role.code}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sm" style={{ color: "#7a614a" }}>Description:</span>
                                  <span style={{ color: darkText }}>{role.description || 'No description'}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sm" style={{ color: "#7a614a" }}>Users Assigned:</span>
                                  <span style={{ color: darkText }}>{role.userCount}</span>
                                </div>
                              </div>
                            ) : null;
                          })()}
                        </div>
                      )}
                      
                      {/* Assign Button */}
                      <div className="mt-6">
                        <button
                          onClick={async () => {
                            if (selectedUser && selectedRole) {
                              const success = await assignRoleToUser(selectedUser, selectedRole);
                              if (success) {
                                setShowAssignRoleModal(false);
                                setSelectedUser('');
                                setSelectedRole('');
                                setUserDetails(null);
                                // Refresh roles data
                                fetchDashboardData();
                              }
                            } else {
                              alert('Please select both a user and a role');
                            }
                          }}
                          disabled={!selectedUser || !selectedRole}
                          className="w-full px-4 py-2 rounded-lg font-medium disabled:opacity-50"
                          style={{ 
                            backgroundColor: selectedUser && selectedRole ? bhagwa : '#ccc', 
                            color: selectedUser && selectedRole ? "#fff" : "#666" 
                          }}
                        >
                          Assign Role to User
                        </button>
                      </div>
                    </div>
                  </div>
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
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4" 
                 style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
              <div className="rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto" 
                   style={{ backgroundColor: "#fff" }}>
                <div className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold" style={{ color: darkText }}>
                      RFQ Details
                    </h3>
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
        </>
      )}
    </DashboardLayout>
  );
};

export default CaptainDashboard;