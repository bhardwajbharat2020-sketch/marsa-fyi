import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { X } from 'lucide-react';

const ChangePasswordModal = ({ isOpen, onClose, onPasswordChanged }) => {
  const { authToken, isTokenValid, refreshToken } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Theme colors to match homepage
  const bhagwa = "#f77f00";
  const cream = "#f6efe6";
  const creamCard = "#efe6d9";
  const darkText = "#5a4632";

  const validatePassword = (password) => {
    const errors = [];
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }
    
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one digit');
    }
    
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Reset state
    setError('');
    setSuccess(false);
    
    // Validate passwords
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('All fields are required');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    
    const passwordErrors = validatePassword(newPassword);
    if (passwordErrors.length > 0) {
      setError(passwordErrors.join(', '));
      return;
    }
    
    // Check if token is valid
    if (!isTokenValid()) {
      setError('Your session has expired. Please log in again.');
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          currentPassword,
          newPassword
        })
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        setSuccess(true);
        // Clear form
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        
        // Notify parent component
        if (onPasswordChanged) {
          setTimeout(() => {
            onPasswordChanged();
          }, 1500);
        }
      } else {
        // Handle token expiration specifically
        if (response.status === 403 && data.error.includes('expired')) {
          setError('Your session has expired. Please log in again.');
          setTimeout(() => {
            window.location.href = '/login';
          }, 2000);
        } else {
          setError(data.error || 'Failed to change password. Please try again.');
        }
      }
    } catch (err) {
      setError('Failed to change password. Please try again.');
      console.error('Change password error:', err);
    }
    
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4" style={{ backgroundColor: cream }}>
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold" style={{ color: darkText }}>Change Password</h2>
            <button 
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100"
            >
              <X size={24} style={{ color: darkText }} />
            </button>
          </div>
          
          {success ? (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
              Password has been changed successfully!
            </div>
          ) : (
            <>
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                  {error}
                </div>
              )}
              
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-lg font-semibold mb-2" style={{ color: darkText }}>
                    Current Password
                  </label>
                  <input
                    type="password"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter your current password"
                    style={{ backgroundColor: "#fff", color: darkText }}
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-lg font-semibold mb-2" style={{ color: darkText }}>
                    New Password
                  </label>
                  <input
                    type="password"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter your new password"
                    style={{ backgroundColor: "#fff", color: darkText }}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Password must be at least 8 characters with uppercase, number, and special character.
                  </p>
                </div>
                
                <div className="mb-6">
                  <label className="block text-lg font-semibold mb-2" style={{ color: darkText }}>
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your new password"
                    style={{ backgroundColor: "#fff", color: darkText }}
                  />
                </div>
                
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-6 py-3 rounded-full font-bold border"
                    style={{ borderColor: darkText, color: darkText }}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 rounded-full font-bold"
                    style={{ backgroundColor: bhagwa, color: "#fff" }}
                    disabled={loading}
                  >
                    {loading ? 'Changing...' : 'Change Password'}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordModal;