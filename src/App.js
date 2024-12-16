import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Topbar from './components/Topbar'; 
import Sidebar from './components/Sidebar';
import Login from './components/Login';
import ForgotPassword from './components/ForgotPassword'; 
import ResetPassword from './components/ResetPassword'; 
import Dashboard from './components/Dashboard';
import Category from './components/Category';
import Inventory from './components/Inventory';
import Product from './components/Product';
import Supplier from './components/Supplier';
import Sales from './components/Sales';
import PointofSales from './components/PointofSales';
import Orders from './components/Orders';
import Services from './components/Services';
import UserManagement from './components/UserManagement';
import UserProfile from './components/UserProfile';
import ListClients from './components/ListClients';
import LogHistory from './components/LogHistory';

function App() {
  // Manage the authentication state in App.js
  const [isAuthenticated, setIsAuthenticated] = useState(localStorage.getItem("userID") !== null);

  // Handle login function, which updates the authentication state
  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  return (
    <div className="App">
      <BrowserRouter>
        {/* Routes for authenticated users */}
        {isAuthenticated ? (
          <>
            <Sidebar />
            <div className="content">
              <div className="content-container">
                <Topbar />
              </div>
              <Routes>
                <Route path="information/clients" element={<ListClients />} />
                <Route path="home" element={<Dashboard />} />
                <Route path="category" element={<Category />} />
                <Route path="inventory" element={<Inventory />} />
                <Route path="products" element={<Product />} />
                <Route path="suppliers" element={<Supplier />} />
                <Route path="sales" element={<Sales />} />
                <Route path="pointofsales" element={<PointofSales />} />
                <Route path="orders" element={<Orders />} />
                <Route path="services" element={<Services />} />
                <Route path="profile" element={<UserProfile />} />
                <Route path="usermanagement" element={<UserManagement />} />
                <Route path="history" element={<LogHistory />} />
              </Routes>
            </div>
          </>
        ) : (
          // Routes for unauthenticated users
          <Routes>
            <Route path="login" element={<Login onLogin={handleLogin} />} /> {/* Pass handleLogin function */}
            <Route path="forgot-password" element={<ForgotPassword />} />
            <Route path="reset_password" element={<ResetPassword />} />  {/* Reset Password should be accessible without login */}
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        )}
      </BrowserRouter>
    </div>
  );
}

export default App;
