import React, { useState, useEffect } from 'react';
import DashboardLayout from './DashboardLayout';
import ChangePasswordModal from './ChangePasswordModal';
import { useAuth } from '../contexts/AuthContext';
import { Plus, X, Edit, Trash2, Eye, Bell } from 'lucide-react';
import '../App.css';


const SellerDashboard = () => {
  const { authToken } = useAuth();
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [rfqs, setRfqs] = useState([]);
  const [notifications, setNotifications] = useState([]); // New state for notifications
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0); // For notification badge
  
  // State for add product modal
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [newProduct, setNewProduct] = useState({
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
    relabelingPrice: '', // New field for relabeling price
    validityDate: '',
    validityTime: '',
    surveyTermsAccepted: false,
    sellerAgreementAccepted: false,
    relabelingTermsAccepted: false
  });

  // State for edit product modal
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
    relabelingPrice: '', // New field for relabeling price
    validityDate: '',
    validityTime: '',
    surveyTermsAccepted: false,
    sellerAgreementAccepted: false,
    relabelingTermsAccepted: false
  });

  // State for product sections
  const [approvedProducts, setApprovedProducts] = useState([]);
  const [submittedProducts, setSubmittedProducts] = useState([]);
  const [ineffectiveProducts, setIneffectiveProducts] = useState([]);



  // Define categories list (from ShopPage)
  const categories = [
    'Land, house flat plot category', // Added missing category
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
        
        // Test server connectivity first
        console.log('Testing server connectivity...');
        try {
          const testResponse = await fetch('/api/health');
          console.log('Server connectivity test:', testResponse.ok ? 'OK' : 'FAILED', testResponse.status);
        } catch (testErr) {
          console.error('Server connectivity test failed:', testErr);
        }
        
        // Fetch products
        try {
          const productsResponse = await fetch('/api/seller/products', {
            headers: {
              'Authorization': `Bearer ${authToken}`
            }
          });
          const productsData = await productsResponse.json();
          
          if (productsResponse.ok) {
            // Categorize products based on status
            const approved = productsData.filter(p => p.status === 'approved');
            const submitted = productsData.filter(p => p.status === 'submitted');
            const ineffective = productsData.filter(p => p.status === 'rejected');
            
            setApprovedProducts(approved);
            setSubmittedProducts(submitted);
            setIneffectiveProducts(ineffective);
          } else {
            console.error('Error fetching products:', productsData.error);
          }
        } catch (productsErr) {
          console.error('Error fetching products:', productsErr);
        }
        
        // Fetch orders
        try {
          const ordersResponse = await fetch('/api/seller/orders', {
            headers: {
              'Authorization': `Bearer ${authToken}`
            }
          });
          const ordersData = await ordersResponse.json();
          
          if (ordersResponse.ok) {
            setOrders(ordersData);
          } else {
            console.error('Error fetching orders:', ordersData.error);
          }
        } catch (ordersErr) {
          console.error('Error fetching orders:', ordersErr);
        }
        
        // Fetch RFQs
        try {
          const rfqsResponse = await fetch('/api/seller/rfqs', {
            headers: {
              'Authorization': `Bearer ${authToken}`
            }
          });
          const rfqsData = await rfqsResponse.json();
          
          if (rfqsResponse.ok) {
            setRfqs(rfqsData);
          } else {
            console.error('Error fetching RFQs:', rfqsData.error);
          }
        } catch (rfqsErr) {
          console.error('Error fetching RFQs:', rfqsErr);
        }
        
        // Fetch notifications (always fetch to get unread count for badge)
        try {
          const notificationsResponse = await fetch('/api/seller/notifications', {
            headers: {
              'Authorization': `Bearer ${authToken}`
            }
          });
          const notificationsData = await notificationsResponse.json();
          
          if (notificationsResponse.ok) {
            setNotifications(notificationsData);
            // Count unread notifications
            const unreadCount = notificationsData.filter(n => !n.is_read).length;
            setUnreadNotificationsCount(unreadCount);
          } else {
            console.error('Error fetching notifications:', notificationsData.error);
          }
        } catch (notificationsErr) {
          console.error('Error fetching notifications:', notificationsErr);
        }
      } catch (err) {
        // Log the error but don't show it to the user since individual requests are handled above
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Fetch notifications when notifications tab is activated
  useEffect(() => {
    const fetchNotifications = async () => {
      if (activeTab === 'notifications' && authToken) {
        // Notifications are already fetched in the main useEffect, 
        // but we can refresh them when the tab is activated if needed
        try {
          const notificationsResponse = await fetch('/api/seller/notifications', {
            headers: {
              'Authorization': `Bearer ${authToken}`
            }
          });
          const notificationsData = await notificationsResponse.json();
          
          if (notificationsResponse.ok) {
            setNotifications(notificationsData);
            // Update unread count
            const unreadCount = notificationsData.filter(n => !n.is_read).length;
            setUnreadNotificationsCount(unreadCount);
          } else {
            console.error('Error fetching notifications:', notificationsData.error);
          }
        } catch (err) {
          console.error('Error fetching notifications:', err);
        }
      }
    };

    fetchNotifications();
  }, [activeTab, authToken]);

  // Mark all unread notifications as read
  const markAllNotificationsAsRead = async () => {
    try {
      // Use the batch endpoint to mark all notifications as read
      const response = await fetch('/api/seller/notifications/read-all', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        // Update the UI
        const updatedNotifications = notifications.map(notification => ({
          ...notification,
          is_read: true
        }));
        setNotifications(updatedNotifications);
        setUnreadNotificationsCount(0);
        
        console.log('All notifications marked as read');
      } else {
        console.error('Error marking all notifications as read:', result.error);
        alert('Failed to mark notifications as read. Please try again.');
      }
    } catch (err) {
      console.error('Error marking notifications as read:', err);
      alert('Failed to mark notifications as read. Please try again.');
    }
  };

  // Mark a single notification as read
  const markNotificationAsRead = async (notificationId) => {
    try {
      const response = await fetch(`/api/seller/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        // Update the notification in the state
        const updatedNotifications = notifications.map(notification => 
          notification.id === notificationId 
            ? { ...notification, is_read: true } 
            : notification
        );
        setNotifications(updatedNotifications);
        
        // Update unread count
        const unreadCount = updatedNotifications.filter(n => !n.is_read).length;
        setUnreadNotificationsCount(unreadCount);
      } else {
        console.error('Error marking notification as read:', result.error);
      }
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  // Handle input changes for new product form
  const handleProductInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewProduct(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
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
      validityTime: product.validityTime || '',
      surveyTermsAccepted: false, // Reset terms for edit
      sellerAgreementAccepted: false,
      relabelingTermsAccepted: false,

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

  // Handle add product form submission
  const handleAddProduct = async (e) => {
    e.preventDefault();
    
    try {
      // Validate required fields
      const requiredFields = ['name', 'category', 'price', 'description'];
      for (const field of requiredFields) {
        if (!newProduct[field] || newProduct[field].toString().trim() === '') {
          alert(`Field '${field}' cannot be empty`);
          return;
        }
      }
      
      // Validate price specifically
      const priceValue = parseFloat(newProduct.price);
      if (isNaN(priceValue) || priceValue <= 0) {
        alert(`Price must be a valid positive number (received: ${newProduct.price})`);
        return;
      }
      
      // Validate relabeling price if relabeling is enabled
      let relabelingPriceValue = null;
      if (newProduct.reLabeling === 'yes') {
        relabelingPriceValue = parseFloat(newProduct.relabelingPrice);
        if (isNaN(relabelingPriceValue) || relabelingPriceValue <= 0) {
          alert(`Re-labeling price must be a valid positive number (received: ${newProduct.relabelingPrice})`);
          return;
        }
      }
      
      // Prepare form data with correct field names
      const formData = new FormData();
      formData.append('name', newProduct.name.trim());
      formData.append('category', newProduct.category.trim());
      formData.append('branded', newProduct.branded);
      formData.append('description', newProduct.description.trim());
      formData.append('moq', newProduct.moq || '');
      formData.append('moqUom', newProduct.moqUom || '');
      formData.append('quantity', newProduct.quantity || '');
      formData.append('quantityUom', newProduct.quantityUom || '');
      formData.append('price', priceValue);
      formData.append('currency', newProduct.currency || 'USD');
      formData.append('priceType', newProduct.priceType || 'EXW');
      formData.append('reLabeling', newProduct.reLabeling || 'no');
      if (relabelingPriceValue !== null) {
        formData.append('relabelingPrice', relabelingPriceValue);
      }
      formData.append('validityDate', newProduct.validityDate || '');
      formData.append('validityTime', newProduct.validityTime || '');
      
      // Debug logging
      console.log('=== FORM DATA ENTRIES ===');
      const formDataEntries = {};
      for (let [key, value] of formData.entries()) {
        formDataEntries[key] = value;
        console.log(key, ':', value, '(' + typeof value + ')');
      }
      console.log('=== END FORM DATA ===');
      
      // Show loading message
      console.log('Sending request to server...');
      
      // Add timeout to fetch request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
      
      const response = await fetch('/api/seller/products', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`
        },
        body: formData,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      console.log('Received response from server:', response);
      
      // Check if response is OK
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server error response:', errorText);
        throw new Error(`Server error: ${response.status} ${response.statusText} - ${errorText}`);
      }
      
      const result = await response.json();
      console.log('Parsed response:', result);
      
      if (response.ok && result.success) {
        // Add the new product to the submitted products list
        setSubmittedProducts(prev => [...prev, result.product]);
        
        // Reset form and close modal
        setNewProduct({
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
          relabelingPrice: '',
          validityDate: '',
          validityTime: '',
          surveyTermsAccepted: false,
          sellerAgreementAccepted: false,
          relabelingTermsAccepted: false
        });
        setShowAddProductModal(false);
        
        alert('Product added successfully!');
      } else {
        throw new Error(result.error || 'Failed to add product');
      }
    } catch (error) {
      console.error('Error adding product:', error);
      alert(`Error adding product: ${error.message}`);
    }
  };

  // Handle edit product form submission
  const handleEditProduct = async (e) => {
    e.preventDefault();
    
    if (!editingProduct) return;
    
    try {
      // Validate required fields
      const requiredFields = ['name', 'category', 'price', 'description'];
      for (const field of requiredFields) {
        if (!editProductData[field] || editProductData[field].toString().trim() === '') {
          alert(`Field '${field}' cannot be empty`);
          return;
        }
      }
      
      // Validate price specifically
      const priceValue = parseFloat(editProductData.price);
      if (isNaN(priceValue) || priceValue <= 0) {
        alert(`Price must be a valid positive number (received: ${editProductData.price})`);
        return;
      }
      
      // Validate relabeling price if relabeling is enabled
      let relabelingPriceValue = null;
      if (editProductData.reLabeling === 'yes') {
        relabelingPriceValue = parseFloat(editProductData.relabelingPrice);
        if (isNaN(relabelingPriceValue) || relabelingPriceValue <= 0) {
          alert(`Re-labeling price must be a valid positive number (received: ${editProductData.relabelingPrice})`);
          return;
        }
      }
      
      // Prepare form data
      const formData = new FormData();
      formData.append('name', editProductData.name.trim());
      formData.append('category', editProductData.category.trim());
      formData.append('branded', editProductData.branded);
      formData.append('description', editProductData.description.trim());
      formData.append('moq', editProductData.moq || '');
      formData.append('moqUom', editProductData.moqUom || '');
      formData.append('quantity', editProductData.quantity || '');
      formData.append('quantityUom', editProductData.quantityUom || '');
      formData.append('price', priceValue);
      formData.append('currency', editProductData.currency || 'USD');
      formData.append('priceType', editProductData.priceType || 'EXW');
      formData.append('reLabeling', editProductData.reLabeling || 'no');
      if (relabelingPriceValue !== null) {
        formData.append('relabelingPrice', relabelingPriceValue);
      }
      formData.append('validityDate', editProductData.validityDate || '');
      formData.append('validityTime', editProductData.validityTime || '');
      
      const response = await fetch(`/api/seller/products/${editingProduct.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authToken}`
        },
        body: formData
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        // Update the product in all relevant lists
        const updateProductInList = (list) => 
          list.map(p => p.id === editingProduct.id ? result.product : p);
      
        setApprovedProducts(prev => updateProductInList(prev));
        setSubmittedProducts(prev => updateProductInList(prev));
        setIneffectiveProducts(prev => updateProductInList(prev));
      
        // Reset form and close modal
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
          relabelingPrice: '',
          validityDate: '',
          validityTime: '',
          surveyTermsAccepted: false,
          sellerAgreementAccepted: false,
          relabelingTermsAccepted: false
        });
        setShowEditProductModal(false);
      
        alert('Product updated successfully!');
      } else {
        throw new Error(result.error || 'Failed to update product');
      }
    } catch (error) {
      console.error('Error updating product:', error);
      alert(`Error updating product: ${error.message}`);
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
      resolved: { backgroundColor: '#d4edda', color: '#155724' },
      submitted: { backgroundColor: '#cce5ff', color: '#004085' },
      expired: { backgroundColor: '#f8d7da', color: '#721c24' }
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

  // Product card component
  const ProductCard = ({ product, showActions = true }) => (
    <div 
      className="rounded-lg shadow-sm p-4 mb-4"
      style={{ backgroundColor: "#fff" }}
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-bold" style={{ color: darkText }}>{product.name}</h3>
          <p className="text-sm mt-1" style={{ color: "#7a614a" }}>{product.category}</p>
        </div>
        <StatusBadge status={product.status} />
      </div>
      
      <div className="mt-3 flex justify-between items-center">
        <span className="font-semibold" style={{ color: darkText }}>
          ${product.price} {product.currency}
        </span>
        {showActions && (
          <div className="flex gap-2">
            <button 
              className="p-2 rounded-full"
              style={{ backgroundColor: creamCard }}
            >
              <Eye size={16} style={{ color: darkText }} />
            </button>
            <button 
              className="p-2 rounded-full"
              style={{ backgroundColor: creamCard }}
              onClick={() => openEditProductModal(product)}
            >
              <Edit size={16} style={{ color: darkText }} />
            </button>
            <button 
              className="p-2 rounded-full"
              style={{ backgroundColor: creamCard }}
            >
              <Trash2 size={16} style={{ color: darkText }} />
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <DashboardLayout title="Seller Dashboard" role="seller">
      <div className="mb-6 flex flex-wrap gap-2 border-b" style={{ borderColor: "#d9cfc1" }}>
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
          My Products
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
            activeTab === 'rfqs' ? 'border-b-2' : ''
          }`}
          onClick={() => setActiveTab('rfqs')}
          style={{ 
            color: activeTab === 'rfqs' ? bhagwa : darkText,
            borderColor: activeTab === 'rfqs' ? bhagwa : 'transparent'
          }}
        >
          Awaited Surveys
        </button>
        <button 
          className={`px-4 py-2 rounded-t-lg font-medium relative ${
            activeTab === 'notifications' ? 'border-b-2' : ''
          }`}
          onClick={() => setActiveTab('notifications')}
          style={{ 
            color: activeTab === 'notifications' ? bhagwa : darkText,
            borderColor: activeTab === 'notifications' ? bhagwa : 'transparent'
          }}
        >
          Notifications
          {unreadNotificationsCount > 0 && (
            <span 
              className="absolute -top-1 -right-1 flex items-center justify-center rounded-full text-xs font-bold"
              style={{ 
                backgroundColor: '#e74c3c', 
                color: '#fff',
                width: '18px',
                height: '18px'
              }}
            >
              {unreadNotificationsCount}
            </span>
          )}
        </button>
      </div>

      {loading && <div className="text-center py-10" style={{ color: darkText }}>Loading dashboard data...</div>}
      
      {activeTab === 'products' && (
        <div>
          <div 
            className="rounded-xl shadow-sm p-6 mb-6"
            style={{ backgroundColor: "#fff" }}
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <h2 className="text-2xl font-bold" style={{ color: darkText }}>My Products</h2>
              <button 
                className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold"
                onClick={() => setShowAddProductModal(true)}
                style={{ backgroundColor: bhagwa, color: "#fff" }}
              >
                <Plus size={16} />
                Add New Product
              </button>
            </div>
            
            {/* Approved Products Section */}
            <div className="mb-8">
              <h3 className="text-xl font-bold mb-4" style={{ color: darkText }}>Approved Products</h3>
              {approvedProducts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {approvedProducts.map(product => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-6" style={{ color: darkText }}>
                  No approved products found.
                </div>
              )}
            </div>
            
            {/* Submitted Products Section */}
            <div className="mb-8">
              <h3 className="text-xl font-bold mb-4" style={{ color: darkText }}>Submitted Products</h3>
              {submittedProducts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {submittedProducts.map(product => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-6" style={{ color: darkText }}>
                  No submitted products found.
                </div>
              )}
            </div>
            
            {/* Ineffective Products Section */}
            <div>
              <h3 className="text-xl font-bold mb-4" style={{ color: darkText }}>Ineffective Products</h3>
              {ineffectiveProducts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {ineffectiveProducts.map(product => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-6" style={{ color: darkText }}>
                  No ineffective products found.
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
              <h2 className="text-2xl font-bold" style={{ color: darkText }}>Orders</h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ backgroundColor: creamCard }}>
                    <th className="text-left p-3" style={{ color: darkText }}>Order ID</th>
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
                            Process
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

      {activeTab === 'rfqs' && (
        <div>
          <div 
            className="rounded-xl shadow-sm p-6 mb-6"
            style={{ backgroundColor: "#fff" }}
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <h2 className="text-2xl font-bold" style={{ color: darkText }}>Awaited Surveys</h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ backgroundColor: creamCard }}>
                    <th className="text-left p-3" style={{ color: darkText }}>Survey ID</th>
                    <th className="text-left p-3" style={{ color: darkText }}>Product</th>
                    <th className="text-left p-3" style={{ color: darkText }}>Status</th>
                    <th className="text-left p-3" style={{ color: darkText }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rfqs.map(rfq => (
                    <tr key={rfq.id} className="border-b" style={{ borderColor: "#d9cfc1" }}>
                      <td className="p-3" style={{ color: darkText }}>{rfq.id}</td>
                      <td className="p-3" style={{ color: darkText }}>{rfq.product}</td>
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
                            Complete Survey
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {rfqs.length === 0 && !loading && (
                <div className="text-center py-10" style={{ color: darkText }}>
                  No awaited surveys found.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'notifications' && (
        <div>
          <div 
            className="rounded-xl shadow-sm p-6 mb-6"
            style={{ backgroundColor: "#fff" }}
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <h2 className="text-2xl font-bold" style={{ color: darkText }}>Notifications</h2>
              {unreadNotificationsCount > 0 && (
                <button 
                  className="px-4 py-2 rounded-lg font-semibold text-sm"
                  onClick={markAllNotificationsAsRead}
                  style={{ backgroundColor: bhagwa, color: "#fff" }}
                >
                  Mark all as read
                </button>
              )}
            </div>
            
            <div className="overflow-x-auto">
              {notifications.length > 0 ? (
                <div className="space-y-4">
                  {notifications.map(notification => (
                    <div 
                      key={notification.id}
                      className="p-4 rounded-lg border"
                      style={{ 
                        backgroundColor: notification.is_read ? '#f8f9fa' : '#e3f2fd',
                        borderColor: "#d9cfc1"
                      }}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          {notification.title && (
                            <h3 className="font-bold" style={{ color: darkText }}>
                              {notification.title}
                            </h3>
                          )}
                          <p className="mt-2" style={{ color: darkText }}>
                            {notification.message}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span 
                            className="text-sm whitespace-nowrap"
                            style={{ color: "#7a614a" }}
                          >
                            {new Date(notification.created_at).toLocaleDateString()}
                          </span>
                          {!notification.is_read && (
                            <button 
                              className="px-2 py-1 rounded text-xs"
                              onClick={() => markNotificationAsRead(notification.id)}
                              style={{ backgroundColor: "#2ecc71", color: "#fff" }}
                            >
                              Mark as read
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10" style={{ color: darkText }}>
                  No notifications found.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {showAddProductModal && (
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
                <h3 className="text-xl font-bold" style={{ color: darkText }}>Add New Product</h3>
                <button 
                  className="p-2 rounded-full"
                  onClick={() => setShowAddProductModal(false)}
                  style={{ backgroundColor: creamCard }}
                >
                  <X size={20} style={{ color: darkText }} />
                </button>
              </div>
              <form onSubmit={handleAddProduct}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {/* Product Name */}
                  <div className="md:col-span-2">
                    <label htmlFor="name" className="block mb-2 font-medium" style={{ color: darkText }}>
                      Product Name/Version *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      className="w-full p-3 rounded-lg border"
                      style={{ borderColor: "#d9cfc1", backgroundColor: "#fff", color: darkText }}
                      value={newProduct.name}
                      onChange={handleProductInputChange}
                      required
                    />
                  </div>
                  
                  {/* Category */}
                  <div>
                    <label htmlFor="category" className="block mb-2 font-medium" style={{ color: darkText }}>
                      Product Category *
                    </label>
                    <select
                      id="category"
                      name="category"
                      className="w-full p-3 rounded-lg border"
                      style={{ borderColor: "#d9cfc1", backgroundColor: "#fff", color: darkText }}
                      value={newProduct.category}
                      onChange={handleProductInputChange}
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
                          checked={newProduct.branded === 'branded'}
                          onChange={handleProductInputChange}
                          className="mr-2"
                        />
                        <span style={{ color: darkText }}>Branded</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="branded"
                          value="unbranded"
                          checked={newProduct.branded === 'unbranded'}
                          onChange={handleProductInputChange}
                          className="mr-2"
                        />
                        <span style={{ color: darkText }}>Unbranded</span>
                      </label>
                    </div>
                  </div>
                  
                  {/* MOQ and UOM */}
                  <div>
                    <label htmlFor="moq" className="block mb-2 font-medium" style={{ color: darkText }}>
                      MOQ
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        id="moq"
                        name="moq"
                        className="w-full p-3 rounded-lg border"
                        style={{ borderColor: "#d9cfc1", backgroundColor: "#fff", color: darkText }}
                        value={newProduct.moq}
                        onChange={handleProductInputChange}
                        min="0"
                      />
                      <select
                        name="moqUom"
                        className="p-3 rounded-lg border"
                        style={{ borderColor: "#d9cfc1", backgroundColor: "#fff", color: darkText }}
                        value={newProduct.moqUom}
                        onChange={handleProductInputChange}
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
                    <label htmlFor="quantity" className="block mb-2 font-medium" style={{ color: darkText }}>
                      Available Quantity
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        id="quantity"
                        name="quantity"
                        className="w-full p-3 rounded-lg border"
                        style={{ borderColor: "#d9cfc1", backgroundColor: "#fff", color: darkText }}
                        value={newProduct.quantity}
                        onChange={handleProductInputChange}
                        min="0"
                      />
                      <select
                        name="quantityUom"
                        className="p-3 rounded-lg border"
                        style={{ borderColor: "#d9cfc1", backgroundColor: "#fff", color: darkText }}
                        value={newProduct.quantityUom}
                        onChange={handleProductInputChange}
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
                    <label htmlFor="price" className="block mb-2 font-medium" style={{ color: darkText }}>
                      Offer Price *
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        id="price"
                        name="price"
                        className="w-full p-3 rounded-lg border"
                        style={{ borderColor: "#d9cfc1", backgroundColor: "#fff", color: darkText }}
                        value={newProduct.price}
                        onChange={handleProductInputChange}
                        required
                        min="0"
                        step="0.01"
                      />
                      <select
                        name="currency"
                        className="p-3 rounded-lg border"
                        style={{ borderColor: "#d9cfc1", backgroundColor: "#fff", color: darkText }}
                        value={newProduct.currency}
                        onChange={handleProductInputChange}
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
                    <label htmlFor="priceType" className="block mb-2 font-medium" style={{ color: darkText }}>
                      Price Type
                    </label>
                    <select
                      id="priceType"
                      name="priceType"
                      className="w-full p-3 rounded-lg border"
                      style={{ borderColor: "#d9cfc1", backgroundColor: "#fff", color: darkText }}
                      value={newProduct.priceType}
                      onChange={handleProductInputChange}
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
                          checked={newProduct.reLabeling === 'yes'}
                          onChange={handleProductInputChange}
                          className="mr-2"
                        />
                        <span style={{ color: darkText }}>Yes</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="reLabeling"
                          value="no"
                          checked={newProduct.reLabeling === 'no'}
                          onChange={handleProductInputChange}
                          className="mr-2"
                        />
                        <span style={{ color: darkText }}>No</span>
                      </label>
                    </div>
                  </div>

                  {/* Re-labeling Price - Only show when re-labeling is enabled */}
                  {newProduct.reLabeling === 'yes' && (
                    <div>
                      <label htmlFor="relabelingPrice" className="block mb-2 font-medium" style={{ color: darkText }}>
                        Re-labeling Price
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          id="relabelingPrice"
                          name="relabelingPrice"
                          className="w-full p-3 rounded-lg border"
                          style={{ borderColor: "#d9cfc1", backgroundColor: "#fff", color: darkText }}
                          value={newProduct.relabelingPrice}
                          onChange={handleProductInputChange}
                          min="0"
                          step="0.01"
                          placeholder="Enter re-labeling price"
                        />
                        <select
                          name="currency"
                          className="p-3 rounded-lg border"
                          style={{ borderColor: "#d9cfc1", backgroundColor: "#fff", color: darkText }}
                          value={newProduct.currency}
                          onChange={handleProductInputChange}
                        >
                          <option value="USD">USD</option>
                          <option value="EUR">EUR</option>
                          <option value="GBP">GBP</option>
                          <option value="INR">INR</option>
                        </select>
                      </div>
                    </div>
                  )}

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
                        value={newProduct.validityDate}
                        onChange={handleProductInputChange}
                      />
                      <input
                        type="time"
                        name="validityTime"
                        className="w-full p-3 rounded-lg border"
                        style={{ borderColor: "#d9cfc1", backgroundColor: "#fff", color: darkText }}
                        value={newProduct.validityTime}
                        onChange={handleProductInputChange}
                      />
                    </div>
                  </div>
                </div>
                
                {/* Description */}
                <div className="mb-4">
                  <label htmlFor="description" className="block mb-2 font-medium" style={{ color: darkText }}>
                    Description *
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    className="w-full p-3 rounded-lg border"
                    style={{ borderColor: "#d9cfc1", backgroundColor: "#fff", color: darkText }}
                    value={newProduct.description}
                    onChange={handleProductInputChange}
                    rows="4"
                    required
                  ></textarea>
                  <p className="text-sm mt-1" style={{ color: "#7a614a" }}>
                    * No contact details allowed in description
                  </p>
                </div>
                
                
                {/* Terms and Conditions */}
                <div className="mb-4">
                  <label className="flex items-start mb-2">
                    <input
                      type="checkbox"
                      name="surveyTermsAccepted"
                      checked={newProduct.surveyTermsAccepted}
                      onChange={handleProductInputChange}
                      className="mt-1 mr-2"
                      required
                    />
                    <span style={{ color: darkText }}>
                      I accept the Survey Terms & Conditions *
                    </span>
                  </label>
                  
                  <label className="flex items-start mb-2">
                    <input
                      type="checkbox"
                      name="sellerAgreementAccepted"
                      checked={newProduct.sellerAgreementAccepted}
                      onChange={handleProductInputChange}
                      className="mt-1 mr-2"
                      required
                    />
                    <span style={{ color: darkText }}>
                      I accept the Seller Agreement *
                    </span>
                  </label>
                  
                  {newProduct.reLabeling === 'yes' && (
                    <label className="flex items-start">
                      <input
                        type="checkbox"
                        name="relabelingTermsAccepted"
                        checked={newProduct.relabelingTermsAccepted}
                        onChange={handleProductInputChange}
                        className="mt-1 mr-2"
                        required={newProduct.reLabeling === 'yes'}
                      />
                      <span style={{ color: darkText }}>
                        I accept the Re-labeling Terms & Conditions *
                      </span>
                    </label>
                  )}
                </div>
                
                <div className="flex justify-end gap-3">
                  <button 
                    type="button" 
                    className="px-4 py-2 rounded-lg font-medium"
                    onClick={() => setShowAddProductModal(false)}
                    style={{ backgroundColor: "#fff", color: darkText, border: "1px solid #d9cfc1" }}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="px-4 py-2 rounded-lg font-medium"
                    style={{ backgroundColor: bhagwa, color: "#fff" }}
                  >
                    Submit for Approval
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
                  
                  {/* Re-labeling Price - Only show when re-labeling is enabled */}
                  {editProductData.reLabeling === 'yes' && (
                    <div>
                      <label htmlFor="edit-relabelingPrice" className="block mb-2 font-medium" style={{ color: darkText }}>
                        Re-labeling Price
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          id="edit-relabelingPrice"
                          name="relabelingPrice"
                          className="w-full p-3 rounded-lg border"
                          style={{ borderColor: "#d9cfc1", backgroundColor: "#fff", color: darkText }}
                          value={editProductData.relabelingPrice}
                          onChange={handleEditProductInputChange}
                          min="0"
                          step="0.01"
                          placeholder="Enter re-labeling price"
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
                  )}

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
                
                
                {/* Terms and Conditions */}
                <div className="mb-4">
                  <label className="flex items-start mb-2">
                    <input
                      type="checkbox"
                      name="surveyTermsAccepted"
                      checked={editProductData.surveyTermsAccepted}
                      onChange={handleEditProductInputChange}
                      className="mt-1 mr-2"
                      required
                    />
                    <span style={{ color: darkText }}>
                      I accept the Survey Terms & Conditions *
                    </span>
                  </label>
                  
                  <label className="flex items-start mb-2">
                    <input
                      type="checkbox"
                      name="sellerAgreementAccepted"
                      checked={editProductData.sellerAgreementAccepted}
                      onChange={handleEditProductInputChange}
                      className="mt-1 mr-2"
                      required
                    />
                    <span style={{ color: darkText }}>
                      I accept the Seller Agreement *
                    </span>
                  </label>
                  
                  {editProductData.reLabeling === 'yes' && (
                    <label className="flex items-start">
                      <input
                        type="checkbox"
                        name="relabelingTermsAccepted"
                        checked={editProductData.relabelingTermsAccepted}
                        onChange={handleEditProductInputChange}
                        className="mt-1 mr-2"
                        required={editProductData.reLabeling === 'yes'}
                      />
                      <span style={{ color: darkText }}>
                        I accept the Re-labeling Terms & Conditions *
                      </span>
                    </label>
                  )}
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
    </DashboardLayout>
  );
};

export default SellerDashboard;