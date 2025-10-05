import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import MainDashboard from './components/MainDashboard';
import ShopPage from './components/ShopPage';
import AboutPage from './components/AboutPage';
import ContactPage from './components/ContactPage';
import ProductDetailPage from './components/ProductDetailPage';
import Login from './components/Login';
import Register from './components/Register';
import SellerDashboard from './components/SellerDashboard';
import BuyerDashboard from './components/BuyerDashboard';
import CaptainDashboard from './components/CaptainDashboard';
import AdminDashboard from './components/AdminDashboard';
import HrDashboard from './components/HrDashboard';
import AccountantDashboard from './components/AccountantDashboard';
import ArbitratorDashboard from './components/ArbitratorDashboard';
import SurveyorDashboard from './components/SurveyorDashboard';
import InsuranceAgentDashboard from './components/InsuranceAgentDashboard';
import TransporterDashboard from './components/TransporterDashboard';
import LogisticsDashboard from './components/LogisticsDashboard';
import CHADashboard from './components/CHADashboard';
import CategoriesPage from './components/CategoriesPage';
import RoleSwitcher from './components/RoleSwitcher';
import RoleDashboard from './components/RoleDashboard';
import AccessDenied from './components/AccessDenied';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="App">
          <Routes>
            <Route path="/" element={<MainDashboard />} />
            <Route path="/shop" element={<ShopPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/product/:productId" element={<ProductDetailPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/dashboard" element={<RoleDashboard />} />
            <Route path="/role-switch" element={<RoleSwitcher />} />
            <Route path="/access-denied" element={<AccessDenied />} />
            
            {/* Protected Dashboard Routes */}
            <Route 
              path="/dashboard/seller" 
              element={
                <ProtectedRoute allowedRoles={['seller']}>
                  <SellerDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/buyer" 
              element={
                <ProtectedRoute allowedRoles={['buyer']}>
                  <BuyerDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/captain" 
              element={
                <ProtectedRoute allowedRoles={['captain']}>
                  <CaptainDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/admin" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/hr" 
              element={
                <ProtectedRoute allowedRoles={['hr']}>
                  <HrDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/accountant" 
              element={
                <ProtectedRoute allowedRoles={['accountant']}>
                  <AccountantDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/arbitrator" 
              element={
                <ProtectedRoute allowedRoles={['arbitrator']}>
                  <ArbitratorDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/surveyor" 
              element={
                <ProtectedRoute allowedRoles={['surveyor']}>
                  <SurveyorDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/insurance" 
              element={
                <ProtectedRoute allowedRoles={['insurance']}>
                  <InsuranceAgentDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/transporter" 
              element={
                <ProtectedRoute allowedRoles={['transporter']}>
                  <TransporterDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/logistics" 
              element={
                <ProtectedRoute allowedRoles={['logistics']}>
                  <LogisticsDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/cha" 
              element={
                <ProtectedRoute allowedRoles={['cha']}>
                  <CHADashboard />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;