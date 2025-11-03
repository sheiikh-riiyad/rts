// components/ProtectedRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children }) {
  const isAuthenticated = localStorage.getItem('adminLoggedIn') === 'true';
  
  return isAuthenticated ? children : <Navigate to="/admin/login" replace />;
}

export default ProtectedRoute;