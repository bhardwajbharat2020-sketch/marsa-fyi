import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Search, ChevronRight, Star, Heart, CheckCircle, Ship, ShieldCheck, Globe, User, MapPin, Plus, X } from 'lucide-react';
import DashboardLayout from './DashboardLayout';
import RFQForm from './RFQForm';
import '../App.css';

const BuyerDashboard = () => {
  const { currentUser, logout, authToken } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('rfqs');
  const [rfqs, setRfqs] = useState([]);
  const [orders, setOrders] = useState([]);
  const [notifications, setNotifications] = useState([]); // New state for notifications
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0); // New state for unread notifications count
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateRFQModal, setShowCreateRFQModal] = useState(false);
  const [showEditRFQModal, setShowEditRFQModal] = useState(false);
  const [editingRFQ, setEditingRFQ] = useState(null);
  
  // State for RFQ details modal
  const [showRFQDetailsModal, setShowRFQDetailsModal] = useState(false);
  const [selectedRFQDetails, setSelectedRFQDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // small helper for theme colors in inline style
  const bhagwa = "#f77f00";
  const cream = "#f6efe6";
  const creamCard = "#efe6d9";
  const darkText = "#5a4632";

  const fetchRFQs = async () => {
    try {
      const rfqsResponse = await fetch('/api/buyer/rfqs', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      const rfqsData = await rfqsResponse.json();
      if (rfqsResponse.ok) {
        setRfqs(rfqsData);
      } else {
        console.error('Failed to fetch RFQs:', rfqsData.error);
      }
    } catch (err) {
      console.error('Error fetching RFQs:', err);
    }
  };

  // Function to fetch notifications
  const fetchNotifications = async () => {
    try {
      const notificationsResponse = await fetch('/api/buyer/notifications', {
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
        console.error('Failed to fetch notifications:', notificationsData.error);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  // Function to fetch RFQ details including captain's response
  const fetchRFQDetails = async (rfqId) => {
    try {
      setLoadingDetails(true);
      
      // Fetch RFQ details
      const rfqResponse = await fetch(`/api/buyer/rfqs/${rfqId}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      const rfqData = await rfqResponse.json();
      
      if (rfqResponse.ok) {
        setSelectedRFQDetails(rfqData);
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
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(''); // Clear any previous errors
        
        // Fetch buyer's RFQs
        await fetchRFQs();
        
        // Fetch buyer's orders
        const ordersResponse = await fetch('/api/buyer/orders', {
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        });
        const ordersData = await ordersResponse.json();
        if (ordersResponse.ok) {
          setOrders(ordersData);
        } else {
          console.error('Failed to fetch orders:', ordersData.error);
          // Don't set error here, just log it
        }
        
        // Fetch buyer's notifications
        await fetchNotifications();
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (authToken) {
      fetchData();
    }
  }, [authToken]);

  // Fetch notifications when notifications tab is activated
  useEffect(() => {
    const fetchNotificationsWhenActive = async () => {
      if (activeTab === 'notifications' && authToken) {
        try {
          const notificationsResponse = await fetch('/api/buyer/notifications', {
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
            console.error('Failed to fetch notifications:', notificationsData.error);
          }
        } catch (err) {
          console.error('Error fetching notifications:', err);
        }
      }
    };

    fetchNotificationsWhenActive();
  }, [activeTab, authToken]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      case 'fulfilled': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-indigo-100 text-indigo-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'resubmitted': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const StatusBadge = ({ status }) => {
    const colorClass = getStatusColor(status);
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colorClass}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  // Mark notification as read
  const markNotificationAsRead = async (notificationId) => {
    try {
      const response = await fetch(`/api/buyer/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        // Update the notification in state
        setNotifications(prevNotifications => 
          prevNotifications.map(notification => 
            notification.id === notificationId 
              ? { ...notification, is_read: true } 
              : notification
          )
        );
        
        // Update unread count
        setUnreadNotificationsCount(prevCount => prevCount - 1);
      } else {
        console.error('Failed to mark notification as read:', result.error);
      }
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  // Mark all notifications as read
  const markAllNotificationsAsRead = async () => {
    try {
      const response = await fetch('/api/buyer/notifications/read-all', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        // Update all notifications in state as read
        setNotifications(prevNotifications => 
          prevNotifications.map(notification => ({ ...notification, is_read: true }))
        );
        
        // Reset unread count
        setUnreadNotificationsCount(0);
      } else {
        console.error('Failed to mark all notifications as read:', result.error);
      }
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  };

  // Define which statuses should be shown in the "Need Action" section
  const isNeedActionStatus = (status) => {
    const needActionStatuses = ['negotiation_requested', 'doq_provided', 'responded', 'accepted', 'rejected'];
    return needActionStatuses.includes(status?.toLowerCase());
  };

  // Define which statuses should be shown in the main RFQs section (as "open")
  const isOpenStatus = (status) => {
    const openStatuses = ['open', 'resubmitted'];
    return openStatuses.includes(status?.toLowerCase());
  };

  return (
    <DashboardLayout title="Buyer Dashboard" role="buyer">
      <div className="mb-6 flex flex-wrap gap-2 border-b" style={{ borderColor: "#d9cfc1" }}>
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
          My RFQs
        </button>
        <button 
          className={`px-4 py-2 rounded-t-lg font-medium ${
            activeTab === 'draft-quotations' ? 'border-b-2' : ''
          }`}
          onClick={() => setActiveTab('draft-quotations')}
          style={{ 
            color: activeTab === 'draft-quotations' ? bhagwa : darkText,
            borderColor: activeTab === 'draft-quotations' ? bhagwa : 'transparent'
          }}
        >
          Draft Quotations
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
          My Orders
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
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {unreadNotificationsCount}
            </span>
          )}
        </button>
      </div>

      {loading && <div className="text-center py-10" style={{ color: darkText }}>Loading dashboard data...</div>}
      {error && <div className="text-center py-10 text-red-500">Error: {error}</div>}
      
      {activeTab === 'rfqs' && (
        <div>
          <div 
            className="rounded-xl shadow-sm p-6 mb-6"
            style={{ backgroundColor: "#fff" }}
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <h2 className="text-2xl font-bold" style={{ color: darkText }}>My RFQs</h2>
              <button 
                className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold"
                onClick={() => setShowCreateRFQModal(true)}
                style={{ backgroundColor: bhagwa, color: "#fff" }}
              >
                <Plus size={16} />
                Create New RFQ
              </button>
            </div>
            
            {/* Need Action Section - for all RFQs with status other than "open" */}
            {rfqs.filter(rfq => isNeedActionStatus(rfq.status)).length > 0 && (
              <div className="mb-6">
                <h3 className="text-xl font-bold mb-4" style={{ color: darkText }}>Need Action</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr style={{ backgroundColor: creamCard }}>
                        <th className="text-left p-3" style={{ color: darkText }}>RFQ ID</th>
                        <th className="text-left p-3" style={{ color: darkText }}>Product</th>
                        <th className="text-left p-3" style={{ color: darkText }}>Quantity</th>
                        <th className="text-left p-3" style={{ color: darkText }}>Status</th>
                        <th className="text-left p-3" style={{ color: darkText }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rfqs
                        .filter(rfq => isNeedActionStatus(rfq.status))
                        .map(rfq => (
                        <tr key={rfq.id} className="border-b" style={{ borderColor: "#d9cfc1" }}>
                          <td className="p-3" style={{ color: darkText }}>{rfq.id}</td>
                          <td className="p-3" style={{ color: darkText }}>{rfq.title}</td>
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
                                View Details
                              </button>
                              <button 
                                className="px-3 py-1 rounded text-sm"
                                style={{ backgroundColor: bhagwa, color: "#fff" }}
                                onClick={() => {
                                  setEditingRFQ(rfq);
                                  setShowEditRFQModal(true);
                                }}
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
            
            {/* All RFQs Section - only "open" and "resubmitted" RFQs */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ backgroundColor: creamCard }}>
                    <th className="text-left p-3" style={{ color: darkText }}>RFQ ID</th>
                    <th className="text-left p-3" style={{ color: darkText }}>Product</th>
                    <th className="text-left p-3" style={{ color: darkText }}>Quantity</th>
                    <th className="text-left p-3" style={{ color: darkText }}>Status</th>
                    <th className="text-left p-3" style={{ color: darkText }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rfqs
                    .filter(rfq => isOpenStatus(rfq.status))
                    .length > 0 ? 
                    rfqs
                      .filter(rfq => isOpenStatus(rfq.status))
                      .map(rfq => (
                      <tr key={rfq.id} className="border-b" style={{ borderColor: "#d9cfc1" }}>
                        <td className="p-3" style={{ color: darkText }}>{rfq.id}</td>
                        <td className="p-3" style={{ color: darkText }}>{rfq.title}</td>
                        <td className="p-3" style={{ color: darkText }}>{rfq.quantity}</td>
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
                              onClick={() => {
                                setEditingRFQ(rfq);
                                setShowEditRFQModal(true);
                              }}
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
                      <td colSpan="5" className="text-center py-10" style={{ color: darkText }}>
                        No open RFQs found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              
              {rfqs.length === 0 && !loading && (
                <div className="text-center py-10" style={{ color: darkText }}>
                  No RFQs found. Create your first RFQ to get started.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'draft-quotations' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold" style={{ color: darkText }}>Draft Quotations</h2>
            <button 
              className="px-4 py-2 rounded-lg font-semibold flex items-center gap-2"
              style={{ backgroundColor: bhagwa, color: "#fff" }}
              onClick={() => navigate('/draft-quotations')}
            >
              <span>View All Draft Quotations</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Placeholder for draft quotations preview */}
            <div className="col-span-full text-center py-10" style={{ color: darkText }}>
              <p>You don't have any draft quotations yet.</p>
              <p className="mt-2 text-sm" style={{ color: "#7a614a" }}>
                When captains accept your RFQs, draft quotations will appear here.
              </p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'orders' && (
        <div>
          {/* Orders content */}
          <div className="text-center py-10" style={{ color: darkText }}>
            Orders section coming soon...
          </div>
        </div>
      )}

      {activeTab === 'notifications' && (
        <div>
          <div 
            className="rounded-xl shadow-sm p-6 mb-6"
            style={{ backgroundColor: "#fff" }}
          >
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
              <h2 className="text-2xl font-bold text-center" style={{ color: darkText, margin: '0 auto' }}>Notifications</h2>
              {unreadNotificationsCount > 0 && (
                <button 
                  className="px-4 py-2 rounded-lg font-semibold"
                  onClick={markAllNotificationsAsRead}
                  style={{ backgroundColor: bhagwa, color: "#fff" }}
                >
                  Mark All as Read
                </button>
              )}
            </div>
            
            <div className="space-y-4">
              {notifications.length > 0 ? notifications.map(notification => (
                <div 
                  key={notification.id} 
                  className="p-4 rounded-lg border"
                  style={{ 
                    backgroundColor: notification.is_read ? "#fff" : "#fff8e6",
                    borderColor: "#d9cfc1"
                  }}
                >
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
                    <div className="flex items-center gap-3 w-full">
                      <div>
                        {notification.is_read ? (
                          <CheckCircle size={20} style={{ color: "#4ade80" }} />
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-orange-500"></div>
                        )}
                      </div>
                      <div className="flex-1 text-center sm:text-left">
                        <h3 className="font-bold text-center sm:text-left" style={{ color: darkText }}>
                          {notification.title}
                        </h3>
                        <p className="mt-1 text-sm text-center sm:text-left" style={{ color: darkText }}>
                          {notification.message}
                        </p>
                        <p className="text-xs mt-2 text-center" style={{ color: "#7a614a" }}>
                          {new Date(notification.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    {!notification.is_read && (
                      <button 
                        className="px-3 py-1 rounded text-sm whitespace-nowrap"
                        onClick={() => markNotificationAsRead(notification.id)}
                        style={{ backgroundColor: bhagwa, color: "#fff" }}
                      >
                        Mark as Read
                      </button>
                    )}
                  </div>
                </div>
              )) : (
                <div className="text-center py-10" style={{ color: darkText }}>
                  No notifications found.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showCreateRFQModal && (
        <RFQForm 
          onClose={() => setShowCreateRFQModal(false)}
          onSuccess={(rfq) => {
            setShowCreateRFQModal(false);
            // Refresh RFQs list
            fetchRFQs();
            alert('RFQ submitted successfully!');
          }}
          isResponseForm={false}
        />
      )}
      
      {showEditRFQModal && editingRFQ && (
        <RFQForm 
          product={{ id: editingRFQ.product_id, name: editingRFQ.title }}
          initialData={editingRFQ}
          onClose={() => {
            setShowEditRFQModal(false);
            setEditingRFQ(null);
          }}
          onSuccess={(updatedRFQ) => {
            setShowEditRFQModal(false);
            setEditingRFQ(null);
            // Refresh RFQs list
            fetchRFQs();
            alert('RFQ updated successfully!');
          }}
          isResponseForm={true}
        />
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
                      Your RFQ Details
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
                  
                  {/* Product Details section removed for buyer privacy - only captains can see product details */}
                  
                  {/* All Messages/Notifications */}
                  {selectedRFQDetails.notifications && selectedRFQDetails.notifications.length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-lg font-bold mb-3" style={{ color: darkText, borderBottom: `1px solid ${creamCard}`, paddingBottom: '8px' }}>
                        All Messages
                      </h4>
                      <div className="space-y-4">
                        {selectedRFQDetails.notifications.map(notification => (
                          <div 
                            key={notification.id} 
                            className="p-4 rounded-lg border"
                            style={{ 
                              backgroundColor: "#fff",
                              borderColor: "#d9cfc1"
                            }}
                          >
                            <h5 className="font-bold" style={{ color: darkText }}>
                              {notification.title}
                            </h5>
                            <p className="mt-2" style={{ color: darkText }}>
                              {notification.message}
                            </p>
                            <p className="text-sm mt-2" style={{ color: "#7a614a" }}>
                              {new Date(notification.created_at).toLocaleString()}
                            </p>
                          </div>
                        ))}
                      </div>
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

export default BuyerDashboard;