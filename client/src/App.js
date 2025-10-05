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
            <Route path="/dashboard/seller" element={<SellerDashboard />} />
            <Route path="/dashboard/buyer" element={<BuyerDashboard />} />
            <Route path="/dashboard/captain" element={<CaptainDashboard />} />
            <Route path="/dashboard/admin" element={<AdminDashboard />} />
            <Route path="/dashboard/hr" element={<HrDashboard />} />
            <Route path="/dashboard/accountant" element={<AccountantDashboard />} />
            <Route path="/dashboard/arbitrator" element={<ArbitratorDashboard />} />
            <Route path="/dashboard/surveyor" element={<SurveyorDashboard />} />
            <Route path="/dashboard/insurance" element={<InsuranceAgentDashboard />} />
            <Route path="/dashboard/transporter" element={<TransporterDashboard />} />
            <Route path="/dashboard/logistics" element={<LogisticsDashboard />} />
            <Route path="/dashboard/cha" element={<CHADashboard />} />
            <Route path="/role-switch" element={<RoleSwitcher />} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;