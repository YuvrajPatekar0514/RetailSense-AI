import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';

import AdminLayout from './layouts/AdminLayout';
import RetailerLayout from './layouts/RetailerLayout';
import CustomerLayout from './layouts/CustomerLayout';

function HomeRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;

  if (user.role === 'admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  if (
    user.role === 'retailer' ||
    user.role === 'retail_manager' ||
    user.role === 'seller' ||
    user.role === 'inventory_manager' ||
    user.role === 'procurement_manager' ||
    user.role === 'analyst'
  ) {
    return <Navigate to="/retailer/dashboard" replace />;
  }

  return <Navigate to="/customer/dashboard" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Login Route */}
          <Route path="/login" element={<LoginPage />} />

          {/* Root Path Auto-Redirect */}
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <HomeRedirect />
              </ProtectedRoute>
            } 
          />

          {/* Admin Dashboard Routes */}
          <Route 
            path="/admin/*" 
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            } 
          />

          {/* Retailer Dashboard Routes */}
          <Route 
            path="/retailer/*" 
            element={
              <ProtectedRoute>
                <RetailerLayout />
              </ProtectedRoute>
            } 
          />

          {/* Customer Dashboard Routes */}
          <Route 
            path="/customer/*" 
            element={
              <ProtectedRoute>
                <CustomerLayout />
              </ProtectedRoute>
            } 
          />

          {/* Catch-all Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
