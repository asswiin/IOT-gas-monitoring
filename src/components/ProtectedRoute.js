import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
  // Check if the 'isLoggedIn' flag is set to 'true' in localStorage
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

  // If the user is logged in, render the child component (e.g., UserDashboard).
  // Otherwise, redirect them to the login page.
  return isLoggedIn ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;