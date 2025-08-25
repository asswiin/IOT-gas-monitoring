// src/components/ProtectedRoute.js

import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
  const isAuthenticated = localStorage.getItem('isLoggedIn');

  // If authenticated, render the child components (the Outlet).
  // Otherwise, redirect to the /login page.
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
};

export default ProtectedRoute;