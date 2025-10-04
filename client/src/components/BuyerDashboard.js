import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const BuyerDashboard = () => {
  const { currentUser, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-blue-600 text-white p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">MARSa FYI - Buyer Dashboard</h1>
        <div className="flex items-center space-x-4">
          <span>Welcome, {currentUser?.first_name} {currentUser?.last_name} ({currentUser?.vendorCode})</span>
          <button 
            onClick={logout}
            className="bg-white text-blue-600 px-4 py-2 rounded-md hover:bg-gray-100"
          >
            Logout
          </button>
        </div>
      </nav>
      
      <div className="p-8">
        <h2 className="text-2xl font-bold mb-6">Buyer Dashboard</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-2">RFQs</h3>
            <p className="text-gray-600">Create and manage your requests for quotations</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-2">Orders</h3>
            <p className="text-gray-600">Track your orders and delivery status</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-2">Suppliers</h3>
            <p className="text-gray-600">Manage your supplier relationships</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuyerDashboard;
